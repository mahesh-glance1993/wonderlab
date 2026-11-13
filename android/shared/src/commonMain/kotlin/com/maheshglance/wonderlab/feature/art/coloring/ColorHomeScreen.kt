package com.maheshglance.wonderlab.feature.art.coloring

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.CardShape
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.art.engine.ColoringPage
import com.maheshglance.wonderlab.feature.art.engine.DrawList
import com.maheshglance.wonderlab.feature.art.engine.PageCategory
import com.maheshglance.wonderlab.feature.art.engine.Templates
import com.maheshglance.wonderlab.feature.art.ui.ArtConflictHost
import com.maheshglance.wonderlab.ui.LocalApp

private val drawCache = mutableStateMapOf<String, DrawList>()

/** Colouring page picker: category chips, easy-first, native vector previews, print. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ColorHomeScreen() {
    val app = LocalApp.current
    val te = WL.lang == "te"
    val early = WL.tier.tier == "early"
    var cat by rememberSaveable { mutableStateOfS("all") }
    var showAll by rememberSaveable { mutableStateOfB(!early) }
    val data by produceState<Pair<List<ColoringPage>, List<PageCategory>>?>(null) {
        value = runCatching { Templates.pages(app.engine) to Templates.categories(app.engine) }.getOrDefault(emptyList<ColoringPage>() to emptyList())
    }
    val win = LocalWindow.current
    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar(if (te) "రంగులు వేయి" else "Pick a picture to colour", onBack = { app.back() })
        val d = data
        if (d == null) { Loading(); return@Column }
        val (pages, cats) = d
        val shown = pages.filter { cat == "all" || it.category == cat }.filter { showAll || it.level == "easy" }.sortedBy { if (it.level == "easy") 0 else 1 }
        Column(Modifier.weight(1f).fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(4.dp), itemVerticalAlignment = Alignment.CenterVertically) {
                (listOf("all" to (if (te) "అన్నీ" else "All")) + cats.map { it.id to (if (te) it.labelTe else it.label) }).forEach { (id, label) ->
                    FilterChip(cat == id, { cat = id }, label = { Text(label) })
                }
                if (early) WLButton(if (showAll) "Only easy pictures" else "Show detailed pictures too", { showAll = !showAll }, kind = BtnKind.Ghost, small = true)
            }
            BoxWithConstraints(Modifier.weight(1f).fillMaxWidth()) {
                val cols = (maxWidth / (if (win.isPhone) 160.dp else 210.dp)).toInt().coerceIn(2, 6)
                LazyVerticalGrid(GridCells.Fixed(cols), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxSize()) {
                    items(shown, key = { it.id }) { p -> PageCard(p, te) }
                }
            }
        }
    }
    ArtConflictHost()
}

private fun mutableStateOfS(v: String) = androidx.compose.runtime.mutableStateOf(v)
private fun mutableStateOfB(v: Boolean) = androidx.compose.runtime.mutableStateOf(v)

@Composable
private fun PageCard(p: ColoringPage, te: Boolean) {
    val app = LocalApp.current
    Column(Modifier.fillMaxWidth().clip(CardShape).background(WL.colors.surface).padding(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Box(Modifier.fillMaxWidth().height(120.dp).clip(RoundedCornerShape(12.dp)).background(Color.White)
            .pressable { app.go("art/color/${p.id}") }.semantics { contentDescription = "Colour ${p.title}" }) {
            PagePreview(p.id, Modifier.fillMaxSize().padding(4.dp))
        }
        FitText(if (te) p.titleTe else p.title, style = MaterialTheme.typography.titleSmall, color = WL.colors.text, maxLines = 1)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Pill(if (p.level == "easy") "Easy" else "Detailed")
            Box(Modifier.weight(1f))
            IconBtn(Icons.Rounded.Print, "Print ${p.title}", { app.go("art/print/color/${p.id}") }, size = 36.dp)
        }
    }
}

/** Native vector preview of a colouring page. */
@Composable
fun PagePreview(id: String, modifier: Modifier) {
    val app = LocalApp.current
    val tm = androidx.compose.ui.text.rememberTextMeasurer()
    val dl by produceState(drawCache[id], id) { if (value == null) Templates.drawList(app.engine, id)?.let { drawCache[id] = it; value = it } }
    Canvas(modifier) {
        val d = dl ?: return@Canvas
        drawIntoCanvas { c -> Templates.draw(c, id, d, 0f, 0f, size.width, size.height, lineScale = 1.4f, text = tm) }
    }
}
