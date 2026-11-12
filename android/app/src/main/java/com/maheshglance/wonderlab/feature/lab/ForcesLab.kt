package com.maheshglance.wonderlab.feature.lab

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
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
import androidx.compose.ui.Modifier
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
import com.maheshglance.wonderlab.feature.games.Segmented
import com.maheshglance.wonderlab.feature.games.bool
import com.maheshglance.wonderlab.feature.games.dbl
import com.maheshglance.wonderlab.feature.games.drawArrow
import com.maheshglance.wonderlab.feature.games.j
import com.maheshglance.wonderlab.feature.games.jsonOf
import com.maheshglance.wonderlab.feature.games.list
import com.maheshglance.wonderlab.feature.games.str
import com.maheshglance.wonderlab.feature.games.strs
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.serialization.json.JsonElement
import kotlin.math.abs
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

private fun JsonElement?.toForces() = ForcesParams(j("mass").dbl() ?: 5.0, j("force").dbl() ?: 30.0, j("friction").dbl() ?: 0.3)
private fun ForcesParams.json() = jsonOf("mass" to mass, "force" to force, "friction" to friction)
private fun ForcesState.json() = jsonOf("steps" to steps, "t" to t, "x" to x, "v" to v, "done" to done)
private val SURFACES = listOf(0.05 to "Ice", 0.3 to "Wood", 0.5 to "Carpet", 0.8 to "Sandpaper")
private fun surfaceName(mu: Double) = SURFACES.firstOrNull { abs(it.first - mu) < 1e-9 }?.second

@Composable
fun ForcesLab(query: Map<String, String>) {
    val app = LocalApp.current
    val session = rememberLabSession("forces")
    val tier = rememberLabTier()
    var params by remember { mutableStateOf(ForcesParams()) }
    var sim by remember { mutableStateOf(ForcesState()) }
    var playing by remember { mutableStateOf(false) }
    var active by remember { mutableStateOf<String?>(null) }
    var runId by remember { mutableIntStateOf(0) }
    var intro by remember { mutableStateOf<JsonElement?>(null) }
    var challenges by remember { mutableStateOf<List<JsonElement>>(emptyList()) }
    var pred by remember { mutableStateOf<JsonElement?>(null) }
    var met by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { params = session.load(query).toForces() }
    LaunchedEffect(tier.simple) {
        intro = app.engine.call("lab.intro", "forces", tier.simple)
        challenges = app.engine.call("lab.challenges", "forces", tier.simple, 0).list()
    }
    // like the website, changing a setting does not restart the run (Reset does)
    fun setParams(p: ForcesParams) { params = p; session.setParams(p.json()) }
    fun reset() { playing = false; sim = ForcesState(); runId++ }
    LaunchedEffect(params, tier.simple, tier.typed) { pred = runCatching { app.engine.call("lab.prediction", "forces", params.json(), tier.simple || !tier.typed) }.getOrNull() }
    LaunchedEffect(params) { kotlinx.coroutines.delay(600); session.saveNow() }
    DisposableEffect(Unit) { onDispose { session.saveNow() } }
    SimLoop(playing, Forces.DT) { n -> sim = Forces.advance(sim, params, n) }
    LaunchedEffect(sim.done) { if (sim.done) playing = false }
    val cur = challenges.firstOrNull { it.j("id").str() == active }
    LaunchedEffect(active, params, sim.t > 0) {
        met = active != null && runCatching { app.engine.call("lab.check", "forces", active, params.json(), sim.json(), 0).bool() == true }.getOrDefault(false)
        if (met && cur != null) session.complete(active!!, cur.j("title").str() ?: "", "sim", jsonOf("params" to params.json()))
    }
    val locked = { k: String -> cur.j("locked").strs().contains(k) }
    val b = Forces.breakdown(params, sim.v)
    val simple = tier.simple
    val phase = if (sim.done || sim.t >= 1) "after" else if (sim.steps == 0 && !playing) "before" else "running"
    val announce = if (sim.done) "Run finished after ${fmt(Forces.RUN)} seconds. The box travelled ${fmt(sim.x)} metres and is moving at ${fmt(sim.v)} metres per second." else ""

    val tabs = buildList {
        add(LabTab("set", "Settings") {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                NumberSlider(if (simple) "Mass of the box" else "Mass m", params.mass, Forces.RANGES.getValue("mass"), "kg", { setParams(params.copy(mass = it)) }, locked("mass"))
                NumberSlider(if (simple) "Push" else "Applied force F", params.force, Forces.RANGES.getValue("force"), "N", { setParams(params.copy(force = it)) }, locked("force"))
                if (simple) {
                    Text("Floor${if (locked("friction")) " (fixed)" else ""}", style = MaterialTheme.typography.labelMedium, color = WL.colors.text)
                    if (locked("friction")) Text("${surfaceName(params.friction) ?: "Custom"} (μ = ${fmt(params.friction)})", style = MaterialTheme.typography.bodyMedium, color = WL.colors.text)
                    else Segmented(SURFACES.map { it.first to "${it.second} (μ ${fmt(it.first)})" }, if (surfaceName(params.friction) != null) params.friction else -1.0, { setParams(params.copy(friction = it)) })
                } else NumberSlider("Friction coefficient μ", params.friction, Forces.RANGES.getValue("friction"), "", { setParams(params.copy(friction = it)) }, locked("friction"),
                    note = surfaceName(params.friction)?.let { "About the same as ${it.lowercase()}." }, display = { "μ ${fmt(it)}" })
                if (!simple) Formulas("Newton’s second law", listOf(
                    "W = mg = ${fmt(params.mass)} × ${fmt(Forces.G)} = **${fmt(b.weight)} N**",
                    "Max friction = μmg = ${fmt(params.friction)} × ${fmt(b.normal)} = **${fmt(b.maxFriction)} N**",
                    "F₍net₎ = F − friction = ${fmt(params.force)} − ${fmt(b.friction)} = **${fmt(b.net)} N**",
                    "a = F₍net₎ ÷ m = ${fmt(b.net)} ÷ ${fmt(params.mass)} = **${fmt(b.acceleration)} m/s²**",
                ))
            }
        })
        add(LabTab("predict", "Predict") { androidx.compose.runtime.key(params, runId) { PredictionPanel(session, pred, phase, tier.typed) } })
        add(LabTab("chal", "Challenges") {
            ChallengesPanel(session, challenges, active, met, tier.typed, onStart = { id ->
                val c = challenges.first { it.j("id").str() == id }.j("setup")
                active = id
                setParams(ForcesParams(c.j("mass").dbl() ?: params.mass, c.j("force").dbl() ?: params.force, c.j("friction").dbl() ?: params.friction)); reset()
            }, onExit = { active = null })
        })
        add(LabTab("table", "Table") {
            ValuesTable("Forces and motion now", listOf(
                Triple("Mass m", fmt(params.mass), "kg"), Triple(if (simple) "Push" else "Applied force F", fmt(params.force), "N"),
                Triple("Friction coefficient μ", "${fmt(params.friction)}${surfaceName(params.friction)?.let { " ($it)" } ?: ""}", null),
                Triple("Weight (mg)", fmt(b.weight), "N"), Triple("Normal force", fmt(b.normal), "N"), Triple("Most friction possible (μmg)", fmt(b.maxFriction), "N"),
                Triple("Friction now", fmt(b.friction), "N"), Triple("Net force", fmt(b.net), "N"), Triple("Acceleration a", fmt(b.acceleration), "m/s²"),
                Triple("Moving?", if (b.sliding) "yes" else "no", null), Triple("Time", fmt(sim.t, 2), "s"), Triple("Speed", fmt(sim.v, 2), "m/s"), Triple("Distance", fmt(sim.x, 2), "m"),
            ), columns = 2)
        })
    }

    LabScaffold(
        "Forces Lab", session, intro,
        stage = { m -> ForcesStage(m, params, sim, b, simple) },
        readline = {
            Announce(announce)
            if (simple) ReadLine("" to if (b.sliding) "Sliding" else "Not moving", "Speed" to "${fmt(sim.v, 2)} m/s", "Distance" to "${fmt(sim.x, 2)} m")
            else ReadLine("" to if (b.sliding) "Sliding" else "Not moving", "v" to "${fmt(sim.v, 2)} m/s", "x" to "${fmt(sim.x, 2)} m", "a" to "${fmt(b.acceleration, 2)} m/s²")
        },
        transport = { Transport(playing, sim.done, "Step forward 0.5 seconds", { playing = true }, { playing = false }, { playing = false; sim = Forces.advance(sim, params, 10) }, { reset() }) },
        tabs = tabs,
    )
}

private val FLOOR_COLORS = mapOf(0 to listOf(Color(0xFFE6F6FF), Color(0xFFB9E3F7)), 1 to listOf(Color(0xFFE0B985), Color(0xFFB98A55)), 3 to listOf(Color(0xFFD9B98A), Color(0xFFA9875A)), 5 to listOf(Color(0xFFC0645A), Color(0xFF8E3F38)), 8 to listOf(Color(0xFFCDBB8C), Color(0xFF9C8858)))

@Composable
private fun ForcesStage(m: Modifier, p: ForcesParams, sim: ForcesState, b: ForceBreakdown, simple: Boolean) {
    val measurer = rememberTextMeasurer()
    val density = LocalDensity.current
    BoxWithConstraints(m.semantics { contentDescription = "Box of ${fmt(p.mass)} kg pushed with ${fmt(p.force)} newtons. Friction ${fmt(b.friction)} N, weight ${fmt(b.weight)} N, normal force ${fmt(b.normal)} N. ${if (b.sliding) "Sliding with acceleration ${fmt(b.acceleration)} m/s²." else "Not moving."}" }) {
        val W = constraints.maxWidth.toFloat(); val H = constraints.maxHeight.toFloat()
        val s = min(W / 600f, H / 340f)
        val ppm = 40f * s
        val x0 = W * 0.28f
        val floor = H * 0.62f
        val boxW = (50f + min(40.0, p.mass).toFloat()) * s * 1.2f
        val travel = (sim.x * ppm).toFloat()
        val boxX = x0 + min(travel, W * 0.27f)
        val offset = travel - (boxX - x0)
        val cy = floor - boxW * 0.45f
        val fScale = (H * 0.28f) / max(max(p.force, b.weight), max(b.maxFriction, 1.0)).toFloat()
        fun L(f: Double) = f.toFloat() * fScale
        Canvas(Modifier.fillMaxSize()) {
            drawRect(Brush.verticalGradient(listOf(Color(0xFFF4F1EA), Color(0xFFE8E2D6)), 0f, floor), Offset.Zero, Size(W, floor))
            val mu10 = (p.friction * 10).roundToInt()
            val cols = FLOOR_COLORS[mu10] ?: FLOOR_COLORS[(FLOOR_COLORS.keys.minByOrNull { abs(it - mu10) }) ?: 3]!!
            drawRect(Brush.verticalGradient(cols, floor, floor + 30f * s), Offset(0f, floor), Size(W, H - floor))
            if (p.friction >= 0.5) { var gx = -(offset % 8f); while (gx < W) { drawCircle(Color.Black.copy(alpha = .08f), 1.6f, Offset(gx, floor + 6f + (gx * 7 % 13))); gx += 8f } }
            val first = floor((offset / ppm).toDouble()).toInt() - 8
            for (mm in first..first + 40) {
                val x = x0 + mm * ppm - offset
                if (x < -10 || x > W + 10) continue
                drawLine(Color(0xFF1D2540), Offset(x, floor), Offset(x, floor + 8f), strokeWidth = 2f)
                if (mm % 2 == 0 && mm >= 0) { val l = measurer.measure("$mm m", TextStyle(fontSize = 10.sp, color = Color(0xFF1D2540))); drawText(l, topLeft = Offset(x - l.size.width / 2f, floor + 10f)) }
            }
            val st = { c: Color -> TextStyle(fontSize = 12.sp, color = c, fontWeight = FontWeight.Bold) }
            fun label(t: String, c: Color, at: Offset) { val l = measurer.measure(t, st(c)); drawText(l, topLeft = Offset((at.x - l.size.width / 2f).coerceIn(0f, W - l.size.width), (at.y - l.size.height / 2f).coerceIn(0f, H - l.size.height))) }
            val applied = Color(0xFF5145CD); val fric = Color(0xFFD9695C); val norm = Color(0xFF2FA37A); val wgt = Color(0xFF8A5A00); val net = Color(0xFF9D174D)
            drawArrow(Offset(boxX + boxW / 2, cy), Offset(boxX + boxW / 2 + L(p.force), cy), applied, 6f)
            label("${if (simple) "Push" else "Applied"} ${fmt(p.force, 1)} N", applied, Offset(boxX + boxW / 2 + L(p.force) / 2 + 20f, cy - 16f))
            drawArrow(Offset(boxX - boxW / 2, floor - 6f), Offset(boxX - boxW / 2 - L(b.friction), floor - 6f), fric, 6f)
            label("Friction ${fmt(b.friction, 1)} N", fric, Offset(boxX - boxW / 2 - L(b.friction) / 2 - 20f, floor - 22f))
            drawArrow(Offset(boxX, floor - boxW), Offset(boxX, floor - boxW - L(b.normal)), norm, 6f)
            label("Normal ${fmt(b.normal, 1)} N", norm, Offset(boxX + 60f, floor - boxW - L(b.normal) / 2))
            drawArrow(Offset(boxX, cy + 6f), Offset(boxX, cy + 6f + L(b.weight)), wgt, 6f)
            label("Weight ${fmt(b.weight, 1)} N", wgt, Offset(boxX + 60f, cy + L(b.weight) / 2 + 12f))
            if (!simple && b.net > 0) { drawArrow(Offset(boxX - L(b.net) / 2, 24f), Offset(boxX + L(b.net) / 2, 24f), net, 6f); label("Net force ${fmt(b.net, 1)} N", net, Offset(boxX + L(b.net) / 2 + 70f, 24f)) }
            val tl = measurer.measure("t = ${fmt(sim.t, 2)} s", TextStyle(fontSize = 14.sp, color = Color(0xFF1D2540), fontWeight = FontWeight.ExtraBold))
            drawText(tl, topLeft = Offset(W - tl.size.width - 10f, 8f))
            drawOval(Color.Black.copy(alpha = .22f), Offset(boxX - boxW * .5f, floor - 5f), Size(boxW, 10f))
        }
        // the box: realistic 3D cardboard box, with its mass label
        val bw = with(density) { (boxW * 1.18f).toDp() }
        Box(Modifier.offset { IntOffset((boxX - boxW * 0.59f).roundToInt(), (floor - boxW * 1.08f).roundToInt()) }.size(bw)) {
            EmojiImage("📦", bw)
            Text("${fmt(p.mass)} kg", Modifier.align(androidx.compose.ui.Alignment.Center), style = MaterialTheme.typography.labelMedium, color = Color(0xFF3A2410))
        }
    }
}
