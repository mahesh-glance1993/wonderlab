package com.maheshglance.wonderlab.feature.language

import android.content.Context
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.os.Bundle
import android.os.CancellationSignal
import android.os.ParcelFileDescriptor
import android.print.PageRange
import android.print.PrintAttributes
import android.print.PrintDocumentAdapter
import android.print.PrintDocumentInfo
import android.print.PrintManager
import android.print.pdf.PrintedPdfDocument
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
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import java.io.FileOutputStream

// Printable tracing sheet (website Trace.tsx PrintSheet): 6 letters per A4 page, each row = the letter, then four
// dotted copies to trace, on three guide lines. Printed (or saved as PDF) through Android's print system.

private const val PER_PAGE = 6
private const val A4_W = 595f
private const val A4_H = 842f

/** Draws one sheet page in a w × h canvas (points for PDF, pixels for the preview). */
fun drawSheetPage(ctx: Context, c: android.graphics.Canvas, w: Float, h: Float, title: String, letters: List<String>, script: String) {
    val s = w / A4_W
    c.drawColor(android.graphics.Color.WHITE)
    val margin = 40f * s
    val titlePaint = tracePaint(ctx, script).apply { color = 0xFF2F3A35.toInt(); textSize = 22f * s }
    c.drawText(title, margin, margin + 22f * s, titlePaint)
    val small = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFF555555.toInt(); textSize = 13f * s }
    c.drawText(" · Name: ____________", margin + titlePaint.measureText(title), margin + 22f * s, small)
    val rowW = w - 2 * margin
    val k = rowW / 700f
    val rowH = 110f * k
    val gap = ((h - margin * 2 - 50f * s) - rowH * PER_PAGE) / PER_PAGE
    val line = Paint(Paint.ANTI_ALIAS_FLAG).apply { strokeWidth = 1f * k; style = Paint.Style.STROKE }
    val letterPaint = tracePaint(ctx, script).apply { color = 0xFF2F3A35.toInt(); textSize = 78f * k; textAlign = Paint.Align.CENTER }
    val dotted = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; color = 0xFF777777.toInt(); strokeWidth = 1.6f * k; pathEffect = DashPathEffect(floatArrayOf(3f * k, 4f * k), 0f) }
    letters.forEachIndexed { i, l ->
        val x0 = margin
        val y0 = margin + 50f * s + i * (rowH + gap.coerceAtLeast(6f * s))
        line.color = 0xFFBBBBBB.toInt(); line.pathEffect = null
        c.drawLine(x0, y0 + 20f * k, x0 + rowW, y0 + 20f * k, line)
        c.drawLine(x0, y0 + 100f * k, x0 + rowW, y0 + 100f * k, line)
        line.color = 0xFFDDDDDD.toInt(); line.pathEffect = DashPathEffect(floatArrayOf(4f * k, 4f * k), 0f)
        c.drawLine(x0, y0 + 60f * k, x0 + rowW, y0 + 60f * k, line)
        c.drawText(l, x0 + 45f * k, y0 + 88f * k, letterPaint)
        for (j in 1..4) {
            val p = Path()
            val tw = letterPaint.measureText(l)
            letterPaint.getTextPath(l, 0, l.length, x0 + (45f + j * 110f) * k - tw / 2f + tw / 2f, y0 + 88f * k, p)
            c.drawPath(p, dotted)
        }
    }
}

private class SheetPrintAdapter(private val ctx: Context, private val title: String, private val pages: List<List<String>>, private val script: String) : PrintDocumentAdapter() {
    private var attrs: PrintAttributes? = null
    override fun onLayout(old: PrintAttributes?, new: PrintAttributes, cancel: CancellationSignal?, cb: LayoutResultCallback, extras: Bundle?) {
        attrs = new
        if (cancel?.isCanceled == true) { cb.onLayoutCancelled(); return }
        cb.onLayoutFinished(PrintDocumentInfo.Builder("wonderlab-tracing.pdf").setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT).setPageCount(pages.size).build(), old != new)
    }

    override fun onWrite(ranges: Array<out PageRange>, dest: ParcelFileDescriptor, cancel: CancellationSignal?, cb: WriteResultCallback) {
        val pdf = PrintedPdfDocument(ctx, attrs ?: PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build())
        try {
            val written = mutableListOf<PageRange>()
            pages.forEachIndexed { i, letters ->
                if (ranges.any { it == PageRange.ALL_PAGES || i in it.start..it.end }) {
                    if (cancel?.isCanceled == true) { cb.onWriteCancelled(); return }
                    val page = pdf.startPage(i)
                    drawSheetPage(ctx, page.canvas, page.info.pageWidth.toFloat(), page.info.pageHeight.toFloat(), title, letters, script)
                    pdf.finishPage(page)
                    written += PageRange(i, i)
                }
            }
            FileOutputStream(dest.fileDescriptor).use { pdf.writeTo(it) }
            cb.onWriteFinished(written.toTypedArray())
        } catch (e: Exception) {
            cb.onWriteFailed(e.message)
        } finally { pdf.close() }
    }
}

/** /lang/:course/print/:setId */
@Composable
fun PrintScreen(course: String, setId: String) {
    val data = rememberEngine<LTraceSet>("language.traceSet", course, setId)
    LoadOr(data) { PrintBody(it) }
}

@Composable
private fun PrintBody(set: LTraceSet) {
    val ctx = LocalContext.current
    val win = LocalWindow.current
    val pages = remember(set.id) { set.letters.chunked(PER_PAGE) }
    var page by rememberSaveable { mutableIntStateOf(0) }
    val print = {
        val pm = ctx.getSystemService(Context.PRINT_SERVICE) as? PrintManager
        pm?.print("WonderLab – ${set.titleEn ?: set.title}", SheetPrintAdapter(ctx, set.title, pages, set.script),
            PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build())
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
                ) { drawIntoCanvas { drawSheetPage(ctx, it.nativeCanvas, size.width, size.height, set.title, pages[p], set.script) } }
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
