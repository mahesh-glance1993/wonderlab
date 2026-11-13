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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Remove
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
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
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
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.games.bool
import com.maheshglance.wonderlab.feature.games.drawBulb
import com.maheshglance.wonderlab.feature.games.drawCell
import com.maheshglance.wonderlab.feature.games.drawSwitch
import com.maheshglance.wonderlab.feature.games.int
import com.maheshglance.wonderlab.feature.games.j
import com.maheshglance.wonderlab.feature.games.jsonOf
import com.maheshglance.wonderlab.feature.games.list
import com.maheshglance.wonderlab.feature.games.str
import com.maheshglance.wonderlab.feature.games.strs
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.serialization.json.JsonElement
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

private fun JsonElement?.toCircuit() = CircuitParams(j("cells").int() ?: 2, j("bulbs").int() ?: 1, j("closed").bool() ?: false, j("gap").str())
private fun CircuitParams.json() = jsonOf("cells" to cells, "bulbs" to bulbs, "closed" to closed, "gap" to gap)

// loop geometry in a 600 × 320 design box (website CircuitLab.tsx), clockwise from top-left
private const val LX = 70f; private const val RX = 530f; private const val TY = 60f; private const val BY = 260f
private const val PERIM = 2 * (RX - LX) + 2 * (BY - TY)
private fun pointOnLoop(s0: Float): Offset {
    val w = RX - LX; val h = BY - TY
    val s = ((s0 % PERIM) + PERIM) % PERIM
    return when { s < w -> Offset(LX + s, TY); s < w + h -> Offset(RX, TY + (s - w)); s < 2 * w + h -> Offset(RX - (s - w - h), BY); else -> Offset(LX, BY - (s - 2 * w - h)) }
}
private val GAP_AT = mapOf("left" to Offset(LX, (TY + BY) / 2), "right" to Offset(RX, TY + 45), "bottom" to Offset(RX - 40, BY), "top" to Offset(LX + 30, TY))

@Composable
fun CircuitLab(query: Map<String, String>) {
    val app = LocalApp.current
    val session = rememberLabSession("circuit")
    val tier = rememberLabTier()
    var params by remember { mutableStateOf(CircuitParams()) }
    var sim by remember { mutableStateOf(CircuitState()) }
    var playing by remember { mutableStateOf(false) }
    var active by remember { mutableStateOf<String?>(null) }
    var faultIndex by remember { mutableIntStateOf(0) }
    var runId by remember { mutableIntStateOf(0) }
    var announce by remember { mutableStateOf("") }
    var intro by remember { mutableStateOf<JsonElement?>(null) }
    var challenges by remember { mutableStateOf<List<JsonElement>>(emptyList()) }
    var pred by remember { mutableStateOf<JsonElement?>(null) }
    var met by remember { mutableStateOf(false) }
    var pendingSetup by remember { mutableStateOf<Pair<String, Int>?>(null) }

    LaunchedEffect(Unit) { params = session.load(query).toCircuit() }
    LaunchedEffect(tier.simple, faultIndex) {
        intro = app.engine.call("lab.intro", "circuit", tier.simple)
        challenges = app.engine.call("lab.challenges", "circuit", tier.simple, faultIndex).list()
    }
    fun setParams(p: CircuitParams) { params = p; session.setParams(p.json()) }
    fun change(p: CircuitParams, msg: String) { setParams(p); announce = msg }
    fun reset() { playing = false; sim = CircuitState(); runId++ }
    LaunchedEffect(params, tier.simple, tier.typed) { pred = runCatching { app.engine.call("lab.prediction", "circuit", params.json(), tier.simple || !tier.typed) }.getOrNull() }
    LaunchedEffect(params) { kotlinx.coroutines.delay(600); session.saveNow() }
    DisposableEffect(Unit) { onDispose { session.saveNow() } }
    SimLoop(playing, Circuit.DT) { n -> sim = Circuit.advance(sim, params, n) }
    val cur = challenges.firstOrNull { it.j("id").str() == active }
    LaunchedEffect(active, params, faultIndex) {
        met = active != null && runCatching { app.engine.call("lab.check", "circuit", active, params.json(), null, faultIndex).bool() == true }.getOrDefault(false)
        if (met && cur != null) session.complete(active!!, cur.j("title").str() ?: "", "sim", jsonOf("params" to params.json()))
    }
    val lockedParts = cur.j("locked").strs().contains("cells")
    val sol = Circuit.solve(params)
    val powered = playing || sim.steps > 0
    val word = Circuit.brightnessWord(if (powered) sol.bulbPower else 0.0)
    val phase = if (sim.t >= 1) "after" else if (sim.steps == 0 && !playing) "before" else "running"
    val simple = tier.simple
    val toggleSwitch = { change(params.copy(closed = !params.closed), if (params.closed) "Switch opened. The circuit is broken." else "Switch closed."); Tones.tap() }
    val inspect = { side: String ->
        if (params.gap == side) { change(params.copy(gap = null), "There was a gap in the $side wire. You joined it!"); Tones.correct() }
        else announce = "The $side wire is connected properly."
        session.notices.show(announce)
    }

    val tabs = buildList {
        add(LabTab("build", "Build") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                PartRow("Cells", params.cells, lockedParts, 1, Circuit.MAX_CELLS) { n -> change(params.copy(cells = n), "$n cells.") }
                PartRow("Bulbs", params.bulbs, lockedParts, 1, Circuit.MAX_BULBS) { n -> change(params.copy(bulbs = n), "$n bulbs.") }
                WLButton("Switch: ${if (params.closed) "closed (on)" else "open (off)"}", { toggleSwitch() }, icon = if (params.closed) Icons.Rounded.Check else Icons.Rounded.Close, small = true)
                Text("Tip: tap a wire in the picture to check it for breaks.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                if (simple) Formulas("Open or closed?", listOf(
                    "**Closed circuit:** a complete loop with no gaps. Electricity flows all the way round and the bulbs light.",
                    "**Open circuit:** there is a gap — an open switch or a broken wire. Electricity stops and the bulbs go dark.",
                )) else Formulas("Ohm’s law (series)", listOf(
                    "V = ${params.cells} × ${fmt(Circuit.CELL_V)} V = **${fmt(sol.voltage)} V**",
                    "R = ${params.bulbs} × ${fmt(Circuit.BULB_R)} Ω = **${fmt(sol.resistance)} Ω**",
                    if (sol.complete) "I = V ÷ R = ${fmt(sol.voltage)} ÷ ${fmt(sol.resistance)} = **${fmt(sol.current, 3)} A**" else "I = V ÷ R = **0 A (open circuit)**",
                    "P per bulb = I²R = **${fmt(sol.bulbPower, 3)} W**",
                ))
            }
        })
        add(LabTab("predict", "Predict") { androidx.compose.runtime.key(params, runId) { PredictionPanel(session, pred, phase, tier.typed) } })
        add(LabTab("chal", "Challenges") {
            ChallengesPanel(session, challenges, active, met, tier.typed, onStart = { id ->
                val next = if (id == "fault") faultIndex + 1 else faultIndex
                if (id == "fault") faultIndex = next
                active = id
                // setup comes from the engine for the chosen fault
                pendingSetup = id to next
            }, onExit = { active = null })
        })
        add(LabTab("table", "Table") {
            ValuesTable("Circuit values", listOf(
                Triple("Cells", "${params.cells}", null), Triple("Bulbs", "${params.bulbs}", null), Triple("Switch", if (params.closed) "closed" else "open", null),
                Triple("Complete loop?", if (sol.complete) "yes" else "no", null), Triple("Power on (playing)?", if (powered) "yes" else "no", null),
                Triple("Voltage V", fmt(sol.voltage), "V"), Triple("Total resistance R", fmt(sol.resistance), "Ω"),
                Triple("Current I", if (powered) fmt(sol.current, 3) else "— (press Play)", if (powered) "A" else null),
                Triple("Voltage across each bulb", if (powered) fmt(sol.bulbVoltage, 3) else "—", if (powered) "V" else null),
                Triple("Power of each bulb", if (powered) fmt(sol.bulbPower, 3) else "—", if (powered) "W" else null), Triple("Brightness", word, null),
            ), columns = 2)
        })
    }
    // apply a challenge setup once the engine has the (possibly new) fault's challenge list
    LaunchedEffect(pendingSetup, challenges) {
        val ps = pendingSetup ?: return@LaunchedEffect
        val list = app.engine.call("lab.challenges", "circuit", tier.simple, ps.second).list()
        list.firstOrNull { it.j("id").str() == ps.first }?.j("setup")?.let { s -> setParams(params.copy(cells = s.j("cells").int() ?: params.cells, bulbs = s.j("bulbs").int() ?: params.bulbs, closed = s.j("closed").bool() ?: params.closed, gap = s.j("gap").str())); reset() }
        pendingSetup = null
    }

    LabScaffold(
        "Circuit Lab", session, intro,
        stage = { m -> CircuitStage(m, params, sim, powered, sol, word, onSwitch = { toggleSwitch() }, onWire = inspect) },
        readline = { Announce(announce); ReadLine("I" to if (powered) "${fmt(sol.current, 3)} A" else "—", "V" to "${fmt(sol.voltage)} V", "Bulbs" to word) },
        transport = { Transport(playing, false, "Step forward 0.5 seconds", { playing = true }, { playing = false }, { playing = false; sim = Circuit.advance(sim, params, 10) }, { reset(); announce = "Power off. Build and predict, then press Play." }) },
        tabs = tabs,
    )
}


@Composable
private fun PartRow(label: String, n: Int, locked: Boolean, min: Int, max: Int, onSet: (Int) -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("$label: $n", style = MaterialTheme.typography.labelLarge, color = WL.colors.text, modifier = Modifier.weight(1f))
        WLButton("Remove", { onSet(n - 1) }, icon = Icons.Rounded.Remove, enabled = !locked && n > min, small = true)
        WLButton("Add", { onSet(n + 1) }, icon = Icons.Rounded.Add, enabled = !locked && n < max, small = true)
    }
}

@Composable
private fun CircuitStage(m: Modifier, p: CircuitParams, sim: CircuitState, powered: Boolean, sol: CircuitSolution, word: String, onSwitch: () -> Unit, onWire: (String) -> Unit) {
    val measurer = rememberTextMeasurer()
    val reduced = LocalReduceMotion.current
    val c = WL.colors
    val density = LocalDensity.current
    val glow = if (powered) sqrt(sol.brightness).toFloat() else 0f
    BoxWithConstraints(m.semantics { contentDescription = "Series circuit with ${p.cells} cells, ${p.bulbs} bulbs, switch ${if (p.closed) "closed" else "open"}${if (p.gap != null) ", and a broken wire somewhere" else ""}. ${if (powered) (if (sol.complete) "Current ${fmt(sol.current, 3)} amps, bulbs $word." else "No current: bulbs off.") else "Power not switched on yet: press Play."}" }) {
        val W = constraints.maxWidth.toFloat(); val H = constraints.maxHeight.toFloat()
        val k = min(W / 600f, H / 320f)
        val ox = (W - 600f * k) / 2; val oy = (H - 320f * k) / 2
        fun P(x: Float, y: Float) = Offset(ox + x * k, oy + y * k)
        val swY = (TY + BY) / 2 + 10
        Canvas(Modifier.fillMaxSize()) {
            drawRoundRect(Brush.verticalGradient(listOf(Color(0xFF2E3B55), Color(0xFF1F2940))), P(20f, 10f), Size(560f * k, 300f * k), CornerRadius(24f * k))
            val wire = Color(0xFFC9772E)
            val ws = 7f * k
            fun wireLine(a: Offset, b: Offset) { drawLine(Color.Black.copy(alpha = .3f), a + Offset(0f, 2f), b + Offset(0f, 2f), strokeWidth = ws, cap = StrokeCap.Round); drawLine(Brush.linearGradient(listOf(Color(0xFFE59B54), wire)), a, b, strokeWidth = ws, cap = StrokeCap.Round) }
            wireLine(P(LX, TY), P(RX, TY)); wireLine(P(RX, TY), P(RX, BY)); wireLine(P(RX, BY), P(LX, BY)); wireLine(P(LX, BY), P(LX, TY))
            p.gap?.let { g -> GAP_AT[g]?.let { at ->
                val ctr = P(at.x, at.y)
                drawRect(Color(0xFF1F2940), ctr - Offset(14f * k, 14f * k), Size(28f * k, 28f * k))
                val vert = g == "left" || g == "right"
                drawCircle(Color(0xFFE59B54), 4f * k, ctr + if (vert) Offset(0f, -12f * k) else Offset(-12f * k, 0f))
                drawCircle(Color(0xFFE59B54), 4f * k, ctr + if (vert) Offset(0f, 12f * k) else Offset(12f * k, 0f))
                drawCircle(Color(0xFFE5484D), 20f * k, ctr, style = Stroke(2.5f * k))
            } }
            // cells on the top wire (+ on the right)
            val cellW = 54f; val cellsX0 = (LX + RX) / 2 - p.cells * cellW / 2
            for (i in 0 until p.cells) {
                val x = cellsX0 + i * cellW
                drawCell(P(x + 4f, TY - 16f), Size((cellW - 4f) * k, 32f * k))
                val l = measurer.measure("1.5 V", TextStyle(fontSize = (10 * k).coerceAtLeast(8f).sp, color = Color.White, fontWeight = FontWeight.Bold))
                drawText(l, topLeft = P(x + cellW / 2 - 6f, TY) - Offset(l.size.width / 2f, l.size.height / 2f))
                val plus = measurer.measure("+", TextStyle(fontSize = 12.sp, color = Color.White))
                drawText(plus, topLeft = P(x + cellW - 12f, TY - 34f))
            }
            val bl = measurer.measure("Battery ${fmt(p.cells * Circuit.CELL_V)} V", TextStyle(fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold))
            drawText(bl, topLeft = P((LX + RX) / 2, TY - 44f) - Offset(bl.size.width / 2f, 0f))
            // switch on the right wire
            drawRoundRect(Color(0xFF1F2940), P(RX - 34f, swY - 40f), Size(68f * k, 80f * k), CornerRadius(10f * k))
            drawRoundRect(Color.White.copy(alpha = .25f), P(RX - 34f, swY - 40f), Size(68f * k, 80f * k), CornerRadius(10f * k), style = Stroke(2f))
            drawSwitch(P(RX, swY + 22f), if (p.closed) P(RX, swY - 22f) else P(RX, swY - 22f), p.closed, Color(0xFFE6E8EF), 6f * k)
            val sl = measurer.measure("switch ${if (p.closed) "closed" else "open"}", TextStyle(fontSize = 12.sp, color = Color.White))
            drawText(sl, topLeft = P(RX - 42f, swY) - Offset(sl.size.width.toFloat(), sl.size.height / 2f))
            // bulbs on the bottom wire
            for (i in 0 until p.bulbs) {
                val x = (LX + RX) / 2 + (i - (p.bulbs - 1) / 2f) * 110f
                drawBulb(P(x, BY - 34f), 22f * k, glow > 0f, glow)
                val l = measurer.measure(word, TextStyle(fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold))
                drawText(l, topLeft = P(x, BY + 14f) - Offset(l.size.width / 2f, 0f))
            }
            // moving charges (or still arrows with reduced motion)
            if (powered && sol.complete) {
                if (!reduced) for (i in 0 until 18) { val q = pointOnLoop(((i / 18f + sim.phase.toFloat()) % 1f) * PERIM); drawCircle(Color(0xFF7FD3FF), 4.5f * k, P(q.x, q.y)); drawCircle(Color.White, 2f * k, P(q.x, q.y)) }
                else for (f in listOf(0.12f, 0.37f, 0.62f, 0.87f)) {
                    val q = pointOnLoop(f * PERIM); val ang = if (f < .25f) 0f else if (f < .5f) 90f else if (f < .75f) 180f else 270f
                    rotate(ang, P(q.x, q.y)) { drawPath(Path().apply { val o = P(q.x, q.y); moveTo(o.x - 6 * k, o.y - 6 * k); lineTo(o.x + 4 * k, o.y); lineTo(o.x - 6 * k, o.y + 6 * k) }, Color(0xFF7FD3FF), style = Stroke(3f * k)) }
                }
            }
            val rl = measurer.measure(if (powered) "I = ${fmt(if (powered) sol.current else 0.0, 3)} A" else "Press Play to switch on", TextStyle(fontSize = 15.sp, color = Color(0xFFF6D365), fontWeight = FontWeight.ExtraBold))
            drawText(rl, topLeft = P(300f, (TY + BY) / 2) - Offset(rl.size.width / 2f, rl.size.height / 2f))
        }
        // touch targets: switch and the four wires
        val hit = @Composable { x: Float, y: Float, w: Float, h: Float, label: String, on: () -> Unit ->
            Box(Modifier.offset { IntOffset((ox + x * k).roundToInt(), (oy + y * k).roundToInt()) }.size(with(density) { (w * k).toDp() }, with(density) { (h * k).toDp() })
                .semantics { contentDescription = label }.pressable(sound = false, onClick = on))
        }
        hit(RX - 34f, swY - 40f, 68f, 80f, "Switch, ${if (p.closed) "closed" else "open"}. Press to ${if (p.closed) "open" else "close"} it.", onSwitch)
        hit(LX + 20f, TY - 20f, 70f, 40f, "top wire — check it") { onWire("top") }
        hit(RX - 20f, TY + 10f, 40f, 60f, "right wire — check it") { onWire("right") }
        hit(LX + 20f, BY - 10f, RX - LX - 40f, 34f, "bottom wire — check it") { onWire("bottom") }
        hit(LX - 20f, TY + 20f, 40f, BY - TY - 40f, "left wire — check it") { onWire("left") }
    }
}
