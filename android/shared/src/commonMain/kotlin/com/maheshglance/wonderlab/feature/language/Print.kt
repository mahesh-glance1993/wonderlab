package com.maheshglance.wonderlab.feature.language

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.Print
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas as GCanvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import com.maheshglance.wonderlab.core.platform.LocalPlatform
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton

// Printable tracing sheet (website Trace.tsx PrintSheet): 6 letters per A4 page, each row = the letter, then four
// dotted copies to trace, on three guide lines. Pages are rendered as A4 images and handed to the system print dialog
// (print or save as PDF).

private const val PER_PAGE = 6
private const val A4_W = 595f
private const val A4_H = 842f

/** A4 portrait page at about 200 dpi for printing. */
private const val PAGE_W = 1654
private const val PAGE_H = 2339

/** Draws one sheet page filling this draw scope (the on-screen preview and the printed page use the same code). */
fun DrawScope.drawSheetPage(tm: TextMeasurer, title: String, letters: List<String>, script: String) {
    val w = size.width; val h = size.height
    val s = w / A4_W
    drawRect(Color.White)
    val margin = 40f * s
    val titleLay = tm.line(title, traceStyle(script, 22f * s, Color(0xFF2F3A35)))
    drawLineAt(titleLay, margin, margin + 22f * s)
    drawLineAt(tm.line(" · Name: ____________", plainStyle(13f * s, Color(0xFF555555))), margin + titleLay.size.width, margin + 22f * s)
    val rowW = w - 2 * margin
    val k = rowW / 700f
    val rowH = 110f * k
    val gap = ((h - margin * 2 - 50f * s) - rowH * PER_PAGE) / PER_PAGE
    val dashLine = PathEffect.dashPathEffect(floatArrayOf(4f * k, 4f * k), 0f)
    val dotted = Stroke(width = 1.6f * k, pathEffect = PathEffect.dashPathEffect(floatArrayOf(3f * k, 4f * k), 0f))
    letters.forEachIndexed { i, l ->
        val x0 = margin
        val y0 = margin + 50f * s + i * (rowH + gap.coerceAtLeast(6f * s))
        drawLine(Color(0xFFBBBBBB), Offset(x0, y0 + 20f * k), Offset(x0 + rowW, y0 + 20f * k), strokeWidth = 1f * k)
        drawLine(Color(0xFFBBBBBB), Offset(x0, y0 + 100f * k), Offset(x0 + rowW, y0 + 100f * k), strokeWidth = 1f * k)
        drawLine(Color(0xFFDDDDDD), Offset(x0, y0 + 60f * k), Offset(x0 + rowW, y0 + 60f * k), strokeWidth = 1f * k, pathEffect = dashLine)
        val lay = tm.line(l, traceStyle(script, 78f * k, Color(0xFF2F3A35)))
        val tw = lay.size.width.toFloat()
        drawLineAt(lay, x0 + 45f * k - tw / 2f, y0 + 88f * k)
        for (j in 1..4) drawLineAt(lay, x0 + (45f + j * 110f) * k - tw / 2f, y0 + 88f * k, Color(0xFF777777), dotted)
    }
}

/** Renders the sheet pages as A4 images for the system print dialog. */
private fun renderSheetPages(tm: TextMeasurer, title: String, pages: List<List<String>>, script: String): List<ImageBitmap> = pages.map { letters ->
    val img = ImageBitmap(PAGE_W, PAGE_H)
    CanvasDrawScope().draw(Density(1f), LayoutDirection.Ltr, GCanvas(img), Size(PAGE_W.toFloat(), PAGE_H.toFloat())) {
        drawSheetPage(tm, title, letters, script)
    }
    img
}

/** /lang/:course/print/:setId */
@Composable
fun PrintScreen(course: String, setId: String) {
    val data = rememberEngine<LTraceSet>("language.traceSet", course, setId)
    LoadOr(data) { PrintBody(it) }
}

@Composable
private fun PrintBody(set: LTraceSet) {
    val platform = LocalPlatform.current
    val tm = rememberPxTextMeasurer()
    val win = LocalWindow.current
    val pages = remember(set.id) { set.letters.chunked(PER_PAGE) }
    var page by rememberSaveable { mutableIntStateOf(0) }
    val print = {
        runCatching { platform.printPages("WonderLab – ${set.titleEn ?: set.title}", renderSheetPages(tm, set.title, pages, set.script)) }
            .onFailure { platform.toast("Could not prepare the sheet for printing.") }
        Unit
    }
    LangFrame({
        LangBar("Print: ${set.title}", set.script) { WLButton("Print", print, small = true, kind = BtnKind.Primary, icon = Icons.Rounded.Print) }
    }) {
        Column(Modifier.fillMaxSize().padding(horizontal = if (win.isPhone) 10.dp else 20.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Each row shows the letter, then dotted copies to trace and space to write. Print it or save it as a PDF (A4, portrait).",
                style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
            BoxWithConstraints(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                val pw = minOf(maxWidth.value, maxHeight.value * A4_W / A4_H)
                val p = page.coerceIn(0, pages.size - 1)
                Canvas(
                    Modifier.size(pw.dp, (pw * A4_H / A4_W).dp).shadow(4.dp, RoundedCornerShape(4.dp)).clip(RoundedCornerShape(4.dp))
                        .semantics { contentDescription = "Page ${p + 1}: trace the letters ${pages[p].joinToString(" ")}" },
                ) { drawSheetPage(tm, set.title, pages[p], set.script) }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                if (pages.size > 1) WLButton("", { page = (page - 1 + pages.size) % pages.size }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowBack)
                Text("Page ${page.coerceIn(0, pages.size - 1) + 1} of ${pages.size}", style = MaterialTheme.typography.labelLarge, color = WL.colors.text)
                if (pages.size > 1) WLButton("", { page = (page + 1) % pages.size }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowForward)
                WLButton("Print or save PDF", print, kind = BtnKind.Primary, icon = Icons.Rounded.Print)
            }
        }
    }
}
