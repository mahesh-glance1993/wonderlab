package com.maheshglance.wonderlab.feature.art.tracing

import com.maheshglance.wonderlab.core.platform.*

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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.automirrored.rounded.NavigateBefore
import androidx.compose.material.icons.automirrored.rounded.NavigateNext
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.GridView
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Print
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material.icons.rounded.VisibilityOff
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import kotlin.math.roundToInt
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.ErrorState
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLFonts
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.feature.art.replaceTop
import com.maheshglance.wonderlab.feature.art.ui.CelebrationHost
import com.maheshglance.wonderlab.feature.art.ui.Segmented
import com.maheshglance.wonderlab.feature.art.ui.rememberCelebration
import com.maheshglance.wonderlab.feature.art.ui.rememberPresentation
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.launch
import kotlin.math.min

/** One tracing sheet: guided (line by line) or free tracing, with scoring, stars, "Show me" and print. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TraceScreen(sheetId: String, index: Int) {
    val app = LocalApp.current
    val te = WL.lang == "te"
    val pres = rememberPresentation()
    val sheet by produceState<Sheet?>(null, sheetId) { value = TraceData.sheet(app.engine, sheetId) }
    var loaded by remember { mutableStateOf(false) }
    LaunchedEffect(sheet) { if (sheet != null) loaded = true }
    LaunchedEffect(Unit) { kotlinx.coroutines.delay(4000); loaded = true }
    val sh = sheet
    if (sh == null) {
        if (loaded) LaunchedEffect(Unit) { app.replaceTop("art/trace") }
        Loading(); return
    }
    var idx by rememberSaveable(sheetId) { mutableIntStateOf(index.coerceIn(0, sh.guides.size - 1)) }
    val guide = sh.guides[idx.coerceIn(0, sh.guides.size - 1)]
    val reduced = LocalReduceMotion.current
    val scope = rememberCoroutineScope()
    val celebration = rememberCelebration()
    val win = LocalWindow.current

    val earlyTier = WL.tier.tier == "early"
    var tolName by rememberSaveable { mutableStateOf(if (earlyTier) "easy" else "medium") }
    var guidance by rememberSaveable { mutableStateOf(true) }
    var mode by rememberSaveable { mutableStateOf("guided") }
    val strokes = remember { mutableStateListOf<List<List<Float>>>() }
    var live by remember { mutableStateOf<List<List<Float>>?>(null) }
    var current by remember { mutableIntStateOf(0) }
    val done = remember { mutableStateListOf<Boolean>() }
    var msg by remember { mutableStateOf<Pair<Boolean, String>?>(null) }
    var result by remember { mutableStateOf<TraceScore?>(null) }
    var animStart by remember { mutableStateOf<Long?>(null) }
    var animT by remember { mutableStateOf(0f) }
    val tol = when (tolName) { "easy" -> 10f; "hard" -> 4.5f; else -> 7f }

    val reset = { strokes.clear(); live = null; current = 0; done.clear(); msg = null; result = null }
    val sayIt = { app.say(if (te) guide.sayTe ?: guide.say else guide.say, if (te) "te" else "en", guide.say) }

    LaunchedEffect(guide.id) {
        reset(); animStart = nanoTime()
        if (pres.readAloud) sayIt()
        app.repo.setLastActivity("/art/trace/${sh.id}?i=$idx", "Trace ${guide.label}")
    }
    LaunchedEffect(mode) { reset() }
    LaunchedEffect(animStart) {
        val st = animStart ?: return@LaunchedEffect
        val len = GuideDraw.animLength(guide) + 0.5f
        while (true) { val n = withFrameNanos { it }; animT = (n - st) / 1e9f; if (animT > len) break }
    }

    fun finish(all: List<List<List<Float>>>) = scope.launch {
        val r = runCatching { AppJson.decodeFromJsonElement(TraceScore.serializer(), app.engine.call("art.scoreGuide", sh.id, idx, all, tolName, mode == "guided")) }.getOrNull() ?: return@launch
        result = r
        msg = (r.stars >= 2) to r.feedback.joinToString(" ")
        if (r.stars >= 2) celebration.fire()
        if (r.stars >= 1) app.repo.award("art-trace-${guide.id}")
        app.say(if (te) (if (r.stars >= 2) "చాలా బాగుంది!" else "మంచి ప్రయత్నం!") else (if (r.stars >= 2) "Well done!" else "Good try!"), if (te) "te" else "en", if (r.stars >= 2) "Well done!" else "Good try!")
    }

    fun onStrokeEnd(raw: List<List<Float>>) {
        var pts = raw
        if (pts.size < 2) { if (pts.size == 1) pts = listOf(pts[0], listOf(pts[0][0] + 0.5f, pts[0][1])) else return }
        if (mode == "free") { strokes.add(pts); return }
        if (result != null) return
        val cur = current
        scope.launch {
            val g = runCatching { AppJson.decodeFromJsonElement(Guided.serializer(), app.engine.call("art.guidedStroke", sh.id, idx, cur, done.toList(), pts, tolName)) }.getOrNull() ?: return@launch
            if (g.ok) {
                strokes.add(pts)
                while (done.size <= cur) done.add(false)
                done[cur] = true
                if (cur + 1 >= guide.polys.size) { finish(strokes.toList()); return@launch }
                current = cur + 1
                msg = true to "Great! Now line ${cur + 2} — start at the green dot ${cur + 2}."
            } else msg = false to g.message
        }
    }
    val go = { n: Int -> idx = n }

    Box(Modifier.fillMaxSize().background(WL.colors.bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar(if (te) sh.titleTe else sh.title, onBack = { app.back() }, actions = {
                IconBtn(Icons.Rounded.Print, "Print", { app.go("art/print/trace/${sh.id}?i=$idx") }, size = 44.dp)
                IconBtn(Icons.Rounded.GridView, "All sheets", { app.replaceTop("art/trace") }, size = 44.dp)
            })
            Column(Modifier.weight(1f).fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    IconBtn(Icons.AutoMirrored.Rounded.NavigateBefore, "Previous", { go(idx - 1) }, enabled = idx > 0)
                    Text(guide.label, fontFamily = WLFonts.kid, fontSize = 34.sp, fontWeight = FontWeight.Bold, color = WL.colors.text, modifier = Modifier.weight(1f), textAlign = androidx.compose.ui.text.style.TextAlign.Center, maxLines = 1)
                    IconBtn(Icons.AutoMirrored.Rounded.NavigateNext, "Next", { go(idx + 1) }, enabled = idx < sh.guides.size - 1)
                    SpeakButton({ sayIt() })
                    Text("${idx + 1} / ${sh.guides.size}", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                }
                // the board takes all remaining space; the guide keeps its aspect ratio inside it
                BoxWithConstraints(Modifier.weight(1f).fillMaxWidth().clip(RoundedCornerShape(22.dp)).background(Color(TraceColors.BOARD)).padding(8.dp), contentAlignment = Alignment.Center) {
                    val bw = guide.box[2]; val bh = guide.box[3]
                    val sc = min(maxWidth.value / bw, maxHeight.value / bh)
                    Board(
                        guide, tol, guidance, if (mode == "guided" && result == null) current else -1, done.toList(),
                        if (animStart != null && animT <= GuideDraw.animLength(guide) + 0.4f) animT else null, reduced, strokes.toList(), live,
                        Modifier.size((bw * sc).dp, (bh * sc).dp),
                        onStart = { animStart = null }, onLive = { live = it }, onEnd = { live = null; onStrokeEnd(it) },
                    )
                }
                // status
                Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    val m = msg
                    if (m != null) AlertBox(m.second, if (m.first) AlertKind.Good else AlertKind.Bad)
                    else Text(if (mode == "guided") "Start at green dot ${current + 1} and follow the arrows." else "Trace the lines in any order, then press Check.", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                    result?.let { r ->
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.semantics { contentDescription = "${r.stars} of 3 stars" }) {
                            repeat(3) { k -> Icon(Icons.Rounded.Star, null, tint = if (k < r.stars) Color(0xFFF4B400) else WL.colors.line, modifier = Modifier.size(28.dp)) }
                            Text("  Covered ${(r.coverage * 100).toInt()}% · Neat ${(r.accuracy * 100).toInt()}%", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                        }
                    }
                }
                // controls
                FlowRow(Modifier.fillMaxWidth().navigationBarsPadding(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    WLButton(if (reduced) "Show order" else "Show me", { animStart = nanoTime() }, icon = if (reduced) Icons.Rounded.Visibility else Icons.Rounded.PlayArrow, small = true)
                    WLButton("Clear", { reset() }, icon = Icons.Rounded.Refresh, small = true)
                    if (mode == "free") WLButton("Check", { finish(strokes.toList()) }, icon = Icons.Rounded.Check, kind = BtnKind.Primary, small = true, enabled = strokes.isNotEmpty())
                    if (result != null && idx < sh.guides.size - 1) WLButton("Next", { go(idx + 1) }, icon = Icons.AutoMirrored.Rounded.ArrowForward, kind = BtnKind.Primary, small = true)
                    WLButton(if (guidance) "Arrows on" else "Arrows off", { guidance = !guidance }, icon = if (guidance) Icons.Rounded.Visibility else Icons.Rounded.VisibilityOff, small = true)
                    Segmented(listOf("guided" to "Step by step", "free" to "Free tracing"), mode, { mode = it }, Modifier.width(if (win.isPhone) 220.dp else 260.dp))
                    Segmented(listOf("easy" to "Easy", "medium" to "Medium", "hard" to "Hard"), tolName, { tolName = it }, Modifier.width(if (win.isPhone) 220.dp else 260.dp))
                }
            }
        }
        CelebrationHost(celebration)
    }
}

@Composable
private fun Board(
    g: Guide, tol: Float, guidance: Boolean, current: Int, done: List<Boolean>, anim: Float?, reduced: Boolean,
    strokes: List<List<List<Float>>>, live: List<List<Float>>?, modifier: Modifier,
    onStart: () -> Unit, onLive: (List<List<Float>>) -> Unit, onEnd: (List<List<Float>>) -> Unit,
) {
    val tm = androidx.compose.ui.text.rememberTextMeasurer()
    val bx = g.box[0]; val by = g.box[1]; val bw = g.box[2]; val bh = g.box[3]
    Canvas(
        modifier.semantics { contentDescription = "${g.label}: ${g.polys.size} ${if (g.polys.size == 1) "line" else "lines"} to trace" }
            .pointerInput(g.id) {
                awaitPointerEventScope {
                    var pts: MutableList<List<Float>>? = null
                    var pid: androidx.compose.ui.input.pointer.PointerId? = null
                    while (true) {
                        val e = awaitPointerEvent()
                        val sc = size.width / bw
                        fun toGuide(o: androidx.compose.ui.geometry.Offset) = listOf(((o.x / sc + bx) * 10).roundToInt() / 10f, ((o.y / sc + by) * 10).roundToInt() / 10f)
                        when (e.type) {
                            PointerEventType.Press -> {
                                val ch = e.changes.first()
                                if (pts == null) { pid = ch.id; pts = mutableListOf(toGuide(ch.position)); onStart(); onLive(pts!!.toList()) }
                                ch.consume()
                            }
                            PointerEventType.Move -> {
                                val ch = e.changes.firstOrNull { it.id == pid } ?: continue
                                val p = pts ?: continue
                                ch.historical.forEach { p.add(toGuide(it.position)) }
                                p.add(toGuide(ch.position)); onLive(p.toList()); ch.consume()
                            }
                            PointerEventType.Release -> {
                                val ch = e.changes.firstOrNull { it.id == pid } ?: continue
                                val p = pts ?: continue
                                pts = null; pid = null; ch.consume(); onEnd(p.toList())
                            }
                            else -> {}
                        }
                    }
                }
            },
    ) {
        val sc = size.width / bw
        drawIntoCanvas { c ->
            c.save(); c.scale(sc, sc); c.translate(-bx, -by)
            GuideDraw.draw(c, g, tol, guidance, GuideMode.Screen, current, done, anim, reduced, text = tm)
            val ink = androidx.compose.ui.graphics.Paint().apply {
                isAntiAlias = true
                style = androidx.compose.ui.graphics.PaintingStyle.Stroke; strokeCap = androidx.compose.ui.graphics.StrokeCap.Round; strokeJoin = androidx.compose.ui.graphics.StrokeJoin.Round
                color = Color(TraceColors.INK); alpha = 217 / 255f; strokeWidth = maxOf(2.5f, tol * 0.55f)
            }
            (strokes + listOfNotNull(live)).forEach { s ->
                if (s.isEmpty()) return@forEach
                val p = androidx.compose.ui.graphics.Path(); p.moveTo(s[0][0], s[0][1]); for (i in 1 until s.size) p.lineTo(s[i][0], s[i][1])
                if (s.size == 1) p.lineTo(s[0][0] + 0.01f, s[0][1])
                c.drawPath(p, ink)
            }
            c.restore()
        }
    }
}

@Suppress("unused") private val unusedErr: @Composable () -> Unit = { ErrorState("") }
