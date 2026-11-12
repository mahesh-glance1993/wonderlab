package com.maheshglance.wonderlab.feature.lab

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.feature.games.dbl
import com.maheshglance.wonderlab.feature.games.j
import com.maheshglance.wonderlab.feature.games.jsonOf
import com.maheshglance.wonderlab.feature.games.drawArrow
import com.maheshglance.wonderlab.feature.games.list
import com.maheshglance.wonderlab.feature.games.bool
import com.maheshglance.wonderlab.feature.games.str
import com.maheshglance.wonderlab.feature.games.strs
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.serialization.json.JsonElement
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.math.sign

private fun JsonElement?.toMotion() = MotionParams(j("u").dbl() ?: 2.0, j("a").dbl() ?: 1.0, j("t").dbl() ?: 8.0)
private fun MotionParams.json() = jsonOf("u" to u, "a" to a, "t" to t)
private fun MotionState.json() = jsonOf("steps" to steps, "t" to t, "x" to x, "v" to v, "stopped" to stopped, "done" to done)

private const val FLAG = 25.0

@Composable
fun MotionLab(query: Map<String, String>) {
    val app = LocalApp.current
    val session = rememberLabSession("motion")
    val tier = rememberLabTier()
    var params by remember { mutableStateOf(MotionParams()) }
    var sim by remember { mutableStateOf(Motion.init(params)) }
    var playing by remember { mutableStateOf(false) }
    var active by remember { mutableStateOf<String?>(null) }
    var runId by remember { mutableIntStateOf(0) }
    var intro by remember { mutableStateOf<JsonElement?>(null) }
    var challenges by remember { mutableStateOf<List<JsonElement>>(emptyList()) }
    var pred by remember { mutableStateOf<JsonElement?>(null) }
    var met by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { params = session.load(query).toMotion(); sim = Motion.init(params) }
    LaunchedEffect(tier.simple) {
        intro = app.engine.call("lab.intro", "motion", tier.simple)
        challenges = app.engine.call("lab.challenges", "motion", tier.simple, 0).list()
    }
    fun setParams(p: MotionParams) { params = p; sim = Motion.init(p); playing = false; session.setParams(p.json()) }
    LaunchedEffect(params, tier.simple, tier.typed) { pred = runCatching { app.engine.call("lab.prediction", "motion", params.json(), tier.simple || !tier.typed) }.getOrNull() }
    LaunchedEffect(params) { kotlinx.coroutines.delay(600); session.saveNow() }
    DisposableEffect(Unit) { onDispose { session.saveNow() } }
    SimLoop(playing, Motion.DT) { n -> sim = Motion.advance(sim, params, n) }
    LaunchedEffect(sim.done) { if (sim.done) playing = false }
    val announce = if (sim.done) "Run finished at t = ${fmt(sim.t)} s: speed ${fmt(sim.v)} metres per second, distance ${fmt(sim.x)} metres${if (sim.stopped) ", car stopped" else ""}." else ""
    val cur = challenges.firstOrNull { it.j("id").str() == active }
    LaunchedEffect(active, params, sim.done, sim.stopped) {
        met = active != null && runCatching { app.engine.call("lab.check", "motion", active, params.json(), sim.json(), 0).bool() == true }.getOrDefault(false)
        if (met && cur != null) session.complete(active!!, cur.j("title").str() ?: "", "sim", jsonOf("params" to params.json()))
    }
    val locked = { k: String -> cur.j("locked").strs().contains(k) }

    val out = Motion.outcome(params)
    val flag = if (active == "flag") FLAG else null
    val trackMax = LabMath.niceCeil(max(max(out.x, flag ?: 0.0), 10.0) * 1.05)
    val vScale = LabMath.niceCeil(max(out.vMax, 1.0))
    val phase = if (sim.done) "after" else if (sim.steps == 0 && !playing) "before" else "running"
    val simple = tier.simple
    val k = Motion.kinematics(params.u, params.a, sim.t)
    val sign = { n: Double -> if (n < 0) "(${fmt(n)})" else fmt(n) }

    val tabs = buildList {
        add(LabTab("set", "Settings") {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                NumberSlider(if (simple) "Starting speed" else "Initial speed u", params.u, Motion.RANGES.getValue("u"), "m/s", { setParams(params.copy(u = it)) }, locked("u"))
                NumberSlider(if (simple) "Speeding up (+) or braking (−)" else "Acceleration a", params.a, Motion.RANGES.getValue("a"), "m/s²", { setParams(params.copy(a = it)) }, locked("a"),
                    note = if (params.a < 0) "Negative: the car is braking." else if (params.a > 0) "Positive: the car is speeding up." else "Zero: steady speed.")
                if (!simple || locked("t")) NumberSlider(if (simple) "Run time" else "Run time t", params.t, Motion.RANGES.getValue("t"), "s", { setParams(params.copy(t = it)) }, locked("t"))
                if (!simple) Formulas("Equations of motion", listOf(
                    "v = u + at = ${fmt(params.u)} + ${sign(params.a)} × ${fmt(sim.t, 2)} = **${fmt(k.v, 2)} m/s**${if (k.stopped) " (stopped)" else ""}",
                    "s = ut + ½at² = ${fmt(params.u)} × ${fmt(sim.t, 2)} + ½ × ${sign(params.a)} × ${fmt(sim.t, 2)}² = **${fmt(k.x, 2)} m**",
                ))
            }
        })
        add(LabTab("predict", "Predict") { androidx.compose.runtime.key(params, runId) { PredictionPanel(session, pred, phase, tier.typed) } })
        add(LabTab("chal", "Challenges") {
            ChallengesPanel(session, challenges, active, met, tier.typed, onStart = { id ->
                val c = challenges.first { it.j("id").str() == id }
                active = id; runId++
                setParams(c.j("setup").let { s -> MotionParams(s.j("u").dbl() ?: params.u, s.j("a").dbl() ?: params.a, s.j("t").dbl() ?: params.t) })
            }, onExit = { active = null })
        })
        add(LabTab("graphs", if (simple) "Graphs" else "Graphs") {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                TimeGraph("Position–time graph", sim.samples.map { it.t to it.x }, params.t, 0.0, LabMath.niceCeil(max(out.x, 1.0)), "position s", "m", sim.t to sim.x, Color(0xFF5145CD), 150.dp)
                TimeGraph("Velocity–time graph", sim.samples.map { it.t to it.v }, params.t, 0.0, vScale, "velocity v", "m/s", sim.t to sim.v, Color(0xFF2FA37A), 150.dp)
            }
        })
        add(LabTab("table", "Table") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ValuesTable("Values now", buildList {
                    add(Triple("Time t", fmt(sim.t, 2), "s")); add(Triple("Starting speed u", fmt(params.u), "m/s")); add(Triple("Acceleration a", fmt(params.a), "m/s²"))
                    add(Triple(if (simple) "Distance" else "Position s", fmt(sim.x, 2), "m")); add(Triple(if (simple) "Speed" else "Velocity v", fmt(sim.v, 2), "m/s"))
                    add(Triple("Car stopped?", if (sim.stopped) "yes" else "no", null))
                    if (flag != null) add(Triple("Distance to flag", fmt(flag - sim.x, 2), "m"))
                }, columns = 2)
                val rows = sim.samples.filterIndexed { i, _ -> i % 10 == 0 || i == sim.samples.size - 1 }
                ValuesTable("Graph data (every 0.5 s): t (s) → s (m), v (m/s)", rows.map { Triple(fmt(it.t, 2), "${fmt(it.x, 2)} m", "· ${fmt(it.v, 2)} m/s") }, columns = if (rows.size > 14) 3 else 2)
            }
        })
    }

    LabScaffold(
        "Motion Lab", session, intro,
        stage = { m -> MotionStage(m, params, sim, trackMax, vScale, flag, simple) },
        readline = { Announce(announce); ReadLine("t" to "${fmt(sim.t, 2)} s", (if (simple) "Distance" else "s") to "${fmt(sim.x, 2)} m", (if (simple) "Speed" else "v") to "${fmt(sim.v, 2)} m/s") },
        transport = {
            Transport(playing, sim.done, "Step forward 0.5 seconds", { playing = true }, { playing = false },
                { playing = false; sim = Motion.advance(sim, params, 10) }, { playing = false; sim = Motion.init(params); runId++ })
        },
        tabs = tabs,
    )
}

@Composable
private fun MotionStage(m: Modifier, p: MotionParams, sim: MotionState, trackMax: Double, vScale: Double, flag: Double?, simple: Boolean) {
    val measurer = rememberTextMeasurer()
    val c = WL.colors
    val density = LocalDensity.current
    BoxWithConstraints(m.semantics { contentDescription = "Car on a track at ${fmt(sim.x)} m, moving at ${fmt(sim.v)} m/s, time ${fmt(sim.t)} s${if (flag != null) ". Flag at ${fmt(flag)} m" else ""}." }) {
        val W = constraints.maxWidth.toFloat(); val H = constraints.maxHeight.toFloat()
        val x0 = W * 0.07f; val x1 = W * 0.95f
        val roadY = H * 0.70f
        fun px(mm: Double) = (x0 + (mm / trackMax) * (x1 - x0)).toFloat()
        val carX = px(sim.x)
        val carW = (H * 0.28f).coerceIn(40f, 160f)
        Canvas(Modifier.fillMaxSize()) {
            // sky + grass
            drawRect(Brush.verticalGradient(listOf(Color(0xFFCFE8FF), Color(0xFFEFF7FF)), 0f, roadY), Offset.Zero, Size(W, roadY))
            drawRect(Brush.verticalGradient(listOf(Color(0xFF8BC48A), Color(0xFF5E9F5E)), roadY, H), Offset(0f, roadY), Size(W, H - roadY))
            // road with dashes
            val roadH = H * 0.09f
            drawRoundRect(Brush.verticalGradient(listOf(Color(0xFF555B66), Color(0xFF3A3F48)), roadY - roadH / 2, roadY + roadH / 2), Offset(x0 - 14f, roadY - roadH / 2), Size(x1 - x0 + 28f, roadH), CornerRadius(roadH / 2))
            var dx = x0; while (dx < x1) { drawLine(Color(0xFFF2D06B), Offset(dx, roadY), Offset(dx + 16f, roadY), strokeWidth = 3f); dx += 34f }
            val tick = trackMax / 5
            for (i in 0..5) {
                val mm = i * tick; val x = px(mm)
                drawLine(c.text, Offset(x, roadY + roadH / 2), Offset(x, roadY + roadH / 2 + 8f), strokeWidth = 2f)
                val lay = measurer.measure("${fmt(mm, 1)} m", TextStyle(fontSize = 11.sp, color = Color(0xFF1D2540), fontWeight = FontWeight.Bold))
                drawText(lay, topLeft = Offset(x - lay.size.width / 2f, roadY + roadH / 2 + 10f))
            }
            // velocity and acceleration arrows
            val vLen = (sim.v / vScale * W * 0.18f).toFloat()
            val ay = roadY - carW * 0.95f
            drawArrow(Offset(carX, ay), Offset(carX + vLen, ay), Color(0xFF2FA37A), 5f)
            val vl = measurer.measure("v = ${fmt(sim.v, 1)} m/s", TextStyle(fontSize = 12.sp, color = Color(0xFF1E6B4E), fontWeight = FontWeight.Bold))
            drawText(vl, topLeft = Offset((carX + vLen / 2 - vl.size.width / 2f).coerceIn(0f, W - vl.size.width), ay - vl.size.height - 4f))
            if (!simple) {
                val aLen = if (p.a == 0.0 || sim.stopped) 0f else (sign(p.a) * (20 + abs(p.a) / 10 * 70) * W / 600).toFloat()
                val ay2 = ay - vl.size.height - 22f
                drawArrow(Offset(carX, ay2), Offset(carX + aLen, ay2), Color(0xFFE5637A), 5f)
                val al = measurer.measure("a = ${fmt(if (sim.stopped) 0.0 else p.a, 1)} m/s²", TextStyle(fontSize = 12.sp, color = Color(0xFF9D174D), fontWeight = FontWeight.Bold))
                drawText(al, topLeft = Offset((carX + aLen / 2 - al.size.width / 2f).coerceIn(0f, W - al.size.width), ay2 - al.size.height - 4f))
            }
            val tl = measurer.measure("t = ${fmt(sim.t, 2)} s", TextStyle(fontSize = 14.sp, color = Color(0xFF1D2540), fontWeight = FontWeight.ExtraBold))
            drawText(tl, topLeft = Offset(W - tl.size.width - 12f, 10f))
            if (flag != null) {
                val lay = measurer.measure("flag ${fmt(flag)} m", TextStyle(fontSize = 11.sp, color = Color(0xFF1D2540), fontWeight = FontWeight.Bold))
                drawText(lay, topLeft = Offset(px(flag) - lay.size.width / 2f, roadY - carW * 1.25f - lay.size.height))
            }
            // car shadow
            drawOval(Color.Black.copy(alpha = .25f), Offset(carX - carW * .45f, roadY - roadH * .1f), Size(carW * .9f, roadH * .5f))
        }
        if (flag != null) {
            val f = with(density) { (carW * 1.1f).toDp() }
            Box(Modifier.offset { IntOffset((px(flag) - carW * 0.25f).roundToInt(), (roadY - carW * 1.1f - 2f).roundToInt()) }) { EmojiImage("🚩", f) }
        }
        // the car: a realistic 3D picture (the image faces left, so it is mirrored to drive right)
        val cw = with(density) { carW.toDp() }
        Box(Modifier.offset { IntOffset((carX - carW / 2).roundToInt(), (roadY - carW * 0.82f).roundToInt()) }.size(cw)) { EmojiImage("🚗", cw, Modifier.scale(scaleX = -1f, scaleY = 1f)) }
    }
}

