package com.maheshglance.wonderlab.feature.art.engine

import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.asSkiaBitmap
import androidx.compose.ui.graphics.toComposeImageBitmap
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import org.jetbrains.skia.ColorAlphaType
import org.jetbrains.skia.ColorType
import org.jetbrains.skia.EncodedImageFormat
import org.jetbrains.skia.Image
import org.jetbrains.skia.ImageInfo

actual fun ImageBitmap.writePixels(px: IntArray, x: Int, y: Int, w: Int, h: Int) {
    if (w <= 0 || h <= 0) return
    val bytes = ByteArray(w * h * 4)
    for (i in 0 until w * h) {
        val c = px[i]
        val o = i * 4
        bytes[o] = (c and 0xFF).toByte()
        bytes[o + 1] = ((c shr 8) and 0xFF).toByte()
        bytes[o + 2] = ((c shr 16) and 0xFF).toByte()
        bytes[o + 3] = (c ushr 24).toByte()
    }
    val img = Image.makeRaster(ImageInfo(w, h, ColorType.BGRA_8888, ColorAlphaType.UNPREMUL), bytes, w * 4)
    try {
        Canvas(this).drawImageRect(
            img.toComposeImageBitmap(), IntOffset.Zero, IntSize(w, h), IntOffset(x, y), IntSize(w, h),
            Paint().apply { blendMode = BlendMode.Src; filterQuality = FilterQuality.None },
        )
    } finally { img.close() }
}

actual fun encodeArtImage(img: ImageBitmap, format: String, quality: Int): ByteArray {
    val fmt = when (format) {
        "jpeg" -> EncodedImageFormat.JPEG
        "webp" -> EncodedImageFormat.WEBP
        else -> EncodedImageFormat.PNG
    }
    val image = Image.makeFromBitmap(img.asSkiaBitmap())
    try { return image.encodeToData(fmt, quality)?.bytes ?: ByteArray(0) } finally { image.close() }
}

actual fun decodeArtImage(bytes: ByteArray): ImageBitmap? =
    runCatching {
        val img = Image.makeFromEncoded(bytes)
        try { img.toComposeImageBitmap() } finally { img.close() }
    }.getOrNull()

actual fun ImageBitmap.release() { /* Skia frees the pixels when the bitmap is garbage-collected */ }

actual val ImageBitmap.isReleased: Boolean get() = false

actual fun Paint.artShadow(radius: Float, dx: Float, dy: Float, color: Int) {
    // Skia's drop shadow draws the shadow and the shape, like Android's shadow layer (blur radius → sigma)
    val sigma = radius * 0.57735f + 0.5f
    asFrameworkPaint().imageFilter = org.jetbrains.skia.ImageFilter.makeDropShadow(dx, dy, sigma, sigma, color)
}
