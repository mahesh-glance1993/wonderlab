package com.maheshglance.wonderlab.feature.early.audio

import com.maheshglance.wonderlab.core.platform.onMain
import com.maheshglance.wonderlab.core.platform.toNSData
import com.maheshglance.wonderlab.core.platform.wav
import platform.AVFAudio.AVAudioPlayer

/** iOS: an AVAudioPlayer over an in-memory WAV — supports stereo, looping, live volume (fades/ducking), rate and stop. */
internal actual fun openSfxTrack(pcm: ShortArray, rate: Int, channels: Int, loop: Boolean, playbackRate: Float): SfxTrack? = runCatching {
    val p = AVAudioPlayer(data = wav(pcm, rate, channels).toNSData(), error = null)
    p.numberOfLoops = if (loop) -1 else 0
    if (playbackRate != 1f) { p.enableRate = true; p.rate = playbackRate }
    p.volume = 0f
    if (!p.prepareToPlay()) null else IosSfxTrack(p)
}.getOrNull()

private class IosSfxTrack(private val player: AVAudioPlayer) : SfxTrack {
    override fun setVolume(volume: Float) { player.volume = volume.coerceIn(0f, 1f) }
    override fun play() { onMain { player.play() } }
    override fun stop() { onMain { player.stop() } }
    override fun release() { onMain { player.stop() } }
}
