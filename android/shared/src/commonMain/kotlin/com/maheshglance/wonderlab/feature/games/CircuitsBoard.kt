package com.maheshglance.wonderlab.feature.games

import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
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
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import kotlinx.serialization.json.JsonElement
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

@Composable
fun CircuitsBoard(b: BoardState) {
    when (b.round.j("kind").str()) {
        "circuit" -> CircuitView(b)
        "force" -> ForceView(b)
        "mirror" -> MirrorView(b)
        else -> NumericView(b)
    }
}

// ---------------------------------------------------------------- circuit
@Composable
private fun CircuitView(b: BoardState) {
    val main = b.round.j("main").list()
    val branches = b.round.j("branches").list().map { it.list() }
    val targetOn = b.round.j("targetOn").strs()
    val mustOff = b.round.j("mustOff").strs()
    val closed = b.progress.j("closed").strs().toSet()
    val lit = b.view.j("lit").strs().toSet()
    val short = b.view.j("short").bool() == true
    val measurer = rememberTextMeasurer()
    val c = WL.colors
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(b.view.j("question").str() ?: "", style = MaterialTheme.typography.titleMedium, color = c.text)
        BoxWithConstraints(Modifier.fillMaxWidth().weight(1f)) {
            val W = constraints.maxWidth.toFloat(); val H = constraints.maxHeight.toFloat()
            val left = W * 0.14f; val right = W * 0.96f
            val top = H * 0.16f; val bottom = H * 0.94f
            val nb = max(branches.size, 1)
            val bx = List(branches.size) { i -> left + (right - left) * (i + 0.7f) / (nb + 0.2f) }
            // positions of components (centre) for drawing and hit areas
            data class Spot(val comp: JsonElement, val at: Offset, val vertical: Boolean)
            val spots = mutableListOf<Spot>()
            val firstX = bx.firstOrNull() ?: right
            main.forEachIndexed { i, comp -> spots += Spot(comp, Offset(left + (firstX - left) * (i + 1) / (main.size + 1), top), false) }
            branches.forEachIndexed { i, br -> br.forEachIndexed { k, comp -> spots += Spot(comp, Offset(bx[i], top + (bottom - top) * (k + 1) / (br.size + 1)), true) } }
            val unit = min(W / (nb * 4.2f), H / 9f).coerceIn(14f, 46f)
            Canvas(Modifier.fillMaxSize().semantics { contentDescription = "Circuit" }) {
                val wire = c.text.copy(alpha = .85f)
                val sw = 4.dp.toPx()
                // battery on the left: + at top, − at bottom
                drawLine(wire, Offset(left, top), Offset(bx.lastOrNull() ?: right, top), strokeWidth = sw, cap = StrokeCap.Round)
                drawLine(wire, Offset(left, bottom), Offset(bx.lastOrNull() ?: right, bottom), strokeWidth = sw, cap = StrokeCap.Round)
                drawLine(wire, Offset(left, top), Offset(left, bottom), strokeWidth = sw)
                bx.forEach { x -> drawLine(wire, Offset(x, top), Offset(x, bottom), strokeWidth = sw) }
                val cellH = unit * 2.4f
                rotateCell(Offset(left, (top + bottom) / 2), unit, cellH)
                val plus = measurer.measure("+", TextStyle(fontSize = 16.sp, fontWeight = FontWeight.Black, color = c.text))
                drawText(plus, topLeft = Offset(left - unit * 1.6f, (top + bottom) / 2 - cellH / 2 - plus.size.height))
                val minus = measurer.measure("−", TextStyle(fontSize = 16.sp, fontWeight = FontWeight.Black, color = c.text))
                drawText(minus, topLeft = Offset(left - unit * 1.6f, (top + bottom) / 2 + cellH / 2))
                spots.forEach { s ->
                    val id = s.comp.j("id").str() ?: ""
                    if (s.comp.j("type").str() == "switch") {
                        val half = unit * 0.9f
                        val a = if (s.vertical) Offset(s.at.x, s.at.y + half) else Offset(s.at.x - half, s.at.y)
                        val e = if (s.vertical) Offset(s.at.x, s.at.y - half) else Offset(s.at.x + half, s.at.y)
                        drawRoundRect(c.surface, s.at - Offset(half * 1.15f, half * 1.15f), Size(half * 2.3f, half * 2.3f), CornerRadius(10f))
                        drawRoundRect(if (id in closed) c.good else c.line, s.at - Offset(half * 1.15f, half * 1.15f), Size(half * 2.3f, half * 2.3f), CornerRadius(10f), style = Stroke(2.5f))
                        drawSwitch(a, e, id in closed, w = unit * .18f)
                    } else {
                        drawCircle(c.surface, unit * 0.95f, s.at)
                        drawBulb(s.at - Offset(0f, unit * .15f), unit * 0.7f, id in lit)
                        if (id in targetOn) drawCircle(Color(0xFFF6C344), unit * .22f, s.at + Offset(unit * 1.05f, -unit * .9f))
                        if (id in mustOff) drawLine(c.bad, s.at + Offset(unit * .8f, -unit * 1.1f), s.at + Offset(unit * 1.3f, -unit * .6f), strokeWidth = 4f)
                    }
                    val lab = measurer.measure("$id${if (s.comp.j("type").str() == "bulb") if (id in lit) " ON" else " off" else ""}", TextStyle(fontSize = 11.sp, fontWeight = FontWeight.Bold, color = c.muted))
                    drawText(lab, topLeft = Offset(s.at.x + unit * 1.1f, s.at.y - lab.size.height / 2f + if (s.vertical) unit * .3f else unit * 1.4f))
                }
                branches.forEachIndexed { i, br ->
                    if (br.none { it.j("type").str() == "bulb" }) {
                        val t = measurer.measure("plain wire", TextStyle(fontSize = 10.sp, color = c.muted))
                        drawText(t, topLeft = Offset(bx[i] + 6f, bottom - t.size.height - 6f))
                    }
                }
                if (short) drawLine(c.bad, Offset(left, bottom), Offset(bx.lastOrNull() ?: right, bottom), strokeWidth = sw, pathEffect = PathEffect.dashPathEffect(floatArrayOf(14f, 10f)))
            }
            // tap targets for switches
            spots.filter { it.comp.j("type").str() == "switch" }.forEach { s ->
                val id = s.comp.j("id").str() ?: ""
                val half = (unit * 1.3f).coerceAtLeast(26f * 2.6f / 2)
                Box(
                    Modifier.offset { IntOffset((s.at.x - half).roundToInt(), (s.at.y - half).roundToInt()) }
                        .size(with(androidx.compose.ui.platform.LocalDensity.current) { (half * 2).toDp() })
                        .semantics { contentDescription = "$id ${if (id in closed) "closed" else "open"}" }
                        .pressable(!b.solved) { b.act(action("toggle", "id" to id)) },
                )
            }
            if (targetOn.isNotEmpty()) Row(Modifier.align(Alignment.TopEnd), verticalAlignment = Alignment.CenterVertically) {
                Text("● must light   ", color = Color(0xFFD9A441), style = MaterialTheme.typography.labelSmall)
                if (mustOff.isNotEmpty()) Text("╲ must stay off", color = c.bad, style = MaterialTheme.typography.labelSmall)
            }
        }
        if (short) AlertBox("Short circuit — current skips the bulbs!", AlertKind.Warn)
        WLButton("Check", { b.act(action("check")) }, icon = Icons.Rounded.Check, kind = BtnKind.Primary, enabled = !b.solved, small = true)
    }
}

private fun androidx.compose.ui.graphics.drawscope.DrawScope.rotateCell(center: Offset, unit: Float, h: Float) {
    // a vertical cell: draw the horizontal cell rotated 90° (+ terminal at the top)
    val w = unit * 1.3f
    drawRoundRect(Color.Black.copy(alpha = .15f), Offset(center.x - w / 2 + 2f, center.y - h / 2 + 3f), Size(w, h), CornerRadius(w * .25f))
    drawRoundRect(Brush.horizontalGradient(listOf(Color(0xFF2A2D35), Color(0xFF6B7080), Color(0xFF2A2D35)), center.x - w / 2, center.x + w / 2), Offset(center.x - w / 2, center.y - h / 2), Size(w, h), CornerRadius(w * .25f))
    drawRoundRect(Brush.horizontalGradient(listOf(Color(0xFFB9761F), Color(0xFFF6D365), Color(0xFFB9761F)), center.x - w / 2, center.x + w / 2), Offset(center.x - w / 2, center.y - h / 2), Size(w, h * .38f), CornerRadius(w * .25f))
    drawRoundRect(Color(0xFF9EA4B0), Offset(center.x - w * .2f, center.y - h / 2 - h * .08f), Size(w * .4f, h * .09f), CornerRadius(3f))
}

// ---------------------------------------------------------------- shared answer input
@Composable
private fun NumberAnswer(b: BoardState, label: String) {
    var text by rememberSaveable(b.round.toString()) { mutableStateOf(b.progress.j("text").str() ?: "") }
    val submit = { if (text.isNotBlank()) b.act(action("submit", "text" to text)) }
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedTextField(
            text, { text = it }, Modifier.weight(1f), enabled = !b.solved, singleLine = true, label = { Text(label, maxLines = 1) },
            keyboardOptions = KeyboardOptions(keyboardType = if (b.allowTyping) KeyboardType.Text else KeyboardType.Decimal, imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { submit() }),
        )
        WLButton("Check", { submit() }, icon = Icons.Rounded.Check, kind = BtnKind.Primary, enabled = !b.solved && text.isNotBlank(), small = true)
    }
}

@Composable
private fun OptionRow(options: List<String>, label: (String) -> String, picked: String?, answer: String?, b: BoardState, onPick: (String) -> Unit, glyph: (@Composable (String) -> Unit)? = null) {
    val c = WL.colors
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val perRow = if (maxWidth < 420.dp && options.size > 2) 2 else options.size
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            options.chunked(perRow).forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    row.forEach { o ->
                        val p = picked == o
                        val right = p && o == answer
                        Row(
                            Modifier.weight(1f).clip(RoundedCornerShape(16.dp)).background(if (!p) c.surface2 else if (right) c.goodBg else c.badBg)
                                .border(3.dp, if (!p) Color.Transparent else if (right) c.good else c.bad, RoundedCornerShape(16.dp))
                                .pressable(!b.solved || p) { if (!b.solved) onPick(o) }.padding(horizontal = 10.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally),
                        ) {
                            glyph?.invoke(o)
                            Text(label(o), style = MaterialTheme.typography.labelLarge, color = c.text)
                            if (p) Icon(if (right) Icons.Rounded.Check else Icons.Rounded.Close, null, tint = if (right) c.good else c.bad, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- forces
@Composable
private fun ForceView(b: BoardState) {
    val forces = b.round.j("forces").list()
    val level = b.round.j("level").int() ?: 0
    val options = b.round.j("options").strs()
    val measurer = rememberTextMeasurer()
    val c = WL.colors
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        BoxWithConstraints(Modifier.fillMaxWidth().weight(1f)) {
            Canvas(Modifier.fillMaxSize().semantics { contentDescription = "Box with forces: " + forces.joinToString { "${it.j("n").int()} newtons ${if (it.j("dir").str() == "L") "left" else "right"}" } }) {
                val w = size.width; val h = size.height
                val box = min(h * .55f, w * .22f)
                val cx = w / 2; val floor = h * .78f
                drawLine(c.line, Offset(0f, floor), Offset(w, floor), strokeWidth = 4f)
                val lefts = forces.filter { it.j("dir").str() == "L" }; val rights = forces.filter { it.j("dir").str() == "R" }
                val maxLen = (w / 2 - box / 2 - 12f)
                fun arrows(list: List<JsonElement>, dir: Int) {
                    list.forEachIndexed { i, f ->
                        val n = f.j("n").int() ?: 0
                        val len = min(maxLen, (30f + n * (if (level >= 3) 1.2f else 6f)) * density * .9f)
                        val y = floor - box * (0.25f + 0.5f * (i + 1) / (list.size + 1))
                        val start = Offset(cx + dir * box / 2, y)
                        drawArrow(start, start + Offset(dir * len, 0f), if (dir > 0) Color(0xFF5145CD) else Color(0xFFD9695C), 6f)
                        val t = measurer.measure("$n N ${f.j("label").str()}", TextStyle(fontSize = 11.sp, fontWeight = FontWeight.Bold, color = c.text))
                        drawText(t, topLeft = Offset(start.x + dir * len / 2 - t.size.width / 2f, y - t.size.height - 4f))
                    }
                }
                arrows(lefts, -1); arrows(rights, 1)
            }
            // the box is a realistic 3D picture
            val boxDp = min(maxHeight.value * .55f, maxWidth.value * .22f).dp
            Box(Modifier.align(Alignment.Center).offset(y = (maxHeight.value * .78f - maxHeight.value / 2 - boxDp.value / 2).dp), contentAlignment = Alignment.Center) {
                EmojiImage("📦", boxDp)
                Text(b.view.j("box").str() ?: "", Modifier.clip(RoundedCornerShape(6.dp)).background(c.surface.copy(alpha = .85f)).padding(horizontal = 4.dp), style = MaterialTheme.typography.labelMedium, color = c.text)
            }
        }
        Text(b.view.j("question").str() ?: "", style = MaterialTheme.typography.titleMedium, color = c.text)
        val labels = b.view.j("optionLabels").obj()
        if (options.isNotEmpty()) OptionRow(options, { labels[it].str() ?: it }, b.progress.j("choice").str(), b.view.j("answer").j("choice").str(), b, { b.act(action("choose", "id" to it)) })
        else NumberAnswer(b, b.view.j("inputLabel").str() ?: "Your answer")
    }
}

// ---------------------------------------------------------------- mirrors
@Composable
private fun MirrorView(b: BoardState) {
    val c = WL.colors
    if (b.round.j("ask").str() != "choice") {
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(14.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) {
            EmojiImage("🔦", 72.dp)
            Text(boldMarkup(b.view.j("question").str() ?: ""), style = MaterialTheme.typography.titleMedium, color = c.text)
            NumberAnswer(b, "Your answer")
        }
        return
    }
    val target = b.round.j("target").dbl() ?: 90.0
    val options = b.round.j("options").ints()
    val picked = b.view.j("picked").int()
    val out = b.view.j("out").dbl()
    val answer = b.view.j("answer").dbl()?.roundToInt()
    val measurer = rememberTextMeasurer()
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Canvas(Modifier.fillMaxWidth().weight(1f).semantics { contentDescription = "Laser from the left. Target at ${target.roundToInt()} degrees." + (if (picked != null) " Mirror at $picked degrees sends the ray to ${out?.roundToInt()} degrees." else "") }) {
            val R = min(size.width * .38f, size.height * .42f)
            val cx = size.width / 2; val cy = size.height / 2
            drawCircle(c.line, R, Offset(cx, cy), style = Stroke(1.5f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 8f))))
            // laser box
            drawRoundRect(Brush.verticalGradient(listOf(Color(0xFF6B7080), Color(0xFF2A2D35)), cy - 14f, cy + 14f), Offset(cx - R - 40f, cy - 14f), Size(44f, 28f), CornerRadius(6f))
            drawLine(Color(0xFFE5484D), Offset(cx - R, cy), Offset(cx, cy), strokeWidth = 5f)
            drawLine(Color(0x55E5484D), Offset(cx - R, cy), Offset(cx, cy), strokeWidth = 14f)
            val t = polar(cx, cy, R, target)
            drawCircle(Color(0xFFF6C344), 18f, t); drawCircle(Color(0xFFE5484D), 11f, t); drawCircle(Color.White, 5f, t)
            val tl = measurer.measure("target", TextStyle(fontSize = 12.sp, color = c.muted, fontWeight = FontWeight.Bold))
            drawText(tl, topLeft = Offset(t.x - tl.size.width / 2f, t.y + if (t.y > cy) 22f else -22f - tl.size.height))
            if (picked != null && out != null) {
                val m1 = polar(cx, cy, R * .34f, picked.toDouble()); val m2 = polar(cx, cy, R * .34f, picked + 180.0)
                drawLine(Brush.linearGradient(listOf(Color(0xFFBFE3FF), Color(0xFF5C8FC9), Color(0xFFE6F3FF)), m1, m2), m1, m2, strokeWidth = 10f, cap = StrokeCap.Round)
                val o = polar(cx, cy, R, out)
                drawLine(Color(0xFFE5484D), Offset(cx, cy), o, strokeWidth = 5f, pathEffect = if (out.roundToInt() == target.roundToInt()) null else PathEffect.dashPathEffect(floatArrayOf(16f, 12f)))
            }
        }
        Text(b.view.j("question").str() ?: "", style = MaterialTheme.typography.titleMedium, color = c.text)
        OptionRow(options.map { "$it" }, { "$it°" }, picked?.toString(), answer?.toString(), b, { b.act(action("chooseMirror", "m" to it.toInt())) }) { o ->
            Canvas(Modifier.size(28.dp)) {
                val a = o.toDouble()
                drawLine(Color(0xFF5C8FC9), polar(size.width / 2, size.height / 2, size.width * .42f, a + 180), polar(size.width / 2, size.height / 2, size.width * .42f, a), strokeWidth = 6f, cap = StrokeCap.Round)
            }
        }
    }
}

// ---------------------------------------------------------------- numeric
@Composable
private fun NumericView(b: BoardState) {
    val c = WL.colors
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(b.view.j("question").str() ?: "", style = MaterialTheme.typography.titleMedium, color = c.text)
        Column(Modifier.clip(RoundedCornerShape(14.dp)).background(c.surface2).padding(horizontal = 16.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            b.view.j("givens").list().forEach { g ->
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text(g.j("k").str() ?: "", style = MaterialTheme.typography.labelLarge, color = c.muted)
                    Text(g.j("text").str() ?: "", style = MaterialTheme.typography.labelLarge, color = c.text)
                }
            }
        }
        NumberAnswer(b, b.view.j("inputLabel").str() ?: "Your answer")
    }
}
