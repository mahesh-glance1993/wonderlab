package com.maheshglance.wonderlab.feature.language

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.automirrored.rounded.Undo
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Print
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Canvas as GCanvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.CanvasDrawScope
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.drawText
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import kotlin.math.roundToInt
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.int

// Letter tracing (website Trace.tsx + tracing.ts). The glyph is drawn with the real bundled font onto the
// website's 96×96 scoring grid; the learner's ink is drawn onto the same grid; tracing.ts scoreTrace (run in the
// engine) compares them, so stars are given exactly like on the website.

private const val INK = 0.075f // ink width as a fraction of the box
const val TRACE_GRID = 96

internal data class GlyphLayout(val x: Float, val y: Float, val size: Float)

/** Same layout for the visible canvas and the scoring grid: glyph centred in the box (website Trace.tsx layout). */
internal fun layoutGlyph(tm: TextMeasurer, letter: String, side: Float, script: String): GlyphLayout {
    val u = glyphInkBounds(tm, letter, script)
    var size = side * if (script == "te") 0.62f else 0.72f
    val fit = minOf(1f, side * 0.82f / maxOf(1f, u.width * size), side * 0.82f / maxOf(1f, u.height * size))
    if (fit < 1f) size *= fit
    return GlyphLayout((side - u.width * size) / 2f - u.left * size, (side - u.height * size) / 2f - u.top * size, size)
}

private fun maskOf(img: ImageBitmap, threshold: Int): String {
    val px = IntArray(TRACE_GRID * TRACE_GRID)
    img.readPixels(px, 0, 0, TRACE_GRID, TRACE_GRID)
    val sb = StringBuilder(px.size)
    for (p in px) sb.append(if ((p ushr 24) and 0xff > threshold) '1' else '0')
    return sb.toString()
}

private fun gridMask(threshold: Int, draw: DrawScope.() -> Unit): String {
    val img = ImageBitmap(TRACE_GRID, TRACE_GRID)
    CanvasDrawScope().draw(Density(1f), LayoutDirection.Ltr, GCanvas(img), Size(TRACE_GRID.toFloat(), TRACE_GRID.toFloat()), draw)
    return maskOf(img, threshold)
}

private fun glyphMask(tm: TextMeasurer, letter: String, script: String): String = gridMask(110) {
    val l = layoutGlyph(tm, letter, TRACE_GRID.toFloat(), script)
    drawLineAt(tm.line(letter, traceStyle(script, l.size)), l.x, l.y, Color.Black)
}

private fun DrawScope.drawStrokes(strokes: List<List<Offset>>, side: Float, color: Color) {
    val stroke = Stroke(width = side * INK, cap = StrokeCap.Round, join = StrokeJoin.Round)
    for (s in strokes) {
        if (s.isEmpty()) continue
        if (s.size == 1) { drawCircle(color, side * INK / 2f, Offset(s[0].x * side, s[0].y * side)); continue }
        val path = Path()
        s.forEachIndexed { i, o -> if (i == 0) path.moveTo(o.x * side, o.y * side) else path.lineTo(o.x * side, o.y * side) }
        drawPath(path, color, style = stroke)
    }
}

private fun inkMask(strokes: List<List<Offset>>): String = gridMask(60) { drawStrokes(strokes, TRACE_GRID.toFloat(), Color.Black) }

/** /lang/:course/trace/:setId */
@Composable
fun TraceScreen(course: String, setId: String) {
    val data = rememberEngine<LTraceSet>("language.traceSet", course, setId)
    LoadOr(data) { TraceBody(course, it) }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun TraceBody(course: String, set: LTraceSet) {
    val app = LocalApp.current
    val win = LocalWindow.current
    val scope = rememberCoroutineScope()
    val sayer = rememberSayer()
    val pres = rememberPresentation()
    val key = LangKeys.traceKey(course, set.id)
    var st by remember {
        mutableStateOf(decodeOrNull<LTraceState>(app.repo.state.value.learner.activities[key]?.state) ?: LTraceState(0, emptyMap(), if (pres.tier == "early") "easy" else "medium"))
    }
    var result by remember { mutableStateOf<LTraceResult?>(null) }
    var clear by remember { mutableIntStateOf(0) }
    val n = set.letters.size
    val idx = st.index.coerceIn(0, n - 1)
    val letter = set.letters[idx]
    val tol = st.tol ?: "medium"
    val card = set.cards[letter]
    LaunchedEffect(set.id) { app.repo.setLastActivity("/lang/$course/trace/${set.id}", "Tracing: ${set.titleEn ?: set.title}") }

    fun save(s: LTraceState) { st = s; app.repo.saveActivityState(key, encode(s)) }
    fun goto(i: Int) {
        result = null
        val ni = (i + n) % n
        save(st.copy(index = ni))
        if (pres.readAloud) sayer.say(set.letters[ni], set.script)
    }
    fun onResult(r: LTraceResult) {
        result = r
        val best = maxOf(st.stars[letter] ?: 0, r.stars)
        save(st.copy(stars = st.stars + (letter to best)))
        sayer.say(r.message, "en")
        if (r.stars >= 2) scope.launch { awardBadge(app, if (set.script == "te") "lang:first-trace-te" else "lang:first-trace-en") }
        if (r.stars == 3) Celebrate.fire()
    }
    val totalStars = st.stars.values.sum()
    val phone = win.isPhone

    val controls: @Composable () -> Unit = {
        FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp), itemVerticalAlignment = Alignment.CenterVertically) {
            WLButton(if (phone) "" else "Prev", { goto(idx - 1) }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowBack)
            Pill("Letter ${idx + 1} of $n")
            WLButton(if (phone) "" else "Next", { goto(idx + 1) }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowForward)
            WLButton("Hear it", { sayer.say(if (card != null) "$letter. ${card.word}" else letter, set.script, card?.en) }, small = true, icon = Icons.AutoMirrored.Rounded.VolumeUp)
            WLButton("Clear", { result = null; clear++ }, small = true, kind = BtnKind.Ghost, icon = Icons.Rounded.Refresh)
        }
    }
    val info: @Composable () -> Unit = {
        if (card != null) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            LT(letter, set.script, style = MaterialTheme.typography.headlineMedium, weight = FontWeight.Bold, color = WL.colors.primary)
            Text("—", color = WL.colors.muted)
            LT(card.word, set.script, style = MaterialTheme.typography.titleMedium)
            Text("(${card.en})", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, maxLines = 1, modifier = Modifier.weight(1f, fill = false))
            EmojiImage(card.pic, 36.dp, label = card.en)
        }
    }
    val tolerance: @Composable (Modifier) -> Unit = { m ->
        Row(m, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("How strict", style = MaterialTheme.typography.labelMedium, color = WL.colors.muted)
            Segmented(tol, listOf("easy" to "Easy", "medium" to "Medium", "hard" to "Tricky"), { result = null; save(st.copy(tol = it)) }, Modifier.weight(1f))
        }
    }
    val resultBox: @Composable () -> Unit = {
        result?.let { r ->
            AlertBox("${"★".repeat(r.stars)}${"☆".repeat(3 - r.stars)}  ${r.stars} of 3 stars. ${r.message} (covered ${(r.coverage * 100).roundToInt()}%, outside the letter ${(r.outside * 100).roundToInt()}%)",
                if (r.stars >= 2) AlertKind.Good else AlertKind.Warn)
        }
    }
    val strip: @Composable (Boolean) -> Unit = { grid ->
        val item: @Composable (Int, String) -> Unit = { i, l ->
            LKeyBtn(l, set.script, { goto(i) }, selected = i == idx, minSize = 46.dp, label = st.stars[l]?.takeIf { it > 0 }?.let { "★".repeat(it) })
        }
        if (grid) FlowRow(horizontalArrangement = Arrangement.spacedBy(5.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) { set.letters.forEachIndexed { i, l -> item(i, l) } }
        else {
            val list = rememberLazyListState()
            LaunchedEffect(idx) { list.animateScrollToItem((idx - 2).coerceAtLeast(0)) }
            LazyRow(state = list, horizontalArrangement = Arrangement.spacedBy(5.dp)) { itemsIndexed(set.letters) { i, l -> item(i, l) } }
        }
    }

    LangFrame({
        LangBar(set.title, set.script, subtitle = "Tracing", subtitleScript = "en") {
            Pill("$totalStars stars", bg = WL.colors.warnBg, fg = WL.colors.text)
            WLButton(if (phone) "" else "Print sheet", { app.go("lang/$course/print/${set.id}") }, small = true, icon = Icons.Rounded.Print)
        }
    }) {
        BoxWithConstraints(Modifier.fillMaxSize().padding(horizontal = if (phone) 10.dp else 20.dp, vertical = 8.dp)) {
            val wide = maxWidth > maxHeight
            val mw = maxWidth; val mh = maxHeight
            if (wide) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Column(Modifier.weight(1f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    controls(); info(); tolerance(Modifier.fillMaxWidth()); VoiceNote(course); resultBox()
                    Box(Modifier.weight(1f)) { strip(!phone) }
                    if (!phone) Text("Use a finger or a pen. The printable sheet is another way to practise.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                }
                val side = minOf(mh - 56.dp, mw * 0.55f)
                Column(Modifier.width(side), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    TraceCanvas(letter, set.script, tol, clear, side, ::onResult)
                }
            } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                controls(); info(); tolerance(Modifier.fillMaxWidth()); VoiceNote(course)
                BoxWithConstraints(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.TopCenter) {
                    val side = minOf(maxWidth, maxHeight - 52.dp).coerceAtLeast(160.dp)
                    Column(Modifier.width(side), verticalArrangement = Arrangement.spacedBy(6.dp)) { TraceCanvas(letter, set.script, tol, clear, side, ::onResult) }
                }
                resultBox()
                strip(false)
            }
        }
    }
}

@Composable
private fun TraceCanvas(letter: String, script: String, tol: String, clearSignal: Int, side: Dp, onResult: (LTraceResult) -> Unit) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val density = LocalDensity.current.density
    val strokes = remember(letter, clearSignal) { ArrayList<MutableList<Offset>>() }
    var version by remember { mutableIntStateOf(0) }
    var hasInk by remember(letter, clearSignal) { mutableStateOf(false) }
    val tm = rememberPxTextMeasurer()
    val glyph = remember(letter, script) { glyphMask(tm, letter, script) }
    var start by remember(letter) { mutableStateOf<Pair<Int, Int>?>(null) }
    LaunchedEffect(glyph) {
        start = runCatching { (app.engine.call("language.startPoint", glyph, script) as? JsonArray)?.let { it[0].jsonPrimitive.int to it[1].jsonPrimitive.int } }.getOrNull()
    }
    Canvas(
        Modifier.size(side).clip(RoundedCornerShape(18.dp)).background(Color(0xFFFBFAF6))
            .semantics { contentDescription = "Tracing area for the letter $letter. Draw over the dotted letter starting at the green dot marked 1." }
            .pointerInput(letter, clearSignal) {
                awaitEachGesture {
                    val down = awaitFirstDown()
                    val w = size.width.toFloat()
                    fun pt(o: Offset) = Offset((o.x / w).coerceIn(0f, 1f), (o.y / size.height).coerceIn(0f, 1f))
                    val s = mutableListOf(pt(down.position))
                    strokes.add(s); hasInk = true; version++
                    down.consume()
                    while (true) {
                        val ev = awaitPointerEvent()
                        val ch = ev.changes.firstOrNull { it.id == down.id } ?: break
                        ch.historical.forEach { s.add(pt(it.position)) }
                        s.add(pt(ch.position))
                        ch.consume()
                        version++
                        if (!ch.pressed) break
                    }
                }
            },
    ) {
        @Suppress("UNUSED_EXPRESSION") version
        val px = size.width
        val guide = Color(0x1F2F3A35)
        listOf(0.25f, 0.5f, 0.75f).forEach { f -> drawLine(guide, Offset(0f, px * f), Offset(px, px * f), strokeWidth = density) }
        val l = layoutGlyph(tm, letter, px, script)
        val glyphLay = tm.line(letter, traceStyle(script, l.size))
        drawLineAt(glyphLay, l.x, l.y, Color(0x213F6F58))
        drawLineAt(glyphLay, l.x, l.y, Color(0x8C2F3A35), Stroke(width = 2f * density, pathEffect = PathEffect.dashPathEffect(floatArrayOf(4f * density, 5f * density), 0f)))
        start?.let { (sx, sy) ->
            val cx = (sx + 0.5f) / TRACE_GRID * px; val cy = (sy + 0.5f) / TRACE_GRID * px
            val r = maxOf(8f * density, px * 0.028f)
            drawCircle(Color(0xFF2F6B4F), r, Offset(cx, cy))
            val one = tm.line("1", plainStyle(maxOf(px * 0.03f, 10f * density), Color.White, bold = true))
            drawText(one, topLeft = Offset(cx - one.size.width / 2f, cy - one.size.height / 2f))
        }
        drawStrokes(strokes, px, Color(0xFF2F6F9A))
    }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        WLButton("Check my tracing", {
            val ink = inkMask(strokes)
            scope.launch { runCatching { onResult(app.engine.get<LTraceResult>("language.scoreTrace", glyph, ink, tol)) } }
        }, kind = BtnKind.Primary, icon = Icons.Rounded.Check, enabled = hasInk, modifier = Modifier.weight(1f))
        WLButton("Undo stroke", { if (strokes.isNotEmpty()) strokes.removeAt(strokes.size - 1); hasInk = strokes.isNotEmpty(); version++ }, icon = Icons.AutoMirrored.Rounded.Undo, enabled = hasInk)
    }
}
