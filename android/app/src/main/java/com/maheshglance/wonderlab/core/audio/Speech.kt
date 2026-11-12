package com.maheshglance.wonderlab.core.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.maheshglance.wonderlab.core.net.Api
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import java.io.File
import java.net.URLEncoder
import java.security.MessageDigest
import java.util.Locale

data class SpeechPrefs(val mute: Boolean = false, val volume: Float = 0.8f, val rate: Float = 0.92f, val natural: Boolean = true, val speaker: String = "luna", val narration: Boolean = true)

/**
 * Narration, like the website: the natural (neural) English voice from /api/tts when online (cached on the device),
 * otherwise the phone's own voice. Telugu uses the device's Telugu voice; if none is installed the English text is read.
 */
class Speech(private val context: Context, private val api: Api, private val scope: CoroutineScope) {
    private var tts: TextToSpeech? = null
    private var ttsReady = false
    private var player: MediaPlayer? = null
    private var job: Job? = null
    private val cacheDir = File(context.cacheDir, "tts").apply { mkdirs() }
    private var naturalBrokenAt = 0L
    var prefs = SpeechPrefs()
        set(v) { field = v; if (v.mute) stop() }
    private val _speaking = MutableStateFlow(false)
    val speaking: StateFlow<Boolean> = _speaking
    private var last: Triple<String, String, String?>? = null

    init {
        tts = TextToSpeech(context) { status -> ttsReady = status == TextToSpeech.SUCCESS }
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) { _speaking.value = true }
            override fun onDone(utteranceId: String?) { _speaking.value = false }
            @Deprecated("Deprecated in Java") override fun onError(utteranceId: String?) { _speaking.value = false }
        })
    }

    fun hasTelugu(): Boolean = ttsReady && (tts?.isLanguageAvailable(Locale("te", "IN")) ?: TextToSpeech.LANG_NOT_SUPPORTED) >= TextToSpeech.LANG_AVAILABLE

    /** Speaks text in `lang` ("en" | "te"). `fallbackEn` is read when Telugu has no voice on this device. */
    fun speak(text: String, lang: String = "en", fallbackEn: String? = null) {
        last = Triple(text, lang, fallbackEn)
        if (prefs.mute || !prefs.narration || text.isBlank()) return
        stop()
        val clean = text.replace(Regex("<[^>]+>"), " ").replace(Regex("\\s+"), " ").trim()
        job = scope.launch {
            val enText = if (lang == "en") clean else if (!hasTelugu()) fallbackEn else null
            if (enText != null && prefs.natural && System.currentTimeMillis() - naturalBrokenAt > 60_000) {
                if (playNatural(enText)) return@launch
            }
            speakDevice(if (lang == "te" && hasTelugu()) clean else (enText ?: clean), if (lang == "te" && hasTelugu()) "te" else "en")
        }
    }

    fun replay() { last?.let { (t, l, f) -> speak(t, l, f) } }

    fun stop() {
        job?.cancel()
        runCatching { player?.stop() }; runCatching { player?.release() }; player = null
        tts?.stop()
        _speaking.value = false
    }

    private fun speakDevice(text: String, lang: String) {
        val t = tts ?: return
        if (!ttsReady) return
        val loc = if (lang == "te") Locale("te", "IN") else listOf(Locale("en", "IN"), Locale.UK, Locale.US).firstOrNull { t.isLanguageAvailable(it) >= TextToSpeech.LANG_AVAILABLE } ?: Locale.US
        t.language = loc
        t.setSpeechRate(prefs.rate)
        val params = android.os.Bundle().apply { putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, prefs.volume) }
        t.speak(text.take(TextToSpeech.getMaxSpeechInputLength() - 1), TextToSpeech.QUEUE_FLUSH, params, "wl-${System.nanoTime()}")
    }

    private suspend fun playNatural(text: String): Boolean {
        val t = text.take(400)
        val key = MessageDigest.getInstance("SHA-256").digest("${prefs.speaker}|$t".toByteArray()).joinToString("") { "%02x".format(it) }
        val f = File(cacheDir, "$key.mp3")
        if (!f.exists()) {
            val bytes = withTimeoutOrNull(6000) { api.bytes("/tts?v=${URLEncoder.encode(prefs.speaker, "UTF-8")}&text=${URLEncoder.encode(t, "UTF-8")}") }
            if (bytes == null || bytes.size < 200) { naturalBrokenAt = System.currentTimeMillis(); return false }
            f.writeBytes(bytes)
            trimCache()
        }
        return runCatching {
            val mp = MediaPlayer()
            mp.setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
            mp.setDataSource(f.absolutePath)
            mp.setVolume(prefs.volume, prefs.volume)
            mp.prepare()
            runCatching { mp.playbackParams = mp.playbackParams.setSpeed((prefs.rate / 0.92f).coerceIn(0.75f, 1f)) }
            mp.setOnCompletionListener { _speaking.value = false; it.release(); if (player === it) player = null }
            player = mp
            _speaking.value = true
            mp.start()
            true
        }.getOrElse { f.delete(); false }
    }

    private fun trimCache() {
        val files = cacheDir.listFiles()?.sortedBy { it.lastModified() } ?: return
        if (files.size > 300) files.take(files.size - 300).forEach { it.delete() }
    }

    fun shutdown() { stop(); tts?.shutdown() }
}
