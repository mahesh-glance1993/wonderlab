package com.maheshglance.wonderlab.core.audio

import com.maheshglance.wonderlab.core.data.Files
import com.maheshglance.wonderlab.core.net.Api
import com.maheshglance.wonderlab.core.platform.Platform
import com.maheshglance.wonderlab.core.platform.Playback
import com.maheshglance.wonderlab.core.platform.nowMillis
import com.maheshglance.wonderlab.core.platform.sha256Hex
import com.maheshglance.wonderlab.core.platform.urlEncode
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull

data class SpeechPrefs(val mute: Boolean = false, val volume: Float = 0.8f, val rate: Float = 0.92f, val natural: Boolean = true, val speaker: String = "luna", val narration: Boolean = true)

/**
 * Narration, like the website: the natural (neural) English voice from /api/tts when online (cached on the device),
 * otherwise the device's own voice. Telugu uses the device's Telugu voice; if none is installed the English text is read.
 */
class Speech(private val platform: Platform, private val api: Api, private val scope: CoroutineScope) {
    private val tts get() = platform.tts
    private var player: Playback? = null
    private var job: Job? = null
    private val cacheDir = "${platform.cacheDir}/tts".also { Files.mkdirs(it) }
    private var naturalBrokenAt = 0L
    var prefs = SpeechPrefs()
        set(v) { field = v; if (v.mute) stop() }
    private val _speaking = MutableStateFlow(false)
    val speaking: StateFlow<Boolean> = _speaking
    private var last: Triple<String, String, String?>? = null

    fun hasTelugu(): Boolean = tts.ready && tts.hasTelugu()

    /** Speaks text in `lang` ("en" | "te"). `fallbackEn` is read when Telugu has no voice on this device. */
    fun speak(text: String, lang: String = "en", fallbackEn: String? = null) {
        last = Triple(text, lang, fallbackEn)
        if (prefs.mute || !prefs.narration || text.isBlank()) return
        stop()
        val clean = text.replace(Regex("<[^>]+>"), " ").replace(Regex("\\s+"), " ").trim()
        job = scope.launch {
            val enText = if (lang == "en") clean else if (!hasTelugu()) fallbackEn else null
            if (enText != null && prefs.natural && nowMillis() - naturalBrokenAt > 60_000) {
                if (playNatural(enText)) return@launch
            }
            val te = lang == "te" && hasTelugu()
            speakDevice(if (te) clean else (enText ?: clean), if (te) "te" else "en")
        }
    }

    fun replay() { last?.let { (t, l, f) -> speak(t, l, f) } }

    fun stop() {
        job?.cancel()
        runCatching { player?.stop() }; player = null
        tts.stop()
        _speaking.value = false
    }

    private fun speakDevice(text: String, lang: String) {
        if (!tts.ready) return
        tts.speak(text.take(3900), lang, prefs.rate, prefs.volume, onStart = { _speaking.value = true }, onDone = { _speaking.value = false })
    }

    private suspend fun playNatural(text: String): Boolean {
        val t = text.take(400)
        val key = sha256Hex("${prefs.speaker}|$t")
        val f = "$cacheDir/$key.mp3"
        if (!Files.exists(f)) {
            val bytes = withTimeoutOrNull(6000) { api.bytes("/tts?v=${urlEncode(prefs.speaker)}&text=${urlEncode(t)}") }
            if (bytes == null || bytes.size < 200) { naturalBrokenAt = nowMillis(); return false }
            runCatching { Files.writeBytes(f, bytes) }.onFailure { return false }
            trimCache()
        }
        val p = platform.playFile(f, prefs.volume, (prefs.rate / 0.92f).coerceIn(0.75f, 1f)) { _speaking.value = false; player = null }
        if (p == null) { Files.delete(f); return false }
        player = p
        _speaking.value = true
        return true
    }

    private fun trimCache() {
        val files = Files.list(cacheDir)
        if (files.size > 300) files.sorted().take(files.size - 300).forEach { Files.delete("$cacheDir/$it") }
    }

    fun shutdown() { stop(); tts.shutdown() }
}
