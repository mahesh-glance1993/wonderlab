package com.maheshglance.wonderlab.feature.games

import androidx.compose.animation.core.Animatable
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.PanTool
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import kotlinx.serialization.json.JsonElement
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

@Composable
private fun CardFace(c: JsonElement, w: Dp, h: Dp) {
    val kind = c.j("kind").str()
    val num = c.j("num").int() ?: 0
    val den = c.j("den").int() ?: 1
    when (kind) {
        "bar", "circle" -> FracPicture(kind, num, den, min(w.value * 0.9f, if (kind == "bar") h.value * 3.2f else h.value * 1.4f).dp)
        "frac" -> Column(horizontalAlignment = Alignment.CenterHorizontally) {
            val fs = (h.value * 0.3f).coerceIn(14f, 30f).sp
            Text("$num", fontSize = fs, fontWeight = FontWeight.Black, color = WL.colors.text)
            HorizontalDivider(Modifier.width((h.value * 0.5f).coerceAtLeast(24f).dp), thickness = 3.dp, color = WL.colors.text)
            Text("$den", fontSize = fs, fontWeight = FontWeight.Black, color = WL.colors.text)
        }
        else -> Text(c.j("text").str() ?: "", fontSize = (h.value * 0.36f).coerceIn(14f, 32f).sp, fontWeight = FontWeight.Black, color = WL.colors.text)
    }
}

@Composable
fun FractionsBoard(b: BoardState) {
    val left = b.round.j("left").list()
    val right = b.round.j("right").list()
    val matched = b.progress.j("matched").list().map { it.strs() }
    val selL = b.progress.j("selL").str()
    val selR = b.progress.j("selR").str()
    val wrong = b.progress.j("wrong").strs()
    val spoken = b.view.j("spoken").obj()
    fun isMatched(id: String?) = matched.any { it.contains(id) }
    val pairs = left.size
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val wide = maxWidth > maxHeight * 1.3f
        val col = @Composable { cards: List<JsonElement>, side: String, m: Modifier ->
            BoxWithConstraints(m) {
                val gap = 6.dp
                val colW = maxWidth
                val h = ((maxHeight - gap * (pairs - 1)) / pairs).coerceAtMost(110.dp)
                Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(gap)) {
                    cards.filter { !isMatched(it.j("id").str()) }.forEach { c ->
                        val id = c.j("id").str() ?: ""
                        val sel = (if (side == "L") selL else selR) == id
                        val isWrong = wrong.contains(id)
                        val shake = remember(id) { Animatable(0f) }
                        LaunchedEffect(isWrong, b.progress) { if (isWrong && !b.reduceMotion) { for (x in listOf(10f, -8f, 6f, -4f, 0f)) shake.animateTo(x) } }
                        Box(
                            Modifier.fillMaxWidth().height(h).offset { IntOffset(shake.value.roundToInt(), 0) }
                                .shadow(4.dp, RoundedCornerShape(16.dp), clip = false).clip(RoundedCornerShape(16.dp))
                                .background(if (isWrong) WL.colors.badBg else WL.colors.surface)
                                .border(3.dp, if (sel) WL.colors.primary else if (isWrong) WL.colors.bad else WL.colors.line, RoundedCornerShape(16.dp))
                                .semantics { contentDescription = spoken[id].str() ?: "" }
                                .pressable(!b.solved) { b.act(action("pick", "side" to side, "id" to id)) }.padding(4.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            CardFace(c, colW - 12.dp, h - 8.dp)
                            if (sel) Icon(Icons.Rounded.PanTool, null, tint = WL.colors.primary, modifier = Modifier.align(Alignment.TopEnd).size(18.dp))
                            if (isWrong) Icon(Icons.Rounded.Close, null, tint = WL.colors.bad, modifier = Modifier.align(Alignment.TopEnd).size(18.dp))
                        }
                    }
                }
            }
        }
        val done = @Composable { m: Modifier ->
            BoxWithConstraints(m.clip(RoundedCornerShape(16.dp)).background(WL.colors.goodBg.copy(alpha = .6f)).padding(4.dp)) {
                val doneW = maxWidth
                if (matched.isNotEmpty()) {
                    val n = max(matched.size, 1)
                    val rowH = ((maxHeight - 4.dp * (n - 1)) / n).coerceIn(20.dp, 80.dp)
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.semantics { contentDescription = if (b.lang == "te") "జత అయినవి" else "Matched pairs" }) {
                        matched.forEach { pr ->
                            val a = left.firstOrNull { it.j("id").str() == pr.getOrNull(0) } ?: return@forEach
                            val c2 = right.firstOrNull { it.j("id").str() == pr.getOrNull(1) } ?: return@forEach
                            Row(Modifier.fillMaxWidth().height(rowH), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally)) {
                                Box(Modifier.weight(1f).fillMaxHeight(), contentAlignment = Alignment.Center) { CardFace(a, (doneW - 40.dp) / 2, rowH) }
                                Text("=", fontWeight = FontWeight.Black, color = WL.colors.good, fontSize = 20.sp)
                                Box(Modifier.weight(1f).fillMaxHeight(), contentAlignment = Alignment.Center) { CardFace(c2, (doneW - 40.dp) / 2, rowH) }
                                Icon(Icons.Rounded.Check, "${spoken[a.j("id").str()].str()} equals ${spoken[c2.j("id").str()].str()}", tint = WL.colors.good, modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }
            }
        }
        if (wide) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            col(left, "L", Modifier.weight(1f).fillMaxHeight())
            col(right, "R", Modifier.weight(1f).fillMaxHeight())
            if (matched.isNotEmpty()) done(Modifier.weight(1.1f).fillMaxHeight())
        } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(Modifier.fillMaxWidth().weight(1f), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                col(left, "L", Modifier.weight(1f).fillMaxHeight())
                col(right, "R", Modifier.weight(1f).fillMaxHeight())
            }
            if (matched.isNotEmpty()) done(Modifier.fillMaxWidth().weight(0.32f + 0.5f * matched.size / max(pairs, 1)))
        }
    }
}

@Suppress("unused") private val unusedPad = Modifier.padding(0.dp)
