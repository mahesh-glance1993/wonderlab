package com.maheshglance.wonderlab.feature.lesson

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Backspace
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Cancel
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.DragIndicator
import androidx.compose.material.icons.rounded.Keyboard
import androidx.compose.material.icons.rounded.KeyboardArrowDown
import androidx.compose.material.icons.rounded.KeyboardArrowUp
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.layout.boundsInRoot
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.ChoiceCard
import com.maheshglance.wonderlab.core.design.EmojiAssets
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.t
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

// Answer inputs for every item type (website: src/features/lesson/inputs.tsx). All controlled: value is a grading Response.

/** Room an input may use: width of its pane and a height budget (inputs size their tiles from it). */
data class Room(val w: Dp, val h: Dp, val wide: Boolean)

@Composable
fun AnswerInput(v: QView, value: JsonObject?, onChange: (JsonObject) -> Unit, tier: String, room: Room, locked: Boolean = false, reveal: Boolean = false, onSubmit: (() -> Unit)? = null) {
    when (v.kind) {
        "choice" -> ChoiceInput(v, value, onChange, tier, room, locked, reveal)
        "multi" -> MultiInput(v, value, onChange, room, locked, reveal)
        "match" -> MatchInput(v, value, onChange, room, locked, reveal)
        "order" -> OrderInput(v, value, onChange, room, locked, reveal)
        "numberline" -> NumberLineInput(v, value, onChange, room, locked, reveal)
        "count" -> {
            val spec = v.q.visual
            val n = if (value.respKind == "text") value.respText.toIntOrNull() ?: 0 else 0
            if (spec != null && spec.str("kind") == "objects") CountObjects(spec, room, n, v.q.id, locked) { onChange(Resp.text(it.toString())) }
            else Stepper(n, locked) { onChange(Resp.text(it.toString())) }
        }
        else -> TypedInput(
            value = if (value.respKind == "text") value.respText else "", onChange = { onChange(Resp.text(it)) }, tier = tier, room = room,
            keypad = v.q.keypad, rows = v.keypadRows, units = v.units, answerKind = v.answerKind, qid = v.q.id, locked = locked, onSubmit = onSubmit,
        )
    }
}

@Composable
fun HelpText(text: String) = Text(text, style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())

@Composable
fun Mark(ok: Boolean, size: Dp = 26.dp) = Icon(
    if (ok) Icons.Rounded.CheckCircle else Icons.Rounded.Cancel, if (ok) ls("right") else ls("wrong"),
    tint = if (ok) WL.colors.good else WL.colors.bad, modifier = Modifier.size(size),
)

/** True when a label is only pictures (e.g. "🍎" or "🐶🐶") — then it is drawn as big pictures. */
private fun pictureOnly(s: String): Boolean = s.isNotBlank() && EmojiAssets.split(s.trim()).all { it.first || it.second.isBlank() }

@Composable
private fun ChoiceBody(c: LChoice, room: Room, cell: Dp, pictures: Boolean) {
    val label = L(c.label)
    if (c.visual != null) Visual(c.visual, (cell.value * 0.72f).coerceIn(48f, 200f).dp, animate = false)
    if (c.visual == null && pictureOnly(c.label.en)) {
        val parts = EmojiAssets.split(c.label.en.trim()).filter { it.first }
        val pic = (cell.value * 0.55f / max(1, parts.size).coerceAtMost(4)).coerceIn(26f, 110f).dp
        FlowRow2(parts.map { it.second }, pic)
    } else {
        EmojiText(label, style = if (pictures || label.length <= 14) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyLarge, color = WL.colors.text, textAlign = TextAlign.Center, emojiScale = 1.5f)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FlowRow2(emojis: List<String>, size: Dp) =
    FlowRow(horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally)) { emojis.forEach { EmojiImage(it, size) } }

/** Lays tiles out in a grid with `cols` columns, every tile the same width. */
@Composable
fun <T> TileGrid(items: List<T>, cols: Int, gap: Dp = 10.dp, item: @Composable (T, Modifier) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(gap)) {
        items.chunked(max(1, cols)).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(gap), modifier = Modifier.fillMaxWidth()) {
                row.forEach { item(it, Modifier.weight(1f)) }
                repeat(cols - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

private fun choiceCols(n: Int, room: Room, pictures: Boolean, longest: Int): Int = when {
    pictures -> if (room.wide) min(n, 4) else min(n, if (n == 3) 3 else 2)
    longest <= 12 -> if (room.wide) min(n, 4) else min(n, 2)
    longest <= 28 -> min(n, 2)
    else -> 1
}

// ---------------------------------------------------------------- choices

@Composable
private fun ChoiceInput(v: QView, value: JsonObject?, onChange: (JsonObject) -> Unit, tier: String, room: Room, locked: Boolean, reveal: Boolean) {
    val app = LocalApp.current
    val lang = WL.lang
    val q = v.q
    val sel = choiceIdOf(q, value)
    val pictures = q.type == "spoken" || q.choices.any { it.visual != null } || q.choices.all { pictureOnly(it.label.en) }
    val cols = choiceCols(q.choices.size, room, pictures, q.choices.maxOfOrNull { it.label.get(lang).length } ?: 0)
    val rows = ceil(q.choices.size / cols.toFloat()).toInt().coerceAtLeast(1)
    val cell = min((room.w.value - 10f * (cols - 1)) / cols, (room.h.value - 10f * (rows - 1)) / rows).coerceIn(56f, 240f).dp
    TileGrid(q.choices, cols) { c, m ->
        val right = reveal && v.choiceCorrect[c.id] == true
        val wrong = reveal && sel == c.id && !right
        ChoiceCard(
            onClick = {
                if (locked) return@ChoiceCard
                v.choiceResponses[c.id]?.let(onChange)
                if (tier == "early" || q.type == "spoken") app.say(c.label, lang)
            },
            modifier = m.then(if (pictures) Modifier.heightIn(min = cell) else Modifier).semantics { stateDescription = if (sel == c.id) "selected" else "" },
            state = when { right -> "right"; wrong -> "wrong"; sel == c.id -> "selected"; else -> null },
        ) {
            Box(contentAlignment = Alignment.TopEnd) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) { ChoiceBody(c, room, cell, pictures) }
            }
            if (right) Mark(true) else if (wrong) Mark(false)
        }
    }
}

@Composable
private fun MultiInput(v: QView, value: JsonObject?, onChange: (JsonObject) -> Unit, room: Room, locked: Boolean, reveal: Boolean) {
    val q = v.q
    val lang = WL.lang
    val sel = if (value.respKind == "multi") value.respList else emptyList()
    val pictures = q.choices.any { it.visual != null } || q.choices.all { pictureOnly(it.label.en) }
    val cols = choiceCols(q.choices.size, room, pictures, q.choices.maxOfOrNull { it.label.get(lang).length } ?: 0)
    val rows = ceil(q.choices.size / cols.toFloat()).toInt().coerceAtLeast(1)
    val cell = min((room.w.value - 10f * (cols - 1)) / cols, (room.h.value - 30f - 10f * (rows - 1)) / rows).coerceIn(56f, 220f).dp
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        HelpText(ls("tapAll"))
        TileGrid(q.choices, cols) { c, m ->
            val on = c.id in sel; val isC = c.id in v.multiCorrect
            val right = reveal && isC; val wrong = reveal && on && !isC
            ChoiceCard(
                onClick = { if (!locked) onChange(Resp.multi(if (on) sel - c.id else sel + c.id)) },
                modifier = m.then(if (pictures) Modifier.heightIn(min = cell) else Modifier),
                state = when { right -> "right"; wrong -> "wrong"; on -> "selected"; else -> null },
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Box(Modifier.size(26.dp).clip(RoundedCornerShape(7.dp)).background(if (on) WL.colors.primary else WL.colors.surface2).border(2.dp, WL.colors.primary, RoundedCornerShape(7.dp)), contentAlignment = Alignment.Center) {
                        if (on) Icon(Icons.Rounded.Check, null, tint = WL.colors.primaryInk, modifier = Modifier.size(20.dp))
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) { ChoiceBody(c, room, cell, pictures) }
                    if (right) Mark(true) else if (wrong) Mark(false)
                }
            }
        }
    }
}

// ---------------------------------------------------------------- match (tap left → right, or drag)

@Composable
private fun MatchInput(v: QView, value: JsonObject?, onChange: (JsonObject) -> Unit, room: Room, locked: Boolean, reveal: Boolean) {
    val q = v.q
    val pairs = if (value.respKind == "match") value.respMap else emptyMap()
    var sel by remember(q.id) { mutableStateOf<String?>(null) }
    val label = { id: String? -> q.right.firstOrNull { it.id == id }?.label }
    val lang = WL.lang
    val assign = { l: String, r: String -> if (!locked) { onChange(Resp.match(pairs + (l to r))); sel = null } }
    // drag support: remember each target's vertical position
    val targetTops = remember(q.id) { mutableMapOf<String, Pair<Float, Float>>() }
    var dragFrom by remember(q.id) { mutableStateOf<String?>(null) }
    var dragDy by remember { mutableFloatStateOf(0f) }
    var leftTop by remember { mutableFloatStateOf(0f) }
    var leftScale by remember { mutableFloatStateOf(1f) }
    var leftH by remember { mutableFloatStateOf(0f) }
    val rows = max(q.left.size, q.right.size).coerceAtLeast(1)
    val cell = ((room.h.value - 30f - 10f * (rows - 1)) / rows).coerceIn(52f, 120f).dp
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        HelpText(if (q.type == "drag") ls("dragHelp") else ls("matchHelp"))
        Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                q.left.forEach { l ->
                    val ok: Boolean? = if (reveal) pairs[l.id] == v.matchPairs[l.id] else null
                    var top by remember { mutableFloatStateOf(0f) }
                    var hRoot by remember { mutableFloatStateOf(0f) }
                    var scaleF by remember { mutableFloatStateOf(1f) }
                    val dragging = dragFrom == l.id
                    Column(Modifier.zIndex(if (dragging) 1f else 0f).offset { IntOffset(0, if (dragging) dragDy.roundToInt() else 0) }) {
                        ChoiceCard(
                            onClick = { if (!locked) sel = if (sel == l.id) null else l.id },
                            modifier = Modifier.fillMaxWidth().heightIn(min = cell)
                                .onGloballyPositioned { val b = it.boundsInRoot(); top = b.top; hRoot = b.height; scaleF = if (it.size.height > 0) b.height / it.size.height else 1f }
                                .pointerInput(q.id, locked) {
                                    if (locked) return@pointerInput
                                    detectDragGestures(
                                        onDragStart = { dragFrom = l.id; sel = l.id; dragDy = 0f; leftTop = top; leftScale = scaleF; leftH = hRoot },
                                        onDragEnd = {
                                            val y = leftTop + dragDy * leftScale + leftH / 2f
                                            targetTops.entries.firstOrNull { (_, r) -> y in r.first..r.second }?.let { assign(l.id, it.key) }
                                            dragFrom = null; dragDy = 0f
                                        },
                                        onDragCancel = { dragFrom = null; dragDy = 0f },
                                    ) { ch, d -> ch.consume(); dragDy += d.y }
                                },
                            state = when (ok) { true -> "right"; false -> "wrong"; else -> if (sel == l.id) "selected" else null },
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                if (l.visual != null) Visual(l.visual, (cell.value * 0.6f).dp, animate = false)
                                Column(Modifier.weight(1f, fill = false), horizontalAlignment = Alignment.CenterHorizontally) {
                                    EmojiText(L(l.label), style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center, color = WL.colors.text)
                                    pairs[l.id]?.let { EmojiText("→ ${label(it)?.get(lang) ?: ""}", style = MaterialTheme.typography.bodySmall, color = WL.colors.mathInk, textAlign = TextAlign.Center) }
                                }
                                if (ok != null) Mark(ok)
                                if (pairs[l.id] != null && !locked) IconBtn(Icons.Rounded.Close, ls("unmatch", "x" to L(l.label)), { onChange(Resp.match(pairs - l.id)) }, size = 32.dp)
                            }
                        }
                        if (reveal && ok == false) EmojiText("${ls("correctAnswer")}: ${label(v.matchPairs[l.id])?.get(lang) ?: ""}", style = MaterialTheme.typography.bodySmall, color = WL.colors.good)
                    }
                }
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                q.right.forEach { r ->
                    val used = q.left.filter { pairs[it.id] == r.id }
                    ChoiceCard(
                        onClick = { sel?.let { assign(it, r.id) } },
                        modifier = Modifier.fillMaxWidth().heightIn(min = cell).onGloballyPositioned { val b = it.boundsInRoot(); targetTops[r.id] = b.top to b.bottom },
                        state = if (sel != null && !locked) "selected" else null,
                        enabled = !locked,
                    ) {
                        if (r.visual != null) Visual(r.visual, (cell.value * 0.6f).dp, animate = false)
                        EmojiText(L(r.label), style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center, color = WL.colors.text)
                        if (used.isNotEmpty()) EmojiText("← ${used.joinToString(", ") { it.label.get(lang) }}", style = MaterialTheme.typography.bodySmall, color = WL.colors.mathInk, textAlign = TextAlign.Center)
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- order (arrows, or long-press and drag)

@Composable
private fun OrderInput(v: QView, value: JsonObject?, onChange: (JsonObject) -> Unit, room: Room, locked: Boolean, reveal: Boolean) {
    val q = v.q
    val ids = if (value.respKind == "order" && value.respList.isNotEmpty()) value.respList else v.initialOrder
    val lab = { id: String -> q.choices.firstOrNull { it.id == id } }
    var dragging by remember(q.id) { mutableStateOf<String?>(null) }
    var dy by remember { mutableFloatStateOf(0f) }
    var rowH by remember { mutableIntStateOf(1) }
    val gap = with(LocalDensity.current) { 8.dp.toPx() }
    val n = ids.size.coerceAtLeast(1)
    val h = ((room.h.value - 30f - 8f * (n - 1)) / n).coerceIn(48f, 96f).dp
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        HelpText(ls("orderHelp"))
        ids.forEachIndexed { i, id ->
            val ok: Boolean? = if (reveal) v.orderCorrect.getOrNull(i) == id else null
            val c = lab(id)
            val isDrag = dragging == id
            Row(
                Modifier.fillMaxWidth().heightIn(min = h).zIndex(if (isDrag) 1f else 0f)
                    .offset { IntOffset(0, if (isDrag) dy.roundToInt() else 0) }
                    .onSizeChanged { rowH = it.height }
                    .shadow(if (isDrag) 10.dp else 3.dp, RoundedCornerShape(16.dp))
                    .clip(RoundedCornerShape(16.dp))
                    .background(when (ok) { true -> WL.colors.goodBg; false -> WL.colors.badBg; else -> WL.colors.surface })
                    .border(BorderStroke(2.dp, when (ok) { true -> WL.colors.good; false -> WL.colors.bad; else -> if (isDrag) WL.colors.primary else WL.colors.line }), RoundedCornerShape(16.dp))
                    .pointerInput(q.id, locked, ids) {
                        if (locked) return@pointerInput
                        detectDragGesturesAfterLongPress(
                            onDragStart = { dragging = id; dy = 0f },
                            onDragEnd = {
                                val steps = (dy / (rowH + gap)).roundToInt()
                                val to = (i + steps).coerceIn(0, ids.size - 1)
                                if (to != i) { val m = ids.toMutableList(); val x = m.removeAt(i); m.add(to, x); onChange(Resp.order(m)) }
                                dragging = null; dy = 0f
                            },
                            onDragCancel = { dragging = null; dy = 0f },
                        ) { ch, d -> ch.consume(); dy += d.y }
                    }
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Box(Modifier.size(32.dp).clip(CircleShape).background(WL.colors.math), contentAlignment = Alignment.Center) { Text("${i + 1}", style = MaterialTheme.typography.titleMedium, color = WL.colors.mathInk) }
                if (!locked) Icon(Icons.Rounded.DragIndicator, null, tint = WL.colors.muted)
                c?.visual?.let { Visual(it, (h.value * 0.8f).dp, animate = false) }
                EmojiText(c?.let { L(it.label) } ?: id, Modifier.weight(1f), style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                if (ok != null) Mark(ok)
                if (!locked) {
                    IconBtn(Icons.Rounded.KeyboardArrowUp, ls("moveUp", "x" to (c?.label?.en ?: id)), {
                        if (i > 0) { val m = ids.toMutableList(); m[i] = ids[i - 1]; m[i - 1] = id; onChange(Resp.order(m)) }
                    }, size = 44.dp, enabled = i > 0)
                    IconBtn(Icons.Rounded.KeyboardArrowDown, ls("moveDown", "x" to (c?.label?.en ?: id)), {
                        if (i < ids.size - 1) { val m = ids.toMutableList(); m[i] = ids[i + 1]; m[i + 1] = id; onChange(Resp.order(m)) }
                    }, size = 44.dp, enabled = i < ids.size - 1)
                }
            }
        }
        val lang = WL.lang
        if (reveal && v.orderCorrect != ids) EmojiText("${ls("correctAnswer")}: ${v.orderCorrect.joinToString(" → ") { lab(it)?.label?.get(lang) ?: it }}", style = MaterialTheme.typography.bodyMedium, color = WL.colors.good)
    }
}

// ---------------------------------------------------------------- number line (tap / drag / buttons)

private fun parseRational(s: String): Double? {
    val t = s.trim().replace('−', '-')
    if (t.contains('/')) { val (a, b) = t.split('/', limit = 2); val n = a.trim().toDoubleOrNull(); val d = b.trim().toDoubleOrNull(); return if (n != null && d != null && d != 0.0) n / d else null }
    return t.toDoubleOrNull()
}

@Composable
private fun NumberLineInput(v: QView, value: JsonObject?, onChange: (JsonObject) -> Unit, room: Room, locked: Boolean, reveal: Boolean) {
    val labels = v.lineLabels
    val n = (labels.size - 1).coerceAtLeast(1)
    val line = v.q.line ?: LLine()
    val cur: Int? = if (value.respKind == "text" && value.respText.isNotBlank()) {
        labels.indexOf(value.respText).takeIf { it >= 0 } ?: parseRational(value.respText)?.let { ((it - line.from) / line.step).roundToInt().coerceIn(0, n) }
    } else null
    val set = { k: Int -> if (!locked) onChange(Resp.text(labels[k.coerceIn(0, n)])) }
    val every = ceil((n + 1) / 12.0).toInt()
    val tm = rememberTextMeasurer()
    val c = WL.colors
    val style = TextStyle(color = c.text, fontSize = 14.sp, fontWeight = FontWeight.Bold)
    val bold = style.copy(fontSize = 16.sp, fontWeight = FontWeight.ExtraBold)
    val lineHelp = ls("lineHelp")
    val good = c.good; val prim = c.primary; val surf = c.surface; val text = c.text
    Column(verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        HelpText(ls("lineHelp"))
        Canvas(
            Modifier.width(room.w).height(110.dp)
                .semantics { contentDescription = if (cur == null) lineHelp else "$lineHelp ${labels[cur]}" }
                .pointerInput(v.q.id, locked) {
                    if (locked) return@pointerInput
                    val pad = 28.dp.toPx()
                    fun idx(x: Float) = (((x - pad) / (size.width - 2 * pad)) * n).roundToInt().coerceIn(0, n)
                    detectTapGestures { set(idx(it.x)) }
                }
                .pointerInput(v.q.id, locked, "drag") {
                    if (locked) return@pointerInput
                    val pad = 28.dp.toPx()
                    fun idx(x: Float) = (((x - pad) / (size.width - 2 * pad)) * n).roundToInt().coerceIn(0, n)
                    detectDragGestures { ch, _ -> ch.consume(); set(idx(ch.position.x)) }
                },
        ) {
            val pad = 28.dp.toPx(); val y = size.height * 0.5f
            fun X(k: Int) = pad + k.toFloat() / n * (size.width - 2 * pad)
            drawLine(text, Offset(pad - 14f, y), Offset(size.width - pad + 14f, y), 4f, StrokeCap.Round)
            for (k in 0..n) {
                drawLine(text, Offset(X(k), y - 9f), Offset(X(k), y + 9f), 2.5f)
                if (k % every == 0 || k == n) { val r = tm.measure(labels[k], style); drawText(r, topLeft = Offset(X(k) - r.size.width / 2f, y + 16f)) }
            }
            if (reveal && v.lineCorrect != null) {
                drawCircle(good, 13f * density / 2.2f + 8f, Offset(X(v.lineCorrect), y), style = Stroke(5f))
                val r = tm.measure("✓ ${labels[v.lineCorrect]}", bold.copy(color = good)); drawText(r, topLeft = Offset(X(v.lineCorrect) - r.size.width / 2f, y - 22f - r.size.height))
            }
            if (cur != null) {
                drawCircle(surf, 15f, Offset(X(cur), y)); drawCircle(prim, 11f, Offset(X(cur), y))
                if (!(reveal && v.lineCorrect == cur)) { val r = tm.measure(labels[cur], bold); drawText(r, topLeft = Offset(X(cur) - r.size.width / 2f, y - 18f - r.size.height)) }
            }
        }
        if (!locked) Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
            IconBtn(Icons.Rounded.Remove, ls("lineLeft"), { set((cur ?: 1) - 1) }, size = 52.dp)
            Text(if (cur == null) "" else ls("lineValue", "v" to labels[cur]), style = MaterialTheme.typography.titleMedium, color = WL.colors.text, modifier = Modifier.widthIn(min = 120.dp), textAlign = TextAlign.Center)
            IconBtn(Icons.Rounded.Add, ls("lineRight"), { set(if (cur == null) 0 else cur + 1) }, size = 52.dp)
        }
    }
}

// ---------------------------------------------------------------- counting

@Composable
fun CountObjects(spec: JsonObject, room: Room, count: Int, key: String, locked: Boolean, onCount: (Int) -> Unit) {
    val app = LocalApp.current
    val emoji = spec.str("emoji") ?: "⭐"
    val n = (spec.int("count") ?: 0).coerceIn(0, 60)
    var tapped by rememberSaveable(key) { mutableStateOf((0 until min(count, n)).toList()) }
    val cols = when { n <= 4 -> n.coerceAtLeast(1); n <= 9 -> if (room.wide) min(n, 5) else 3; n <= 16 -> if (room.wide) 6 else 4; else -> if (room.wide) 8 else 5 }
    val rows = ceil(n / cols.toFloat()).toInt().coerceAtLeast(1)
    val cell = min((room.w.value - 8f * (cols - 1)) / cols, (room.h.value - 90f - 8f * (rows - 1)) / rows).coerceIn(40f, 120f).dp
    val reduce = LocalReduceMotion.current
    Column(verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        HelpText(ls("tapToCount"))
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            (0 until n).chunked(cols).forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    row.forEach { i ->
                        val order = tapped.indexOf(i)
                        val s by animateFloatAsState(if (order >= 0 && !reduce) 0.9f else 1f, label = "count")
                        Box(
                            Modifier.size(cell).clip(RoundedCornerShape(16.dp))
                                .background(if (order >= 0) WL.colors.goodBg else WL.colors.surface)
                                .border(2.dp, if (order >= 0) WL.colors.good else WL.colors.line, RoundedCornerShape(16.dp))
                                .pressable(!locked) {
                                    val was = i in tapped
                                    val next = if (was) tapped - i else tapped + i
                                    tapped = next
                                    onCount(next.size)
                                    if (!was) app.say(next.size.toString(), WL_LANG_EN)
                                }
                                .semantics { contentDescription = "$emoji ${i + 1}" },
                            contentAlignment = Alignment.Center,
                        ) {
                            Box(Modifier.size(cell * 0.78f * s)) { EmojiImage(emoji, cell * 0.78f * s) }
                            if (order >= 0) Box(Modifier.align(Alignment.TopEnd).padding(3.dp).size(24.dp).clip(CircleShape).background(WL.colors.good), contentAlignment = Alignment.Center) {
                                Text("${order + 1}", color = Color.White, style = MaterialTheme.typography.labelMedium)
                            }
                        }
                    }
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(ls("counted", "n" to tapped.size), style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
            if (!locked && tapped.isNotEmpty()) WLButton(ls("countAgain"), { tapped = emptyList(); onCount(0) }, icon = Icons.Rounded.Refresh, small = true)
        }
    }
}

private const val WL_LANG_EN = "en"

@Composable
private fun Stepper(n: Int, locked: Boolean, onChange: (Int) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
        IconBtn(Icons.Rounded.Remove, "-1", { onChange(max(0, n - 1)) }, size = 56.dp, enabled = !locked && n > 0)
        Text(ls("counted", "n" to n), style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
        IconBtn(Icons.Rounded.Add, "+1", { onChange(n + 1) }, size = 56.dp, enabled = !locked)
    }
}

// ---------------------------------------------------------------- typed answer + math keypad

private val KEY_TEXT = mapOf("frac" to "/", "dot" to ".", "minus" to "-", "pow" to "^", "sqrt" to "√(", "pi" to "π", "times" to "×", "div" to "÷", "open" to "(", "close" to ")", "space" to " ", "eq" to "=", "plus" to "+")
private val KEY_LABEL = mapOf("back" to "⌫", "clear" to "C", "minus" to "−", "dot" to ".", "frac" to "a/b", "space" to "␣", "pow" to "xⁿ", "sqrt" to "√", "pi" to "π", "times" to "×", "div" to "÷", "open" to "(", "close" to ")", "eq" to "=", "plus" to "+", "left" to "◀", "right" to "▶")
private val KEY_NAME = mapOf("back" to "Delete", "clear" to "Clear", "minus" to "Minus", "dot" to "Decimal point", "frac" to "Fraction bar", "space" to "Space (mixed number)", "pow" to "Power", "sqrt" to "Square root", "pi" to "Pi", "times" to "Times", "div" to "Divide", "open" to "Open bracket", "close" to "Close bracket", "eq" to "Equals", "plus" to "Plus", "left" to "Move left", "right" to "Move right")

/** The website's applyKey() for every key except units (units use the engine's unit parser). */
private fun applyKeyLocal(value: String, caretIn: Int, key: String): Pair<String, Int> {
    val caret = caretIn.coerceIn(0, value.length)
    return when (key) {
        "back" -> if (caret == 0) value to 0 else (value.substring(0, caret - 1) + value.substring(caret)) to caret - 1
        "clear" -> "" to 0
        "left" -> value to max(0, caret - 1)
        "right" -> value to min(value.length, caret + 1)
        else -> {
            val t = KEY_TEXT[key] ?: if (Regex("^[0-9a-zA-Z]$").matches(key)) key else ""
            if (t.isEmpty()) value to caret else (value.substring(0, caret) + t + value.substring(caret)) to caret + t.length
        }
    }
}

@Composable
fun TypedInput(
    value: String, onChange: (String) -> Unit, tier: String, room: Room, keypad: String?, rows: List<List<String>>, units: List<String>,
    answerKind: String, qid: String, locked: Boolean = false, onSubmit: (() -> Unit)? = null, label: String? = null, compact: Boolean = false,
) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val older = tier == "middle" || tier == "senior"
    val numeric = answerKind == "number" || answerKind == "fraction" || answerKind == "expression"
    var pad by rememberSaveable(qid, compact) { mutableStateOf(!compact && (keypad != null || numeric || (older && tier == "senior"))) }
    var caret by rememberSaveable(qid) { mutableIntStateOf(value.length) }
    if (caret > value.length) caret = value.length
    val press: (String) -> Unit = { key ->
        if (!locked) {
            if (key.startsWith("unit:")) scope.launch {
                LessonEngine(app.engine).applyKey(value, caret, key)?.let { caret = it.caret; onChange(it.value) }
            } else { val (v, c) = applyKeyLocal(value, caret, key); caret = c; onChange(v) }
        }
    }
    val c = WL.colors
    Column(verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.widthIn(max = max(room.w.value, 200f).dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            val fieldMod = Modifier.weight(1f).defaultMinSize(minHeight = if (compact) 48.dp else 58.dp).clip(RoundedCornerShape(14.dp))
                .background(if (locked) c.surface2 else c.surface).border(2.dp, if (locked) c.line else c.primary, RoundedCornerShape(14.dp))
            if (pad || locked) {
                // on-screen keypad: a read-only display with a visible caret
                Box(fieldMod.padding(horizontal = 14.dp, vertical = 10.dp).semantics { contentDescription = (label ?: lessonString("en", "typeAnswer")) + ": " + value }, contentAlignment = Alignment.CenterStart) {
                    if (value.isEmpty()) Text(label ?: ls("typeAnswer"), style = MaterialTheme.typography.titleLarge, color = c.muted)
                    else {
                        val before = value.substring(0, caret); val after = value.substring(caret)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(before, style = MaterialTheme.typography.headlineSmall, color = c.text)
                            if (!locked) Box(Modifier.width(2.dp).height(28.dp).background(c.primary))
                            Text(after, style = MaterialTheme.typography.headlineSmall, color = c.text)
                        }
                    }
                }
            } else {
                var tfv by remember(qid) { mutableStateOf(TextFieldValue(value, TextRange(value.length))) }
                if (tfv.text != value) tfv = TextFieldValue(value, TextRange(value.length))
                val fr = remember { FocusRequester() }
                BasicTextField(
                    tfv, { tfv = it; caret = it.selection.start; onChange(it.text) },
                    fieldMod.padding(horizontal = 14.dp, vertical = 14.dp).focusRequester(fr),
                    textStyle = MaterialTheme.typography.headlineSmall.copy(color = c.text),
                    singleLine = true, cursorBrush = SolidColor(c.primary),
                    keyboardOptions = KeyboardOptions(keyboardType = if (keypad == "numeric") KeyboardType.Decimal else KeyboardType.Text, imeAction = ImeAction.Done, autoCorrectEnabled = false),
                    keyboardActions = KeyboardActions(onDone = { onSubmit?.invoke() }),
                    decorationBox = { inner -> Box { if (tfv.text.isEmpty()) Text(label ?: ls("typeAnswer"), style = MaterialTheme.typography.titleLarge, color = c.muted); inner() } },
                )
                LaunchedEffect(qid) { if (!compact) runCatching { fr.requestFocus() } }
            }
            if (!locked && !compact) IconBtn(Icons.Rounded.Keyboard, ls("keypad"), { pad = !pad }, size = 48.dp, bg = if (pad) c.math else c.surface2)
        }
        if (!locked && units.isNotEmpty()) {
            UnitChips(units, value, press)
        }
        if (!locked && (pad || compact)) Keypad(rows, press, if (compact) null else onSubmit, room, compact)
        if (!locked && pad && !compact) {
            Text(ls("deviceKeyboard"), style = MaterialTheme.typography.labelMedium, color = c.mathInk, modifier = Modifier.clip(RoundedCornerShape(10.dp)).pressable { pad = false }.padding(6.dp))
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun UnitChips(units: List<String>, value: String, press: (String) -> Unit) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        units.forEach { u ->
            val on = Regex("\\s" + Regex.escape(u) + "$").containsMatchIn(value)
            Box(
                Modifier.defaultMinSize(minWidth = 44.dp, minHeight = 40.dp).clip(RoundedCornerShape(12.dp)).background(if (on) WL.colors.primary else WL.colors.surface2)
                    .pressable { press("unit:$u") }.padding(horizontal = 10.dp, vertical = 6.dp),
                contentAlignment = Alignment.Center,
            ) { Text(u, style = MaterialTheme.typography.labelLarge, color = if (on) WL.colors.primaryInk else WL.colors.text) }
        }
    }
}

@Composable
private fun Keypad(rows: List<List<String>>, press: (String) -> Unit, onSubmit: (() -> Unit)?, room: Room, compact: Boolean) {
    val maxCols = rows.maxOfOrNull { it.size } ?: 4
    val keyW = ((room.w.value - 6f * (maxCols - 1)) / maxCols).coerceIn(40f, if (compact) 56f else 76f).dp
    val keyH = (if (compact) 42.dp else 50.dp)
    val c = WL.colors
    Column(verticalArrangement = Arrangement.spacedBy(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        rows.forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                row.forEach { k ->
                    val fn = k == "back" || k == "clear"
                    Box(
                        Modifier.width(keyW).height(keyH).shadow(2.dp, RoundedCornerShape(12.dp)).clip(RoundedCornerShape(12.dp))
                            .background(if (fn) c.math else c.surface).pressable { press(k) }.semantics { contentDescription = KEY_NAME[k] ?: k },
                        contentAlignment = Alignment.Center,
                    ) {
                        if (k == "back") Icon(Icons.AutoMirrored.Rounded.Backspace, null, tint = c.mathInk)
                        else Text(KEY_LABEL[k] ?: k, style = MaterialTheme.typography.titleLarge, color = if (fn) c.mathInk else c.text)
                    }
                }
            }
        }
        if (onSubmit != null) WLButton(t("check"), onSubmit, kind = BtnKind.Primary, icon = Icons.Rounded.Check, modifier = Modifier.width(keyW * min(maxCols, 4) + 18.dp))
    }
}

