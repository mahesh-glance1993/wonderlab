package com.maheshglance.wonderlab.feature.lesson

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.SmallShape
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard

/** Ungraded rough work for senior learners: freehand drawing or typed notes (website Scratchpad). */
@Composable
fun Scratchpad(modifier: Modifier = Modifier) {
    var tab by rememberSaveable { mutableStateOf("draw") }
    var notes by rememberSaveable { mutableStateOf("") }
    val strokes = remember { mutableStateListOf<List<Offset>>() }
    var current by remember { mutableStateOf<List<Offset>>(emptyList()) }
    val ink = WL.colors.text
    WLCard(modifier.fillMaxSize(), padding = 12.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(ls("scratch"), style = MaterialTheme.typography.titleMedium, color = WL.colors.text, modifier = Modifier.weight(1f))
            WLButton(ls("scratchDraw"), { tab = "draw" }, small = true, kind = if (tab == "draw") com.maheshglance.wonderlab.core.design.BtnKind.Primary else com.maheshglance.wonderlab.core.design.BtnKind.Normal)
            WLButton(ls("scratchType"), { tab = "type" }, small = true, kind = if (tab == "type") com.maheshglance.wonderlab.core.design.BtnKind.Primary else com.maheshglance.wonderlab.core.design.BtnKind.Normal)
            WLButton(ls("clear"), { if (tab == "type") notes = "" else strokes.clear() }, small = true, icon = Icons.Rounded.Delete)
        }
        Text(ls("scratchHint"), style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
        Box(Modifier.weight(1f).fillMaxWidth().padding(top = 6.dp).clip(SmallShape).background(WL.colors.paper)) {
            if (tab == "draw") Canvas(
                Modifier.fillMaxSize().pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { current = listOf(it) },
                        onDragEnd = { strokes.add(current); current = emptyList() },
                        onDragCancel = { strokes.add(current); current = emptyList() },
                    ) { ch, _ -> ch.consume(); current = current + ch.position }
                },
            ) {
                (strokes + listOf(current)).forEach { pts ->
                    if (pts.isEmpty()) return@forEach
                    val p = Path().apply { moveTo(pts[0].x, pts[0].y); pts.drop(1).forEach { lineTo(it.x, it.y) }; if (pts.size == 1) lineTo(pts[0].x + 0.5f, pts[0].y) }
                    drawPath(p, WL_INK, style = Stroke(5f, cap = StrokeCap.Round, join = StrokeJoin.Round))
                }
            } else BasicTextField(
                notes, { notes = it }, Modifier.fillMaxSize().padding(10.dp),
                textStyle = MaterialTheme.typography.bodyLarge.copy(color = WL.colors.ink), cursorBrush = SolidColor(ink),
            )
        }
    }
}

private val WL_INK = androidx.compose.ui.graphics.Color(0xFF2F3A35)
