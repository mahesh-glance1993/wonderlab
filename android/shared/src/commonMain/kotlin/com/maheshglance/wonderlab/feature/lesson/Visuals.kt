package com.maheshglance.wonderlab.feature.lesson

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.hypot
import kotlin.math.log10
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

// Native renderer for the curriculum's declarative VisualSpec (website: src/features/lesson/Visual.tsx).
// Pictures are realistic 3D images (EmojiImage); diagrams are drawn with Canvas on "paper".

private val Fill = Color(0xFF8B7CF6)
private val FillDeep = Color(0xFF5B4BD6)
private val FillSoft = Color(0xFFE4DEFF)
private val Accent = Color(0xFFEA7A1E)

/** Short number text like the website's +v.toPrecision(…) (no trailing ".0"). */
fun fmt(v: Double): String {
    if (v.isNaN()) return ""
    val r = (v * 1e6).roundToInt() / 1e6
    return if (r == floor(r) && abs(r) < 1e15) r.toLong().toString() else r.toString().trimEnd('0').trimEnd('.')
}

@Composable
fun Visual(spec: JsonObject, size: Dp, modifier: Modifier = Modifier, animate: Boolean = true) {
    val alt = spec.str("alt") ?: ""
    val anim = animate && !LocalReduceMotion.current
    val m = modifier.semantics { contentDescription = alt }
    when (spec.str("kind")) {
        "objects" -> ObjectsVis(spec, size, m, anim)
        "fraction-bar" -> FractionBar(spec, size, m)
        "fraction-circle" -> FractionCircle(spec, min(size.value, 220f).dp, m)
        "number-line" -> NumberLineVis(spec, size, m)
        "shape" -> ShapeVis(spec, min(size.value, 160f).dp, m)
        "clock" -> ClockVis(spec, min(size.value, 200f).dp, m)
        "coins" -> CoinsVis(spec, size, m)
        "bar-graph" -> BarGraph(spec, size, m)
        "line-graph" -> LineGraph(spec, size, m)
        "grid-shape" -> GridShape(spec, size, m)
        "triangle" -> TriangleVis(spec, size, m)
        "emoji" -> EmojiText(
            spec.str("text") ?: "", m,
            style = MaterialTheme.typography.headlineMedium.copy(fontSize = (size.value / 5f).coerceIn(20f, 56f).sp, lineHeight = (size.value / 3.6f).coerceIn(28f, 76f).sp),
            textAlign = TextAlign.Center, emojiScale = 1.25f, color = WL.colors.text,
        )
        else -> Unit
    }
}

// ---------------------------------------------------------------- text helper

private fun DrawScope.label(tm: TextMeasurer, text: String, center: Offset, style: TextStyle, anchor: String = "middle") {
    if (text.isEmpty()) return
    val r = tm.measure(text, style)
    val x = when (anchor) { "end" -> center.x - r.size.width; "start" -> center.x; else -> center.x - r.size.width / 2f }
    drawText(r, topLeft = Offset(x, center.y - r.size.height / 2f))
}

// ---------------------------------------------------------------- objects (realistic pictures, grouped)

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ObjectsVis(spec: JsonObject, size: Dp, modifier: Modifier, anim: Boolean) {
    val emoji = spec.str("emoji") ?: "⭐"
    val n = (spec.int("count") ?: 0).coerceIn(0, 100)
    val g = (spec.int("groupsOf") ?: 0).coerceAtLeast(0)
    val groups = if (g > 0) (0 until n).chunked(g) else listOf((0 until n).toList())
    val perRow = max(3, ceil(sqrt(n * 1.6)).toInt())
    val cell = (size.value / (perRow + if (g > 0) 1.2f else 0.4f)).coerceIn(22f, 72f).dp
    FlowRow(modifier.width(size), horizontalArrangement = Arrangement.spacedBy(cell * 0.25f, Alignment.CenterHorizontally), verticalArrangement = Arrangement.spacedBy(cell * 0.2f)) {
        groups.forEachIndexed { gi, grp ->
            FlowRow(
                if (g > 0) Modifier.clip(RoundedCornerShape(16.dp)).background(FillSoft.copy(alpha = .55f)).border(2.dp, Fill.copy(alpha = .5f), RoundedCornerShape(16.dp)).padding(6.dp).widthInGroup(cell, g) else Modifier,
                horizontalArrangement = Arrangement.spacedBy(2.dp, Alignment.CenterHorizontally),
            ) {
                grp.forEach { i -> PopIn(anim, i + gi * 2) { EmojiImage(emoji, cell) } }
            }
        }
    }
}

private fun Modifier.widthInGroup(cell: Dp, g: Int): Modifier {
    val cols = when { g <= 3 -> g; g <= 4 -> 2; g <= 6 -> 3; g <= 10 -> 5; else -> 5 }
    return this.width(cell * cols + 2.dp * (cols - 1) + 12.dp)
}

@Composable
private fun PopIn(anim: Boolean, i: Int, content: @Composable () -> Unit) {
    if (!anim) { content(); return }
    val s = remember { Animatable(0.3f) }
    LaunchedEffect(Unit) { kotlinx.coroutines.delay((i * 45L).coerceAtMost(900)); s.animateTo(1f, tween(260)) }
    Box(Modifier.scale(s.value)) { content() }
}

// ---------------------------------------------------------------- fraction bar / circle

@Composable
private fun FractionBar(spec: JsonObject, size: Dp, modifier: Modifier) {
    val parts = (spec.int("parts") ?: 1).coerceIn(1, 48)
    val shaded = spec.int("shaded") ?: 0
    val ink = WL.colors.ink; val paper = WL.colors.paper
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Canvas(Modifier.width(size).height((size.value * 0.19f).coerceIn(36f, 72f).dp)) {
            val pw = this.size.width / parts
            for (i in 0 until parts) {
                val tl = Offset(i * pw + 1.5f, 1.5f); val sz = Size(pw - 3f, this.size.height - 3f)
                if (i < shaded) drawRoundRect(Brush.verticalGradient(listOf(Fill, FillDeep)), tl, sz, CornerRadius(6f))
                else drawRoundRect(paper, tl, sz, CornerRadius(6f))
                drawRoundRect(ink, tl, sz, CornerRadius(6f), style = Stroke(2.5f))
            }
        }
        spec.str("label")?.let { Text(it, style = MaterialTheme.typography.titleMedium, color = WL.colors.text) }
    }
}

@Composable
private fun FractionCircle(spec: JsonObject, size: Dp, modifier: Modifier) {
    val parts = (spec.int("parts") ?: 1).coerceIn(1, 36)
    val shaded = spec.int("shaded") ?: 0
    val ink = WL.colors.ink; val paper = WL.colors.paper
    Canvas(modifier.size(size)) {
        val r = this.size.minDimension / 2f - 4f
        val c = Offset(this.size.width / 2f, this.size.height / 2f)
        val tl = Offset(c.x - r, c.y - r); val sz = Size(2 * r, 2 * r)
        val sweep = 360f / parts
        for (i in 0 until parts) {
            val start = -90f + i * sweep
            if (i < shaded) drawArc(Brush.radialGradient(listOf(Fill, FillDeep), c, r), start, sweep, true, tl, sz)
            else drawArc(paper, start, sweep, true, tl, sz)
            if (parts > 1) drawArc(ink, start, sweep, true, tl, sz, style = Stroke(2.5f))
        }
        drawCircle(ink, r, c, style = Stroke(3f))
    }
}

// ---------------------------------------------------------------- number line with jumps / marks

@Composable
private fun NumberLineVis(spec: JsonObject, size: Dp, modifier: Modifier) {
    val from = spec.num("from") ?: 0.0; val to = spec.num("to") ?: 10.0; val step = spec.num("step") ?: 1.0
    val labels = spec.strList("labels")
    val marks = spec.numList("marks")
    val jumps = spec.arr("jumps")?.pairs() ?: emptyList()
    val tm = rememberTextMeasurer()
    val text = WL.colors.text
    val style = MaterialTheme.typography.labelMedium.copy(color = text, fontSize = 13.sp)
    val w = size * 1.15f
    Canvas(modifier.width(w).height((w.value * 0.27f).coerceIn(70f, 120f).dp)) {
        val pad = 22.dp.toPx(); val y = this.size.height * 0.62f
        val span = (to - from).takeIf { it != 0.0 } ?: 1.0
        fun X(v: Double) = (pad + ((v - from) / span) * (this.size.width - 2 * pad)).toFloat()
        val n = max(1, min(200, ((to - from) / step).roundToInt()))
        val every = ceil((n + 1) / 12.0).toInt()
        drawLine(text, Offset(pad - 12f, y), Offset(this.size.width - pad + 12f, y), 2.5f, StrokeCap.Round)
        for (k in 0..n) {
            val x = X(from + k * step)
            drawLine(text, Offset(x, y - 7f), Offset(x, y + 7f), 2f)
            if (k % every == 0 || k == n) label(tm, labels.getOrNull(k) ?: fmt(from + k * step), Offset(x, y + 22.dp.toPx() * 0.85f), style)
        }
        marks.forEach { drawCircle(Fill, 7.dp.toPx() * 0.9f, Offset(X(it), y)); drawCircle(Color.White, 2.5f, Offset(X(it), y)) }
        jumps.forEach { (a, b) ->
            val x1 = X(a); val x2 = X(b)
            val top = y - 10f - min(44.dp.toPx(), abs(x2 - x1) / 2f)
            val p = Path().apply { moveTo(x1, y - 8f); quadraticTo((x1 + x2) / 2f, top, x2, y - 8f) }
            drawPath(p, Accent, style = Stroke(3f, cap = StrokeCap.Round))
            // arrow head pointing along the curve's end tangent
            val dx = x2 - (x1 + x2) / 2f; val dy = (y - 8f) - top
            val len = hypot(dx, dy).takeIf { it > 0 } ?: 1f
            val ux = dx / len; val uy = dy / len
            val h = 9f
            val tip = Offset(x2, y - 8f)
            val head = Path().apply {
                moveTo(tip.x, tip.y)
                lineTo(tip.x - ux * h - uy * h * 0.6f, tip.y - uy * h + ux * h * 0.6f)
                lineTo(tip.x - ux * h + uy * h * 0.6f, tip.y - uy * h - ux * h * 0.6f)
                close()
            }
            drawPath(head, Accent)
        }
    }
}

// ---------------------------------------------------------------- shapes

private val NAMED = mapOf(
    "red" to 0xFFE53935, "blue" to 0xFF1E88E5, "green" to 0xFF43A047, "yellow" to 0xFFFDD835, "orange" to 0xFFFB8C00, "purple" to 0xFF8E24AA,
    "pink" to 0xFFEC407A, "brown" to 0xFF8D6E63, "black" to 0xFF212121, "white" to 0xFFFAFAFA, "grey" to 0xFF9E9E9E, "gray" to 0xFF9E9E9E,
    "violet" to 0xFF7E57C2, "indigo" to 0xFF3949AB, "gold" to 0xFFFFC107, "silver" to 0xFFBDBDBD, "sky" to 0xFF4FC3F7, "skyblue" to 0xFF4FC3F7,
)

fun cssColor(s: String?): Color? {
    if (s.isNullOrBlank()) return null
    NAMED[s.trim().lowercase()]?.let { return Color(it) }
    return parseHexColor(s)?.let { Color(it) }
}

private fun polygon(n: Int, r: Float, c: Offset, rot: Double = -PI / 2) = Path().apply {
    for (i in 0 until n) {
        val a = rot + i * 2 * PI / n
        val p = Offset(c.x + r * cos(a).toFloat(), c.y + r * sin(a).toFloat())
        if (i == 0) moveTo(p.x, p.y) else lineTo(p.x, p.y)
    }
    close()
}

@Composable
private fun ShapeVis(spec: JsonObject, size: Dp, modifier: Modifier) {
    val fill = cssColor(spec.str("color")) ?: Fill
    val ink = WL.colors.ink
    Canvas(modifier.size(size)) {
        val k = this.size.minDimension / 100f
        val c = Offset(50f * k, 50f * k)
        val path: Path = when (spec.str("shape")) {
            "circle" -> Path().apply { addOval(Rect(c, 40f * k)) }
            "oval" -> Path().apply { addOval(Rect(c.x - 44f * k, c.y - 30f * k, c.x + 44f * k, c.y + 30f * k)) }
            "square" -> Path().apply { addRect(Rect(12f * k, 12f * k, 88f * k, 88f * k)) }
            "rectangle" -> Path().apply { addRect(Rect(6f * k, 24f * k, 94f * k, 76f * k)) }
            "triangle" -> polygon(3, 44f * k, Offset(c.x, c.y + 6f * k))
            "pentagon" -> polygon(5, 42f * k, c)
            "hexagon" -> polygon(6, 42f * k, c, 0.0)
            "diamond" -> Path().apply { moveTo(50f * k, 6f * k); lineTo(86f * k, 50f * k); lineTo(50f * k, 94f * k); lineTo(14f * k, 50f * k); close() }
            "star" -> Path().apply {
                for (i in 0 until 10) {
                    val a = -PI / 2 + i * PI / 5; val r = if (i % 2 == 1) 18f * k else 44f * k
                    val p = Offset(c.x + r * cos(a).toFloat(), c.y + r * sin(a).toFloat())
                    if (i == 0) moveTo(p.x, p.y) else lineTo(p.x, p.y)
                }
                close()
            }
            else -> Path().apply { addOval(Rect(c, 40f * k)) }
        }
        // soft drop shadow + gentle top highlight for a "solid" look
        translate(2f * k, 3f * k) { drawPath(path, Color.Black.copy(alpha = .12f)) }
        drawPath(path, Brush.linearGradient(listOf(lighten(fill, .28f), fill, darken(fill, .12f)), Offset.Zero, Offset(this.size.width, this.size.height)))
        drawPath(path, ink, style = Stroke(2.5f * k))
    }
}

private fun lighten(c: Color, f: Float) = Color(c.red + (1 - c.red) * f, c.green + (1 - c.green) * f, c.blue + (1 - c.blue) * f, c.alpha)
private fun darken(c: Color, f: Float) = Color(c.red * (1 - f), c.green * (1 - f), c.blue * (1 - f), c.alpha)

// ---------------------------------------------------------------- clock

@Composable
private fun ClockVis(spec: JsonObject, size: Dp, modifier: Modifier) {
    val h = spec.num("h") ?: 12.0; val mnt = spec.num("m") ?: 0.0
    val tm = rememberTextMeasurer()
    val ink = Color(0xFF1D2540)
    val numStyle = TextStyle(color = ink, fontSize = (size.value / 12f).sp, fontWeight = FontWeight.Bold)
    Canvas(modifier.size(size)) {
        val k = this.size.minDimension / 200f
        val c = Offset(100f * k, 100f * k)
        drawCircle(Brush.radialGradient(listOf(Color(0xFF7C6CF0), Color(0xFF4338CA)), c, 98f * k), 97f * k, c)
        drawCircle(Brush.radialGradient(listOf(Color.White, Color(0xFFF1F1F6)), c, 88f * k), 88f * k, c)
        for (i in 0 until 60) {
            val a = i * 6 * PI / 180; val r1 = if (i % 5 == 0) 76f else 82f
            drawLine(ink, Offset(c.x + r1 * k * sin(a).toFloat(), c.y - r1 * k * cos(a).toFloat()), Offset(c.x + 86f * k * sin(a).toFloat(), c.y - 86f * k * cos(a).toFloat()), if (i % 5 == 0) 3.5f * k else 1.2f * k, StrokeCap.Round)
        }
        for (n in 1..12) { val a = n * 30 * PI / 180; label(tm, "$n", Offset(c.x + 63f * k * sin(a).toFloat(), c.y - 63f * k * cos(a).toFloat()), numStyle) }
        val hA = ((h % 12) + mnt / 60) * 30 * PI / 180; val mA = mnt * 6 * PI / 180
        fun hand(a: Double, len: Float) = Offset(c.x + len * k * sin(a).toFloat(), c.y - len * k * cos(a).toFloat())
        drawLine(Color.Black.copy(alpha = .15f), c + Offset(2f * k, 3f * k), hand(hA, 48f) + Offset(2f * k, 3f * k), 8f * k, StrokeCap.Round)
        drawLine(ink, c, hand(hA, 48f), 8f * k, StrokeCap.Round)
        drawLine(Accent, c, hand(mA, 74f), 4.5f * k, StrokeCap.Round)
        drawCircle(ink, 7f * k, c); drawCircle(Accent, 3f * k, c)
    }
}

// ---------------------------------------------------------------- coins & notes (₹)

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun CoinsVis(spec: JsonObject, size: Dp, modifier: Modifier) {
    val list = spec.numList("rupees").map { it.toInt() }
    val coin = (size.value / max(3.5f, list.size * 0.9f)).coerceIn(40f, 76f).dp
    val tm = rememberTextMeasurer()
    FlowRow(modifier.width(size * 1.1f), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        list.forEach { r ->
            if (r >= 20) {
                val (c1, c2) = noteColors(r)
                Canvas(Modifier.width(coin * 1.9f).height(coin * 0.95f).shadow(4.dp, RoundedCornerShape(8.dp))) {
                    drawRoundRect(Brush.linearGradient(listOf(c1, c2), Offset.Zero, Offset(this.size.width, this.size.height)), cornerRadius = CornerRadius(8.dp.toPx()))
                    drawRoundRect(Color.White.copy(alpha = .55f), Offset(5f, 5f), Size(this.size.width - 10f, this.size.height - 10f), CornerRadius(6.dp.toPx()), style = Stroke(2f))
                    drawCircle(Color.White.copy(alpha = .35f), this.size.height * 0.28f, Offset(this.size.width * 0.78f, this.size.height / 2f))
                    label(tm, "₹$r", Offset(this.size.width * 0.38f, this.size.height / 2f), TextStyle(color = Color(0xFF1D2540), fontSize = (coin.value * 0.34f).sp, fontWeight = FontWeight.ExtraBold))
                }
            } else {
                val (c1, c2, rim) = coinColors(r)
                Canvas(Modifier.size(coin)) {
                    val c = Offset(this.size.width / 2f, this.size.height / 2f); val rad = this.size.minDimension / 2f
                    drawCircle(Color.Black.copy(alpha = .18f), rad * .96f, c + Offset(1.5f, 3f))
                    drawCircle(rim, rad * .96f, c)
                    drawCircle(Brush.radialGradient(listOf(c1, c2), c - Offset(rad * .3f, rad * .3f), rad * 1.3f), rad * (if (r == 10) .66f else .84f), c)
                    if (r == 10) drawCircle(rim, rad * .66f, c, style = Stroke(2f))
                    drawCircle(Color.White.copy(alpha = .35f), rad * .84f, c, style = Stroke(1.5f))
                    label(tm, "₹$r", c, TextStyle(color = Color(0xFF3A2A05), fontSize = (coin.value * 0.3f).sp, fontWeight = FontWeight.ExtraBold))
                }
            }
        }
    }
}

private fun coinColors(r: Int): Triple<Color, Color, Color> = when (r) {
    10 -> Triple(Color(0xFFFFF3C4), Color(0xFFD4A72C), Color(0xFFC9CDD6))
    5 -> Triple(Color(0xFFFFF0B8), Color(0xFFC9971F), Color(0xFFB8860B))
    else -> Triple(Color(0xFFFFFFFF), Color(0xFFB9BEC9), Color(0xFF9AA1AF))
}

private fun noteColors(r: Int): Pair<Color, Color> = when (r) {
    20 -> Color(0xFFE6F2B8) to Color(0xFFB9D46A)
    50 -> Color(0xFFC6EEF2) to Color(0xFF6CC4CF)
    100 -> Color(0xFFE2D9F5) to Color(0xFFA996DC)
    200 -> Color(0xFFFFE2B8) to Color(0xFFF2B35E)
    500 -> Color(0xFFE6E2D6) to Color(0xFFB6AE98)
    else -> Color(0xFFFFD6E0) to Color(0xFFE88AA6)
}

// ---------------------------------------------------------------- graphs (+ data table)

private fun niceMax(v: Double): Double {
    if (v <= 0) return 1.0
    val p = 10.0.pow(floor(log10(v))); val n = v / p
    return (if (n <= 1) 1.0 else if (n <= 2) 2.0 else if (n <= 5) 5.0 else 10.0) * p
}
private fun prec4(v: Double): String = fmt(fmtSignificant(v, 4).toDouble())

@Composable
private fun GraphFrame(size: Dp, modifier: Modifier, table: List<Pair<String, String>>, head: Pair<String, String>, draw: DrawScope.(TextMeasurer, TextStyle, TextStyle) -> Unit) {
    val tm = rememberTextMeasurer()
    var show by remember { mutableStateOf(false) }
    val text = WL.colors.text
    val sm = TextStyle(color = text, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    val b = sm.copy(fontWeight = FontWeight.ExtraBold, fontSize = 12.sp)
    val w = (size.value * 1.25f).coerceAtMost(460f).dp
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Canvas(Modifier.width(w).height(w * (230f / 340f))) {
            val k = this.size.width / 340f
            scale(k, Offset.Zero) { draw(tm, sm, b) }
        }
        WLButton(ls("showTable"), { show = true }, small = true)
    }
    if (show) Dialog(onDismissRequest = { show = false }) {
        WLCard(padding = 18.dp) {
            Row(Modifier.fillMaxWidth().background(WL.colors.surface2).padding(8.dp)) {
                Text(head.first, Modifier.weight(1f), style = MaterialTheme.typography.titleSmall)
                Text(head.second, Modifier.weight(1f), style = MaterialTheme.typography.titleSmall)
            }
            table.forEach { (a, v) ->
                Row(Modifier.fillMaxWidth().padding(8.dp)) {
                    Text(a, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                    Text(v, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                }
            }
            WLButton(ls("hideTable"), { show = false }, Modifier.align(Alignment.End).padding(top = 8.dp), small = true)
        }
    }
}

@Composable
private fun BarGraph(spec: JsonObject, size: Dp, modifier: Modifier) {
    val labels = spec.strList("labels"); val values = spec.numList("values"); val unit = spec.str("unit")
    val line = WL.colors.line; val text = WL.colors.text; val ink = WL.colors.ink
    GraphFrame(size, modifier, labels.mapIndexed { i, l -> l to fmt(values.getOrElse(i) { 0.0 }) }, "Item" to ("Value" + (unit?.let { " ($it)" } ?: ""))) { tm, sm, _ ->
        val mx = niceMax(max(values.maxOrNull() ?: 0.0, 0.0))
        val x0 = 44f; val y0 = 190f; val gw = 280f; val gh = 170f; val bw = gw / max(1, values.size)
        listOf(0.0, .25, .5, .75, 1.0).forEach { f ->
            val y = (y0 - f * gh).toFloat()
            drawLine(line, Offset(x0, y), Offset(x0 + gw, y), 1f)
            label(tm, prec4(f * mx), Offset(x0 - 6f, y), sm, "end")
        }
        values.forEachIndexed { i, v ->
            val h = (max(0.0, v) / mx * gh).toFloat()
            val left = x0 + i * bw + bw * 0.15f
            val color = BAR_COLORS[i % BAR_COLORS.size]
            drawRoundRect(Brush.verticalGradient(listOf(lighten(color, .25f), color), y0 - h, y0), Offset(left, y0 - h), Size(bw * 0.7f, h), CornerRadius(4f))
            drawRoundRect(ink.copy(alpha = .6f), Offset(left, y0 - h), Size(bw * 0.7f, h), CornerRadius(4f), style = Stroke(1f))
            label(tm, fmt(v), Offset(x0 + i * bw + bw / 2, y0 - h - 9f), sm)
            label(tm, labels.getOrElse(i) { "" }, Offset(x0 + i * bw + bw / 2, y0 + 13f), sm)
        }
        drawLine(text, Offset(x0, y0 - gh), Offset(x0, y0), 2f)
        drawLine(text, Offset(x0, y0), Offset(x0 + gw, y0), 2f)
        unit?.let { label(tm, it, Offset(8f, 12f), sm, "start") }
    }
}

private val BAR_COLORS = listOf(Color(0xFF8B7CF6), Color(0xFF34A0A4), Color(0xFFF59E0B), Color(0xFFEC4899), Color(0xFF22C55E), Color(0xFF3B82F6), Color(0xFFEF4444), Color(0xFF14B8A6))

@Composable
private fun LineGraph(spec: JsonObject, size: Dp, modifier: Modifier) {
    val pts = spec.arr("points")?.pairs() ?: emptyList()
    val xl = spec.str("xLabel") ?: ""; val yl = spec.str("yLabel") ?: ""
    val line = WL.colors.line; val text = WL.colors.text
    GraphFrame(size, modifier, pts.map { fmt(it.first) to fmt(it.second) }, xl to yl) { tm, sm, b ->
        val xs = pts.map { it.first }; val ys = pts.map { it.second }
        val xmin = min(0.0, xs.minOrNull() ?: 0.0); val xmax = niceMax(max(xs.maxOrNull() ?: 0.0, 0.0))
        val ymin = min(0.0, ys.minOrNull() ?: 0.0); val ymax = niceMax(max(ys.maxOrNull() ?: 0.0, 0.0))
        val x0 = 50f; val y0 = 186f; val gw = 270f; val gh = 160f
        fun X(v: Double) = (x0 + (v - xmin) / ((xmax - xmin).takeIf { it != 0.0 } ?: 1.0) * gw).toFloat()
        fun Y(v: Double) = (y0 - (v - ymin) / ((ymax - ymin).takeIf { it != 0.0 } ?: 1.0) * gh).toFloat()
        listOf(0.0, .25, .5, .75, 1.0).forEach { f ->
            val y = (y0 - f * gh).toFloat()
            drawLine(line, Offset(x0, y), Offset(x0 + gw, y), 1f)
            label(tm, prec4(ymin + f * (ymax - ymin)), Offset(x0 - 6f, y), sm, "end")
            label(tm, prec4(xmin + f * (xmax - xmin)), Offset((x0 + f * gw).toFloat(), y0 + 12f), sm)
        }
        drawLine(text, Offset(x0, y0 - gh), Offset(x0, y0), 2f)
        drawLine(text, Offset(x0, y0), Offset(x0 + gw, y0), 2f)
        if (pts.size > 1) {
            val p = Path().apply { pts.forEachIndexed { i, (x, y) -> if (i == 0) moveTo(X(x), Y(y)) else lineTo(X(x), Y(y)) } }
            drawPath(p, Accent, style = Stroke(3f, cap = StrokeCap.Round))
        }
        pts.forEach { (x, y) -> drawCircle(Color.White, 5.5f, Offset(X(x), Y(y))); drawCircle(FillDeep, 4.2f, Offset(X(x), Y(y))) }
        label(tm, xl, Offset(x0 + gw / 2, 220f), b)
        rotate(-90f, Offset(14f, y0 - gh / 2)) { label(tm, yl, Offset(14f, y0 - gh / 2), b) }
    }
}

// ---------------------------------------------------------------- grid shape

@Composable
private fun GridShape(spec: JsonObject, size: Dp, modifier: Modifier) {
    val cols = (spec.int("cols") ?: 1).coerceAtLeast(1); val rows = (spec.int("rows") ?: 1).coerceAtLeast(1)
    val on = (spec.arr("cells") ?: JsonArray(emptyList())).pairs().map { it.first.toInt() to it.second.toInt() }.toSet()
    val cs = min(36f * (size.value / 300f).coerceAtLeast(1f), size.value / cols).dp
    val line = WL.colors.line; val paper = WL.colors.paper
    Canvas(modifier.width(cs * cols).height(cs * rows)) {
        val c = this.size.width / cols
        for (y in 0 until rows) for (x in 0 until cols) {
            val tl = Offset(x * c, y * c)
            if ((x to y) in on) drawRect(Brush.linearGradient(listOf(lighten(Fill, .15f), FillDeep), tl, tl + Offset(c, c)), tl, Size(c, c))
            else drawRect(paper, tl, Size(c, c))
            drawRect(line, tl, Size(c, c), style = Stroke(1.5f))
        }
    }
}

// ---------------------------------------------------------------- triangle

/** The website's trianglePoints(). */
fun trianglePoints(a: Double, b: Double, c: Double?): List<Pair<Double, Double>>? {
    if (!(a > 0 && b > 0)) return null
    if (c == null) return listOf(0.0 to 0.0, a to 0.0, 0.0 to b)
    if (!(c > 0) || a + b <= c || a + c <= b || b + c <= a) return null
    val x = (a * a + c * c - b * b) / (2 * a)
    return listOf(0.0 to 0.0, a to 0.0, x to sqrt(max(0.0, c * c - x * x)))
}

@Composable
private fun TriangleVis(spec: JsonObject, size: Dp, modifier: Modifier) {
    val a = spec.num("a") ?: 1.0; val b = spec.num("b") ?: 1.0; val cSide = spec.num("c")
    val angles = spec.strList("angleLabels")
    val tm = rememberTextMeasurer()
    val ink = WL.colors.ink; val text = WL.colors.text
    val bold = TextStyle(color = text, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold)
    val sm = TextStyle(color = text, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    val hDp = min(220f, size.value * 0.7f).dp
    Canvas(modifier.width(size).height(hDp)) {
        val pts = trianglePoints(a, b, cSide) ?: listOf(0.0 to 0.0, 1.0 to 0.0, 0.5 to 0.8)
        val xs = pts.map { it.first }; val ys = pts.map { it.second }
        val minX = xs.min(); val spanX = (xs.max() - minX).takeIf { it > 0 } ?: 1.0; val spanY = ys.max().takeIf { it > 0 } ?: 1.0
        val pad = 30.dp.toPx(); val w = this.size.width; val h = this.size.height
        val k = min((w - 2 * pad) / spanX, (h - 2 * pad) / spanY)
        val offX = (w - spanX * k) / 2
        val P = pts.map { (x, y) -> Offset((offX + (x - minX) * k).toFloat(), (h - pad - y * k).toFloat()) }
        val path = Path().apply { moveTo(P[0].x, P[0].y); lineTo(P[1].x, P[1].y); lineTo(P[2].x, P[2].y); close() }
        drawPath(path, Brush.linearGradient(listOf(FillSoft, lighten(Fill, .45f)), P[2], P[0]))
        drawPath(path, ink, style = Stroke(3f))
        if (cSide == null) {
            val s = 14.dp.toPx()
            val m = Path().apply { moveTo(P[0].x + s, P[0].y); lineTo(P[0].x + s, P[0].y - s); lineTo(P[0].x, P[0].y - s) }
            drawPath(m, ink, style = Stroke(2f))
        }
        val cx = (P[0].x + P[1].x + P[2].x) / 3; val cy = (P[0].y + P[1].y + P[2].y) / 3
        val sides = if (cSide == null) listOf(Triple(0, 1, fmt(a)), Triple(0, 2, fmt(b))) else listOf(Triple(0, 1, fmt(a)), Triple(1, 2, fmt(b)), Triple(2, 0, fmt(cSide)))
        sides.forEach { (i, j, t) ->
            val mx = (P[i].x + P[j].x) / 2; val my = (P[i].y + P[j].y) / 2
            val dx = mx - cx; val dy = my - cy; val d = hypot(dx, dy).takeIf { it > 0 } ?: 1f
            label(tm, t, Offset(mx + dx / d * 18.dp.toPx(), my + dy / d * 18.dp.toPx()), bold)
        }
        angles.take(3).forEachIndexed { i, t ->
            val dx = cx - P[i].x; val dy = cy - P[i].y; val d = hypot(dx, dy).takeIf { it > 0 } ?: 1f
            label(tm, t, Offset(P[i].x + dx / d * 26.dp.toPx(), P[i].y + dy / d * 26.dp.toPx()), sm)
        }
    }
}
