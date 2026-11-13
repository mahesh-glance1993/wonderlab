package com.maheshglance.wonderlab.feature.lab

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Explore
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
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
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.feature.games.bool
import com.maheshglance.wonderlab.feature.games.dbl
import com.maheshglance.wonderlab.feature.games.j
import com.maheshglance.wonderlab.feature.games.jsonOf
import com.maheshglance.wonderlab.feature.games.list
import com.maheshglance.wonderlab.feature.games.str
import com.maheshglance.wonderlab.feature.games.strs
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.serialization.json.JsonElement
import kotlin.math.atan2
import kotlin.math.hypot
import kotlin.math.min
import kotlin.math.roundToInt

private fun JsonElement?.toLight() = LightParams(j("sx").dbl() ?: 14.0, j("sy").dbl() ?: 52.0, j("aim").dbl() ?: -60.0, j("tilt").dbl() ?: 0.0)
private fun LightParams.json() = jsonOf("sx" to sx, "sy" to sy, "aim" to aim, "tilt" to tilt)
private fun wrapAngle(a: Double) = ((((a + 180) % 360) + 360) % 360) - 180

@Composable
fun LightLab(query: Map<String, String>) {
    val app = LocalApp.current
    val session = rememberLabSession("light")
    val tier = rememberLabTier()
    var params by remember { mutableStateOf(LightParams()) }
    var sim by remember { mutableStateOf(LightState()) }
    var playing by remember { mutableStateOf(false) }
    var fullRay by remember { mutableStateOf(false) }
    var active by remember { mutableStateOf<String?>(null) }
    var runId by remember { mutableIntStateOf(0) }
    var intro by remember { mutableStateOf<JsonElement?>(null) }
    var challenges by remember { mutableStateOf<List<JsonElement>>(emptyList()) }
    var pred by remember { mutableStateOf<JsonElement?>(null) }
    var met by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) { params = session.load(query).toLight() }
    LaunchedEffect(tier.simple) {
        intro = app.engine.call("lab.intro", "light", tier.simple)
        challenges = app.engine.call("lab.challenges", "light", tier.simple, 0).list()
    }
    fun setParams(p: LightParams) { params = p; sim = LightState(); playing = false; session.setParams(p.json()) }
    fun reset() { playing = false; sim = LightState(); runId++ }
    val cur = challenges.firstOrNull { it.j("id").str() == active }
    val target = cur.j("target")?.takeIf { it.j("x") != null }?.let { Target(it.j("x").dbl() ?: 0.0, it.j("y").dbl() ?: 0.0, it.j("r").dbl() ?: 4.0) }
    val tr = Light.trace(params, target)
    LaunchedEffect(params, tier.simple, tier.typed) { pred = runCatching { app.engine.call("lab.prediction", "light", params.json(), tier.simple || !tier.typed) }.getOrNull() }
    LaunchedEffect(params) { kotlinx.coroutines.delay(600); session.saveNow() }
    DisposableEffect(Unit) { onDispose { session.saveNow() } }
    SimLoop(playing, Light.DT) { n -> sim = Light.advance(sim, tr.pathLength, n) }
    LaunchedEffect(sim.done) { if (sim.done) playing = false }
    LaunchedEffect(active, params) {
        met = active != null && runCatching { app.engine.call("lab.check", "light", active, params.json(), null, 0).bool() == true }.getOrDefault(false)
        if (met && cur != null) session.complete(active!!, cur.j("title").str() ?: "", "sim", jsonOf("params" to params.json()))
    }
    val locked = { k: String -> cur.j("locked").strs().contains(k) }
    val simple = tier.simple
    val phase = if (sim.done) "after" else if (sim.steps == 0 && !playing) "before" else "running"
    val incLen = hypot(tr.incEnd.x - tr.source.x, tr.incEnd.y - tr.source.y)
    val reflShown = tr.hit != null && tr.reflEnd != null && (fullRay || sim.dist > incLen)
    val announce = if (sim.done) (if (tr.incidence != null) "The light reflected. Angle of incidence ${fmt(tr.incidence, 1)} degrees, angle of reflection ${fmt(tr.reflection ?: 0.0, 1)} degrees." else "The light did not reflect off the mirror.") else ""

    val tabs = buildList {
        add(LabTab("set", "Settings") {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                NumberSlider(if (simple) "Torch direction" else "Torch direction (from the +x axis)", params.aim, Light.RANGES.getValue("aim"), "°", { setParams(params.copy(aim = it)) }, locked("aim"))
                if (!simple) NumberSlider("Mirror tilt", params.tilt, Light.RANGES.getValue("tilt"), "°", { setParams(params.copy(tilt = it)) }, locked("tilt"))
                if (simple && !locked("tilt") && params.tilt != 0.0) Text("Mirror tilt: ${fmt(params.tilt)}°", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                WLButton("Aim at mirror centre", { setParams(params.copy(aim = LabMath.snap(Light.aimAt(params.sx, params.sy, Vec(Light.MCX, Light.MCY)), Light.RANGES.getValue("aim")))) }, icon = Icons.Rounded.Explore, enabled = !locked("aim"), small = true)
                if (!simple && !locked("sx")) NumberSlider("Set the angle of incidence (places the torch)", LabMath.clamp(Math.round(tr.incidence ?: 0.0).toDouble(), 0.0, 85.0), LabRange(0.0, 85.0, 1.0), "°",
                    { a -> setParams(Light.placeForIncidence(a, params.tilt)) }, note = "Moves the torch so the ray hits the middle of the mirror at this angle.")
                ToggleChip("Always show reflected ray", fullRay, { fullRay = it })
                Text("Drag the torch to move it, or drag the round handle to turn it.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            }
        })
        add(LabTab("predict", "Predict") { androidx.compose.runtime.key(params, runId) { PredictionPanel(session, pred, phase, tier.typed) } })
        add(LabTab("chal", "Challenges") {
            ChallengesPanel(session, challenges, active, met, tier.typed, onStart = { id ->
                val s = challenges.first { it.j("id").str() == id }.j("setup")
                active = id
                setParams(LightParams(s.j("sx").dbl() ?: params.sx, s.j("sy").dbl() ?: params.sy, s.j("aim").dbl() ?: params.aim, s.j("tilt").dbl() ?: params.tilt))
                fullRay = true; reset()
            }, onExit = { active = null })
        })
        add(LabTab("table", "Table") {
            ValuesTable("Ray values", buildList {
                add(Triple("Torch position (x, y)", "${fmt(params.sx)}, ${fmt(params.sy)}", "cm")); add(Triple("Torch direction", fmt(params.aim), "°")); add(Triple("Mirror tilt", fmt(params.tilt), "°"))
                add(Triple("Hits the shiny side?", if (tr.incidence != null) "yes" else if (tr.backside) "no (back of mirror)" else "no", null))
                add(Triple("Angle of incidence i", tr.incidence?.let { fmt(it, 1) } ?: "—", if (tr.incidence != null) "°" else null))
                add(Triple("Angle of reflection r", tr.reflection?.let { fmt(it, 1) } ?: "—", if (tr.reflection != null) "°" else null))
                if (target != null) add(Triple("Star hit", if (tr.hitsTarget) "yes" else "no", null))
            })
        })
    }

    LabScaffold(
        "Light Lab", session, intro,
        stage = { m -> LightStage(m, params, tr, target, sim, playing, fullRay, reflShown, locked("sx"), locked("aim")) { setParams(it) } },
        readline = {
            Announce(announce)
            val items = mutableListOf("i" to (tr.incidence?.let { "${fmt(it, 1)}°" } ?: "—"), "r" to (if (tr.reflection != null && reflShown) "${fmt(tr.reflection, 1)}°" else "—"))
            if (target != null) items += "Star" to (if (tr.hitsTarget) "hit" else "not yet")
            ReadLine(*items.toTypedArray())
        },
        transport = { Transport(playing, sim.done, "Step the light forward", { playing = true }, { playing = false }, { playing = false; sim = Light.advance(sim, tr.pathLength, 5) }, { reset() }) },
        tabs = tabs,
    )
}

@Composable
private fun LightStage(m: Modifier, p: LightParams, tr: Trace, target: Target?, sim: LightState, playing: Boolean, fullRay: Boolean, reflShown: Boolean, lockMove: Boolean, lockAim: Boolean, onChange: (LightParams) -> Unit) {
    val measurer = rememberTextMeasurer()
    val density = LocalDensity.current
    val cur by rememberUpdatedState(p)
    val change by rememberUpdatedState(onChange)
    BoxWithConstraints(m.semantics { contentDescription = "Torch at ${fmt(p.sx)}, ${fmt(p.sy)} cm aiming at ${fmt(p.aim)}°. Mirror tilted ${fmt(p.tilt)}°. ${if (tr.incidence != null) "Angle of incidence ${fmt(tr.incidence, 1)}°, angle of reflection ${fmt(tr.reflection ?: 0.0, 1)}°." else "The ray does not reflect."}${if (target != null) " Star ${if (tr.hitsTarget) "hit" else "not hit"}." else ""}" }) {
        val W = constraints.maxWidth.toFloat(); val H = constraints.maxHeight.toFloat()
        val s = min(W / Light.W.toFloat(), H / Light.H.toFloat())
        val ox = (W - Light.W.toFloat() * s) / 2; val oy = (H - Light.H.toFloat() * s) / 2
        fun X(v: Vec) = (ox + v.x * s).toFloat()
        fun Y(v: Vec) = (oy + (Light.H - v.y) * s).toFloat()
        fun O(v: Vec) = Offset(X(v), Y(v))
        fun toWorld(o: Offset) = Vec(((o.x - ox) / s).toDouble(), Light.H - ((o.y - oy) / s).toDouble())
        val src = tr.source
        val handle = Vec(src.x + kotlin.math.cos(LabMath.rad(p.aim)) * 7, src.y + kotlin.math.sin(LabMath.rad(p.aim)) * 7)
        val pulse = Light.pointAlong(tr, sim.dist)
        Canvas(Modifier.fillMaxSize().pointerInput(lockMove, lockAim, s) {
            var mode: String? = null
            detectDragGestures(
                onDragStart = { o ->
                    val w = toWorld(o)
                    val c = cur
                    val h = Vec(c.sx + kotlin.math.cos(LabMath.rad(c.aim)) * 7, c.sy + kotlin.math.sin(LabMath.rad(c.aim)) * 7)
                    mode = when {
                        !lockAim && hypot(w.x - h.x, w.y - h.y) < 6 -> "aim"
                        !lockMove && hypot(w.x - c.sx, w.y - c.sy) < 8 -> "move"
                        !lockAim && hypot(w.x - c.sx, w.y - c.sy) < 14 -> "aim"
                        else -> null
                    }
                },
                onDrag = { ch, _ ->
                    val w = toWorld(ch.position); val c = cur
                    when (mode) {
                        "move" -> { ch.consume(); change(c.copy(sx = LabMath.snap(w.x, Light.RANGES.getValue("sx")), sy = LabMath.snap(w.y, Light.RANGES.getValue("sy")))) }
                        "aim" -> { ch.consume(); change(c.copy(aim = LabMath.snap(Light.aimAt(c.sx, c.sy, w), Light.RANGES.getValue("aim")))) }
                    }
                },
                onDragEnd = { mode = null }, onDragCancel = { mode = null },
            )
        }) {
            drawRect(Brush.verticalGradient(listOf(Color(0xFF141A2E), Color(0xFF232B48))), Offset(ox, oy), androidx.compose.ui.geometry.Size(Light.W.toFloat() * s, Light.H.toFloat() * s))
            val (ma, mb) = Light.mirrorEnds(p.tilt)
            val n = tr.normal
            // mirror: painted back (hatches) + silvered face
            for (i in 0 until 14) {
                val f = (i + 0.5) / 14
                val h = Vec(ma.x + (mb.x - ma.x) * f, ma.y + (mb.y - ma.y) * f)
                drawLine(Color(0xFF8A93A8), O(h), O(Vec(h.x - n.x * 1.6 - 1, h.y - n.y * 1.6)), strokeWidth = 2f)
            }
            drawLine(Color.Black.copy(alpha = .4f), O(ma) + Offset(0f, 3f), O(mb) + Offset(0f, 3f), strokeWidth = 1.4f * s, cap = StrokeCap.Round)
            drawLine(Brush.linearGradient(listOf(Color(0xFFE6F3FF), Color(0xFF9CC8F0), Color(0xFFFFFFFF), Color(0xFF9CC8F0)), O(ma), O(mb)), O(ma), O(mb), strokeWidth = 1.2f * s, cap = StrokeCap.Round)
            val lab = { t: String, at: Offset, col: Color -> val l = measurer.measure(t, TextStyle(fontSize = 11.sp, color = col, fontWeight = FontWeight.Bold)); drawText(l, topLeft = Offset((at.x - l.size.width / 2f).coerceIn(0f, W - l.size.width), (at.y - l.size.height / 2f).coerceIn(0f, H - l.size.height))) }
            lab("mirror${if (p.tilt != 0.0) " (tilt ${fmt(p.tilt)}°)" else ""}", O(mb) + Offset(-30f, 18f), Color(0xFFBFD4F0))
            // normal + angle arcs
            val hit = tr.hit
            if (hit != null && !tr.backside) {
                drawLine(Color.White.copy(alpha = .7f), O(hit), O(Vec(hit.x + n.x * 24, hit.y + n.y * 24)), strokeWidth = 2f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 8f)))
                lab("normal", O(Vec(hit.x + n.x * 26, hit.y + n.y * 26)), Color.White)
                fun arc(a: Vec, b: Vec, r: Float, col: Color) {
                    val a0 = toDegrees(atan2(-a.y, a.x)).toFloat(); val b0 = toDegrees(atan2(-b.y, b.x)).toFloat()
                    var sweep = b0 - a0; if (sweep > 180) sweep -= 360; if (sweep < -180) sweep += 360
                    drawArc(col, a0, sweep, false, O(hit) - Offset(r, r), androidx.compose.ui.geometry.Size(2 * r, 2 * r), style = Stroke(3f))
                }
                if ((tr.incidence ?: 0.0) > 0.5) {
                    val back = Vec(src.x - hit.x, src.y - hit.y); val bl = hypot(back.x, back.y); val din = Vec(back.x / bl, back.y / bl)
                    arc(n, din, 10f * s, Color(0xFFF6C344))
                    val mid = Light.norm(din + n); lab("i = ${fmt(tr.incidence ?: 0.0, 1)}°", O(hit) + Offset((mid.x * 14 * s).toFloat(), (-mid.y * 14 * s).toFloat()), Color(0xFFF6C344))
                }
                val rd = tr.reflDir
                if (reflShown && rd != null && (tr.reflection ?: 0.0) > 0.5) {
                    arc(n, rd, 8f * s, Color(0xFF7FD3FF))
                    val mid = Light.norm(rd + n); lab("r = ${fmt(tr.reflection ?: 0.0, 1)}°", O(hit) + Offset((mid.x * 14 * s).toFloat(), (-mid.y * 14 * s).toFloat()), Color(0xFF7FD3FF))
                }
            }
            // rays (glowing)
            fun ray(a: Offset, b: Offset) { drawLine(Color(0x55FFE066), a, b, strokeWidth = 10f, cap = StrokeCap.Round); drawLine(Color(0xFFFFE066), a, b, strokeWidth = 3.5f, cap = StrokeCap.Round) }
            ray(O(src), O(tr.incEnd))
            lab("incident ray", Offset((X(src) + X(tr.incEnd)) / 2 - 40f, (Y(src) + Y(tr.incEnd)) / 2 - 10f), Color(0xFFFFE066))
            val reflTo = if (reflShown) (if (fullRay || sim.done) tr.reflEnd else pulse) else null
            if (reflTo != null && hit != null) {
                ray(O(hit), O(reflTo))
                if (fullRay || sim.done) lab("reflected ray", Offset((X(hit) + X(reflTo)) / 2 + 40f, (Y(hit) + Y(reflTo)) / 2 - 10f), Color(0xFFFFE066))
            }
            if (playing || (sim.steps > 0 && !sim.done)) { drawCircle(Color(0x88FFFFFF), 14f, O(pulse)); drawCircle(Color.White, 7f, O(pulse)) }
            if (target != null) lab(if (tr.hitsTarget) "star hit!" else "target", O(Vec(target.x, target.y - 7)), if (tr.hitsTarget) Color(0xFF9CD3B4) else Color.White)
            // aim handle
            if (!lockAim) { drawCircle(Color(0x665145CD), 3.2f * s, O(handle)); drawCircle(Color.White, 3.2f * s, O(handle), style = Stroke(3f)) }
        }
        // target star and torch as realistic pictures
        if (target != null) {
            val ts = with(density) { (target.r * 2.6 * s).toFloat().toDp() }
            val half = (target.r * 1.3 * s).toFloat()
            Box(Modifier.offset { IntOffset((X(Vec(target.x, target.y)) - half).roundToInt(), (Y(Vec(target.x, target.y)) - half).roundToInt()) }) { EmojiImage("⭐", ts) }
        }
        val torchPx = 14f * s
        val torch = with(density) { torchPx.toDp() }
        // the 🔦 picture points up-left (135°); rotate it to the beam direction
        // centre the picture a little behind the source so the lamp head sits where the ray starts
        val back = Vec(src.x - kotlin.math.cos(LabMath.rad(p.aim)) * 4, src.y - kotlin.math.sin(LabMath.rad(p.aim)) * 4)
        Box(Modifier.offset { IntOffset((X(back) - torchPx / 2).roundToInt(), (Y(back) - torchPx / 2).roundToInt()) }.size(torch)) {
            EmojiImage("🔦", torch, Modifier.rotate((135 - p.aim).toFloat()))
        }
    }
}
