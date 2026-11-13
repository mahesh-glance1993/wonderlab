package com.maheshglance.wonderlab.feature.language

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Backspace
import androidx.compose.material.icons.automirrored.rounded.Undo
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.SpaceBar
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.ChoiceCard
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonPrimitive

/** Website util.ts tileText / telugu/script.ts showSign: a lone vowel sign is shown on a dotted circle. */
fun tileText(t: String, script: String): String = if (script == "te" && Regex("^[ా-్ంః]$").matches(t)) "◌$t" else t

/** Prompt, picture and "hear it" (website ItemView.tsx, top part). */
@Composable
fun ItemPrompt(r: LRoundEntry, script: String, gloss: Boolean, sayer: Sayer, reveal: Boolean, picSize: Dp) {
    val item = r.it
    var heard by remember(item.id) { mutableStateOf(false) }
    val listenOnly = item.type == "listen"
    val spoken = item.say ?: if (listenOnly) item.answer.firstOrNull() ?: "" else ""
    val canHear = script == "en" || sayer.teVoice()
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            LT(item.prompt, script, Modifier.weight(1f), style = MaterialTheme.typography.headlineSmall, weight = FontWeight.Bold)
            SpeakButton({ sayer.say(item.prompt, script, item.en) }, size = 44.dp)
        }
        Gloss(gloss, item.en)
        if (item.pic != null || listenOnly || spoken.isNotEmpty()) {
            FlowRowCompat {
                item.pic?.let { EmojiImage(it, picSize, label = item.picLabel ?: "picture") }
                if (spoken.isNotEmpty()) WLButton(if (listenOnly) "Play the sound" else "Hear the word", { sayer.say(spoken, script); heard = true },
                    icon = Icons.AutoMirrored.Rounded.VolumeUp, kind = if (listenOnly) BtnKind.Primary else BtnKind.Normal)
                if (listenOnly && (!canHear || reveal)) Row(
                    Modifier.clip(RoundedCornerShape(999.dp)).background(WL.colors.surface2).padding(horizontal = 12.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) { Text("Read it: ", style = MaterialTheme.typography.labelLarge, color = WL.colors.text); LT(spoken, script, style = MaterialTheme.typography.titleMedium, weight = FontWeight.Bold) }
                if (listenOnly && canHear && !reveal && heard) Text("Tap Play again to hear it once more.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FlowRowCompat(content: @Composable () -> Unit) {
    FlowRow(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally), verticalArrangement = Arrangement.spacedBy(8.dp), itemVerticalAlignment = Alignment.CenterVertically) { content() }
}

/** The input for the item's type (website ItemView.tsx Input). */
@Composable
fun ItemInput(
    r: LRoundEntry, script: String, value: JsonElement?, onChange: (JsonElement) -> Unit,
    locked: Boolean, reveal: Boolean, eliminated: List<String>, gloss: Boolean, typing: Boolean, width: Dp, picSize: Dp,
) {
    val item = r.it
    when {
        item.isTiles -> Tiles(r, script, value.asTiles(), { onChange(tilesValue(it)) }, locked, reveal)
        item.type == "type" && typing -> Typed(r, script, value.asText() ?: "", { onChange(JsonPrimitive(it)) }, locked, reveal)
        else -> Choices(r, script, value.asText(), { onChange(JsonPrimitive(it)) }, locked, reveal, eliminated, gloss, width, picSize)
    }
}

@Composable
private fun Choices(r: LRoundEntry, script: String, value: String?, onChange: (String) -> Unit, locked: Boolean, reveal: Boolean, eliminated: List<String>, gloss: Boolean, width: Dp, picSize: Dp) {
    val item = r.it
    val choices = r.choices
    val pics = if (item.picChoices) item.pics else null
    val n = choices.size
    val maxLen = choices.maxOfOrNull { it.length } ?: 0
    val cols = when {
        pics != null -> if (n <= 4 && width >= 440.dp) n else if (n <= 3) n else 2
        maxLen > 24 -> if (width >= 640.dp) 2 else 1
        maxLen > 10 -> if (width >= 640.dp && n % 3 == 0) 3 else 2
        else -> if (width >= 480.dp) minOf(n, 4) else 2
    }.coerceAtLeast(1)
    val picS = minOf(picSize * 0.85f, (width / cols) * 0.6f)
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        choices.chunked(cols).forEach { row ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                row.forEach { c ->
                    val chosen = value == c
                    val right = c in item.answer
                    val gone = c in eliminated
                    val state = if (reveal) (if (right) "right" else if (chosen) "wrong" else null) else if (chosen) "selected" else null
                    ChoiceCard({ onChange(c) }, Modifier.weight(1f).alpha(if (gone) 0.35f else 1f), state = state, enabled = !locked && !gone) {
                        if (pics != null) {
                            EmojiImage(pics[c] ?: "❓", picS, label = if (gloss || reveal) c + (item.gloss[c]?.let { " ($it)" } ?: "") else item.gloss[c] ?: "picture")
                            if (reveal || gloss) LT(c, script, style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center)
                        } else {
                            LT(c, script, style = MaterialTheme.typography.titleLarge.let { if (gone) it.copy(textDecoration = TextDecoration.LineThrough) else it }, textAlign = TextAlign.Center, weight = FontWeight.Bold)
                            if (gloss) item.gloss[c]?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, textAlign = TextAlign.Center) }
                        }
                        if (reveal && right) Text("✓ Correct", style = MaterialTheme.typography.labelMedium, color = WL.colors.good)
                        if (reveal && chosen && !right) Text("✗ Your answer", style = MaterialTheme.typography.labelMedium, color = WL.colors.bad)
                    }
                }
                repeat(cols - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun Tiles(r: LRoundEntry, script: String, seq: List<String>, onChange: (List<String>) -> Unit, locked: Boolean, reveal: Boolean) {
    val item = r.it
    val choices = r.choices
    // tiles may repeat ("the" twice): mark the first N identical tiles as used (website ItemView.tsx Tiles)
    val usedCount = seq.groupingBy { it }.eachCount()
    val seen = mutableMapOf<String, Int>()
    val used = choices.map { t -> seen[t] = (seen[t] ?: 0) + 1; seen[t]!! <= (usedCount[t] ?: 0) }
    val joiner = if (item.type == "build") "" else " "
    val show = { t: String -> r.display[t] ?: tileText(t, script) }
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        FlowRow(
            Modifier.fillMaxWidth().defaultMinSize(minHeight = 60.dp).clip(RoundedCornerShape(16.dp))
                .background(if (reveal) WL.colors.goodBg else WL.colors.surface2)
                .border(2.dp, WL.colors.line, RoundedCornerShape(16.dp)).padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp), itemVerticalAlignment = Alignment.CenterVertically,
        ) {
            if (seq.isEmpty()) Text(if (item.type == "build") "Tap the pieces in order." else "Tap the words in order.", Modifier.padding(8.dp), color = WL.colors.muted, style = MaterialTheme.typography.bodyLarge)
            seq.forEachIndexed { i, t -> LKeyBtn(show(t), script, { onChange(seq.filterIndexed { j, _ -> j != i }) }, enabled = !locked, selected = true, minSize = 48.dp) }
            if (item.type == "build" && seq.isNotEmpty()) LT("= " + seq.joinToString(joiner), script, Modifier.padding(horizontal = 8.dp), style = MaterialTheme.typography.headlineSmall, color = WL.colors.primary, weight = FontWeight.Bold)
        }
        FlowRow(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            choices.forEachIndexed { i, t -> LKeyBtn(show(t), script, { onChange(seq + t) }, enabled = !locked && !used[i], minSize = 52.dp, modifier = Modifier.alpha(if (used[i]) 0.4f else 1f)) }
        }
        if (!locked && seq.isNotEmpty()) Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            WLButton("Undo", { onChange(seq.dropLast(1)) }, small = true, icon = Icons.AutoMirrored.Rounded.Undo)
            WLButton("Clear", { onChange(emptyList()) }, small = true, kind = BtnKind.Ghost, icon = Icons.Rounded.Refresh)
        }
        if (reveal) AnswerPill(item.answer.joinToString(joiner), script)
    }
}

@Composable
private fun AnswerPill(text: String, script: String) {
    Row(Modifier.clip(RoundedCornerShape(999.dp)).background(WL.colors.surface2).padding(horizontal = 14.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Text("Answer: ", style = MaterialTheme.typography.labelLarge, color = WL.colors.text)
        LT(text, script, style = MaterialTheme.typography.titleMedium, weight = FontWeight.Bold)
    }
}

@Composable
private fun Typed(r: LRoundEntry, script: String, v: String, onChange: (String) -> Unit, locked: Boolean, reveal: Boolean) {
    val item = r.it
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Type your answer", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
        if (script == "te") {
            // on-screen Telugu keyboard instead of the system one (website inputMode="none")
            Box(
                Modifier.fillMaxWidth().defaultMinSize(minHeight = 56.dp).clip(RoundedCornerShape(14.dp)).background(WL.colors.paper)
                    .border(2.dp, WL.colors.line, RoundedCornerShape(14.dp)).padding(horizontal = 14.dp, vertical = 8.dp),
                contentAlignment = Alignment.CenterStart,
            ) { LT(v.ifEmpty { " " }, "te", style = MaterialTheme.typography.headlineSmall, color = WL.colors.ink) }
            if (!locked) TeluguKeyboard(
                onKey = { onChange(v + it) },
                onBackspace = { if (v.isNotEmpty()) onChange(v.substring(0, v.length - (if (v.length >= 2 && v[v.length - 1].isLowSurrogate() && v[v.length - 2].isHighSurrogate()) 2 else 1))) },
                onSpace = { onChange("$v ") },
            )
        } else {
            OutlinedTextField(
                v, onChange, Modifier.fillMaxWidth(), enabled = !locked, singleLine = true,
                textStyle = MaterialTheme.typography.headlineSmall.copy(fontFamily = scriptFont(script)),
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.None, autoCorrectEnabled = false),
            )
        }
        if (reveal) AnswerPill(item.answer.firstOrNull() ?: "", script)
    }
}

/** On-screen Telugu letter keyboard (website TeluguKeyboard.tsx): అచ్చులు, హల్లులు, గుణింతం signs, పొల్లు. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TeluguKeyboard(onKey: (String) -> Unit, onBackspace: () -> Unit, onSpace: () -> Unit) {
    val b = rememberBuilders() ?: return
    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(WL.colors.surface2).padding(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        b.keyboard.forEach { row ->
            FlowRow(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                row.forEach { k -> LKeyBtn(k.show, "te", { onKey(k.key) }, minSize = 40.dp, label = null) }
            }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally)) {
            KbdWide("Space", Icons.Rounded.SpaceBar, onSpace)
            KbdWide("Delete last character", Icons.AutoMirrored.Rounded.Backspace, onBackspace)
        }
    }
}

@Composable
private fun KbdWide(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Box(
        Modifier.width(110.dp).defaultMinSize(minHeight = 44.dp).clip(RoundedCornerShape(12.dp)).background(WL.colors.paper)
            .border(2.dp, WL.colors.line, RoundedCornerShape(12.dp)).pressable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Icon(icon, label, tint = WL.colors.ink) }
}

private var buildersCache: LBuilders? = null

@Composable
fun rememberBuilders(): LBuilders? {
    buildersCache?.let { return it }
    val l = rememberEngine<LBuilders>("language.builders")
    return (l as? Loadable.Ready)?.value?.also { buildersCache = it }
}

