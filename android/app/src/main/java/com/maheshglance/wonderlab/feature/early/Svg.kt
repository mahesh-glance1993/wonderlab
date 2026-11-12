package com.maheshglance.wonderlab.feature.early

import android.graphics.DashPathEffect
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.util.LruCache
import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.asAndroidPath
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.vector.PathParser
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.engine.Engine
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

/**
 * Native renderer for the website's original SVG drawings (story props, backdrops, shapes, Build It parts,
 * paint splashes). The engine evaluates the website's JSX and returns a node tree; this compiles it once into
 * android.graphics paths and draws them with Canvas — crisp at any size, no WebView.
 */
class SNode(val t: String, val a: JsonObject, val c: List<SNode>)

fun parseSvg(e: JsonElement?): List<SNode> = (e as? JsonArray)?.mapNotNull { n ->
    val o = n as? JsonObject ?: return@mapNotNull null
    SNode((o["t"] as? JsonPrimitive)?.content ?: "g", (o["a"] as? JsonObject) ?: JsonObject(emptyMap()), parseSvg(o["c"]))
} ?: emptyList()

/** Builds nodes in Kotlin (small native-only drawings such as the paint pot, bowl and gift). */
fun svg(t: String, vararg attrs: Pair<String, Any>, children: List<SNode> = emptyList()): SNode =
    SNode(t, JsonObject(attrs.associate { (k, v) -> k to when (v) { is Number -> JsonPrimitive(v); is Boolean -> JsonPrimitive(v); else -> JsonPrimitive(v.toString()) } }), children)

/** How a group with a `data-role` (wheel, rotor, spin, gear, arm, bucket, flame) moves this frame. */
data class RoleXf(val rotate: Float = 0f, val scaleX: Float = 1f, val scaleY: Float = 1f, val dx: Float = 0f, val dy: Float = 0f)

class SvgPrim(
    val path: Path, val fill: Paint?, val stroke: Paint?,
    val role: String?, val roleIndex: Int, val pivot: Offset, val radius: Float,
    val cls: String?, val text: String? = null, val textX: Float = 0f, val textY: Float = 0f,
)

/** A compiled drawing (paths in view-box units). */
class SvgPicture(val prims: List<SvgPrim>)

private val colourNames = mapOf(
    "white" to 0xFFFFFFFF.toInt(), "black" to 0xFF000000.toInt(), "transparent" to 0, "none" to 0,
)

fun parseColor(s: String?): Int? {
    if (s == null) return null
    val v = s.trim()
    if (v == "none" || v == "transparent") return null
    if (v.startsWith("var(")) return 0xFFFFFFFF.toInt()
    if (v == "currentColor") return 0xFF1D2540.toInt()
    colourNames[v]?.let { return it }
    if (v.startsWith("#")) {
        val h = v.substring(1)
        return runCatching {
            when (h.length) {
                3 -> (0xFF shl 24) or (h[0].digitToInt(16) * 17 shl 16) or (h[1].digitToInt(16) * 17 shl 8) or (h[2].digitToInt(16) * 17)
                6 -> (0xFF shl 24) or h.toInt(16)
                8 -> h.substring(0, 6).toInt(16) or (h.substring(6).toInt(16) shl 24)
                else -> null
            }
        }.getOrNull()
    }
    if (v.startsWith("rgba(") || v.startsWith("rgb(")) {
        val p = v.substringAfter('(').substringBefore(')').split(',').map { it.trim().toFloatOrNull() ?: 0f }
        val a = if (p.size > 3) (p[3] * 255).toInt() else 255
        return (a shl 24) or (p[0].toInt() shl 16) or (p[1].toInt() shl 8) or p[2].toInt()
    }
    return null
}

private fun JsonObject.num(k: String, d: Float = 0f): Float = (this[k] as? JsonPrimitive)?.let { it.doubleOrNull?.toFloat() ?: it.content.removeSuffix("px").toFloatOrNull() } ?: d
private fun JsonObject.s(k: String): String? = (this[k] as? JsonPrimitive)?.content

/** Parses an SVG `transform` attribute or a CSS transform ("translate(0px, 40px) scale(1, 0.4) rotate(30deg)"). */
fun parseTransform(src: String?, m: Matrix = Matrix()): Matrix {
    if (src.isNullOrBlank()) return m
    val re = Regex("(\\w+)\\s*\\(([^)]*)\\)")
    for (f in re.findAll(src)) {
        val name = f.groupValues[1]
        val args = f.groupValues[2].split(Regex("[\\s,]+")).filter { it.isNotBlank() }.map { it.replace("px", "").replace("deg", "").toFloatOrNull() ?: 0f }
        when (name) {
            "translate" -> m.preTranslate(args.getOrElse(0) { 0f }, args.getOrElse(1) { 0f })
            "translateX" -> m.preTranslate(args.getOrElse(0) { 0f }, 0f)
            "translateY" -> m.preTranslate(0f, args.getOrElse(0) { 0f })
            "rotate" -> if (args.size >= 3) m.preRotate(args[0], args[1], args[2]) else m.preRotate(args.getOrElse(0) { 0f })
            "scale" -> m.preScale(args.getOrElse(0) { 1f }, args.getOrElse(1) { args.getOrElse(0) { 1f } })
            "scaleX" -> m.preScale(args.getOrElse(0) { 1f }, 1f)
            "scaleY" -> m.preScale(1f, args.getOrElse(0) { 1f })
            "matrix" -> if (args.size == 6) m.preConcat(Matrix().apply { setValues(floatArrayOf(args[0], args[2], args[4], args[1], args[3], args[5], 0f, 0f, 1f)) })
        }
    }
    return m
}

private class Style(
    val fill: String? = "#000", val stroke: String? = null, val sw: Float = 1f, val cap: String = "butt", val join: String = "miter",
    val opacity: Float = 1f, val fillOpacity: Float = 1f, val strokeOpacity: Float = 1f, val dash: String? = null,
    val role: String? = null, val roleIndex: Int = -1, val pivot: Offset = Offset.Zero, val cls: String? = null,
)

private val pathCache = LruCache<String, Path>(600)
private fun pathOf(d: String): Path {
    pathCache.get(d)?.let { return Path(it) }
    val p = runCatching { PathParser().parsePathString(d).toPath().asAndroidPath() }.getOrElse { Path() }
    pathCache.put(d, Path(p))
    return p
}

/** Compiles nodes into drawable primitives (once per drawing). */
fun compileSvg(nodes: List<SNode>): SvgPicture {
    val out = ArrayList<SvgPrim>()
    var roleCount = 0
    fun scaleOf(m: Matrix): Float { val v = FloatArray(9); m.getValues(v); return sqrt(abs(v[0] * v[4] - v[1] * v[3])).coerceAtLeast(0.0001f) }

    fun walk(n: SNode, parent: Matrix, st: Style) {
        val a = n.a
        val m = Matrix(parent)
        parseTransform(a.s("transform"), m)
        parseTransform(a.s("css"), m)
        val op = a.num("opacity", 1f) * a.num("cssOpacity", 1f)
        val role = a.s("data-role")
        val pivot = if (role != null) { val p = floatArrayOf(0f, 0f); m.mapPoints(p); Offset(p[0], p[1]) } else st.pivot
        val cls = a.s("class") ?: st.cls
        val s = Style(
            fill = a.s("fill") ?: st.fill, stroke = a.s("stroke") ?: st.stroke,
            sw = if (a.containsKey("strokeWidth")) a.num("strokeWidth", 1f) else st.sw,
            cap = a.s("strokeLinecap") ?: st.cap, join = a.s("strokeLinejoin") ?: st.join,
            opacity = st.opacity * op, fillOpacity = if (a.containsKey("fillOpacity")) a.num("fillOpacity", 1f) else st.fillOpacity,
            strokeOpacity = if (a.containsKey("strokeOpacity")) a.num("strokeOpacity", 1f) else st.strokeOpacity,
            dash = a.s("strokeDasharray") ?: st.dash,
            role = role ?: st.role, roleIndex = if (role != null) roleCount++ else st.roleIndex, pivot = pivot, cls = cls,
        )
        val local: Path? = when (n.t) {
            "g", "svg" -> { n.c.forEach { walk(it, m, s) }; null }
            "path" -> a.s("d")?.let { pathOf(it) }
            "rect" -> {
                val x = a.num("x"); val y = a.num("y"); val w = a.num("width"); val h = a.num("height")
                val rx = if (a.containsKey("rx")) a.num("rx") else a.num("ry"); val ry = if (a.containsKey("ry")) a.num("ry") else rx
                Path().apply { if (rx > 0 || ry > 0) addRoundRect(RectF(x, y, x + w, y + h), min(rx, w / 2), min(ry, h / 2), Path.Direction.CW) else addRect(x, y, x + w, y + h, Path.Direction.CW) }
            }
            "circle" -> Path().apply { addCircle(a.num("cx"), a.num("cy"), a.num("r"), Path.Direction.CW) }
            "ellipse" -> { val cx = a.num("cx"); val cy = a.num("cy"); val rx = a.num("rx"); val ry = a.num("ry"); Path().apply { addOval(RectF(cx - rx, cy - ry, cx + rx, cy + ry), Path.Direction.CW) } }
            "line" -> Path().apply { moveTo(a.num("x1"), a.num("y1")); lineTo(a.num("x2"), a.num("y2")) }
            "polygon", "polyline" -> {
                val p = (a.s("points") ?: "").trim().split(Regex("[\\s,]+")).mapNotNull { it.toFloatOrNull() }
                Path().apply { for (i in 0 until p.size / 2) { if (i == 0) moveTo(p[0], p[1]) else lineTo(p[i * 2], p[i * 2 + 1]) }; if (n.t == "polygon") close() }
            }
            "text" -> {
                val txt = n.c.firstOrNull { it.t == "#text" }?.a?.s("v") ?: ""
                val pt = floatArrayOf(a.num("x"), a.num("y")); m.mapPoints(pt)
                val sc = scaleOf(m)
                val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    color = parseColor(s.fill) ?: 0xFF1D2540.toInt(); alpha = (255 * s.opacity).toInt().coerceIn(0, 255)
                    textSize = a.num("fontSize", 16f) * sc; isFakeBoldText = (a.num("fontWeight", 400f) >= 700f)
                    textAlign = when (a.s("textAnchor")) { "middle" -> Paint.Align.CENTER; "end" -> Paint.Align.RIGHT; else -> Paint.Align.LEFT }
                }
                out += SvgPrim(Path(), paint, null, s.role, s.roleIndex, s.pivot, 0f, s.cls, txt, pt[0], pt[1])
                null
            }
            else -> { n.c.forEach { walk(it, m, s) }; null }
        }
        if (local != null) {
            val p = Path(); local.transform(m, p)
            val sc = scaleOf(m)
            val fc = parseColor(s.fill)
            val fill = fc?.let { c ->
                val alpha = ((c ushr 24) and 0xFF) / 255f * s.opacity * s.fillOpacity
                if (alpha <= 0f) null else Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL; color = c; this.alpha = (alpha * 255).toInt().coerceIn(0, 255) }
            }
            val sc2 = parseColor(s.stroke)
            val nonScaling = a.s("vectorEffect") == "non-scaling-stroke"
            val stroke = sc2?.let { c ->
                val alpha = ((c ushr 24) and 0xFF) / 255f * s.opacity * s.strokeOpacity
                if (alpha <= 0f || s.sw <= 0f) null else Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    style = Paint.Style.STROKE; color = c; this.alpha = (alpha * 255).toInt().coerceIn(0, 255)
                    strokeWidth = if (nonScaling) s.sw else s.sw * sc
                    strokeCap = when (s.cap) { "round" -> Paint.Cap.ROUND; "square" -> Paint.Cap.SQUARE; else -> Paint.Cap.BUTT }
                    strokeJoin = when (s.join) { "round" -> Paint.Join.ROUND; "bevel" -> Paint.Join.BEVEL; else -> Paint.Join.MITER }
                    s.dash?.split(Regex("[\\s,]+"))?.mapNotNull { it.toFloatOrNull() }?.takeIf { it.size >= 2 }?.let { d ->
                        pathEffect = DashPathEffect(d.map { it * sc }.toFloatArray(), 0f)
                    }
                }
            }
            if (fill != null || stroke != null) {
                val b = RectF(); p.computeBounds(b, true)
                out += SvgPrim(p, fill, stroke, s.role, s.roleIndex, s.pivot, max(b.width(), b.height()) / 2, s.cls)
            }
        }
    }
    val root = Style()
    nodes.forEach { walk(it, Matrix(), root) }
    return SvgPicture(out)
}

/**
 * Draws a compiled picture into the current DrawScope, fitting the view box (x, y, w, h) centred.
 * `roleXf` animates groups with a data-role (wheels turning, rotors spinning…); `time` (ms) drives the
 * website's small CSS effects (flickering flame, rising steam) unless motion is reduced.
 */
fun DrawScope.drawSvg(
    pic: SvgPicture, vx: Float, vy: Float, vw: Float, vh: Float,
    roleXf: ((role: String, index: Int) -> RoleXf?)? = null, time: Long = -1, tint: Int? = null, alpha: Float = 1f,
) {
    val k = min(size.width / vw, size.height / vh)
    val ox = (size.width - vw * k) / 2 - vx * k
    val oy = (size.height - vh * k) / 2 - vy * k
    drawIntoCanvas { cv ->
        val c = cv.nativeCanvas
        val save = if (alpha < 1f) c.saveLayerAlpha(0f, 0f, size.width, size.height, (alpha * 255).toInt()) else c.save()
        c.translate(ox, oy); c.scale(k, k)
        for (p in pic.prims) {
            val xf = if (p.role != null && roleXf != null) roleXf(p.role, p.roleIndex) else null
            val anim = time >= 0 && p.cls != null
            if (xf != null || anim) c.save()
            if (xf != null) {
                c.translate(xf.dx, xf.dy)
                if (xf.rotate != 0f) c.rotate(xf.rotate, p.pivot.x, p.pivot.y)
                if (xf.scaleX != 1f || xf.scaleY != 1f) c.scale(xf.scaleX, xf.scaleY, p.pivot.x, p.pivot.y)
            }
            if (anim) {
                val b = RectF(); p.path.computeBounds(b, true)
                when {
                    p.cls!!.contains("el-flicker") -> { val f = 1f + 0.06f * kotlin.math.sin(time / 90.0).toFloat(); c.scale(1f / f, f, b.centerX(), b.bottom) }
                    p.cls.contains("el-steam") -> { val ph = ((time % 1800L) / 1800f); c.translate(0f, -6f * ph) }
                }
            }
            if (p.text != null) { p.fill?.let { c.drawText(p.text, p.textX, p.textY, it) } }
            else {
                p.fill?.let { f -> if (tint != null) c.drawPath(p.path, Paint(f).apply { color = tint; this.alpha = f.alpha }) else c.drawPath(p.path, f) }
                p.stroke?.let { s -> if (tint != null) c.drawPath(p.path, Paint(s).apply { color = tint; this.alpha = s.alpha }) else c.drawPath(p.path, s) }
            }
            if (xf != null || anim) c.restore()
        }
        c.restoreToCount(save)
    }
}

/** Fetches + compiles drawings from the engine, cached for the app run. */
object SvgStore {
    private val cache = LruCache<String, SvgPicture>(400)
    private val empty = SvgPicture(emptyList())
    fun peek(key: String): SvgPicture? = cache.get(key)
    fun put(key: String, pic: SvgPicture) { cache.put(key, pic) }

    suspend fun get(engine: Engine, key: String, fn: String, vararg args: Any?): SvgPicture {
        cache.get(key)?.let { return it }
        val nodes = runCatching { parseSvg(engine.call("early.$fn", *args)) }.getOrDefault(emptyList())
        val pic = if (nodes.isEmpty()) empty else compileSvg(nodes)
        cache.put(key, pic)
        return pic
    }

    /** Loads many picture drawings in one engine call. */
    suspend fun preloadArts(engine: Engine, keys: Collection<Pair<String, String?>>) {
        val need = keys.map { (id, v) -> "$id|${v ?: ""}" }.distinct().filter { cache.get("art:$it") == null }
        if (need.isEmpty()) return
        val res = runCatching { engine.call("early.svgArts", need) as? JsonObject }.getOrNull() ?: return
        for (k in need) cache.put("art:$k", res[k]?.let { e -> parseSvg(e).takeIf { it.isNotEmpty() }?.let { compileSvg(it) } } ?: empty)
    }
}

/** Remembers a drawing (null until loaded). */
@Composable
fun rememberSvg(key: String, fn: String, vararg args: Any?): SvgPicture? {
    val app = LocalApp.current
    var pic by remember(key) { mutableStateOf(SvgStore.peek(key)) }
    LaunchedEffect(key) { if (pic == null) pic = SvgStore.get(app.engine, key, fn, *args) }
    return pic
}

/** The website drawing for a picture / prop / shape / colour splash (in its -50..50 box). */
@Composable
fun rememberArtSvg(id: String, v: String? = null): SvgPicture? = rememberSvg("art:$id|${v ?: ""}", "svgArt", id, v)

/** Draws a picture filling the composable (view box -50..50). */
@Composable
fun SvgArt(pic: SvgPicture?, modifier: Modifier, tint: Int? = null, time: Long = -1) {
    Canvas(modifier) { if (pic != null) drawSvg(pic, -50f, -50f, 100f, 100f, tint = tint, time = time) }
}

@Suppress("unused") private fun JsonObject.bool(k: String) = (this[k] as? JsonPrimitive)?.booleanOrNull
@Suppress("unused") private val keepJson = AppJson
