package com.maheshglance.wonderlab.core.platform

import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.ImageBitmap
import io.ktor.client.HttpClient
import io.ktor.client.HttpClientConfig
import kotlinx.coroutines.flow.StateFlow

/**
 * Everything WonderLab needs from the operating system. One implementation per platform
 * (AndroidPlatform in androidMain, IosPlatform in iosMain); all screens and logic are shared.
 */
interface Platform {
    /** "android" | "ios" */
    val name: String
    /** Shown in the parent's device list, e.g. "WonderLab Android app · Samsung SM-X200". */
    val deviceLabel: String
    /** Base URL of the WonderLab server, e.g. https://learn.maheshglance.com */
    val apiBase: String
    /** App-private folder for saved data (never readable by other apps). */
    val dataDir: String
    /** App-private folder for re-creatable files (voice cache). */
    val cacheDir: String
    /** The device's own "reduce motion / remove animations" accessibility setting. */
    val systemReduceMotion: Boolean
    /** True while the device has a working internet connection. */
    val online: StateFlow<Boolean>

    /** HTTP client with the platform engine (OkHttp on Android, NSURLSession on iOS). */
    fun httpClient(config: HttpClientConfig<*>.() -> Unit): HttpClient

    /** The device's own text-to-speech voice. */
    val tts: DeviceTts

    /** Plays an audio file (natural-voice MP3). Returns a handle to stop it, or null if it cannot play. */
    fun playFile(path: String, volume: Float, rate: Float, onDone: () -> Unit): Playback?

    /** Plays mono 16-bit PCM (feedback chimes, sound effects). */
    fun playPcm(pcm: ShortArray, sampleRate: Int, volume: Float)

    /** Short message at the bottom of the screen. */
    fun toast(message: String)

    /** Puts text on the clipboard. */
    fun copyText(label: String, text: String)

    /** Opens the share sheet for text (e.g. recovery codes → email / notes). */
    fun shareText(subject: String, text: String)

    /** Opens the system print dialog for pages rendered as images (one image per page). */
    fun printPages(jobName: String, pages: List<ImageBitmap>, landscape: Boolean = false)

    /** Encodes an image as PNG bytes. */
    fun encodePng(image: ImageBitmap): ByteArray

    /** Decodes PNG / JPEG / WebP bytes. */
    fun decodeImage(bytes: ByteArray): ImageBitmap?

    /** Small persistent key/value settings (not account data). */
    fun getSetting(key: String): String?
    fun putSetting(key: String, value: String?)
}

/** A playing sound that can be stopped. */
fun interface Playback { fun stop() }

/** The device's text-to-speech voice. */
interface DeviceTts {
    val ready: Boolean
    /** True when a Telugu voice is installed. */
    fun hasTelugu(): Boolean
    /**
     * Speaks text ("en" | "te"). `onWord(start, end)` reports the character range being spoken (read-along
     * highlighting) where the platform supports it. `onDone` runs when speech finishes or is stopped.
     */
    fun speak(text: String, lang: String, rate: Float, volume: Float, onStart: () -> Unit = {}, onWord: (Int, Int) -> Unit = { _, _ -> }, onDone: () -> Unit = {})
    fun stop()
    fun shutdown()
}

/**
 * Saving a file the person chooses where to keep (Android: "Save as" document picker; iOS: share sheet with
 * "Save to Files"). Get one with [rememberFileSaver] inside a composable, then call `save(name, mime, bytes)`.
 */
fun interface FileSaver { fun save(fileName: String, mimeType: String, bytes: ByteArray, onResult: (Boolean) -> Unit) }

@Composable expect fun rememberFileSaver(): FileSaver

/** System back gesture / button (Android). iPad has no back button, so this does nothing there. */
@Composable expect fun BackHandler(enabled: Boolean = true, onBack: () -> Unit)

/** The platform, for composables: `val platform = LocalPlatform.current`. */
val LocalPlatform = staticCompositionLocalOf<Platform> { error("Platform not provided") }
