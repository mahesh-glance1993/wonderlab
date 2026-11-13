package com.maheshglance.wonderlab.feature.art.engine

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.PaintingStyle
import androidx.compose.ui.graphics.RadialGradientShader
import androidx.compose.ui.graphics.Shader
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.TileMode
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import kotlin.concurrent.Volatile
import kotlin.io.encoding.Base64
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
 * Native renderer — a port of the website's engine/render.ts onto Compose Multiplatform graphics:
 * one bitmap per layer, a stroke buffer, and deterministic replay of ops. The same StrokePainter is
 * used live (points streamed in as the finger/pen moves) and when replaying a saved project.
 */

private val B64 = Base64.Default.withPadding(Base64.PaddingOption.PRESENT_OPTIONAL)
private val WHITESPACE = Regex("\\s+")

/** Resets a reused Paint to the defaults of a fresh anti-aliased Paint. */
internal fun Paint.resetArt(): Paint {
    alpha = 1f; color = Color.Black; blendMode = BlendMode.SrcOver; style = PaintingStyle.Fill
    strokeWidth = 0f; strokeCap = StrokeCap.Butt; strokeJoin = StrokeJoin.Miter
    shader = null; colorFilter = null; pathEffect = null; isAntiAlias = true; filterQuality = FilterQuality.None
    return this
}

/** A fresh Paint (bitmap filtering off unless asked, like android.graphics.Paint()). */
internal fun artPaint(filter: Boolean = false) = Paint().apply { filterQuality = if (filter) FilterQuality.Low else FilterQuality.None }

private fun alpha255(a: Int) = a.coerceIn(0, 255) / 255f

object ArtImages {
    /** Decodes a data: URL (png/webp/jpeg) to a bitmap. */
    fun decodeDataUrl(url: String): ImageBitmap? = runCatching {
        val comma = url.indexOf(',')
        if (!url.startsWith("data:") || comma < 0) return null
        decodeArtImage(B64.decode(url.substring(comma + 1).replace(WHITESPACE, "")))
    }.getOrNull()

    fun dataUrl(bmp: ImageBitmap, format: String, quality: Int): String {
        val mime = when (format) { "jpeg" -> "image/jpeg"; "webp" -> "image/webp"; else -> "image/png" }
        return "data:$mime;base64," + Base64.Default.encode(encodeArtImage(bmp, format, quality))
    }
}

class StrokePainter(private val st: LayerStack, layer: ImageBitmap, val op: Op) {
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
    private val paint = artPaint()
    val bbox = floatArrayOf(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY, Float.NEGATIVE_INFINITY)

    /** Alpha to show the live buffer with, approximating the final composite. */
    val previewAlpha get() = def.strokeAlpha * op.opacity * (if (op.brush == "watercolor") 0.55f else 1f)
    val usesBuffer get() = def.target == BrushTarget.Buffer
    private val baseInt get() = rgb(base[0].roundToInt(), base[1].roundToInt(), base[2].roundToInt())
    private fun rgb(r: Int, g: Int, b: Int) = (0xFF shl 24) or (r shl 16) or (g shl 8) or b

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
    private fun circle(c: Canvas, x: Float, y: Float, r: Float) = c.drawCircle(Offset(x, y), max(0.3f, r), paint)

    private fun dab(q: FloatArray) {
        val x = q[0]; val y = q[1]
        val d = Brushes.dabParams(op.brush, op.size, q[2], q[3])
        val r = d.radius
        n++
        grow(x, y, r + 3)
        paint.resetArt()
        when (op.brush) {
            "graphite", "colorPencil", "crayon" -> {
                val jx = (rf() - 0.5f) * r * 0.25f; val jy = (rf() - 0.5f) * r * 0.25f
                paint.alpha = alpha255((d.alpha * 255).roundToInt())
                paint.shader = st.grainShader(base, d.coverage, if (op.brush == "crayon") 0.05f else 0.22f)
                circle(bc, x + jx, y + jy, r)
            }
            "marker", "ink", "watercolor" -> { paint.color = Color(baseInt); circle(bc, x, y, r) }
            "airbrush" -> {
                paint.alpha = alpha255((d.alpha * 255).roundToInt())
                paint.filterQuality = FilterQuality.Low
                val sprite = st.softSprite(baseInt)
                bc.save(); bc.translate(x - r, y - r); bc.scale(2 * r / sprite.width, 2 * r / sprite.height)
                bc.drawImage(sprite, Offset.Zero, paint)
                bc.restore()
                paint.resetArt()
                paint.color = Color(baseInt); paint.alpha = alpha255((min(1f, d.alpha * 3) * 255).roundToInt())
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
                        val px = layerBmp.pixel(sx, sy); val pa = px ushr 24
                        if (pa > 30) cur = ArtColor.mix(cur, floatArrayOf(((px shr 16) and 255).toFloat(), ((px shr 8) and 255).toFloat(), (px and 255).toFloat()), 0.2f * (pa / 255f))
                    }
                }
                cur = ArtColor.mix(cur, base, 0.06f)
                paint.color = Color(rgb(cur[0].roundToInt().coerceIn(0, 255), cur[1].roundToInt().coerceIn(0, 255), cur[2].roundToInt().coerceIn(0, 255)))
                paint.alpha = alpha255((d.alpha * op.opacity * 255).roundToInt())
                circle(lc, x, y, r)
                val nx = -sin(dir).toFloat(); val ny = cos(dir).toFloat(); val tx = cos(dir).toFloat(); val ty = sin(dir).toFloat()
                paint.style = PaintingStyle.Stroke; paint.strokeWidth = max(1f, r * 0.12f); paint.strokeCap = StrokeCap.Round
                repeat(3) {
                    val off = (rf() * 2 - 1) * r * 0.8f
                    val sc = ArtColor.shade(cur, (rf() - 0.5f) * 0.3f)
                    paint.color = Color(rgb(sc[0].roundToInt().coerceIn(0, 255), sc[1].roundToInt().coerceIn(0, 255), sc[2].roundToInt().coerceIn(0, 255)))
                    paint.alpha = alpha255((0.28f * op.opacity * 255).roundToInt())
                    lc.drawLine(
                        Offset(x + nx * off - tx * r * 0.5f, y + ny * off - ty * r * 0.5f),
                        Offset(x + nx * off + tx * r * 0.5f, y + ny * off + ty * r * 0.5f), paint,
                    )
                }
            }
            "eraser" -> {
                paint.blendMode = BlendMode.DstOut; paint.color = Color.Black
                paint.alpha = alpha255((op.opacity * 255).roundToInt())
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
        if (op.brush == "watercolor") {
            // wet edge: subtract a blurred copy so the middle of the wash gets lighter than its rim
            val k = op.size / 8f
            val kk = max(3f, min(18f, k))
            val pad = ceil(kk * 2).toInt()
            val bx0 = max(0, x0 - pad); val by0 = max(0, y0 - pad)
            val bw = min(W, x1 + pad) - bx0; val bh = min(H, y1 + pad) - by0
            val blur = st.blurRegion(bx0, by0, bw, bh, kk)
            if (blur != null) {
                val p = artPaint(filter = true)
                p.blendMode = BlendMode.DstOut; p.alpha = alpha255((0.65f * 255).roundToInt())
                bc.drawImageRect(blur, IntOffset.Zero, IntSize(blur.width, blur.height), IntOffset(bx0, by0), IntSize(bw, bh), p)
                blur.release()
            }
            // granulation: pigment settles in the paper's valleys
            val g = artPaint(); g.blendMode = BlendMode.DstOut; g.alpha = alpha255((0.3f * 255).roundToInt())
            g.shader = st.grainShader(floatArrayOf(0f, 0f, 0f), 0.45f, 0.3f)
            bc.drawRect(x0.toFloat(), y0.toFloat(), x1.toFloat(), y1.toFloat(), g)
        }
        val lp = artPaint(); lp.alpha = alpha255((def.strokeAlpha * op.opacity * 255).roundToInt())
        lc.drawImageRect(st.buffer, IntOffset(x0, y0), IntSize(w, h), IntOffset(x0, y0), IntSize(w, h), lp)
        st.clearBuffer(x0, y0, x1, y1)
    }

    /** Throw the stroke away (e.g. a pinch started). Direct brushes need the layer re-rendered. */
    fun cancel() = st.clearBuffer()
}

class LayerStack(val project: Project, private val templateFor: (TemplateRef) -> DrawList?) {
    val bitmaps = HashMap<String, ImageBitmap>()
    val buffer: ImageBitmap = ImageBitmap(project.w, project.h)
    var templateMask: ByteArray? = null
    private class Checkpoint(val layer: String, val n: Int, val opId: String, val bmp: ImageBitmap)
    private val checkpoints = ArrayList<Checkpoint>()
    /** The last 3 decoded raster images, least recently used first. */
    private val images = LinkedHashMap<String, ImageBitmap>()
    @Volatile var disposed = false; private set

    companion object {
        const val CHECK_EVERY = 8
        const val MAX_CHECKPOINTS = 4 // ~8 MB each at 1600×1200; oldest are evicted
    }

    val w get() = project.w
    val h get() = project.h

    fun bitmap(id: String): ImageBitmap = bitmaps.getOrPut(id) { ImageBitmap(w, h) }

    fun clearBuffer() = buffer.erase()

    fun clearBuffer(x0: Int, y0: Int, x1: Int, y1: Int) {
        Canvas(buffer).drawRect(x0.toFloat(), y0.toFloat(), x1.toFloat(), y1.toFloat(), Paint().apply { blendMode = BlendMode.Clear })
    }

    // ---------- shaders & sprites ----------
    private val shaderCache = HashMap<String, Shader>()
    fun grainShader(c: FloatArray, coverage: Float, softness: Float): Shader {
        val r = c[0].roundToInt(); val g = c[1].roundToInt(); val b = c[2].roundToInt()
        val key = "${project.paper}|$r,$g,$b|${(coverage * 16).roundToInt()}|$softness"
        return shaderCache.getOrPut(key) { Paper.grainShader(project.paper, r, g, b, coverage, softness) }.also { if (shaderCache.size > 64) shaderCache.clear() }
    }

    private val sprites = HashMap<Int, ImageBitmap>()
    fun softSprite(color: Int): ImageBitmap = sprites.getOrPut(color) {
        val bmp = ImageBitmap(64, 64)
        val p = artPaint()
        val c0 = color or (0xFF shl 24); val c1 = (color and 0xFFFFFF) or (140 shl 24); val c2 = color and 0xFFFFFF
        p.shader = RadialGradientShader(Offset(32f, 32f), 32f, listOf(Color(c0), Color(c1), Color(c2)), listOf(0f, 0.5f, 1f), TileMode.Clamp)
        Canvas(bmp).drawRect(0f, 0f, 64f, 64f, p)
        if (sprites.size > 32) { sprites.values.forEach { it.release() }; sprites.clear() }
        bmp
    }

    /** Alpha-only blur of a buffer region (downscale → box blur ×2 → upscale), for watercolour wet edges. */
    fun blurRegion(x: Int, y: Int, bw: Int, bh: Int, k: Float): ImageBitmap? {
        if (bw <= 0 || bh <= 0) return null
        val f = max(1f, k / 2f)
        val sw = max(1, ceil(bw / f).toInt()); val sh = max(1, ceil(bh / f).toInt())
        val small = ImageBitmap(sw, sh)
        Canvas(small).drawImageRect(buffer, IntOffset(x, y), IntSize(bw, bh), IntOffset.Zero, IntSize(sw, sh), artPaint(filter = true))
        val px = small.pixels()
        var a = IntArray(sw * sh) { px[it] ushr 24 }
        repeat(2) { a = boxBlur(a, sw, sh, 2) }
        for (i in px.indices) px[i] = a[i] shl 24
        small.writePixels(px, 0, 0, sw, sh)
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
        c.drawRect(0f, 0f, w.toFloat(), h.toFloat(), artPaint().apply { color = Color(ArtColor.argb(Paper.COLORS[project.paper] ?: "#ffffff")) })
        if (project.paper != "smooth") {
            val p = artPaint()
            p.shader = grainShader(paperTint(), 0.55f, 0.45f)
            p.alpha = alpha255(((if (project.paper == "kraft") 0.18f else 0.12f) * 255).roundToInt())
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
    private fun image(url: String): ImageBitmap? {
        images.remove(url)?.let { images[url] = it; return it }
        val img = ArtImages.decodeDataUrl(url) ?: return null
        images[url] = img
        while (images.size > 3) images.remove(images.keys.first())?.release()
        return img
    }

    fun renderLayer(l: Layer) {
        if (disposed) return
        val bmp = bitmap(l.id)
        val c = Canvas(bmp)
        bmp.erase()
        if (l.kind == "template") {
            val dl = l.template?.let { templateFor(it) }
            if (dl != null && l.template != null) Templates.draw(c, l.template.id, dl, w * 0.02f, h * 0.02f, w * 0.96f, h * 0.96f)
            templateMask = FloodFill.dilate(FloodFill.outlineMask(bmp.pixels()), w, h, 1)
            return
        }
        // forget checkpoints from a different branch of history
        checkpoints.removeAll { cp -> (cp.layer == l.id && cp.n <= l.ops.size && l.ops.getOrNull(cp.n - 1)?.id != cp.opId).also { if (it) cp.bmp.release() } }
        val best = checkpoints.filter { it.layer == l.id && it.n <= l.ops.size }.maxByOrNull { it.n }
        val plan = ProjectOps.replayPlan(l)
        val start: Int
        if (best != null && best.n >= plan.start) {
            c.drawImage(best.bmp, Offset.Zero, artPaint())
            start = best.n
        } else {
            plan.url?.let { u ->
                image(u)?.let { img -> c.drawImageRect(img, IntOffset.Zero, IntSize(img.width, img.height), IntOffset.Zero, IntSize(w, h), artPaint(filter = true)) }
            }
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
        val reuse = if (checkpoints.size >= MAX_CHECKPOINTS) checkpoints.removeAt(0).bmp else ImageBitmap(w, h)
        reuse.erase()
        Canvas(reuse).drawImage(bitmap(l.id), Offset.Zero, artPaint())
        checkpoints.add(Checkpoint(l.id, n, opId, reuse))
    }

    fun renderAll() {
        // templates first: fills in paint layers use the outline as their boundary
        val order = project.layers.sortedBy { if (it.kind == "template") 0 else 1 }
        if (order.none { it.kind == "template" }) templateMask = null
        for (l in order) renderLayer(l)
        prune()
    }

    /** Drops bitmaps of layers that no longer exist (after a structure change). */
    fun prune() {
        val ids = project.layers.map { it.id }.toSet()
        bitmaps.keys.filter { it !in ids }.forEach { bitmaps.remove(it)?.release() }
    }

    fun applyOp(l: Layer, op: Op) {
        val bmp = bitmap(l.id)
        when (op.t) {
            "stroke" -> { val sp = StrokePainter(this, bmp, op); sp.add(op.pts); sp.finish() }
            "fill" -> fill(bmp, op)
            "clear" -> bmp.erase()
        }
    }

    fun painter(layerId: String, op: Op) = StrokePainter(this, bitmap(layerId), op)

    /** Bounded bucket fill on a paint layer (outline layer = boundary). Returns filled pixel count. */
    fun fill(bmp: ImageBitmap, op: Op): Int {
        val px = bmp.pixels()
        val c = ArtColor.parseHex(op.color) ?: intArrayOf(0, 0, 0)
        val mask = templateMask
        val n = FloodFill.fill(px, w, h, op.x, op.y, (0xFF shl 24) or (c[0] shl 16) or (c[1] shl 8) or c[2], op.tol, mask, if (mask != null) 2 else 0)
        if (n > 0) bmp.writePixels(px, 0, 0, w, h)
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
        val lp = artPaint(filter)
        for (l in project.layers) {
            if (l.visible) bitmaps[l.id]?.takeIf { !it.isReleased }?.let { c.drawImage(it, Offset.Zero, lp) }
            if (live != null && l.id == project.active) {
                val bp = artPaint(filter).apply { alpha = alpha255((live.previewAlpha * 255).roundToInt()) }
                c.drawImage(buffer, Offset.Zero, bp)
            }
        }
    }

    fun flatten(withPaper: Boolean = true): ImageBitmap {
        val out = ImageBitmap(w, h)
        drawInto(Canvas(out), withPaper)
        return out
    }

    fun thumbnail(max: Int = 320): String {
        val s = min(1f, max.toFloat() / max(w, h))
        val tw = max(1, (w * s).roundToInt()); val th = max(1, (h * s).roundToInt())
        val t = ImageBitmap(tw, th)
        val c = Canvas(t)
        c.scale(tw.toFloat() / w, th.toFloat() / h)
        drawInto(c, true)
        return ArtImages.dataUrl(t, "jpeg", 72).also { t.release() }
    }

    /** Colour under a point on the visible picture (eyedropper). */
    fun pick(xf: Float, yf: Float): String {
        val x = floor(xf).toInt(); val y = floor(yf).toInt()
        if (x < 0 || y < 0 || x >= w || y >= h) return "#000000"
        var out = paperPixel(x, y)
        for (l in project.layers) {
            if (!l.visible) continue
            val px = bitmaps[l.id]?.pixel(x, y) ?: continue
            val a = (px ushr 24) / 255f
            out = floatArrayOf(out[0] * (1 - a) + ((px shr 16) and 255) * a, out[1] * (1 - a) + ((px shr 8) and 255) * a, out[2] * (1 - a) + (px and 255) * a)
        }
        return ArtColor.toHex(out[0], out[1], out[2])
    }

    fun rasterUrl(id: String, webp: Boolean = false): String = ArtImages.dataUrl(bitmap(id), if (webp) "webp" else "png", if (webp) 92 else 100)

    fun dispose() {
        disposed = true
        bitmaps.values.forEach { it.release() }; bitmaps.clear()
        checkpoints.forEach { it.bmp.release() }; checkpoints.clear()
        images.values.forEach { it.release() }; images.clear()
        sprites.values.forEach { it.release() }; sprites.clear()
        buffer.release()
    }
}
