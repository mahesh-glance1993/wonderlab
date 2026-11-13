package com.maheshglance.wonderlab.feature.language

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.DrawStyle
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.platform.LocalFontFamilyResolver
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.sp
import kotlinx.atomicfu.locks.SynchronizedObject
import kotlinx.atomicfu.locks.synchronized
import kotlin.math.ceil

// Glyph drawing for tracing and printable sheets with Compose text (works on every platform). The measurer uses a
// density of 1, so font sizes are plain pixels, exactly like the canvas Paint.textSize it replaces.

/** A text measurer whose sizes are in pixels (density 1). */
@Composable
fun rememberPxTextMeasurer(): TextMeasurer {
    val resolver = LocalFontFamilyResolver.current
    return remember(resolver) { TextMeasurer(resolver, Density(1f, 1f), LayoutDirection.Ltr, 16) }
}

/** Course font for tracing and sheets (website TRACE_FONT: Noto Sans Telugu weight 600 / Andika bold). */
fun traceStyle(script: String, sizePx: Float, color: Color = Color.Black): TextStyle =
    TextStyle(fontFamily = scriptFont(script), fontWeight = if (script == "te") FontWeight.SemiBold else FontWeight.Bold, fontSize = sizePx.sp, color = color)

/** Plain (system font) text style in pixels. */
fun plainStyle(sizePx: Float, color: Color, bold: Boolean = false): TextStyle =
    TextStyle(fontFamily = FontFamily.Default, fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal, fontSize = sizePx.sp, color = color)

fun TextMeasurer.line(text: String, style: TextStyle): TextLayoutResult =
    measure(text, style, overflow = TextOverflow.Clip, softWrap = false, maxLines = 1)

/** Draws a measured single line with its baseline at (x, baselineY). */
fun DrawScope.drawLineAt(layout: TextLayoutResult, x: Float, baselineY: Float, color: Color = Color.Unspecified, style: DrawStyle = Fill) =
    drawText(layout, color = color, topLeft = Offset(x, baselineY - layout.firstBaseline), drawStyle = style)

private const val REF_SIZE = 200f
private val inkLock = SynchronizedObject()
private val inkCache = mutableMapOf<String, Rect>()

/**
 * Ink bounds of a glyph in units of the font size, relative to the pen position on the baseline (like
 * Paint.getTextPath + Path.computeBounds). Found once per glyph by rendering it at a reference size.
 */
fun glyphInkBounds(measurer: TextMeasurer, text: String, script: String): Rect {
    val key = "$script|$text"
    synchronized(inkLock) { inkCache[key] }?.let { return it }
    val lay = measurer.line(text, traceStyle(script, REF_SIZE))
    val m = ceil(REF_SIZE * 0.75f).toInt()
    val w = lay.size.width + 2 * m
    val h = lay.size.height + 2 * m
    val img = ImageBitmap(w, h)
    CanvasDrawScope().draw(Density(1f), LayoutDirection.Ltr, Canvas(img), Size(w.toFloat(), h.toFloat())) {
        drawText(lay, color = Color.Black, topLeft = Offset(m.toFloat(), m.toFloat()))
    }
    val px = IntArray(w * h)
    img.readPixels(px)
    var l = w; var t = h; var r = -1; var b = -1
    for (y in 0 until h) {
        val row = y * w
        for (x in 0 until w) if ((px[row + x] ushr 24) and 0xff != 0) {
            if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y
        }
    }
    val base = m + lay.firstBaseline
    val rect = if (r < 0) Rect(0f, 0f, 0f, 0f)
    else Rect((l - m) / REF_SIZE, (t - base) / REF_SIZE, (r + 1 - m) / REF_SIZE, (b + 1 - base) / REF_SIZE)
    synchronized(inkLock) { inkCache[key] = rect }
    return rect
}
