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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min

@Composable
fun PatternsBoard(b: BoardState) {
    val seq = b.view.j("seq").list()
    val options = b.view.j("options").list()
    val answerKey = b.view.j("answerKey").str()
    val unitLen = b.view.j("unitLength").int() ?: 0
    val blank = b.round.j("blank").int() ?: -1
    val choice = b.progress.j("choice").str()
    val showUnits = unitLen > 0 && b.hints >= 2
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val n = max(seq.size, 1)
        val perRow = if (maxWidth / n >= 52.dp) n else ceil(n / 2.0).toInt()
        val rows = ceil(n / perRow.toDouble()).toInt()
        val cell = min((maxWidth.value - 8) / perRow - 6, (maxHeight.value * 0.55f) / rows - 10).coerceIn(30f, 96f)
        val bw = maxWidth; val bh = maxHeight
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceEvenly, horizontalAlignment = Alignment.CenterHorizontally) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.semantics { contentDescription = if (b.lang == "te") "నమూనా" else "Pattern" }) {
                seq.chunked(perRow).forEachIndexed { r, row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        row.forEachIndexed { k, t ->
                            val i = r * perRow + k
                            val isBlank = i == blank && !b.solved
                            val unitStart = showUnits && i % unitLen == 0
                            val pop by animateFloatAsState(if (i == blank && b.solved) 1.12f else 1f, spring(dampingRatio = .35f), label = "pop")
                            Box(
                                Modifier.size(cell.dp).clip(RoundedCornerShape(14.dp))
                                    .background(if (isBlank) WL.colors.math else WL.colors.surface2)
                                    .border(if (isBlank) 3.dp else if (unitStart) 3.dp else 0.dp, if (isBlank) WL.colors.primary else if (unitStart) WL.colors.accent else Color.Transparent, RoundedCornerShape(14.dp))
                                    .scale(pop).padding(4.dp),
                                contentAlignment = Alignment.Center,
                            ) {
                                when {
                                    isBlank -> Text("?", fontSize = (cell * .5f).sp, fontWeight = FontWeight.Black, color = WL.colors.primary, modifier = Modifier.semantics { contentDescription = if (b.lang == "te") "ఖాళీ" else "missing" })
                                    t.j("token") != null -> ShapeArt(t.j("token").j("shape").str() ?: "circle", t.j("token").j("color").str() ?: "blue", (cell - 10).dp, label = t.j("name").loc(b.lang))
                                    else -> Text(t.j("text").str() ?: "", fontSize = (cell * .36f).coerceAtMost(30f).sp, fontWeight = FontWeight.ExtraBold, color = WL.colors.text, maxLines = 1)
                                }
                            }
                        }
                    }
                }
            }
            Text(b.view.j("question").loc(b.lang), style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
            val optSize = min((bw.value - 20) / max(options.size, 1) - 12, bh.value * 0.24f).coerceIn(56f, 104f)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                options.forEach { o ->
                    val key = o.j("key").str() ?: ""
                    val picked = choice == key
                    val right = picked && key == answerKey
                    val c = WL.colors
                    Box(
                        Modifier.size(optSize.dp).clip(RoundedCornerShape(18.dp)).background(if (!picked) c.surface else if (right) c.goodBg else c.badBg)
                            .border(3.dp, if (!picked) c.line else if (right) c.good else c.bad, RoundedCornerShape(18.dp))
                            .semantics { contentDescription = o.j("name").loc(b.lang).ifEmpty { o.j("text").str() ?: key } }
                            .pressable(!b.solved || picked) { if (!b.solved) b.act(action("choose", "key" to key)) },
                        contentAlignment = Alignment.Center,
                    ) {
                        if (o.j("token") != null) ShapeArt(o.j("token").j("shape").str() ?: "circle", o.j("token").j("color").str() ?: "blue", (optSize * .7f).dp)
                        else Text(o.j("text").str() ?: "", fontSize = (optSize * .34f).sp, fontWeight = FontWeight.Black, color = c.text)
                        if (picked) Icon(if (right) Icons.Rounded.Check else Icons.Rounded.Close, null, tint = if (right) c.good else c.bad, modifier = Modifier.align(Alignment.TopEnd).padding(3.dp).size(18.dp))
                    }
                }
            }
        }
    }
}
