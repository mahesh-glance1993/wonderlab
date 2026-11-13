package com.maheshglance.wonderlab.feature.art.engine

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.graphics.asImageBitmap
import java.io.ByteArrayOutputStream

actual fun ImageBitmap.writePixels(px: IntArray, x: Int, y: Int, w: Int, h: Int) {
    asAndroidBitmap().setPixels(px, 0, w, x, y, w, h)
}

actual fun encodeArtImage(img: ImageBitmap, format: String, quality: Int): ByteArray {
    val out = ByteArrayOutputStream()
    val fmt = when (format) {
        "jpeg" -> Bitmap.CompressFormat.JPEG
        "webp" -> if (Build.VERSION.SDK_INT >= 30) Bitmap.CompressFormat.WEBP_LOSSY else @Suppress("DEPRECATION") Bitmap.CompressFormat.WEBP
        else -> Bitmap.CompressFormat.PNG
    }
    img.asAndroidBitmap().compress(fmt, quality, out)
    return out.toByteArray()
}

actual fun decodeArtImage(bytes: ByteArray): ImageBitmap? =
    runCatching { BitmapFactory.decodeByteArray(bytes, 0, bytes.size)?.asImageBitmap() }.getOrNull()

actual fun ImageBitmap.release() { asAndroidBitmap().recycle() }

actual val ImageBitmap.isReleased: Boolean get() = asAndroidBitmap().isRecycled

actual fun Paint.artShadow(radius: Float, dx: Float, dy: Float, color: Int) { asFrameworkPaint().setShadowLayer(radius, dx, dy, color) }
