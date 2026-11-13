package com.maheshglance.wonderlab.feature.early.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlin.math.roundToInt

/** Static AudioTrack (the same setup the Android app has always used for sound effects). */
internal actual fun openSfxTrack(pcm: ShortArray, rate: Int, channels: Int, loop: Boolean, playbackRate: Float): SfxTrack? {
    val track = runCatching {
        AudioTrack.Builder()
            .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
            .setAudioFormat(AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(rate)
                .setChannelMask(if (channels == 2) AudioFormat.CHANNEL_OUT_STEREO else AudioFormat.CHANNEL_OUT_MONO).build())
            .setBufferSizeInBytes(pcm.size * 2)
            .setTransferMode(AudioTrack.MODE_STATIC)
            .build()
    }.getOrNull() ?: return null
    return runCatching {
        track.write(pcm, 0, pcm.size)
        if (loop) track.setLoopPoints(0, pcm.size / channels, -1)
        if (playbackRate != 1f) runCatching { track.playbackRate = (rate * playbackRate).roundToInt() }
        AndroidSfxTrack(track)
    }.getOrElse { runCatching { track.release() }; null }
}

private class AndroidSfxTrack(private val track: AudioTrack) : SfxTrack {
    override fun setVolume(volume: Float) { runCatching { track.setVolume(volume) } }
    override fun play() { track.play() }
    override fun stop() { runCatching { track.stop() } }
    override fun release() { runCatching { track.release() } }
}
