package com.maheshglance.wonderlab.feature.art.paint

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Brush
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.art.engine.ArtColor
import com.maheshglance.wonderlab.feature.art.engine.ArtIds
import com.maheshglance.wonderlab.feature.art.engine.Paper
import com.maheshglance.wonderlab.feature.art.engine.ProjectOps
import com.maheshglance.wonderlab.feature.art.replaceTop
import com.maheshglance.wonderlab.feature.art.ui.SubTitle
import com.maheshglance.wonderlab.ui.LocalApp

/** Choose canvas size and paper, then open the studio with a fresh artwork id (early tier skips straight in). */
@Composable
fun NewCanvasScreen() {
    val app = LocalApp.current
    val early = WL.tier.tier == "early"
    val id = rememberSaveable { ArtIds.uuid() }
    var size by rememberSaveable { mutableStateOfS("standard") }
    var paper by rememberSaveable { mutableStateOfS("smooth") }
    if (early) { LaunchedEffect(Unit) { app.replaceTop("art/paint/$id?size=standard&paper=smooth") }; return }
    val win = LocalWindow.current
    Column(Modifier.fillMaxSize()) {
        TopBar("New painting", onBack = { app.back() })
        BoxWithConstraints(Modifier.weight(1f).fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp)) {
            val wide = maxWidth > maxHeight * 1.2f
            val roomy = maxWidth > 560.dp
            val gap = 10.dp
            Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(gap)) {
                SubTitle("Canvas size")
                // 4 sizes: one row on wide screens, 2×2 on phones
                val sizeCols = if (wide || roomy) 4 else 2
                ChoiceGrid(ProjectOps.CANVAS_SIZES, sizeCols, Modifier.weight(1f)) { s, m ->
                    Choice(selected = size == s.id, onClick = { size = s.id }, modifier = m) {
                        Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                            Box(Modifier.fillMaxHeight(0.8f).aspectRatio(s.w.toFloat() / s.h).clip(RoundedCornerShape(4.dp)).background(Color.White).border(2.dp, WL.colors.line, RoundedCornerShape(4.dp)))
                        }
                        Text(s.label, style = MaterialTheme.typography.titleSmall, color = WL.colors.text, textAlign = TextAlign.Center)
                        Text("${s.w} × ${s.h}", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                    }
                }
                SubTitle("Paper")
                val paperCols = if (wide || roomy) 6 else 3
                ChoiceGrid(Paper.PAPERS, paperCols, Modifier.weight(1f)) { (pid, label), m ->
                    Choice(selected = paper == pid, onClick = { paper = pid }, modifier = m) {
                        PaperSwatch(pid, Modifier.weight(1f).fillMaxWidth())
                        Text(label, style = MaterialTheme.typography.titleSmall, color = WL.colors.text, textAlign = TextAlign.Center, maxLines = 2)
                    }
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    WLButton("Start painting", { app.replaceTop("art/paint/$id?size=$size&paper=$paper") }, kind = BtnKind.Primary, icon = Icons.Rounded.Brush, modifier = if (win.isPhone) Modifier.fillMaxWidth() else Modifier)
                }
            }
        }
    }
}

private fun mutableStateOfS(v: String) = androidx.compose.runtime.mutableStateOf(v)

@Composable
private fun <T> ChoiceGrid(items: List<T>, cols: Int, modifier: Modifier, item: @Composable (T, Modifier) -> Unit) {
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        items.chunked(cols).forEach { row ->
            Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                row.forEach { item(it, Modifier.weight(1f).fillMaxHeight()) }
                repeat(cols - row.size) { Box(Modifier.weight(1f)) }
            }
        }
    }
}

@Composable
private fun Choice(selected: Boolean, onClick: () -> Unit, modifier: Modifier, content: @Composable androidx.compose.foundation.layout.ColumnScope.() -> Unit) {
    val c = WL.colors
    Column(
        modifier.clip(RoundedCornerShape(18.dp)).background(if (selected) c.art else c.surface)
            .border(3.dp, if (selected) c.primary else c.line, RoundedCornerShape(18.dp))
            .semantics { this.selected = selected }.pressable(role = Role.RadioButton, onClick = onClick).padding(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp), content = content,
    )
}

/** A real swatch of the paper texture (colour + tooth), rendered natively. */
@Composable
fun PaperSwatch(paper: String, modifier: Modifier = Modifier, corner: Dp = 10.dp) {
    val tex: ImageBitmap = remember(paper) {
        val bmp = ImageBitmap(128, 128)
        val cv = androidx.compose.ui.graphics.Canvas(bmp)
        cv.drawRect(0f, 0f, 128f, 128f, androidx.compose.ui.graphics.Paint().apply { color = Color(ArtColor.argb(Paper.COLORS[paper])) })
        if (paper != "smooth") {
            val p = androidx.compose.ui.graphics.Paint()
            val tint = if (paper == "kraft") intArrayOf(90, 60, 30) else intArrayOf(120, 110, 95)
            p.shader = Paper.grainShader(paper, tint[0], tint[1], tint[2], 0.55f, 0.45f)
            p.alpha = ((if (paper == "kraft") 0.35f else 0.3f) * 255).toInt() / 255f // a little stronger than on the canvas so it reads at swatch size
            cv.drawRect(0f, 0f, 128f, 128f, p)
        }
        bmp
    }
    Canvas(modifier.clip(RoundedCornerShape(corner)).border(1.dp, WL.colors.line, RoundedCornerShape(corner))) {
        val n = (size.width / 128f).toInt() + 1; val m = (size.height / 128f).toInt() + 1
        for (i in 0 until n) for (j in 0 until m) drawImage(tex, topLeft = androidx.compose.ui.geometry.Offset(i * 128f, j * 128f))
    }
}

