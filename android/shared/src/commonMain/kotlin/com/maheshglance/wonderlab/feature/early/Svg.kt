package com.maheshglance.wonderlab.feature.early

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Matrix as GMatrix
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.platform.LocalFontFamilyResolver
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.sin
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
 * Compose paths and draws them in a DrawScope — crisp at any size, no WebView.
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

/** A fill colour (alpha included). */
class SvgFill(val color: Color)

/** A stroke colour (alpha included) and its line style (width, caps, joins, dashes) in drawing units. */
class SvgStroke(val color: Color, val style: Stroke)

/** Text drawn at a point: size in drawing units, anchor -1 start / 0 middle / 1 end. */
class SvgText(val text: String, val x: Float, val y: Float, val size: Float, val bold: Boolean, val anchor: Int, val color: Color)

class SvgPrim(
    val path: Path, val fill: SvgFill?, val stroke: SvgStroke?,
    val role: String?, val roleIndex: Int, val pivot: Offset, val radius: Float,
    val cls: String?, val text: SvgText? = null,
) {
    /** Path bounds (for the small CSS effects), computed once. */
    val bounds: Rect by lazy { path.getBounds() }
}

/**
 * 2-D affine transform with android.graphics.Matrix semantics: x' = a·x + c·y + e, y' = b·x + d·y + f.
 * The `pre…` operations apply the new transform before the existing one (like Matrix.preTranslate).
 */
class Affine(var a: Float = 1f, var b: Float = 0f, var c: Float = 0f, var d: Float = 1f, var e: Float = 0f, var f: Float = 0f) {
    fun copy() = Affine(a, b, c, d, e, f)
    fun preConcat(n: Affine): Affine {
        val na = a * n.a + c * n.b; val nb = b * n.a + d * n.b
        val nc = a * n.c + c * n.d; val nd = b * n.c + d * n.d
        val ne = a * n.e + c * n.f + e; val nf = b * n.e + d * n.f + f
        a = na; b = nb; c = nc; d = nd; e = ne; f = nf
        return this
    }
    fun preTranslate(x: Float, y: Float) = preConcat(Affine(e = x, f = y))
    fun preScale(sx: Float, sy: Float) = preConcat(Affine(a = sx, d = sy))
    fun preRotate(deg: Float): Affine {
        val r = deg / 180.0 * kotlin.math.PI
        val cs = cos(r).toFloat(); val sn = sin(r).toFloat()
        return preConcat(Affine(cs, sn, -sn, cs, 0f, 0f))
    }
    fun preRotate(deg: Float, px: Float, py: Float) = preTranslate(px, py).preRotate(deg).preTranslate(-px, -py)
    fun map(x: Float, y: Float) = Offset(a * x + c * y + e, b * x + d * y + f)
    /** Uniform scale factor (sqrt of the determinant). */
    fun scale(): Float = sqrt(abs(a * d - c * b)).coerceAtLeast(0.0001f)
    fun toMatrix(): GMatrix = GMatrix().apply {
        values[GMatrix.ScaleX] = a; values[GMatrix.SkewY] = b
        values[GMatrix.SkewX] = c; values[GMatrix.ScaleY] = d
        values[GMatrix.TranslateX] = e; values[GMatrix.TranslateY] = f
    }
}

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
fun parseTransform(src: String?, m: Affine = Affine()): Affine {
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
            "matrix" -> if (args.size == 6) m.preConcat(Affine(args[0], args[1], args[2], args[3], args[4], args[5]))
        }
    }
    return m
}

private class Style(
    val fill: String? = "#000", val stroke: String? = null, val sw: Float = 1f, val cap: String = "butt", val join: String = "miter",
    val opacity: Float = 1f, val fillOpacity: Float = 1f, val strokeOpacity: Float = 1f, val dash: String? = null,
    val role: String? = null, val roleIndex: Int = -1, val pivot: Offset = Offset.Zero, val cls: String? = null,
)

private val pathCache = Lru<String, Path>(600)
private fun copyOf(p: Path): Path = Path().apply { addPath(p) }
private fun pathOf(d: String): Path {
    pathCache.get(d)?.let { return copyOf(it) }
    val p = runCatching { PathParser().parsePathString(d).toPath() }.getOrElse { Path() }
    pathCache.put(d, copyOf(p))
    return p
}

/** Compiles nodes into drawable primitives (once per drawing). */
fun compileSvg(nodes: List<SNode>): SvgPicture {
    val out = ArrayList<SvgPrim>()
    var roleCount = 0
    fun scaleOf(m: Affine): Float = m.scale()

    fun walk(n: SNode, parent: Affine, st: Style) {
        val a = n.a
        val m = parent.copy()
        parseTransform(a.s("transform"), m)
        parseTransform(a.s("css"), m)
        val op = a.num("opacity", 1f) * a.num("cssOpacity", 1f)
        val role = a.s("data-role")
        val pivot = if (role != null) m.map(0f, 0f) else st.pivot
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
                Path().apply { if (rx > 0 || ry > 0) addRoundRect(RoundRect(Rect(x, y, x + w, y + h), CornerRadius(min(rx, w / 2), min(ry, h / 2)))) else addRect(Rect(x, y, x + w, y + h)) }
            }
            "circle" -> { val cx = a.num("cx"); val cy = a.num("cy"); val r = a.num("r"); Path().apply { addOval(Rect(cx - r, cy - r, cx + r, cy + r)) } }
            "ellipse" -> { val cx = a.num("cx"); val cy = a.num("cy"); val rx = a.num("rx"); val ry = a.num("ry"); Path().apply { addOval(Rect(cx - rx, cy - ry, cx + rx, cy + ry)) } }
            "line" -> Path().apply { moveTo(a.num("x1"), a.num("y1")); lineTo(a.num("x2"), a.num("y2")) }
            "polygon", "polyline" -> {
                val p = (a.s("points") ?: "").trim().split(Regex("[\\s,]+")).mapNotNull { it.toFloatOrNull() }
                Path().apply { for (i in 0 until p.size / 2) { if (i == 0) moveTo(p[0], p[1]) else lineTo(p[i * 2], p[i * 2 + 1]) }; if (n.t == "polygon") close() }
            }
            "text" -> {
                val txt = n.c.firstOrNull { it.t == "#text" }?.a?.s("v") ?: ""
                val pt = m.map(a.num("x"), a.num("y"))
                val sc = scaleOf(m)
                val color = Color(parseColor(s.fill) ?: 0xFF1D2540.toInt()).copy(alpha = ((255 * s.opacity).toInt().coerceIn(0, 255)) / 255f)
                val anchor = when (a.s("textAnchor")) { "middle" -> 0; "end" -> 1; else -> -1 }
                val text = SvgText(txt, pt.x, pt.y, a.num("fontSize", 16f) * sc, a.num("fontWeight", 400f) >= 700f, anchor, color)
                out += SvgPrim(Path(), SvgFill(color), null, s.role, s.roleIndex, s.pivot, 0f, s.cls, text)
                null
            }
            else -> { n.c.forEach { walk(it, m, s) }; null }
        }
        if (local != null) {
            val p = local; p.transform(m.toMatrix())
            val sc = scaleOf(m)
            val fc = parseColor(s.fill)
            val fill = fc?.let { c ->
                val alpha = ((c ushr 24) and 0xFF) / 255f * s.opacity * s.fillOpacity
                if (alpha <= 0f) null else SvgFill(Color(c).copy(alpha = (alpha * 255).toInt().coerceIn(0, 255) / 255f))
            }
            val sc2 = parseColor(s.stroke)
            val nonScaling = a.s("vectorEffect") == "non-scaling-stroke"
            val stroke = sc2?.let { c ->
                val alpha = ((c ushr 24) and 0xFF) / 255f * s.opacity * s.strokeOpacity
                if (alpha <= 0f || s.sw <= 0f) null else SvgStroke(
                    Color(c).copy(alpha = (alpha * 255).toInt().coerceIn(0, 255) / 255f),
                    Stroke(
                        width = if (nonScaling) s.sw else s.sw * sc,
                        cap = when (s.cap) { "round" -> StrokeCap.Round; "square" -> StrokeCap.Square; else -> StrokeCap.Butt },
                        join = when (s.join) { "round" -> StrokeJoin.Round; "bevel" -> StrokeJoin.Bevel; else -> StrokeJoin.Miter },
                        pathEffect = s.dash?.split(Regex("[\\s,]+"))?.mapNotNull { it.toFloatOrNull() }?.takeIf { it.size >= 2 }?.let { d ->
                            // an odd dash list repeats (SVG rule); the platform dash effect needs an even count
                            val arr = if (d.size % 2 == 1) d + d else d
                            PathEffect.dashPathEffect(arr.map { it * sc }.toFloatArray(), 0f)
                        },
                    ),
                )
            }
            if (fill != null || stroke != null) {
                val b = p.getBounds()
                out += SvgPrim(p, fill, stroke, s.role, s.roleIndex, s.pivot, max(b.width, b.height) / 2, s.cls)
            }
        }
    }
    val root = Style()
    nodes.forEach { walk(it, Affine(), root) }
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
    val c = drawContext.canvas
    val tintColor = tint?.let { Color(it) }
    if (alpha < 1f) c.saveLayer(Rect(0f, 0f, size.width, size.height), Paint().apply { this.alpha = alpha }) else c.save()
    c.translate(ox, oy); c.scale(k, k)
    for (p in pic.prims) {
        val xf = if (p.role != null && roleXf != null) roleXf(p.role, p.roleIndex) else null
        val anim = time >= 0 && p.cls != null
        if (xf != null || anim) c.save()
        if (xf != null) {
            c.translate(xf.dx, xf.dy)
            if (xf.rotate != 0f) { c.translate(p.pivot.x, p.pivot.y); c.rotate(xf.rotate); c.translate(-p.pivot.x, -p.pivot.y) }
            if (xf.scaleX != 1f || xf.scaleY != 1f) { c.translate(p.pivot.x, p.pivot.y); c.scale(xf.scaleX, xf.scaleY); c.translate(-p.pivot.x, -p.pivot.y) }
        }
        if (anim) {
            val b = p.bounds
            when {
                p.cls!!.contains("el-flicker") -> { val f = 1f + 0.06f * kotlin.math.sin(time / 90.0).toFloat(); c.translate(b.center.x, b.bottom); c.scale(1f / f, f); c.translate(-b.center.x, -b.bottom) }
                p.cls.contains("el-steam") -> { val ph = ((time % 1800L) / 1800f); c.translate(0f, -6f * ph) }
            }
        }
        if (p.text != null) drawSvgText(p.text, null)
        else {
            p.fill?.let { f -> drawPath(p.path, if (tintColor != null) tintColor.copy(alpha = f.color.alpha) else f.color) }
            p.stroke?.let { s -> drawPath(p.path, if (tintColor != null) tintColor.copy(alpha = s.color.alpha) else s.color, style = s.style) }
        }
        if (xf != null || anim) c.restore()
    }
    c.restore()
}

/** Text measurer for SVG `<text>` (sizes in drawing units); set by [ProvideSvgText] / [rememberSvg]. */
internal var svgTextMeasurer: TextMeasurer? = null

/** Makes SVG text drawable (call from any composable that draws pictures with text). */
@Composable
fun ProvideSvgText() {
    val resolver = LocalFontFamilyResolver.current
    remember(resolver) { if (svgTextMeasurer == null) svgTextMeasurer = TextMeasurer(resolver, Density(1f, 1f), LayoutDirection.Ltr, 16); 0 }
}

private fun DrawScope.drawSvgText(t: SvgText, tint: Color?) {
    val tm = svgTextMeasurer ?: return
    if (t.text.isEmpty() || t.size <= 0f) return
    val lay = tm.measure(t.text, TextStyle(fontSize = t.size.sp, fontWeight = if (t.bold) FontWeight.Bold else FontWeight.Normal),
        overflow = TextOverflow.Clip, softWrap = false, maxLines = 1)
    val w = lay.size.width.toFloat()
    val x = when (t.anchor) { 0 -> t.x - w / 2f; 1 -> t.x - w; else -> t.x }
    drawText(lay, color = tint?.copy(alpha = t.color.alpha) ?: t.color, topLeft = Offset(x, t.y - lay.firstBaseline))
}

/** Fetches + compiles drawings from the engine, cached for the app run. */
object SvgStore {
    private val cache = Lru<String, SvgPicture>(400)
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
    ProvideSvgText()
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
    ProvideSvgText()
    Canvas(modifier) { if (pic != null) drawSvg(pic, -50f, -50f, 100f, 100f, tint = tint, time = time) }
}

@Suppress("unused") private fun JsonObject.bool(k: String) = (this[k] as? JsonPrimitive)?.booleanOrNull
@Suppress("unused") private val keepJson = AppJson
