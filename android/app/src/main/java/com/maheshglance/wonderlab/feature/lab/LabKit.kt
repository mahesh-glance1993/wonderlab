package com.maheshglance.wonderlab.feature.lab

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Remove
import androidx.compose.material.icons.rounded.RestartAlt
import androidx.compose.material.icons.rounded.SkipNext
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.FitToScreen
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.games.NoticeHost
import com.maheshglance.wonderlab.feature.games.Notices
import com.maheshglance.wonderlab.feature.games.Segmented
import com.maheshglance.wonderlab.feature.games.boldMarkup
import com.maheshglance.wonderlab.feature.games.bool
import com.maheshglance.wonderlab.feature.games.dbl
import com.maheshglance.wonderlab.feature.games.fmtNum
import com.maheshglance.wonderlab.feature.games.j
import com.maheshglance.wonderlab.feature.games.jsonOf
import com.maheshglance.wonderlab.feature.games.list
import com.maheshglance.wonderlab.feature.games.rememberPresentation
import com.maheshglance.wonderlab.feature.games.str
import com.maheshglance.wonderlab.feature.games.strs
import com.maheshglance.wonderlab.ui.AppContext
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlin.math.max
import kotlin.math.min

fun fmt(n: Double, dp: Int = 2) = fmtNum(n, dp)

/** Learner tier for the labs: Classes 3–6 (and younger) get simpler wording and fewer controls. */
data class LabTier(val simple: Boolean, val typed: Boolean, val readAloud: Boolean)

@Composable
fun rememberLabTier(): LabTier {
    val p = rememberPresentation()
    val simple = p.tier != "senior"
    return LabTier(simple, p.allowTyping && !simple, p.readAloud)
}

/**
 * The website's useLabState + useChallengeRewards: params + challenge completion saved to `lab:<sim>`,
 * attempts recorded as game attempts, `lab:<sim>:challenge` awarded on first completion.
 */
@Stable
class LabSession(private val app: AppContext, val sim: String, private val scope: CoroutineScope, val notices: Notices) {
    var completed by mutableStateOf<List<String>>(emptyList())
    var seenIntro by mutableStateOf(true)
    var loaded by mutableStateOf(false)
    var banner by mutableStateOf<String?>(null)
    private var dirty = false
    private var lastSaved: String? = null
    private var params: JsonElement = JsonObject(emptyMap())

    /** Restores saved params (sanitised by the engine) and applies a URL preset. Returns the params to use. */
    suspend fun load(query: Map<String, String>): JsonElement {
        val saved = app.repo.state.value.learner.activities["lab:$sim"]?.state
        completed = saved.j("completed").strs().distinct().sorted()
        seenIntro = saved.j("seenIntro").bool() == true
        val pre = if (query.isNotEmpty()) runCatching { app.engine.call("lab.preset", sim, query, saved.j("params")) }.getOrNull() else null
        val p = if (pre != null && pre !is kotlinx.serialization.json.JsonNull) { banner = pre.j("banner").str(); pre.j("params")!! }
        else app.engine.call("lab.sanitize", sim, saved.j("params"))
        params = p; lastSaved = payload()
        loaded = true
        app.repo.setLastActivity("/lab/$sim", "${sim.replaceFirstChar { it.uppercase() }} Lab")
        return p
    }

    private fun payload() = buildJsonObject { put("params", params); put("completed", JsonArray(completed.map { JsonPrimitive(it) })); put("seenIntro", seenIntro) }.toString()
    fun setParams(p: JsonElement) { params = p; dirty = true }
    fun markIntroSeen() { if (!seenIntro) { seenIntro = true; dirty = true } }
    fun saveNow() {
        if (!dirty) return
        val pl = payload()
        if (pl == lastSaved) return
        lastSaved = pl; dirty = false
        app.repo.saveActivityState("lab:$sim", buildJsonObject { put("params", params); put("completed", JsonArray(completed.map { JsonPrimitive(it) })); put("seenIntro", seenIntro) })
    }

    fun record(id: String, correct: Boolean, response: JsonElement, hints: Int = 0) = scope.launch {
        runCatching { app.repo.recordAttempt("lab:$sim:$id", 1, "lab:$sim", "game", correct, response, hints) }
    }

    fun complete(id: String, title: String, via: String, response: JsonElement? = null, hints: Int = 0) {
        if (completed.contains(id)) return
        completed = (completed + id).distinct().sorted(); dirty = true
        if (via == "sim") record(id, true, response ?: jsonOf("via" to "sim"), hints)
        notices.show("Challenge complete: $title")
        Tones.complete()
        if (app.repo.award("lab:$sim:challenge")) notices.celebrate()
        saveNow()
    }

    suspend fun grade(spec: JsonElement?, raw: String): JsonElement? {
        val kind = spec.j("kind").str()
        val resp = if (kind == "choice") jsonOf("kind" to "choice", "value" to raw) else jsonOf("kind" to "text", "value" to raw)
        return runCatching { app.engine.call("core.grade", spec, resp) }.getOrNull()
    }
    fun say(text: String) = app.say(text, "en")
}

@Composable
fun rememberLabSession(sim: String): LabSession {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val notices = remember { Notices() }
    return remember(sim) { LabSession(app, sim, scope, notices) }
}

/** Fixed-timestep loop (website's useSimLoop): rAF-style accumulator, or 0.5 s jumps with reduced motion. */
@Composable
fun SimLoop(running: Boolean, dt: Double, onSteps: (Int) -> Unit) {
    val reduced = LocalReduceMotion.current
    val cb = androidx.compose.runtime.rememberUpdatedState(onSteps)
    LaunchedEffect(running, dt, reduced) {
        if (!running) return@LaunchedEffect
        if (reduced) {
            val n = max(1, Math.round(0.5 / dt).toInt())
            while (true) { delay(500); cb.value(n) }
        }
        var last = withFrameNanos { it }
        var acc = 0.0
        while (true) {
            withFrameNanos { now ->
                acc += min(0.25, (now - last) / 1e9); last = now
                val n = Math.floor(acc / dt + 1e-9).toInt()
                if (n > 0) { acc -= n * dt; cb.value(n) }
            }
        }
    }
}

data class LabTab(val key: String, val label: String, val content: @Composable () -> Unit)

/**
 * One-screen lab layout: simulation stage + readout + transport, and a tabbed panel (settings, predict,
 * challenges, graphs/table, formulas). Side-by-side on tablets / landscape; stacked on phone portrait.
 */
@Composable
fun LabScaffold(
    title: String,
    session: LabSession,
    intro: JsonElement?,
    stage: @Composable (Modifier) -> Unit,
    readline: @Composable () -> Unit,
    transport: @Composable () -> Unit,
    tabs: List<LabTab>,
) {
    val app = LocalApp.current
    val win = LocalWindow.current
    var showIntro by remember { mutableStateOf(false) }
    LaunchedEffect(session.loaded, intro) { if (session.loaded && intro != null && !session.seenIntro) showIntro = true }
    var tab by rememberSaveable { mutableStateOf(tabs.first().key) }
    if (tabs.none { it.key == tab }) tab = tabs.first().key
    Box(Modifier.fillMaxSize().background(WL.colors.bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar(title, onBack = { app.back() }, actions = { IconBtn(Icons.Rounded.Info, "About this lab", { showIntro = true }, size = 44.dp) })
            val wide = win.landscape && win.width >= 640.dp
            val pad = if (win.isPhone) 8.dp else 16.dp
            val inset = Modifier.windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Bottom + WindowInsetsSides.Horizontal))
            val banner = @Composable {
                session.banner?.let { b ->
                    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(WL.colors.math).padding(horizontal = 10.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Rounded.Check, null, tint = WL.colors.mathInk, modifier = Modifier.size(18.dp))
                        Column(Modifier.weight(1f)) {
                            Text("Checking your answer", style = MaterialTheme.typography.labelMedium, color = WL.colors.mathInk)
                            Text(boldMarkup(b), style = MaterialTheme.typography.bodySmall, color = WL.colors.mathInk, maxLines = 3, overflow = TextOverflow.Ellipsis)
                        }
                        WLButton("Hide", { session.banner = null }, kind = BtnKind.Ghost, small = true)
                    }
                }
            }
            val stageCard = @Composable { m: Modifier ->
                Column(m, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    banner()
                    Box(Modifier.weight(1f).fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(WL.colors.surface)) { stage(Modifier.fillMaxSize()) }
                    readline()
                    transport()
                }
            }
            val panel = @Composable { m: Modifier ->
                Column(m, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Segmented(tabs.map { it.key to it.label }, tab, { tab = it }, Modifier.fillMaxWidth())
                    Box(Modifier.weight(1f).fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(WL.colors.surface).padding(10.dp)) {
                        FitToScreen(Modifier.fillMaxSize(), minScale = 0.5f, alignTop = true) {
                            Box(Modifier.fillMaxWidth()) { tabs.first { it.key == tab }.content() }
                        }
                    }
                }
            }
            if (wide) Row(Modifier.fillMaxSize().then(inset).padding(pad), horizontalArrangement = Arrangement.spacedBy(pad)) {
                stageCard(Modifier.weight(1.35f).fillMaxHeight())
                panel(Modifier.weight(1f).fillMaxHeight())
            } else Column(Modifier.fillMaxSize().then(inset).padding(pad), verticalArrangement = Arrangement.spacedBy(pad)) {
                stageCard(Modifier.weight(1f).fillMaxWidth())
                panel(Modifier.weight(if (win.isPhone) 0.95f else 0.8f).fillMaxWidth())
            }
        }
        NoticeHost(session.notices)
    }
    if (showIntro && intro != null) IntroDialog(intro) { showIntro = false; session.markIntroSeen(); session.saveNow() }
}

@Composable
private fun IntroDialog(intro: JsonElement, onClose: () -> Unit) {
    val app = LocalApp.current
    val explore = intro.j("explore").str() ?: ""
    val assumptions = intro.j("assumptions").strs()
    Dialog(onDismissRequest = onClose) {
        WLCard(Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Rounded.Info, null, tint = WL.colors.labInk)
                Text("About this lab", style = MaterialTheme.typography.titleLarge, color = WL.colors.text, modifier = Modifier.weight(1f))
                SpeakButton({ app.say("$explore ${assumptions.joinToString(" ")}", "en") }, size = 40.dp)
            }
            FitToScreen(Modifier.fillMaxWidth().height(440.dp), minScale = 0.6f, alignTop = true) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(explore, style = MaterialTheme.typography.bodyMedium, color = WL.colors.text)
                    Text("How the model works", style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
                    assumptions.forEach { Text("• $it", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted) }
                    Text("Units used", style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
                    intro.j("units").list().forEach { u -> val p = u.strs(); Text("${p.getOrNull(0)}: ${p.getOrNull(1)}", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted) }
                }
            }
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) { WLButton("Let's go", onClose, kind = BtnKind.Primary, small = true) }
        }
    }
}

/** Play / Pause / Step / Reset. */
@Composable
fun Transport(playing: Boolean, done: Boolean, stepLabel: String, onPlay: () -> Unit, onPause: () -> Unit, onStep: () -> Unit, onReset: () -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        if (playing) WLButton("Pause", onPause, Modifier.weight(1f), kind = BtnKind.Primary, icon = Icons.Rounded.Pause, small = true)
        else WLButton("Play", onPlay, Modifier.weight(1f), kind = BtnKind.Primary, icon = Icons.Rounded.PlayArrow, enabled = !done, small = true)
        WLButton("Step", onStep, Modifier.weight(1f).semantics { contentDescription = stepLabel }, icon = Icons.Rounded.SkipNext, enabled = !done, small = true)
        WLButton("Reset", onReset, Modifier.weight(1f), icon = Icons.Rounded.RestartAlt, small = true)
    }
}

/** Readout line under the stage. */
@Composable
fun ReadLine(vararg items: Pair<String, String>) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
        items.forEach { (k, v) ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(if (k.isEmpty()) "" else "$k = ", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                Text(v, style = MaterialTheme.typography.labelLarge, color = WL.colors.text)
            }
        }
    }
}

/** Slider + −/+ steppers + typed value (tap the number), always in sync; snapped to the range. */
@Composable
fun NumberSlider(label: String, value: Double, range: LabRange, unit: String, onChange: (Double) -> Unit, locked: Boolean = false, note: String? = null, display: ((Double) -> String)? = null) {
    val c = WL.colors
    var typing by remember { mutableStateOf(false) }
    val shown = display?.invoke(value) ?: "${fmt(value)} $unit".trim()
    Column(Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(label, style = MaterialTheme.typography.labelMedium, color = c.text, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (locked) Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Rounded.Lock, null, tint = c.muted, modifier = Modifier.size(14.dp)); Text("fixed", style = MaterialTheme.typography.labelSmall, color = c.muted) }
            Text(shown, style = MaterialTheme.typography.labelLarge, color = c.primary, modifier = Modifier.clip(RoundedCornerShape(8.dp)).background(c.surface2).pressable(!locked) { typing = true }.padding(horizontal = 8.dp, vertical = 2.dp))
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconBtn(Icons.Rounded.Remove, "Less", { onChange(LabMath.snap(value - range.step, range)) }, size = 36.dp, enabled = !locked && value > range.min)
            Slider(
                value.toFloat(), { onChange(LabMath.snap(it.toDouble(), range)) }, Modifier.weight(1f).height(36.dp).semantics { stateDescription = shown },
                enabled = !locked, valueRange = range.min.toFloat()..range.max.toFloat(),
                colors = SliderDefaults.colors(thumbColor = c.primary, activeTrackColor = c.primary, inactiveTrackColor = c.surface2),
            )
            IconBtn(Icons.Rounded.Add, "More", { onChange(LabMath.snap(value + range.step, range)) }, size = 36.dp, enabled = !locked && value < range.max)
        }
        if (note != null) Text(note, style = MaterialTheme.typography.bodySmall, color = c.muted)
    }
    if (typing) {
        var text by remember { mutableStateOf(fmt(value)) }
        val commit = { text.replace('−', '-').replace('–', '-').trim().toDoubleOrNull()?.let { onChange(LabMath.snap(it, range)) }; typing = false }
        Dialog(onDismissRequest = { typing = false }) {
            WLCard {
                Text(label, style = MaterialTheme.typography.titleMedium, color = c.text)
                OutlinedTextField(text, { text = it }, singleLine = true, suffix = { Text(unit) }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal, imeAction = ImeAction.Done), keyboardActions = KeyboardActions(onDone = { commit() }))
                Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.End) { WLButton("OK", { commit() }, kind = BtnKind.Primary, small = true) }
            }
        }
    }
}

/** Answer input: choices for younger learners or when typing is off; typed (with units) otherwise. */
@Composable
fun AnswerInput(choices: List<JsonElement>, spec: JsonElement?, unit: String?, typed: Boolean, enabled: Boolean = true, onSubmit: (String) -> Unit) {
    if (!typed || spec.j("kind").str() == "choice") {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            choices.forEach { ch -> WLButton(ch.j("label").str() ?: "", { onSubmit(ch.j("value").str() ?: "") }, Modifier.weight(1f), enabled = enabled, small = true) }
        }
    } else {
        var v by rememberSaveable { mutableStateOf("") }
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            OutlinedTextField(v, { v = it }, Modifier.weight(1f), enabled = enabled, singleLine = true, placeholder = { Text(if (unit != null) "Number in $unit" else "Your answer") },
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done), keyboardActions = KeyboardActions(onDone = { if (v.isNotBlank()) onSubmit(v) }))
            WLButton("Check", { onSubmit(v) }, kind = BtnKind.Primary, enabled = enabled && v.isNotBlank(), small = true)
        }
    }
}

/** "What do you think will happen?" — answered before running, explained afterwards. */
@Composable
fun PredictionPanel(session: LabSession, def: JsonElement?, phase: String, typed: Boolean) {
    if (def == null) return
    val scope = rememberCoroutineScope()
    var answer by remember(def) { mutableStateOf<String?>(null) }
    var ok by remember(def) { mutableStateOf(false) }
    var skipped by remember(def) { mutableStateOf(false) }
    val choices = def.j("choices").list()
    val unit = def.j("unit").str()
    val spec = def.j("spec")
    val c = WL.colors
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) { EmojiImage("🔮", 24.dp); Text("Predict", style = MaterialTheme.typography.titleMedium, color = c.text) }
        Text(def.j("question").str() ?: "", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = c.text)
        if (phase == "before" && answer == null && !skipped) {
            AnswerInput(choices, spec, unit, typed) { raw -> answer = raw; scope.launch { ok = session.grade(spec, raw).j("correct").bool() == true } }
            WLButton("Skip", { skipped = true }, kind = BtnKind.Ghost, small = true)
        }
        answer?.let { a ->
            val label = choices.firstOrNull { it.j("value").str() == a }.j("label").str() ?: a
            val withUnit = if (typed && unit != null && spec.j("kind").str() != "choice" && !Regex("[a-z°Ω]", RegexOption.IGNORE_CASE).containsMatchIn(a)) " $unit" else ""
            Text("Your prediction: $label$withUnit${if (phase != "after") " — now press Play to test it." else ""}", style = MaterialTheme.typography.bodySmall, color = c.text)
        }
        if (answer == null && (skipped || phase != "before") && phase != "after") Text("No prediction made. Press Play and watch closely.", style = MaterialTheme.typography.bodySmall, color = c.muted)
        if (phase == "after") {
            if (answer != null) AlertBox(if (ok) "Your prediction was right!" else "Not quite what happened — see why below.", if (ok) AlertKind.Good else AlertKind.Bad)
            Text("What happened and why", style = MaterialTheme.typography.titleSmall, color = c.text)
            Text(boldMarkup(def.j("outcome").str() ?: ""), style = MaterialTheme.typography.bodySmall, color = c.text)
        }
    }
}

/** Guided challenges: pick one, try it in the sim (status shown as text), or answer the question. */
@Composable
fun ChallengesPanel(session: LabSession, items: List<JsonElement>, active: String?, met: Boolean, typed: Boolean, onStart: (String) -> Unit, onExit: () -> Unit) {
    val scope = rememberCoroutineScope()
    val cur = items.firstOrNull { it.j("id").str() == active }
    var hint by remember(active) { mutableStateOf(false) }
    var result by remember(active) { mutableStateOf<Pair<Boolean, String?>?>(null) }
    val c = WL.colors
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) { EmojiImage("🚩", 24.dp); Text("Challenges", style = MaterialTheme.typography.titleMedium, color = c.text) }
        if (cur == null) {
            items.forEach { ch ->
                val id = ch.j("id").str() ?: ""
                val done = session.completed.contains(id)
                WLButton("${ch.j("title").str()}${if (done) " (done)" else ""}", { onStart(id) }, Modifier.fillMaxWidth(), icon = if (done) Icons.Rounded.Check else Icons.Rounded.Flag)
            }
        } else {
            val id = cur.j("id").str() ?: ""
            val title = cur.j("title").str() ?: ""
            Text(boldMarkup("**$title.** ${cur.j("goalShown").str()}"), style = MaterialTheme.typography.bodyMedium, color = c.text)
            Text(
                if (met) "✓ Goal reached — well done!" else if (session.completed.contains(id)) "Already completed. Try again for practice." else "⏱ Goal not reached yet.",
                style = MaterialTheme.typography.labelMedium, color = if (met) c.good else c.muted,
            )
            if (hint) AlertBox(cur.j("hint").str() ?: "", AlertKind.Warn) else WLButton("Show a hint", { hint = true }, kind = BtnKind.Ghost, icon = Icons.Rounded.Lightbulb, small = true)
            val q = cur.j("question")
            Text(boldMarkup("**Or answer this:** ${q.j("text").str()}"), style = MaterialTheme.typography.bodySmall, color = c.text)
            AnswerInput(q.j("choices").list(), q.j("spec"), q.j("unit").str(), typed) { raw ->
                scope.launch {
                    val g = session.grade(q.j("spec"), raw)
                    val correct = g.j("correct").bool() == true
                    result = correct to g.j("understood").str()
                    session.record(id, correct, jsonOf("answer" to raw), if (hint) 1 else 0)
                    if (correct) session.complete(id, title, "answer") else Tones.wrong()
                }
            }
            result?.let { (good, understood) ->
                AlertBox(if (good) "Correct! ${q.j("explain").str()}" else "Not quite${if (understood != null) " (we read “$understood”)" else ""}. Try again or use the simulation to check.", if (good) AlertKind.Good else AlertKind.Bad)
            }
            WLButton("All challenges", onExit, icon = Icons.AutoMirrored.Rounded.ArrowBack, small = true)
        }
    }
}

/** Key values as a table (text alternative to the picture). */
@Composable
fun ValuesTable(caption: String, rows: List<Triple<String, String, String?>>, columns: Int = 1) {
    val c = WL.colors
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(caption, style = MaterialTheme.typography.titleSmall, color = c.text)
        rows.chunked(max(1, (rows.size + columns - 1) / columns)).let { cols ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                cols.forEach { col ->
                    Column(Modifier.weight(1f)) {
                        col.forEachIndexed { i, (k, v, u) ->
                            Row(Modifier.fillMaxWidth().background(if (i % 2 == 0) c.surface2 else Color.Transparent).padding(horizontal = 6.dp, vertical = 2.dp)) {
                                Text(k, style = MaterialTheme.typography.bodySmall, color = c.muted, modifier = Modifier.weight(1f))
                                Text("$v${if (u != null) " $u" else ""}", style = MaterialTheme.typography.labelMedium, color = c.text)
                            }
                        }
                    }
                }
            }
        }
    }
}

/** Formula lines (senior learners). */
@Composable
fun Formulas(title: String, lines: List<String>) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(title, style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
        lines.forEach { Text(boldMarkup(it), style = MaterialTheme.typography.bodyMedium, color = WL.colors.text) }
    }
}

/** Live line graph against time with a marker at the current time (website's TimeGraph). */
@Composable
fun TimeGraph(title: String, points: List<Pair<Double, Double>>, tMax: Double, yMin: Double, yMax: Double, yLabel: String, unit: String, marker: Pair<Double, Double>?, color: Color, height: Dp = 170.dp) {
    val measurer = rememberTextMeasurer()
    val c = WL.colors
    Column {
        Canvas(Modifier.fillMaxWidth().height(height).semantics { contentDescription = "$title. ${marker?.let { "At t = ${fmt(it.first)} s, $yLabel = ${fmt(it.second)} $unit." } ?: ""}" }) {
            val L = 44.dp.toPx(); val R = 10.dp.toPx(); val T = 10.dp.toPx(); val B = 30.dp.toPx()
            val W = size.width; val H = size.height
            val span = (yMax - yMin).let { if (it == 0.0) 1.0 else it }
            fun sx(t: Double) = (L + (t / (if (tMax == 0.0) 1.0 else tMax)) * (W - L - R)).toFloat()
            fun sy(y: Double) = (H - B - ((y - yMin) / span) * (H - T - B)).toFloat()
            val tickStyle = TextStyle(fontSize = 10.sp, color = c.muted)
            for (i in 0..4) {
                val y = yMin + (yMax - yMin) * i / 4
                drawLine(c.line, Offset(L, sy(y)), Offset(W - R, sy(y)), strokeWidth = 1f)
                val lay = measurer.measure(fmt(y, 1), tickStyle); drawText(lay, topLeft = Offset(L - 6f - lay.size.width, sy(y) - lay.size.height / 2f))
                val t = tMax * i / 4
                val lt = measurer.measure(fmt(t, 1), tickStyle); drawText(lt, topLeft = Offset(sx(t) - lt.size.width / 2f, H - B + 4f))
            }
            drawLine(c.text, Offset(L, T), Offset(L, H - B), strokeWidth = 2f)
            drawLine(c.text, Offset(L, H - B), Offset(W - R, H - B), strokeWidth = 2f)
            val xl = measurer.measure("time t (s)", tickStyle); drawText(xl, topLeft = Offset((L + W - R) / 2 - xl.size.width / 2f, H - xl.size.height.toFloat()))
            val yl = measurer.measure("$yLabel ($unit)", tickStyle); drawText(yl, topLeft = Offset(L + 4f, T))
            if (points.size > 1) {
                val p = Path(); points.forEachIndexed { i, (t, y) -> if (i == 0) p.moveTo(sx(t), sy(y)) else p.lineTo(sx(t), sy(y)) }
                drawPath(p, color, style = Stroke(3.dp.toPx(), cap = StrokeCap.Round))
            }
            marker?.let { (t, y) ->
                drawLine(c.muted, Offset(sx(t), T), Offset(sx(t), H - B), strokeWidth = 1.5f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f)))
                drawCircle(Color.White, 7.dp.toPx(), Offset(sx(t), sy(y))); drawCircle(color, 5.dp.toPx(), Offset(sx(t), sy(y)))
                val ml = measurer.measure("${fmt(y, 1)} $unit", TextStyle(fontSize = 11.sp, fontWeight = FontWeight.Bold, color = c.text))
                val mx = if (sx(t) > W - 90.dp.toPx()) sx(t) - 8f - ml.size.width else sx(t) + 8f
                drawText(ml, topLeft = Offset(mx, max(sy(y) - 8f - ml.size.height, T)))
            }
        }
        Text(title, style = MaterialTheme.typography.labelSmall, color = c.muted)
    }
}

/** Two-way toggle chip. */
@Composable
fun ToggleChip(label: String, on: Boolean, onChange: (Boolean) -> Unit, modifier: Modifier = Modifier) {
    val c = WL.colors
    Text(label, modifier.clip(RoundedCornerShape(12.dp)).background(if (on) c.math else c.surface2).border(2.dp, if (on) c.primary else Color.Transparent, RoundedCornerShape(12.dp))
        .pressable { onChange(!on) }.padding(horizontal = 10.dp, vertical = 6.dp), style = MaterialTheme.typography.labelMedium, color = if (on) c.primary else c.text)
}


/** Polite live region for key moments (run finished, goal reached) — never every frame. */
@Composable
fun Announce(text: String) {
    if (text.isNotEmpty()) Box(Modifier.size(1.dp).semantics { liveRegion = androidx.compose.ui.semantics.LiveRegionMode.Polite; contentDescription = text })
}
