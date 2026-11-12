package com.maheshglance.wonderlab.feature.games

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.ChoiceCard
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

@Composable
fun CountingBoard(b: BoardState) {
    if (b.round.j("kind").str() == "match") MatchBoard(b) else CountBoard(b)
}

/** Rows of `groupSize` pictures (tens frame style), sized to fit. */
@Composable
private fun Groups(emoji: String, n: Int, groupSize: Int, size: Dp) {
    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
        for (r in 0 until ceil(n / groupSize.toDouble()).toInt()) Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
            repeat(min(groupSize, n - r * groupSize)) { EmojiImage(emoji, size) }
        }
    }
}

@Composable
private fun MatchBoard(b: BoardState) {
    val target = b.round.j("target").int() ?: 0
    val groupSize = b.round.j("groupSize").int() ?: 5
    val groups = b.round.j("groups").list()
    val viewGroups = b.view.j("groups").list()
    val choice = b.progress.j("choice").int()
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val wide = maxWidth > maxHeight
        val numH = min(maxHeight.value * 0.22f, 96f).dp
        val content = @Composable { m: Modifier ->
            groups.forEachIndexed { i, g ->
                val n = g.j("n").int() ?: 0
                val right = viewGroups.getOrNull(i).j("right").bool() == true
                val state = if (choice == i) (if (right) "right" else "wrong") else null
                val name = viewGroups.getOrNull(i).j("name").loc(b.lang)
                val rows = ceil(n / groupSize.toDouble()).toInt()
                ChoiceCard({ if (!b.solved) b.act(action("chooseGroup", "i" to i)) }, m.semantics { contentDescription = "Group ${'A' + i}: $n $name" }, state = state, enabled = !b.solved || choice == i) {
                    BoxWithConstraints(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                        val cols = min(groupSize, n)
                        val s = min((maxWidth.value - 4) / max(cols, 1) - 2, (maxHeight.value - 4) / max(rows, 1) - 3).coerceIn(12f, 46f).dp
                        Groups(viewGroups.getOrNull(i).j("emoji").str() ?: "⭐", n, groupSize, s)
                    }
                    if (state != null) Icon(if (state == "right") Icons.Rounded.Check else Icons.Rounded.Close, null, tint = if (state == "right") WL.colors.good else WL.colors.bad)
                }
            }
        }
        Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("$target", fontSize = (numH.value * 0.8f).sp, fontWeight = FontWeight.Black, color = WL.colors.primary, modifier = Modifier.semantics { contentDescription = "Find $target" })
            if (wide) Row(Modifier.fillMaxWidth().weight(1f), horizontalArrangement = Arrangement.spacedBy(10.dp)) { content(Modifier.weight(1f).fillMaxSize()) }
            else Column(Modifier.fillMaxWidth().weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) { content(Modifier.weight(1f).fillMaxWidth()) }
        }
    }
}

@Composable
private fun CountBoard(b: BoardState) {
    val n = b.round.j("n").int() ?: 0
    val groupSize = b.round.j("groupSize").int() ?: 5
    val options = b.round.j("options").ints()
    val emoji = b.view.j("emoji").str() ?: "🍎"
    val name = b.view.j("name").loc(b.lang)
    val counted = b.progress.j("counted").ints()
    val choice = b.progress.j("choice").int()
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val wide = maxWidth > maxHeight * 1.25f
        val field = @Composable { m: Modifier ->
            BoxWithConstraints(m.clip(RoundedCornerShape(18.dp)).background(WL.colors.lab.copy(alpha = .55f)).padding(6.dp), contentAlignment = Alignment.Center) {
                val ratio = maxWidth.value / maxHeight.value.coerceAtLeast(1f)
                val cols = max(1, min(n, ceil(sqrt(n * ratio.toDouble())).toInt()))
                val rows = ceil(n / cols.toDouble()).toInt()
                val cell = min(maxWidth.value / cols, maxHeight.value / rows).coerceAtMost(110f)
                Column(verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
                    for (r in 0 until rows) Row {
                        for (c in 0 until cols) {
                            val i = r * cols + c
                            if (i >= n) { Box(Modifier.size(cell.dp)); continue }
                            val idx = counted.indexOf(i)
                            val done = idx >= 0
                            val sc by animateFloatAsState(if (done) 0.82f else 1f, spring(dampingRatio = .45f), label = "c")
                            Box(
                                Modifier.size(cell.dp).padding((cell * 0.06f).dp)
                                    .offset(y = (((i * 37) % 3) * 4 - 4).dp)
                                    .semantics { contentDescription = if (done) "$name ${idx + 1}, counted" else "$name, not counted yet" }
                                    .pressable(!done && !b.solved, sound = false) { b.act(action("tap", "i" to i)) },
                                contentAlignment = Alignment.Center,
                            ) {
                                EmojiImage(emoji, (cell * 0.84f).dp, Modifier.rotate((((i * 53) % 5) * 6 - 12).toFloat()).scale(sc).alpha(if (done) .45f else 1f))
                                if (done) Box(Modifier.align(Alignment.TopEnd).size((cell * .36f).coerceAtLeast(18f).dp).clip(CircleShape).background(WL.colors.primary), contentAlignment = Alignment.Center) {
                                    Text("${idx + 1}", color = WL.colors.primaryInk, fontSize = (cell * .2f).coerceIn(10f, 18f).sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
        val tray = @Composable { m: Modifier ->
            Row(m.clip(RoundedCornerShape(16.dp)).background(WL.colors.surface2).padding(8.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("$counted".let { counted.size.toString() }, fontSize = 34.sp, fontWeight = FontWeight.Black, color = WL.colors.primary, modifier = Modifier.semantics { contentDescription = "Counted so far: ${counted.size}" })
                BoxWithConstraints(Modifier.weight(1f)) {
                    val rows = max(1, ceil(n / groupSize.toDouble()).toInt())
                    val s = min((maxWidth.value / groupSize) - 3, 34f).coerceAtLeast(12f)
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        for (r in 0 until ceil(counted.size / groupSize.toDouble()).toInt()) Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                            counted.drop(r * groupSize).take(groupSize).forEachIndexed { k, _ ->
                                Box(contentAlignment = Alignment.BottomEnd) {
                                    EmojiImage(emoji, s.dp)
                                    Text("${r * groupSize + k + 1}", fontSize = (s * .34f).coerceAtLeast(8f).sp, color = WL.colors.muted, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                        @Suppress("UNUSED_EXPRESSION") rows
                    }
                }
            }
        }
        val answer = @Composable { m: Modifier ->
            Column(m, horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(b.view.j("question").loc(b.lang), style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    options.forEach { o ->
                        val picked = choice == o
                        val right = picked && o == n
                        NumberChoice("$o", picked, right, enabled = !b.solved || picked) { if (!b.solved) b.act(action("choose", "v" to o)) }
                    }
                }
            }
        }
        if (wide) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            field(Modifier.weight(1.4f).fillMaxSize())
            Column(Modifier.weight(1f).fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically)) { tray(Modifier.fillMaxWidth()); answer(Modifier.fillMaxWidth()) }
        } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            field(Modifier.weight(1f).fillMaxWidth())
            tray(Modifier.fillMaxWidth())
            answer(Modifier.fillMaxWidth())
        }
    }
}

/** Big number answer button with right / wrong state. */
@Composable
fun NumberChoice(text: String, picked: Boolean, right: Boolean, enabled: Boolean = true, size: Dp = 64.dp, onClick: () -> Unit) {
    val c = WL.colors
    val border = if (!picked) Color.Transparent else if (right) c.good else c.bad
    val bg = if (!picked) c.surface else if (right) c.goodBg else c.badBg
    Box(
        Modifier.size(size).clip(RoundedCornerShape(18.dp)).background(bg).border(3.dp, if (picked) border else c.line, RoundedCornerShape(18.dp))
            .pressable(enabled, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(text, fontSize = (size.value * 0.42f).sp, fontWeight = FontWeight.Black, color = c.text)
        if (picked) Icon(if (right) Icons.Rounded.Check else Icons.Rounded.Close, null, tint = border, modifier = Modifier.align(Alignment.TopEnd).padding(3.dp).size(18.dp))
    }
}
