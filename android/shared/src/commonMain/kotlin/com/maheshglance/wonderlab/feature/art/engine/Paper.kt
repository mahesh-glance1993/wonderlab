package com.maheshglance.wonderlab.feature.art.engine

import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.ImageShader
import androidx.compose.ui.graphics.Shader
import androidx.compose.ui.graphics.TileMode
import kotlinx.atomicfu.locks.SynchronizedObject
import kotlinx.atomicfu.locks.synchronized
import kotlin.math.PI
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin

/**
 * Procedural paper textures (port of the website's paper.ts). Each paper is a tileable 256×256 height map
 * (0 = valley, 1 = peak); crayons and pencils deposit pigment on the peaks so the grain shows through.
 */
object Paper {
    const val GRAIN = 256
    val COLORS = mapOf("smooth" to "#ffffff", "warm" to "#faf6ec", "sketch" to "#fcfbf7", "watercolor" to "#fbf8f0", "canvas" to "#f6f2e8", "kraft" to "#c8a679")
    val PAPERS = listOf("smooth" to "Smooth white", "warm" to "Warm cream", "sketch" to "Sketch paper", "watercolor" to "Watercolour paper", "canvas" to "Canvas", "kraft" to "Brown kraft")

    private fun valueNoise(cells: Int, seed: Long): FloatArray {
        val rnd = Mulberry32(seed)
        val lat = FloatArray(cells * cells) { rnd.next().toFloat() }
        val out = FloatArray(GRAIN * GRAIN)
        val s = GRAIN.toFloat() / cells
        fun fade(t: Float) = t * t * (3 - 2 * t)
        for (y in 0 until GRAIN) {
            val gy = y / s; val y0 = floor(gy).toInt(); val ty = fade(gy - y0); val y1 = (y0 + 1) % cells
            for (x in 0 until GRAIN) {
                val gx = x / s; val x0 = floor(gx).toInt(); val tx = fade(gx - x0); val x1 = (x0 + 1) % cells
                val a = lat[y0 * cells + x0]; val b = lat[y0 * cells + x1]; val c = lat[y1 * cells + x0]; val d = lat[y1 * cells + x1]
                out[y * GRAIN + x] = (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty
            }
        }
        return out
    }

    private val lock = SynchronizedObject()
    private val cache = HashMap<String, FloatArray>()
    fun grainTile(kind: String): FloatArray = synchronized(lock) { grainTileLocked(kind) }

    private fun grainTileLocked(kind: String): FloatArray {
        cache[kind]?.let { return it }
        val g = FloatArray(GRAIN * GRAIN)
        fun add(n: FloatArray, w: Float) { for (i in g.indices) g[i] += n[i] * w }
        when (kind) {
            "sketch" -> { add(valueNoise(128, 21), 0.55f); add(valueNoise(64, 22), 0.3f); add(valueNoise(16, 23), 0.15f) }
            "watercolor" -> { add(valueNoise(32, 31), 0.45f); add(valueNoise(64, 32), 0.3f); add(valueNoise(128, 33), 0.25f) }
            "canvas" -> {
                val n = valueNoise(128, 41)
                for (y in 0 until GRAIN) for (x in 0 until GRAIN) {
                    val weave = ((sin(x * PI * 2 / 8) * sin(y * PI * 2 / 8) + 1) / 2).toFloat()
                    g[y * GRAIN + x] = weave * 0.65f + n[y * GRAIN + x] * 0.35f
                }
            }
            "kraft" -> {
                val n = valueNoise(64, 51); val f = valueNoise(16, 52)
                for (y in 0 until GRAIN) for (x in 0 until GRAIN) {
                    val fibre = ((sin(x * 0.9 + f[y * GRAIN + x] * 14) + 1) / 2).toFloat()
                    g[y * GRAIN + x] = n[y * GRAIN + x] * 0.6f + fibre * 0.4f
                }
            }
            else -> { add(valueNoise(128, 11), 0.7f); add(valueNoise(64, 12), 0.3f) } // smooth, warm
        }
        var lo = Float.POSITIVE_INFINITY; var hi = Float.NEGATIVE_INFINITY
        for (v in g) { lo = min(lo, v); hi = max(hi, v) }
        val span = (hi - lo).takeIf { it != 0f } ?: 1f
        for (i in g.indices) g[i] = (g[i] - lo) / span
        cache[kind] = g
        return g
    }

    /** Alpha (0..255) a grainy medium leaves at a pixel of height g for a given coverage 0..1. */
    fun grainAlpha(g: Float, coverage: Float, softness: Float): Int {
        val edge = 1 - coverage
        val a = (g - edge + softness) / (softness * 2)
        return (min(1f, max(0f, a)) * 255).roundToInt()
    }

    // tinted grain tiles (bitmap per paper|colour|coverage bucket|softness), LRU-limited
    private val tiles = LinkedHashMap<String, ImageBitmap>()

    fun grainTileBitmap(paper: String, r: Int, g: Int, b: Int, coverage: Float, softness: Float): ImageBitmap = synchronized(lock) {
        val bucket = (coverage * 16).roundToInt() / 16f
        val key = "$paper|$r,$g,$b|$bucket|$softness"
        tiles.remove(key)?.let { tiles[key] = it; return@synchronized it } // most recently used goes last
        val h = grainTileLocked(paper)
        val px = IntArray(GRAIN * GRAIN)
        for (i in px.indices) {
            val a = grainAlpha(h[i], bucket, softness)
            px[i] = (a shl 24) or (r shl 16) or (g shl 8) or b
        }
        val bmp = imageFromPixels(px, GRAIN, GRAIN)
        tiles[key] = bmp
        while (tiles.size > 80) tiles.remove(tiles.keys.first())
        bmp
    }

    fun grainShader(paper: String, r: Int, g: Int, b: Int, coverage: Float, softness: Float): Shader =
        ImageShader(grainTileBitmap(paper, r, g, b, coverage, softness), TileMode.Repeated, TileMode.Repeated)
}
