package com.maheshglance.wonderlab.feature.games

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import kotlin.math.PI
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.sin

/** Shape colours (website art.tsx); each colour also has its own texture so nothing relies on colour alone. */
val SHAPE_FILL = mapOf("red" to Color(0xFFD9695C), "blue" to Color(0xFF5C8FC9), "yellow" to Color(0xFFE8C14E), "green" to Color(0xFF6BAF7B))
val INK = Color(0xFF2F3A35)

private fun polygon(n: Int, r: Float, rot: Float): List<Offset> = List(n) { i ->
    val a = (rot + 360f / n * i) * PI / 180
    Offset(50f + r * cos(a).toFloat(), 50f + r * sin(a).toFloat())
}

/** Outline of a shape in a 100×100 box (same geometry as the website's SVG). */
fun shapePath(shape: String, k: Float, origin: Offset = Offset.Zero): Path {
    fun P(x: Float, y: Float) = Offset(origin.x + x * k, origin.y + y * k)
    val path = Path()
    fun poly(pts: List<Offset>) { pts.forEachIndexed { i, p -> val q = P(p.x, p.y); if (i == 0) path.moveTo(q.x, q.y) else path.lineTo(q.x, q.y) }; path.close() }
    when (shape) {
        "circle" -> path.addOval(Rect(P(10f, 10f), Size(80f * k, 80f * k)))
        "square" -> path.addRoundRect(androidx.compose.ui.geometry.RoundRect(Rect(P(14f, 14f), Size(72f * k, 72f * k)), androidx.compose.ui.geometry.CornerRadius(4f * k)))
        "rectangle" -> path.addRoundRect(androidx.compose.ui.geometry.RoundRect(Rect(P(6f, 26f), Size(88f * k, 48f * k)), androidx.compose.ui.geometry.CornerRadius(4f * k)))
        "triangle" -> poly(listOf(Offset(50f, 8f), Offset(92f, 88f), Offset(8f, 88f)))
        "rhombus" -> poly(listOf(Offset(50f, 6f), Offset(86f, 50f), Offset(50f, 94f), Offset(14f, 50f)))
        "trapezium" -> poly(listOf(Offset(28f, 22f), Offset(72f, 22f), Offset(94f, 80f), Offset(6f, 80f)))
        "pentagon" -> poly(polygon(5, 44f, -90f))
        "hexagon" -> poly(polygon(6, 44f, 0f))
        "octagon" -> poly(polygon(8, 44f, 22.5f))
        else -> path.addOval(Rect(P(10f, 10f), Size(80f * k, 80f * k)))
    }
    return path
}

/** Draws a glossy shape with its colour texture (solid / stripes / dots / checks), soft shadow and outline. */
fun DrawScope.drawShape(shape: String, color: String, topLeft: Offset, side: Float, rot: Float = 0f) {
    val k = side / 100f
    val base = SHAPE_FILL[color] ?: SHAPE_FILL.getValue("blue")
    val center = Offset(topLeft.x + side / 2, topLeft.y + side / 2)
    rotate(rot, center) {
        val shadow = shapePath(shape, k, topLeft + Offset(0f, side * 0.05f))
        drawPath(shadow, Color.Black.copy(alpha = 0.16f))
        val p = shapePath(shape, k, topLeft)
        drawPath(p, Brush.linearGradient(listOf(lerp(base, Color.White, 0.35f), base, lerp(base, Color.Black, 0.18f)), topLeft, topLeft + Offset(side, side)))
        clipPath(p) {
            when (color) {
                "blue" -> { // diagonal stripes
                    var x = -side
                    while (x < side * 2) { drawLine(Color.White.copy(alpha = .5f), topLeft + Offset(x, side), topLeft + Offset(x + side, 0f), strokeWidth = 4f * k); x += 10f * k }
                }
                "yellow" -> { // dots
                    var y = 6f; while (y < 100f) { var x = 6f; while (x < 100f) { drawCircle(Color(0x73603C00), 2.4f * k, topLeft + Offset(x * k, y * k)); x += 12f }; y += 12f }
                }
                "green" -> { // checks
                    var y = 0f; while (y < 100f) { var x = 0f; while (x < 100f) { drawRect(Color.White.copy(alpha = .35f), topLeft + Offset(x * k, y * k), Size(6f * k, 6f * k)); drawRect(Color.White.copy(alpha = .35f), topLeft + Offset((x + 6) * k, (y + 6) * k), Size(6f * k, 6f * k)); x += 12f }; y += 12f }
                }
            }
            drawCircle(Brush.radialGradient(listOf(Color.White.copy(alpha = .45f), Color.Transparent), topLeft + Offset(side * .32f, side * .28f), side * .45f), side * .45f, topLeft + Offset(side * .32f, side * .28f))
        }
        drawPath(p, INK, style = Stroke(width = max(2f, 3f * k), join = StrokeJoin.Round))
    }
}

@Composable
fun ShapeArt(shape: String, color: String, size: Dp, modifier: Modifier = Modifier, rot: Float = 0f, label: String? = null) {
    Canvas(modifier.size(size).then(if (label != null) Modifier.semantics { contentDescription = label } else Modifier)) { drawShape(shape, color, Offset.Zero, this.size.minDimension, rot) }
}

private val HATCH_BASE = Color(0xFF8ECAE6)
private val HATCH_LINE = Color(0xFF3E7CA6)
private val EMPTY = Color(0xFFFBF8F1)

private fun DrawScope.hatch(path: Path, bounds: Rect) {
    clipPath(path) {
        drawRect(HATCH_BASE, bounds.topLeft, bounds.size)
        var x = bounds.left - bounds.height
        while (x < bounds.right + bounds.height) { drawLine(HATCH_LINE, Offset(x, bounds.bottom), Offset(x + bounds.height, bounds.top), strokeWidth = 3f); x += 8f }
    }
}

/** Fraction bar or pie: `num` of `den` equal parts shaded with hatching (values above 1 draw several wholes). */
@Composable
fun FracPicture(kind: String, num: Int, den: Int, width: Dp, modifier: Modifier = Modifier) {
    val wholes = max(1, ceil(num.toDouble() / den).toInt())
    val label = "$num of $den equal parts shaded"
    if (kind == "bar") {
        val barH = width * 0.22f
        Canvas(modifier.size(width, barH * wholes + 4.dp * (wholes - 1)).semantics { contentDescription = label }) {
            val w = size.width / den
            val h = (size.height - 4.dp.toPx() * (wholes - 1)) / wholes
            for (b in 0 until wholes) for (i in 0 until den) {
                val r = Rect(Offset(i * w + 1.5f, b * (h + 4.dp.toPx())), Size(w - 3f, h))
                val p = Path().apply { addRoundRect(androidx.compose.ui.geometry.RoundRect(r, androidx.compose.ui.geometry.CornerRadius(4f))) }
                if (b * den + i < num) hatch(p, r) else drawPath(p, EMPTY)
                drawPath(p, INK, style = Stroke(2.5f))
            }
        }
    } else {
        val d = if (wholes > 1) width / wholes - 4.dp else width * 0.62f
        Row(modifier.semantics { contentDescription = label }, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            repeat(wholes) { c ->
                Canvas(Modifier.size(d)) {
                    val r = size.minDimension / 2 - 2f
                    val ctr = Offset(size.width / 2, size.height / 2)
                    val box = Rect(ctr - Offset(r, r), Size(2 * r, 2 * r))
                    drawCircle(Color.Black.copy(alpha = .12f), r, ctr + Offset(0f, 3f))
                    for (i in 0 until den) {
                        val p = Path().apply {
                            if (den == 1) addOval(box) else { moveTo(ctr.x, ctr.y); arcTo(box, -90f + 360f * i / den, 360f / den, false); close() }
                        }
                        if (c * den + i < num) hatch(p, box) else drawPath(p, EMPTY)
                        drawPath(p, INK, style = Stroke(2.5f, join = StrokeJoin.Round))
                    }
                }
            }
        }
    }
}

/** A light bulb (off / glowing). */
fun DrawScope.drawBulb(center: Offset, r: Float, on: Boolean, glow: Float = if (on) 1f else 0f) {
    if (glow > 0f) {
        drawCircle(Brush.radialGradient(listOf(Color(0xCCFFE48A), Color(0x00FFE48A)), center, r * (2.2f + glow)), r * (2.2f + glow), center)
        for (k in 0 until 8) {
            val a = k / 8.0 * 2 * PI
            drawLine(Color(0xFFE8A93C), center + Offset((cos(a) * r * 1.25f).toFloat(), (sin(a) * r * 1.25f).toFloat()), center + Offset((cos(a) * r * (1.45f + .4f * glow)).toFloat(), (sin(a) * r * (1.45f + .4f * glow)).toFloat()), strokeWidth = r * .12f, cap = StrokeCap.Round)
        }
    }
    val glass = if (glow > 0f) Brush.radialGradient(listOf(Color(0xFFFFFBE0), lerp(Color(0xFFEDEFF5), Color(0xFFF6D365), glow)), center - Offset(r * .3f, r * .3f), r * 1.2f)
    else Brush.radialGradient(listOf(Color(0xFFFFFFFF), Color(0xFFD9DDE8)), center - Offset(r * .3f, r * .3f), r * 1.2f)
    drawCircle(Color.Black.copy(alpha = .15f), r, center + Offset(0f, r * .12f))
    drawCircle(glass, r, center)
    drawCircle(INK, r, center, style = Stroke(r * .12f))
    val f = Path().apply { moveTo(center.x - r * .4f, center.y + r * .2f); quadraticTo(center.x - r * .2f, center.y - r * .5f, center.x, center.y + r * .2f); quadraticTo(center.x + r * .2f, center.y - r * .5f, center.x + r * .4f, center.y + r * .2f) }
    drawPath(f, if (glow > 0f) Color(0xFFE07A1F) else Color(0xFF7A808F), style = Stroke(r * .1f, cap = StrokeCap.Round))
    val base = Rect(Offset(center.x - r * .45f, center.y + r * .78f), Size(r * .9f, r * .55f))
    drawRoundRect(Brush.verticalGradient(listOf(Color(0xFFC9CED8), Color(0xFF8A90A0)), base.top, base.bottom), base.topLeft, base.size, androidx.compose.ui.geometry.CornerRadius(r * .12f))
    drawRoundRect(INK, base.topLeft, base.size, androidx.compose.ui.geometry.CornerRadius(r * .12f), style = Stroke(r * .08f))
}

/** A knife switch: two terminals and a lever (closed = flat). */
fun DrawScope.drawSwitch(a: Offset, b: Offset, closed: Boolean, color: Color = INK, w: Float = 5f) {
    drawCircle(color, w * 1.1f, a); drawCircle(color, w * 1.1f, b)
    val dx = b.x - a.x; val dy = b.y - a.y
    val end = if (closed) b else Offset(a.x + dx * 0.85f + dy * 0.45f, a.y + dy * 0.85f - dx * 0.45f)
    drawLine(if (closed) Color(0xFF2F6B4F) else Color(0xFF94473B), a, end, strokeWidth = w, cap = StrokeCap.Round)
}

/** A cell / battery drawn as a glossy cylinder from left (−) to right (+). */
fun DrawScope.drawCell(topLeft: Offset, size: Size, label: String? = null) {
    val body = Rect(topLeft, Size(size.width * 0.9f, size.height))
    drawRoundRect(Color.Black.copy(alpha = .15f), body.topLeft + Offset(0f, 3f), body.size, androidx.compose.ui.geometry.CornerRadius(size.height * .2f))
    drawRoundRect(Brush.verticalGradient(listOf(Color(0xFF3B3F4A), Color(0xFF6B7080), Color(0xFF2A2D35)), body.top, body.bottom), body.topLeft, body.size, androidx.compose.ui.geometry.CornerRadius(size.height * .2f))
    val band = Rect(Offset(body.left + body.width * .62f, body.top), Size(body.width * .38f, body.height))
    drawRoundRect(Brush.verticalGradient(listOf(Color(0xFFE9A93C), Color(0xFFF6D365), Color(0xFFB9761F)), band.top, band.bottom), band.topLeft, band.size, androidx.compose.ui.geometry.CornerRadius(size.height * .2f))
    drawRoundRect(Brush.verticalGradient(listOf(Color(0xFFBFC4CE), Color(0xFF7E8494)), topLeft.y + size.height * .3f, topLeft.y + size.height * .7f), Offset(body.right, topLeft.y + size.height * .3f), Size(size.width * .1f, size.height * .4f), androidx.compose.ui.geometry.CornerRadius(3f))
    drawLine(Color.White.copy(alpha = .35f), Offset(body.left + 6f, body.top + size.height * .22f), Offset(body.right - 8f, body.top + size.height * .22f), strokeWidth = size.height * .1f, cap = StrokeCap.Round)
    @Suppress("UNUSED_EXPRESSION") label
}

/** Arrow from a to b with a filled head. */
fun DrawScope.drawArrow(a: Offset, b: Offset, color: Color, width: Float, head: Float = width * 3f) {
    val dx = b.x - a.x; val dy = b.y - a.y
    val len = kotlin.math.hypot(dx, dy)
    if (len < 1f) return
    val ux = dx / len; val uy = dy / len
    val h = minOf(head, len * .6f)
    val base = Offset(b.x - ux * h, b.y - uy * h)
    drawLine(color, a, base, strokeWidth = width, cap = StrokeCap.Round)
    val p = Path().apply { moveTo(b.x, b.y); lineTo(base.x - uy * h * .6f, base.y + ux * h * .6f); lineTo(base.x + uy * h * .6f, base.y - ux * h * .6f); close() }
    drawPath(p, color)
}

@Suppress("unused") private fun DrawScope.unusedTranslate() = translate(0f, 0f) {}
