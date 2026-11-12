package com.maheshglance.wonderlab.feature.art.print

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.os.Bundle
import android.os.CancellationSignal
import android.os.ParcelFileDescriptor
import android.print.PageRange
import android.print.PrintAttributes
import android.print.PrintDocumentAdapter
import android.print.PrintDocumentInfo
import android.print.PrintManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.NavigateBefore
import androidx.compose.material.icons.automirrored.rounded.NavigateNext
import androidx.compose.material.icons.rounded.Print
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.feature.art.engine.ColoringPage
import com.maheshglance.wonderlab.feature.art.engine.DrawList
import com.maheshglance.wonderlab.feature.art.engine.Templates
import com.maheshglance.wonderlab.feature.art.renderArtwork
import com.maheshglance.wonderlab.feature.art.replaceTop
import com.maheshglance.wonderlab.feature.art.tracing.Guide
import com.maheshglance.wonderlab.feature.art.tracing.GuideDraw
import com.maheshglance.wonderlab.feature.art.tracing.GuideMode
import com.maheshglance.wonderlab.feature.art.tracing.Sheet
import com.maheshglance.wonderlab.feature.art.tracing.TraceData
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import java.io.FileOutputStream
import kotlin.math.min

/** A printable document: pages drawn natively at A4 size (595 × 842 pt) — vector for sheets and pages. */
interface Printable {
    val title: String
    val pages: Int
    fun draw(c: Canvas, page: Int, w: Float, h: Float)
}

private const val A4W = 595f
private const val A4H = 842f
private val bold = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = android.graphics.Color.BLACK; typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD); textSize = 14f }

private fun nameLine(c: Canvas, w: Float, title: String) {
    bold.textAlign = Paint.Align.LEFT; c.drawText("Name: ______________________", 0f, 16f, bold)
    bold.textAlign = Paint.Align.RIGHT; c.drawText(title, w, 16f, bold)
}

/** Tracing sheet: one guide → 4 practice rows; whole sheet → 4 guides per page (model + 3 dotted copies each). */
class TracePrint(private val sheet: Sheet, i: Int?) : Printable {
    private val guides: List<Guide> = if (i != null && sheet.guides.getOrNull(i) != null) listOf(sheet.guides[i]) else sheet.guides
    private val perPage = if (guides.size == 1) 1 else 4
    override val title = "${sheet.title} — tracing sheet"
    override val pages = (guides.size + perPage - 1) / perPage
    override fun draw(c: Canvas, page: Int, w: Float, h: Float) {
        nameLine(c, w, sheet.title)
        val pg = guides.drop(page * perPage).take(perPage)
        val rowsPer = if (guides.size == 1) 4 else 1
        val totalRows = pg.size * rowsPer
        val top = 30f; val gap = 10f
        val rowH = (h - top - gap * (totalRows - 1)) / maxOf(totalRows, if (guides.size == 1) 4 else 4)
        var y = top
        val line = Paint().apply { color = 0xFFDDDDDD.toInt(); strokeWidth = 1f }
        pg.forEach { g ->
            repeat(rowsPer) { r ->
                val cellW = (w - 3 * 8f) / 4
                for (k in 0 until 4) {
                    val m = if (k == 0 && r == 0) GuideMode.PrintModel else GuideMode.PrintDotted
                    val x = k * (cellW + 8f)
                    val bw = g.box[2]; val bh = g.box[3]
                    val sc = min(cellW / bw, rowH / bh)
                    c.save()
                    c.translate(x + (cellW - bw * sc) / 2, y + (rowH - bh * sc) / 2); c.scale(sc, sc); c.translate(-g.box[0], -g.box[1])
                    GuideDraw.draw(c, g, 5f, k == 0 && r == 0, m)
                    c.restore()
                    c.drawLine(x, y + rowH, x + cellW, y + rowH, line)
                }
                y += rowH + gap
            }
        }
    }
}

class ColorPrint(private val page: ColoringPage, private val dl: DrawList) : Printable {
    override val title = "${page.title} — colouring page"
    override val pages = 1
    override fun draw(c: Canvas, page: Int, w: Float, h: Float) {
        nameLine(c, w, this.page.title)
        // landscape art on portrait paper: as large as fits under the name line
        Templates.draw(c, this.page.id, dl, 0f, 30f, w, h - 30f, inkColor = android.graphics.Color.BLACK)
    }
}

class ArtPrint(override val title: String, private val bmp: Bitmap) : Printable {
    override val pages = 1
    override fun draw(c: Canvas, page: Int, w: Float, h: Float) {
        val s = min(w / bmp.width, (h - 30f) / bmp.height)
        val dw = bmp.width * s; val dh = bmp.height * s
        val x = (w - dw) / 2
        c.drawBitmap(bmp, null, Rect(x.toInt(), 0, (x + dw).toInt(), dh.toInt()), Paint(Paint.FILTER_BITMAP_FLAG))
        bold.textAlign = Paint.Align.CENTER; c.drawText(title, w / 2, dh + 20f, bold)
    }
}

/** Sends a Printable to Android's print system (save as PDF or any printer). */
fun printDocument(context: Context, doc: Printable) {
    val pm = context.getSystemService(Context.PRINT_SERVICE) as? PrintManager ?: return
    val margin = 36f
    val adapter = object : PrintDocumentAdapter() {
        override fun onLayout(old: PrintAttributes?, new: PrintAttributes, cancel: CancellationSignal?, cb: LayoutResultCallback, extras: Bundle?) {
            if (cancel?.isCanceled == true) { cb.onLayoutCancelled(); return }
            cb.onLayoutFinished(PrintDocumentInfo.Builder(doc.title.replace(Regex("[^\\w\\- ]+"), "").trim() + ".pdf").setContentType(PrintDocumentInfo.CONTENT_TYPE_DOCUMENT).setPageCount(doc.pages).build(), true)
        }
        override fun onWrite(pages: Array<out PageRange>, dest: ParcelFileDescriptor, cancel: CancellationSignal?, cb: WriteResultCallback) {
            val pdf = PdfDocument()
            try {
                for (i in 0 until doc.pages) {
                    if (cancel?.isCanceled == true) { cb.onWriteCancelled(); return }
                    val page = pdf.startPage(PdfDocument.PageInfo.Builder(A4W.toInt(), A4H.toInt(), i + 1).create())
                    val c = page.canvas
                    c.translate(margin, margin)
                    doc.draw(c, i, A4W - margin * 2, A4H - margin * 2)
                    pdf.finishPage(page)
                }
                FileOutputStream(dest.fileDescriptor).use { pdf.writeTo(it) }
                cb.onWriteFinished(arrayOf(PageRange.ALL_PAGES))
            } catch (e: Exception) { cb.onWriteFailed(e.message) } finally { pdf.close() }
        }
    }
    pm.print(doc.title, adapter, PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build())
}

/** Printable sheets: art/print/trace/{sheetId}[?i=n], art/print/color/{pageId}, art/print/art/{artworkId}. */
@Composable
fun PrintScreen(kind: String, id: String, index: Int?) {
    val app = LocalApp.current
    val s by appState()
    val ctx = LocalContext.current
    var doc by remember { mutableStateOf<Printable?>(null) }
    var failed by remember { mutableStateOf(false) }
    var page by remember { mutableIntStateOf(0) }
    var bmp by remember { mutableStateOf<Bitmap?>(null) }
    LaunchedEffect(kind, id, index) {
        when (kind) {
            "trace" -> { val sh = TraceData.sheet(app.engine, id); if (sh == null) app.replaceTop("art/trace") else doc = TracePrint(sh, index) }
            "color" -> {
                val p = Templates.pages(app.engine).firstOrNull { it.id == id }
                val dl = p?.let { Templates.drawList(app.engine, it.id) }
                if (p == null || dl == null) app.replaceTop("art/color") else doc = ColorPrint(p, dl)
            }
            "art" -> {
                val pid = s.profile?.id
                val r = pid?.let { runCatching { renderArtwork(app.application, it, id) }.getOrNull() }
                if (r == null) failed = true else { bmp = r.second; doc = ArtPrint(r.first, r.second) }
            }
            else -> app.replaceTop("art")
        }
    }
    DisposableEffect(Unit) { onDispose { bmp?.recycle() } }
    // like the website: open the print dialog as soon as the sheet is ready
    LaunchedEffect(doc) { doc?.let { kotlinx.coroutines.delay(500); printDocument(ctx, it) } }
    val d = doc
    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar(d?.title ?: if (kind == "art") "My picture" else "Print", onBack = { app.back() }, actions = {
            WLButton("Print", { d?.let { printDocument(ctx, it) } }, kind = BtnKind.Primary, icon = Icons.Rounded.Print, small = true, enabled = d != null)
        })
        when {
            failed -> Box(Modifier.padding(16.dp)) { AlertBox("This picture could not be found.", AlertKind.Bad) }
            d == null -> Loading(text = if (kind == "art") "Getting your picture ready…" else "Loading…")
            else -> Column(Modifier.weight(1f).fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Choose “Save as PDF” or a printer. Tip: pick A4 and “Fit to page”.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                BoxWithConstraints(Modifier.weight(1f).fillMaxWidth(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                    val sc = min(maxWidth.value / A4W, maxHeight.value / A4H)
                    androidx.compose.foundation.Canvas(
                        Modifier.size((A4W * sc).dp, (A4H * sc).dp).shadow(6.dp, RoundedCornerShape(6.dp)).clip(RoundedCornerShape(6.dp)).background(Color.White)
                            .semantics { contentDescription = "Print preview, page ${page + 1} of ${d.pages}" },
                    ) {
                        val k = size.width / A4W
                        drawIntoCanvas { cv ->
                            val c = cv.nativeCanvas
                            c.save(); c.scale(k, k); c.translate(36f, 36f)
                            d.draw(c, page.coerceIn(0, d.pages - 1), A4W - 72f, A4H - 72f)
                            c.restore()
                        }
                    }
                }
                if (d.pages > 1) Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center, verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                    IconBtn(Icons.AutoMirrored.Rounded.NavigateBefore, "Previous page", { page-- }, enabled = page > 0)
                    Text("  Page ${page + 1} of ${d.pages}  ", style = MaterialTheme.typography.bodyMedium, color = WL.colors.text)
                    IconBtn(Icons.AutoMirrored.Rounded.NavigateNext, "Next page", { page++ }, enabled = page < d.pages - 1)
                }
            }
        }
    }
}
