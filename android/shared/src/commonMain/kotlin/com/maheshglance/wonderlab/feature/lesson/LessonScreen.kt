package com.maheshglance.wonderlab.feature.lesson

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.material.icons.rounded.NoteAdd
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.EmojiEvents
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.SkipNext
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.viewmodel.compose.viewModel
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.ConfirmDialog
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.ErrorState
import com.maheshglance.wonderlab.core.design.FitToScreen
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Meter
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.SmallShape
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.t
import kotlinx.coroutines.delay

/** Route entry: /lesson/{unitId}[/{objectiveId}]?mode=learn|practice|test */
@Composable
fun LessonRoute(unitId: String, objectiveId: String?, mode: String?) {
    val app = LocalApp.current
    val s by appState()
    val profile = s.profile ?: return
    val pres = rememberPresentation(profile.classLevel, profile.ageBand)
    if (pres == null) { Loading(text = ls("loading")); return }
    val m = mode?.takeIf { it == "learn" || it == "practice" || it == "test" }
    val vm: LessonViewModel = viewModel(key = "lesson:${profile.id}:$unitId/${objectiveId ?: ""}") {
        LessonViewModel(app.repo, LessonEngine(app.engine), profile.classLevel, pres.tier, unitId, objectiveId, m)
    }
    LessonWorkspace(vm, pres.readAloud)
}

@Composable
private fun LessonWorkspace(vm: LessonViewModel, autoRead: Boolean) {
    val app = LocalApp.current
    val s by appState()
    val win = LocalWindow.current
    when (vm.status) {
        "loading" -> { Column(Modifier.fillMaxSize()) { TopBar(ls("loading"), onBack = { app.back() }); Loading(text = ls("loading")) }; return }
        "notfound" -> {
            Column(Modifier.fillMaxSize()) {
                TopBar(ls("notFound"), onBack = { app.back() })
                ErrorState(ls("notFound"), null)
                WLButton(ls("backToLearn"), { app.go(Routes.LEARN) }, Modifier.align(Alignment.CenterHorizontally).padding(16.dp), kind = BtnKind.Primary)
            }
            return
        }
    }
    val info = vm.info ?: return
    val o = info.objective
    val lst = vm.ls
    val ctx = QCtx(vm.level, o.id, vm.tier, autoRead)
    val title = L(o.title)
    val stage = vm.stageOf()
    val mastery = s.learner.mastery[o.id]
    val progress = ((mastery?.distinctCorrect?.size ?: 0).toFloat() / info.masteryDistinct).coerceIn(0f, 1f)
    val senior = vm.tier == "senior"
    var scratch by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(lst.mode, title) { vm.lastActivity(title) }
    LaunchedEffect(lst.mode, lst.practice.q?.qid, lst.learn.q?.qid, stage.kind, lst.test?.seed) { vm.ensure() }
    val currentQid = when {
        lst.mode == "practice" -> lst.practice.q?.qid
        lst.mode == "learn" && stage.kind == "try" -> lst.learn.q?.qid
        lst.mode == "test" && lst.test?.submitted == false -> lst.test.ids.getOrNull(lst.test.index)
        else -> null
    }
    LaunchedEffect(currentQid) { vm.markShown(currentQid) }
    val reportQ = currentQid?.let { vm.views[it] }?.q
    LaunchedEffect(vm.message) { if (vm.message != null) { delay(3500); vm.message = null } }

    val unitTitle = L(info.unit.title)
    androidx.compose.runtime.CompositionLocalProvider(LocalNoteTarget provides if (vm.tier == "early") null else { line: String -> com.maheshglance.wonderlab.feature.notes.appendToChapterNote(app, info.unit.id, info.unit.subject, unitTitle, line) }) {
    Box(Modifier.fillMaxSize().background(WL.colors.bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar(title, onBack = { app.back() }, subtitle = L(info.unit.title), actions = {
                if (!win.isPhone) {
                    ModeTabs(lst.mode, { vm.switchMode(it) }, compact = true)
                    MasteryChip(mastery?.masteredAt != null, progress, Modifier.width(150.dp))
                }
                if (senior) IconBtn(Icons.Rounded.Edit, ls("scratch"), { scratch = !scratch }, size = 44.dp, bg = if (scratch) WL.colors.math else WL.colors.surface2)
                if (vm.tier != "early") {
                    val openNotes = { app.go(com.maheshglance.wonderlab.feature.notes.chapterNotePath(info.unit.id, info.unit.subject, unitTitle)) }
                    if (win.isPhone) IconBtn(androidx.compose.material.icons.Icons.Rounded.NoteAdd, "My notes for this chapter", openNotes, size = 44.dp)
                    else WLButton("Notes", openNotes, small = true, icon = androidx.compose.material.icons.Icons.Rounded.NoteAdd)
                }
                ReportProblemButton(vm.lessonId, reportQ?.id, reportQ?.version)
                IconBtn(Icons.Rounded.Home, ls("home"), { app.go(Routes.HOME) }, size = 44.dp)
            })
            Column(
                Modifier.weight(1f).fillMaxWidth().windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Bottom + WindowInsetsSides.Horizontal))
                    .padding(horizontal = if (win.isPhone) 10.dp else 20.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                if (win.isPhone) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    ModeTabs(lst.mode, { vm.switchMode(it) }, Modifier.weight(1f))
                    if (win.landscape) MasteryChip(mastery?.masteredAt != null, progress, Modifier.width(140.dp))
                }
                if (win.isPhone && !win.landscape) MasteryChip(mastery?.masteredAt != null, progress, Modifier.fillMaxWidth())
                AnimatedVisibility(vm.masteredNow, enter = fadeIn() + slideInVertically()) {
                    Row(Modifier.fillMaxWidth().clip(SmallShape).background(WL.colors.goodBg).padding(horizontal = 12.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        EmojiImage("🏆", 34.dp)
                        Text("${t("canNowDo")} $title", style = MaterialTheme.typography.titleMedium, color = WL.colors.good, modifier = Modifier.weight(1f))
                        IconBtn(Icons.Rounded.Close, t("close"), { vm.masteredNow = false }, size = 36.dp, bg = Color.Transparent)
                    }
                }
                vm.message?.let { Text(ls(it), style = MaterialTheme.typography.labelMedium, color = WL.colors.warn) }
                Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(Modifier.weight(1f).fillMaxHeight()) {
                        when (lst.mode) {
                            "learn" -> LearnMode(vm, info, ctx)
                            "practice" -> PracticeMode(vm, ctx)
                            else -> TestMode(vm, ctx)
                        }
                    }
                    if (senior && scratch && !(win.isPhone && !win.landscape)) Box(Modifier.weight(0.6f).fillMaxHeight()) { Scratchpad() }
                }
            }
        }
        Confetti(vm.celebrate)
    }
    }
    if (senior && scratch && win.isPhone && !win.landscape) Dialog({ scratch = false }, DialogProperties(usePlatformDefaultWidth = false)) {
        Box(Modifier.fillMaxSize().background(WL.colors.bg).padding(12.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(Modifier.weight(1f)) { Scratchpad() }
                WLButton(t("close"), { scratch = false }, Modifier.fillMaxWidth())
            }
        }
    }
}

@Composable
private fun MasteryChip(mastered: Boolean, progress: Float, modifier: Modifier = Modifier) {
    if (mastered) Pill(t("mastered"), modifier, bg = WL.colors.goodBg, fg = WL.colors.good, icon = Icons.Rounded.EmojiEvents)
    else SmallMeterRow("⭐", progress, modifier)
}

// ---------------------------------------------------------------- Learn mode

@Composable
private fun LearnMode(vm: LessonViewModel, info: LessonInfo, ctx: QCtx) {
    val app = LocalApp.current
    val lang = WL.lang
    val stages = vm.stages
    val lst = vm.ls
    val i = lst.learn.step.coerceIn(0, (stages.size - 1).coerceAtLeast(0))
    val stage = vm.stageOf()
    val o = info.objective
    val learnQ = lst.learn.q
    val lv = learnQ?.let { vm.views[it.qid] }
    val eng = remember { LessonEngine(app.engine) }
    val tryCorrect by produceState<Boolean?>(null, learnQ?.qid, learnQ?.checked) {
        value = if (learnQ?.checked == true) eng.check(ctx.level, o.id, learnQ.qid, ctx.tier, learnQ.draft)?.correct else null
    }
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(ls("stepOf", "i" to i + 1, "n" to stages.size), style = MaterialTheme.typography.labelMedium, color = WL.colors.muted)
            Meter((i + 1f) / stages.size.coerceAtLeast(1), Modifier.weight(1f))
        }
        Box(Modifier.weight(1f).fillMaxWidth()) {
            when (stage.kind) {
                "intro" -> IntroStage(o.intro, info.introSay, ctx.autoRead)
                "example" -> o.examples.getOrNull(stage.index)?.let { ex -> ExampleStage(ex, stage.index + 1, lst.learn.revealed, ctx.autoRead) { vm.setRevealed(it) } }
                "try" -> Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(Modifier.fillMaxWidth().clip(SmallShape).background(WL.colors.math).padding(horizontal = 12.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        EmojiImage("✋", 26.dp)
                        Text("${ls("yourTurn")}. ${ls("yourTurnBody")}", style = MaterialTheme.typography.bodyMedium, color = WL.colors.mathInk)
                    }
                    when {
                        lv != null && learnQ != null -> QuestionPanel(lv, learnQ, { fn -> vm.setQ("learn", fn) }, ctx, { q, ok, r, h -> vm.recordAsync(q, "learn", ok, r, h) }, Modifier.weight(1f))
                        vm.noTry -> WLCard { Text(ls("noQuestions"), color = WL.colors.text) }
                        else -> Loading()
                    }
                }
                else -> ReviewStage(info, tryCorrect, { vm.switchMode(it) }) { vm.goStage(0) }
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
            if (i > 0) WLButton(t("back"), { vm.goStage(i - 1); app.speech.stop() }, icon = Icons.AutoMirrored.Rounded.ArrowBack)
            Spacer(Modifier.weight(1f))
            val tryChecked = learnQ?.checked == true
            if (i < stages.size - 1 && (stage.kind != "try" || tryChecked)) {
                val primary = stage.kind == "try" || stage.kind == "intro" || (stage.kind == "example" && lst.learn.revealed >= (o.examples.getOrNull(stage.index)?.steps?.size ?: 0))
                WLButton(ls("continue"), { vm.goStage(i + 1); app.speech.stop() }, kind = if (primary) BtnKind.Primary else BtnKind.Normal, icon = Icons.AutoMirrored.Rounded.ArrowForward)
            }
            if (stage.kind == "try" && !tryChecked) WLButton(t("next"), { vm.goStage(i + 1) }, kind = BtnKind.Ghost, icon = Icons.Rounded.SkipNext)
        }
    }
    if (lang.isEmpty()) Unit
}

@Composable
private fun IntroStage(blocks: List<kotlinx.serialization.json.JsonObject>, say: com.maheshglance.wonderlab.core.data.Localized, autoRead: Boolean) {
    val app = LocalApp.current
    val lang = WL.lang
    LaunchedEffect(Unit) { if (autoRead && say.en.isNotBlank()) app.say(say, lang) }
    WLCard(Modifier.fillMaxSize(), padding = 14.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            EmojiImage("📖", 30.dp)
            Text(ls("intro"), style = MaterialTheme.typography.headlineSmall, color = WL.colors.text, modifier = Modifier.weight(1f))
            if (say.en.isNotBlank()) Narration(say)
        }
        BoxWithConstraints(Modifier.weight(1f).fillMaxWidth().padding(top = 8.dp)) {
            val w = maxWidth; val h = maxHeight
            val visuals = blocks.filter { it.str("type") == "visual" }
            val rest = blocks.filter { it.str("type") != "visual" }
            // rich explanations (explorer, definitions, key points…) are read at full size and scroll, never shrunk
            val rich = blocks.size > 4 || blocks.any { it.str("type") in setOf("explore", "definition", "keypoints", "remember", "heading", "photo") }
            if (rich) Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
                Blocks(blocks, minOf(w.value * 0.6f, 260f).coerceAtLeast(120f).dp, Modifier.fillMaxWidth())
            }
            else if (w >= 560.dp && w > h * 1.15f && visuals.isNotEmpty() && rest.isNotEmpty()) {
                Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    FitToScreen(Modifier.weight(1f).fillMaxHeight(), minScale = 0.45f) { Blocks(rest, 200.dp, Modifier.width(w * 0.5f)) }
                    FitToScreen(Modifier.weight(1f).fillMaxHeight(), minScale = 0.45f) { Blocks(visuals, minOf(w.value * 0.4f, h.value * 0.8f).dp, Modifier.width(w * 0.45f)) }
                }
            } else FitToScreen(Modifier.fillMaxSize(), minScale = 0.45f, alignTop = true) {
                Blocks(blocks, minOf(w.value * 0.7f, h.value * 0.4f).coerceAtLeast(120f).dp, Modifier.width(w))
            }
        }
    }
}

@Composable
private fun ExampleStage(ex: LExample, n: Int, revealed: Int, autoRead: Boolean, setRevealed: (Int) -> Unit) {
    val app = LocalApp.current
    val lang = WL.lang
    var replayKey by remember { mutableIntStateOf(0) }
    val total = ex.steps.size
    val shown = revealed.coerceAtMost(total)
    val done = shown >= total
    LaunchedEffect(ex.id) { if (autoRead) app.say(ex.problem, lang) }
    val reveal = {
        val next = shown + 1
        setRevealed(next)
        val st = ex.steps.getOrNull(next - 1)
        if (autoRead && st != null) app.say(st, lang) else if (autoRead && next > total) app.say(ex.answer, lang)
    }
    val narr = com.maheshglance.wonderlab.core.data.Localized(
        (listOf(ex.problem.en) + ex.steps.take(shown).map { it.en }).joinToString(" "),
        (listOf(ex.problem.te ?: ex.problem.en) + ex.steps.take(shown).map { it.te ?: it.en }).joinToString(" "),
    )
    WLCard(Modifier.fillMaxSize(), padding = 14.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            EmojiImage("🧮", 28.dp)
            Text(ls("example", "n" to n), style = MaterialTheme.typography.titleLarge, color = WL.colors.text, modifier = Modifier.weight(1f))
            Narration(narr)
        }
        BoxWithConstraints(Modifier.weight(1f).fillMaxWidth().padding(vertical = 8.dp)) {
            val w = maxWidth; val h = maxHeight
            val wide = w >= 560.dp && w > h * 1.15f
            val problem: @Composable (Dp) -> Unit = { vs ->
                Column(verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    EmojiText(L(ex.problem), Modifier.fillMaxWidth(), style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                    ex.visual?.let { androidx.compose.runtime.key(replayKey) { Visual(it, vs) } }
                }
            }
            val steps: @Composable () -> Unit = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    ex.steps.take(shown).forEachIndexed { i, st -> NumberedLine(i + 1, L(st), done = true) }
                    if (done) Row(Modifier.fillMaxWidth().clip(SmallShape).background(WL.colors.goodBg).padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Rounded.Check, null, tint = WL.colors.good)
                        EmojiText("${ls("answerIs")}: ${L(ex.answer)}", style = MaterialTheme.typography.titleMedium, color = WL.colors.good)
                    }
                }
            }
            if (wide) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                FitToScreen(Modifier.weight(1f).fillMaxHeight(), minScale = 0.45f) { Box(Modifier.width(w * 0.48f)) { problem(minOf(w.value * 0.4f, h.value * 0.6f).dp) } }
                FitToScreen(Modifier.weight(1f).fillMaxHeight(), minScale = 0.45f, alignTop = true) { Box(Modifier.width(w * 0.48f)) { steps() } }
            } else FitToScreen(Modifier.fillMaxSize(), minScale = 0.45f, alignTop = true) {
                Column(Modifier.width(w), verticalArrangement = Arrangement.spacedBy(10.dp)) { problem(minOf(w.value * 0.7f, h.value * 0.32f).coerceAtLeast(110f).dp); steps() }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            if (!done) WLButton("${ls("nextStep")} (${shown + 1}/$total)", reveal, kind = BtnKind.Primary, icon = Icons.Rounded.PlayArrow)
            if (shown > 0) WLButton(ls("replay"), { setRevealed(0); replayKey++ }, icon = Icons.Rounded.Refresh)
        }
    }
}

@Composable
private fun ReviewStage(info: LessonInfo, tryCorrect: Boolean?, goMode: (String) -> Unit, again: () -> Unit) {
    WLCard(Modifier.fillMaxSize(), padding = 14.dp) {
        BoxWithConstraints(Modifier.fillMaxSize()) {
            val w = maxWidth
            FitToScreen(Modifier.fillMaxSize(), minScale = 0.45f, alignTop = true) {
                Column(Modifier.width(w), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        EmojiImage("⭐", 34.dp)
                        Text(ls("recap"), style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                    }
                    EmojiText(L(info.objective.title), style = MaterialTheme.typography.titleLarge, color = WL.colors.mathInk)
                    if (info.recap.isNotEmpty()) Blocks(info.recap, 160.dp)
                    if (tryCorrect != null) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        EmojiImage(if (tryCorrect) "✅" else "💡", 26.dp)
                        Text("${ls("yourTurn")}: ${if (tryCorrect) t("wellDone") else t("notQuite")}", style = MaterialTheme.typography.titleMedium, color = if (tryCorrect) WL.colors.good else WL.colors.warn)
                    }
                    FlowButtons {
                        WLButton(ls("goPractice"), { goMode("practice") }, kind = BtnKind.Primary, icon = Icons.Rounded.Lightbulb)
                        WLButton(ls("goTest"), { goMode("test") }, icon = Icons.Rounded.EmojiEvents)
                        WLButton(ls("goLearn"), again, kind = BtnKind.Ghost, icon = Icons.Rounded.Refresh)
                    }
                    ActivityLinks(info.activities)
                }
            }
        }
    }
}

// ---------------------------------------------------------------- Practice mode

@Composable
private fun PracticeMode(vm: LessonViewModel, ctx: QCtx) {
    val pq = vm.ls.practice.q
    val v = pq?.let { vm.views[it.qid] }
    val acts = vm.info?.activities ?: emptyList()
    when {
        v != null && pq != null -> QuestionPanel(v, pq, { fn -> vm.setQ("practice", fn) }, ctx, { q, ok, r, h -> vm.recordAsync(q, "practice", ok, r, h) }, Modifier.fillMaxSize()) {
            if (acts.isNotEmpty() && LocalWindow.current.isTablet) ActivityChips(acts)
            WLButton(ls("similar"), { vm.trySimilar() }, kind = BtnKind.Primary, icon = Icons.Rounded.Refresh)
            WLButton(ls("nextQ"), { vm.nextQuestion() }, icon = Icons.AutoMirrored.Rounded.ArrowForward)
        }
        vm.noPractice -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) { WLCard(Modifier.fillMaxWidth()) { Text(ls("noQuestions"), color = WL.colors.text) }; ActivityLinks(acts) }
        else -> Loading()
    }
}

@Composable
private fun ActivityChips(acts: List<LActivity>) {
    val app = LocalApp.current
    acts.take(2).forEach { a -> ActivityButton(a.id, L(a.label), a.path) { app.go(a.path) } }
}

// ---------------------------------------------------------------- Test mode

@Composable
private fun TestMode(vm: LessonViewModel, ctx: QCtx) {
    val test = vm.ls.test
    if (test == null) {
        val n = vm.testSize
        WLCard(Modifier.fillMaxWidth()) {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp), horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                EmojiImage("🏆", 72.dp)
                Text(t("test"), style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                when {
                    n == null -> Loading(Modifier.height(80.dp))
                    n > 0 -> {
                        Text(ls("testIntro", "n" to n), style = MaterialTheme.typography.bodyLarge, color = WL.colors.text, textAlign = TextAlign.Center)
                        WLButton(ls("startTest"), { vm.startTest() }, kind = BtnKind.Primary, icon = Icons.Rounded.PlayArrow)
                    }
                    else -> Text(ls("noQuestions"), color = WL.colors.text)
                }
            }
        }
        return
    }
    val views = test.ids.map { vm.views[it] }
    if (test.ids.isEmpty()) {
        WLCard { Text(ls("noQuestions"), color = WL.colors.text); WLButton(ls("retake"), { vm.startTest() }, icon = Icons.Rounded.Refresh) }
        return
    }
    if (views.any { it == null }) { Loading(); return }
    val qs = views.filterNotNull()
    if (test.submitted) { TestReview(vm, qs, test, ctx); return }

    val curId = test.ids[test.index]
    LaunchedEffect(curId) { vm.enterTestQuestion(curId) }
    val v = qs[test.index]
    val answered = { id: String -> !isEmptyResponse(test.answers[id]) }
    val unanswered = test.ids.count { !answered(it) }
    var confirm by remember { mutableStateOf(false) }
    val last = test.index == test.ids.size - 1
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(ls("qOf", "i" to test.index + 1, "n" to test.ids.size), style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
            Spacer(Modifier.weight(1f))
            test.ids.forEachIndexed { i, id ->
                Dot(if (answered(id)) "✓" else "${i + 1}", i == test.index, if (answered(id)) WL.colors.goodBg else WL.colors.surface2) { vm.testGo(i) }
            }
        }
        QuestionLayout(
            Modifier.weight(1f),
            prompt = { vis, w -> QuestionPrompt(v, ctx.autoRead, ctx.tier, vis, w) },
            answer = { room -> AnswerInput(v, test.answers[curId], { vm.testAnswer(curId, it) }, ctx.tier, room, onSubmit = { if (!last) vm.testGo(test.index + 1) else if (unanswered > 0) confirm = true else vm.submitTest() }) },
            actions = {
                WLButton(ls("prev"), { vm.testGo(test.index - 1) }, enabled = test.index > 0, icon = Icons.AutoMirrored.Rounded.ArrowBack)
                if (!last) WLButton(t("next"), { vm.testGo(test.index + 1) }, kind = BtnKind.Primary, icon = Icons.AutoMirrored.Rounded.ArrowForward)
                WLButton(ls("submitTest"), { if (unanswered > 0) confirm = true else vm.submitTest() }, kind = if (last) BtnKind.Primary else BtnKind.Normal, icon = Icons.Rounded.Check)
            },
        )
    }
    if (confirm) ConfirmDialog(ls("submitTest"), ls("unanswered", "n" to unanswered), ls("submitTest"), { confirm = false; vm.submitTest() }, { confirm = false }, dismiss = t("cancel"))
}

@Composable
fun Dot(text: String, current: Boolean, bg: Color, onClick: () -> Unit) {
    Box(
        Modifier.size(34.dp).clip(CircleShape).background(bg).border(if (current) 3.dp else 0.dp, WL.colors.primary, CircleShape).pressable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Text(text, style = MaterialTheme.typography.labelLarge, color = WL.colors.text) }
}

/** Test review: score + one question at a time with your answer, the right answer and how to solve it. */
@Composable
private fun TestReview(vm: LessonViewModel, qs: List<QView>, test: TestSt, ctx: QCtx) {
    val app = LocalApp.current
    val eng = remember { LessonEngine(app.engine) }
    val results by produceState<List<CheckResult?>?>(null, test.seed, test.ids) {
        value = qs.map { v -> eng.check(ctx.level, ctx.objectiveId, v.q.id, ctx.tier, effectiveResponse(v, test.answers[v.q.id])) }
    }
    val res = results ?: run { Loading(); return }
    val c = res.count { it?.correct == true }
    var page by rememberSaveable(test.seed) { mutableIntStateOf(0) }
    val win = LocalWindow.current
    val summary: @Composable (Modifier) -> Unit = { m ->
        WLCard(m, padding = 14.dp) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                EmojiImage(if (c == res.size) "🏆" else if (c * 2 >= res.size) "⭐" else "💪", 44.dp)
                Column(Modifier.weight(1f)) {
                    Text(t("review"), style = MaterialTheme.typography.titleMedium, color = WL.colors.muted)
                    Text(ls("score", "c" to c, "n" to res.size), style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                }
            }
            Meter(c.toFloat() / res.size.coerceAtLeast(1), Modifier.padding(vertical = 8.dp))
            FlowButtons {
                WLButton(ls("retake"), { vm.startTest() }, kind = BtnKind.Primary, icon = Icons.Rounded.Refresh, small = true)
                WLButton(ls("goPractice"), { vm.switchMode("practice") }, icon = Icons.Rounded.Lightbulb, small = true)
            }
        }
    }
    val p = page.coerceIn(0, qs.size - 1)
    val v = qs[p]; val r = res[p]
    val pager: @Composable (Modifier) -> Unit = { m ->
        Column(m, verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                qs.indices.forEach { i -> Dot(if (res[i]?.correct == true) "✓" else "✗", i == p, if (res[i]?.correct == true) WL.colors.goodBg else WL.colors.badBg) { page = i } }
            }
            QuestionLayout(
                Modifier.weight(1f),
                prompt = { vis, w ->
                    Text("${ls("qOf", "i" to p + 1, "n" to qs.size)} — ${if (r?.correct == true) ls("right") else ls("wrong")}", style = MaterialTheme.typography.titleMedium, color = if (r?.correct == true) WL.colors.good else WL.colors.bad)
                    QuestionPrompt(v, false, ctx.tier, vis, w, compact = true)
                },
                answer = { room ->
                    AnswerInput(v, r?.response ?: test.answers[v.q.id], {}, ctx.tier, room, locked = true, reveal = true)
                    Compare(r?.yourAnswer ?: "", r?.correctAnswer ?: v.answerText)
                    androidx.compose.runtime.key(v.q.id) { SolutionView(v.q, startOpen = r?.correct != true) }
                },
                actions = {
                    WLButton(ls("prev"), { page = p - 1 }, enabled = p > 0, icon = Icons.AutoMirrored.Rounded.ArrowBack, small = true)
                    WLButton(t("next"), { page = p + 1 }, enabled = p < qs.size - 1, icon = Icons.AutoMirrored.Rounded.ArrowForward, small = true)
                },
            )
        }
    }
    if (win.isTablet && win.landscape) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        summary(Modifier.width(300.dp)); pager(Modifier.weight(1f))
    } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        summary(Modifier.fillMaxWidth()); pager(Modifier.weight(1f))
    }
}
