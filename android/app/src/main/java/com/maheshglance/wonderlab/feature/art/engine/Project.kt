package com.maheshglance.wonderlab.feature.art.engine

import com.maheshglance.wonderlab.core.engine.AppJson
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.longOrNull
import kotlin.math.abs
import kotlin.math.roundToInt
import kotlin.math.roundToLong

/*
 * Editable art project — a native port of the website's engine/project.ts, reading and writing the
 * SAME JSON (format v1) so the web and the app open each other's pictures:
 *   { v, w, h, paper, layers: [{ id, name, visible, locked, order, kind, template?, ops, base?, snap? }],
 *     active, history: { undo, redo }, palettes, recent, meta, ui }
 *   op = { t: 'stroke', id, brush, color, size, opacity, seed, pts: [[x, y, pressure, tilt], …] }
 *      | { t: 'fill', id, x, y, color, tol } | { t: 'clear', id }
 */

class Op(
    val t: String, val id: String,
    val brush: String = "marker", val color: String = "#000000", val size: Float = 10f, val opacity: Float = 1f, val seed: Long = 0,
    val pts: ArrayList<FloatArray> = ArrayList(),
    val x: Float = 0f, val y: Float = 0f, val tol: Int = 40,
)

data class TemplateRef(val kind: String, val id: String)
data class Snap(val n: Int, val opId: String, val url: String)

class Layer(
    val id: String, var name: String, var visible: Boolean, var locked: Boolean, val kind: String,
    val template: TemplateRef? = null, var ops: ArrayList<Op> = ArrayList(), var base: String? = null, var snap: Snap? = null,
)

data class LayerProps(val name: String? = null, val visible: Boolean? = null, val locked: Boolean? = null)

sealed class Action {
    class OpA(val layer: String, val opId: String, var op: Op? = null) : Action()
    class AddLayer(val id: String, val index: Int, var layer: Layer? = null) : Action()
    class DelLayer(val id: String, val index: Int, var layer: Layer? = null) : Action()
    class Props(val id: String, val before: LayerProps, val after: LayerProps) : Action()
    class Move(val id: String, val from: Int, val to: Int) : Action()
}

data class Palette(val id: String, val name: String, val colors: List<String>)
data class ToolState(val brush: String, val color: String, val size: Float, val opacity: Float)
data class Meta(val kind: String, val pageId: String? = null)
data class Change(val layers: List<String>, val structure: Boolean)

class Project(
    var w: Int, var h: Int, var paper: String,
    val layers: ArrayList<Layer>, var active: String,
    val undo: ArrayList<Action> = ArrayList(), val redo: ArrayList<Action> = ArrayList(),
    var palettes: List<Palette> = emptyList(), var recent: List<String> = emptyList(),
    var meta: Meta = Meta("paint"), var ui: ToolState? = null,
)

class ProjectFormatError(msg: String) : Exception(msg)

data class CanvasSize(val id: String, val label: String, val w: Int, val h: Int)

object ProjectOps {
    const val VERSION = 1
    const val MAX_UNDO = 250
    const val SNAP_EVERY = 120
    const val MAX_JSON = 3_800_000
    val CANVAS_SIZES = listOf(
        CanvasSize("standard", "Standard", 1024, 768), CanvasSize("large", "Large", 1600, 1200),
        CanvasSize("square", "Square", 1200, 1200), CanvasSize("a4", "A4 portrait", 1240, 1754),
    )

    private fun r1(v: Float) = (v * 10).roundToInt() / 10f
    /** Round stroke points to keep the JSON compact (same as the website's qpt). */
    fun qpt(x: Float, y: Float, p: Float, tilt: Float) = floatArrayOf(r1(x), r1(y), (p * 100).roundToInt() / 100f, tilt.roundToInt().toFloat())

    fun newLayer(name: String, kind: String = "paint", template: TemplateRef? = null) = Layer(ArtIds.shortId(), name, true, kind == "template", kind, template)

    fun create(w: Int, h: Int, paper: String = "smooth", template: TemplateRef? = null): Project {
        val paint = newLayer(if (template != null) "Colours" else "Layer 1")
        val layers = arrayListOf(paint)
        if (template != null) layers.add(newLayer("Outline", "template", template))
        return Project(w, h, paper, layers, paint.id, meta = if (template != null) Meta("color", template.id) else Meta("paint"))
    }

    fun layerById(p: Project, id: String?) = p.layers.firstOrNull { it.id == id }
    fun layerIndex(p: Project, id: String) = p.layers.indexOfFirst { it.id == id }
    fun active(p: Project) = layerById(p, p.active)

    /** Why a layer can't be painted on (null if it can). */
    fun paintBlock(l: Layer?): String? = when {
        l == null -> "missing"; l.kind == "template" -> "template"; l.locked -> "locked"; !l.visible -> "hidden"; else -> null
    }

    private fun push(p: Project, a: Action) {
        p.undo.add(a)
        if (p.undo.size > MAX_UNDO) repeat(p.undo.size - MAX_UNDO) { p.undo.removeAt(0) }
        p.redo.clear()
    }

    fun addOp(p: Project, layerId: String, op: Op): Boolean {
        val l = layerById(p, layerId)
        if (paintBlock(l) != null) return false
        l!!.ops.add(op)
        push(p, Action.OpA(layerId, op.id))
        return true
    }

    fun addLayer(p: Project, name: String? = null): Layer {
        val l = newLayer(name ?: "Layer ${p.layers.count { it.kind == "paint" } + 1}")
        var idx = layerIndex(p, p.active) + 1
        if (idx <= 0) idx = p.layers.size
        p.layers.add(idx, l)
        p.active = l.id
        push(p, Action.AddLayer(l.id, idx))
        return l
    }

    fun canDeleteLayer(p: Project, id: String): Boolean {
        val l = layerById(p, id)
        return l != null && l.kind != "template" && p.layers.count { it.kind == "paint" } > 1
    }

    fun deleteLayer(p: Project, id: String): Boolean {
        if (!canDeleteLayer(p, id)) return false
        val index = layerIndex(p, id)
        val l = p.layers.removeAt(index)
        push(p, Action.DelLayer(id, index, l))
        fixActive(p, index)
        return true
    }

    private fun fixActive(p: Project, near: Int = 0) {
        if (layerById(p, p.active)?.kind == "paint") return
        val paints = p.layers.withIndex().filter { it.value.kind == "paint" }
        if (paints.isEmpty()) return
        p.active = paints.minBy { abs(it.index - near) }.value.id
    }

    private fun propsOf(l: Layer, keys: LayerProps) = LayerProps(
        if (keys.name != null) l.name else null, if (keys.visible != null) l.visible else null, if (keys.locked != null) l.locked else null,
    )
    private fun applyProps(l: Layer, pr: LayerProps) { pr.name?.let { l.name = it }; pr.visible?.let { l.visible = it }; pr.locked?.let { l.locked = it } }

    fun setLayerProps(p: Project, id: String, after: LayerProps): Boolean {
        val l = layerById(p, id) ?: return false
        if (l.kind == "template" && after.locked == false) return false
        val before = propsOf(l, after)
        applyProps(l, after)
        push(p, Action.Props(id, before, after))
        return true
    }

    fun moveLayer(p: Project, id: String, dir: Int): Boolean {
        val from = layerIndex(p, id); val to = from + dir
        if (from < 0 || to < 0 || to >= p.layers.size) return false
        val l = p.layers.removeAt(from)
        p.layers.add(to, l)
        push(p, Action.Move(id, from, to))
        return true
    }

    fun undo(p: Project): Change? {
        val a = p.undo.removeLastOrNull() ?: return null
        val ch = revert(p, a)
        p.redo.add(a)
        return ch
    }

    fun redo(p: Project): Change? {
        val a = p.redo.removeLastOrNull() ?: return null
        val ch = reapply(p, a)
        p.undo.add(a)
        return ch
    }

    private fun revert(p: Project, a: Action): Change = when (a) {
        is Action.OpA -> {
            layerById(p, a.layer)?.let { l -> val i = l.ops.indexOfFirst { it.id == a.opId }; if (i >= 0) a.op = l.ops.removeAt(i) }
            Change(listOf(a.layer), false)
        }
        is Action.AddLayer -> { val i = layerIndex(p, a.id); if (i >= 0) a.layer = p.layers.removeAt(i); fixActive(p, a.index); Change(emptyList(), true) }
        is Action.DelLayer -> { a.layer?.let { p.layers.add(minOf(a.index, p.layers.size), it); a.layer = null }; p.active = a.id; Change(listOf(a.id), true) }
        is Action.Props -> { layerById(p, a.id)?.let { applyProps(it, a.before) }; Change(emptyList(), true) }
        is Action.Move -> { val i = layerIndex(p, a.id); if (i >= 0) { val l = p.layers.removeAt(i); p.layers.add(a.from.coerceIn(0, p.layers.size), l) }; Change(emptyList(), true) }
    }

    private fun reapply(p: Project, a: Action): Change = when (a) {
        is Action.OpA -> { val l = layerById(p, a.layer); val op = a.op; if (l != null && op != null) { l.ops.add(op); a.op = null }; Change(listOf(a.layer), false) }
        is Action.AddLayer -> { a.layer?.let { p.layers.add(minOf(a.index, p.layers.size), it); a.layer = null }; p.active = a.id; Change(listOf(a.id), true) }
        is Action.DelLayer -> { val i = layerIndex(p, a.id); if (i >= 0) a.layer = p.layers.removeAt(i); fixActive(p, a.index); Change(emptyList(), true) }
        is Action.Props -> { layerById(p, a.id)?.let { applyProps(it, a.after) }; Change(emptyList(), true) }
        is Action.Move -> { val i = layerIndex(p, a.id); if (i >= 0) { val l = p.layers.removeAt(i); p.layers.add(a.to.coerceIn(0, p.layers.size), l) }; Change(emptyList(), true) }
    }

    // ---------- replay planning & size budget ----------
    class Plan(val from: String, val url: String?, val start: Int)

    /** Where replay of a layer starts: a valid cached snapshot, the pruned base raster, or empty. */
    fun replayPlan(l: Layer): Plan {
        val s = l.snap
        if (s != null && s.n <= l.ops.size && s.n > 0 && l.ops[s.n - 1].id == s.opId) return Plan("snap", s.url, s.n)
        return Plan(if (l.base != null) "base" else "empty", l.base, 0)
    }

    fun wantsSnapshot(l: Layer) = l.kind == "paint" && l.ops.size - replayPlan(l).start >= SNAP_EVERY

    fun bakeLayer(p: Project, id: String, rasterUrl: String) {
        val l = layerById(p, id) ?: return
        l.base = rasterUrl; l.ops = ArrayList(); l.snap = null
        p.undo.removeAll { it is Action.OpA && it.layer == id }
        p.redo.removeAll { it is Action.OpA && it.layer == id }
    }

    fun trimHistory(p: Project, keep: Int) {
        if (p.undo.size > keep) repeat(p.undo.size - keep) { p.undo.removeAt(0) }
        if (p.redo.size > keep) repeat(p.redo.size - keep) { p.redo.removeAt(0) }
    }

    // ---------- serialisation (compact writer; same shape as the website's toJSON) ----------
    private fun StringBuilder.q(s: String) = append(JsonPrimitive(s).toString())
    private fun StringBuilder.num(v: Float) {
        val d = v.toDouble()
        if (d.isNaN() || d.isInfinite()) { append('0'); return }
        val r = (d * 100).roundToLong()
        if (r % 100 == 0L) append(r / 100) else append(r / 100.0)
    }

    private fun StringBuilder.op(o: Op) {
        append("{\"t\":"); q(o.t); append(",\"id\":"); q(o.id)
        when (o.t) {
            "stroke" -> {
                append(",\"brush\":"); q(o.brush); append(",\"color\":"); q(o.color)
                append(",\"size\":"); num(o.size); append(",\"opacity\":"); num(o.opacity); append(",\"seed\":"); append(o.seed)
                append(",\"pts\":[")
                o.pts.forEachIndexed { i, p ->
                    if (i > 0) append(',')
                    append('['); num(p[0]); append(','); num(p[1]); append(','); num(p[2]); append(','); num(p[3]); append(']')
                }
                append(']')
            }
            "fill" -> { append(",\"x\":"); num(o.x); append(",\"y\":"); num(o.y); append(",\"color\":"); q(o.color); append(",\"tol\":"); append(o.tol) }
        }
        append('}')
    }

    private fun StringBuilder.layer(l: Layer, order: Int?) {
        append("{\"id\":"); q(l.id); append(",\"name\":"); q(l.name)
        append(",\"visible\":").append(l.visible).append(",\"locked\":").append(l.locked)
        append(",\"kind\":"); q(l.kind)
        l.template?.let { append(",\"template\":{\"kind\":"); q(it.kind); append(",\"id\":"); q(it.id); append('}') }
        append(",\"ops\":[")
        l.ops.forEachIndexed { i, o -> if (i > 0) append(','); op(o) }
        append(']')
        l.base?.let { append(",\"base\":"); q(it) }
        l.snap?.let { append(",\"snap\":{\"n\":").append(it.n).append(",\"opId\":"); q(it.opId); append(",\"url\":"); q(it.url); append('}') }
        if (order != null) append(",\"order\":").append(order)
        append('}')
    }

    private fun StringBuilder.props(pr: LayerProps) {
        append('{')
        val parts = ArrayList<String>()
        pr.name?.let { parts.add("\"name\":" + JsonPrimitive(it)) }
        pr.visible?.let { parts.add("\"visible\":$it") }
        pr.locked?.let { parts.add("\"locked\":$it") }
        append(parts.joinToString(","))
        append('}')
    }

    private fun StringBuilder.action(a: Action) {
        when (a) {
            is Action.OpA -> { append("{\"a\":\"op\",\"layer\":"); q(a.layer); append(",\"opId\":"); q(a.opId); a.op?.let { append(",\"op\":"); op(it) }; append('}') }
            is Action.AddLayer -> { append("{\"a\":\"addLayer\",\"id\":"); q(a.id); append(",\"index\":").append(a.index); a.layer?.let { append(",\"layer\":"); layer(it, null) }; append('}') }
            is Action.DelLayer -> { append("{\"a\":\"delLayer\",\"id\":"); q(a.id); append(",\"index\":").append(a.index); a.layer?.let { append(",\"layer\":"); layer(it, null) }; append('}') }
            is Action.Props -> { append("{\"a\":\"props\",\"id\":"); q(a.id); append(",\"before\":"); props(a.before); append(",\"after\":"); props(a.after); append('}') }
            is Action.Move -> { append("{\"a\":\"move\",\"id\":"); q(a.id); append(",\"from\":").append(a.from).append(",\"to\":").append(a.to).append('}') }
        }
    }

    fun serialize(p: Project): String = buildString {
        append("{\"v\":").append(VERSION).append(",\"w\":").append(p.w).append(",\"h\":").append(p.h)
        append(",\"paper\":"); q(p.paper)
        append(",\"layers\":[")
        p.layers.forEachIndexed { i, l -> if (i > 0) append(','); layer(l, i) }
        append("],\"active\":"); q(p.active)
        append(",\"history\":{\"undo\":[")
        p.undo.forEachIndexed { i, a -> if (i > 0) append(','); action(a) }
        append("],\"redo\":[")
        p.redo.forEachIndexed { i, a -> if (i > 0) append(','); action(a) }
        append("]},\"palettes\":[")
        p.palettes.forEachIndexed { i, pl ->
            if (i > 0) append(',')
            append("{\"id\":"); q(pl.id); append(",\"name\":"); q(pl.name); append(",\"colors\":[")
            pl.colors.forEachIndexed { k, c -> if (k > 0) append(','); q(c) }
            append("]}")
        }
        append("],\"recent\":[")
        p.recent.forEachIndexed { i, c -> if (i > 0) append(','); q(c) }
        append("],\"meta\":{\"kind\":"); q(p.meta.kind); p.meta.pageId?.let { append(",\"pageId\":"); q(it) }; append('}')
        p.ui?.let { u -> append(",\"ui\":{\"brush\":"); q(u.brush); append(",\"color\":"); q(u.color); append(",\"size\":"); num(u.size); append(",\"opacity\":"); num(u.opacity); append('}') }
        append('}')
    }

    // ---------- parsing (lenient, like the website's deserialize) ----------
    private fun JsonElement?.str(): String? = (this as? JsonPrimitive)?.takeIf { it.isString || it.contentOrNull != null }?.contentOrNull
    private fun JsonElement?.f(d: Float = 0f): Float = (this as? JsonPrimitive)?.doubleOrNull?.toFloat() ?: d
    private fun JsonElement?.i(d: Int = 0): Int = (this as? JsonPrimitive)?.let { it.intOrNull ?: it.doubleOrNull?.toInt() } ?: d
    private fun JsonElement?.b(): Boolean? = (this as? JsonPrimitive)?.booleanOrNull
    private val JsonElement?.obj get() = this as? JsonObject
    private val JsonElement?.arr get() = this as? JsonArray

    private fun parseOp(e: JsonElement?): Op? {
        val o = e.obj ?: return null
        val t = o["t"].str() ?: return null
        val id = o["id"].str() ?: ArtIds.shortId()
        return when (t) {
            "stroke" -> {
                val pts = ArrayList<FloatArray>()
                o["pts"].arr?.forEach { pe ->
                    val a = pe.arr ?: return@forEach
                    pts.add(floatArrayOf(a.getOrNull(0).f(), a.getOrNull(1).f(), a.getOrNull(2).f(0.5f), a.getOrNull(3).f()))
                }
                Op("stroke", id, brush = o["brush"].str() ?: "marker", color = o["color"].str() ?: "#000000", size = o["size"].f(10f), opacity = o["opacity"].f(1f),
                    seed = (o["seed"] as? JsonPrimitive)?.let { it.longOrNull ?: it.doubleOrNull?.toLong() } ?: 0L, pts = pts)
            }
            "fill" -> Op("fill", id, color = o["color"].str() ?: "#000000", x = o["x"].f(), y = o["y"].f(), tol = o["tol"].i(40))
            "clear" -> Op("clear", id)
            else -> null
        }
    }

    private fun parseLayer(e: JsonElement?): Pair<Layer, Int?>? {
        val o = e.obj ?: return null
        val kind = if (o["kind"].str() == "template") "template" else "paint"
        val tpl = o["template"].obj?.let { t -> TemplateRef(t["kind"].str() ?: "coloring", t["id"].str() ?: "") }
        val snap = o["snap"].obj?.let { s -> val url = s["url"].str(); if (url != null) Snap(s["n"].i(), s["opId"].str() ?: "", url) else null }
        val l = Layer(
            o["id"].str() ?: ArtIds.shortId(), o["name"].str()?.takeIf { it.isNotEmpty() } ?: "Layer",
            o["visible"].b() != false, if (kind == "template") true else o["locked"].b() == true, kind, tpl,
            ArrayList(o["ops"].arr?.mapNotNull { parseOp(it) } ?: emptyList()), o["base"].str(), snap,
        )
        return l to (o["order"] as? JsonPrimitive)?.let { it.intOrNull ?: it.doubleOrNull?.toInt() }
    }

    private fun parseProps(e: JsonElement?): LayerProps {
        val o = e.obj ?: return LayerProps()
        return LayerProps(o["name"].str(), o["visible"].b(), o["locked"].b())
    }

    private fun parseAction(e: JsonElement?): Action? {
        val o = e.obj ?: return null
        return when (o["a"].str()) {
            "op" -> Action.OpA(o["layer"].str() ?: return null, o["opId"].str() ?: return null, parseOp(o["op"]))
            "addLayer" -> Action.AddLayer(o["id"].str() ?: return null, o["index"].i(), parseLayer(o["layer"])?.first)
            "delLayer" -> Action.DelLayer(o["id"].str() ?: return null, o["index"].i(), parseLayer(o["layer"])?.first)
            "props" -> Action.Props(o["id"].str() ?: return null, parseProps(o["before"]), parseProps(o["after"]))
            "move" -> Action.Move(o["id"].str() ?: return null, o["from"].i(), o["to"].i())
            else -> null
        }
    }

    fun deserialize(text: String): Project = deserialize(AppJson.parseToJsonElement(text))

    fun deserialize(input: JsonElement): Project {
        val o = input.obj ?: throw ProjectFormatError("Not a WonderLab art project")
        val w = o["w"].f(); val h = o["h"].f()
        val layersIn = o["layers"].arr
        if (layersIn == null || !(w > 0) || !(h > 0)) throw ProjectFormatError("Not a WonderLab art project")
        if (o["v"].i(1) > VERSION) throw ProjectFormatError("This picture was made with a newer version of WonderLab")
        val layers = ArrayList(layersIn.mapIndexedNotNull { i, e -> parseLayer(e)?.let { (l, ord) -> Triple(l, ord ?: i, i) } }
            .sortedWith(compareBy({ it.second }, { it.third })).map { it.first })
        val hist = o["history"].obj
        val p = Project(
            w.toInt(), h.toInt(), o["paper"].str()?.takeIf { it in Paper.COLORS } ?: "smooth", layers, o["active"].str() ?: "",
            ArrayList(hist?.get("undo").arr?.mapNotNull { parseAction(it) } ?: emptyList()),
            ArrayList(hist?.get("redo").arr?.mapNotNull { parseAction(it) } ?: emptyList()),
            o["palettes"].arr?.mapNotNull { pe ->
                val po = pe.obj ?: return@mapNotNull null
                Palette(po["id"].str() ?: ArtIds.shortId(), po["name"].str() ?: "Palette", po["colors"].arr?.mapNotNull { it.str() } ?: emptyList())
            } ?: emptyList(),
            o["recent"].arr?.mapNotNull { it.str() } ?: emptyList(),
            o["meta"].obj?.let { m -> Meta(m["kind"].str() ?: "paint", m["pageId"].str()) } ?: Meta("paint"),
            o["ui"].obj?.let { u -> ToolState(u["brush"].str() ?: "colorPencil", u["color"].str() ?: "#1e88e5", u["size"].f(8f), u["opacity"].f(1f)) },
        )
        if (p.layers.none { it.kind == "paint" }) p.layers.add(0, newLayer("Layer 1"))
        fixActive(p, 0)
        return p
    }

    @Suppress("unused") private val unusedNull = JsonNull
}
