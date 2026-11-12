package com.maheshglance.wonderlab.feature.games

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.spring
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Undo
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.ProgressBarRangeInfo
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.setProgress
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import kotlin.math.abs
import kotlin.math.min
import kotlin.math.roundToInt

@Composable
fun NumberLineBoard(b: BoardState) {
    val r = b.round
    val minK = r.j("minK").int() ?: 0
    val maxK = r.j("maxK").int() ?: 10
    val startK = r.j("startK").int() ?: 0
    val target = b.view.j("target").int() ?: 0
    val pos = b.progress.j("pos").int() ?: startK
    val ticks = b.view.j("ticks").list()
    val hops = b.view.j("hops").list()
    val guide = b.hints >= 2
    val c = WL.colors
    val measurer = rememberTextMeasurer()
    var dragK by remember { mutableStateOf<Int?>(null) }
    val shownPos = dragK ?: pos
    val frogX by animateFloatAsState((shownPos - minK).toFloat() / (maxK - minK).coerceAtLeast(1), if (b.reduceMotion) snap() else spring(dampingRatio = .55f, stiffness = Spring.StiffnessMediumLow), label = "frog")
    val lang = b.lang

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val narrow = maxWidth < 480.dp
        val lineH = (maxHeight.value - (if (narrow) 200f else 150f)).coerceIn(84f, 260f).dp
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceEvenly, horizontalAlignment = Alignment.CenterHorizontally) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("${b.view.j("expression").str()} = ", fontSize = 30.sp, fontWeight = FontWeight.Black, color = c.text)
                Text(if (b.solved) b.view.j("targetText").str() ?: "" else "?", fontSize = 30.sp, fontWeight = FontWeight.Black, color = if (b.solved) c.good else c.primary)
            }
            BoxWithConstraints(Modifier.fillMaxWidth().height(lineH)) {
                val w = constraints.maxWidth.toFloat()
                val pad = w * 0.04f + 12f
                fun xOf(k: Int) = pad + (k - minK).toFloat() / (maxK - minK).coerceAtLeast(1) * (w - 2 * pad)
                fun kAt(x: Float) = (minK + ((x - pad) / (w - 2 * pad)) * (maxK - minK)).roundToInt().coerceIn(minK, maxK)
                val lineY = constraints.maxHeight * 0.66f
                Canvas(
                    Modifier.fillMaxSize()
                        .semantics {
                            contentDescription = if (lang == "te") "సంఖ్యా రేఖపై కప్ప స్థానం" else "Frog position on the number line"
                            progressBarRangeInfo = ProgressBarRangeInfo(pos.toFloat(), minK.toFloat()..maxK.toFloat(), maxK - minK - 1)
                            setProgress { v -> b.act(action("move", "k" to v.roundToInt())); true }
                        }
                        .pointerInput(b.solved, minK, maxK, w) { if (!b.solved) detectTapGestures { o -> b.act(action("move", "k" to kAt(o.x))) } }
                        .pointerInput(b.solved, minK, maxK, w) {
                            if (!b.solved) detectHorizontalDragGestures(
                                onDragStart = { o -> dragK = kAt(o.x) },
                                onHorizontalDrag = { ch, _ -> ch.consume(); dragK = kAt(ch.position.x) },
                                onDragEnd = { dragK?.let { b.act(action("move", "k" to it)) }; dragK = null },
                                onDragCancel = { dragK = null },
                            )
                        },
                ) {
                    val stroke = 4.dp.toPx()
                    // track
                    drawLine(Brush.horizontalGradient(listOf(Color(0xFF7DB7E8), Color(0xFF5145CD))), Offset(pad - 16f, lineY), Offset(w - pad + 16f, lineY), strokeWidth = stroke * 1.4f, cap = StrokeCap.Round)
                    val small = ticks.size > 21
                    ticks.forEach { t ->
                        val k = t.j("k").int() ?: 0
                        val whole = t.j("whole").bool() == true
                        val x = xOf(k)
                        val hh = if (whole) 16.dp.toPx() else 10.dp.toPx()
                        drawLine(c.text, Offset(x, lineY - hh), Offset(x, lineY + hh), strokeWidth = if (whole) stroke else stroke / 2)
                        if (t.j("show").bool() == true) {
                            val txt = t.j("text").str() ?: ""
                            val style = TextStyle(fontSize = if (small) 11.sp else if (ticks.size > 13) 13.sp else 16.sp, fontWeight = if (whole) FontWeight.ExtraBold else FontWeight.SemiBold, color = if (whole) c.text else c.muted)
                            val lay = measurer.measure(txt, style)
                            drawText(lay, topLeft = Offset(x - lay.size.width / 2f, lineY + hh + 4.dp.toPx()))
                        }
                    }
                    fun arc(a: Int, bk: Int, y: Float): Path {
                        val xa = xOf(a); val xb = xOf(bk); val mid = (xa + xb) / 2; val h = min(70.dp.toPx(), abs(xb - xa) / 2 + 20.dp.toPx())
                        return Path().apply { moveTo(xa, y); quadraticTo(mid, y - h * 2, xb, y) }
                    }
                    if (guide) drawPath(arc(startK, target, lineY - 20.dp.toPx()), c.accent, style = Stroke(stroke, pathEffect = PathEffect.dashPathEffect(floatArrayOf(18f, 14f)), cap = StrokeCap.Round))
                    if (shownPos != startK) drawPath(arc(startK, shownPos, lineY - 16.dp.toPx()), c.primary, style = Stroke(stroke, cap = StrokeCap.Round))
                    drawCircle(c.surface, 9.dp.toPx(), Offset(xOf(startK), lineY))
                    drawCircle(c.text, 9.dp.toPx(), Offset(xOf(startK), lineY), style = Stroke(3.dp.toPx()))
                    drawOval(Color.Black.copy(alpha = .18f), Offset(pad + frogX * (w - 2 * pad) - 18.dp.toPx(), lineY - 6.dp.toPx()), androidx.compose.ui.geometry.Size(36.dp.toPx(), 10.dp.toPx()))
                }
                // the frog (3D picture) sits on its current number
                val frogSize = 54.dp
                Box(Modifier.offset { IntOffset((pad + frogX * (w - 2 * pad) - frogSize.toPx() / 2).roundToInt(), (lineY - frogSize.toPx() - 2.dp.toPx()).roundToInt()) }) {
                    EmojiImage("🐸", frogSize)
                }
            }
            Text("${if (lang == "te") "కప్ప ఉన్నది" else "Frog is on"} ${b.view.j("posText").str() ?: ""}", style = MaterialTheme.typography.labelLarge, color = c.muted)
            val left = @Composable {
                hops.forEach { h ->
                    val hv = h.j("h").int() ?: 1
                    KeyButton({ b.act(action("move", "k" to pos - hv)) }, Modifier.semantics { contentDescription = h.j("left").loc(lang) }, enabled = !b.solved && pos - hv >= minK) {
                        Text("‹ ${h.j("text").str()}", style = MaterialTheme.typography.labelLarge, color = c.text)
                    }
                }
            }
            val right = @Composable {
                hops.forEach { h ->
                    val hv = h.j("h").int() ?: 1
                    KeyButton({ b.act(action("move", "k" to pos + hv)) }, Modifier.semantics { contentDescription = h.j("right").loc(lang) }, enabled = !b.solved && pos + hv <= maxK) {
                        Text("${h.j("text").str()} ›", style = MaterialTheme.typography.labelLarge, color = c.text)
                    }
                }
            }
            val check = @Composable { WLButton(if (lang == "te") "సరిచూడు" else "Check", { b.act(action("check")) }, icon = Icons.Rounded.Check, kind = BtnKind.Primary, enabled = !b.solved, small = true) }
            val back = @Composable { WLButton(if (lang == "te") "మొదటికి" else "Back to start", { b.act(action("reset")) }, kind = BtnKind.Ghost, icon = Icons.AutoMirrored.Rounded.Undo, enabled = !b.solved && pos != startK, small = true) }
            if (narrow) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) { left() }
                    Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) { right() }
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) { back(); check() }
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().padding(horizontal = 2.dp)) {
                    left(); check(); right(); back()
                }
            }
        }
    }
}
