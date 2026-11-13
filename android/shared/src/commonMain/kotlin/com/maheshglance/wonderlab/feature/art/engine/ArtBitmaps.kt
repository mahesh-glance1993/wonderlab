package com.maheshglance.wonderlab.feature.art.engine

import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.sp
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight

/*
 * Pixel-level bitmap helpers the art engine needs beyond Compose's common graphics API
 * (writing pixels back, JPEG/WebP encoding, freeing big bitmaps early). One small actual per platform:
 * Android uses android.graphics.Bitmap directly (same behaviour as before the multiplatform port),
 * iOS uses Skia.
 */

/** Writes non-premultiplied 0xAARRGGBB pixels into the rectangle (x, y, w, h) of a mutable bitmap. */
expect fun ImageBitmap.writePixels(px: IntArray, x: Int = 0, y: Int = 0, w: Int = width, h: Int = height)

/** Encodes as "png" | "jpeg" | "webp" (lossy, quality 0..100). */
expect fun encodeArtImage(img: ImageBitmap, format: String, quality: Int): ByteArray

/** Decodes PNG / JPEG / WebP bytes. */
expect fun decodeArtImage(bytes: ByteArray): ImageBitmap?

/** Frees the pixel memory now (Android Bitmap.recycle); the bitmap must not be used afterwards. */
expect fun ImageBitmap.release()

/** True after [release]. */
expect val ImageBitmap.isReleased: Boolean

/** Soft drop shadow under whatever this paint draws (android Paint.setShadowLayer). */
expect fun Paint.artShadow(radius: Float, dx: Float, dy: Float, color: Int)

/** Reads all pixels (non-premultiplied 0xAARRGGBB). */
fun ImageBitmap.pixels(): IntArray = IntArray(width * height).also { readPixels(it, 0, 0, width, height) }

/** One pixel (non-premultiplied 0xAARRGGBB). */
fun ImageBitmap.pixel(x: Int, y: Int): Int = IntArray(1).also { readPixels(it, x, y, 1, 1) }[0]

/** Makes every pixel transparent. */
fun ImageBitmap.erase() {
    Canvas(this).drawRect(0f, 0f, width.toFloat(), height.toFloat(), Paint().apply { blendMode = BlendMode.Clear })
}

/** Runs DrawScope drawing code against a Compose Canvas (1 px = 1 unit). */
fun Canvas.drawScope(w: Float, h: Float, block: DrawScope.() -> Unit) {
    CanvasDrawScope().draw(Density(1f), LayoutDirection.Ltr, this, Size(w, h), block)
}

/** Builds a new bitmap from non-premultiplied 0xAARRGGBB pixels. */
fun imageFromPixels(px: IntArray, w: Int, h: Int): ImageBitmap = ImageBitmap(w, h).also { it.writePixels(px, 0, 0, w, h) }

enum class TextAnchor { Start, Middle, End }

/**
 * Single-line text with its baseline at y (like android Canvas.drawText with Paint.Align), sized in canvas units.
 * Does nothing without a TextMeasurer (see [Templates.rememberTextSupport]).
 */
fun Canvas.drawArtText(
    tm: TextMeasurer?, text: String, x: Float, y: Float, sizePx: Float, color: Color,
    anchor: TextAnchor = TextAnchor.Start, bold: Boolean = false, family: FontFamily = FontFamily.SansSerif,
) {
    if (tm == null || text.isEmpty() || sizePx <= 0f) return
    val style = TextStyle(color = color, fontSize = sizePx.sp, fontFamily = family, fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal)
    val layout = runCatching { tm.measure(text, style, softWrap = false, maxLines = 1, density = Density(1f)) }.getOrNull() ?: return
    val lw = layout.size.width.toFloat()
    val left = when (anchor) { TextAnchor.Middle -> x - lw / 2; TextAnchor.End -> x - lw; TextAnchor.Start -> x }
    drawScope(1f, 1f) { drawText(layout, topLeft = Offset(left, y - layout.firstBaseline)) }
}
