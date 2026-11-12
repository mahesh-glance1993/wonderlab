package com.maheshglance.wonderlab.feature.language

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.automirrored.rounded.MenuBook
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.FitToScreen
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.Meter
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.core.data.Presentation
import com.maheshglance.wonderlab.ui.AppContext
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.jsonPrimitive

/** Grades one answer with the website's engine (language.check). */
suspend fun checkAnswer(app: AppContext, item: kotlinx.serialization.json.JsonObject, value: JsonElement?): Boolean =
    runCatching { app.engine.call("language.check", item, value).jsonPrimitive.booleanOrNull == true }.getOrDefault(false)

private val MODES = listOf("learn" to "Learn", "practice" to "Practice", "test" to "Test")

/** /lang/:course/:unitId/:objectiveId (website Activity.tsx ActivityPage). */
@Composable
fun ActivityScreen(course: String, unitId: String, objectiveId: String, modeArg: String?) {
    val data = rememberEngine<LObjectiveData>("language.objective", course, unitId, objectiveId)
    LoadOr(data) { d -> ActivityBody(d, modeArg) }
}

@Composable
private fun ActivityBody(d: LObjectiveData, modeArg: String?) {
    val app = LocalApp.current
    val win = LocalWindow.current
    val o = d.objective
    val script = d.script
    var mode by rememberSaveable { mutableStateOf(if (modeArg == "practice" || modeArg == "test") modeArg else "learn") }
    val (gloss, setGloss) = rememberGloss()
    val pres = rememberPresentation()
    LaunchedEffect(o.id, mode) { app.repo.setLastActivity("/lang/${d.course}/${d.unit.id}/${o.id}?mode=$mode", "${d.courseTitleEn}: ${o.titleEn ?: o.title}") }
    val tabsInBar = !win.isPhone || win.landscape
    LangFrame({
        LangBar(o.title, script, subtitle = d.unit.title) {
            if (tabsInBar) Segmented(mode, MODES, { mode = it }, Modifier.width(if (win.isPhone) 270.dp else 330.dp))
            if (d.course == "telugu") GlossToggle(gloss, setGloss)
        }
    }) {
        Column(Modifier.fillMaxSize().padding(horizontal = if (win.isPhone) 10.dp else 20.dp, vertical = if (win.isPhone) 6.dp else 12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            if (d.course == "telugu") Gloss(gloss, o.titleEn)
            if (!tabsInBar) Segmented(mode, MODES, { mode = it }, Modifier.fillMaxWidth())
            VoiceNote(d.course)
            Box(Modifier.weight(1f).fillMaxWidth()) {
                if (mode == "learn") Learn(d, gloss, pres) { mode = it }
                else androidx.compose.runtime.key(mode) { Round(d, mode, gloss, pres) { mode = it } }
            }
        }
    }
}

// ---------------- Learn ----------------

@Composable
private fun Learn(d: LObjectiveData, gloss: Boolean, pres: Presentation, setMode: (String) -> Unit) {
    val app = LocalApp.current
    val sayer = rememberSayer()
    val o = d.objective
    val script = d.script
    val key = LangKeys.objectiveKey(d.course, d.unit.id, o.id)
    LaunchedEffect(o.id) { if (pres.readAloud) sayer.say(o.intro, script, o.introEn) }
    val steps = buildList { add("intro" to "Introduction"); if (o.cards != null) add("cards" to "Letters"); if (o.builder != null) add("builder" to "Builder") }
    var step by rememberSaveable { mutableStateOf("intro") }
    val tapped = rememberSaveable(saver = androidx.compose.runtime.saveable.listSaver(save = { it.toList() }, restore = { mutableStateListOf(*it.toTypedArray()) })) { mutableStateListOf<String>() }
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (steps.size > 1) Segmented(step, steps, { step = it }, Modifier.fillMaxWidth())
        Box(Modifier.weight(1f).fillMaxWidth()) {
            when (step) {
                "cards" -> LetterCards(o.cards ?: emptyList(), script, gloss, tapped) { cd ->
                    sayer.say("${cd.letter}. ${cd.word}", script, cd.en)
                    if (cd.letter !in tapped) tapped.add(cd.letter)
                }
                "builder" -> FitToScreen(Modifier.fillMaxSize(), minScale = 0.5f) {
                    when (o.builder) {
                        "gunintham" -> GuninthamBuilder(sayer)
                        "ottu" -> OttuBuilder(sayer)
                        else -> CvcBuilder(sayer)
                    }
                }
                else -> IntroAndExamples(o, script, gloss, sayer)
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
            WLButton("I’m ready to practise", {
                val st = objState(app, key) ?: LObjState()
                app.repo.saveActivityState(LangKeys.activityId(key), encode(st.copy(learned = true)))
                setMode("practice")
            }, kind = BtnKind.Primary, icon = Icons.AutoMirrored.Rounded.ArrowForward, modifier = Modifier.weight(1f))
            WLButton("Take the test", { setMode("test") }, icon = Icons.Rounded.Star, modifier = Modifier.weight(1f))
        }
    }
}

@Composable
private fun IntroAndExamples(o: LObjective, script: String, gloss: Boolean, sayer: Sayer) {
    val win = LocalWindow.current
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val wide = maxWidth >= 600.dp && maxWidth > maxHeight
        val pic = if (win.isPhone) 52.dp else 72.dp
        val intro: @Composable ColumnScope.() -> Unit = {
            WLCard(Modifier.fillMaxWidth(), padding = 14.dp) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    LT(o.intro, script, Modifier.weight(1f), style = MaterialTheme.typography.titleMedium, weight = FontWeight.SemiBold)
                    SpeakButton({ sayer.say(o.intro, script, o.introEn) }, size = 44.dp)
                }
                Gloss(gloss, o.introEn)
            }
        }
        val examples: @Composable ColumnScope.() -> Unit = {
            Text("Worked examples", style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
            o.examples.forEachIndexed { i, e ->
                Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).border(1.dp, WL.colors.line, RoundedCornerShape(16.dp)).background(WL.colors.surface).padding(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("${i + 1}.", style = MaterialTheme.typography.titleMedium, color = WL.colors.muted)
                        e.pic?.let { EmojiImage(it, pic, label = e.en ?: "picture") }
                        LT(e.text, script, Modifier.weight(1f), style = MaterialTheme.typography.headlineSmall, weight = FontWeight.Bold)
                        SpeakButton({ sayer.say(e.text, script, e.en) }, size = 44.dp)
                    }
                    e.note?.let { LT(it, script, style = MaterialTheme.typography.bodyLarge) }
                    if (script == "te") Gloss(gloss, listOfNotNull(e.en, e.noteEn).joinToString(" — ").ifBlank { null })
                    else e.en?.let { Text(it, style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted) }
                }
            }
        }
        if (wide) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            FitToScreen(Modifier.weight(0.42f).fillMaxHeight(), alignTop = true) { Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) { intro() } }
            FitToScreen(Modifier.weight(0.58f).fillMaxHeight(), alignTop = true) { Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) { examples() } }
        } else FitToScreen(Modifier.fillMaxSize(), alignTop = true) {
            Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) { intro(); examples() }
        }
    }
}

/** "Tap a letter to hear it" explorer, paged so every card is big enough and nothing scrolls. */
@Composable
private fun LetterCards(cards: List<LCard>, script: String, gloss: Boolean, tapped: List<String>, onTap: (LCard) -> Unit) {
    var page by rememberSaveable { mutableIntStateOf(0) }
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text("Tap a letter to hear it", style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
        BoxWithConstraints(Modifier.weight(1f).fillMaxWidth()) {
            val gap = 8.dp
            val minCell = if (LocalWindow.current.isPhone) 92.dp else 120.dp
            val (cols, rows) = bestGrid(maxWidth, maxHeight, cards.size, minCell, gap)
            val per = cols * rows
            val pages = (cards.size + per - 1) / per
            val pg = page.coerceIn(0, (pages - 1).coerceAtLeast(0))
            val cellW = (maxWidth - gap * (cols - 1)) / cols
            val cellH = (maxHeight - gap * (rows - 1) - if (pages > 1) 52.dp else 0.dp) / rows
            Column(verticalArrangement = Arrangement.spacedBy(gap)) {
                cards.drop(pg * per).take(per).chunked(cols).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(gap)) {
                        row.forEach { cd -> LetterCardView(cd, script, gloss, cd.letter in tapped, cellW, cellH) { onTap(cd) } }
                    }
                }
                if (pages > 1) Row(Modifier.fillMaxWidth().height(44.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterHorizontally)) {
                    WLButton("", { page = (pg - 1 + pages) % pages }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowBack)
                    Text("Page ${pg + 1} of $pages", style = MaterialTheme.typography.labelLarge, color = WL.colors.text)
                    WLButton("", { page = (pg + 1) % pages }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowForward)
                }
            }
        }
        Text("${tapped.size} of ${cards.size} letters heard", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
    }
}

/** Columns × rows that fit `n` cells of at least `min` in w × h (fewest pages, then biggest cells). */
fun bestGrid(w: Dp, h: Dp, n: Int, min: Dp, gap: Dp): Pair<Int, Int> {
    var best = 1 to 1
    var bestScore = -1.0
    for (cols in 1..12) {
        val cw = (w - gap * (cols - 1)) / cols
        if (cw < min * 0.75f && cols > 1) break
        for (rows in 1..12) {
            val ch = (h - 52.dp - gap * (rows - 1)) / rows
            if (ch < min * 0.75f && rows > 1) break
            val per = cols * rows
            val pages = (n + per - 1) / per
            val side = minOf(cw.value, ch.value)
            val score = -pages * 10000.0 + side - kotlin.math.abs(cw.value - ch.value) * 0.2 - (per - n).coerceAtLeast(0) * 2
            if (score > bestScore) { bestScore = score; best = cols to rows }
        }
    }
    return best
}

@Composable
private fun LetterCardView(cd: LCard, script: String, gloss: Boolean, heard: Boolean, w: Dp, h: Dp, onClick: () -> Unit) {
    val side = minOf(w, h)
    Column(
        Modifier.width(w).height(h).clip(RoundedCornerShape(18.dp))
            .background(if (heard) WL.colors.goodBg else WL.colors.surface)
            .border(2.dp, if (heard) WL.colors.good else WL.colors.line, RoundedCornerShape(18.dp))
            .pressable(onClick = onClick).padding(4.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.SpaceEvenly,
    ) {
        LT(cd.letter, script, fontSize = (side.value * 0.26f).sp, weight = FontWeight.Bold, color = WL.colors.primary, maxLines = 1)
        EmojiImage(cd.pic, side * 0.32f, label = cd.en)
        LT(cd.word, script, fontSize = (side.value * 0.12f).coerceIn(11f, 22f).sp, maxLines = 1)
        if (gloss && script == "te") Text(cd.en, style = MaterialTheme.typography.labelSmall, color = WL.colors.muted, maxLines = 1, textAlign = TextAlign.Center)
    }
}

// ---------------- Practice / Test round ----------------

@Composable
private fun Round(d: LObjectiveData, mode: String, gloss: Boolean, pres: Presentation, setMode: (String) -> Unit) {
    val app = LocalApp.current
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val sayer = rememberSayer()
    val script = d.script
    val o = d.objective
    val key = LangKeys.objectiveKey(d.course, d.unit.id, o.id)
    var st by remember { mutableStateOf(objState(app, key) ?: LObjState()) }
    var s by remember {
        val prev = st.session
        mutableStateOf(if (prev != null && prev.mode == mode && !prev.submitted) prev else LangKeys.freshSession(mode))
    }
    val roundL = rememberEngine<List<LRoundEntry>>("language.round", d.course, d.unit.id, o.id, mode, pres.tier, s.seed)
    val round = (roundL as? Loadable.Ready)?.value
    if (round == null || round.isEmpty()) { if (roundL is Loadable.Loading) Loading() else LangNotFound(); return }

    fun persist(next: LSession, f: (LObjState) -> LObjState = { it }) {
        st = f(st).copy(session = next)
        s = next
        app.repo.saveActivityState(LangKeys.activityId(key), encode(st))
    }
    fun attempt(item: LItem, correct: Boolean, hintsUsed: Int) = scope.launch {
        runCatching { app.repo.recordAttempt(LangKeys.questionId(key, item.id), 1, "lang:$key", mode, correct, null, hintsUsed) }
    }
    fun finish(next: LSession) {
        val score = round.count { next.checked[it.it.id] == true }.toDouble() / round.size
        persist(next.copy(submitted = true, score = score)) {
            if (mode == "practice") it.copy(practiceBest = maxOf(it.practiceBest ?: 0.0, score)) else it.copy(testBest = maxOf(it.testBest ?: 0.0, score))
        }
        if (score >= LangKeys.PASS) Celebrate.fire()
        scope.launch { awardUnitBadges(app, ctx, d.course) }
    }

    if (s.submitted) { Summary(d, mode, s, round, gloss, onAgain = { persist(LangKeys.freshSession(mode)) }, setMode = setMode); return }

    val r = round[s.index.coerceIn(0, round.size - 1)]
    val item = r.it
    val id = item.id
    val value = s.answers[id]
    val hints = r.hints
    val shown = s.hints[id] ?: 0
    val solved = s.solved[id] == true
    val tries = s.tries[id] ?: 0
    val revealed = solved || tries >= 2
    val answered = value.isAnswered()
    val last = s.index >= round.size - 1
    val practice = mode == "practice"
    val typing = pres.allowTyping && (pres.tier == "middle" || pres.tier == "senior")
    var busy by remember { mutableStateOf(false) }

    LaunchedEffect(id) {
        if (pres.readAloud) {
            val spoken = item.say ?: if (item.type == "listen") item.answer.firstOrNull() else null
            if (item.type == "listen") sayer.say(spoken, script) else sayer.say(item.prompt, script, item.en)
        }
    }

    val onCheck = {
        if (!busy) {
            busy = true
            scope.launch {
                val ok = checkAnswer(app, r.item, value)
                val cur = s
                var next = cur
                if (cur.checked[id] == null) { next = next.copy(checked = cur.checked + (id to ok)); attempt(item, ok, shown) }
                next = if (ok) next.copy(solved = next.solved + (id to true)) else next.copy(tries = next.tries + (id to tries + 1))
                persist(next)
                feedbackTone(ok)
                busy = false
            }
        }
    }
    val go = { i: Int -> persist(s.copy(index = i)) }
    val submitTest = {
        if (!busy) {
            busy = true
            scope.launch {
                val checked = mutableMapOf<String, Boolean>()
                for (x in round) { val ok = checkAnswer(app, x.item, s.answers[x.it.id]); checked[x.it.id] = ok; attempt(x.it, ok, 0) }
                finish(s.copy(checked = checked))
                busy = false
            }
        }
    }

    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Pill("${if (practice) "Practice" else "Test"} · Question ${s.index + 1} of ${round.size}")
            Meter((s.index + if (practice && revealed) 1 else 0).toFloat() / round.size, Modifier.weight(1f))
            WLButton(if (LocalWindow.current.isPhone) "" else "Start over", { persist(LangKeys.freshSession(mode)) }, small = true, kind = BtnKind.Ghost, icon = Icons.Rounded.Refresh)
            ReportProblemButton("lang:$key", id)
        }
        BoxWithConstraints(Modifier.weight(1f).fillMaxWidth()) {
            val mw = maxWidth
            val wide = maxWidth >= 560.dp && maxWidth > maxHeight * 1.2f
            val pic = (maxHeight.value * if (wide) 0.34f else 0.2f).coerceIn(56f, 170f).dp
            val prompt: @Composable () -> Unit = {
                ItemPrompt(r, script, gloss, sayer, reveal = practice && revealed, picSize = pic)
            }
            val input: @Composable (Dp) -> Unit = { w ->
                ItemInput(
                    r, script, value, { v -> persist(s.copy(answers = s.answers + (id to v))) },
                    locked = practice && revealed, reveal = practice && revealed,
                    eliminated = if (practice) hints.take(shown).mapNotNull { it.eliminate } else emptyList(),
                    gloss = gloss, typing = typing, width = w, picSize = pic,
                )
            }
            val after: @Composable () -> Unit = {
                if (practice) PracticeFeedback(r, script, gloss, hints.take(shown), solved, tries, hints.size > shown)
            }
            if (wide) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                val lw = mw * 0.44f
                FitToScreen(Modifier.width(lw).fillMaxHeight(), alignTop = true) {
                    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) { WLCard(Modifier.fillMaxWidth(), padding = 14.dp) { prompt() }; after() }
                }
                FitToScreen(Modifier.weight(1f).fillMaxHeight(), alignTop = true) {
                    Column(Modifier.fillMaxWidth()) { input(mw - lw - 14.dp) }
                }
            } else FitToScreen(Modifier.fillMaxSize(), alignTop = true) {
                Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    WLCard(Modifier.fillMaxWidth(), padding = 12.dp) {
                        prompt()
                        Spacer(Modifier.height(10.dp))
                        input(mw - 24.dp)
                    }
                    after()
                }
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            if (practice) {
                if (!revealed) WLButton("Check", { onCheck() }, kind = BtnKind.Primary, icon = Icons.Rounded.Check, enabled = answered && !busy, modifier = Modifier.weight(1f))
                if (!revealed && hints.size > shown) WLButton("Hint", { persist(s.copy(hints = s.hints + (id to shown + 1))) }, icon = Icons.Rounded.Lightbulb)
                if (revealed) {
                    if (last) WLButton("See my score", { finish(s) }, kind = BtnKind.Primary, icon = Icons.Rounded.Star, modifier = Modifier.weight(1f))
                    else WLButton("Next", { go(s.index + 1) }, kind = BtnKind.Primary, icon = Icons.AutoMirrored.Rounded.ArrowForward, modifier = Modifier.weight(1f))
                }
            } else {
                WLButton("Back", { go(s.index - 1) }, icon = Icons.AutoMirrored.Rounded.ArrowBack, enabled = s.index > 0)
                if (!last) WLButton("Next", { go(s.index + 1) }, kind = BtnKind.Primary, icon = Icons.AutoMirrored.Rounded.ArrowForward, modifier = Modifier.weight(1f))
                else WLButton("Submit test", { submitTest() }, kind = BtnKind.Primary, icon = Icons.Rounded.Check, enabled = !busy, modifier = Modifier.weight(1f))
                Text("${s.answers.keys.count { k -> round.any { it.it.id == k } }} of ${round.size} answered", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            }
        }
    }
}

/** Hints shown so far + the practice feedback line (website Activity.tsx). */
@Composable
private fun PracticeFeedback(r: LRoundEntry, script: String, gloss: Boolean, shownHints: List<LHint>, solved: Boolean, tries: Int, moreHints: Boolean) {
    val item = r.it
    if (shownHints.isNotEmpty()) LAlert(WL.colors.warnBg, WL.colors.warn) {
        shownHints.forEach { h ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.Top) {
                EmojiImage("💡", 22.dp)
                Column {
                    LT(h.text, if (h.en != null) script else "en", style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                    Gloss(gloss, h.en)
                }
            }
        }
    }
    when {
        solved -> LAlert(WL.colors.goodBg, WL.colors.good) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                EmojiImage("✅", 24.dp)
                Column {
                    Text("Correct!", style = MaterialTheme.typography.titleMedium, color = WL.colors.good)
                    item.explain?.let { LT(it, script, style = MaterialTheme.typography.bodyLarge) }
                    Gloss(gloss, item.explainEn)
                }
            }
        }
        tries >= 2 -> LAlert(WL.colors.badBg, WL.colors.bad) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                EmojiImage("💭", 24.dp)
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Here is the answer: ", style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                        LT(r.answerText, script, style = MaterialTheme.typography.titleMedium, weight = FontWeight.Bold)
                    }
                    item.explain?.let { LT(it, script, style = MaterialTheme.typography.bodyLarge) }
                    Gloss(gloss, item.explainEn)
                }
            }
        }
        tries == 1 -> LAlert(WL.colors.badBg, WL.colors.bad) {
            Text("Not quite — have another go${if (moreHints) ", or tap Hint." else "."}", style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
        }
    }
}

@Composable
fun LAlert(bg: Color, edge: Color, content: @Composable ColumnScope.() -> Unit) {
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(bg).border(2.dp, edge.copy(alpha = 0.35f), RoundedCornerShape(14.dp)).padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp), content = content,
    )
}

// ---------------- Summary + test review ----------------

@Composable
private fun Summary(d: LObjectiveData, mode: String, s: LSession, round: List<LRoundEntry>, gloss: Boolean, onAgain: () -> Unit, setMode: (String) -> Unit) {
    val win = LocalWindow.current
    var tab by rememberSaveable { mutableStateOf("score") }
    val test = mode == "test"
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val wide = maxWidth >= 600.dp && maxWidth > maxHeight
        if (test && wide) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Box(Modifier.weight(0.45f).fillMaxHeight()) { ScoreCard(d, mode, s, round, onAgain, setMode) }
            Box(Modifier.weight(0.55f).fillMaxHeight()) { Review(d.script, s, round, gloss) }
        } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (test) Segmented(tab, listOf("score" to "My score", "review" to "Review your answers"), { tab = it }, Modifier.fillMaxWidth())
            Box(Modifier.weight(1f).fillMaxWidth()) {
                if (test && tab == "review") Review(d.script, s, round, gloss) else ScoreCard(d, mode, s, round, onAgain, setMode)
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ScoreCard(d: LObjectiveData, mode: String, s: LSession, round: List<LRoundEntry>, onAgain: () -> Unit, setMode: (String) -> Unit) {
    val app = LocalApp.current
    val score = s.score ?: 0.0
    val right = round.count { s.checked[it.it.id] == true }
    val pass = score >= LangKeys.PASS
    FitToScreen(Modifier.fillMaxSize()) {
        WLCard(Modifier.fillMaxWidth(), padding = 20.dp) {
            Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(if (pass) "Well done!" else "Good effort!", style = MaterialTheme.typography.headlineMedium, color = WL.colors.text)
                EmojiImage(if (pass) "🏆" else "⭐", 96.dp)
                Text("$right of ${round.size} right${if (mode == "practice") " on the first try" else ""}", style = MaterialTheme.typography.titleLarge, color = WL.colors.text, textAlign = TextAlign.Center)
                Meter(score.toFloat())
                Text(if (pass) "You have passed this objective." else "Score ${Math.round(LangKeys.PASS * 100)}% or more to pass. Try the Learn page again, then practise.",
                    style = MaterialTheme.typography.bodyLarge, color = WL.colors.muted, textAlign = TextAlign.Center)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    WLButton(if (mode == "practice") "Practise again" else "Retake test", onAgain, icon = Icons.Rounded.Refresh)
                    if (mode == "practice") WLButton("Take the test", { setMode("test") }, kind = BtnKind.Primary, icon = Icons.Rounded.Star)
                    d.next?.let { n -> WLButton("Next: ${n.titleEn ?: n.title}", { app.go("lang/${d.course}/${d.unit.id}/${n.id}") }, icon = Icons.AutoMirrored.Rounded.ArrowForward) }
                    WLButton("Course map", { app.go("lang/${d.course}") }, icon = Icons.Rounded.Home)
                    if (mode == "test") WLButton("Learn again", { setMode("learn") }, kind = BtnKind.Ghost, icon = Icons.AutoMirrored.Rounded.MenuBook)
                }
            }
        }
    }
}

/** Test review, one answer at a time with a ✓/✗ strip (website: the review list). */
@Composable
private fun Review(script: String, s: LSession, round: List<LRoundEntry>, gloss: Boolean) {
    var i by rememberSaveable { mutableIntStateOf(0) }
    val idx = i.coerceIn(0, round.size - 1)
    val e = round[idx]
    val item = e.it
    val ok = s.checked[item.id] == true
    val given = s.answers[item.id]
    val givenText = when {
        given == null -> "(none)"
        given is JsonArray -> given.asTiles().joinToString(if (item.type == "build") "" else " ").ifEmpty { "(none)" }
        else -> (given as? JsonPrimitive)?.content?.ifEmpty { "(none)" } ?: "(none)"
    }
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally)) {
            round.forEachIndexed { k, x ->
                val good = s.checked[x.it.id] == true
                Box(
                    Modifier.size(36.dp).clip(CircleShape).background(if (good) WL.colors.goodBg else WL.colors.badBg)
                        .border(if (k == idx) 3.dp else 1.dp, if (good) WL.colors.good else WL.colors.bad, CircleShape).pressable { i = k },
                    contentAlignment = Alignment.Center,
                ) { Text("${k + 1}", style = MaterialTheme.typography.labelLarge, color = if (good) WL.colors.good else WL.colors.bad) }
            }
        }
        FitToScreen(Modifier.weight(1f).fillMaxWidth(), alignTop = true) {
            WLCard(Modifier.fillMaxWidth(), color = if (ok) WL.colors.goodBg else WL.colors.badBg, padding = 14.dp) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        EmojiImage(if (ok) "✅" else "❌", 26.dp)
                        Text(if (ok) "Correct" else "Not correct", style = MaterialTheme.typography.titleMedium, color = if (ok) WL.colors.good else WL.colors.bad)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        LT(item.prompt, script, Modifier.weight(1f, fill = false), style = MaterialTheme.typography.titleMedium)
                        item.pic?.let { EmojiImage(it, 56.dp, label = item.picLabel ?: "picture") }
                    }
                    Gloss(gloss, item.en)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Your answer: ", style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                        LT(givenText, script, style = MaterialTheme.typography.bodyLarge)
                    }
                    if (!ok) Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Correct answer: ", style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                        LT(e.answerText, script, style = MaterialTheme.typography.bodyLarge, weight = FontWeight.ExtraBold)
                    }
                    item.explain?.let { LT(it, script, style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted) }
                    Gloss(gloss, item.explainEn)
                }
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically) {
            WLButton("Previous", { i = idx - 1 }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowBack, enabled = idx > 0)
            Text("${idx + 1} of ${round.size}", style = MaterialTheme.typography.labelLarge, color = WL.colors.text)
            WLButton("Next", { i = idx + 1 }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowForward, enabled = idx < round.size - 1)
        }
    }
}
