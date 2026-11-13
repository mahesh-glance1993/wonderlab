package com.maheshglance.wonderlab.feature.art.print

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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.platform.Platform
import com.maheshglance.wonderlab.feature.art.engine.ColoringPage
import com.maheshglance.wonderlab.feature.art.engine.DrawList
import com.maheshglance.wonderlab.feature.art.engine.TextAnchor
import com.maheshglance.wonderlab.feature.art.engine.Templates
import com.maheshglance.wonderlab.feature.art.engine.drawArtText
import com.maheshglance.wonderlab.feature.art.engine.release
import com.maheshglance.wonderlab.feature.art.renderArtwork
import com.maheshglance.wonderlab.feature.art.replaceTop
import com.maheshglance.wonderlab.feature.art.tracing.Guide
import com.maheshglance.wonderlab.feature.art.tracing.GuideDraw
import com.maheshglance.wonderlab.feature.art.tracing.GuideMode
import com.maheshglance.wonderlab.feature.art.tracing.Sheet
import com.maheshglance.wonderlab.feature.art.tracing.TraceData
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import kotlin.math.min
import kotlin.math.roundToInt

/** A printable document: pages drawn natively in A4 units (595 × 842 pt) — the same code draws the preview and the printed pages. */
interface Printable {
    val title: String
    val pages: Int
    fun draw(c: Canvas, page: Int, w: Float, h: Float, text: TextMeasurer?)
}

private const val A4W = 595f
private const val A4H = 842f
private const val MARGIN = 36f
/** Printed page size in pixels (A4 at ≈ 200 dpi). */
private const val PAGE_PX_W = 1654
private const val PAGE_PX_H = 2339

private fun boldText(c: Canvas, text: TextMeasurer?, s: String, x: Float, y: Float, anchor: TextAnchor) =
    c.drawArtText(text, s, x, y, 14f, Color.Black, anchor, bold = true)

private fun nameLine(c: Canvas, w: Float, title: String, text: TextMeasurer?) {
    boldText(c, text, "Name: ______________________", 0f, 16f, TextAnchor.Start)
    boldText(c, text, title, w, 16f, TextAnchor.End)
}

/** Tracing sheet: one guide → 4 practice rows; whole sheet → 4 guides per page (model + 3 dotted copies each). */
class TracePrint(private val sheet: Sheet, i: Int?) : Printable {
    private val guides: List<Guide> = if (i != null && sheet.guides.getOrNull(i) != null) listOf(sheet.guides[i]) else sheet.guides
    private val perPage = if (guides.size == 1) 1 else 4
    override val title = "${sheet.title} — tracing sheet"
    override val pages = (guides.size + perPage - 1) / perPage
    override fun draw(c: Canvas, page: Int, w: Float, h: Float, text: TextMeasurer?) {
        nameLine(c, w, sheet.title, text)
        val pg = guides.drop(page * perPage).take(perPage)
        val rowsPer = if (guides.size == 1) 4 else 1
        val totalRows = pg.size * rowsPer
        val top = 30f; val gap = 10f
        val rowH = (h - top - gap * (totalRows - 1)) / maxOf(totalRows, if (guides.size == 1) 4 else 4)
        var y = top
        val line = Paint().apply { isAntiAlias = false; color = Color(0xFFDDDDDD); strokeWidth = 1f }
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
                    GuideDraw.draw(c, g, 5f, k == 0 && r == 0, m, text = text)
                    c.restore()
                    c.drawLine(Offset(x, y + rowH), Offset(x + cellW, y + rowH), line)
                }
                y += rowH + gap
            }
        }
    }
}

class ColorPrint(private val page: ColoringPage, private val dl: DrawList) : Printable {
    override val title = "${page.title} — colouring page"
    override val pages = 1
    override fun draw(c: Canvas, page: Int, w: Float, h: Float, text: TextMeasurer?) {
        nameLine(c, w, this.page.title, text)
        // landscape art on portrait paper: as large as fits under the name line
        Templates.draw(c, this.page.id, dl, 0f, 30f, w, h - 30f, inkColor = 0xFF000000.toInt(), text = text)
    }
}

class ArtPrint(override val title: String, private val bmp: ImageBitmap) : Printable {
    override val pages = 1
    override fun draw(c: Canvas, page: Int, w: Float, h: Float, text: TextMeasurer?) {
        val s = min(w / bmp.width, (h - 30f) / bmp.height)
        val dw = bmp.width * s; val dh = bmp.height * s
        val x = (w - dw) / 2
        c.drawImageRect(
            bmp, IntOffset.Zero, IntSize(bmp.width, bmp.height), IntOffset(x.toInt(), 0), IntSize((x + dw).toInt() - x.toInt(), dh.toInt()),
            Paint().apply { filterQuality = FilterQuality.Low },
        )
        boldText(c, text, title, w / 2, dh + 20f, TextAnchor.Middle)
    }
}

/** Renders every page of a Printable as an A4 image and sends them to the system print dialog (save as PDF or any printer). */
fun printDocument(platform: Platform, doc: Printable, text: TextMeasurer?) {
    val k = PAGE_PX_W / A4W
    val pages = (0 until doc.pages).map { i ->
        val img = ImageBitmap(PAGE_PX_W, PAGE_PX_H)
        val c = Canvas(img)
        c.drawRect(0f, 0f, PAGE_PX_W.toFloat(), PAGE_PX_H.toFloat(), Paint().apply { color = Color.White })
        c.save(); c.scale(k, k); c.translate(MARGIN, MARGIN)
        doc.draw(c, i, A4W - MARGIN * 2, A4H - MARGIN * 2, text)
        c.restore()
        img
    }
    platform.printPages(doc.title, pages, landscape = false)
}

/** Printable sheets: art/print/trace/{sheetId}[?i=n], art/print/color/{pageId}, art/print/art/{artworkId}. */
@Composable
fun PrintScreen(kind: String, id: String, index: Int?) {
    val app = LocalApp.current
    val s by appState()
    val platform = app.platform
    val tm = rememberTextMeasurer()
    var doc by remember { mutableStateOf<Printable?>(null) }
    var failed by remember { mutableStateOf(false) }
    var page by remember { mutableIntStateOf(0) }
    var bmp by remember { mutableStateOf<ImageBitmap?>(null) }
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
    DisposableEffect(Unit) { onDispose { bmp?.release() } }
    // like the website: open the print dialog as soon as the sheet is ready
    LaunchedEffect(doc) { doc?.let { kotlinx.coroutines.delay(500); printDocument(platform, it, tm) } }
    val d = doc
    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar(d?.title ?: if (kind == "art") "My picture" else "Print", onBack = { app.back() }, actions = {
            WLButton("Print", { d?.let { printDocument(platform, it, tm) } }, kind = BtnKind.Primary, icon = Icons.Rounded.Print, small = true, enabled = d != null)
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
                        drawIntoCanvas { c ->
                            c.save(); c.scale(k, k); c.translate(MARGIN, MARGIN)
                            d.draw(c, page.coerceIn(0, d.pages - 1), A4W - MARGIN * 2, A4H - MARGIN * 2, tm)
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
