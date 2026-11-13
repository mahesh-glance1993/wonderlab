package com.maheshglance.wonderlab.core.platform

import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asSkiaBitmap
import androidx.compose.ui.graphics.toComposeImageBitmap
import io.ktor.client.HttpClient
import io.ktor.client.HttpClientConfig
import io.ktor.client.engine.darwin.Darwin
import kotlinx.cinterop.ObjCSignatureOverride
import kotlinx.cinterop.addressOf
import kotlinx.cinterop.useContents
import kotlinx.cinterop.usePinned
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.jetbrains.skia.EncodedImageFormat
import platform.AVFAudio.AVAudioPlayer
import platform.AVFAudio.AVAudioPlayerDelegateProtocol
import platform.AVFAudio.AVAudioSession
import platform.AVFAudio.AVAudioSessionCategoryPlayback
import platform.AVFAudio.AVSpeechBoundary
import platform.AVFAudio.AVSpeechSynthesisVoice
import platform.AVFAudio.AVSpeechSynthesizer
import platform.AVFAudio.AVSpeechSynthesizerDelegateProtocol
import platform.AVFAudio.AVSpeechUtterance
import platform.AVFAudio.AVSpeechUtteranceDefaultSpeechRate
import platform.CoreGraphics.CGRectMake
import platform.Foundation.NSApplicationSupportDirectory
import platform.Foundation.NSCachesDirectory
import platform.Foundation.NSData
import platform.Foundation.NSFileManager
import platform.Foundation.NSRange
import platform.Foundation.NSSearchPathForDirectoriesInDomains
import platform.Foundation.NSURL
import platform.Foundation.NSUserDefaults
import platform.Foundation.NSUserDomainMask
import platform.Foundation.create
import platform.Network.nw_path_get_status
import platform.Network.nw_path_monitor_create
import platform.Network.nw_path_monitor_set_queue
import platform.Network.nw_path_monitor_set_update_handler
import platform.Network.nw_path_monitor_start
import platform.Network.nw_path_status_satisfied
import platform.UIKit.UIActivityViewController
import platform.UIKit.UIApplication
import platform.UIKit.UIDevice
import platform.UIKit.UIImage
import platform.UIKit.UIPasteboard
import platform.UIKit.UIPrintInfo
import platform.UIKit.UIPrintInfoOrientation
import platform.UIKit.UIPrintInfoOutputType
import platform.UIKit.UIPrintInteractionController
import platform.UIKit.UIViewController
import platform.UIKit.popoverPresentationController
import platform.darwin.NSObject
import platform.darwin.dispatch_async
import platform.darwin.dispatch_get_main_queue
import platform.posix.memcpy
import org.jetbrains.skia.Image as SkImage

/** iOS / iPadOS implementation of [Platform]. */
class IosPlatform(override val apiBase: String = "https://learn.maheshglance.com") : Platform {
    override val name = "ios"
    override val deviceLabel = "WonderLab ${UIDevice.currentDevice.model} app · iPadOS ${UIDevice.currentDevice.systemVersion}"
    override val dataDir: String = appDir(NSApplicationSupportDirectory, "WonderLab")
    override val cacheDir: String = appDir(NSCachesDirectory, "WonderLab")

    private val _online = MutableStateFlow(true)
    override val online: StateFlow<Boolean> = _online
    private val monitor = nw_path_monitor_create()

    init {
        // play narration and sounds even when the iPad's silent switch is on (it is a learning app, like a video)
        AVAudioSession.sharedInstance().setCategory(AVAudioSessionCategoryPlayback, error = null)
        nw_path_monitor_set_update_handler(monitor) { path -> _online.value = nw_path_get_status(path) == nw_path_status_satisfied }
        nw_path_monitor_set_queue(monitor, dispatch_get_main_queue())
        nw_path_monitor_start(monitor)
    }

    override fun httpClient(config: HttpClientConfig<*>.() -> Unit): HttpClient = HttpClient(Darwin) { config() }

    override val tts: DeviceTts = IosTts()

    // ---- audio -------------------------------------------------------------------------------------------
    private val playing = mutableSetOf<Pair<AVAudioPlayer, PlayerDone>>()

    private fun start(player: AVAudioPlayer?, volume: Float, rate: Float, onDone: () -> Unit): Playback? {
        player ?: return null
        val done = PlayerDone { p -> onMain { playing.removeAll { it.first === p }; onDone() } }
        player.delegate = done
        player.volume = volume
        if (rate != 1f) { player.enableRate = true; player.rate = rate }
        if (!player.prepareToPlay() || !player.play()) return null
        onMain { playing += player to done }
        return Playback { onMain { player.stop(); playing.removeAll { it.first === player } } }
    }

    override fun playFile(path: String, volume: Float, rate: Float, onDone: () -> Unit): Playback? =
        runCatching { start(AVAudioPlayer(contentsOfURL = NSURL.fileURLWithPath(path), error = null), volume, rate, onDone) }.getOrNull()

    override fun playPcm(pcm: ShortArray, sampleRate: Int, volume: Float) {
        runCatching { start(AVAudioPlayer(data = wav(pcm, sampleRate).toNSData(), error = null), volume, 1f) {} }
    }

    // ---- UI services ---------------------------------------------------------------------------------------
    override fun toast(message: String) = ToastBus.show(message)

    override fun copyText(label: String, text: String) { UIPasteboard.generalPasteboard.string = text }

    override fun shareText(subject: String, text: String) = onMain { presentShare(listOf(text)) {} }

    override fun printPages(jobName: String, pages: List<ImageBitmap>, landscape: Boolean) {
        val images = pages.mapNotNull { UIImage.imageWithData(encodePng(it).toNSData()) }
        onMain {
            val vc = topViewController() ?: return@onMain
            val info = UIPrintInfo.printInfo()
            info.outputType = UIPrintInfoOutputType.UIPrintInfoOutputGeneral
            info.jobName = jobName
            info.orientation = if (landscape) UIPrintInfoOrientation.UIPrintInfoOrientationLandscape else UIPrintInfoOrientation.UIPrintInfoOrientationPortrait
            val pc = UIPrintInteractionController.sharedPrintController
            pc.printInfo = info
            pc.printingItems = images
            val r = vc.view.bounds.useContents { CGRectMake(size.width / 2, size.height / 2, 1.0, 1.0) }
            pc.presentFromRect(r, inView = vc.view, animated = true, completionHandler = null)
        }
    }

    override fun encodePng(image: ImageBitmap): ByteArray =
        SkImage.makeFromBitmap(image.asSkiaBitmap()).encodeToData(EncodedImageFormat.PNG)?.bytes ?: ByteArray(0)

    override fun decodeImage(bytes: ByteArray): ImageBitmap? = runCatching { SkImage.makeFromEncoded(bytes).toComposeImageBitmap() }.getOrNull()

    override fun getSetting(key: String): String? = NSUserDefaults.standardUserDefaults.stringForKey(key)
    override fun putSetting(key: String, value: String?) {
        if (value == null) NSUserDefaults.standardUserDefaults.removeObjectForKey(key)
        else NSUserDefaults.standardUserDefaults.setObject(value, forKey = key)
    }
}

/** AVAudioPlayer finished callback (kept alive while playing: delegates are weak in UIKit). */
private class PlayerDone(private val done: (AVAudioPlayer) -> Unit) : NSObject(), AVAudioPlayerDelegateProtocol {
    override fun audioPlayerDidFinishPlaying(player: AVAudioPlayer, successfully: Boolean) = done(player)
}

/** The iPad's own voices (AVSpeechSynthesizer), with word ranges for read-along highlighting. */
private class IosTts : DeviceTts {
    private val synth = AVSpeechSynthesizer()
    private var cb: TtsCallbacks? = null
    private val delegate = TtsDelegate { cb }

    init { synth.delegate = delegate }

    override val ready: Boolean get() = true

    override fun hasTelugu(): Boolean = AVSpeechSynthesisVoice.voiceWithLanguage("te-IN") != null

    override fun speak(text: String, lang: String, rate: Float, volume: Float, onStart: () -> Unit, onWord: (Int, Int) -> Unit, onDone: () -> Unit) {
        onMain {
            if (synth.isSpeaking()) { cb = null; synth.stopSpeakingAtBoundary(AVSpeechBoundary.AVSpeechBoundaryImmediate) }
            val u = AVSpeechUtterance.speechUtteranceWithString(text)
            u.voice = if (lang == "te") AVSpeechSynthesisVoice.voiceWithLanguage("te-IN")
            else listOf("en-IN", "en-GB", "en-US").firstNotNullOfOrNull { AVSpeechSynthesisVoice.voiceWithLanguage(it) }
            // Android's 1.0 = normal; iOS's normal is AVSpeechUtteranceDefaultSpeechRate (0.5)
            u.rate = (AVSpeechUtteranceDefaultSpeechRate * rate).coerceIn(0.1f, 1f)
            u.volume = volume
            val c = TtsCallbacks(u, onStart, onWord, onDone)
            cb = c
            synth.speakUtterance(u)
        }
    }

    override fun stop() = onMain {
        val c = cb; cb = null
        synth.stopSpeakingAtBoundary(AVSpeechBoundary.AVSpeechBoundaryImmediate)
        c?.onDone?.invoke()
    }

    override fun shutdown() = stop()
}

private class TtsCallbacks(val utterance: AVSpeechUtterance, val onStart: () -> Unit, val onWord: (Int, Int) -> Unit, val onDone: () -> Unit)

private class TtsDelegate(private val current: () -> TtsCallbacks?) : NSObject(), AVSpeechSynthesizerDelegateProtocol {
    private fun cbFor(u: AVSpeechUtterance) = current()?.takeIf { it.utterance === u }

    @ObjCSignatureOverride
    override fun speechSynthesizer(synthesizer: AVSpeechSynthesizer, didStartSpeechUtterance: AVSpeechUtterance) {
        cbFor(didStartSpeechUtterance)?.onStart?.invoke()
    }

    @ObjCSignatureOverride
    override fun speechSynthesizer(synthesizer: AVSpeechSynthesizer, didFinishSpeechUtterance: AVSpeechUtterance) {
        cbFor(didFinishSpeechUtterance)?.onDone?.invoke()
    }

    override fun speechSynthesizer(synthesizer: AVSpeechSynthesizer, willSpeakRangeOfSpeechString: kotlinx.cinterop.CValue<NSRange>, utterance: AVSpeechUtterance) {
        val c = cbFor(utterance) ?: return
        willSpeakRangeOfSpeechString.useContents { c.onWord(location.toInt(), (location + length).toInt()) }
    }
}

// ---- helpers ---------------------------------------------------------------------------------------------

internal fun onMain(block: () -> Unit) = dispatch_async(dispatch_get_main_queue()) { block() }

private fun appDir(kind: ULong, sub: String): String {
    val base = (NSSearchPathForDirectoriesInDomains(kind, NSUserDomainMask, true).firstOrNull() as? String) ?: platform.Foundation.NSTemporaryDirectory()
    val path = "$base/$sub"
    NSFileManager.defaultManager.createDirectoryAtPath(path, withIntermediateDirectories = true, attributes = null, error = null)
    return path
}

/** The view controller currently on screen (to present share sheets and print dialogs). */
internal fun topViewController(): UIViewController? {
    @Suppress("DEPRECATION")
    var vc = UIApplication.sharedApplication.keyWindow?.rootViewController
        ?: UIApplication.sharedApplication.windows.firstOrNull()?.let { (it as? platform.UIKit.UIWindow)?.rootViewController }
    while (vc?.presentedViewController != null) vc = vc.presentedViewController
    return vc
}

/** iPad share sheet (anchored to the screen centre, as iPad requires a popover anchor). */
internal fun presentShare(items: List<Any>, onDone: (Boolean) -> Unit) {
    val vc = topViewController() ?: return onDone(false)
    val avc = UIActivityViewController(activityItems = items, applicationActivities = null)
    avc.completionWithItemsHandler = { _, completed, _, _ -> onDone(completed) }
    avc.popoverPresentationController?.let { p ->
        p.sourceView = vc.view
        p.sourceRect = vc.view.bounds.useContents { CGRectMake(size.width / 2, size.height / 2, 1.0, 1.0) }
        p.permittedArrowDirections = 0u
    }
    vc.presentViewController(avc, animated = true, completion = null)
}

internal fun ByteArray.toNSData(): NSData =
    if (isEmpty()) NSData() else usePinned { NSData.create(bytes = it.addressOf(0), length = size.toULong()) }

internal fun NSData.toByteArray(): ByteArray {
    val out = ByteArray(length.toInt())
    if (out.isNotEmpty()) out.usePinned { memcpy(it.addressOf(0), bytes, length) }
    return out
}

/** 16-bit PCM (mono, or interleaved stereo) wrapped in a WAV header (AVAudioPlayer plays it from memory). */
internal fun wav(pcm: ShortArray, rate: Int, channels: Int = 1): ByteArray {
    val dataLen = pcm.size * 2
    val b = ByteArray(44 + dataLen)
    fun s(o: Int, t: String) = t.forEachIndexed { i, c -> b[o + i] = c.code.toByte() }
    fun i32(o: Int, v: Int) { for (k in 0 until 4) b[o + k] = (v shr (8 * k)).toByte() }
    fun i16(o: Int, v: Int) { b[o] = v.toByte(); b[o + 1] = (v shr 8).toByte() }
    s(0, "RIFF"); i32(4, 36 + dataLen); s(8, "WAVE"); s(12, "fmt "); i32(16, 16); i16(20, 1); i16(22, channels)
    i32(24, rate); i32(28, rate * 2 * channels); i16(32, 2 * channels); i16(34, 16); s(36, "data"); i32(40, dataLen)
    pcm.forEachIndexed { i, v -> i16(44 + i * 2, v.toInt()) }
    return b
}
