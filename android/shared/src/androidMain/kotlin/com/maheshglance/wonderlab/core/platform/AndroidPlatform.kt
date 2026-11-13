package com.maheshglance.wonderlab.core.platform

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.pdf.PdfDocument
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.media.MediaPlayer
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Bundle
import android.os.CancellationSignal
import android.os.Handler
import android.os.Looper
import android.os.ParcelFileDescriptor
import android.print.PageRange
import android.print.PrintAttributes
import android.print.PrintDocumentAdapter
import android.print.PrintDocumentInfo
import android.print.PrintManager
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.widget.Toast
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.graphics.asImageBitmap
import io.ktor.client.HttpClient
import io.ktor.client.HttpClientConfig
import io.ktor.client.engine.okhttp.OkHttp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.io.ByteArrayOutputStream
import java.io.FileOutputStream
import java.lang.ref.WeakReference
import java.util.Locale

/** Android implementation of [Platform]. Created once by the Application. */
class AndroidPlatform(private val context: Context, override val apiBase: String) : Platform {
    override val name = "android"
    override val deviceLabel = "WonderLab Android app · ${Build.MANUFACTURER} ${Build.MODEL}"
    override val dataDir: String = context.filesDir.absolutePath
    override val cacheDir: String = context.cacheDir.absolutePath
    override val systemReduceMotion: Boolean
        get() = runCatching { android.provider.Settings.Global.getFloat(context.contentResolver, android.provider.Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f }.getOrDefault(false)
    private val main = Handler(Looper.getMainLooper())

    /** The visible activity (printing needs an Activity context). Set by MainActivity. */
    var activity: WeakReference<android.app.Activity>? = null

    private val _online = MutableStateFlow(true)
    override val online: StateFlow<Boolean> = _online

    init {
        val cm = context.getSystemService(ConnectivityManager::class.java)
        if (cm != null) {
            _online.value = cm.getNetworkCapabilities(cm.activeNetwork)?.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED) == true
            cm.registerDefaultNetworkCallback(object : ConnectivityManager.NetworkCallback() {
                override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) { _online.value = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) }
                override fun onLost(network: Network) { _online.value = false }
            })
        }
    }

    override fun httpClient(config: HttpClientConfig<*>.() -> Unit): HttpClient = HttpClient(OkHttp) { config() }

    override val tts: DeviceTts = AndroidTts(context)

    override fun playFile(path: String, volume: Float, rate: Float, onDone: () -> Unit): Playback? = runCatching {
        val mp = MediaPlayer()
        mp.setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
        mp.setDataSource(path)
        mp.setVolume(volume, volume)
        mp.prepare()
        runCatching { mp.playbackParams = mp.playbackParams.setSpeed(rate) }
        mp.setOnCompletionListener { onDone(); it.release() }
        mp.start()
        Playback { runCatching { mp.stop() }; runCatching { mp.release() } }
    }.getOrNull()

    override fun playPcm(pcm: ShortArray, sampleRate: Int, volume: Float) {
        runCatching {
            val track = AudioTrack.Builder()
                .setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build())
                .setAudioFormat(AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(sampleRate).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
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

    override fun toast(message: String) { main.post { Toast.makeText(context, message, Toast.LENGTH_SHORT).show() } }

    override fun copyText(label: String, text: String) {
        context.getSystemService(ClipboardManager::class.java)?.setPrimaryClip(ClipData.newPlainText(label, text))
    }

    override fun shareText(subject: String, text: String) {
        val i = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_SUBJECT, subject).putExtra(Intent.EXTRA_TEXT, text)
        runCatching { context.startActivity(Intent.createChooser(i, subject).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
    }

    override fun printPages(jobName: String, pages: List<ImageBitmap>, landscape: Boolean) {
        val act = activity?.get() ?: return
        val pm = act.getSystemService(Context.PRINT_SERVICE) as? PrintManager ?: return
        val bitmaps = pages.map { it.asAndroidBitmap() }
        // A4 in PostScript points
        val pw = if (landscape) 842 else 595
        val ph = if (landscape) 595 else 842
        val adapter = object : PrintDocumentAdapter() {
            override fun onLayout(old: PrintAttributes?, new: PrintAttributes, cancel: CancellationSignal?, cb: LayoutResultCallback, extras: Bundle?) {
                if (cancel?.isCanceled == true) { cb.onLayoutCancelled(); return }
                cb.onLayoutFinished(PrintDocumentInfo.Builder(jobName.replace(Regex("[^\\w\\- ]+"), "").trim().ifEmpty { "WonderLab" } + ".pdf")
                    .setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT).setPageCount(bitmaps.size).build(), true)
            }
            override fun onWrite(range: Array<out PageRange>, dest: ParcelFileDescriptor, cancel: CancellationSignal?, cb: WriteResultCallback) {
                val pdf = PdfDocument()
                try {
                    val paint = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)
                    bitmaps.forEachIndexed { i, b ->
                        if (cancel?.isCanceled == true) { cb.onWriteCancelled(); return }
                        val page = pdf.startPage(PdfDocument.PageInfo.Builder(pw, ph, i + 1).create())
                        page.canvas.drawBitmap(b, null, Rect(0, 0, pw, ph), paint)
                        pdf.finishPage(page)
                    }
                    FileOutputStream(dest.fileDescriptor).use { pdf.writeTo(it) }
                    cb.onWriteFinished(arrayOf(PageRange.ALL_PAGES))
                } catch (e: Exception) { cb.onWriteFailed(e.message) } finally { pdf.close() }
            }
        }
        val media = if (landscape) PrintAttributes.MediaSize.ISO_A4.asLandscape() else PrintAttributes.MediaSize.ISO_A4
        pm.print(jobName, adapter, PrintAttributes.Builder().setMediaSize(media).build())
    }

    override fun encodePng(image: ImageBitmap): ByteArray =
        ByteArrayOutputStream().use { out -> image.asAndroidBitmap().compress(Bitmap.CompressFormat.PNG, 100, out); out.toByteArray() }

    override fun decodeImage(bytes: ByteArray): ImageBitmap? = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)?.asImageBitmap()

    private val prefs = context.getSharedPreferences("wl-settings", Context.MODE_PRIVATE)
    override fun getSetting(key: String): String? = prefs.getString(key, null)
    override fun putSetting(key: String, value: String?) { prefs.edit().apply { if (value == null) remove(key) else putString(key, value) }.apply() }
}

/** Android TextToSpeech with word-range callbacks (read-along highlighting). */
private class AndroidTts(context: Context) : DeviceTts {
    private var isReady = false
    override val ready: Boolean get() = isReady
    private val tts = TextToSpeech(context.applicationContext) { isReady = it == TextToSpeech.SUCCESS }
    private var cb: Triple<() -> Unit, (Int, Int) -> Unit, () -> Unit>? = null
    private var currentId: String? = null

    init {
        tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(id: String?) { if (id == currentId) cb?.first?.invoke() }
            override fun onDone(id: String?) { if (id == currentId) cb?.third?.invoke() }
            @Deprecated("Deprecated in Java") override fun onError(id: String?) { if (id == currentId) cb?.third?.invoke() }
            override fun onStop(id: String?, interrupted: Boolean) { if (id == currentId) cb?.third?.invoke() }
            override fun onRangeStart(id: String?, start: Int, end: Int, frame: Int) { if (id == currentId) cb?.second?.invoke(start, end) }
        })
    }

    override fun hasTelugu(): Boolean = isReady && tts.isLanguageAvailable(Locale("te", "IN")) >= TextToSpeech.LANG_AVAILABLE

    override fun speak(text: String, lang: String, rate: Float, volume: Float, onStart: () -> Unit, onWord: (Int, Int) -> Unit, onDone: () -> Unit) {
        if (!isReady) { onDone(); return }
        val loc = if (lang == "te") Locale("te", "IN")
        else listOf(Locale("en", "IN"), Locale.UK, Locale.US).firstOrNull { tts.isLanguageAvailable(it) >= TextToSpeech.LANG_AVAILABLE } ?: Locale.US
        tts.language = loc
        tts.setSpeechRate(rate)
        val id = "wl-${System.nanoTime()}"
        currentId = id
        cb = Triple(onStart, onWord, onDone)
        val params = Bundle().apply { putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, volume) }
        tts.speak(text.take(TextToSpeech.getMaxSpeechInputLength() - 1), TextToSpeech.QUEUE_FLUSH, params, id)
    }

    override fun stop() { tts.stop() }
    override fun shutdown() { tts.shutdown() }
}
