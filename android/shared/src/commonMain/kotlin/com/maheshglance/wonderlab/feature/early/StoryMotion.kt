package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.feature.early.audio.SfxHandle
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.concurrent.CopyOnWriteArrayList

/*
 * Story page animation player — the native version of useStoryMotion.ts + the helpers in data/motion.ts.
 * Poses are offsets from an actor's resting place in stage units (400×260): x/y translate, r rotate (deg),
 * s scale, sx/sy stretch, o opacity. Sound cues and look changes (`v`) run on the same clock as the movement.
 */

/** The website's EASE: cubic-bezier(.45,0,.35,1), applied to every keyframe segment. */
val STORY_EASE = CubicBezierEasing(0.45f, 0f, 0.35f, 1f)

data class Pose(val x: Float = 0f, val y: Float = 0f, val r: Float = 0f, val s: Float = 1f, val sx: Float = 1f, val sy: Float = 1f, val o: Float = 1f)

fun Key.pose() = Pose(x ?: 0f, y ?: 0f, r ?: 0f, s ?: 1f, sx ?: 1f, sy ?: 1f, o ?: 1f)
private fun lerp(a: Float, b: Float, f: Float) = a + (b - a) * f
private fun lerp(a: Pose, b: Pose, f: Float) = Pose(lerp(a.x, b.x, f), lerp(a.y, b.y, f), lerp(a.r, b.r, f), lerp(a.s, b.s, f), lerp(a.sx, b.sx, f), lerp(a.sy, b.sy, f), lerp(a.o, b.o, f))

/** Pose of a track at time t (ms): holds the first pose before it starts and the last one after (toKeyframes). */
fun poseAt(tr: Track, t: Float): Pose {
    val keys = tr.keys
    if (keys.isEmpty()) return Pose()
    if (t <= keys[0].t) return keys[0].pose()
    for (i in 1 until keys.size) {
        val b = keys[i]
        if (t < b.t) {
            val a = keys[i - 1]
            val span = b.t - a.t
            if (span <= 0f) return b.pose()
            return lerp(a.pose(), b.pose(), STORY_EASE.transform(((t - a.t) / span).coerceIn(0f, 1f)))
        }
    }
    return keys.last().pose()
}

fun trackEnd(t: Track): Float = t.keys.lastOrNull()?.t ?: 0f
fun tapDuration(m: TapMotion?): Float = if (m == null) 0f else (m.tracks.map { trackEnd(it) } + m.cues.map { it.t } + 0f).max()
fun initialV(m: PageMotion?): Map<String, String> = m?.init ?: emptyMap()
fun finalV(m: PageMotion?): Map<String, String> {
    val v = initialV(m).toMutableMap()
    for (s in (m?.sets ?: emptyList()).sortedBy { it.t }) v[s.actor] = s.v
    return v
}

fun nowMs(): Long = nanoTime() / 1_000_000

enum class MotionStatus { Ready, Running, Paused, Done }

/** Plays one page's motion; state is Compose state so graphicsLayer/Canvas lambdas read it without recomposing. */
class PageClock(val pm: PageMotion?, val reduced: Boolean, private val scope: CoroutineScope) {
    var status by mutableStateOf(if (reduced || pm == null) MotionStatus.Done else MotionStatus.Ready)
        private set
    /** Current frame time (ms, nanoTime based) — advanced by the screen's frame loop. */
    var frame by mutableLongStateOf(nowMs())
        private set
    val born = nowMs()
    private var t0 = 0L
    private var at = 0f
    val v = mutableStateMapOf<String, String>().apply { putAll(if (reduced) finalV(pm) else initialV(pm)) }
    private val firedCues = HashSet<Int>()
    private val firedSets = HashSet<Int>()
    private val sounds = CopyOnWriteArrayList<SfxHandle>()
    private val timers = CopyOnWriteArrayList<Job>()
    /** Tap mini animations: actor → (track, start ms). They override the page pose and keep their last pose. */
    val taps = mutableStateMapOf<String, Pair<Track, Long>>()

    fun time(): Float = if (status == MotionStatus.Running) (frame - t0).toFloat() else at

    private fun play(name: String) { Sfx.play(name)?.let { sounds += it } }

    fun tick(now: Long) {
        frame = now
        val p = pm ?: return
        if (status != MotionStatus.Running) return
        val t = time()
        p.cues.forEachIndexed { i, c -> if (i !in firedCues && c.t <= t) { firedCues += i; if (t - c.t < 1500) play(c.sfx) } }
        p.sets.forEachIndexed { i, s -> if (i !in firedSets && s.t <= t) { firedSets += i; v[s.actor] = s.v } }
        if (t >= p.dur) { at = p.dur; status = MotionStatus.Done }
    }

    fun start() {
        if (pm == null || reduced || status != MotionStatus.Ready) return
        frame = nowMs(); t0 = frame - at.toLong(); status = MotionStatus.Running
    }

    fun pause() {
        stopSounds()
        if (status != MotionStatus.Running) return
        at = time(); status = MotionStatus.Paused
    }

    fun resume() {
        if (status != MotionStatus.Paused) return
        frame = nowMs(); t0 = frame - at.toLong(); status = MotionStatus.Running
    }

    /** Back to the starting pose, ready to start again. */
    fun reset() {
        stopSounds()
        if (pm == null || reduced) return
        at = 0f; firedCues.clear(); firedSets.clear()
        v.clear(); v.putAll(initialV(pm))
        status = MotionStatus.Ready
    }

    /** Mini animation + sounds for a tap (or "@done"). False when the page has none for this key. */
    fun tap(key: String): Boolean {
        val tm = pm?.tap?.get(key) ?: return false
        val start = if (reduced) nowMs() - 1_000_000L else nowMs()
        for (tr in tm.tracks) taps[tr.actor] = tr to start
        for (c in tm.cues) {
            if (c.t <= 0f) play(c.sfx)
            else timers += scope.launch { delay(c.t.toLong()); play(c.sfx) }
        }
        return true
    }

    fun tapDelay(id: String): Long = tapDuration(pm?.tap?.get(id)).toLong()

    /** The pose of an actor right now (null = at rest, no track). */
    fun pose(actor: String): Pose? {
        taps[actor]?.let { (tr, st) -> return poseAt(tr, (frame - st).toFloat()) }
        val tr = pm?.tracks?.firstOrNull { it.actor == actor } ?: return null
        return poseAt(tr, if (reduced) Float.MAX_VALUE else time())
    }
    fun origin(actor: String): String? = pm?.tracks?.firstOrNull { it.actor == actor }?.origin ?: taps[actor]?.first?.origin

    fun stopSounds() {
        sounds.forEach { it.stop() }; sounds.clear()
        timers.forEach { it.cancel() }; timers.clear()
    }
}
