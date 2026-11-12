package com.maheshglance.wonderlab.feature.language

import android.content.Context
import android.graphics.Bitmap
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface
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
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.core.content.res.ResourcesCompat
import com.maheshglance.wonderlab.R
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

/** Course font for tracing and sheets (website TRACE_FONT: Noto Sans Telugu / Andika, weight 600). */
fun traceTypeface(ctx: Context, script: String): Typeface =
    (if (script == "te") ResourcesCompat.getFont(ctx, R.font.noto_sans_telugu) else ResourcesCompat.getFont(ctx, R.font.andika_bold)) ?: Typeface.DEFAULT_BOLD

fun tracePaint(ctx: Context, script: String): Paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    typeface = traceTypeface(ctx, script)
    if (script == "te") runCatching { fontVariationSettings = "'wght' 600" }
}

private data class GlyphLayout(val x: Float, val y: Float, val size: Float)

/** Same layout for the visible canvas and the scoring grid: glyph centred in the box (website Trace.tsx layout). */
private fun layoutGlyph(paint: Paint, letter: String, side: Float, script: String): GlyphLayout {
    val path = Path()
    val b = RectF()
    fun measure(sz: Float) { paint.textSize = sz; path.reset(); paint.getTextPath(letter, 0, letter.length, 0f, 0f, path); path.computeBounds(b, true) }
    var size = side * if (script == "te") 0.62f else 0.72f
    measure(size)
    val fit = minOf(1f, side * 0.82f / maxOf(1f, b.width()), side * 0.82f / maxOf(1f, b.height()))
    if (fit < 1f) { size *= fit; measure(size) }
    return GlyphLayout((side - b.width()) / 2f - b.left, (side - b.height()) / 2f - b.top, size)
}

private fun maskOf(bmp: Bitmap, threshold: Int): String {
    val px = IntArray(TRACE_GRID * TRACE_GRID)
    bmp.getPixels(px, 0, TRACE_GRID, 0, 0, TRACE_GRID, TRACE_GRID)
    val sb = StringBuilder(px.size)
    for (p in px) sb.append(if ((p ushr 24) and 0xff > threshold) '1' else '0')
    return sb.toString()
}

private fun glyphMask(ctx: Context, letter: String, script: String): String {
    val bmp = Bitmap.createBitmap(TRACE_GRID, TRACE_GRID, Bitmap.Config.ARGB_8888)
    val paint = tracePaint(ctx, script).apply { color = android.graphics.Color.BLACK }
    val l = layoutGlyph(paint, letter, TRACE_GRID.toFloat(), script)
    paint.textSize = l.size
    android.graphics.Canvas(bmp).drawText(letter, l.x, l.y, paint)
    return maskOf(bmp, 110).also { bmp.recycle() }
}

private fun drawStrokes(c: android.graphics.Canvas, strokes: List<List<Offset>>, side: Float, color: Int) {
    val p = Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color; strokeWidth = side * INK; strokeCap = Paint.Cap.ROUND; strokeJoin = Paint.Join.ROUND; style = Paint.Style.STROKE }
    val dot = Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color; style = Paint.Style.FILL }
    for (s in strokes) {
        if (s.isEmpty()) continue
        if (s.size == 1) { c.drawCircle(s[0].x * side, s[0].y * side, side * INK / 2f, dot); continue }
        val path = Path()
        s.forEachIndexed { i, o -> if (i == 0) path.moveTo(o.x * side, o.y * side) else path.lineTo(o.x * side, o.y * side) }
        c.drawPath(path, p)
    }
}

private fun inkMask(strokes: List<List<Offset>>): String {
    val bmp = Bitmap.createBitmap(TRACE_GRID, TRACE_GRID, Bitmap.Config.ARGB_8888)
    drawStrokes(android.graphics.Canvas(bmp), strokes, TRACE_GRID.toFloat(), android.graphics.Color.BLACK)
    return maskOf(bmp, 60).also { bmp.recycle() }
}

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
    val ctx = LocalContext.current
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
        if (r.stars >= 2) scope.launch { awardBadge(app, ctx, if (set.script == "te") "lang:first-trace-te" else "lang:first-trace-en") }
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
            AlertBox("${"★".repeat(r.stars)}${"☆".repeat(3 - r.stars)}  ${r.stars} of 3 stars. ${r.message} (covered ${Math.round(r.coverage * 100)}%, outside the letter ${Math.round(r.outside * 100)}%)",
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
                    Box(Modifier.weight(1f)) { strip(true) }
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
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val density = LocalDensity.current.density
    val strokes = remember(letter, clearSignal) { ArrayList<MutableList<Offset>>() }
    var version by remember { mutableIntStateOf(0) }
    var hasInk by remember(letter, clearSignal) { mutableStateOf(false) }
    val glyph = remember(letter, script) { glyphMask(ctx, letter, script) }
    var start by remember(letter) { mutableStateOf<Pair<Int, Int>?>(null) }
    LaunchedEffect(glyph) {
        start = runCatching { (app.engine.call("language.startPoint", glyph, script) as? JsonArray)?.let { it[0].jsonPrimitive.int to it[1].jsonPrimitive.int } }.getOrNull()
    }
    val paint = remember(script) { tracePaint(ctx, script) }
    Canvas(
        Modifier.size(side).clip(RoundedCornerShape(18.dp)).background(androidx.compose.ui.graphics.Color(0xFFFBFAF6))
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
        drawIntoCanvas { cv ->
            val c = cv.nativeCanvas
            val guide = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0x1F2F3A35; strokeWidth = density }
            listOf(0.25f, 0.5f, 0.75f).forEach { f -> c.drawLine(0f, px * f, px, px * f, guide) }
            val l = layoutGlyph(paint, letter, px, script)
            paint.textSize = l.size
            paint.style = Paint.Style.FILL; paint.pathEffect = null; paint.color = 0x213F6F58
            c.drawText(letter, l.x, l.y, paint)
            val outline = Path(); paint.getTextPath(letter, 0, letter.length, l.x, l.y, outline)
            val dash = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE; strokeWidth = 2f * density; color = 0x8C2F3A35.toInt(); pathEffect = DashPathEffect(floatArrayOf(4f * density, 5f * density), 0f) }
            c.drawPath(outline, dash)
            start?.let { (sx, sy) ->
                val cx = (sx + 0.5f) / TRACE_GRID * px; val cy = (sy + 0.5f) / TRACE_GRID * px
                val r = maxOf(8f * density, px * 0.028f)
                c.drawCircle(cx, cy, r, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFF2F6B4F.toInt() })
                val t = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = android.graphics.Color.WHITE; textSize = maxOf(px * 0.03f, 10f * density); textAlign = Paint.Align.CENTER; isFakeBoldText = true }
                c.drawText("1", cx, cy - (t.descent() + t.ascent()) / 2f, t)
            }
            drawStrokes(c, strokes, px, 0xFF2F6F9A.toInt())
        }
    }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        WLButton("Check my tracing", {
            val ink = inkMask(strokes)
            scope.launch { runCatching { onResult(app.engine.get<LTraceResult>("language.scoreTrace", glyph, ink, tol)) } }
        }, kind = BtnKind.Primary, icon = Icons.Rounded.Check, enabled = hasInk, modifier = Modifier.weight(1f))
        WLButton("Undo stroke", { if (strokes.isNotEmpty()) strokes.removeAt(strokes.size - 1); hasInk = strokes.isNotEmpty(); version++ }, icon = Icons.AutoMirrored.Rounded.Undo, enabled = hasInk)
    }
}
