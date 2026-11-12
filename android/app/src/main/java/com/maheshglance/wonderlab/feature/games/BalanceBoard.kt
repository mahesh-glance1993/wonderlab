package com.maheshglance.wonderlab.feature.games

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Undo
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.Remove
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import kotlinx.serialization.json.JsonElement
import kotlin.math.min

/** Website's formatOp (display only; the step itself is applied by the engine). */
private fun opText(kind: String, term: String, value: Int): String {
    val v = if (term == "x") (if (value == 1) "x" else "${value}x") else "$value"
    return when (kind) { "add" -> "add $v"; "sub" -> "subtract $v"; "mul" -> "multiply by $value"; else -> "divide by $value" }
}

private val GOLD = listOf(Color(0xFFF6D98A), Color(0xFFD9A441), Color(0xFF9C6B1E))

/** Pan contents: x boxes and unit weights when small and positive; otherwise the expression. */
private fun DrawScope.pan(center: Offset, w: Float, coef: Int, k: Int, expr: String, measurer: androidx.compose.ui.text.TextMeasurer, ink: Color) {
    val simple = coef in 0..6 && k in 0..12
    val baseY = center.y
    // pan dish
    val dish = Path().apply { moveTo(center.x - w / 2, baseY); quadraticTo(center.x, baseY + w * 0.28f, center.x + w / 2, baseY); close() }
    drawPath(dish, Brush.verticalGradient(GOLD, baseY, baseY + w * .14f))
    drawPath(dish, Color(0xFF6E4A12), style = Stroke(2.5f))
    if (!simple || (coef == 0 && k == 0)) {
        val lay = measurer.measure(if (coef == 0 && k == 0) "0" else expr, TextStyle(fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = ink))
        drawText(lay, topLeft = Offset(center.x - lay.size.width / 2f, baseY - lay.size.height - 4f))
        return
    }
    val items = List(coef) { true } + List(k) { false }
    val box = min(w / 6.5f, 34.dp.toPx())
    val perRow = maxOf(1, (w / (box + 3f)).toInt())
    items.forEachIndexed { i, isX ->
        val row = i / perRow; val col = i % perRow
        val inRow = minOf(perRow, items.size - row * perRow)
        val x = center.x - inRow * (box + 3f) / 2 + col * (box + 3f)
        val y = baseY - (row + 1) * (box + 3f)
        if (isX) {
            drawRoundRect(Color.Black.copy(alpha = .15f), Offset(x, y + 2f), Size(box, box), CornerRadius(6f))
            drawRoundRect(Brush.linearGradient(listOf(Color(0xFF8C82F0), Color(0xFF5145CD)), Offset(x, y), Offset(x + box, y + box)), Offset(x, y), Size(box, box), CornerRadius(6f))
            val lay = measurer.measure("x", TextStyle(fontSize = (box * .45f / density).sp, fontWeight = FontWeight.Black, color = Color.White))
            drawText(lay, topLeft = Offset(x + box / 2 - lay.size.width / 2f, y + box / 2 - lay.size.height / 2f))
        } else {
            val r = box * .42f
            val cc = Offset(x + box / 2, y + box / 2 + 2f)
            drawCircle(Color.Black.copy(alpha = .15f), r, cc + Offset(0f, 2f))
            drawCircle(Brush.radialGradient(listOf(Color(0xFFFFE9A8), Color(0xFFD9A441), Color(0xFF9C6B1E)), cc - Offset(r * .3f, r * .3f), r * 1.3f), r, cc)
            val lay = measurer.measure("1", TextStyle(fontSize = (r * .9f / density).sp, fontWeight = FontWeight.Black, color = Color(0xFF5A3A0A)))
            drawText(lay, topLeft = Offset(cc.x - lay.size.width / 2f, cc.y - lay.size.height / 2f))
        }
    }
}

@Composable
fun BalanceBoard(b: BoardState) {
    val eq = b.progress.j("eq")
    val a = eq.j("a").int() ?: 0; val bb = eq.j("b").int() ?: 0; val cc = eq.j("c").int() ?: 0; val d = eq.j("d").int() ?: 0
    val suggestion = b.view.j("suggestion")
    val steps = b.view.j("steps").list()
    val history = b.progress.j("history").list()
    var kind by rememberSaveable { mutableIntStateOf(0) } // 0 sub, 1 add, 2 div, 3 mul
    var term by rememberSaveable { mutableIntStateOf(0) } // 0 number, 1 x
    var value by rememberSaveable { mutableIntStateOf(1) }
    val kinds = listOf("sub", "add", "div", "mul")
    val kindStr = kinds[kind]
    val termStr = if (kindStr == "mul" || kindStr == "div" || term == 0) "k" else "x"
    val measurer = rememberTextMeasurer()
    val c = WL.colors
    val showSuggest = (b.variant == "guided" || b.hints >= 2) && suggestion != null && suggestion !is kotlinx.serialization.json.JsonNull && !b.solved

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val wide = maxWidth > maxHeight * 1.2f
        val scale = @Composable { m: Modifier ->
            Canvas(m.semantics { contentDescription = "Balanced scale: left ${b.view.j("left").str()}, right ${b.view.j("right").str()}" }) {
                val w = size.width; val h = size.height
                val beamY = h * 0.22f
                val panW = w * 0.4f
                val lx = w * 0.25f; val rx = w * 0.75f
                val panY = h * 0.86f
                // post + base
                drawRoundRect(Brush.horizontalGradient(listOf(Color(0xFF8A6A3A), Color(0xFFC59A5C), Color(0xFF8A6A3A)), w / 2 - 8f, w / 2 + 8f), Offset(w / 2 - 8f, beamY), Size(16f, h * .74f), CornerRadius(6f))
                drawRoundRect(Brush.verticalGradient(listOf(Color(0xFFC59A5C), Color(0xFF6B4E26)), h * .94f, h), Offset(w / 2 - w * .16f, h * .94f), Size(w * .32f, h * .06f), CornerRadius(10f))
                // beam (level: the scale always stays balanced)
                drawLine(Color.Black.copy(alpha = .15f), Offset(lx - 10f, beamY + 4f), Offset(rx + 10f, beamY + 4f), strokeWidth = 12f, cap = StrokeCap.Round)
                drawLine(Brush.verticalGradient(GOLD, beamY - 6f, beamY + 6f), Offset(lx - 10f, beamY), Offset(rx + 10f, beamY), strokeWidth = 12f, cap = StrokeCap.Round)
                drawCircle(Brush.radialGradient(GOLD, Offset(w / 2, beamY), 14f), 12f, Offset(w / 2, beamY))
                // strings
                for (x in listOf(lx, rx)) {
                    drawLine(Color(0xFF6E5A3A), Offset(x, beamY), Offset(x - panW / 2 + 6f, panY), strokeWidth = 2f)
                    drawLine(Color(0xFF6E5A3A), Offset(x, beamY), Offset(x + panW / 2 - 6f, panY), strokeWidth = 2f)
                }
                pan(Offset(lx, panY), panW, a, bb, b.view.j("left").str() ?: "", measurer, c.text)
                pan(Offset(rx, panY), panW, cc, d, b.view.j("right").str() ?: "", measurer, c.text)
                val lay = measurer.measure("⚖ balanced", TextStyle(fontSize = 12.sp, color = c.good, fontWeight = FontWeight.Bold))
                drawText(lay, topLeft = Offset(w / 2 - lay.size.width / 2f, beamY - lay.size.height - 10f))
            }
        }
        val builder = @Composable { m: Modifier ->
            Column(m, verticalArrangement = Arrangement.spacedBy(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                if (showSuggest) {
                    val sk = suggestion.j("kind").str() ?: "sub"; val st = suggestion.j("term").str() ?: "k"; val sv = suggestion.j("value").int() ?: 1
                    WLButton(b.view.j("suggestionText").str() ?: "", { b.act(action("apply", "op" to jsonOf("kind" to sk, "term" to st, "value" to sv))) }, icon = Icons.Rounded.Lightbulb, small = true)
                }
                Segmented(listOf(0 to "− subtract", 1 to "+ add", 2 to "÷ divide", 3 to "× multiply"), kind, { kind = it })
                if (kindStr == "add" || kindStr == "sub") Segmented(listOf(0 to "a number", 1 to "some x"), term, { term = it })
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconBtn(Icons.Rounded.Remove, "Smaller", { value = (value - 1).coerceAtLeast(1) }, size = 40.dp)
                    Text(if (termStr == "x") "${value}x" else "$value", style = MaterialTheme.typography.titleLarge, color = c.text, modifier = Modifier.width(52.dp).semantics { contentDescription = "Amount $value" }, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                    IconBtn(Icons.Rounded.Add, "Bigger", { value = (value + 1).coerceAtMost(99) }, size = 40.dp)
                    WLButton("", { b.act(action("undo")) }, icon = Icons.AutoMirrored.Rounded.Undo, enabled = !b.solved && history.isNotEmpty(), small = true)
                }
                WLButton("${opText(kindStr, termStr, value)} — both sides", { b.act(action("apply", "op" to jsonOf("kind" to kindStr, "term" to termStr, "value" to value))) }, kind = BtnKind.Primary, enabled = !b.solved, small = true)
            }
        }
        val stepList = @Composable { m: Modifier, maxShown: Int ->
            if (steps.isNotEmpty()) Column(m.clip(RoundedCornerShape(12.dp)).background(c.surface2).padding(horizontal = 8.dp, vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(1.dp)) {
                if (steps.size >= maxShown) Text("…", color = c.muted, style = MaterialTheme.typography.bodySmall)
                else Text(b.view.j("startText").str() ?: "", style = MaterialTheme.typography.bodySmall, color = c.text)
                steps.takeLast(maxShown).forEach { s: JsonElement ->
                    Text("${s.j("op").str()}  →  ${s.j("eq").str()}", style = MaterialTheme.typography.bodySmall, color = c.muted, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
        if (wide) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Column(Modifier.weight(1f).fillMaxHeight(), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(b.view.j("eqText").str() ?: "", fontSize = 26.sp, fontWeight = FontWeight.Black, color = c.text)
                scale(Modifier.weight(1f).fillMaxWidth())
                stepList(Modifier.fillMaxWidth(), 3)
            }
            builder(Modifier.weight(1f).fillMaxHeight().padding(top = 4.dp))
        } else Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(b.view.j("eqText").str() ?: "", fontSize = 26.sp, fontWeight = FontWeight.Black, color = c.text)
            scale(Modifier.weight(1f).fillMaxWidth())
            stepList(Modifier.fillMaxWidth(), 2)
            builder(Modifier.fillMaxWidth())
        }
    }
    @Suppress("UNUSED_EXPRESSION") Box(Modifier.height(0.dp))
}
