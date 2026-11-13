package com.maheshglance.wonderlab.feature.early.audio

import com.maheshglance.wonderlab.core.audio.Tones

/**
 * One prepared sound-effect buffer that can be played, re-levelled while it plays (fades, ducking under narration),
 * looped and stopped. Android uses a static AudioTrack; other platforms fall back to [PcmFallbackTrack].
 */
interface SfxTrack {
    /** Final output volume 0..1 (level × app volume × ducking). */
    fun setVolume(volume: Float)
    fun play()
    fun stop()
    fun release()
}

/**
 * Opens a track for 16-bit PCM (`channels` 1 = mono, 2 = interleaved stereo). `loop` repeats it until stopped;
 * `playbackRate` slightly speeds up / slows down playback. Returns null when the device cannot play it.
 */
internal expect fun openSfxTrack(pcm: ShortArray, rate: Int, channels: Int, loop: Boolean, playbackRate: Float): SfxTrack?

/**
 * Fallback for platforms without a native track: plays the buffer once (mixed to mono) through Platform.playPcm,
 * at the volume set when it starts. It cannot be faded, looped or stopped early.
 */
internal class PcmFallbackTrack(private val pcm: ShortArray, private val rate: Int, private val channels: Int, private val playbackRate: Float) : SfxTrack {
    private var volume = 1f
    private var started = false
    override fun setVolume(volume: Float) { this.volume = volume }
    override fun play() {
        if (started) return
        started = true
        val mono = if (channels == 2) ShortArray(pcm.size / 2) { i -> ((pcm[i * 2] + pcm[i * 2 + 1]) / 2).toShort() } else pcm
        // a fade-in starts at 0, so play at the app volume instead of silence
        val v = if (volume > 0f) volume else Tones.volume
        runCatching { Tones.platform?.playPcm(mono, (rate * playbackRate).toInt(), v) }
    }
    override fun stop() {}
    override fun release() {}
}
