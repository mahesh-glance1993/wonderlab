package com.maheshglance.wonderlab.feature.art.engine

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RadialGradient
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Shader
import android.os.Build
import android.util.Base64
import java.io.ByteArrayOutputStream
import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

/*
 * Native renderer — a port of the website's engine/render.ts onto android.graphics:
 * one Bitmap per layer, a stroke buffer, and deterministic replay of ops. The same StrokePainter is
 * used live (points streamed in as the finger/pen moves) and when replaying a saved project.
 */

private val DST_OUT = PorterDuffXfermode(PorterDuff.Mode.DST_OUT)
private val CLEAR = PorterDuffXfermode(PorterDuff.Mode.CLEAR)

object ArtImages {
    /** Decodes a data: URL (png/webp/jpeg) to a Bitmap. */
    fun decodeDataUrl(url: String): Bitmap? = runCatching {
        val comma = url.indexOf(',')
        if (!url.startsWith("data:") || comma < 0) return null
        val bytes = Base64.decode(url.substring(comma + 1), Base64.DEFAULT)
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
    }.getOrNull()

    fun dataUrl(bmp: Bitmap, format: String, quality: Int): String {
        val out = ByteArrayOutputStream()
        val (fmt, mime) = when (format) {
            "jpeg" -> Bitmap.CompressFormat.JPEG to "image/jpeg"
            "webp" -> (if (Build.VERSION.SDK_INT >= 30) Bitmap.CompressFormat.WEBP_LOSSY else @Suppress("DEPRECATION") Bitmap.CompressFormat.WEBP) to "image/webp"
            else -> Bitmap.CompressFormat.PNG to "image/png"
        }
        bmp.compress(fmt, quality, out)
        return "data:$mime;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
    }
}

class StrokePainter(private val st: LayerStack, layer: Bitmap, val op: Op) {
    private var last: FloatArray? = null
    private var carry = 0f
    private val rnd = Mulberry32(op.seed)
    private var n = 0
    private var dir = 0.0
    private val def = Brushes.def(op.brush)
    private val base: FloatArray = (ArtColor.parseHex(def.fixedColor ?: op.color) ?: intArrayOf(0, 0, 0)).let { floatArrayOf(it[0].toFloat(), it[1].toFloat(), it[2].toFloat()) }
    private var cur = base.copyOf()
    private val layerBmp = layer
    private val lc = Canvas(layer)
    private val bc = Canvas(st.buffer)
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    val bbox = floatArrayOf(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY, Float.NEGATIVE_INFINITY)

    /** Alpha to show the live buffer with, approximating the final composite. */
    val previewAlpha get() = def.strokeAlpha * op.opacity * (if (op.brush == "watercolor") 0.55f else 1f)
    val usesBuffer get() = def.target == BrushTarget.Buffer
    private val baseInt get() = Color.rgb(base[0].roundToInt(), base[1].roundToInt(), base[2].roundToInt())

    fun add(pts: List<FloatArray>) {
        for (p in pts) {
            val a = last
            if (a == null) { dab(p); last = p; carry = spacing(p); continue }
            val dx = p[0] - a[0]; val dy = p[1] - a[1]; val len = hypot(dx, dy)
            if (len < 1e-6f) continue
            dir = atan2(dy.toDouble(), dx.toDouble())
            var pos = carry
            while (pos <= len) {
                val t = pos / len
                val q = floatArrayOf(a[0] + dx * t, a[1] + dy * t, a[2] + (p[2] - a[2]) * t, a[3] + (p[3] - a[3]) * t)
                dab(q)
                pos += spacing(q)
            }
            carry = pos - len
            last = p
        }
    }

    private fun spacing(p: FloatArray) = Brushes.dabSpacing(op.brush, Brushes.dabParams(op.brush, op.size, p[2], p[3]).radius)
    private fun grow(x: Float, y: Float, r: Float) {
        bbox[0] = min(bbox[0], x - r); bbox[1] = min(bbox[1], y - r); bbox[2] = max(bbox[2], x + r); bbox[3] = max(bbox[3], y + r)
    }
    private fun rf() = rnd.next().toFloat()
    private fun circle(c: Canvas, x: Float, y: Float, r: Float) = c.drawCircle(x, y, max(0.3f, r), paint)

    private fun dab(q: FloatArray) {
        val x = q[0]; val y = q[1]
        val d = Brushes.dabParams(op.brush, op.size, q[2], q[3])
        val r = d.radius
        n++
        grow(x, y, r + 3)
        paint.reset(); paint.isAntiAlias = true
        when (op.brush) {
            "graphite", "colorPencil", "crayon" -> {
                val jx = (rf() - 0.5f) * r * 0.25f; val jy = (rf() - 0.5f) * r * 0.25f
                paint.alpha = (d.alpha * 255).roundToInt().coerceIn(0, 255)
                paint.shader = st.grainShader(base, d.coverage, if (op.brush == "crayon") 0.05f else 0.22f)
                circle(bc, x + jx, y + jy, r)
            }
            "marker", "ink", "watercolor" -> { paint.color = baseInt; circle(bc, x, y, r) }
            "airbrush" -> {
                paint.alpha = (d.alpha * 255).roundToInt().coerceIn(0, 255)
                paint.isFilterBitmap = true
                bc.drawBitmap(st.softSprite(baseInt), null, RectF(x - r, y - r, x + r, y + r), paint)
                paint.reset(); paint.isAntiAlias = true
                paint.color = baseInt; paint.alpha = (min(1f, d.alpha * 3) * 255).roundToInt()
                repeat(3) {
                    val a = rf() * PI.toFloat() * 2; val rr = r * sqrt(rf()) * 0.9f
                    val px = x + cos(a) * rr; val py = y + sin(a) * rr
                    bc.drawRect(px, py, px + 1.3f, py + 1.3f, paint)
                }
            }
            "oil" -> {
                if (n % 4 == 1) { // pick up wet paint just ahead of the brush
                    val sx = (x + cos(dir) * r * 0.9).roundToInt(); val sy = (y + sin(dir) * r * 0.9).roundToInt()
                    if (sx >= 0 && sy >= 0 && sx < st.w && sy < st.h) {
                        val px = layerBmp.getPixel(sx, sy); val pa = px ushr 24
                        if (pa > 30) cur = ArtColor.mix(cur, floatArrayOf(((px shr 16) and 255).toFloat(), ((px shr 8) and 255).toFloat(), (px and 255).toFloat()), 0.2f * (pa / 255f))
                    }
                }
                cur = ArtColor.mix(cur, base, 0.06f)
                paint.color = Color.rgb(cur[0].roundToInt().coerceIn(0, 255), cur[1].roundToInt().coerceIn(0, 255), cur[2].roundToInt().coerceIn(0, 255))
                paint.alpha = (d.alpha * op.opacity * 255).roundToInt().coerceIn(0, 255)
                circle(lc, x, y, r)
                val nx = -sin(dir).toFloat(); val ny = cos(dir).toFloat(); val tx = cos(dir).toFloat(); val ty = sin(dir).toFloat()
                paint.style = Paint.Style.STROKE; paint.strokeWidth = max(1f, r * 0.12f); paint.strokeCap = Paint.Cap.ROUND
                repeat(3) {
                    val off = (rf() * 2 - 1) * r * 0.8f
                    val sc = ArtColor.shade(cur, (rf() - 0.5f) * 0.3f)
                    paint.color = Color.rgb(sc[0].roundToInt().coerceIn(0, 255), sc[1].roundToInt().coerceIn(0, 255), sc[2].roundToInt().coerceIn(0, 255))
                    paint.alpha = (0.28f * op.opacity * 255).roundToInt().coerceIn(0, 255)
                    lc.drawLine(x + nx * off - tx * r * 0.5f, y + ny * off - ty * r * 0.5f, x + nx * off + tx * r * 0.5f, y + ny * off + ty * r * 0.5f, paint)
                }
            }
            "eraser" -> {
                paint.xfermode = DST_OUT; paint.color = Color.BLACK
                paint.alpha = (op.opacity * 255).roundToInt().coerceIn(0, 255)
                circle(lc, x, y, r)
            }
        }
    }

    /** Composite the buffer into the layer and clear it. */
    fun finish() {
        if (!usesBuffer || bbox[0] == Float.POSITIVE_INFINITY) return
        val W = st.w; val H = st.h
        val x0 = max(0, floor(bbox[0]).toInt()); val y0 = max(0, floor(bbox[1]).toInt())
        val x1 = min(W, ceil(bbox[2]).toInt()); val y1 = min(H, ceil(bbox[3]).toInt())
        val w = x1 - x0; val h = y1 - y0
        if (w <= 0 || h <= 0) { st.clearBuffer(); return }
        val p = Paint(Paint.ANTI_ALIAS_FLAG)
        if (op.brush == "watercolor") {
            // wet edge: subtract a blurred copy so the middle of the wash gets lighter than its rim
            val k = op.size / 8f
            val kk = max(3f, min(18f, k))
            val pad = ceil(kk * 2).toInt()
            val bx0 = max(0, x0 - pad); val by0 = max(0, y0 - pad)
            val bw = min(W, x1 + pad) - bx0; val bh = min(H, y1 + pad) - by0
            val blur = st.blurRegion(bx0, by0, bw, bh, kk)
            if (blur != null) {
                p.xfermode = DST_OUT; p.alpha = (0.65f * 255).roundToInt(); p.isFilterBitmap = true
                bc.drawBitmap(blur, null, Rect(bx0, by0, bx0 + bw, by0 + bh), p)
                blur.recycle()
            }
            // granulation: pigment settles in the paper's valleys
            val g = Paint(); g.xfermode = DST_OUT; g.alpha = (0.3f * 255).roundToInt()
            g.shader = st.grainShader(floatArrayOf(0f, 0f, 0f), 0.45f, 0.3f)
            bc.drawRect(x0.toFloat(), y0.toFloat(), x1.toFloat(), y1.toFloat(), g)
        }
        val lp = Paint(); lp.alpha = (def.strokeAlpha * op.opacity * 255).roundToInt().coerceIn(0, 255)
        val r = Rect(x0, y0, x1, y1)
        lc.drawBitmap(st.buffer, r, r, lp)
        st.clearBuffer(r)
    }

    /** Throw the stroke away (e.g. a pinch started). Direct brushes need the layer re-rendered. */
    fun cancel() = st.clearBuffer()
}

class LayerStack(val project: Project, private val templateFor: (TemplateRef) -> DrawList?) {
    val bitmaps = HashMap<String, Bitmap>()
    val buffer: Bitmap = Bitmap.createBitmap(project.w, project.h, Bitmap.Config.ARGB_8888)
    var templateMask: ByteArray? = null
    private class Checkpoint(val layer: String, val n: Int, val opId: String, val bmp: Bitmap)
    private val checkpoints = ArrayList<Checkpoint>()
    private val images = object : LinkedHashMap<String, Bitmap>(4, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, Bitmap>?): Boolean {
            if (size > 3) { eldest?.value?.recycle(); return true }
            return false
        }
    }
    @Volatile var disposed = false; private set

    companion object {
        const val CHECK_EVERY = 8
        const val MAX_CHECKPOINTS = 4 // ~8 MB each at 1600×1200; oldest are evicted
    }

    val w get() = project.w
    val h get() = project.h

    fun bitmap(id: String): Bitmap = bitmaps.getOrPut(id) { Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888) }

    fun clearBuffer(r: Rect? = null) {
        if (r == null) buffer.eraseColor(Color.TRANSPARENT)
        else Canvas(buffer).drawRect(r, Paint().apply { xfermode = CLEAR })
    }

    // ---------- shaders & sprites ----------
    private val shaderCache = HashMap<String, Shader>()
    fun grainShader(c: FloatArray, coverage: Float, softness: Float): Shader {
        val r = c[0].roundToInt(); val g = c[1].roundToInt(); val b = c[2].roundToInt()
        val key = "${project.paper}|$r,$g,$b|${(coverage * 16).roundToInt()}|$softness"
        return shaderCache.getOrPut(key) { Paper.grainShader(project.paper, r, g, b, coverage, softness) }.also { if (shaderCache.size > 64) shaderCache.clear() }
    }

    private val sprites = HashMap<Int, Bitmap>()
    fun softSprite(color: Int): Bitmap = sprites.getOrPut(color) {
        val bmp = Bitmap.createBitmap(64, 64, Bitmap.Config.ARGB_8888)
        val p = Paint(Paint.ANTI_ALIAS_FLAG)
        val c0 = color or (0xFF shl 24); val c1 = (color and 0xFFFFFF) or (140 shl 24); val c2 = color and 0xFFFFFF
        p.shader = RadialGradient(32f, 32f, 32f, intArrayOf(c0, c1, c2), floatArrayOf(0f, 0.5f, 1f), Shader.TileMode.CLAMP)
        Canvas(bmp).drawRect(0f, 0f, 64f, 64f, p)
        if (sprites.size > 32) { sprites.values.forEach { it.recycle() }; sprites.clear() }
        bmp
    }

    /** Alpha-only blur of a buffer region (downscale → box blur ×2 → upscale), for watercolour wet edges. */
    fun blurRegion(x: Int, y: Int, bw: Int, bh: Int, k: Float): Bitmap? {
        if (bw <= 0 || bh <= 0) return null
        val f = max(1f, k / 2f)
        val sw = max(1, ceil(bw / f).toInt()); val sh = max(1, ceil(bh / f).toInt())
        val small = Bitmap.createBitmap(sw, sh, Bitmap.Config.ARGB_8888)
        Canvas(small).drawBitmap(buffer, Rect(x, y, x + bw, y + bh), Rect(0, 0, sw, sh), Paint(Paint.FILTER_BITMAP_FLAG))
        val px = IntArray(sw * sh)
        small.getPixels(px, 0, sw, 0, 0, sw, sh)
        var a = IntArray(sw * sh) { px[it] ushr 24 }
        repeat(2) { a = boxBlur(a, sw, sh, 2) }
        for (i in px.indices) px[i] = a[i] shl 24
        small.setPixels(px, 0, sw, 0, 0, sw, sh)
        return small
    }

    private fun boxBlur(src: IntArray, w: Int, h: Int, r: Int): IntArray {
        val tmp = IntArray(w * h); val out = IntArray(w * h)
        val n = 2 * r + 1
        for (y in 0 until h) {
            var sum = 0
            for (k in -r..r) sum += src[y * w + k.coerceIn(0, w - 1)]
            for (x in 0 until w) {
                tmp[y * w + x] = sum / n
                sum += src[y * w + (x + r + 1).coerceAtMost(w - 1)] - src[y * w + (x - r).coerceAtLeast(0)]
            }
        }
        for (x in 0 until w) {
            var sum = 0
            for (k in -r..r) sum += tmp[k.coerceIn(0, h - 1) * w + x]
            for (y in 0 until h) {
                out[y * w + x] = sum / n
                sum += tmp[(y + r + 1).coerceAtMost(h - 1) * w + x] - tmp[(y - r).coerceAtLeast(0) * w + x]
            }
        }
        return out
    }

    // ---------- paper ----------
    private fun paperTint() = if (project.paper == "kraft") floatArrayOf(90f, 60f, 30f) else floatArrayOf(120f, 110f, 95f)

    /** Paper colour + subtle shading of the paper tooth, into the rectangle (0, 0, w, h) of `c`'s current space. */
    fun drawPaper(c: Canvas) {
        c.drawColor(ArtColor.argb(Paper.COLORS[project.paper] ?: "#ffffff"))
        if (project.paper != "smooth") {
            val p = Paint()
            p.shader = grainShader(paperTint(), 0.55f, 0.45f)
            p.alpha = ((if (project.paper == "kraft") 0.18f else 0.12f) * 255).roundToInt()
            c.drawRect(0f, 0f, w.toFloat(), h.toFloat(), p)
        }
    }

    private fun paperPixel(x: Int, y: Int): FloatArray {
        val base = ArtColor.parseHex(Paper.COLORS[project.paper]) ?: intArrayOf(255, 255, 255)
        val out = floatArrayOf(base[0].toFloat(), base[1].toFloat(), base[2].toFloat())
        if (project.paper == "smooth") return out
        val g = Paper.grainTile(project.paper)[(y % Paper.GRAIN) * Paper.GRAIN + (x % Paper.GRAIN)]
        val a = Paper.grainAlpha(g, (0.55f * 16).roundToInt() / 16f, 0.45f) / 255f * (if (project.paper == "kraft") 0.18f else 0.12f)
        val t = paperTint()
        return floatArrayOf(out[0] * (1 - a) + t[0] * a, out[1] * (1 - a) + t[1] * a, out[2] * (1 - a) + t[2] * a)
    }

    // ---------- rendering ----------
    private fun image(url: String): Bitmap? = images[url] ?: ArtImages.decodeDataUrl(url)?.also { images[url] = it }

    fun renderLayer(l: Layer) {
        if (disposed) return
        val bmp = bitmap(l.id)
        val c = Canvas(bmp)
        bmp.eraseColor(Color.TRANSPARENT)
        if (l.kind == "template") {
            val dl = l.template?.let { templateFor(it) }
            if (dl != null && l.template != null) Templates.draw(c, l.template.id, dl, w * 0.02f, h * 0.02f, w * 0.96f, h * 0.96f)
            val px = IntArray(w * h)
            bmp.getPixels(px, 0, w, 0, 0, w, h)
            templateMask = FloodFill.dilate(FloodFill.outlineMask(px), w, h, 1)
            return
        }
        // forget checkpoints from a different branch of history
        checkpoints.removeAll { cp -> (cp.layer == l.id && cp.n <= l.ops.size && l.ops.getOrNull(cp.n - 1)?.id != cp.opId).also { if (it) cp.bmp.recycle() } }
        val best = checkpoints.filter { it.layer == l.id && it.n <= l.ops.size }.maxByOrNull { it.n }
        val plan = ProjectOps.replayPlan(l)
        val start: Int
        if (best != null && best.n >= plan.start) {
            c.drawBitmap(best.bmp, 0f, 0f, null)
            start = best.n
        } else {
            plan.url?.let { u -> image(u)?.let { img -> c.drawBitmap(img, null, Rect(0, 0, w, h), Paint(Paint.FILTER_BITMAP_FLAG)) } }
            start = plan.start
        }
        for (i in start until l.ops.size) {
            if (disposed) return
            applyOp(l, l.ops[i])
            if (l.ops.size - i <= CHECK_EVERY * 3) checkpoint(l, i + 1)
        }
    }

    /** Call after an op was committed to a layer (live drawing). */
    fun committed(l: Layer) = checkpoint(l, l.ops.size)

    private fun checkpoint(l: Layer, n: Int) {
        if (n == 0 || n % CHECK_EVERY != 0 || l.kind != "paint") return
        val opId = l.ops[n - 1].id
        if (checkpoints.any { it.layer == l.id && it.n == n && it.opId == opId }) return
        val reuse = if (checkpoints.size >= MAX_CHECKPOINTS) checkpoints.removeAt(0).bmp else Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        reuse.eraseColor(Color.TRANSPARENT)
        Canvas(reuse).drawBitmap(bitmap(l.id), 0f, 0f, null)
        checkpoints.add(Checkpoint(l.id, n, opId, reuse))
    }

    fun renderAll() {
        // templates first: fills in paint layers use the outline as their boundary
        val order = project.layers.sortedBy { if (it.kind == "template") 0 else 1 }
        if (order.none { it.kind == "template" }) templateMask = null
        for (l in order) renderLayer(l)
        val ids = project.layers.map { it.id }.toSet()
        bitmaps.keys.filter { it !in ids }.forEach { bitmaps.remove(it)?.recycle() }
    }

    /** Drops bitmaps of layers that no longer exist (after a structure change). */
    fun prune() {
        val ids = project.layers.map { it.id }.toSet()
        bitmaps.keys.filter { it !in ids }.forEach { bitmaps.remove(it)?.recycle() }
    }

    fun applyOp(l: Layer, op: Op) {
        val bmp = bitmap(l.id)
        when (op.t) {
            "stroke" -> { val sp = StrokePainter(this, bmp, op); sp.add(op.pts); sp.finish() }
            "fill" -> fill(bmp, op)
            "clear" -> bmp.eraseColor(Color.TRANSPARENT)
        }
    }

    fun painter(layerId: String, op: Op) = StrokePainter(this, bitmap(layerId), op)

    /** Bounded bucket fill on a paint layer (outline layer = boundary). Returns filled pixel count. */
    fun fill(bmp: Bitmap, op: Op): Int {
        val px = IntArray(w * h)
        bmp.getPixels(px, 0, w, 0, 0, w, h)
        val c = ArtColor.parseHex(op.color) ?: intArrayOf(0, 0, 0)
        val mask = templateMask
        val n = FloodFill.fill(px, w, h, op.x, op.y, Color.argb(255, c[0], c[1], c[2]), op.tol, mask, if (mask != null) 2 else 0)
        if (n > 0) bmp.setPixels(px, 0, w, 0, 0, w, h)
        return n
    }

    fun onOutline(x: Float, y: Float): Boolean {
        val m = templateMask ?: return false
        val xi = floor(x).toInt(); val yi = floor(y).toInt()
        if (xi < 0 || yi < 0 || xi >= w || yi >= h) return false
        return m[yi * w + xi].toInt() == 1
    }

    /** Draws the picture (paper + visible layers) into `c` at document scale. `live` adds the stroke buffer above the active layer. */
    fun drawInto(c: Canvas, withPaper: Boolean = true, live: StrokePainter? = null, filter: Boolean = true) {
        if (withPaper) drawPaper(c)
        val lp = Paint().apply { isFilterBitmap = filter }
        for (l in project.layers) {
            if (l.visible) bitmaps[l.id]?.takeIf { !it.isRecycled }?.let { c.drawBitmap(it, 0f, 0f, lp) }
            if (live != null && l.id == project.active) {
                val bp = Paint().apply { isFilterBitmap = filter; alpha = (live.previewAlpha * 255).roundToInt().coerceIn(0, 255) }
                c.drawBitmap(buffer, 0f, 0f, bp)
            }
        }
    }

    fun flatten(withPaper: Boolean = true): Bitmap {
        val out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        drawInto(Canvas(out), withPaper)
        return out
    }

    fun thumbnail(max: Int = 320): String {
        val s = min(1f, max.toFloat() / max(w, h))
        val tw = max(1, (w * s).roundToInt()); val th = max(1, (h * s).roundToInt())
        val t = Bitmap.createBitmap(tw, th, Bitmap.Config.ARGB_8888)
        val c = Canvas(t)
        c.scale(tw.toFloat() / w, th.toFloat() / h)
        drawInto(c, true)
        return ArtImages.dataUrl(t, "jpeg", 72).also { t.recycle() }
    }

    /** Colour under a point on the visible picture (eyedropper). */
    fun pick(xf: Float, yf: Float): String {
        val x = floor(xf).toInt(); val y = floor(yf).toInt()
        if (x < 0 || y < 0 || x >= w || y >= h) return "#000000"
        var out = paperPixel(x, y)
        for (l in project.layers) {
            if (!l.visible) continue
            val px = bitmaps[l.id]?.getPixel(x, y) ?: continue
            val a = (px ushr 24) / 255f
            out = floatArrayOf(out[0] * (1 - a) + ((px shr 16) and 255) * a, out[1] * (1 - a) + ((px shr 8) and 255) * a, out[2] * (1 - a) + (px and 255) * a)
        }
        return ArtColor.toHex(out[0], out[1], out[2])
    }

    fun rasterUrl(id: String, webp: Boolean = false): String = ArtImages.dataUrl(bitmap(id), if (webp) "webp" else "png", if (webp) 92 else 100)

    fun dispose() {
        disposed = true
        bitmaps.values.forEach { it.recycle() }; bitmaps.clear()
        checkpoints.forEach { it.bmp.recycle() }; checkpoints.clear()
        images.values.forEach { it.recycle() }; images.clear()
        sprites.values.forEach { it.recycle() }; sprites.clear()
        buffer.recycle()
    }
}
