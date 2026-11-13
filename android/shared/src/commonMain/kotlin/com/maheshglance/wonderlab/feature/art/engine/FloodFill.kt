package com.maheshglance.wonderlab.feature.art.engine

import kotlin.math.abs
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min

/**
 * Bounded scanline flood fill (port of the website's floodfill.ts) on ARGB int pixels
 * (android Bitmap.getPixels: non-premultiplied 0xAARRGGBB). The outline layer only provides a
 * boundary mask, dilated by 1px so fills cannot leak through tiny gaps in the line art.
 */
object FloodFill {
    fun outlineMask(px: IntArray, alphaThreshold: Int = 80): ByteArray {
        val m = ByteArray(px.size)
        for (i in px.indices) if ((px[i] ushr 24) > alphaThreshold) m[i] = 1
        return m
    }

    fun dilate(mask: ByteArray, w: Int, h: Int, r: Int = 1): ByteArray {
        if (r <= 0) return mask.copyOf()
        val tmp = ByteArray(w * h); val out = ByteArray(w * h)
        for (y in 0 until h) {
            val row = y * w
            for (x in 0 until w) {
                if (mask[row + x].toInt() == 0) continue
                for (k in max(0, x - r)..min(w - 1, x + r)) tmp[row + k] = 1
            }
        }
        for (x in 0 until w) for (y in 0 until h) {
            if (tmp[y * w + x].toInt() == 0) continue
            for (k in max(0, y - r)..min(h - 1, y + r)) out[k * w + x] = 1
        }
        return out
    }

    /** Fills the region connected to (sx, sy) with `argb`. Returns the filled pixel count; `px` is modified in place. */
    fun fill(px: IntArray, w: Int, h: Int, sxF: Float, syF: Float, argb: Int, tolerance: Int = 32, boundary: ByteArray? = null, bleed: Int = 0): Int {
        val sx = floor(sxF).toInt(); val sy = floor(syF).toInt()
        if (sx < 0 || sy < 0 || sx >= w || sy >= h) return 0
        val si = sy * w + sx
        if (boundary != null && boundary[si].toInt() != 0) return 0
        val mask = ByteArray(w * h)
        val s = px[si]
        val s3 = s ushr 24; val s0 = (s shr 16) and 255; val s1 = (s shr 8) and 255; val s2 = s and 255
        fun ok(i: Int): Boolean {
            if (mask[i].toInt() != 0 || (boundary != null && boundary[i].toInt() != 0)) return false
            val p = px[i]; val a = p ushr 24
            if (s3 == 0 && a == 0) return true
            return abs(((p shr 16) and 255) - s0) <= tolerance && abs(((p shr 8) and 255) - s1) <= tolerance && abs((p and 255) - s2) <= tolerance && abs(a - s3) <= tolerance
        }
        var count = 0
        val stack = IntArrayStack()
        stack.push(sx); stack.push(sy)
        while (stack.size > 0) {
            val y = stack.pop(); val x0 = stack.pop()
            val row = y * w
            if (!ok(row + x0)) continue
            var l = x0; var r = x0
            while (l > 0 && ok(row + l - 1)) l--
            while (r < w - 1 && ok(row + r + 1)) r++
            for (x in l..r) { mask[row + x] = 1; count++ }
            for (ny in intArrayOf(y - 1, y + 1)) {
                if (ny < 0 || ny >= h) continue
                val nrow = ny * w
                var inRun = false
                for (x in l..r) {
                    val good = ok(nrow + x)
                    if (good && !inRun) { stack.push(x); stack.push(ny); inRun = true } else if (!good) inRun = false
                }
            }
        }
        if (count == 0) return 0
        var paint = mask
        if (boundary != null && bleed > 0) {
            val grown = dilate(mask, w, h, bleed)
            paint = ByteArray(w * h)
            for (i in 0 until w * h) if (mask[i].toInt() != 0 || (grown[i].toInt() != 0 && boundary[i].toInt() != 0)) paint[i] = 1
        }
        for (i in 0 until w * h) if (paint[i].toInt() != 0) px[i] = argb
        return count
    }

    private class IntArrayStack {
        private var a = IntArray(4096)
        var size = 0; private set
        fun push(v: Int) { if (size == a.size) a = a.copyOf(a.size * 2); a[size++] = v }
        fun pop() = a[--size]
    }
}
