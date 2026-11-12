package com.maheshglance.wonderlab.feature.art.paint

import android.view.MotionEvent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.maheshglance.wonderlab.WonderLabApp
import com.maheshglance.wonderlab.feature.art.data.ArtStorage
import com.maheshglance.wonderlab.feature.art.engine.ArtColor
import com.maheshglance.wonderlab.feature.art.engine.ArtIds
import com.maheshglance.wonderlab.feature.art.engine.Brushes
import com.maheshglance.wonderlab.feature.art.engine.Change
import com.maheshglance.wonderlab.feature.art.engine.DrawList
import com.maheshglance.wonderlab.feature.art.engine.IntensitySource
import com.maheshglance.wonderlab.feature.art.engine.LayerStack
import com.maheshglance.wonderlab.feature.art.engine.Op
import com.maheshglance.wonderlab.feature.art.engine.Paper
import com.maheshglance.wonderlab.feature.art.engine.PressureInput
import com.maheshglance.wonderlab.feature.art.engine.PressurePrefs
import com.maheshglance.wonderlab.feature.art.engine.Project
import com.maheshglance.wonderlab.feature.art.engine.ProjectOps
import com.maheshglance.wonderlab.feature.art.engine.StrokePainter
import com.maheshglance.wonderlab.feature.art.engine.TemplateRef
import com.maheshglance.wonderlab.feature.art.engine.Templates
import com.maheshglance.wonderlab.feature.art.engine.ToolState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.math.ceil
import kotlin.math.exp
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

enum class Tool { Brush, Fill, Eyedropper, Hand }

val FILL_TOL = mapOf("small" to 12, "medium" to 40, "large" to 90)

/**
 * Painting studio state + logic (port of the website's Studio.tsx minus the markup): layered canvas with
 * media brushes, bounded fill, eyedropper, zoom/pan, undo/redo, pen pressure & tilt, autosave.
 * Used for free painting and for colouring pages (a project with a locked outline template layer).
 */
class StudioController(
    val app: WonderLabApp, val pid: String, routeId: String, val early: Boolean,
    private val scope: CoroutineScope, private val announce: (String) -> Unit,
) {
    var id = routeId; private set
    var project: Project? = null; private set
    var stack: LayerStack? = null; private set
    private var baseVersion = 0
    private val templates = HashMap<String, DrawList>()

    @OptIn(ExperimentalCoroutinesApi::class)
    private val renderDispatcher = Dispatchers.Default.limitedParallelism(1)

    // ---------- observable state ----------
    var status by mutableStateOf("loading")
    var title by mutableStateOf("My picture")
    /** bumped when the document changes (history, layers, palettes) */
    var ver by mutableIntStateOf(0)
    /** bumped whenever pixels change (redraw the canvas) */
    var frame by mutableIntStateOf(0)
    var busy by mutableStateOf(false)
    var tool by mutableStateOf(Tool.Brush)
    var brush by mutableStateOf(if (early) "crayon" else "colorPencil")
    var color by mutableStateOf("#1e88e5")
    var size by mutableFloatStateOf(Brushes.def(if (early) "crayon" else "colorPencil").defaultSize.toFloat())
    var opacity by mutableFloatStateOf(1f)
    var fillTol by mutableStateOf("medium")
    var intensity by mutableFloatStateOf(app.repo.state.value.prefs.manualIntensity)
    var source by mutableStateOf(IntensitySource.Manual)
    var zoom by mutableIntStateOf(100)
    var local by mutableStateOf("idle") // idle | saving | saved | error
    var spaceHeld = false

    private var prevTool = Tool.Brush

    // ---------- view (document → screen: x' = x * s + tx) ----------
    var s = 1f; private set
    var tx = 0f; private set
    var ty = 0f; private set
    private var autoFit = true
    private var vpW = 0f
    private var vpH = 0f

    private fun applyView() { zoom = (s * 100).toInt(); frame++ }

    fun fit() {
        val p = project ?: return
        if (vpW <= 0 || vpH <= 0) return
        s = max(0.05f, min((vpW - 24) / p.w, (vpH - 24) / p.h))
        tx = (vpW - p.w * s) / 2; ty = (vpH - p.h * s) / 2
        autoFit = true
        applyView()
    }

    fun onViewport(w: Float, h: Float) {
        val lastW = vpW; val lastH = vpH
        vpW = w; vpH = h
        if (autoFit || lastW == 0f) fit()
        else { tx += (w - lastW) / 2; ty += (h - lastH) / 2; applyView() }
    }

    fun zoomBy(f: Float, cx: Float = vpW / 2, cy: Float = vpH / 2) {
        val s2 = min(8f, max(0.05f, s * f))
        tx = cx - (cx - tx) * (s2 / s); ty = cy - (cy - ty) * (s2 / s); s = s2
        autoFit = false
        applyView()
    }

    fun toDoc(x: Float, y: Float) = floatArrayOf((x - tx) / s, (y - ty) / s)

    // ---------- loading ----------
    suspend fun load(sizeParam: String?, paperParam: String?, pageParam: String?) {
        try {
            val loaded = ArtStorage.load(app, pid, id)
            val p: Project
            var ttl = "My picture"
            if (loaded != null) {
                p = withContext(Dispatchers.Default) { ProjectOps.deserialize(loaded.data) }
                ttl = loaded.title; baseVersion = loaded.baseVersion
            } else {
                val page = pageParam?.let { pg -> Templates.pages(app.engine).firstOrNull { it.id == pg } }
                val sz = ProjectOps.CANVAS_SIZES.firstOrNull { it.id == sizeParam } ?: if (page != null) ProjectOps.CANVAS_SIZES[1] else ProjectOps.CANVAS_SIZES[0]
                val paper = paperParam?.takeIf { it in Paper.COLORS } ?: "smooth"
                p = ProjectOps.create(sz.w, sz.h, paper, page?.let { TemplateRef("coloring", it.id) })
                ttl = page?.title ?: "My picture"
                // the learner's saved palettes follow them to new pictures
                p.palettes = PalettePrefs.read(app)
            }
            for (l in p.layers) l.template?.let { t -> if (t.kind == "coloring") Templates.drawList(app.engine, t.id)?.let { templates[t.id] = it } }
            val st = LayerStack(p) { ref -> templates[ref.id] }
            withContext(renderDispatcher) { st.renderAll() }
            project = p; stack = st
            p.ui?.let { u ->
                brush = if (u.brush in Brushes.ALL) u.brush else "colorPencil"
                color = u.color; size = u.size; opacity = u.opacity
            } ?: run { if (p.meta.kind == "color") { brush = if (early) "crayon" else "colorPencil"; size = Brushes.def(brush).defaultSize.toFloat(); tool = Tool.Fill } }
            title = ttl
            status = "ready"
            fit()
            ver++
            app.repo.setLastActivity("/art/paint/$id", ttl)
        } catch (e: Exception) {
            status = "error"
        }
    }

    // ---------- pressure ----------
    private val input = PressureInput()
    private fun pressurePrefs(): PressurePrefs {
        val pr = app.repo.state.value.prefs
        return PressurePrefs(pr.pressureMode, intensity, PalettePrefs.calibration(app))
    }
    val showSource: IntensitySource get() = if (app.repo.state.value.prefs.pressureMode == "manual") IntensitySource.Manual else source

    // ---------- tools ----------
    fun setTool(t: Tool, b: String? = null, lang: String = "en") {
        if (t != Tool.Eyedropper) prevTool = t
        tool = t
        if (b != null) {
            brush = b
            size = Brushes.def(b).defaultSize.toFloat()
            val d = Brushes.def(b)
            announce("${if (lang == "te") d.labelTe else d.label} selected. ${d.hint}")
        } else announce(when (t) {
            Tool.Fill -> "Fill bucket selected. Tap inside a shape to fill it."
            Tool.Eyedropper -> "Colour picker selected. Tap the picture to pick a colour."
            Tool.Hand -> "Move tool selected. Drag to move the picture."
            Tool.Brush -> "Brush selected."
        })
    }

    fun pickColor(hex: String) {
        color = hex
        project?.let { p -> p.recent = (listOf(hex) + p.recent.filter { it != hex }).take(12) }
        ver++
    }

    // ---------- strokes ----------
    private class Live(val pointerId: Int, val painter: StrokePainter, val op: Op, val layerId: String, val type: String, val smoother: StrokeSmoother)
    private var stroke: Live? = null
    val livePainter: StrokePainter? get() = stroke?.painter
    val stroking get() = stroke != null

    private fun blockMsg(b: String) = when (b) {
        "locked" -> "This layer is locked. Unlock it in Layers to draw."
        "hidden" -> "This layer is hidden. Show it in Layers to draw."
        else -> "Choose a colour layer to draw on."
    }

    private fun typeOf(toolType: Int) = when (toolType) {
        MotionEvent.TOOL_TYPE_STYLUS, MotionEvent.TOOL_TYPE_ERASER -> "pen"
        MotionEvent.TOOL_TYPE_MOUSE -> "mouse"
        else -> "touch"
    }

    private fun sample(l: Live, x: Float, y: Float, pressure: Float, tiltRad: Float) {
        val d = toDoc(x, y)
        val (i, tilt, src) = input.sample(l.type, pressure, Math.toDegrees(tiltRad.toDouble()).toFloat(), pressurePrefs())
        if (source != src) source = src
        val pts = l.smoother.add(floatArrayOf(d[0], d[1], i, tilt.toFloat()))
        if (pts.isNotEmpty()) { l.op.pts.addAll(pts); l.painter.add(pts) }
    }

    private fun addSamples(ev: MotionEvent, l: Live) {
        val idx = ev.findPointerIndex(l.pointerId)
        if (idx < 0) return
        for (h in 0 until ev.historySize) sample(l, ev.getHistoricalX(idx, h), ev.getHistoricalY(idx, h), ev.getHistoricalPressure(idx, h), ev.getHistoricalAxisValue(MotionEvent.AXIS_TILT, idx, h))
        sample(l, ev.getX(idx), ev.getY(idx), ev.getPressure(idx), ev.getAxisValue(MotionEvent.AXIS_TILT, idx))
        frame++
    }

    fun endStroke(commit: Boolean) {
        val s0 = stroke ?: return
        val p = project ?: return
        val st = stack ?: return
        stroke = null
        val tail = s0.smoother.finish()
        if (commit && tail.isNotEmpty()) { s0.op.pts.addAll(tail); s0.painter.add(tail) }
        if (!commit || s0.op.pts.isEmpty()) {
            s0.painter.cancel()
            if (!s0.painter.usesBuffer) rerender(listOf(s0.layerId))
            frame++
            return
        }
        s0.painter.finish()
        if (!ProjectOps.addOp(p, s0.layerId, s0.op)) { rerender(listOf(s0.layerId)); frame++; return }
        st.committed(ProjectOps.layerById(p, s0.layerId)!!)
        if (s0.op.brush != "eraser" && Brushes.def(s0.op.brush).fixedColor == null) p.recent = (listOf(s0.op.color) + p.recent.filter { it != s0.op.color }).take(12)
        markDirty(); ver++; frame++
    }

    private fun down(x: Float, y: Float, pointerId: Int, type: String, toolType: Int, ev: MotionEvent, lang: String) {
        val p = project ?: return
        val st = stack ?: return
        val d = toDoc(x, y)
        val l = ProjectOps.active(p)
        val t = tool
        if (t == Tool.Eyedropper) {
            val hex = st.pick(d[0], d[1])
            pickColor(hex)
            announce("Picked ${ArtColor.colorName(hex, lang)}")
            tool = prevTool
            return
        }
        ProjectOps.paintBlock(l)?.let { announce(blockMsg(it)); return }
        if (t == Tool.Fill) {
            if (d[0] < 0 || d[1] < 0 || d[0] >= p.w || d[1] >= p.h) return
            if (st.onOutline(d[0], d[1])) { announce("That is the outline. Tap inside a shape to fill it."); return }
            val op = Op("fill", ArtIds.shortId(), color = color, x = kotlin.math.floor(d[0]), y = kotlin.math.floor(d[1]), tol = FILL_TOL[fillTol] ?: 40)
            val n = st.fill(st.bitmap(l!!.id), op)
            if (n > 0 && ProjectOps.addOp(p, l.id, op)) {
                st.committed(l); p.recent = (listOf(op.color) + p.recent.filter { it != op.color }).take(12)
                markDirty(); ver++; frame++
            } else announce("That area is already this colour.")
            return
        }
        // brush stroke — one finger or pen always draws (a stylus's eraser end always erases)
        val b = if (toolType == MotionEvent.TOOL_TYPE_ERASER) "eraser" else brush
        val op = Op("stroke", ArtIds.shortId(), brush = b, color = Brushes.def(b).fixedColor ?: color, size = size, opacity = opacity, seed = ArtIds.newSeed())
        val painter = st.painter(l!!.id, op)
        input.begin()
        val live = Live(pointerId, painter, op, l.id, type, StrokeSmoother())
        stroke = live
        addSamples(ev, live)
    }

    // gesture state
    private data class Ptr(var x: Float, var y: Float, val type: String)
    private val pointers = HashMap<Int, Ptr>()
    private var pan: FloatArray? = null // pointerId, x0, y0, tx0, ty0
    private var pinch: FloatArray? = null // d0, cx0, cy0, s0, tx0, ty0
    private fun touchPts() = pointers.values.filter { it.type == "touch" }
    private fun pinchInfo(): FloatArray { val (a, b) = touchPts(); return floatArrayOf(hypot(a.x - b.x, a.y - b.y), (a.x + b.x) / 2, (a.y + b.y) / 2) }

    /** Raw MotionEvents from the canvas (pointerInteropFilter): pen/finger/mouse drawing, pinch-zoom, pan. */
    fun onTouch(ev: MotionEvent, lang: String): Boolean {
        if (status != "ready" || busy) { if (ev.actionMasked == MotionEvent.ACTION_DOWN) announceBusy(); return true }
        val idx = ev.actionIndex
        when (ev.actionMasked) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                val pidd = ev.getPointerId(idx); val type = typeOf(ev.getToolType(idx))
                pointers[pidd] = Ptr(ev.getX(idx), ev.getY(idx), type)
                if (type == "touch" && touchPts().size >= 2) {
                    if (stroke?.type == "touch") endStroke(false) // second finger: it's a pinch, not a stroke
                    val pi = pinchInfo()
                    pinch = floatArrayOf(pi[0], pi[1], pi[2], s, tx, ty); pan = null
                    return true
                }
                if (stroke != null || pinch != null || pan != null) return true
                val secondary = type == "mouse" && (ev.buttonState and (MotionEvent.BUTTON_SECONDARY or MotionEvent.BUTTON_TERTIARY)) != 0
                if (secondary || spaceHeld || tool == Tool.Hand) { pan = floatArrayOf(pidd.toFloat(), ev.getX(idx), ev.getY(idx), tx, ty); return true }
                down(ev.getX(idx), ev.getY(idx), pidd, type, ev.getToolType(idx), ev, lang)
            }
            MotionEvent.ACTION_MOVE -> {
                for (i in 0 until ev.pointerCount) pointers[ev.getPointerId(i)]?.let { it.x = ev.getX(i); it.y = ev.getY(i) }
                val pc = pinch
                if (pc != null) {
                    if (touchPts().size < 2) return true
                    val pi = pinchInfo()
                    val s2 = min(8f, max(0.05f, pc[3] * (pi[0] / (if (pc[0] == 0f) 1f else pc[0]))))
                    tx = pi[1] - (pc[1] - pc[4]) * (s2 / pc[3]); ty = pi[2] - (pc[2] - pc[5]) * (s2 / pc[3]); s = s2
                    autoFit = false; applyView(); return true
                }
                val pn = pan
                if (pn != null) {
                    val i = ev.findPointerIndex(pn[0].toInt())
                    if (i >= 0) { tx = pn[3] + ev.getX(i) - pn[1]; ty = pn[4] + ev.getY(i) - pn[2]; autoFit = false; applyView() }
                    return true
                }
                stroke?.let { addSamples(ev, it) }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP, MotionEvent.ACTION_CANCEL -> {
                val pidd = ev.getPointerId(idx)
                if (ev.actionMasked == MotionEvent.ACTION_CANCEL) pointers.clear() else pointers.remove(pidd)
                if (pinch != null && touchPts().size < 2) pinch = null
                if (pan != null && (pan!![0].toInt() == pidd || ev.actionMasked != MotionEvent.ACTION_POINTER_UP)) pan = null
                if (stroke?.pointerId == pidd || (ev.actionMasked == MotionEvent.ACTION_CANCEL && stroke != null)) endStroke(true)
            }
        }
        return true
    }

    private fun announceBusy() { if (busy) announce("Just a moment…") }

    /** Mouse wheel / trackpad: scroll pans, ctrl+scroll zooms (like the website). */
    fun onScroll(dx: Float, dy: Float, x: Float, y: Float, ctrl: Boolean) {
        if (status != "ready") return
        if (ctrl) zoomBy(exp(-dy * 0.25f), x, y) else { tx -= dx * 40; ty -= dy * 40; autoFit = false; applyView() }
    }

    // ---------- edits ----------
    private fun rerender(layerIds: List<String>) {
        val p = project ?: return
        val st = stack ?: return
        if (layerIds.isEmpty()) { st.prune(); frame++; return }
        busy = true
        scope.launch {
            withContext(renderDispatcher) { for (id in layerIds) ProjectOps.layerById(p, id)?.let { st.renderLayer(it) }; st.prune() }
            busy = false; frame++
        }
    }

    fun afterChange(ch: Change?) {
        if (ch == null) return
        rerender(ch.layers)
        markDirty(); ver++; frame++
    }

    val canUndo get() = (project?.undo?.size ?: 0) > 0
    val canRedo get() = (project?.redo?.size ?: 0) > 0

    fun undo() { if (stroke != null || busy) return; val p = project ?: return; ProjectOps.undo(p)?.let { afterChange(it); announce("Undone") } }
    fun redo() { if (stroke != null || busy) return; val p = project ?: return; ProjectOps.redo(p)?.let { afterChange(it); announce("Redone") } }

    fun layerAction(fn: (Project) -> Unit) { val p = project ?: return; if (busy) return; fn(p); afterChange(Change(emptyList(), true)) }

    fun selectLayer(id: String) { val p = project ?: return; p.active = id; ver++; frame++; announce("Drawing on ${ProjectOps.layerById(p, id)?.name}") }

    fun changePaper(paper: String) {
        val p = project ?: return
        val st = stack ?: return
        if (busy) return
        p.paper = paper
        busy = true
        scope.launch { withContext(renderDispatcher) { st.renderAll() }; busy = false; frame++ }
        markDirty(); ver++
    }

    fun setPalettes(list: List<com.maheshglance.wonderlab.feature.art.engine.Palette>) {
        project?.palettes = list
        PalettePrefs.write(app, list)
        markDirty(); ver++
    }

    fun rename(t: String) { title = t.trim().take(60); dirty = true; saveSoon(0) }

    // ---------- saving ----------
    private var dirty = false
    private var saving = false
    private var timer: Job? = null
    private var savedOnce = false

    fun markDirty() { dirty = true; saveSoon(1500) }

    private fun saveSoon(ms: Long) { timer?.cancel(); timer = scope.launch { delay(ms); saveNow() } }

    /** Snapshots long layers and keeps the JSON under the server's limit (bakes the heaviest layers if needed). */
    private fun prepare(p: Project, st: LayerStack) {
        fun webp(id: String) = st.rasterUrl(id, webp = true)
        var size = ProjectOps.serialize(p).length
        for (l in p.layers) {
            if (!ProjectOps.wantsSnapshot(l)) continue
            val url = webp(l.id)
            val old = l.snap?.url?.length ?: 0
            if (size - old + url.length < ProjectOps.MAX_JSON * 0.8) { l.snap = com.maheshglance.wonderlab.feature.art.engine.Snap(l.ops.size, l.ops.last().id, url); size = size - old + url.length }
        }
        if (size <= ProjectOps.MAX_JSON) return
        val heavy = p.layers.filter { it.kind == "paint" }.sortedByDescending { l -> l.ops.sumOf { it.pts.size * 20 + 60 } + (l.snap?.url?.length ?: 0) }
        for (l in heavy) {
            ProjectOps.bakeLayer(p, l.id, webp(l.id))
            if (ProjectOps.serialize(p).length <= ProjectOps.MAX_JSON) return
        }
        ProjectOps.trimHistory(p, 10)
    }

    /** Serialises on the main thread (consistent snapshot), writes on IO. Returns when stored. */
    suspend fun saveNow() {
        val p = project ?: return
        val st = stack ?: return
        if (!dirty) return
        if (stroke != null || saving || busy) { saveSoon(800); return }
        saving = true
        dirty = false
        local = "saving"
        try {
            prepare(p, st)
            p.ui = ToolState(brush, color, size, opacity)
            val json = ProjectOps.serialize(p)
            val thumb = st.thumbnail()
            ArtStorage.store(app, pid, id, title, json, thumb, p.meta.kind, baseVersion)
            local = "saved"
            if (!savedOnce) { savedOnce = true; app.repo.award("art-first-artwork") }
        } catch (e: Exception) {
            dirty = true
            local = "error"
        } finally { saving = false }
    }

    fun retrySave() { dirty = true; scope.launch { saveNow() } }

    /** An offline edit clash: the server kept our version as a separate copy — keep working on that copy. */
    fun movedTo(copyId: String) { id = copyId; baseVersion = 1 }

    fun flattened() = stack?.flatten(true)

    fun dispose() {
        timer?.cancel()
        stroke = null
        stack?.dispose()
        stack = null
    }

    /** Called from keyboard shortcuts. */
    fun nudgeSize(up: Boolean) { size = if (up) min(200f, (size * 1.18f).toInt() + 1f) else max(1f, (size * 0.85f).toInt().toFloat()) }

}

/**
 * Quadratic smoothing of pointer samples (midpoint scheme): each new sample bends the path through the
 * previous one, so fast strokes come out as curves instead of polygons. The smoothed points are what get
 * stored, so the website replays exactly the same stroke.
 */
class StrokeSmoother {
    private var b: FloatArray? = null // previous raw sample
    private var m: FloatArray? = null // previous midpoint (start of the next curve)

    fun add(p: FloatArray): List<FloatArray> {
        val prev = b
        if (prev == null) { b = p; m = p; return listOf(q(p)) }
        val start = m!!
        val mid = FloatArray(4) { (prev[it] + p[it]) / 2 }
        val out = curve(start, prev, mid)
        m = mid; b = p
        return out
    }

    fun finish(): List<FloatArray> {
        val last = b ?: return emptyList()
        val start = m ?: return emptyList()
        b = null; m = null
        if (hypot(last[0] - start[0], last[1] - start[1]) < 0.05f) return emptyList()
        return listOf(q(last))
    }

    private fun curve(a: FloatArray, c: FloatArray, e: FloatArray): List<FloatArray> {
        val len = hypot(c[0] - a[0], c[1] - a[1]) + hypot(e[0] - c[0], e[1] - c[1])
        val steps = min(16, max(1, ceil(len / 6f).toInt()))
        return List(steps) { k ->
            val t = (k + 1).toFloat() / steps; val u = 1 - t
            q(FloatArray(4) { i -> u * u * a[i] + 2 * u * t * c[i] + t * t * e[i] })
        }
    }

    private fun q(p: FloatArray) = ProjectOps.qpt(p[0], p[1], p[2], p[3])
}
