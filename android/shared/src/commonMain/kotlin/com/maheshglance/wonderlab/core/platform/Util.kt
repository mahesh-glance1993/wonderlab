package com.maheshglance.wonderlab.core.platform

import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.pow
import kotlin.math.roundToLong
import kotlin.time.Clock
import kotlin.time.ExperimentalTime
import kotlin.uuid.Uuid

/** Small helpers that replace java.* APIs so the same code runs on Android and iOS. */

@OptIn(ExperimentalTime::class)
fun nowMillis(): Long = Clock.System.now().toEpochMilliseconds()

/** Monotonic nanoseconds (for frame timing / unique ids). */
fun nanoTime(): Long = MONO_START.elapsedNow().inWholeNanoseconds
private val MONO_START = kotlin.time.TimeSource.Monotonic.markNow()

fun randomUuid(): String = Uuid.random().toString()

fun toRadians(deg: Double): Double = deg / 180.0 * PI
fun toDegrees(rad: Double): Double = rad * 180.0 / PI

/** Form-style URL encoding (like java.net.URLEncoder: spaces become "+"). */
fun urlEncode(s: String): String {
    val sb = StringBuilder()
    for (b in s.encodeToByteArray()) {
        val c = b.toInt() and 0xFF
        when {
            c in 'a'.code..'z'.code || c in 'A'.code..'Z'.code || c in '0'.code..'9'.code || c == '.'.code || c == '-'.code || c == '*'.code || c == '_'.code -> sb.append(c.toChar())
            c == ' '.code -> sb.append('+')
            else -> { sb.append('%'); sb.append(HEX[c shr 4]); sb.append(HEX[c and 0xF]) }
        }
    }
    return sb.toString()
}

/** Path-segment encoding (spaces become %20). */
fun encodePathSegment(s: String): String = urlEncode(s).replace("+", "%20")

private const val HEX = "0123456789ABCDEF"

fun pad2(n: Int): String = n.toString().padStart(2, '0')
fun pad2(n: Long): String = n.toString().padStart(2, '0')

/** Fixed decimals, e.g. fmtFixed(3.14159, 2) = "3.14" (always '.' as the separator). */
fun fmtFixed(v: Double, decimals: Int): String {
    if (v.isNaN()) return "NaN"
    if (v.isInfinite()) return if (v > 0) "∞" else "-∞"
    if (decimals <= 0) return v.roundToLong().toString()
    val f = 10.0.pow(decimals)
    val r = (abs(v) * f).roundToLong()
    val whole = r / f.toLong()
    val frac = (r % f.toLong()).toString().padStart(decimals, '0')
    return (if (v < 0 && r != 0L) "-" else "") + "$whole.$frac"
}

/** Like "%.Ng": N significant digits, then trailing zeros trimmed by the caller if wanted. */
fun fmtSignificant(v: Double, digits: Int): String {
    if (v == 0.0 || v.isNaN() || v.isInfinite()) return fmtFixed(v, 0)
    val mag = kotlin.math.floor(kotlin.math.log10(abs(v))).toInt()
    val decimals = (digits - 1 - mag).coerceAtLeast(0)
    return fmtFixed(v, decimals)
}

/** "#RRGGBB" hex for a packed RGB int. */
fun hexRgb(rgb: Int): String = "#" + (rgb and 0xFFFFFF).toString(16).uppercase().padStart(6, '0')

/** Lower-case hex of bytes. */
fun ByteArray.toHex(): String = joinToString("") { (it.toInt() and 0xFF).toString(16).padStart(2, '0') }

/** Byte sizes for people: "1.2 MB". */
fun formatBytes(b: Long): String = when {
    b >= 1L shl 30 -> fmtFixed(b / (1L shl 30).toDouble(), 1) + " GB"
    b >= 1L shl 20 -> fmtFixed(b / (1L shl 20).toDouble(), 1) + " MB"
    b >= 1L shl 10 -> fmtFixed(b / 1024.0, 0) + " KB"
    else -> "$b B"
}

/** Local date/time strings in the device's style ("13 Nov 2026", "13 Nov 2026, 10:42"). */
expect fun formatDate(epochMillis: Long): String
expect fun formatDateTime(epochMillis: Long): String
/** "YYYY-MM-DD" in local time. */
expect fun isoLocalDate(epochMillis: Long): String

/** SHA-256 of text as lower-case hex. */
fun sha256Hex(text: String): String = Sha256.digest(text.encodeToByteArray()).toHex()

/** Pure-Kotlin SHA-256 (used only for short cache keys). */
internal object Sha256 {
    private val K = "428a2f98 71374491 b5c0fbcf e9b5dba5 3956c25b 59f111f1 923f82a4 ab1c5ed5 d807aa98 12835b01 243185be 550c7dc3 72be5d74 80deb1fe 9bdc06a7 c19bf174 e49b69c1 efbe4786 0fc19dc6 240ca1cc 2de92c6f 4a7484aa 5cb0a9dc 76f988da 983e5152 a831c66d b00327c8 bf597fc7 c6e00bf3 d5a79147 06ca6351 14292967 27b70a85 2e1b2138 4d2c6dfc 53380d13 650a7354 766a0abb 81c2c92e 92722c85 a2bfe8a1 a81a664b c24b8b70 c76c51a3 d192e819 d6990624 f40e3585 106aa070 19a4c116 1e376c08 2748774c 34b0bcb5 391c0cb3 4ed8aa4a 5b9cca4f 682e6ff3 748f82ee 78a5636f 84c87814 8cc70208 90befffa a4506ceb bef9a3f7 c67178f2".split(' ').map { it.toLong(16).toInt() }.toIntArray()
    private val H0 = "6a09e667 bb67ae85 3c6ef372 a54ff53a 510e527f 9b05688c 1f83d9ab 5be0cd19".split(' ').map { it.toLong(16).toInt() }.toIntArray()

    fun digest(msg: ByteArray): ByteArray {
        val h = H0.copyOf()
        val bitLen = msg.size.toLong() * 8
        val padLen = ((msg.size + 9 + 63) / 64) * 64
        val data = ByteArray(padLen)
        msg.copyInto(data)
        data[msg.size] = 0x80.toByte()
        for (i in 0 until 8) data[padLen - 1 - i] = (bitLen ushr (8 * i)).toByte()
        val w = IntArray(64)
        for (chunk in 0 until padLen / 64) {
            for (i in 0 until 16) {
                val o = chunk * 64 + i * 4
                w[i] = ((data[o].toInt() and 0xFF) shl 24) or ((data[o + 1].toInt() and 0xFF) shl 16) or ((data[o + 2].toInt() and 0xFF) shl 8) or (data[o + 3].toInt() and 0xFF)
            }
            for (i in 16 until 64) {
                val s0 = w[i - 15].rotateRight(7) xor w[i - 15].rotateRight(18) xor (w[i - 15] ushr 3)
                val s1 = w[i - 2].rotateRight(17) xor w[i - 2].rotateRight(19) xor (w[i - 2] ushr 10)
                w[i] = w[i - 16] + s0 + w[i - 7] + s1
            }
            var a = h[0]; var b = h[1]; var c = h[2]; var d = h[3]; var e = h[4]; var f = h[5]; var g = h[6]; var hh = h[7]
            for (i in 0 until 64) {
                val s1 = e.rotateRight(6) xor e.rotateRight(11) xor e.rotateRight(25)
                val ch = (e and f) xor (e.inv() and g)
                val t1 = hh + s1 + ch + K[i] + w[i]
                val s0 = a.rotateRight(2) xor a.rotateRight(13) xor a.rotateRight(22)
                val maj = (a and b) xor (a and c) xor (b and c)
                val t2 = s0 + maj
                hh = g; g = f; f = e; e = d + t1; d = c; c = b; b = a; a = t1 + t2
            }
            h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += hh
        }
        val out = ByteArray(32)
        for (i in 0 until 8) for (j in 0 until 4) out[i * 4 + j] = (h[i] ushr (24 - 8 * j)).toByte()
        return out
    }
}

/** Long in another radix (like java.lang.Long.toString(v, radix)). */
fun longToString(v: Long, radix: Int): String = v.toString(radix)
