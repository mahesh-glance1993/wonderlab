package com.maheshglance.wonderlab.feature.early

import android.os.SystemClock
import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.PanTool
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Replay
import androidx.compose.material.icons.rounded.Stop
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.min
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLFonts
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.feature.early.audio.SfxHandle
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.serialization.Serializable
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.roundToInt

// Rhymes & Songs: sing-along with each word lit up as it is sung, and a clap-along rhythm game.
private object RT {
    val title = L("Rhymes & Songs", "పాటలు, గేయాలు")
    val pick = L("Pick a rhyme to sing!", "పాడటానికి ఒక పాట ఎంచుకో!")
    val sing = L("Sing along", "కలిసి పాడు"); val stop = L("Stop", "ఆపు")
    val clap = L("Clap along", "చప్పట్లు కొట్టు"); val clapBtn = L("Clap!", "చప్పట్లు!")
    val lineHint = L("Tap a line to hear it again.", "మళ్ళీ వినడానికి ఒక వరుసను తాకు.")
    val clapHow = L("Listen to the drum. Clap on every beat! Tap the big button.", "డప్పు విను. ప్రతి దెబ్బకు చప్పట్లు కొట్టు! పెద్ద బటన్ తాకు.")
    val ready = L("Get ready…", "సిద్ధంగా ఉండు…"); val go = L("Clap!", "చప్పట్లు!")
    val start = L("Start", "మొదలు"); val again = L("Clap again", "మళ్ళీ కొట్టు")
    val sungAll = L("You sang the whole rhyme!", "పాట మొత్తం పాడావు!")
    val best = L("Best", "ఉత్తమం")
}
private val CLAP_LEVELS = listOf(L("Easy", "సులువు"), L("Medium", "మధ్యస్థం"), L("Tricky", "కష్టం"))
private const val BEATS = 8
private const val COUNT_IN = 4

@Serializable data class RhymeSave(val sung: List<String> = emptyList(), val clapLevel: Int = 0, val bestClap: Map<String, Int> = emptyMap())

private fun wordsOf(text: String) = text.split(Regex("\\s+")).filter { it.isNotEmpty() }

@Composable
fun RhymesScreen() {
    val app = LocalApp.current
    TrackLast("/play/rhymes", RT.title)
    val saved = rememberSaved("rhymes", RhymeSave.serializer(), RhymeSave())
    var rhymeId by rememberSaveable { mutableStateOf<String?>(null) }
    var clap by rememberSaveable { mutableStateOf(false) }
    DisposableEffect(Unit) { onDispose { app.speech.stop() } }
    val back = { app.speech.stop(); if (clap) clap = false else rhymeId = null }
    BackHandler(rhymeId != null) { back() }
    EarlyScreen(RT.title.tx, { if (rhymeId != null) back() else app.back() }) { b ->
        val rhyme = rhymeId?.let { id -> b.rhymes.firstOrNull { it.id == id } }
        when {
            rhyme == null -> Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                PromptBar(RT.pick)
                FitGrid(b.rhymes.size, Modifier.weight(1f).fillMaxWidth(), maxCell = 260.dp) { i, _ ->
                    val r = b.rhymes[i]
                    BigTile(r.art, r.title, { rhymeId = r.id; clap = false }, Modifier.fillMaxSize(), tint = tint(listOf("art", "math", "lab", "next")[i % 4]), sub = if (saved.value.sung.contains(r.id)) "✓" else null)
                }
            }
            !clap -> key(rhyme.id, WL.lang) {
                SingAlong(rhyme, onClap = { app.speech.stop(); clap = true }) { saved.update { s -> s.copy(sung = if (s.sung.contains(rhyme.id)) s.sung else s.sung + rhyme.id) } }
            }
            else -> key(rhyme.id, saved.value.clapLevel) {
                ClapAlong(b, rhyme, saved.value.clapLevel.coerceIn(0, 2), { v -> saved.update { it.copy(clapLevel = v) } }, saved.value.bestClap[rhyme.id] ?: 0) { n ->
                    saved.update { s -> s.copy(bestClap = s.bestClap + (rhyme.id to maxOf(n, s.bestClap[rhyme.id] ?: 0))) }
                }
            }
        }
    }
}

@Composable
private fun RhymeHead(r: Rhyme, bouncing: Boolean, sub: String, modifier: Modifier = Modifier) {
    val reduce = LocalReduceMotion.current
    val y = if (bouncing && !reduce) rememberInfiniteTransition(label = "bounce").animateFloat(0f, -10f, infiniteRepeatable(tween(60000 / r.bpm), RepeatMode.Reverse), label = "y").value else 0f
    Row(modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Box(Modifier.graphicsLayer { translationY = y * density }) { PicArt(r.art, 72.dp) }
        Column(Modifier.weight(1f)) {
            Text(r.title.tx, style = MaterialTheme.typography.headlineSmall.copy(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid), color = WL.colors.text, maxLines = 2)
            Text(sub, style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted, maxLines = 2)
        }
    }
}

@Composable
private fun SingAlong(r: Rhyme, onClap: () -> Unit, onSung: () -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("rhymes")
    val stickers = rememberStickers()
    val scope = rememberCoroutineScope()
    val lang = WL.lang
    var cur by remember { mutableStateOf(-1) }
    var word by remember { mutableStateOf(-1) }
    var playing by remember { mutableStateOf(false) }
    var sticker by rememberActJson<Sticker?> { null }
    var job by remember { mutableStateOf<Job?>(null) }
    DisposableEffect(Unit) { onDispose { job?.cancel() } }

    suspend fun singLine(i: Int) {
        cur = i; word = -1
        val line = r.lines[i]
        val text = line.get(lang)
        val timings = app.engine.early<List<Int>>("wordTimings", text, app.speech.prefs.rate.toDouble()) ?: wordsOf(text).map { 500 }
        val voice = !(app.speech.prefs.mute || !app.speech.prefs.narration)
        if (voice) say(line)
        val started = if (voice) withTimeoutOrNull(2500) { app.speech.speaking.first { it } } else null
        coroutineScope {
            val words = launch { timings.forEachIndexed { w, ms -> word = w; delay(ms.toLong()) } }
            if (started != null) { app.speech.speaking.first { !it }; words.cancel() } else { words.join(); delay(300) }
        }
        delay(380)
    }
    fun stopAll() { job?.cancel(); job = null; playing = false; app.speech.stop(); cur = -1; word = -1 }
    fun toggle() {
        if (playing) { stopAll(); return }
        stopAll(); playing = true; sticker = null
        job = scope.launch {
            for (i in r.lines.indices) singLine(i)
            playing = false; cur = -1; word = -1
            Sfx.play("success"); EarlyFx.celebrate(); say(RT.sungAll)
            record(r.id, true, 0)
            onSung()
            sticker = stickers.give("rhymes", false)
        }
    }
    fun one(i: Int) { stopAll(); job = scope.launch { singLine(i); cur = -1; word = -1 } }

    val land = LocalWindow.current.landscape
    val controls = @Composable {
        RhymeHead(r, playing, r.credit.tx)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            KidButton((if (playing) RT.stop else RT.sing).tx, { toggle() }, icon = if (playing) Icons.Rounded.Stop else Icons.Rounded.PlayArrow, primary = true)
            KidButton(RT.clap.tx, { stopAll(); onClap() }, icon = Icons.Rounded.PanTool)
        }
    }
    val lyrics = @Composable { m: Modifier ->
        Column(m, verticalArrangement = Arrangement.spacedBy(6.dp)) {
            BoxWithConstraints(Modifier.weight(1f).fillMaxWidth()) {
                val each = (maxHeight - 6.dp * 3) / 4
                val fs = min(each * 0.38f, 30.dp).value.sp
                Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    r.lines.forEachIndexed { i, ln ->
                        val text = ln.tx
                        val on = i == cur
                        Box(
                            Modifier.fillMaxWidth().weight(1f).clip(RoundedCornerShape(16.dp)).background(if (on) WL.colors.math else WL.colors.surface)
                                .pressable(role = Role.Button) { playing = false; one(i) }.padding(horizontal = 12.dp).semantics { contentDescription = text },
                            contentAlignment = Alignment.CenterStart,
                        ) {
                            Text(buildAnnotatedString {
                                wordsOf(text).forEachIndexed { k, w ->
                                    if (on && k == word) withStyle(SpanStyle(background = Color(0xFFF2C14E), color = Color(0xFF1D2540))) { append(w) } else append(w)
                                    append(" ")
                                }
                            }, style = TextStyle(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid, fontWeight = FontWeight.Bold, fontSize = fs, lineHeight = fs * 1.2f), color = WL.colors.text, maxLines = 2)
                        }
                    }
                }
            }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Icon(Icons.AutoMirrored.Rounded.VolumeUp, null, tint = WL.colors.muted, modifier = Modifier.size(18.dp))
                Text(RT.lineHint.tx, style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
            }
        }
    }
    if (land) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        Column(Modifier.weight(0.4f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically)) { controls(); sticker?.let { StickerReveal(it, size = 64.dp) } }
        lyrics(Modifier.weight(0.6f).fillMaxHeight())
    } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        controls()
        lyrics(Modifier.weight(1f).fillMaxWidth())
        sticker?.let { StickerReveal(it, size = 64.dp) }
    }
}

@Composable
private fun ClapAlong(b: EarlyBundle, r: Rhyme, lv: Int, onLevel: (Int) -> Unit, best: Int, onScore: (Int) -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val reduce = LocalReduceMotion.current
    val record = rememberRecord("rhymes")
    val stickers = rememberStickers()
    val scope = rememberCoroutineScope()
    var phase by remember { mutableStateOf("idle") }
    var count by remember { mutableStateOf(0) }
    var beat by remember { mutableStateOf(-1) }
    var hits by remember { mutableStateOf(List(BEATS) { false }) }
    var result by remember { mutableStateOf<ClapResult?>(null) }
    var sticker by rememberActJson<Sticker?> { null }
    var job by remember { mutableStateOf<Job?>(null) }
    val handles = remember { mutableListOf<SfxHandle>() }
    val taps = remember { mutableListOf<Double>() }
    var beats by remember { mutableStateOf(emptyList<Double>()) }
    var t0 by remember { mutableStateOf(0L) }
    val bpm = (r.bpm * listOf(0.85, 1.0, 1.15)[lv]).roundToInt()
    val win = b.clapWindow.getOrElse(lv) { 300 }
    Narrate(RT.clapHow, "clap")
    fun stopAll() { job?.cancel(); handles.forEach { it.stop() }; handles.clear() }
    DisposableEffect(Unit) { onDispose { stopAll() } }

    fun start() {
        stopAll(); app.speech.stop()
        val gap = 60000.0 / bpm.coerceIn(40, 200)
        taps.clear(); hits = List(BEATS) { false }; result = null; sticker = null; beat = -1
        phase = "count"; count = 0
        beats = List(BEATS) { i -> (i * gap).roundToInt().toDouble() }
        val begin = SystemClock.uptimeMillis()
        t0 = begin + 400 + (COUNT_IN * gap).toLong()
        job = scope.launch {
            suspend fun at(ms: Double) { val d = begin + ms.toLong() - SystemClock.uptimeMillis(); if (d > 0) delay(d) }
            for (i in 0 until COUNT_IN) { at(400 + i * gap); count = i + 1; Sfx.play("tick")?.let { handles += it } }
            beats.forEachIndexed { i, bt -> at(400 + COUNT_IN * gap + bt); if (i == 0) phase = "play"; beat = i; Sfx.play("drum")?.let { handles += it } }
            at(400 + COUNT_IN * gap + beats.last() + win + 120)
            val j = app.engine.early<ClapResult>("judgeClaps", taps.toList(), beats, win) ?: ClapResult(hits, hits.count { it }, 0)
            hits = j.hits; result = j; phase = "done"; beat = -1
            val good = j.count >= ceil(BEATS * 0.6).toInt()
            record("clap:${r.id}:L$lv", good, 0)
            onScore(j.count)
            if (good) { Sfx.play("success"); EarlyFx.celebrate(); sticker = stickers.give("rhymes", false) }
            say(if (good) L("Great clapping! ${j.count} out of $BEATS beats.", "భలే చప్పట్లు! ${BEATS}లో ${j.count}.") else L("${j.count} out of $BEATS. Let’s try again!", "${BEATS}లో ${j.count}. మళ్ళీ ప్రయత్నిద్దాం!"))
        }
    }
    fun clapNow() {
        if (phase != "play" && phase != "count") return
        Sfx.play("snap")?.let { handles += it }
        val t = (SystemClock.uptimeMillis() - t0).toDouble()
        taps += t
        var best1 = -1; var bestD = Double.MAX_VALUE
        beats.forEachIndexed { i, bt -> val d = abs(t - bt); if (d <= win && d < bestD) { best1 = i; bestD = d } }
        if (best1 >= 0) hits = hits.mapIndexed { k, x -> if (k == best1) true else x }
    }
    val clap by rememberUpdatedState({ clapNow() })
    val running = phase == "count" || phase == "play"
    val land = LocalWindow.current.landscape

    val status = when (phase) { "count" -> "${RT.ready.tx} $count"; "play" -> RT.go.tx; else -> result?.let { "${it.count} / $BEATS" } ?: "" }
    val beatsRow = @Composable {
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.semantics { contentDescription = "${hits.count { it }} / $BEATS" }) {
            for (i in 0 until BEATS) {
                val now = i == beat
                Box(
                    Modifier.size(34.dp).scale(if (now && !reduce) 1.2f else 1f).clip(CircleShape)
                        .background(if (hits[i]) WL.colors.good else if (now) WL.colors.accent else WL.colors.surface)
                        .border(2.dp, WL.colors.line, CircleShape),
                    contentAlignment = Alignment.Center,
                ) { if (hits[i]) Icon(Icons.Rounded.Check, null, tint = Color.White, modifier = Modifier.size(18.dp)) else Text("${i + 1}", color = if (now) Color.White else WL.colors.text, fontWeight = FontWeight.Bold) }
            }
        }
    }
    val action = @Composable { m: Modifier ->
        Box(m, contentAlignment = Alignment.Center) {
            if (running) BoxWithConstraints(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                val s = min(min(maxWidth, maxHeight), 220.dp)
                Column(
                    Modifier.size(s).scale(if (beat >= 0 && !reduce && beat % 2 == 0) 1.04f else 1f).clip(CircleShape).background(WL.colors.primary)
                        .pointerInput(Unit) { awaitEachGesture { awaitFirstDown(); clap() } }.semantics { contentDescription = RT.clapBtn.get("en") },
                    horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
                ) {
                    Emoji3D("👐", Modifier.size(s * 0.45f))
                    Text(RT.clapBtn.tx, color = WL.colors.primaryInk, style = MaterialTheme.typography.headlineSmall)
                }
            } else Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                KidButton((if (phase == "done") RT.again else RT.start).tx, { start() }, icon = if (phase == "done") Icons.Rounded.Replay else Icons.Rounded.PlayArrow, primary = true)
                if (best > 0) Text("${RT.best.tx}: $best / $BEATS", color = WL.colors.muted, style = MaterialTheme.typography.bodyLarge)
                if (phase == "done") sticker?.let { StickerReveal(it, size = 60.dp) }
            }
        }
    }
    val info = @Composable {
        RhymeHead(r, false, RT.clapHow.tx)
        if (!running) LevelPicker(CLAP_LEVELS, lv, onLevel)
        beatsRow()
        Text(status, style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
    }
    if (land) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        Column(Modifier.weight(0.55f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) { info() }
        action(Modifier.weight(0.45f).fillMaxHeight())
    } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        info(); action(Modifier.weight(1f).fillMaxWidth())
    }
}
