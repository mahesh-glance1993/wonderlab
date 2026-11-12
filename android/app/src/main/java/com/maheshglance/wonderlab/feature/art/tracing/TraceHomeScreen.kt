package com.maheshglance.wonderlab.feature.art.tracing

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Print
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.CardShape
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.art.ui.ArtConflictHost
import com.maheshglance.wonderlab.ui.LocalApp
import kotlin.math.ceil
import kotlin.math.min

/** Tracing sheet picker: 7 sheets in a grid sized to fit one screen, each with a live preview. */
@Composable
fun TraceHomeScreen() {
    val app = LocalApp.current
    val te = WL.lang == "te"
    val list by produceState<List<SheetSummary>?>(null) { value = runCatching { TraceData.sheets(app.engine) }.getOrDefault(emptyList()) }
    val win = LocalWindow.current
    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar(if (te) "ఏది దిద్దుదాం?" else "What shall we trace?", onBack = { app.back() })
        val items = list
        if (items == null) { Loading(); return@Column }
        BoxWithConstraints(Modifier.weight(1f).fillMaxWidth().padding(12.dp)) {
            val cols = when { win.landscape -> 4; maxWidth > 700.dp -> 4; else -> 2 }
            val rows = ceil(items.size / cols.toFloat()).toInt()
            val gap = 10.dp
            val cellH = ((maxHeight - gap * (rows - 1)) / rows).coerceAtLeast(130.dp)
            LazyVerticalGrid(GridCells.Fixed(cols), horizontalArrangement = Arrangement.spacedBy(gap), verticalArrangement = Arrangement.spacedBy(gap), modifier = Modifier.fillMaxSize()) {
                items(items, key = { it.id }) { s -> SheetCard(s, te, Modifier.height(cellH)) }
            }
        }
    }
    ArtConflictHost()
}

@Composable
private fun SheetCard(s: SheetSummary, te: Boolean, modifier: Modifier) {
    val app = LocalApp.current
    Column(
        modifier.fillMaxWidth().clip(CardShape).background(WL.colors.surface).pressable { app.go("art/trace/${s.id}") }
            .semantics { contentDescription = "${s.title}: ${s.count} to trace" }.padding(10.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Box(Modifier.weight(1f).fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(Color.White), contentAlignment = Alignment.Center) {
            GuidePreview(s.preview, Modifier.fillMaxSize().padding(4.dp))
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                FitText(if (te) s.titleTe else s.title, style = MaterialTheme.typography.titleSmall, color = WL.colors.text, maxLines = 1)
                Text("${s.count} to trace", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            }
            IconBtn(Icons.Rounded.Print, "Print ${s.title} tracing sheet", { app.go("art/print/trace/${s.id}") }, size = 40.dp)
        }
    }
}

/** A guide drawn to fit a box (keeps aspect). */
@Composable
fun GuidePreview(g: Guide, modifier: Modifier, mode: GuideMode = GuideMode.Screen, tol: Float = 6f) {
    Canvas(modifier) {
        val bx = g.box[0]; val by = g.box[1]; val bw = g.box[2]; val bh = g.box[3]
        val sc = min(size.width / bw, size.height / bh)
        drawIntoCanvas { cv ->
            val c = cv.nativeCanvas
            c.save()
            c.translate((size.width - bw * sc) / 2, (size.height - bh * sc) / 2); c.scale(sc, sc); c.translate(-bx, -by)
            GuideDraw.draw(c, g, tol, true, mode)
            c.restore()
        }
    }
}
