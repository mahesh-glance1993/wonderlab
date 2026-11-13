package com.maheshglance.wonderlab.feature.lesson

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.Feedback
import com.maheshglance.wonderlab.core.design.SmallShape
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.t
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject

/** Where a question comes from: the learner's class, its objective (null = whole class, for the diagnostic) and tier. */
data class QCtx(val level: Int, val objectiveId: String?, val tier: String, val autoRead: Boolean)

/**
 * One question in Learn ("your turn") or Practice (website QuestionPanel): prompt + narration, optional intermediate
 * steps, progressive hints, deterministic checking, targeted feedback and the worked solution — all on one screen.
 */
@Composable
fun QuestionPanel(
    v: QView,
    st: QState,
    set: ((QState) -> QState) -> Unit,
    ctx: QCtx,
    onAnswered: (LQuestion, Boolean, JsonObject?, Int) -> Unit,
    modifier: Modifier = Modifier,
    after: (@Composable RowScope.() -> Unit)? = null,
) {
    val app = LocalApp.current
    val eng = remember { LessonEngine(app.engine) }
    val scope = rememberCoroutineScope()
    val lang = WL.lang
    val q = v.q
    val tier = ctx.tier
    val stepsOn = q.steps.isNotEmpty() && tier != "early" && !st.checked
    val stepsDone = q.steps.isEmpty() || q.steps.indices.all { st.steps.ok.getOrElse(it) { false } }
    val showFinal = !stepsOn || stepsDone
    val resp = effectiveResponse(v, st.draft)
    val canCheck = !st.checked && !isEmptyResponse(resp)
    var busy by remember(q.id) { mutableStateOf(false) }
    val result by produceState<CheckResult?>(null, q.id, st.checked) { value = if (st.checked) eng.check(ctx.level, ctx.objectiveId, q.id, tier, st.draft) else null }
    var cheer by remember(q.id) { mutableStateOf<String?>(null) }

    val check: () -> Unit = check@{
        if (busy || st.checked || isEmptyResponse(resp)) return@check
        busy = true
        scope.launch {
            val r = eng.check(ctx.level, ctx.objectiveId, q.id, tier, resp)
            busy = false
            if (r == null) return@launch
            set { it.copy(checked = true, draft = resp) }
            onAnswered(q, r.correct, resp, st.hints)
            if (r.correct) Tones.correct() else Tones.wrong()
            val words = if (r.correct) com.maheshglance.wonderlab.core.design.Cheer.correct(tier, st.hints > 0) else com.maheshglance.wonderlab.core.design.Cheer.tryAgain(tier)
            cheer = words
            if (ctx.autoRead || tier == "early") app.say(words.replace(Regex("[🔥🏆🎉]"), "").trim(), "en")
        }
    }

    QuestionLayout(
        modifier,
        prompt = { vis, w -> QuestionPrompt(v, ctx.autoRead, tier, vis, w) },
        answer = { room ->
            if (stepsOn) Steps(v, st, set, ctx, room)
            if (showFinal) {
                if (stepsOn) Text(ls("finalAnswer"), style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                AnswerInput(v, st.draft, { r -> set { it.copy(draft = r) } }, tier, room, locked = st.checked, reveal = st.checked, onSubmit = check)
            }
            if (!st.checked) q.hints.take(st.hints).forEachIndexed { i, h -> HintBox(i + 1, L(h)) }
            val res = result
            if (st.checked && res != null) {
                val msg = buildString {
                    append(cheer ?: if (res.correct) (if (st.hints > 0) t("correct") else t("greatJob")) else t("notQuite"))
                    res.mistake?.let { append("\n").append(it.get(lang)) }
                    if (res.showUnderstood && res.understood != null) append("\n").append(ls("weRead", "v" to res.understood))
                }
                Feedback(true, res.correct, msg)
                if (!res.correct) Compare(res.yourAnswer, res.correctAnswer)
                SolutionView(q, startOpen = !res.correct)
            }
        },
        actions = {
            if (!st.checked) {
                if (q.hints.isNotEmpty()) {
                    if (st.hints < q.hints.size) WLButton(ls("hintOf", "i" to st.hints + 1, "n" to q.hints.size), {
                        val h = q.hints[st.hints]
                        set { it.copy(hints = it.hints + 1) }
                        if (ctx.autoRead) app.say(h, lang)
                    }, icon = Icons.Rounded.Lightbulb)
                    else Text(ls("noHints"), style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                }
                if (showFinal) WLButton(t("check"), check, kind = BtnKind.Primary, icon = Icons.Rounded.Check, enabled = canCheck, loading = busy)
            } else after?.invoke(this)
        },
    )
}

/** Intermediate typed steps (website Steps): each graded; "Show me" after a miss; skip to the final answer. */
@Composable
private fun Steps(v: QView, st: QState, set: ((QState) -> QState) -> Unit, ctx: QCtx, room: Room) {
    val app = LocalApp.current
    val eng = remember { LessonEngine(app.engine) }
    val scope = rememberCoroutineScope()
    val q = v.q
    val wrong = remember(q.id) { mutableStateMapOf<Int, Int>() }
    val active = q.steps.indices.firstOrNull { !st.steps.ok.getOrElse(it) { false } } ?: -1
    fun setVal(i: Int, value: String) = set { x ->
        val vals = x.steps.values.toMutableList(); while (vals.size <= i) vals.add(""); vals[i] = value
        x.copy(steps = x.steps.copy(values = vals))
    }
    fun markOk(i: Int, value: String? = null) = set { x ->
        val ok = x.steps.ok.toMutableList(); while (ok.size <= i) ok.add(false); ok[i] = true
        val vals = x.steps.values.toMutableList(); while (vals.size <= i) vals.add(""); if (value != null) vals[i] = value
        x.copy(steps = StepState(vals, ok))
    }
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(ls("steps"), style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
        q.steps.forEachIndexed { i, stp ->
            if (active != -1 && i > active) return@forEachIndexed
            val ok = st.steps.ok.getOrElse(i) { false }
            val value = st.steps.values.getOrElse(i) { "" }
            Column(
                Modifier.fillMaxWidth().clip(SmallShape).background(if (ok) WL.colors.goodBg else WL.colors.surface2).padding(10.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                EmojiText("${ls("stepN", "n" to i + 1)}. ${L(stp.prompt)}", style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold), color = WL.colors.text)
                if (ok) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Icon(Icons.Rounded.CheckCircle, ls("right"), tint = WL.colors.good)
                    Text(value, style = MaterialTheme.typography.titleMedium, color = WL.colors.good)
                } else {
                    val checkStep: () -> Unit = {
                        if (value.isNotBlank()) scope.launch {
                            if (eng.gradeStep(ctx.level, ctx.objectiveId, q.id, ctx.tier, i, value)) { markOk(i); Tones.correct() }
                            else { wrong[i] = (wrong[i] ?: 0) + 1; Tones.wrong() }
                        }
                    }
                    TypedInput(value, { setVal(i, it) }, ctx.tier, room.copy(h = room.h * 0.6f), keypad = q.keypad, rows = v.keypadRows, units = v.stepUnits.getOrElse(i) { emptyList() },
                        answerKind = (stp.answer.str("kind") ?: "text"), qid = "${q.id}:step$i", onSubmit = checkStep, label = L(stp.prompt), compact = true)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        WLButton(ls("checkStep"), checkStep, small = true, icon = Icons.Rounded.Check, enabled = value.isNotBlank(), kind = BtnKind.Primary)
                        if ((wrong[i] ?: 0) > 0) WLButton(ls("showMe"), { markOk(i, v.stepAnswers.getOrElse(i) { "" }) }, small = true, kind = BtnKind.Ghost, icon = Icons.Rounded.Visibility)
                    }
                    if ((wrong[i] ?: 0) > 0) Feedback(true, false, "${t("notQuite")} — ${ls("stepWrong")}")
                }
            }
        }
        if (active != -1) WLButton(ls("skipSteps"), {
            set { x -> x.copy(steps = StepState(q.steps.indices.map { i -> if (x.steps.ok.getOrElse(i) { false }) x.steps.values.getOrElse(i) { "" } else v.stepAnswers.getOrElse(i) { "" } }, q.steps.map { true })) }
        }, small = true, kind = BtnKind.Ghost)
    }
}

@Suppress("unused") private val unusedKinds = listOf(AlertKind.Info, RoundedCornerShape(0.dp), Modifier.padding(0.dp))
