package com.maheshglance.wonderlab.feature.games

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.PanTool
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.boundsInRoot
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sqrt

@Composable
fun ShapesBoard(b: BoardState) {
    val pieces = b.round.j("pieces").list()
    val bins = b.round.j("bins").list()
    val attr = b.round.j("attr").str() ?: "shape"
    val placed = b.progress.j("placed").obj()
    val selected = b.progress.j("selected").str()
    val last = b.progress.j("last").str()
    val names = b.view.j("names").obj()
    val loose = pieces.filter { placed[it.j("id").str()] == null }
    val binRects = remember { mutableStateMapOf<String, Rect>() }
    var drag by remember { mutableStateOf<Pair<String, Offset>?>(null) }
    var rootOrigin by remember { mutableStateOf(Offset.Zero) }
    val pieceOrigins = remember { mutableStateMapOf<String, Offset>() }
    val haptic = LocalHapticFeedback.current
    val density = LocalDensity.current
    val act by rememberUpdatedState(b.act)

    BoxWithConstraints(Modifier.fillMaxSize().onGloballyPositioned { rootOrigin = it.positionInRoot() }) {
        val wide = maxWidth > maxHeight * 1.2f
        val piecesArea = @Composable { m: Modifier ->
            BoxWithConstraints(m.clip(RoundedCornerShape(18.dp)).background(WL.colors.surface2).padding(6.dp), contentAlignment = Alignment.Center) {
                if (loose.isEmpty()) Text(if (b.lang == "te") "అన్ని ఆకారాలు వేరు చేశారు." else "All shapes sorted.", color = WL.colors.muted, style = MaterialTheme.typography.bodyMedium)
                else {
                    val n = max(pieces.size, 1)
                    val ratio = maxWidth.value / maxHeight.value.coerceAtLeast(1f)
                    val cols = max(1, ceil(sqrt(n * ratio.toDouble())).toInt())
                    val rows = ceil(n / cols.toDouble()).toInt()
                    val cell = min(maxWidth.value / cols, maxHeight.value / rows).coerceAtMost(120f)
                    Column(verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
                        loose.chunked(cols).forEach { row ->
                            Row {
                                row.forEach { p ->
                                    val id = p.j("id").str() ?: ""
                                    val sz = (cell * (0.55f + 0.13f * (p.j("size").int() ?: 2))).coerceAtMost(cell * 0.94f)
                                    val sel = selected == id
                                    val dragging = drag?.first == id
                                    val name = names[id].loc(b.lang)
                                    Box(
                                        Modifier.size(cell.dp)
                                            .semantics { contentDescription = name; role = Role.Button; this.selected = sel; onClick { act(action("select", "id" to id)); true } }
                                            .pointerInput(id, b.solved) {
                                                if (b.solved) return@pointerInput
                                                detectTapGestures { Tones.tap(); act(action("select", "id" to id)) }
                                            }
                                            .pointerInput(id, b.solved) {
                                                if (b.solved) return@pointerInput
                                                detectDragGestures(
                                                    onDragStart = { o -> drag = id to ((pieceOrigins[id] ?: Offset.Zero) + o); haptic.performHapticFeedback(HapticFeedbackType.LongPress) },
                                                    onDrag = { ch, d -> ch.consume(); drag = drag?.let { it.first to it.second + d } },
                                                    onDragEnd = {
                                                        val pt = drag?.second
                                                        drag = null
                                                        val hit = pt?.let { q -> binRects.entries.firstOrNull { it.value.contains(q) }?.key }
                                                        if (hit != null) act(action("drop", "piece" to id, "bin" to hit))
                                                    },
                                                    onDragCancel = { drag = null },
                                                )
                                            }
                                            .onGloballyPositioned { c -> pieceOrigins[id] = c.positionInRoot() },
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        val sc by animateFloatAsState(if (sel) 1.12f else 1f, spring(dampingRatio = .5f), label = "sel")
                                        if (sel) Box(Modifier.size((sz + 10).dp).clip(RoundedCornerShape(16.dp)).border(3.dp, WL.colors.primary, RoundedCornerShape(16.dp)))
                                        ShapeArt(p.j("shape").str() ?: "circle", p.j("color").str() ?: "blue", sz.dp, Modifier.scale(sc).then(if (dragging) Modifier.scale(0f) else Modifier), rot = (p.j("rot").int() ?: 0).toFloat())
                                        if (sel) Icon(Icons.Rounded.PanTool, null, tint = WL.colors.primary, modifier = Modifier.align(Alignment.TopEnd).size(18.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        val binsArea = @Composable { m: Modifier ->
            val layout = @Composable { inner: @Composable (Modifier) -> Unit -> if (wide) Column(m, verticalArrangement = Arrangement.spacedBy(8.dp)) { inner(Modifier.weight(1f).fillMaxWidth()) } else Row(m, horizontalArrangement = Arrangement.spacedBy(8.dp)) { inner(Modifier.weight(1f).fillMaxSize()) } }
            layout { cell ->
                bins.forEachIndexed { i, bin ->
                    val bid = bin.j("id").str() ?: ""
                    val value = bin.j("value").str() ?: ""
                    val inBin = pieces.filter { placed[it.j("id").str()].str() == bid }
                    val hot = drag != null && drag?.second?.let { binRects[bid]?.contains(it) } == true
                    val label = bin.j("label").loc(b.lang)
                    Column(
                        cell.shadow(4.dp, RoundedCornerShape(18.dp), clip = false).clip(RoundedCornerShape(18.dp))
                            .background(if (hot) WL.colors.math else WL.colors.surface)
                            .border(3.dp, if (hot || selected != null) WL.colors.primary else WL.colors.line, RoundedCornerShape(18.dp))
                            .onGloballyPositioned { binRects[bid] = it.boundsInRoot() }
                            .semantics { contentDescription = "Bin ${i + 1}: $label. ${inBin.size} inside" }
                            .pressable(!b.solved) { act(action("bin", "bin" to bid)) }
                            .padding(6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            when (attr) {
                                "color" -> ShapeArt("square", value, 20.dp)
                                "shape" -> ShapeArt(value, "blue", 20.dp)
                            }
                            FitText(label, style = MaterialTheme.typography.labelLarge, color = WL.colors.text, maxLines = 1)
                        }
                        BoxWithConstraints(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                            val cnt = max(inBin.size, 1)
                            val cols = max(1, ceil(sqrt(cnt * (maxWidth.value / maxHeight.value.coerceAtLeast(1f)).toDouble())).toInt())
                            val rows = ceil(cnt / cols.toDouble()).toInt()
                            val s = min(min(maxWidth.value / cols, maxHeight.value / rows) - 2, 40f).coerceAtLeast(12f)
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                inBin.chunked(cols).forEach { row ->
                                    Row {
                                        row.forEach { p ->
                                            val pid = p.j("id").str()
                                            val pop by animateFloatAsState(if (pid == last && !b.reduceMotion) 1f else 1f, spring(dampingRatio = .4f), label = "pop")
                                            ShapeArt(p.j("shape").str() ?: "circle", p.j("color").str() ?: "blue", s.dp, Modifier.padding(1.dp).scale(pop), rot = (p.j("rot").int() ?: 0).toFloat(), label = names[pid].loc(b.lang))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (wide) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            piecesArea(Modifier.weight(1.3f).fillMaxSize())
            binsArea(Modifier.weight(1f).fillMaxSize())
        } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            piecesArea(Modifier.weight(1.1f).fillMaxWidth())
            binsArea(Modifier.weight(1f).fillMaxWidth())
        }
        // the piece under the finger
        val d = drag
        val dragged = d?.let { (id, _) -> pieces.firstOrNull { it.j("id").str() == id } }
        if (d != null && dragged != null) {
            val half = with(density) { 36.dp.toPx() }
            Box(Modifier.offset { IntOffset((d.second.x - rootOrigin.x - half).roundToInt(), (d.second.y - rootOrigin.y - half).roundToInt()) }.size(72.dp)) {
                ShapeArt(dragged.j("shape").str() ?: "circle", dragged.j("color").str() ?: "blue", 72.dp, Modifier.shadow(10.dp, RoundedCornerShape(36.dp), clip = false), rot = (dragged.j("rot").int() ?: 0).toFloat())
            }
        }
    }
}
