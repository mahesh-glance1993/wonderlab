package com.maheshglance.wonderlab.feature.art.engine

import com.maheshglance.wonderlab.core.platform.*

import kotlin.math.abs
import kotlin.math.atan
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sqrt
import kotlin.math.tan

// Native ports of the website's pure art maths (src/features/art/engine/{color,rng,brushes,pressure}.ts).
// Kept numerically identical so strokes replay the same on the web and in the app.

fun clamp(v: Float, lo: Float = 0f, hi: Float = 1f) = min(hi, max(lo, v))
fun clampD(v: Double, lo: Double = 0.0, hi: Double = 1.0) = min(hi, max(lo, v))

// ---------------- colour ----------------
object ArtColor {
    /** h 0..360, s and v 0..1 → [r, g, b] 0..255 */
    fun hsvToRgb(h: Float, s: Float, v: Float): IntArray {
        val c = v * s
        val hp = (((h % 360f) + 360f) % 360f) / 60f
        val x = c * (1 - abs((hp % 2f) - 1))
        val (r, g, b) = when {
            hp < 1 -> Triple(c, x, 0f); hp < 2 -> Triple(x, c, 0f); hp < 3 -> Triple(0f, c, x)
            hp < 4 -> Triple(0f, x, c); hp < 5 -> Triple(x, 0f, c); else -> Triple(c, 0f, x)
        }
        val m = v - c
        return intArrayOf(((r + m) * 255).roundToInt(), ((g + m) * 255).roundToInt(), ((b + m) * 255).roundToInt())
    }

    fun rgbToHsv(rgb: IntArray): FloatArray {
        val r = rgb[0] / 255f; val g = rgb[1] / 255f; val b = rgb[2] / 255f
        val mx = max(r, max(g, b)); val mn = min(r, min(g, b)); val d = mx - mn
        var h = 0f
        if (d != 0f) h = when (mx) {
            r -> 60 * (((g - b) / d) % 6)
            g -> 60 * ((b - r) / d + 2)
            else -> 60 * ((r - g) / d + 4)
        }
        if (h < 0) h += 360f
        return floatArrayOf(h, if (mx != 0f) d / mx else 0f, mx)
    }

    private val HEX3 = Regex("^[0-9a-fA-F]{3}$")
    private val HEX6 = Regex("^[0-9a-fA-F]{6}$")
    fun parseHex(s: String?): IntArray? {
        var t = (s ?: return null).trim().removePrefix("#")
        if (HEX3.matches(t)) t = t.map { "$it$it" }.joinToString("")
        if (!HEX6.matches(t)) return null
        return intArrayOf(t.substring(0, 2).toInt(16), t.substring(2, 4).toInt(16), t.substring(4, 6).toInt(16))
    }

    fun toHex(c: IntArray): String = "#" + c.take(3).joinToString("") { Integer.toHexString(it.coerceIn(0, 255)).padStart(2, '0') }
    fun toHex(r: Float, g: Float, b: Float) = toHex(intArrayOf(r.roundToInt(), g.roundToInt(), b.roundToInt()))
    fun normalizeHex(s: String) = parseHex(s)?.let { toHex(it) }

    /** android.graphics colour int (opaque) for a hex string. */
    fun argb(hex: String?, fallback: Int = 0xFF000000.toInt()): Int {
        val c = parseHex(hex) ?: return fallback
        return (0xFF shl 24) or (c[0] shl 16) or (c[1] shl 8) or c[2]
    }

    fun mix(a: FloatArray, b: FloatArray, t: Float) = floatArrayOf(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)
    fun shade(c: FloatArray, amt: Float) = if (amt >= 0) mix(c, floatArrayOf(255f, 255f, 255f), amt) else mix(c, floatArrayOf(0f, 0f, 0f), -amt)

    private data class Named(val c: IntArray, val en: String, val te: String)
    private val NAMES = listOf(
        "#000000" to ("black" to "నలుపు"), "#ffffff" to ("white" to "తెలుపు"), "#808080" to ("grey" to "బూడిద"), "#c0c0c0" to ("light grey" to "లేత బూడిద"),
        "#e53935" to ("red" to "ఎరుపు"), "#8b1e1e" to ("dark red" to "ముదురు ఎరుపు"), "#fb8c00" to ("orange" to "నారింజ"), "#fdd835" to ("yellow" to "పసుపు"),
        "#43a047" to ("green" to "ఆకుపచ్చ"), "#1b5e20" to ("dark green" to "ముదురు ఆకుపచ్చ"), "#9ccc65" to ("light green" to "లేత ఆకుపచ్చ"),
        "#1e88e5" to ("blue" to "నీలం"), "#0d2c6b" to ("navy blue" to "ముదురు నీలం"), "#81d4fa" to ("sky blue" to "ఆకాశ నీలం"), "#26a69a" to ("teal" to "నీలి ఆకుపచ్చ"),
        "#8e24aa" to ("purple" to "ఊదా"), "#ec407a" to ("pink" to "గులాబీ"), "#f8bbd0" to ("light pink" to "లేత గులాబీ"), "#6d4c41" to ("brown" to "గోధుమ"),
        "#d7b98e" to ("tan" to "లేత గోధుమ"), "#ffccbc" to ("peach" to "పీచ్"),
    ).map { (h, n) -> Named(parseHex(h)!!, n.first, n.second) }

    /** Nearest friendly colour name, so colour is never conveyed by swatch alone. */
    fun colorName(hex: String, lang: String = "en"): String {
        val c = parseHex(hex) ?: return hex
        var best = NAMES[0]; var bd = Double.MAX_VALUE
        for (n in NAMES) {
            val d = (n.c[0] - c[0]).toDouble().let { it * it } * 0.3 + (n.c[1] - c[1]).toDouble().let { it * it } * 0.59 + (n.c[2] - c[2]).toDouble().let { it * it } * 0.11
            if (d < bd) { bd = d; best = n }
        }
        return if (lang == "te") best.te else best.en
    }
}

// ---------------- seeded PRNG (identical to the website's mulberry32) ----------------
class Mulberry32(seed: Long) {
    private var a: Int = seed.toInt()
    fun next(): Double {
        a += 0x6d2b79f5
        var t = (a xor (a ushr 15)) * (1 or a)
        t = (t + ((t xor (t ushr 7)) * (61 or t))) xor t
        return ((t xor (t ushr 14)).toLong() and 0xffffffffL).toDouble() / 4294967296.0
    }
}

object ArtIds {
    private var counter = 0
    private val rnd = java.util.Random()
    fun newSeed(): Long = (rnd.nextDouble() * 2147483648.0).toLong()
    /** Short ids for ops/layers inside a project (same shape as the website's shortId). */
    fun shortId(): String {
        val t = longToString(nowMillis(), 36)
        val c = Integer.toString(counter++ % 1296, 36).padStart(2, '0')
        val r = Integer.toString(rnd.nextInt(1296), 36)
        return t + c + r
    }
    fun uuid(): String = randomUuid()
    val UUID_RE = Regex("^[0-9a-fA-F-]{36}$")
}

// ---------------- brushes ----------------
enum class BrushTarget { Buffer, Direct }

data class BrushDef(
    val id: String, val label: String, val labelTe: String, val spacing: Float, val target: BrushTarget,
    val defaultSize: Int, val strokeAlpha: Float, val hint: String, val usesTilt: Boolean = false, val fixedColor: String? = null,
    /** realistic picture used on the tool button (bundled 3D emoji) */
    val emoji: String,
)

data class Dab(val radius: Float, val alpha: Float, val coverage: Float)

object Brushes {
    val ALL: Map<String, BrushDef> = listOf(
        BrushDef("graphite", "Pencil", "పెన్సిల్", 0.18f, BrushTarget.Buffer, 6, 1f, "Grey graphite. Press harder for darker lines; tilt the pen to shade.", usesTilt = true, fixedColor = "#3d4046", emoji = "✏️"),
        BrushDef("colorPencil", "Colour pencil", "రంగు పెన్సిల్", 0.18f, BrushTarget.Buffer, 8, 1f, "Grainy colour that builds up. Tilt to shade.", usesTilt = true, emoji = "✏️"),
        BrushDef("crayon", "Crayon", "క్రేయాన్", 0.15f, BrushTarget.Buffer, 18, 0.95f, "Waxy colour that shows the paper grain. Press harder to fill gaps.", emoji = "🖍️"),
        BrushDef("oil", "Oil paint", "ఆయిల్ పెయింట్", 0.12f, BrushTarget.Direct, 26, 1f, "Thick, opaque paint that picks up and smears colours underneath.", emoji = "🖌️"),
        BrushDef("watercolor", "Watercolour", "వాటర్ కలర్", 0.14f, BrushTarget.Buffer, 34, 0.6f, "See-through washes with darker wet edges. Layer strokes to build colour.", emoji = "💧"),
        BrushDef("marker", "Marker", "మార్కర్", 0.08f, BrushTarget.Buffer, 16, 0.8f, "Flat, even colour. Overlaps get a little darker.", emoji = "🖊️"),
        BrushDef("ink", "Ink pen", "ఇంక్ పెన్", 0.08f, BrushTarget.Buffer, 10, 1f, "Crisp lines. Press harder for thicker lines.", emoji = "🖋️"),
        BrushDef("airbrush", "Airbrush", "ఎయిర్ బ్రష్", 0.12f, BrushTarget.Buffer, 50, 1f, "Soft spray. Press harder (or go over again) for more paint.", emoji = "💨"),
        BrushDef("eraser", "Eraser", "రబ్బరు", 0.12f, BrushTarget.Direct, 28, 1f, "Rubs out on the selected layer only. Outlines are safe.", emoji = "🧽"),
    ).associateBy { it.id }
    val ORDER = listOf("graphite", "colorPencil", "crayon", "marker", "watercolor", "oil", "ink", "airbrush", "eraser")
    val EARLY = listOf("crayon", "marker", "watercolor", "eraser")
    val SIZE_PRESETS = listOf(4, 10, 24, 48, 90)

    fun def(id: String) = ALL[id] ?: ALL.getValue("marker")

    /** Per-dab dynamics. `size` is the brush diameter chosen by the learner. */
    fun dabParams(brush: String, size: Float, intensity: Float, tilt: Float = 0f): Dab {
        val i = clamp(intensity); val r0 = size / 2; val tt = clamp(tilt / 70f)
        return when (brush) {
            "graphite", "colorPencil" -> {
                val widen = 1 + tt * 2.2f
                Dab(max(0.6f, r0 * (0.7f + 0.5f * i) * widen), (if (brush == "graphite") 0.22f else 0.3f) + 0.6f * i * (1 - tt * 0.55f), 0.35f + 0.55f * i)
            }
            "crayon" -> Dab(r0 * (0.85f + 0.3f * i), 0.9f, 0.42f + 0.5f * i)
            "oil" -> Dab(r0 * (0.6f + 0.5f * i), 0.85f + 0.15f * i, 1f)
            "watercolor" -> Dab(r0 * (0.55f + 0.6f * i), 1f, 1f)
            "ink" -> Dab(max(0.5f, r0 * (0.15f + 1.0f * i)), 1f, 1f)
            "airbrush" -> Dab(r0, 0.025f + 0.11f * i, 1f)
            "eraser" -> Dab(r0 * (0.5f + 0.7f * i), 1f, 1f)
            else -> Dab(r0 * (0.92f + 0.12f * i), 1f, 1f) // marker
        }
    }

    fun dabSpacing(brush: String, radius: Float) = max(0.6f, radius * 2 * def(brush).spacing)
}

// ---------------- pen pressure & tilt ----------------
data class Calibration(val min: Float, val max: Float)
data class PressurePrefs(val pressureMode: String, val manualIntensity: Float, val calibration: Calibration?)
enum class IntensitySource { Pen, Manual }

/** Pointer types use the website's names: "pen", "touch", "mouse". */
class PressureDetector {
    var detected = false; private set
    private var lo = Float.POSITIVE_INFINITY
    private var hi = Float.NEGATIVE_INFINITY
    fun observe(type: String, p: Float): Boolean {
        if (type == "mouse") return detected
        if (!p.isFinite() || p <= 0f) return detected
        lo = min(lo, p); hi = max(hi, p)
        if (type == "pen" && p != 0f && p != 0.5f && p != 1f) detected = true
        if (hi - lo > 0.08f) detected = true
        return detected
    }
    fun reset() { detected = false; lo = Float.POSITIVE_INFINITY; hi = Float.NEGATIVE_INFINITY }
}

class Smoother(private val alpha: Float = 0.3f) {
    private var v: Float? = null
    fun reset() { v = null }
    fun next(x: Float): Float { val c = v; val n = if (c == null) x else c + alpha * (x - c); v = n; return n }
}

object Pressure {
    const val MIN_INTENSITY = 0.05f
    fun calibrate(p: Float, cal: Calibration?): Float {
        if (cal == null || !(cal.max - cal.min >= 0.05f)) return clamp(p)
        return clamp((p - cal.min) / (cal.max - cal.min))
    }
    /** Angle of the pen from vertical (0..90°) from W3C tiltX/tiltY. */
    fun tiltDegrees(tiltX: Float, tiltY: Float): Int {
        val tx = tan(toRadians(tiltX.coerceIn(-89f, 89f).toDouble())); val ty = tan(toRadians(tiltY.coerceIn(-89f, 89f).toDouble()))
        return toDegrees(atan(sqrt(tx * tx + ty * ty))).roundToInt()
    }
    private fun pct(a: List<Float>, q: Float): Float { val s = a.sorted(); return s[min(s.size - 1, max(0, (q * (s.size - 1)).roundToInt()))] }
    /** From pressures recorded while pressing lightly and heavily → calibration, or null if not useful. */
    fun computeCalibration(light: List<Float>, heavy: List<Float>): Calibration? {
        val l = light.filter { it > 0 && it <= 1 }; val h = heavy.filter { it > 0 && it <= 1 }
        if (l.size < 5 || h.size < 5) return null
        val mn = pct(l, 0.25f); val mx = pct(h, 0.85f)
        if (mx - mn < 0.1f) return null
        return Calibration((mn * 100).roundToInt() / 100f, (mx * 100).roundToInt() / 100f)
    }
}

/** Turns raw pointer samples of one stroke into intensities (0..1) and tilt. */
class PressureInput(val detector: PressureDetector = PressureDetector()) {
    private val smooth = Smoother(0.3f)
    fun begin() = smooth.reset()
    /** `tiltDeg` is the pen's angle from vertical (Android AXIS_TILT in degrees). */
    fun sample(type: String, pressure: Float, tiltDeg: Float, prefs: PressurePrefs): Triple<Float, Int, IntensitySource> {
        val real = detector.observe(type, pressure)
        val usePen = prefs.pressureMode == "auto" && real && type != "mouse" && pressure > 0
        val tilt = if (type == "pen") tiltDeg.roundToInt().coerceIn(0, 90) else 0
        if (!usePen) return Triple(clamp(prefs.manualIntensity, Pressure.MIN_INTENSITY, 1f), tilt, IntensitySource.Manual)
        val v = smooth.next(Pressure.calibrate(pressure, prefs.calibration))
        return Triple(clamp(v, Pressure.MIN_INTENSITY, 1f), tilt, IntensitySource.Pen)
    }
    fun mode(prefs: PressurePrefs) = if (prefs.pressureMode == "auto" && detector.detected) IntensitySource.Pen else IntensitySource.Manual
}
