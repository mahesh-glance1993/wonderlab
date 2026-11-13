package com.maheshglance.wonderlab.feature.early.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.util.LruCache
import com.maheshglance.wonderlab.core.audio.Tones
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.concurrent.CopyOnWriteArrayList
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.random.Random

/** A playing sound: stop it early, or wait for it to finish. */
class SfxHandle internal constructor(val name: String) {
    internal val finished = CompletableDeferred<Unit>()
    internal var stopper: (() -> Unit)? = null
    @Volatile internal var stopped = false
    fun stop() { if (stopped) return; stopped = true; runCatching { stopper?.invoke() }; finished.complete(Unit) }
    suspend fun await() = finished.await()
    val isDone: Boolean get() = finished.isCompleted
}

/**
 * Sound effects synthesised on the device — a native port of the website's src/lib/sfx.ts
 * (animals, vehicles, machines, UI) and src/lib/nature.ts (rain, wind, sea, birds…). No recorded audio.
 * Respects mute + volume (Tones.muted / Tones.volume, set from the learner's settings) and ducks under narration.
 */
object Sfx {
    private const val SR = 32000
    private val io = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val live = CopyOnWriteArrayList<Live>()
    @Volatile private var duck = 1f

    private class Live(val track: AudioTrack, val level: () -> Float)

    /** Every sound the library can play (the same names as the website). */
    val NAMES: List<String> by lazy { (LIB.keys + Nature.SPECS.keys).distinct() }

    fun has(name: String) = name in LIB || name in Nature.SPECS

    /** Plays a sound effect. Returns null when muted or unknown (treated as silent). */
    fun play(name: String): SfxHandle? {
        if (Tones.muted || !has(name)) return null
        val h = SfxHandle(name)
        if (name in NATURE_ONESHOT) { playNature(h, name, forever = false, level = 1f); return h }
        io.launch {
            val pcm = synthCache.get(name) ?: runCatching { LIB[name]!!.invoke() }.getOrNull()?.also { synthCache.put(name, it) }
            if (pcm == null || h.stopped) { h.finished.complete(Unit); return@launch }
            startTrack(h, pcm, SR, 1, loop = false, fadeInMs = 0, level = 1f)
        }
        return h
    }

    /** Quiet looping background (rain, forest, night…) until stop() is called. */
    fun ambience(name: String, level: Float = 0.4f): SfxHandle? {
        if (Tones.muted || name !in Nature.SPECS) return null
        val h = SfxHandle(name)
        playNature(h, name, forever = true, level = level)
        return h
    }

    /** Renders nature sounds ahead of time so they start instantly later. */
    fun prewarm(names: Collection<String?>) {
        if (Tones.muted) return
        names.filterNotNull().toSet().filter { it in Nature.SPECS }.forEach { n -> io.launch { natureBuffer(n) } }
    }

    /** Lower effects to 35% while narration speaks so words stay clear. */
    fun setSpeaking(on: Boolean) {
        duck = if (on) 0.35f else 1f
        live.forEach { l -> runCatching { l.track.setVolume(l.level() * Tones.volume * duck) } }
    }

    fun stopAll() { live.forEach { runCatching { it.track.stop(); it.track.release() } }; live.clear() }

    // ------------------------------------------------------------------ playback
    private fun startTrack(h: SfxHandle, pcm: ShortArray, rate: Int, channels: Int, loop: Boolean, fadeInMs: Long, level: Float, playbackRate: Float = 1f): Job? {
        if (pcm.isEmpty()) { h.finished.complete(Unit); return null }
        val track = runCatching {
            AudioTrack.Builder()
                .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
                .setAudioFormat(AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(rate)
                    .setChannelMask(if (channels == 2) AudioFormat.CHANNEL_OUT_STEREO else AudioFormat.CHANNEL_OUT_MONO).build())
                .setBufferSizeInBytes(pcm.size * 2)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()
        }.getOrNull() ?: run { h.finished.complete(Unit); return null }
        val frames = pcm.size / channels
        var cur = if (fadeInMs > 0) 0f else level
        val entry = Live(track) { cur }
        return runCatching {
            track.write(pcm, 0, pcm.size)
            if (loop) track.setLoopPoints(0, frames, -1)
            if (playbackRate != 1f) runCatching { track.playbackRate = (rate * playbackRate).roundToInt() }
            track.setVolume(cur * Tones.volume * duck)
            live += entry
            var released = false
            val release = { if (!released) { released = true; live.remove(entry); runCatching { track.stop() }; runCatching { track.release() } } }
            h.stopper = {
                // short fade so a stop never clicks
                io.launch {
                    val steps = if (loop) 20 else 4
                    for (i in steps downTo 0) { cur = level * i / steps; runCatching { track.setVolume(cur * Tones.volume * duck) }; delay(if (loop) 50 else 15) }
                    release()
                }
            }
            track.play()
            io.launch {
                if (fadeInMs > 0) { val steps = 30; for (i in 1..steps) { if (h.stopped) break; cur = level * i / steps; runCatching { track.setVolume(cur * Tones.volume * duck) }; delay(fadeInMs / steps) } }
                if (!loop) {
                    val ms = (frames * 1000L / (rate * playbackRate)).toLong() + 120
                    delay(ms)
                    if (!h.stopped) { release(); h.finished.complete(Unit) }
                }
            }
        }.getOrElse { runCatching { track.release() }; h.finished.complete(Unit); null }
    }

    // ------------------------------------------------------------------ nature
    private val NATURE_ONESHOT = Nature.SPECS.keys
    private val natCache = object : LruCache<String, Nature.Stereo>(14) {}
    private val natLocks = HashMap<String, Mutex>()

    private suspend fun natureBuffer(name: String): Nature.Stereo? {
        natCache.get(name)?.let { return it }
        val m = synchronized(natLocks) { natLocks.getOrPut(name) { Mutex() } }
        return m.withLock { natCache.get(name) ?: runCatching { Nature.render(name) }.getOrNull()?.also { natCache.put(name, it) } }
    }

    private fun playNature(h: SfxHandle, name: String, forever: Boolean, level: Float) {
        val spec = Nature.SPECS[name] ?: run { h.finished.complete(Unit); return }
        io.launch {
            val buf = natureBuffer(name)
            if (buf == null || h.stopped) { h.finished.complete(Unit); return@launch }
            if (spec.loop) {
                if (forever) {
                    // the whole seamless loop, starting at a random point
                    val start = Random.nextInt(buf.n)
                    startTrack(h, interleave(buf, start, buf.n, 0.0, 0.0), Nature.SR, 2, loop = true, fadeInMs = 1500, level = level)
                } else {
                    // a faded `shot`-second slice from a random place (a different slice each time)
                    val len = min(buf.n, (spec.shot * Nature.SR).roundToInt())
                    startTrack(h, interleave(buf, Random.nextInt(buf.n), len, 0.35, 0.9), Nature.SR, 2, loop = false, fadeInMs = 0, level = level)
                }
            } else {
                startTrack(h, interleave(buf, 0, buf.n, 0.0, 0.0), Nature.SR, 2, loop = false, fadeInMs = 0, level = level, playbackRate = 1f + (Random.nextFloat() - 0.5f) * 0.06f)
            }
        }
    }

    /** Stereo float → interleaved 16-bit, `len` frames from `start` (wrapping), with optional fades (s). */
    private fun interleave(s: Nature.Stereo, start: Int, len: Int, fin: Double, fout: Double): ShortArray {
        val out = ShortArray(len * 2)
        val a = (fin * Nature.SR).toInt(); val b = (fout * Nature.SR).toInt()
        for (i in 0 until len) {
            val j = (start + i) % s.n
            var g = 0.7f
            if (a > 0 && i < a) g *= i.toFloat() / a
            if (b > 0 && i > len - b) g *= (len - i).toFloat() / b
            out[i * 2] = (s.l[j] * g * 32767).roundToInt().coerceIn(-32767, 32767).toShort()
            out[i * 2 + 1] = (s.r[j] * g * 32767).roundToInt().coerceIn(-32767, 32767).toShort()
        }
        return out
    }

    // ------------------------------------------------------------------ synthesised voices (Web Audio semantics)
    private class Pt(val t: Double, val v: Double)
    private class Filter(val type: String, val f: List<Pt>, val q: Double = 1.0)
    private class Lfo(val rate: Double, val depth: Double)
    private class Voice(val type: String = "sine", val f: List<Pt>? = null, val g: List<Pt>, val filter: Filter? = null, val vib: Lfo? = null, val trem: Lfo? = null, val at: Double = 0.0) {
        fun copyAt(at: Double) = Voice(type, f, g, filter, vib, trem, at)
        fun withFilter(f2: Filter?) = Voice(type, f, g, f2, vib, trem, at)
    }
    private fun pts(vararg p: Pair<Number, Number>) = p.map { Pt(it.first.toDouble(), it.second.toDouble()) }
    private fun env(a: Double, hold: Double, rel: Double, peak: Double = 1.0) = listOf(Pt(0.0, 0.0), Pt(a, peak), Pt(a + hold, peak * 0.8), Pt(a + hold + rel, 0.0))
    private fun repeatAt(v: Voice, times: Int, gap: Double) = List(times) { i -> v.copyAt(v.at + i * gap) }

    /** Value of an automation curve at time t (setValueAtTime at the first point, then linear or exponential ramps). */
    private fun param(p: List<Pt>, t: Double, exp: Boolean, before: Double): Double {
        if (p.isEmpty()) return before
        if (t < p[0].t) return before
        for (i in 1 until p.size) {
            val a = p[i - 1]; val b = p[i]
            if (t < b.t) {
                val x = (t - a.t) / max(1e-9, b.t - a.t)
                return if (exp && b.v > 0 && a.v > 0) a.v * (b.v / a.v).pow(x) else a.v + (b.v - a.v) * x
            }
        }
        return p.last().v
    }

    private fun render(voices: List<Voice>, length: Double): ShortArray {
        val n = ((length + 0.05) * SR).roundToInt()
        val mix = FloatArray(n)
        val rnd = Random(7)
        for (v in voices) {
            val st = v.at
            val i0 = (st * SR).roundToInt()
            var ph = 0.0
            // biquad state
            var x1 = 0.0; var x2 = 0.0; var y1 = 0.0; var y2 = 0.0
            var b0 = 0.0; var b1 = 0.0; var b2 = 0.0; var a1 = 0.0; var a2 = 0.0
            val endI = n
            for (i in max(0, i0) until endI) {
                val t = (i - i0).toDouble() / SR
                // source
                var s: Double
                if (v.type == "noise") s = rnd.nextDouble() * 2 - 1
                else {
                    var f = if (v.f != null) param(v.f, t, true, v.f.first().v) else 440.0
                    if (v.vib != null) f += v.vib.depth * sin(2 * PI * v.vib.rate * t)
                    val dt = f / SR
                    ph += dt; if (ph >= 1) ph -= floor(ph)
                    s = when (v.type) {
                        "square" -> (if (ph < 0.5) 1.0 else -1.0) + blep(ph, dt) - blep((ph + 0.5) % 1.0, dt)
                        "sawtooth" -> (2 * ph - 1) - blep(ph, dt)
                        "triangle" -> 1 - 4 * kotlin.math.abs(ph - 0.5)
                        else -> sin(2 * PI * ph)
                    }
                }
                // filter
                if (v.filter != null) {
                    if ((i - i0) % 8 == 0) {
                        val fc = min(param(v.filter.f, t, true, v.filter.f.first().v), SR * 0.45)
                        val w0 = 2 * PI * fc / SR; val cw = cos(w0); val sw = sin(w0)
                        when (v.filter.type) {
                            "lowpass", "highpass" -> {
                                // Web Audio: Q of low/high-pass is a resonance in dB
                                val al = sw / (2 * 10.0.pow(v.filter.q / 20)); val a0 = 1 + al
                                if (v.filter.type == "lowpass") { b0 = (1 - cw) / 2 / a0; b1 = (1 - cw) / a0; b2 = b0 }
                                else { b0 = (1 + cw) / 2 / a0; b1 = -(1 + cw) / a0; b2 = b0 }
                                a1 = -2 * cw / a0; a2 = (1 - al) / a0
                            }
                            else -> { val al = sw / (2 * max(1e-4, v.filter.q)); val a0 = 1 + al; b0 = al / a0; b1 = 0.0; b2 = -al / a0; a1 = -2 * cw / a0; a2 = (1 - al) / a0 }
                        }
                    }
                    val y = b0 * s + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
                    x2 = x1; x1 = s; y2 = y1; y1 = y; s = y
                }
                if (v.trem != null) s *= (1 - v.trem.depth) + v.trem.depth * sin(2 * PI * v.trem.rate * t)
                val g = param(v.g, t, false, 0.0)
                mix[i] += (s * g).toFloat()
            }
        }
        // master: 0.7 of the volume (volume/duck are applied on the track)
        var peak = 0f
        for (x in mix) peak = max(peak, kotlin.math.abs(x))
        val norm = if (peak * 0.7f > 0.98f) 0.98f / (peak * 0.7f) else 1f
        return ShortArray(n) { i -> (mix[i] * 0.7f * norm * 32767).roundToInt().coerceIn(-32767, 32767).toShort() }
    }
    private fun blep(t: Double, dt: Double): Double = when {
        dt <= 0 -> 0.0
        t < dt -> { val x = t / dt; x + x - x * x - 1 }
        t > 1 - dt -> { val x = (t - 1) / dt; x * x + x + x + 1 }
        else -> 0.0
    }

    private fun play(voices: List<Voice>, length: Double) = render(voices, length)
    private val synthCache = object : LruCache<String, ShortArray>(4 * 1024 * 1024) { override fun sizeOf(key: String, value: ShortArray) = value.size * 2 }

    private fun sq(f: List<Pt>, g: List<Pt>, filter: Filter? = null, vib: Lfo? = null, trem: Lfo? = null, at: Double = 0.0) = Voice("square", f, g, filter, vib, trem, at)
    private fun saw(f: List<Pt>, g: List<Pt>, filter: Filter? = null, vib: Lfo? = null, trem: Lfo? = null, at: Double = 0.0) = Voice("sawtooth", f, g, filter, vib, trem, at)
    private fun sine(f: List<Pt>, g: List<Pt>, filter: Filter? = null, vib: Lfo? = null, trem: Lfo? = null, at: Double = 0.0) = Voice("sine", f, g, filter, vib, trem, at)
    private fun noise(g: List<Pt>, filter: Filter? = null, trem: Lfo? = null, at: Double = 0.0) = Voice("noise", null, g, filter, null, trem, at)
    private fun bp(vararg f: Pair<Number, Number>, q: Double = 1.0) = Filter("bandpass", pts(*f), q)
    private fun lp(vararg f: Pair<Number, Number>, q: Double = 1.0) = Filter("lowpass", pts(*f), q)
    private fun hp(vararg f: Pair<Number, Number>, q: Double = 1.0) = Filter("highpass", pts(*f), q)

    private val LIB: Map<String, () -> ShortArray> = mapOf(
        // ---------- animals ----------
        "cow" to { play(listOf(saw(pts(0 to 120, 0.4 to 128, 1.3 to 95), env(0.25, 0.8, 0.4, 0.5), bp(0 to 400, 0.5 to 700, 1.4 to 450, q = 2.0), vib = Lfo(5.0, 2.0))), 1.6) },
        "cat" to { play(listOf(saw(pts(0 to 480, 0.25 to 820, 0.7 to 560), env(0.06, 0.45, 0.25, 0.35), bp(0 to 900, 0.25 to 2200, 0.7 to 1200, q = 4.0))), 0.8) },
        "dog" to { play(repeatAt(sq(pts(0 to 340, 0.1 to 220), env(0.01, 0.06, 0.08, 0.35), bp(0 to 900, 0.15 to 600, q = 3.0)), 2, 0.32) + repeatAt(noise(env(0.005, 0.04, 0.06, 0.2), bp(0 to 1400, q = 2.0)), 2, 0.32), 0.8) },
        "duck" to { play(repeatAt(saw(pts(0 to 260, 0.15 to 230), env(0.01, 0.12, 0.05, 0.35), bp(0 to 1300, q = 9.0)), 3, 0.24), 0.8) },
        "rooster" to { play(listOf(saw(pts(0 to 420, 0.2 to 760, 0.8 to 700, 1.3 to 480), env(0.05, 1.1, 0.25, 0.35), bp(0 to 1200, 0.4 to 2000, 1.3 to 1200, q = 5.0), vib = Lfo(9.0, 15.0))), 1.5) },
        "hen" to { play(repeatAt(saw(pts(0 to 600, 0.08 to 900), env(0.01, 0.06, 0.05, 0.3), bp(0 to 1500, q = 5.0)), 4, 0.15), 0.8) },
        "sheep" to { play(listOf(saw(pts(0 to 310, 0.7 to 280), env(0.05, 0.55, 0.2, 0.35), bp(0 to 900, 0.7 to 800, q = 4.0), vib = Lfo(7.0, 22.0))), 0.9) },
        "goat" to { play(listOf(saw(pts(0 to 380, 0.6 to 340), env(0.03, 0.5, 0.2, 0.35), bp(0 to 1100, q = 4.0), vib = Lfo(11.0, 35.0))), 0.8) },
        "lion" to { lion() },
        "tiger" to { lion() },
        "elephant" to { play(listOf(saw(pts(0 to 420, 0.25 to 620, 1.0 to 560), env(0.08, 0.8, 0.3, 0.4), bp(0 to 1100, 0.3 to 1800, q = 3.0), vib = Lfo(6.0, 18.0)), noise(env(0.08, 0.8, 0.3, 0.12), bp(0 to 2500, q = 2.0))), 1.3) },
        "frog" to { play(repeatAt(sq(pts(0 to 150, 0.25 to 130), env(0.01, 0.2, 0.08, 0.3), lp(0 to 700), trem = Lfo(22.0, 0.8)), 2, 0.45), 0.95) },
        "owl" to { play(repeatAt(sine(pts(0 to 390, 0.3 to 360), env(0.05, 0.22, 0.12, 0.4)), 2, 0.6), 1.2) },
        "crow" to { play(repeatAt(saw(pts(0 to 620, 0.25 to 480), env(0.02, 0.18, 0.08, 0.35), bp(0 to 1500, q = 3.0)), 2, 0.42) + repeatAt(noise(env(0.02, 0.18, 0.08, 0.12), bp(0 to 1800, q = 2.0)), 2, 0.42), 0.9) },
        "horse" to { play(listOf(saw(pts(0 to 950, 0.3 to 1100, 1.0 to 500), env(0.05, 0.8, 0.25, 0.3), bp(0 to 1800, 1.0 to 1000, q = 4.0), vib = Lfo(16.0, 60.0))), 1.2) },
        "monkey" to { play(listOf(sine(pts(0 to 400, 0.15 to 700), env(0.02, 0.12, 0.06, 0.35)), sine(pts(0 to 420, 0.15 to 760), env(0.02, 0.12, 0.06, 0.35), at = 0.25), saw(pts(0 to 700, 0.3 to 1000), env(0.03, 0.25, 0.1, 0.25), bp(0 to 1600, q = 3.0), at = 0.55)), 1.0) },
        "peacock" to { play(listOf(saw(pts(0 to 700, 0.25 to 1150), env(0.03, 0.25, 0.08, 0.3), bp(0 to 2000, q = 4.0)), saw(pts(0 to 1100, 0.3 to 800), env(0.03, 0.28, 0.1, 0.3), bp(0 to 1800, q = 4.0), at = 0.38)), 0.85) },
        "parrot" to { play(repeatAt(sq(pts(0 to 1400, 0.08 to 2000, 0.16 to 1500), env(0.01, 0.12, 0.05, 0.2), bp(0 to 2400, q = 4.0)), 3, 0.22), 0.75) },
        "bee" to { play(listOf(saw(pts(0 to 220, 1.5 to 240), env(0.2, 1.1, 0.3, 0.2), bp(0 to 600, q = 2.0), vib = Lfo(3.0, 25.0), trem = Lfo(30.0, 0.3))), 1.7) },
        "snake" to { play(listOf(noise(env(0.2, 1.0, 0.4, 0.3), hp(0 to 4500))), 1.7) },
        // ---------- vehicles ----------
        "car" to { play(listOf(saw(pts(0 to 45, 0.6 to 85, 2.2 to 70), env(0.2, 1.7, 0.5, 0.4), lp(0 to 300, 0.6 to 600), trem = Lfo(28.0, 0.35))), 2.5) },
        "horn" to { play(repeatAt(sq(pts(0 to 420), env(0.01, 0.18, 0.05, 0.22), lp(0 to 1800)), 2, 0.32) + repeatAt(sq(pts(0 to 520), env(0.01, 0.18, 0.05, 0.18), lp(0 to 1800)), 2, 0.32), 0.7) },
        "bike" to { play(listOf(saw(pts(0 to 80, 0.5 to 160, 1.2 to 130, 1.8 to 190), env(0.1, 1.6, 0.3, 0.32), lp(0 to 900), trem = Lfo(40.0, 0.5))), 2.1) },
        "bicycle" to { play(repeatAt(sine(pts(0 to 3100), pts(0 to 0, 0.005 to 0.3, 0.5 to 0)), 2, 0.28) + repeatAt(sine(pts(0 to 4300), pts(0 to 0, 0.005 to 0.15, 0.35 to 0)), 2, 0.28), 0.9) },
        "bus" to { bus() },
        "truck" to { bus() },
        "train" to { play(repeatAt(noise(env(0.01, 0.05, 0.12, 0.35), bp(0 to 700, q = 1.5)), 10, 0.24) + listOf(sine(pts(0 to 880), env(0.05, 0.7, 0.2, 0.22), at = 2.4), sine(pts(0 to 1110), env(0.05, 0.7, 0.2, 0.18), at = 2.4)), 3.4) },
        "aeroplane" to { play(listOf(noise(env(0.8, 1.6, 0.8, 0.4), bp(0 to 300, 1.8 to 1400, 3.2 to 500, q = 1.0)), sine(pts(0 to 1200, 1.8 to 2100, 3.2 to 1500), env(0.8, 1.6, 0.8, 0.07))), 3.3) },
        "helicopter" to { play(listOf(noise(env(0.3, 2.0, 0.4, 0.45), lp(0 to 500), trem = Lfo(13.0, 0.9))), 2.8) },
        "boat" to { play(listOf(saw(pts(0 to 145), env(0.15, 1.0, 0.4, 0.35), lp(0 to 700)), saw(pts(0 to 218), env(0.15, 1.0, 0.4, 0.2), lp(0 to 800))), 1.7) },
        "siren" to { play(listOf(sine(pts(0 to 650, 0.5 to 1150, 1.0 to 650, 1.5 to 1150, 2.0 to 650), env(0.05, 1.8, 0.2, 0.2))), 2.2) },
        "tractor" to { play(listOf(saw(pts(0 to 40, 2.4 to 46), env(0.2, 2.0, 0.3, 0.45), lp(0 to 400), trem = Lfo(8.0, 0.85))), 2.6) },
        "auto" to { play(listOf(saw(pts(0 to 70, 1.8 to 90), env(0.1, 1.6, 0.3, 0.35), lp(0 to 700), trem = Lfo(16.0, 0.7))) + repeatAt(sq(pts(0 to 380), env(0.01, 0.1, 0.05, 0.16), lp(0 to 1400), at = 1.6), 2, 0.22), 2.2) },
        "cart" to {
            val clicks = repeatAt(sine(pts(0 to 2600), pts(0 to 0, 0.005 to 0.12, 0.25 to 0)), 8, 0.35).mapIndexed { i, v -> v.copyAt(v.at + 0.17 + (i % 2) * 0.02) }
            play(repeatAt(noise(env(0.003, 0.02, 0.05, 0.45), bp(0 to 1300, q = 6.0)), 8, 0.35) + clicks + listOf(saw(pts(0 to 180, 2.8 to 200), env(0.3, 2.2, 0.3, 0.05), bp(0 to 600, q = 8.0), vib = Lfo(2.0, 30.0))), 3.0)
        },
        "rocket" to { play(listOf(noise(env(0.4, 1.8, 0.6, 0.55), lp(0 to 200, 0.6 to 1600, 2.8 to 400)), saw(pts(0 to 40, 2.8 to 30), env(0.4, 1.8, 0.6, 0.3), lp(0 to 200))), 3.0) },
        // ---------- machines & making ----------
        "motor" to { play(listOf(saw(pts(0 to 60, 0.5 to 120, 2.0 to 120), env(0.3, 1.5, 0.3, 0.2), lp(0 to 600)), sine(pts(0 to 240, 0.5 to 480), env(0.3, 1.5, 0.3, 0.06))), 2.2) },
        "gears" to { play(repeatAt(noise(env(0.001, 0.01, 0.03, 0.35), bp(0 to 2800, q = 10.0)), 12, 0.12), 1.6) },
        "drill" to { play(listOf(saw(pts(0 to 300, 0.3 to 900, 1.2 to 880, 1.5 to 300), env(0.1, 1.2, 0.2, 0.18), bp(0 to 1800, q = 2.0), vib = Lfo(30.0, 40.0))), 1.6) },
        "hammer" to { play(repeatAt(noise(env(0.001, 0.02, 0.12, 0.6), bp(0 to 1600, q = 2.0)), 3, 0.35) + repeatAt(sine(pts(0 to 160, 0.1 to 90), env(0.001, 0.03, 0.1, 0.4)), 3, 0.35), 1.1) },
        "screw" to { play(repeatAt(noise(env(0.001, 0.008, 0.02, 0.25), bp(0 to 4000, q = 12.0)), 8, 0.07), 0.7) },
        "crane" to { play(listOf(saw(pts(0 to 90, 2.0 to 110), env(0.2, 1.6, 0.3, 0.2), lp(0 to 500))) + repeatAt(noise(env(0.001, 0.01, 0.04, 0.2), bp(0 to 2200, q = 8.0)), 10, 0.2), 2.2) },
        "clock" to { play(repeatAt(noise(env(0.001, 0.005, 0.02, 0.35), bp(0 to 3500, q = 10.0)), 6, 0.5).mapIndexed { i, v -> v.withFilter(bp(0 to (if (i % 2 == 1) 2800 else 3500), q = 10.0)) }, 3.0) },
        "bell" to { play(listOf(sine(pts(0 to 880), pts(0 to 0, 0.005 to 0.35, 1.6 to 0)), sine(pts(0 to 2210), pts(0 to 0, 0.005 to 0.15, 0.9 to 0)), sine(pts(0 to 1320), pts(0 to 0, 0.005 to 0.12, 1.2 to 0))), 1.7) },
        // ---------- UI ----------
        "pop" to { play(listOf(sine(pts(0 to 700, 0.08 to 220), env(0.003, 0.03, 0.06, 0.35))), 0.15) },
        "snap" to { play(listOf(noise(env(0.001, 0.01, 0.04, 0.4), bp(0 to 2200, q = 4.0)), sine(pts(0 to 520, 0.06 to 780), env(0.002, 0.04, 0.05, 0.2))), 0.15) },
        "whoosh" to { play(listOf(noise(pts(0 to 0, 0.15 to 0.3, 0.45 to 0), bp(0 to 400, 0.45 to 2400, q = 2.0))), 0.5) },
        "sparkle" to { play(listOf(523, 784, 1047, 1568).mapIndexed { i, f -> sine(pts(0 to f), pts(0 to 0, 0.005 to 0.18, 0.35 to 0), at = i * 0.07) }, 0.7) },
        "click" to { play(listOf(noise(env(0.001, 0.004, 0.015, 0.3), bp(0 to 3000, q = 6.0))), 0.05) },
        "drum" to { play(listOf(sine(pts(0 to 140, 0.15 to 60), env(0.002, 0.05, 0.2, 0.6))), 0.3) },
        "success" to { play(listOf(523, 659, 784, 1047).mapIndexed { i, f -> Voice("triangle", pts(0 to f), env(0.01, 0.1, 0.15, 0.22), at = i * 0.11) }, 0.8) },
        "tick" to { play(listOf(sine(pts(0 to 1200), env(0.001, 0.01, 0.03, 0.15))), 0.06) },
    )
    private fun lion() = play(listOf(noise(env(0.25, 0.9, 0.5, 0.6), lp(0 to 300, 0.4 to 700, 1.6 to 250, q = 3.0), trem = Lfo(14.0, 0.4)), saw(pts(0 to 70, 0.4 to 95, 1.6 to 60), env(0.25, 0.9, 0.5, 0.35), lp(0 to 500))), 1.8)
    private fun bus() = play(listOf(saw(pts(0 to 38, 0.8 to 60, 2.4 to 52), env(0.3, 1.8, 0.5, 0.45), lp(0 to 250, 0.8 to 450), trem = Lfo(20.0, 0.3)), sq(pts(0 to 300), env(0.02, 0.5, 0.1, 0.18), lp(0 to 1200), at = 2.0)), 2.8)

    // ------------------------------------------------------------------ word → sound (sfxFor)
    private val WORDS: Map<String, String> = mapOf(
        "cow" to "cow", "calf" to "cow", "buffalo" to "cow", "ox" to "cow", "bull" to "cow", "cat" to "cat", "kitten" to "cat", "dog" to "dog", "puppy" to "dog",
        "bird" to "bird", "sparrow" to "bird", "pigeon" to "bird", "duck" to "duck", "rooster" to "rooster", "hen" to "hen", "chick" to "hen", "sheep" to "sheep", "lamb" to "sheep", "goat" to "goat",
        "lion" to "lion", "tiger" to "tiger", "elephant" to "elephant", "frog" to "frog", "owl" to "owl", "crow" to "crow", "horse" to "horse", "donkey" to "horse", "monkey" to "monkey",
        "peacock" to "peacock", "parrot" to "parrot", "bee" to "bee", "snake" to "snake",
        "car" to "car", "jeep" to "car", "taxi" to "car", "bike" to "bike", "motorbike" to "bike", "scooter" to "bike", "bicycle" to "bicycle", "cycle" to "bicycle", "bus" to "bus", "truck" to "truck", "lorry" to "truck",
        "train" to "train", "aeroplane" to "aeroplane", "airplane" to "aeroplane", "plane" to "aeroplane", "helicopter" to "helicopter", "boat" to "boat", "ship" to "boat", "ambulance" to "siren", "fire engine" to "siren",
        "tractor" to "tractor", "auto" to "auto", "auto rickshaw" to "auto", "rickshaw" to "auto", "cart" to "cart", "bullock cart" to "cart", "rocket" to "rocket",
        "rain" to "rain", "drizzle" to "drizzle", "thunder" to "thunder", "storm" to "storm", "lightning" to "thunder", "wind" to "wind", "breeze" to "breeze", "water" to "water", "river" to "stream", "stream" to "stream", "pond" to "stream", "waterfall" to "waterfall",
        "splash" to "splash", "sea" to "sea", "ocean" to "sea", "waves" to "sea", "beach" to "sea", "fire" to "fire", "campfire" to "fire", "leaves" to "leaves", "tree" to "leaves", "cricket" to "crickets", "crickets" to "crickets",
        "night" to "night", "moon" to "night", "forest" to "forest", "jungle" to "forest", "garden" to "garden", "park" to "garden", "birds" to "birds",
        "clock" to "clock", "bell" to "bell", "hammer" to "hammer", "drill" to "drill", "gears" to "gears", "crane" to "crane", "machine" to "motor", "fan" to "motor", "motor" to "motor",
    )

    /** Finds a sound for a word or id (e.g. "cow", "bullock-cart", "Aeroplane") — the website's sfxFor. */
    fun forWord(word: String): String? {
        val k = word.lowercase().replace(Regex("[-_]"), " ").trim()
        WORDS[k]?.let { return it }
        for (part in k.split(Regex("\\s+")).reversed()) WORDS[part]?.let { return it }
        return null
    }

    /** Plays several sounds on a timeline [(ms, name)]; returns a stop function. */
    fun cues(list: List<Pair<Long, String>>): () -> Unit {
        val handles = CopyOnWriteArrayList<SfxHandle>()
        val job = io.launch {
            var at = 0L
            for ((t, n) in list.sortedBy { it.first }) {
                if (t > at) { delay(t - at); at = t }
                if (!isActive) break
                play(n)?.let { handles += it }
            }
        }
        return { job.cancel(); handles.forEach { it.stop() } }
    }
}
