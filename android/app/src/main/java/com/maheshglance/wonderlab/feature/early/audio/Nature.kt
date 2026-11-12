package com.maheshglance.wonderlab.feature.early.audio

import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.floor
import kotlin.math.ln
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Procedural "field recordings" of nature — a line-by-line port of the website's src/lib/nature.ts
 * (raindrop impacts + Minnaert bubbles, gusting wind, rustling leaves, surf, fire, bird songs, crickets).
 * Pure functions of (sampleRate, seed): the same sound every time, no recorded audio.
 */
object Nature {
    const val SR = 32000
    private const val TAU = PI * 2

    class Spec(val dur: Double, val loop: Boolean, val shot: Double, val reverb: Double, val render: (Int, Rand, Double) -> Stereo)
    class Stereo(val l: FloatArray, val r: FloatArray) { val n get() = l.size; operator fun get(ch: Int) = if (ch == 0) l else r }
    fun interface Rand { fun next(): Double }

    fun mulberry32(seed: Int): Rand {
        var a = seed
        return Rand {
            a += 0x6d2b79f5
            var t = a
            t = (t xor (t ushr 15)) * (t or 1)
            t = t xor (t + (t xor (t ushr 7)) * (t or 61))
            ((t xor (t ushr 14)).toLong() and 0xffffffffL).toDouble() / 4294967296.0
        }
    }

    private fun Rand.rr(lo: Double, hi: Double) = lo + (hi - lo) * next()
    private fun Rand.logr(lo: Double, hi: Double) = exp(rr(ln(lo), ln(hi)))
    private fun stereo(n: Int) = Stereo(FloatArray(n), FloatArray(n))
    private fun gains(p: Double): Pair<Double, Double> { val a = ((p.coerceIn(-1.0, 1.0) + 1) * PI) / 4; return cos(a) to sin(a) }

    // ---------------- noise + filters ----------------
    private fun white(n: Int, R: Rand) = FloatArray(n) { (R.next() * 2 - 1).toFloat() }
    private fun pink(n: Int, R: Rand): FloatArray {
        val o = FloatArray(n); var b0 = 0.0; var b1 = 0.0; var b2 = 0.0
        for (i in 0 until n) {
            val w = R.next() * 2 - 1
            b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913
            o[i] = ((b0 + b1 + b2 + w * 0.1848) * 0.2).toFloat()
        }
        return o
    }
    private fun brown(n: Int, R: Rand): FloatArray { val o = FloatArray(n); var x = 0.0; for (i in 0 until n) { x = (x + 0.02 * (R.next() * 2 - 1)) / 1.02; o[i] = (x * 3.5).toFloat() }; return o }
    private fun k1(fc: Double, sr: Int) = 1 - exp((-TAU * max(5.0, fc)) / sr)
    private fun lowpass(x: FloatArray, fc: Double, sr: Int): FloatArray { var y = 0.0; val k = k1(fc, sr); for (i in x.indices) { y += k * (x[i] - y); x[i] = y.toFloat() }; return x }
    private fun lowpass(x: FloatArray, fc: FloatArray, sr: Int): FloatArray { var y = 0.0; for (i in x.indices) { y += k1(fc[i].toDouble(), sr) * (x[i] - y); x[i] = y.toFloat() }; return x }
    private fun highpass(x: FloatArray, fc: Double, sr: Int): FloatArray { var y = 0.0; val k = k1(fc, sr); for (i in x.indices) { y += k * (x[i] - y); x[i] = (x[i] - y).toFloat() }; return x }
    private fun bandpass(x: FloatArray, fc: FloatArray, q: Double, sr: Int): FloatArray {
        var x1 = 0.0; var x2 = 0.0; var y1 = 0.0; var y2 = 0.0; var b0 = 0.0; var b2 = 0.0; var a1 = 0.0; var a2 = 0.0
        for (i in x.indices) {
            if (i % 32 == 0) {
                val f = min(sr * 0.45, fc[i].toDouble())
                val w0 = (TAU * f) / sr; val al = sin(w0) / (2 * q); val a0 = 1 + al
                b0 = al / a0; b2 = -al / a0; a1 = (-2 * cos(w0)) / a0; a2 = (1 - al) / a0
            }
            val y = b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2
            x2 = x1; x1 = x[i].toDouble(); y2 = y1; y1 = y; x[i] = y.toFloat()
        }
        return x
    }
    private fun curve(R: Rand, n: Int, sr: Int, perSec: Double, lo: Double, hi: Double): FloatArray {
        val step = max(1, (sr / perSec).roundToInt())
        val pts = DoubleArray(ceil(n.toDouble() / step).toInt() + 2) { R.rr(lo, hi) }
        return FloatArray(n) { i -> val p = i.toDouble() / step; val j = floor(p).toInt(); val w = (1 - cos(PI * (p - j))) / 2; (pts[j] * (1 - w) + pts[j + 1] * w).toFloat() }
    }
    private fun addInto(dst: FloatArray, src: FloatArray, g: Double, at: Int = 0) { var i = 0; while (i < src.size && i + at < dst.size) { dst[i + at] += (src[i] * g).toFloat(); i++ } }
    private fun addInto(dst: FloatArray, src: FloatArray, g: FloatArray) { val n = min(src.size, dst.size); for (i in 0 until n) dst[i] += src[i] * g[i] }

    // ---------------- sound events ----------------
    private fun burst(S: Stereo, sr: Int, R: Rand, t: Double, amp: Double, pan: Double, tau: Double, bright: Double) {
        val i0 = floor(t * sr).toInt(); if (i0 < 0) return
        val len = min(ceil(tau * sr * 7).toInt(), S.n - i0)
        val (gl, gr) = gains(pan); val d = exp(-1 / (tau * sr))
        var e = amp; var prev = 0.0
        for (j in 0 until len) {
            val w = R.next() * 2 - 1; val v = (bright * (w - prev) * 0.7 + (1 - bright) * w) * e
            prev = w; e *= d
            S.l[i0 + j] += (v * gl).toFloat(); S.r[i0 + j] += (v * gr).toFloat()
        }
    }
    private fun bubble(S: Stereo, sr: Int, t: Double, f0: Double, amp: Double, pan: Double, rise: Double = 0.5) {
        val tau = 1 / (0.043 * f0 + 0.0014 * f0.pow(1.5))
        val i0 = floor(t * sr).toInt(); if (i0 < 0) return
        val len = min(ceil(tau * sr * 3.5).toInt(), S.n - i0)
        val (gl, gr) = gains(pan); val d = exp(-1 / (tau * sr)); val att = max(1.0, 0.0006 * sr)
        var e = amp; var ph = 0.0
        for (j in 0 until len) {
            val f = f0 * (1 + rise * min(1.0, j / (tau * sr * 3)))
            ph += (TAU * f) / sr
            val v = sin(ph) * e * min(1.0, j / att)
            e *= d
            S.l[i0 + j] += (v * gl).toFloat(); S.r[i0 + j] += (v * gr).toFloat()
        }
    }
    private fun tone(S: Stereo, sr: Int, t: Double, dur: Double, freq: (Double) -> Double, amp: Double, pan: Double, h2: Double = 0.12, shape: Double = 1.5) {
        val i0 = floor(t * sr).toInt(); if (i0 < 0) return
        val len = min(ceil(dur * sr).toInt(), S.n - i0)
        if (len <= 0) return
        val (gl, gr) = gains(pan)
        var ph = 0.0
        for (j in 0 until len) {
            val x = j.toDouble() / len
            ph += (TAU * freq(x)) / sr
            val v = (sin(ph) + h2 * sin(2 * ph)) * sin(PI * x).pow(shape) * amp
            S.l[i0 + j] += (v * gl).toFloat(); S.r[i0 + j] += (v * gr).toFloat()
        }
    }

    // ---------------- building blocks ----------------
    private fun rainInto(S: Stereo, sr: Int, R: Rand, dur: Double, perSec: Double, bed: Double) {
        val n = S.n
        for (ch in 0..1) { val p = highpass(pink(n, R), 450.0, sr); lowpass(p, 7500.0, sr); addInto(S[ch], p, curve(R, n, sr, 0.6, bed * 0.75, bed)) }
        val count = (perSec * dur).roundToInt()
        for (k in 0 until count) {
            val u = R.next(); val near = R.next()
            burst(S, sr, R, R.next() * (dur - 0.02), (0.03 + 0.5 * u.pow(4)) * (0.4 + 0.6 * near), R.rr(-1.0, 1.0), R.rr(0.00035, 0.0016), 0.35 + 0.55 * near)
        }
        var k = 0
        while (k < count * 0.03) { bubble(S, sr, R.next() * (dur - 0.05), R.rr(1400.0, 4200.0), R.rr(0.02, 0.09), R.rr(-0.9, 0.9), 0.7); k++ }
    }
    private fun windInto(S: Stereo, sr: Int, R: Rand, strength: Double, level: Double) {
        val n = S.n; val gust = curve(R, n, sr, 0.45, 0.2, 1.0); val lag = (0.14 * sr).roundToInt()
        val whistleF = curve(R, n, sr, 0.3, 700.0, 1700.0)
        for (ch in 0..1) {
            val base = pink(n, R); val b = brown(n, R)
            for (i in 0 until n) base[i] = base[i] * 0.6f + b[i] * 0.5f
            val g = { i: Int -> gust[max(0, i - (if (ch == 1) lag else 0))].toDouble() }
            val fc = FloatArray(n); val am = FloatArray(n)
            for (i in 0 until n) { val v = g(i); fc[i] = (180 + 750 * v.pow(1.4) * strength).toFloat(); am[i] = ((0.12 + 0.88 * v * v) * level).toFloat() }
            bandpass(base, fc, 0.8, sr)
            addInto(S[ch], base, am)
            val w = white(n, R)
            val wf = FloatArray(n); val wa = FloatArray(n)
            for (i in 0 until n) { val v = g(i); wf[i] = (whistleF[i] * (0.8 + 0.5 * v)).toFloat(); wa[i] = (0.5 * v.pow(3) * strength * level).toFloat() }
            bandpass(w, wf, 10.0, sr)
            addInto(S[ch], w, wa)
        }
    }
    private fun leavesInto(S: Stereo, sr: Int, R: Rand, dur: Double, perSec: Double, level: Double) {
        val n = S.n; val gust = curve(R, n, sr, 0.5, 0.15, 1.0)
        val am = stereo(n)
        val count = (perSec * dur).roundToInt()
        for (k in 0 until count) {
            val t = R.next() * dur; val i0 = floor(t * sr).toInt()
            if (R.next() > gust[min(n - 1, i0)]) continue
            val len = floor(R.rr(0.008, 0.07) * sr).toInt(); val a = (0.2 + 0.8 * R.next() * R.next()) * level; val (gl, gr) = gains(R.rr(-0.9, 0.9))
            var j = 0
            while (j < len && i0 + j < n) { val w = sin((PI * j) / len); am.l[i0 + j] += (w * a * gl).toFloat(); am.r[i0 + j] += (w * a * gr).toFloat(); j++ }
        }
        for (ch in 0..1) { val band = highpass(white(n, R), 1600.0, sr); lowpass(band, 8000.0, sr); addInto(S[ch], band, am[ch]) }
    }
    private fun streamInto(S: Stereo, sr: Int, R: Rand, dur: Double, perSec: Double, fLo: Double, fHi: Double, bed: Double) {
        val n = S.n
        for (ch in 0..1) { val p = lowpass(highpass(pink(n, R), 150.0, sr), 1600.0, sr); addInto(S[ch], p, bed) }
        val count = (perSec * dur).roundToInt()
        for (k in 0 until count) bubble(S, sr, R.next() * (dur - 0.05), R.logr(fLo, fHi), 0.04 + 0.32 * R.next() * R.next(), R.rr(-0.7, 0.7), R.rr(0.15, 0.9))
    }

    private class Note(val kind: Int, val dur: Double, val gap: Double, val a: Double, val b: Double)
    private class Song(val base: Double, val notes: List<Note>)
    private fun makeSong(R: Rand, base: Double): Song {
        val count = 2 + floor(R.next() * 4).toInt()
        return Song(base, List(count) { Note(floor(R.next() * 5).toInt(), R.rr(0.04, 0.22), R.rr(0.03, 0.12), R.rr(0.7, 1.5), R.rr(0.7, 1.5)) })
    }
    private fun sing(S: Stereo, sr: Int, R: Rand, t0: Double, song: Song, amp: Double, pan: Double): Double {
        var t = t0
        for (nt in song.notes) {
            val f = song.base * R.rr(0.97, 1.03)
            when (nt.kind) {
                0 -> { val reps = 4 + floor(nt.dur * 40).toInt(); for (i in 0 until reps) tone(S, sr, t + i * 0.045, 0.03, { x -> f * (1.35 - 0.5 * x) }, amp * 0.8, pan, 0.1, 1.2); t += reps * 0.045 }
                1 -> { val d = nt.dur + 0.08; tone(S, sr, t, d, { x -> f * nt.a * (1 + 0.035 * sin(TAU * 7 * x * d)) }, amp, pan, 0.08, 1.2); t += d }
                2 -> { val d = nt.dur + 0.1; val rate = 30 + nt.b * 12; tone(S, sr, t, d, { x -> f * (1 + 0.18 * sin(TAU * rate * x * d)) }, amp * 0.9, pan, 0.15); t += d }
                else -> { val d = min(0.12, nt.dur); val up = nt.kind == 3; tone(S, sr, t, d, { x -> f * (if (up) 0.75 + 0.6 * x else 1.45 - 0.65 * x.pow(0.7)) }, amp, pan, 0.12, 1.3); t += d }
            }
            t += nt.gap
        }
        return t - t0
    }
    private fun birdsInto(S: Stereo, sr: Int, R: Rand, dur: Double, count: Int, level: Double, distant: Double = 0.5) {
        for (b in 0 until count) {
            val song = makeSong(R, R.logr(2200.0, 5200.0)); val far = R.next() < distant
            val amp = (if (far) R.rr(0.06, 0.14) else R.rr(0.18, 0.32)) * level; val pan = R.rr(-0.85, 0.85)
            var t = R.rr(0.0, min(2.5, dur * 0.4))
            while (t < dur - 0.6) { t += sing(S, sr, R, t, song, amp * R.rr(0.8, 1.1), pan) + R.rr(1.2, 3.5) }
        }
    }
    private fun cricketsInto(S: Stereo, sr: Int, R: Rand, dur: Double, count: Int, level: Double) {
        for (c in 0 until count) {
            val f = R.rr(4100.0, 5300.0); val pl = R.rr(0.011, 0.018); val pg = R.rr(0.007, 0.012); val pulses = 2 + floor(R.next() * 3).toInt(); val every = R.rr(0.32, 0.65)
            val amp = R.rr(0.05, 0.16) * level; val pan = R.rr(-0.9, 0.9)
            var t = R.rr(0.0, every)
            while (t < dur - 0.1) { for (p in 0 until pulses) tone(S, sr, t + p * (pl + pg), pl, { f }, amp, pan, 0.2, 1.0); t += every * R.rr(0.94, 1.06) }
        }
    }
    private fun fireInto(S: Stereo, sr: Int, R: Rand, dur: Double, level: Double) {
        val n = S.n; val flick = curve(R, n, sr, 7.0, 0.45, 1.0); val slow = curve(R, n, sr, 0.8, 0.6, 1.0)
        for (ch in 0..1) {
            val roar = lowpass(lowpass(brown(n, R), 420.0, sr), 420.0, sr)
            val am = FloatArray(n) { i -> (flick[i] * slow[i] * 0.9 * level).toFloat() }
            addInto(S[ch], roar, am)
            val hiss = lowpass(highpass(white(n, R), 2500.0, sr), 9000.0, sr)
            for (i in 0 until n) am[i] = (0.035 * flick[i] * level).toFloat()
            addInto(S[ch], hiss, am)
        }
        val busy = curve(R, n, sr, 1.5, 0.1, 1.0)
        var t = 0.0
        while (t < dur - 0.05) {
            if (R.next() <= busy[min(n - 1, floor(t * sr).toInt())]) {
                val pan = R.rr(-0.35, 0.35); val clicks = 1 + floor(R.next() * 4).toInt(); val amp = (0.08 + 0.7 * R.next().pow(3)) * level
                for (c in 0 until clicks) burst(S, sr, R, t + c * R.rr(0.001, 0.006), amp * R.rr(0.4, 1.0), pan, R.rr(0.00015, 0.0009), 0.85)
                if (R.next() < 0.05) bubble(S, sr, t, R.rr(180.0, 500.0), amp * 0.6, pan, -0.3)
            }
            t += R.rr(0.01, 0.12)
        }
    }
    private fun waveEnv(t: Double, t0: Double, peak: Double): Double {
        if (t < t0) return 0.0
        if (t < peak) { val x = (t - t0) / (peak - t0); return sin((PI / 2) * x).pow(2) }
        return exp(-(t - peak) / 1.3)
    }
    private fun washEnv(t: Double, peak: Double): Double { if (t < peak) return 0.0; val d = t - peak; return (1 - exp(-d / 0.3)) * exp(-d / 2.2) }
    private fun seaInto(S: Stereo, sr: Int, R: Rand, dur: Double, level: Double) {
        val n = S.n; val period = dur / 2
        val waves = listOf(-period, 0.0, period, 2 * period).map { t0 -> Triple(t0 + 0.4, t0 + 0.4 + R.rr(2.4, 3.0), R.rr(0.75, 1.0)) }
        val w = FloatArray(n); val wash = FloatArray(n)
        for (i in 0 until n) { val t = i.toDouble() / sr; var a = 0.0; var b = 0.0; for ((t0, pk, amp) in waves) { a += amp * waveEnv(t, t0, pk); b += amp * washEnv(t, pk) }; w[i] = a.toFloat(); wash[i] = b.toFloat() }
        for (ch in 0..1) {
            val rumble = lowpass(brown(n, R), 220.0, sr); val body = pink(n, R); val hiss = lowpass(highpass(white(n, R), 2800.0, sr), 10000.0, sr)
            val fc = FloatArray(n); val a = FloatArray(n); val b = FloatArray(n); val c = FloatArray(n)
            for (i in 0 until n) { fc[i] = (280 + 3600 * w[i].toDouble().pow(1.6)).toFloat(); a[i] = ((0.25 + 0.6 * w[i]) * level * 0.6).toFloat(); b[i] = ((0.08 + 0.9 * w[i]) * level).toFloat(); c[i] = (0.5 * wash[i] * level).toFloat() }
            lowpass(body, fc, sr); lowpass(body, fc, sr)
            addInto(S[ch], rumble, a); addInto(S[ch], body, b); addInto(S[ch], hiss, c)
        }
        var t = 0.0
        while (t < dur - 0.02) { val v = wash[min(n - 1, floor(t * sr).toInt())]; if (R.next() < v * 0.6) burst(S, sr, R, t, 0.06 * level * R.next(), R.rr(-1.0, 1.0), 0.0003, 0.9); t += 0.004 }
    }

    // ---------------- finishing ----------------
    private fun finish(S: Stereo, rms: Double = 0.13): Stereo {
        var sum = 0.0; var peak = 0.0
        for (ch in 0..1) for (v in S[ch]) { sum += v * v; peak = max(peak, abs(v.toDouble())) }
        val cur = sqrt(sum / (S.n * 2)).takeIf { it > 0 } ?: 1.0
        val g = min(rms / cur, 0.97 / (if (peak > 0) peak else 1.0)).toFloat()
        for (ch in 0..1) { val a = S[ch]; for (i in a.indices) a[i] *= g }
        return S
    }
    private fun loopify(S: Stereo, sr: Int, xf: Double): Stereo {
        val x = (xf * sr).roundToInt(); val n = S.n - x
        fun one(ch: FloatArray): FloatArray { val o = ch.copyOf(n); for (i in 0 until x) { val p = (PI / 2) * (i.toDouble() / x); o[i] = (ch[i] * sin(p) + ch[n + i] * cos(p)).toFloat() }; return o }
        return Stereo(one(S.l), one(S.r))
    }
    private fun fadeEnds(S: Stereo, sr: Int, fin: Double, fout: Double): Stereo {
        val n = S.n; val a = (fin * sr).roundToInt(); val b = (fout * sr).roundToInt()
        for (ch in 0..1) { val c = S[ch]; for (i in 0 until min(a, n)) c[i] *= i.toFloat() / a; for (i in 0 until min(b, n)) c[n - 1 - i] *= i.toFloat() / b }
        return S
    }
    private const val XF = 1.2
    private fun looped(rms: Double = 0.13, body: (Stereo, Int, Rand, Double) -> Unit): (Int, Rand, Double) -> Stereo = { sr, R, dur ->
        val d = dur + XF; val S = stereo((d * sr).roundToInt()); body(S, sr, R, d); finish(loopify(S, sr, XF), rms)
    }
    private fun once(rms: Double = 0.13, fout: Double = 0.3, body: (Stereo, Int, Rand, Double) -> Unit): (Int, Rand, Double) -> Stereo = { sr, R, dur ->
        val S = stereo((dur * sr).roundToInt()); body(S, sr, R, dur); finish(fadeEnds(S, sr, 0.003, fout), rms)
    }

    private fun thunder(S: Stereo, sr: Int, R: Rand) {
        val n = S.n
        burst(S, sr, R, 0.05, 0.9, R.rr(-0.4, 0.4), 0.06, 0.6)
        for (i in 0 until 40) burst(S, sr, R, 0.05 + R.next().pow(1.5) * 0.6, R.rr(0.1, 0.6), R.rr(-0.8, 0.8), R.rr(0.002, 0.01), 0.5)
        val env = FloatArray(n)
        val rolls = List(7) { i -> doubleArrayOf(0.08 + i * R.rr(0.25, 0.6), 0.82.pow(i) * R.rr(0.6, 1.0), R.rr(0.08, 0.3), R.rr(0.7, 1.6)) }
        for (i in 0 until n) { val t = i.toDouble() / sr; var e = 0.0; for (r in rolls) if (t > r[0]) e += r[1] * min(1.0, (t - r[0]) / r[2]) * exp(-max(0.0, t - r[0] - r[2]) / r[3]); env[i] = e.toFloat() }
        for (ch in 0..1) {
            val deep = lowpass(lowpass(brown(n, R), 140.0, sr), 140.0, sr); val body = lowpass(pink(n, R), 500.0, sr)
            addInto(S[ch], deep, env); addInto(S[ch], body, FloatArray(n) { env[it] * 0.25f })
        }
    }
    private fun splash(S: Stereo, sr: Int, R: Rand) {
        val n = (0.6 * sr).roundToInt()
        for (ch in 0..1) {
            val w = white(n, R); val fc = FloatArray(n)
            for (i in 0 until n) { fc[i] = (900 + 6000 * exp(-i / (0.08 * sr))).toFloat(); w[i] *= (exp(-i / (0.12 * sr)) * min(1.0, i / (0.004 * sr))).toFloat() }
            lowpass(w, fc, sr)
            addInto(S[ch], w, 0.9)
        }
        tone(S, sr, 0.0, 0.12, { x -> 110 - 50 * x }, 0.6, 0.0, 0.0, 0.6)
        for (i in 0 until 28) bubble(S, sr, 0.04 + R.next().pow(1.6) * 0.5, R.logr(380.0, 2600.0), R.rr(0.05, 0.3), R.rr(-0.6, 0.6), R.rr(0.3, 1.0))
        for (i in 0 until 18) bubble(S, sr, 0.15 + R.next() * 0.7, R.rr(2200.0, 5200.0), R.rr(0.03, 0.12), R.rr(-0.9, 0.9), 0.8)
    }
    private fun pour(S: Stereo, sr: Int, R: Rand, d: Double) {
        val n = S.n
        for (ch in 0..1) { val w = lowpass(highpass(white(n, R), 300.0, sr), 2400.0, sr); addInto(S[ch], w, 0.12) }
        var t = 0.02
        while (t < d - 0.1) { val x = t / d; bubble(S, sr, t, R.logr(350 + 500 * x, 1100 + 1500 * x), 0.05 + 0.3 * R.next() * R.next(), R.rr(-0.3, 0.3), R.rr(0.3, 1.0)); t += R.rr(0.002, 0.009) }
    }

    val SPECS: Map<String, Spec> = mapOf(
        "rain" to Spec(9.0, true, 4.5, 0.1, looped { S, sr, R, d -> rainInto(S, sr, R, d, 700.0, 0.3) }),
        "drizzle" to Spec(9.0, true, 4.0, 0.1, looped(0.08) { S, sr, R, d -> rainInto(S, sr, R, d, 160.0, 0.12) }),
        "storm" to Spec(10.0, true, 5.0, 0.15, looped(0.16) { S, sr, R, d -> rainInto(S, sr, R, d, 1500.0, 0.5); windInto(S, sr, R, 1.0, 0.7) }),
        "thunder" to Spec(6.0, false, 6.0, 0.5, once(0.16, 1.2) { S, sr, R, _ -> thunder(S, sr, R) }),
        "wind" to Spec(10.0, true, 4.5, 0.08, looped(0.12) { S, sr, R, _ -> windInto(S, sr, R, 1.0, 1.0) }),
        "breeze" to Spec(10.0, true, 4.0, 0.08, looped(0.07) { S, sr, R, d -> windInto(S, sr, R, 0.45, 0.6); leavesInto(S, sr, R, d, 60.0, 0.25) }),
        "leaves" to Spec(3.0, false, 3.0, 0.1, once(0.1, 0.6) { S, sr, R, d -> leavesInto(S, sr, R, d, 260.0, 1.0) }),
        "stream" to Spec(9.0, true, 4.0, 0.12, looped(0.11) { S, sr, R, d -> streamInto(S, sr, R, d, 140.0, 300.0, 1900.0, 0.18) }),
        "water" to Spec(3.0, false, 3.0, 0.12, once(0.11, 0.5) { S, sr, R, d -> pour(S, sr, R, d) }),
        "waterfall" to Spec(9.0, true, 4.5, 0.15, looped(0.15) { S, sr, R, d ->
            streamInto(S, sr, R, d, 600.0, 250.0, 2200.0, 0.6)
            for (ch in 0..1) addInto(S[ch], lowpass(brown(S.n, R), 300.0, sr), 0.5)
        }),
        "splash" to Spec(1.2, false, 1.2, 0.12, once(0.14, 0.3) { S, sr, R, _ -> splash(S, sr, R) }),
        "sea" to Spec(12.0, true, 6.0, 0.1, looped(0.13) { S, sr, R, d -> seaInto(S, sr, R, d, 1.0) }),
        "fire" to Spec(9.0, true, 4.0, 0.08, looped(0.1) { S, sr, R, d -> fireInto(S, sr, R, d, 1.0) }),
        "bird" to Spec(1.8, false, 1.8, 0.2, once(0.12, 0.2) { S, sr, R, _ -> sing(S, sr, R, 0.05, makeSong(R, R.logr(2600.0, 4200.0)), 0.5, R.rr(-0.3, 0.3)) }),
        "birds" to Spec(4.5, false, 4.5, 0.25, once(0.1, 0.8) { S, sr, R, d -> windInto(S, sr, R, 0.3, 0.25); birdsInto(S, sr, R, d, 4, 1.0, 0.4) }),
        "crickets" to Spec(8.0, true, 4.0, 0.15, looped(0.08) { S, sr, R, d -> cricketsInto(S, sr, R, d, 5, 1.0) }),
        "night" to Spec(12.0, true, 5.0, 0.2, looped(0.07) { S, sr, R, d -> windInto(S, sr, R, 0.3, 0.35); cricketsInto(S, sr, R, d, 6, 1.0) }),
        "forest" to Spec(14.0, true, 5.0, 0.25, looped(0.08) { S, sr, R, d -> windInto(S, sr, R, 0.45, 0.5); leavesInto(S, sr, R, d, 50.0, 0.25); birdsInto(S, sr, R, d, 5, 1.0, 0.6) }),
        "garden" to Spec(12.0, true, 5.0, 0.2, looped(0.07) { S, sr, R, d -> windInto(S, sr, R, 0.3, 0.35); birdsInto(S, sr, R, d, 3, 1.0, 0.3) }),
    )
    val AMBIENCES = setOf("rain", "drizzle", "storm", "wind", "breeze", "stream", "waterfall", "sea", "fire", "night", "forest", "garden")

    /** Renders a nature sound (same name → same audio, like the website), with its outdoor reverb mixed in. */
    fun render(name: String, sr: Int = SR, seed: Int = 0): Stereo? {
        val spec = SPECS[name] ?: return null
        var h = 2166136261L.toInt()
        for (c in name) h = (h xor c.code) * 16777619
        val s = spec.render(sr, mulberry32(h xor seed), spec.dur)
        if (spec.reverb > 0) reverb(s, sr, spec.reverb, spec.loop)
        return s
    }

    /**
     * Small outdoor-space reverb (the website convolves with a 1.6 s darkening noise impulse; here a
     * Schroeder network with damping gives the same airy tail at a fraction of the cost).
     */
    private fun reverb(S: Stereo, sr: Int, send: Double, loop: Boolean) {
        val n = S.n
        val combs = intArrayOf(1116, 1188, 1277, 1356).map { (it * sr / 44100.0).roundToInt() }
        val aps = intArrayOf(556, 441).map { (it * sr / 44100.0).roundToInt() }
        for (ch in 0..1) {
            val x = S[ch]
            val wet = FloatArray(n)
            val spread = if (ch == 1) (23 * sr / 44100.0).roundToInt() else 0
            for ((ci, len0) in combs.withIndex()) {
                val len = len0 + spread
                val buf = FloatArray(len); var idx = 0; var store = 0f
                val fb = 0.78f; val damp = 0.35f + ci * 0.03f
                // run twice over a loop so the tail wraps around seamlessly
                val passes = if (loop) 2 else 1
                for (p in 0 until passes) for (i in 0 until n) {
                    val out = buf[idx]
                    store = out * (1 - damp) + store * damp
                    buf[idx] = x[i] + store * fb
                    idx = (idx + 1) % len
                    if (p == passes - 1) wet[i] += out
                }
            }
            for (len in aps) {
                val buf = FloatArray(len + spread); var idx = 0
                for (i in 0 until n) { val bo = buf[idx]; val y = -wet[i] + bo; buf[idx] = wet[i] + bo * 0.5f; idx = (idx + 1) % buf.size; wet[i] = y }
            }
            val g = (send * 0.22).toFloat()
            for (i in 0 until n) x[i] += wet[i] * g
        }
        // keep the loudness under control after adding the tail
        var peak = 0f
        for (ch in 0..1) for (v in S[ch]) peak = max(peak, abs(v))
        if (peak > 0.97f) { val g = 0.97f / peak; for (ch in 0..1) { val a = S[ch]; for (i in a.indices) a[i] *= g } }
    }
}
