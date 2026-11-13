package com.maheshglance.wonderlab.feature.language

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Stop
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.ChoiceCard
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.FitToScreen
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.atomicfu.locks.SynchronizedObject
import kotlinx.atomicfu.locks.synchronized

/**
 * Device voice used by read-along, so each word can be highlighted exactly when it is spoken (the platform TTS
 * reports word ranges). Engines without range callbacks fall back to the website's timed highlight.
 */
private class ReadAlongVoice(private val tts: DeviceTts) {
    private val lock = SynchronizedObject()
    private val done = mutableMapOf<Long, CompletableDeferred<Unit>>()
    private var seq = 0L

    suspend fun canSpeak(lang: String): Boolean {
        withTimeoutOrNull(2500) { while (!tts.ready) delay(50) }
        return tts.ready && (lang != "te" || tts.hasTelugu())
    }

    /** Starts speaking; returns a deferred that completes when the line has been spoken. */
    fun speak(text: String, lang: String, rate: Float, volume: Float, onRange: (Int) -> Unit): CompletableDeferred<Unit> {
        val d = CompletableDeferred<Unit>()
        val id = synchronized(lock) { (++seq).also { done[it] = d } }
        var active = true
        fun finish() { active = false; synchronized(lock) { done.remove(id) }; d.complete(Unit) }
        tts.speak(text, lang, rate, volume, onWord = { start, _ -> if (active) onRange(start) }, onDone = { finish() })
        return d
    }

    fun stop() {
        runCatching { tts.stop() }
        val all = synchronized(lock) { done.values.toList().also { done.clear() } }
        all.forEach { it.complete(Unit) }
    }
    /** The device voice is shared with the rest of the app, so leaving read-along only stops it. */
    fun shutdown() { stop() }
}

private val MS_PER_WORD = mapOf("te" to 560L, "en" to 400L)
private val WORD_RE = Regex("\\S+")

/** /lang/:course/read/:passageId (website ReadAlong.tsx). */
@Composable
fun ReadAlongScreen(course: String, passageId: String) {
    val data = rememberEngine<LPassage>("language.passage", course, passageId)
    LoadOr(data) { ReadAlong(it) }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ReadAlong(p: LPassage) {
    val app = LocalApp.current
    val win = LocalWindow.current
    val scope = rememberCoroutineScope()
    val sayer = rememberSayer()
    val reduce = LocalReduceMotion.current
    val script = p.script
    val (gloss, setGloss) = rememberGloss()
    val key = LangKeys.readKey(p.id)
    val saved = remember { decodeOrNull<LReadState>(app.repo.state.value.learner.activities[key]?.state) }
    val answers = remember { mutableStateMapOf<String, String>().apply { putAll(saved?.answers ?: emptyMap()) } }
    val correct = remember { mutableStateMapOf<String, Boolean>() }
    val questions = remember(p.id) { p.questions.map { it to decodeOrNull<LItem>(it)!! } }
    var cur by remember { mutableStateOf<Pair<Int, Int>?>(null) }
    var playing by remember { mutableStateOf(false) }
    var job by remember { mutableStateOf<Job?>(null) }
    val voice = remember { ReadAlongVoice(app.platform.tts) }
    val words = remember(p.id) { p.lines.map { l -> WORD_RE.findAll(l).map { it.value to it.range.first }.toList() } }

    LaunchedEffect(p.id) { app.repo.setLastActivity("/lang/${p.course}/read/${p.id}", "Read along: ${p.titleEn ?: p.title}") }
    DisposableEffect(Unit) { onDispose { job?.cancel(); voice.shutdown(); app.speech.stop() } }
    // correctness of answers restored from earlier visits
    LaunchedEffect(Unit) { for ((q, item) in questions) answers[item.id]?.let { a -> correct[item.id] = checkAnswer(app, q, kotlinx.serialization.json.JsonPrimitive(a)) } }

    fun stop() { job?.cancel(); voice.stop(); app.speech.stop(); playing = false; cur = null }
    fun play(from: Int = 0) {
        job?.cancel(); voice.stop(); app.speech.stop()
        job = scope.launch {
            playing = true
            val prefs = app.speech.prefs
            val lang = if (script == "te") "te" else "en"
            val can = !prefs.mute && prefs.narration && voice.canSpeak(lang)
            for (li in from until p.lines.size) {
                cur = li to 0
                val ws = words[li]
                val n = ws.size
                var rangesSeen = false
                val per = (MS_PER_WORD[script] ?: 400L) * (if (can) 1.0 else 1.25)
                val spoken = if (can) voice.speak(p.lines[li], lang, prefs.rate, prefs.volume) { start ->
                    rangesSeen = true
                    val w = ws.indexOfLast { it.second <= start }.coerceAtLeast(0)
                    scope.launch { if (job?.isActive == true) cur = li to w }
                } else null
                // advance the highlight word by word (or keep the whole line highlighted with reduced motion)
                if (!reduce) for (w in 1 until n) {
                    delay(per.toLong())
                    if (rangesSeen) break
                    cur = li to w
                }
                if (spoken != null) withTimeoutOrNull(n * 900L + 4000L) { spoken.await() }
                else delay(if (reduce) (n * per).toLong() else per.toLong())
                delay(250)
            }
            playing = false; cur = null
        }
    }
    fun tapWord(w: String) { if (playing) stop(); sayer.say(w.replace(Regex("[“”\"!?.,:;]"), ""), script) }

    fun answer(q: kotlinx.serialization.json.JsonObject, item: LItem, v: String) {
        if (answers[item.id] != null) return
        answers[item.id] = v
        scope.launch {
            val ok = checkAnswer(app, q, kotlinx.serialization.json.JsonPrimitive(v))
            correct[item.id] = ok
            feedbackTone(ok)
            runCatching { app.repo.recordAttempt("$key/${item.id}", 1, key, "practice", ok, null, 0) }
            val all = questions.all { answers[it.second.id] != null }
            val score = questions.count { answers[it.second.id] != null && correct[it.second.id] == true }.toDouble() / questions.size
            app.repo.saveActivityState(key, encode(LReadState(done = all, score = score, answers = answers.toMap())))
            if (all) { awardBadge(app, "lang:first-story"); if (score >= 0.5) Celebrate.fire() }
        }
    }
    val done = questions.all { answers[it.second.id] != null }
    val right = questions.count { answers[it.second.id] != null && correct[it.second.id] == true }

    val passage: @Composable (Modifier) -> Unit = { m ->
        Column(m, verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                if (!playing) WLButton("Read to me", { play(0) }, kind = BtnKind.Primary, icon = Icons.Rounded.PlayArrow)
                else WLButton("Stop", { stop() }, icon = Icons.Rounded.Stop)
                Text("Tap any word to hear it.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            }
            FitToScreen(Modifier.weight(1f).fillMaxWidth(), alignTop = true, minScale = 0.45f) {
                WLCard(Modifier.fillMaxWidth(), padding = 14.dp) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        p.lines.forEachIndexed { li, _ ->
                            val lineOn = cur?.first == li
                            Row(
                                Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(if (lineOn) WL.colors.math.copy(alpha = 0.5f) else Color.Transparent).padding(4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Column(Modifier.weight(1f)) {
                                    FlowRow(horizontalArrangement = Arrangement.spacedBy(2.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                        words[li].forEachIndexed { wi, (w, _) ->
                                            val on = lineOn && (reduce || cur?.second == wi)
                                            Box(
                                                Modifier.clip(RoundedCornerShape(8.dp)).background(if (on) WL.colors.accent else Color.Transparent)
                                                    .pressable(sound = false) { tapWord(w) }.padding(horizontal = 4.dp, vertical = 1.dp),
                                            ) { LT(w, script, style = MaterialTheme.typography.headlineSmall, weight = FontWeight.SemiBold, color = if (on) WL.colors.primaryInk else WL.colors.text) }
                                        }
                                    }
                                    if (script == "te") Gloss(gloss, p.linesEn?.getOrNull(li))
                                }
                                IconBtn(Icons.Rounded.PlayArrow, "Read line ${li + 1} from here", { play(li) }, size = 36.dp, bg = Color.Transparent, tint = WL.colors.muted)
                            }
                        }
                    }
                }
            }
        }
    }

    var qi by rememberSaveable { mutableIntStateOf(0) }
    val questionsPanel: @Composable (Modifier) -> Unit = { m ->
        Column(m, verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Questions", style = MaterialTheme.typography.titleLarge, color = WL.colors.text, modifier = Modifier.weight(1f))
                questions.forEachIndexed { k, (_, it) ->
                    val a = answers[it.id]
                    val ok = correct[it.id] == true
                    val bg = if (a == null) WL.colors.surface2 else if (ok) WL.colors.goodBg else WL.colors.badBg
                    val fg = if (a == null) WL.colors.text else if (ok) WL.colors.good else WL.colors.bad
                    Box(Modifier.size(36.dp).clip(CircleShape).background(bg).border(if (k == qi) 3.dp else 1.dp, if (k == qi) WL.colors.primary else WL.colors.line, CircleShape).pressable { qi = k }, contentAlignment = Alignment.Center) {
                        Text("${k + 1}", style = MaterialTheme.typography.labelLarge, color = fg)
                    }
                }
            }
            val (qj, item) = questions[qi.coerceIn(0, questions.size - 1)]
            val a = answers[item.id]
            FitToScreen(Modifier.weight(1f).fillMaxWidth(), alignTop = true) {
                Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    WLCard(Modifier.fillMaxWidth(), padding = 14.dp) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("${qi + 1}.", style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
                            LT(item.prompt, script, Modifier.weight(1f), style = MaterialTheme.typography.titleLarge, weight = FontWeight.Bold)
                            SpeakButton({ sayer.say(item.prompt, script, item.en) }, size = 44.dp)
                        }
                        Gloss(gloss, item.en)
                        Spacer(Modifier.size(8.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            item.choices.forEach { c ->
                                val right = c in item.answer
                                val state = if (a != null) (if (right) "right" else if (a == c) "wrong" else null) else null
                                ChoiceCard({ answer(qj, item, c) }, Modifier.fillMaxWidth(), state = state, enabled = a == null) {
                                    LT(c, script, style = MaterialTheme.typography.titleLarge, textAlign = TextAlign.Center, weight = FontWeight.Bold)
                                    if (a != null && right) Text("✓ Correct", style = MaterialTheme.typography.labelMedium, color = WL.colors.good)
                                    if (a == c && !right) Text("✗ Your answer", style = MaterialTheme.typography.labelMedium, color = WL.colors.bad)
                                }
                            }
                        }
                    }
                    if (a != null) {
                        val ok = correct[item.id] == true
                        LAlert(if (ok) WL.colors.goodBg else WL.colors.badBg, if (ok) WL.colors.good else WL.colors.bad) {
                            if (ok) Text("Correct!", style = MaterialTheme.typography.titleMedium, color = WL.colors.good)
                            else Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("The answer is ", style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                                LT(item.answer.firstOrNull() ?: "", script, style = MaterialTheme.typography.titleMedium, weight = FontWeight.Bold)
                                Text(". Look at the passage again.", style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                            }
                        }
                    }
                    if (done) LAlert(WL.colors.goodBg, WL.colors.good) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            EmojiImage("🏆", 32.dp)
                            Text("You answered $right of ${questions.size} correctly.", style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                        }
                        FlowRowButtons {
                            WLButton("Back to the course map", { app.go("lang/${p.course}?class=${p.level}") }, small = true, icon = Icons.Rounded.Home)
                            WLButton("Try the questions again", {
                                answers.clear(); correct.clear(); qi = 0
                                app.repo.saveActivityState(key, encode((saved ?: LReadState()).copy(answers = emptyMap())))
                            }, small = true, kind = BtnKind.Ghost, icon = Icons.Rounded.Refresh)
                        }
                    }
                }
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterHorizontally)) {
                WLButton("Previous", { qi -= 1 }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowBack, enabled = qi > 0)
                WLButton("Next question", { qi += 1 }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowForward, enabled = qi < questions.size - 1, kind = if (a != null) BtnKind.Primary else BtnKind.Normal)
            }
        }
    }

    var tab by rememberSaveable { mutableStateOf("read") }
    LangFrame({
        LangBar(p.title, script, subtitle = "${p.className} · ${p.kind}", subtitleScript = "en") { if (script == "te") GlossToggle(gloss, setGloss) }
    }) {
        Column(Modifier.fillMaxSize().padding(horizontal = if (win.isPhone) 10.dp else 20.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (script == "te") Gloss(gloss, p.titleEn)
            VoiceNote(p.course)
            BoxWithConstraints(Modifier.weight(1f).fillMaxWidth()) {
                if (maxWidth >= 600.dp && maxWidth > maxHeight * 0.9f) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    passage(Modifier.weight(0.58f).fillMaxHeight())
                    questionsPanel(Modifier.weight(0.42f).fillMaxHeight())
                } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Segmented(tab, listOf("read" to "Read", "questions" to "Questions (${answers.size}/${questions.size})"), { tab = it }, Modifier.fillMaxWidth())
                    if (tab == "read") passage(Modifier.weight(1f).fillMaxWidth()) else questionsPanel(Modifier.weight(1f).fillMaxWidth())
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FlowRowButtons(content: @Composable () -> Unit) =
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) { content() }

