package com.maheshglance.wonderlab.core.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlin.math.PI
import kotlin.math.exp
import kotlin.math.sin

/**
 * Short synthesized feedback tones (same idea as the website's tone(): soft sine chimes, no recorded files).
 * Feature code can also play any custom PCM via [play].
 */
object Tones {
    private const val RATE = 22050
    var volume = 0.8f
    var muted = false
    private val io = CoroutineScope(Dispatchers.Default)

    fun correct() = notes(listOf(659.25 to 0.12, 880.0 to 0.22))
    fun wrong() = notes(listOf(330.0 to 0.16, 262.0 to 0.22), 0.5)
    fun tap() = notes(listOf(520.0 to 0.05), 0.4)
    fun complete() = notes(listOf(523.25 to 0.12, 659.25 to 0.12, 783.99 to 0.12, 1046.5 to 0.3))

    fun notes(seq: List<Pair<Double, Double>>, gain: Double = 0.7) {
        if (muted) return
        io.launch {
            val total = seq.sumOf { (it.second * RATE).toInt() }
            val pcm = ShortArray(total)
            var off = 0
            for ((f, d) in seq) {
                val n = (d * RATE).toInt()
                for (i in 0 until n) {
                    val t = i.toDouble() / RATE
                    val env = (1 - exp(-t * 80)) * exp(-t * 6)
                    val s = (sin(2 * PI * f * t) + 0.25 * sin(4 * PI * f * t)) * env * gain * 0.35
                    pcm[off + i] = (s * Short.MAX_VALUE).toInt().coerceIn(-32767, 32767).toShort()
                }
                off += n
            }
            play(pcm)
        }
    }

    /** Plays mono 16-bit PCM at 22.05 kHz. */
    fun play(pcm: ShortArray, rate: Int = RATE) {
        if (muted || pcm.isEmpty()) return
        runCatching {
            val track = AudioTrack.Builder()
                .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
                .setAudioFormat(AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(rate).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                .setBufferSizeInBytes(pcm.size * 2)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()
            track.write(pcm, 0, pcm.size)
            track.setVolume(volume)
            track.setNotificationMarkerPosition(pcm.size)
            track.setPlaybackPositionUpdateListener(object : AudioTrack.OnPlaybackPositionUpdateListener {
                override fun onMarkerReached(t: AudioTrack) { t.release() }
                override fun onPeriodicNotification(t: AudioTrack) {}
            })
            track.play()
        }
    }
}
