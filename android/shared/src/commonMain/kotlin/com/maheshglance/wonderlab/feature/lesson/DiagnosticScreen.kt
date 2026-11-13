package com.maheshglance.wonderlab.feature.lesson

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.Explore
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.FitToScreen
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Meter
import com.maheshglance.wonderlab.core.design.SmallShape
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.launch

/**
 * Optional starting check for the learner's class (website Diagnostic.tsx): low pressure (no right/wrong while
 * answering), attempts recorded with mode "diagnostic", state saved as lesson "diagnostic/<level>", then a summary.
 */
@Composable
fun DiagnosticScreen() {
    val app = LocalApp.current
    val s by appState()
    val profile = s.profile ?: return
    val level = profile.classLevel
    val pres = rememberPresentation(level, profile.ageBand) ?: run { Loading(); return }
    val tier = pres.tier
    val eng = remember { LessonEngine(app.engine) }
    val scope = rememberCoroutineScope()
    val key = "diagnostic/$level"
    val saved = s.learner.lessons[key]
    val title = ls("diagTitle")
    var touched by rememberSaveable { mutableStateOf(false) }
    var st by remember { mutableStateOf<DiagState?>(null) }
    var loaded by remember { mutableStateOf(false) }
    var startedAt by remember { mutableLongStateOf(nowMillis()) }
    LaunchedEffect(saved?.updatedAt) { if (!touched) { st = saved?.state?.let { eng.restoreDiag(it) }; loaded = true } }
    LaunchedEffect(Unit) { app.repo.setLastActivity("/lesson/diagnostic", title) }
    val count by produceState<Int?>(null, level) { value = eng.diagnosticCount(level) }
    val change = { n: DiagState? ->
        touched = true; st = n
        app.repo.saveLessonState(key, n?.toJson() ?: kotlinx.serialization.json.JsonNull)
    }
    val ctx = QCtx(level, null, tier, pres.readAloud)
    val win = LocalWindow.current

    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar(title, onBack = { app.back() })
        Column(
            Modifier.weight(1f).fillMaxWidth().windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Bottom + WindowInsetsSides.Horizontal)).padding(if (win.isPhone) 10.dp else 20.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            val cur = st
            when {
                !loaded || count == null -> Loading()
                cur == null -> WLCard(Modifier.fillMaxWidth().widthIn(max = 720.dp).align(Alignment.CenterHorizontally)) {
                    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        EmojiImage("🧭", 88.dp)
                        Text(title, style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                        if ((count ?: 0) > 0) {
                            Text(ls("diagIntro"), style = MaterialTheme.typography.bodyLarge, color = WL.colors.text, textAlign = TextAlign.Center)
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                WLButton(ls("diagStart"), {
                                    scope.launch {
                                        val items = eng.diagnosticStart(level, tier)
                                        startedAt = nowMillis()
                                        change(DiagState(1, items, 0, emptyMap(), null, items.isEmpty()))
                                    }
                                }, kind = BtnKind.Primary, icon = Icons.Rounded.PlayArrow)
                                WLButton(ls("notNow"), { app.go(Routes.NEXT) }, kind = BtnKind.Ghost)
                            }
                        } else {
                            Text(ls("diagNone"), style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                            WLButton(ls("whatNext"), { app.go(Routes.NEXT) }, kind = BtnKind.Primary)
                        }
                    }
                }
                cur.done || cur.index >= cur.items.size -> DiagSummaryView(level, cur, eng, onAgain = { change(null) })
                else -> {
                    val it = cur.items[cur.index]
                    val v by produceState<QView?>(null, it.qid) { value = eng.view(level, null, it.qid, tier) }
                    val answer: (Boolean) -> Unit = { skip ->
                        scope.launch {
                            val q = v
                            val r = if (q != null && !skip) effectiveResponse(q, cur.draft) else null
                            val correct = q != null && !skip && eng.check(level, null, it.qid, tier, r)?.correct == true
                            val next = cur.index + 1
                            change(cur.copy(results = cur.results + (it.qid to correct), index = next, draft = null, done = next >= cur.items.size))
                            if (q != null) runCatching {
                                app.repo.recordAttempt(q.q.id, q.q.version, it.objectiveId, "diagnostic", correct, r, 0, (nowMillis() - startedAt).coerceAtMost(30L * 60 * 1000))
                            }
                            startedAt = nowMillis()
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(ls("qOf", "i" to cur.index + 1, "n" to cur.items.size), style = MaterialTheme.typography.labelMedium, color = WL.colors.muted)
                        Meter(cur.index.toFloat() / cur.items.size, Modifier.weight(1f))
                    }
                    val qv = v
                    if (qv == null) Loading(Modifier.weight(1f))
                    else QuestionLayout(
                        Modifier.weight(1f),
                        prompt = { vis, w -> QuestionPrompt(qv, ctx.autoRead, tier, vis, w) },
                        answer = { room -> AnswerInput(qv, cur.draft, { r -> touched = true; st = cur.copy(draft = r) }, tier, room, onSubmit = { if (!isEmptyResponse(effectiveResponse(qv, cur.draft))) answer(false) }) },
                        actions = {
                            WLButton(ls("dontKnow"), { answer(true) }, kind = BtnKind.Ghost)
                            WLButton(ls("saveAndNext"), { answer(false) }, kind = BtnKind.Primary, icon = Icons.AutoMirrored.Rounded.ArrowForward, enabled = !isEmptyResponse(effectiveResponse(qv, cur.draft)))
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun DiagSummaryView(level: Int, st: DiagState, eng: LessonEngine, onAgain: () -> Unit) {
    val app = LocalApp.current
    val sum by produceState<List<DiagSummary>?>(null, st.items, st.results) { value = eng.diagnosticSummary(level, st.items, st.results) }
    val list = sum ?: run { Loading(); return }
    WLCard(Modifier.fillMaxSize(), padding = 14.dp) {
        BoxWithConstraints(Modifier.weight(1f).fillMaxWidth()) {
            val w = maxWidth
            FitToScreen(Modifier.fillMaxSize(), minScale = 0.5f, alignTop = true) {
                Column(Modifier.width(w), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        EmojiImage("⭐", 40.dp)
                        Text(ls("diagDone"), style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                    }
                    list.forEach { x ->
                        val strong = x.correct == x.total
                        Row(
                            Modifier.fillMaxWidth().clip(SmallShape).background(if (strong) WL.colors.goodBg else WL.colors.warnBg).padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            EmojiImage(if (strong) "✅" else "💡", 28.dp)
                            Column(Modifier.weight(1f)) {
                                Text(L(x.title), style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                                Text("${if (strong) ls("strong") else ls("practiseThis")} (${x.correct}/${x.total})", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                            }
                            if (!strong) WLButton(ls("open"), { app.go("lesson/${encodePathSegment(x.unitId)}/${encodePathSegment(x.objectiveId)}?mode=learn") }, small = true)
                        }
                    }
                }
            }
        }
        Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            WLButton(ls("whatNext"), { app.go(Routes.NEXT) }, kind = BtnKind.Primary, icon = Icons.Rounded.Explore)
            Spacer(Modifier.weight(1f))
            WLButton(ls("diagAgain"), onAgain, kind = BtnKind.Ghost, icon = Icons.Rounded.Refresh)
        }
    }
}
