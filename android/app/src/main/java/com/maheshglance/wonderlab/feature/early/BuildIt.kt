package com.maheshglance.wonderlab.feature.early

import android.graphics.DashPathEffect
import android.graphics.Paint
import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Flip
import androidx.compose.material.icons.rounded.GridView
import androidx.compose.material.icons.rounded.PanTool
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.RotateRight
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.boundsInWindow
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInWindow
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.min
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLFonts
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.random.Random

/*
 * Build It: assemble vehicles and machines from parts (drag a part to its place, or tap a part then its place).
 * When the model is complete it comes alive with an animation in sync with its sound — a port of BuildIt.tsx,
 * buildArt.tsx and data/builds.ts. Parts, models and rules come from the engine; the part drawings are the
 * website's own (rendered natively).
 */

private object T {
    val title = L("Build It", "తయారు చేద్దాం")
    val pick = L("What shall we build?", "ఏమి తయారు చేద్దాం?")
    val free = L("Make your own", "నీదే తయారు చెయ్యి")
    val level = L("How many parts?", "ఎన్ని భాగాలు?")
    val howTo = L("Drag each part to its place. Or tap a part, then tap its place.", "ప్రతి భాగాన్ని దాని చోటుకు లాగు. లేదా భాగాన్ని తాకి, తర్వాత దాని చోటును తాకు.")
    val turnIt = L("Right place! Turn or flip it to fit.", "సరైన చోటు! సరిపోయేలా తిప్పు.")
    val elsewhere = L("That part goes somewhere else.", "ఆ భాగం వేరే చోట పెట్టాలి.")
    val pickFirst = L("First pick a part.", "ముందు ఒక భాగం ఎంచుకో.")
    val rotate = L("Turn", "తిప్పు")
    val flip = L("Flip", "అటు తిప్పు")
    val again = L("Make it go again", "మళ్ళీ నడిపించు")
    val nextLevel = L("More parts", "ఇంకా భాగాలు")
    val another = L("Build another", "ఇంకొకటి తయారు చెయ్యి")
    val ready = L("Ready!", "సిద్ధం!")
    val go = L("Go!", "పద!")
    val parts = L("Parts", "భాగాలు")
    val placeFor = L("Place for", "దీని చోటు:")
    val canTurn = L("can turn or flip", "తిప్పవచ్చు")
    val freeSay = L("Make your own vehicle! Pick a body, wheels and a colour.", "నీ సొంత వాహనం తయారు చెయ్యి! బాడీ, చక్రాలు, రంగు ఎంచుకో.")
    val offWeGo = L("Off we go!", "పదండి!")
    val colourNames = listOf(L("Red", "ఎరుపు"), L("Blue", "నీలం"), L("Green", "ఆకుపచ్చ"), L("Yellow", "పసుపు"), L("Orange", "నారింజ"), L("Purple", "ఊదా"))
}

private val EASE = CubicBezierEasing(0.45f, 0f, 0.35f, 1f)
private const val BW = 400f
private const val BH = 260f

// ------------------------------------------------------------------ drawings
private data class PicReq(val key: String, val fn: String, val args: List<Any?>)
private fun partReq(p: ModelPart) = PicReq("part:${p.kind}|${p.w}|${p.h}|${p.c}", "svgPart", listOf(p.kind, p.w, p.h, p.c))
private fun sceneReq(scene: String) = PicReq("scenery:$scene", "svgScenery", listOf(scene))
private fun freeReq(d: FreeDesign) = PicReq("free:${d.body}|${d.wheel}|${d.colour}", "svgFreeVehicle", listOf(json(d)))

/** Loads (and caches) several drawings; the map fills in as they arrive. */
@Composable
private fun rememberPics(reqs: List<PicReq>): Map<String, SvgPicture> {
    val app = LocalApp.current
    val keyStr = reqs.joinToString(",") { it.key }
    val state = remember(keyStr) { mutableStateMapOf<String, SvgPicture>().apply { reqs.forEach { r -> SvgStore.peek(r.key)?.let { put(r.key, it) } } } }
    LaunchedEffect(keyStr) { for (r in reqs) if (state[r.key] == null) state[r.key] = SvgStore.get(app.engine, r.key, r.fn, *r.args.toTypedArray()) }
    return state
}

/** Draws a compiled drawing's primitives into the current canvas (already transformed). */
private fun drawPrims(c: android.graphics.Canvas, pic: SvgPicture?, outline: Paint? = null, ghostFill: Paint? = null, roleXf: ((SvgPrim) -> RoleXf?)? = null) {
    if (pic == null) return
    for (p in pic.prims) {
        if (p.text != null) continue
        val xf = roleXf?.invoke(p)
        if (xf != null) {
            c.save(); c.translate(xf.dx, xf.dy)
            if (xf.rotate != 0f) c.rotate(xf.rotate, p.pivot.x, p.pivot.y)
            if (xf.scaleX != 1f || xf.scaleY != 1f) c.scale(xf.scaleX, xf.scaleY, p.pivot.x, p.pivot.y)
        }
        if (outline != null) {
            if (ghostFill != null && p.fill != null) c.drawPath(p.path, ghostFill)
            c.drawPath(p.path, outline)
        } else {
            p.fill?.let { c.drawPath(p.path, it) }
            p.stroke?.let { c.drawPath(p.path, it) }
        }
        if (xf != null) c.restore()
    }
}

/** One part at its place on the board: translate → (alive role motion) → angle/orientation → shape. */
private fun drawPart(c: android.graphics.Canvas, p: ModelPart, pic: SvgPicture?, rot: Int = 0, flip: Boolean = p.mirror, role: RoleXf? = null, scale: Float = 1f, outline: Paint? = null, ghostFill: Paint? = null) {
    c.save()
    c.translate(p.x, p.y)
    if (role != null) { c.translate(role.dx, role.dy); if (role.rotate != 0f) c.rotate(role.rotate); if (role.scaleX != 1f || role.scaleY != 1f) c.scale(role.scaleX, role.scaleY) }
    if (scale != 1f) c.scale(scale, scale)
    c.rotate((p.angle ?: 0f) + rot)
    if (flip) c.scale(-1f, 1f)
    drawPrims(c, pic, outline, ghostFill)
    c.restore()
}

/** A part fitted in a square (tray, drag ghost). */
private fun DrawScope.drawPartIcon(p: ModelPart, pic: SvgPicture?, o: Orient) {
    val s = max(p.w, p.h) * 1.15f + 6f
    val k = size.minDimension / s
    drawIntoCanvas { cv ->
        val c = cv.nativeCanvas
        c.save(); c.translate(size.width / 2, size.height / 2); c.scale(k, k)
        c.rotate((p.angle ?: 0f) + o.rot)
        if (o.flip) c.scale(-1f, 1f)
        drawPrims(c, pic)
        c.restore()
    }
}

private fun shapeKey(p: ModelPart) = "${p.kind}:${p.w}x${p.h}:${p.c}:${p.angle ?: 0f}"
private fun startOrient(p: ModelPart, level: Int) = if (level == 3) Orient(p.turn ?: 0, false) else Orient(0, p.mirror)
private fun canTurn(p: ModelPart, level: Int) = level == 3 && p.turn != null
private fun canFlip(p: ModelPart, level: Int) = level == 3 && p.mirror

/** Keyframes [offset, values…] → values at t (eased per segment like the website's cubic-bezier). */
private fun kf(t: Float, vararg keys: FloatArray): FloatArray {
    if (t <= keys.first()[0]) return keys.first().copyOfRange(1, keys.first().size)
    for (i in 1 until keys.size) {
        val a = keys[i - 1]; val b = keys[i]
        if (t <= b[0]) {
            val x = EASE.transform(((t - a[0]) / max(1e-4f, b[0] - a[0])).coerceIn(0f, 1f))
            return FloatArray(a.size - 1) { j -> a[j + 1] + (b[j + 1] - a[j + 1]) * x }
        }
    }
    return keys.last().copyOfRange(1, keys.last().size)
}
private fun away(t: Float, x: Float, y: Float, r: Float): FloatArray = kf(
    t,
    floatArrayOf(0f, 0f, 0f, 0f, 1f), floatArrayOf(0.45f, x, y, r, 1f), floatArrayOf(0.47f, x, y, r, 0f),
    floatArrayOf(0.5f, -x, y * -0.3f, 0f, 0f), floatArrayOf(0.52f, -x, y * -0.3f, 0f, 1f), floatArrayOf(1f, 0f, 0f, 0f, 1f),
)
private fun tri(ms: Float, period: Float): Float { val ph = (ms % period) / period; return if (ph < 0.5f) ph * 2 else (1 - ph) * 2 }

/** [dx, dy, rotate, alpha] of the whole model at t (0..1) — animateAlive in BuildIt.tsx. */
private fun aliveModel(kind: String, dir: Int, t: Float): FloatArray = when (kind) {
    "drive", "slow" -> away(t, 360f * dir, 0f, 0f)
    "fly" -> away(t, 330f * dir, -150f, -12f * dir)
    "hover" -> kf(t, floatArrayOf(0f, 0f, 0f), floatArrayOf(0.35f, 0f, -40f), floatArrayOf(0.65f, 10f, -46f), floatArrayOf(1f, 0f, 0f)).let { floatArrayOf(it[0], it[1], 0f, 1f) }
    "sail" -> kf(t, floatArrayOf(0f, 0f, 0f, 0f), floatArrayOf(0.25f, 30f * dir, -4f, 3f), floatArrayOf(0.5f, 60f * dir, 0f, -3f), floatArrayOf(0.75f, 30f * dir, -4f, 3f), floatArrayOf(1f, 0f, 0f, 0f)).let { floatArrayOf(it[0], it[1], it[2], 1f) }
    "launch" -> kf(t, floatArrayOf(0f, 0f, 0f), floatArrayOf(0.06f, -2f, 0f), floatArrayOf(0.12f, 2f, 0f), floatArrayOf(0.18f, 0f, 0f), floatArrayOf(0.55f, 0f, -340f), floatArrayOf(1f, 0f, 0f)).let { floatArrayOf(it[0], it[1], 0f, 1f) }
    else -> floatArrayOf(0f, 0f, 0f, 1f)
}

/** Motion of one moving part (wheel, rotor, spin, gear, arm, bucket, flame) at t / ms. */
private fun aliveRole(kind: String, dir: Int, role: String?, radius: Float, gearIndex: Int, t: Float, ms: Float): RoleXf? {
    val e = EASE.transform(t.coerceIn(0f, 1f))
    return when {
        role == null -> null
        (kind == "drive" || kind == "slow") && role == "wheel" -> RoleXf(rotate = (if (kind == "slow") 540f else 900f) * dir * e)
        kind == "hover" && role == "rotor" -> if (ms < 4000f) RoleXf(scaleX = 1f - 0.85f * tri(ms, 400f)) else null
        kind == "hover" && role == "spin" -> RoleXf(rotate = 1080f * e)
        kind == "launch" && role == "flame" -> if (ms < 3600f) (1f + 0.35f * tri(ms, 600f)).let { RoleXf(scaleX = it, scaleY = it) } else null
        kind == "lift" && role == "arm" -> RoleXf(rotate = kf(t, floatArrayOf(0f, 0f), floatArrayOf(0.4f, -14f), floatArrayOf(0.6f, -14f), floatArrayOf(1f, 0f))[0])
        kind == "lift" && role == "bucket" -> kf(t, floatArrayOf(0f, 0f, 0f), floatArrayOf(0.4f, -22f, -48f), floatArrayOf(0.6f, -22f, -48f), floatArrayOf(1f, 0f, 0f)).let { RoleXf(dx = it[0], dy = it[1]) }
        kind == "turn" && role == "spin" -> RoleXf(rotate = 540f * e)
        kind == "turn" && role == "gear" -> RoleXf(rotate = (360f * 40f / max(1f, radius)) * (if (gearIndex % 2 == 1) -1f else 1f) * e)
        else -> null
    }
}

// ------------------------------------------------------------------ screen
@Composable
fun BuildItScreen() {
    val app = LocalApp.current
    val saved = rememberSaved("build", BuildState.serializer(), BuildState())
    var modelId by rememberSaveable { mutableStateOf<String?>(null) }
    var free by rememberSaveable { mutableStateOf(false) }
    var run by rememberSaveable { mutableIntStateOf(0) }
    TrackLast("/play/build", T.title)
    BackHandler(modelId != null || free) { modelId = null; free = false }
    val level = saved.value.level.coerceIn(1, 3)
    EarlyScreen(T.title.tx, { if (modelId != null || free) { modelId = null; free = false } else app.back() }) { b ->
        val model = modelId?.let { b.model[it] }
        when {
            model != null -> androidx.compose.runtime.key("${model.id}-$level-$run") {
                Builder(b, model, level, saved,
                    onNextLevel = if (level < 3) ({ saved.update { it.copy(level = level + 1) }; run++ }) else null,
                    onAnother = { modelId = null })
            }
            free -> FreeBuild(b, saved)
            else -> BuildMenu(b, level, saved, onModel = { modelId = it; run++ }, onFree = { free = true })
        }
    }
}

@Composable
private fun BuildMenu(b: EarlyBundle, level: Int, saved: Saved<BuildState>, onModel: (String) -> Unit, onFree: () -> Unit) {
    val phone = LocalWindow.current.isPhone
    val reqs = remember(b) { (b.models.map { sceneReq(it.scene) } + b.models.flatMap { m -> m.parts.map { partReq(it) } } + sceneReq("road")).distinctBy { it.key } }
    val pics = rememberPics(reqs)
    val design = saved.value.free ?: b.freeInit
    val freePics = rememberPics(listOf(freeReq(design)))
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(if (phone) 6.dp else 10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        PromptBar(T.pick, maxLines = 1)
        LevelPicker((1..3).map { b.levelNames["$it"] ?: L("$it", "$it") }, level - 1, { i -> saved.update { s -> s.copy(level = i + 1) } })
        FitGrid(b.models.size + 1, Modifier.weight(1f).fillMaxWidth(), gap = if (phone) 6.dp else 12.dp, aspect = 1.15f, maxCell = 220.dp) { i, _ ->
            if (i < b.models.size) {
                val m = b.models[i]
                val done = saved.value.done[m.id] ?: 0
                BigTile(null, m.name, { onModel(m.id) }, Modifier.fillMaxSize(), sub = if (done > 0) "✓".repeat(done) else null, picture = { s ->
                    Canvas(Modifier.size(s, s * (BH / BW))) {
                        drawIntoCanvas { cv ->
                            val c = cv.nativeCanvas; val k = size.width / BW
                            c.save(); c.scale(k, k)
                            drawPrims(c, pics["scenery:${m.scene}"])
                            m.parts.forEach { p -> drawPart(c, p, pics[partReq(p).key]) }
                            c.restore()
                        }
                    }
                })
            } else {
                BigTile(null, T.free, onFree, Modifier.fillMaxSize(), tint = tint("art"), picture = { s ->
                    Canvas(Modifier.size(s, s * (BH / BW))) {
                        drawIntoCanvas { cv ->
                            val c = cv.nativeCanvas; val k = size.width / BW
                            c.save(); c.scale(k, k)
                            drawPrims(c, pics["scenery:road"]); drawPrims(c, freePics[freeReq(design).key])
                            c.restore()
                        }
                    }
                })
            }
        }
    }
}

private class Drag(val id: String, val finger: Offset, val shown: Offset, val near: String?)

@Composable
private fun Builder(b: EarlyBundle, model: Model, level: Int, saved: Saved<BuildState>, onNextLevel: (() -> Unit)?, onAnother: () -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("build")
    val badge = rememberBadge()
    val scope = rememberCoroutineScope()
    val reduce = LocalReduceMotion.current
    val density = LocalDensity.current
    val lang = WL.lang
    val c = WL.colors

    val seed = rememberSaveable { newSeed() }
    val toPlace = remember(model, level) { model.parts.filter { it.lv <= level } }
    val prebuilt = remember(model, level) { model.parts.filter { it.lv > level }.map { it.id }.toSet() }
    val trayOrder = remember(seed, toPlace) { toPlace.shuffled(Random(seed)) }
    // filled: slot id → part id ("slot=part,…" so it survives rotation)
    var filledStr by rememberSaveable { mutableStateOf("") }
    val filled: Map<String, String> = remember(filledStr) { filledStr.split(',').filter { it.contains('=') }.associate { it.substringBefore('=') to it.substringAfter('=') } }
    val orients = remember { mutableStateMapOf<String, Orient>().apply { toPlace.forEach { put(it.id, startOrient(it, level)) } } }
    var sel by rememberSaveable { mutableStateOf<String?>(null) }
    val misses = remember { mutableStateMapOf<String, Int>() }
    var msg by remember { mutableStateOf("") }
    var alive by rememberSaveable { mutableIntStateOf(0) }
    var drag by remember { mutableStateOf<Drag?>(null) }
    var boardRect by remember { mutableStateOf(Rect.Zero) }
    var rootPos by remember { mutableStateOf(Offset.Zero) }
    val itemPos = remember { HashMap<String, Offset>() }
    var finishing by remember { mutableStateOf(false) }

    val complete = filled.size == toPlace.size
    val used = filled.values.toSet()
    val tray = trayOrder.filter { it.id !in used }
    val partById = { id: String -> model.parts.first { it.id == id } }
    val selPart = sel?.let { id -> model.parts.firstOrNull { it.id == id } }
    val pics = rememberPics(remember(model) { listOf(sceneReq(model.scene)) + model.parts.map { partReq(it) } })
    val snap = b.snap["$level"] ?: 50f
    val mag = b.magnet["$level"] ?: 0.3f

    Narrate(L("Let’s build a ${model.name.en.lowercase()}! ${T.howTo.en}", "${model.name.te ?: model.name.en} తయారు చేద్దాం! ${T.howTo.te}"), model.id)

    // ---- come alive: animation + its sound, in sync; replayable
    val prog = remember { Animatable(0f) }
    var aliveMs by remember { mutableFloatStateOf(-1f) }
    val stopRef = remember { arrayOfNulls<() -> Unit>(1) }
    DisposableEffect(Unit) { onDispose { stopRef[0]?.invoke() } }
    LaunchedEffect(alive) {
        if (alive == 0) return@LaunchedEffect
        stopRef[0]?.invoke()
        stopRef[0] = Sfx.cues(model.cueList)
        if (reduce) return@LaunchedEffect
        prog.snapTo(0f)
        prog.animateTo(1f, tween(b.aliveMs.toInt(), easing = LinearEasing)) { aliveMs = value * b.aliveMs }
        aliveMs = -1f
    }
    val t = prog.value
    val animating = aliveMs >= 0f && !reduce
    val gearIndex = remember(model) { model.parts.filter { it.role == "gear" }.mapIndexed { i, p -> p.id to i }.toMap() }

    // ---- pop for a part that has just clicked into place
    val pop = remember { Animatable(1f) }
    var popId by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(popId) { if (popId != null && !reduce) { pop.snapTo(0.7f); pop.animateTo(1f, tween(350, easing = EASE)) } }
    val hintPulse = if (!reduce) rememberInfiniteTransition(label = "hint").animateFloat(0.45f, 1f, infiniteRepeatable(tween(600), RepeatMode.Reverse), label = "h").value else 1f

    fun finish() {
        if (finishing) return
        finishing = true
        EarlyFx.celebrate()
        Sfx.play("success")
        say(L("You built a ${model.name.en.lowercase()}!", "నువ్వు ${model.name.te ?: model.name.en} తయారు చేశావు!"))
        val hints = if (misses.values.any { it >= 2 }) 1 else 0
        record("${model.id}:L$level", true, hints)
        scope.launch {
            val next = app.engine.early<BuildState>("recordBuild", json(saved.current()), model.id, level)
            if (next != null) {
                saved.update { cur -> cur.copy(done = next.done) }
                val ids = app.engine.early<List<String>>("badgesFor", json(next)) ?: emptyList()
                ids.forEach { badge(it, null) }
            }
            delay(900)
            alive++
        }
    }

    fun handle(res: DropResult?, part: ModelPart) {
        val slot = res?.slot
        if (slot != null) {
            val f = filled + (slot to part.id)
            filledStr = f.entries.joinToString(",") { "${it.key}=${it.value}" }
            sel = null; msg = ""; popId = slot
            Sfx.play("snap")
            scope.launch {
                val ps = app.engine.early<String>("placeSfx", model.id, slot) ?: "snap"
                if (ps != "snap") { delay(160); Sfx.play(ps) }
            }
            if (f.size == toPlace.size) finish() else say(b.partName(partById(slot)))
            return
        }
        Sfx.play("pop")
        if (res?.turn != null) { sel = part.id; msg = T.turnIt.get(lang); say(T.turnIt); return }
        misses[part.id] = (misses[part.id] ?: 0) + 1
        msg = T.elsewhere.get(lang); say(T.elsewhere)
    }

    fun choose(p: ModelPart) {
        if (complete) return
        Sfx.play("click")
        sel = if (sel == p.id) null else p.id
        say(b.partName(p))
    }

    fun tapSlot(slot: ModelPart) {
        if (complete || filled.containsKey(slot.id)) return
        val sp = selPart
        if (sp == null) { msg = T.pickFirst.get(lang); say(T.pickFirst); return }
        scope.launch {
            val res = app.engine.early<DropResult>("tapPlace", model.id, level, filled, sp.id, json(orients[sp.id] ?: Orient()), slot.id)
            handle(res, sp)
        }
    }

    // Gentle magnet toward the nearest matching free slot (magnet() in data/builds.ts, run per finger move).
    fun magnet(part: ModelPart, x: Float, y: Float): MagnetResult {
        var best: ModelPart? = null; var bestD = Float.MAX_VALUE
        for (s in toPlace) {
            if (filled.containsKey(s.id) || shapeKey(s) != shapeKey(part)) continue
            val d = hypot(s.x - x, s.y - y)
            if (d < bestD) { best = s; bestD = d }
        }
        if (best == null || bestD > snap * 1.5f) return MagnetResult(x, y)
        val k = mag * (1 - bestD / (snap * 1.5f))
        return MagnetResult(x + (best.x - x) * k, y + (best.y - y) * k, if (bestD <= snap) best.id else null)
    }
    fun toBoard(w: Offset): Offset { val k = boardRect.width / BW; return if (k <= 0f) Offset.Zero else Offset((w.x - boardRect.left) / k, (w.y - boardRect.top) / k) }
    fun fromBoard(p: Offset): Offset { val k = boardRect.width / BW; return Offset(boardRect.left + p.x * k, boardRect.top + p.y * k) }
    fun moveTo(p: ModelPart, finger: Offset) {
        val bp = toBoard(finger)
        val m = magnet(p, bp.x, bp.y)
        drag = Drag(p.id, finger, fromBoard(Offset(m.x, m.y)), m.near)
    }
    fun drop() {
        val d = drag ?: return
        drag = null
        val p = partById(d.id)
        val bp = toBoard(d.shown)
        scope.launch { handle(app.engine.early<DropResult>("dropPart", model.id, level, filled, p.id, json(orients[p.id] ?: Orient()), bp.x, bp.y), p) }
    }
    val hintFor = { slot: ModelPart -> selPart != null && (misses[selPart.id] ?: 0) >= 2 && !filled.containsKey(slot.id) && shapeKey(slot) == shapeKey(selPart) }

    val onTapBoard by rememberUpdatedState { pos: Offset, k: Float ->
        val bp = Offset(pos.x / k, pos.y / k)
        toPlace.filter { it.id !in prebuilt && !filled.containsKey(it.id) && abs(bp.x - it.x) <= it.w / 2 + 12 && abs(bp.y - it.y) <= it.h / 2 + 12 }
            .minByOrNull { hypot(it.x - bp.x, it.y - bp.y) }?.let { tapSlot(it) }
    }

    val curMove by rememberUpdatedState { p: ModelPart, f: Offset -> if (!complete) moveTo(p, f) }
    val curDrop by rememberUpdatedState { drop() }

    val primary = c.primary.toArgb(); val accent = c.accent.toArgb(); val good = c.good.toArgb()

    val board = @Composable { mod: Modifier ->
        BoxWithConstraints(mod, contentAlignment = Alignment.Center) {
            val bw = min(maxWidth, maxHeight * (BW / BH))
            Box(
                Modifier.size(bw, bw * (BH / BW)).shadow(4.dp, RoundedCornerShape(18.dp)).clip(RoundedCornerShape(18.dp))
                    .onGloballyPositioned { boardRect = it.boundsInWindow() }
                    .pointerInput(Unit) { detectTapGestures { pos -> onTapBoard(pos, size.width / BW) } }
                    .semantics { contentDescription = "${model.name.get(lang)}: ${filled.size} / ${toPlace.size}" },
            ) {
                Canvas(Modifier.fillMaxSize()) {
                    val k = size.width / BW
                    drawIntoCanvas { cv ->
                        val cnv = cv.nativeCanvas
                        cnv.save(); cnv.clipRect(0f, 0f, size.width, size.height); cnv.scale(k, k)
                        drawPrims(cnv, pics["scenery:${model.scene}"])
                        val mx = if (animating) aliveModel(model.alive, model.dir ?: 1, t) else floatArrayOf(0f, 0f, 0f, 1f)
                        val layer = if (mx[3] < 1f) cnv.saveLayerAlpha(-BW, -BH, BW * 2, BH * 2, (mx[3] * 255).roundToInt().coerceIn(0, 255)) else cnv.save()
                        cnv.translate(mx[0], mx[1]); if (mx[2] != 0f) cnv.rotate(mx[2], 200f, 230f)
                        for (p in model.parts) {
                            val pic = pics[partReq(p).key]
                            if (p.id in prebuilt || filled.containsKey(p.id)) {
                                val role = if (animating) aliveRole(model.alive, model.dir ?: 1, p.role, p.w / 2, gearIndex[p.id] ?: 0, t, aliveMs) else null
                                drawPart(cnv, p, pic, role = role, scale = if (popId == p.id) pop.value else 1f)
                            } else {
                                val near = drag?.near == p.id
                                val hint = hintFor(p)
                                val outline = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                                    style = Paint.Style.STROKE; color = if (hint) accent else if (near) good else primary
                                    alpha = if (hint) (255 * hintPulse).roundToInt() else 210
                                    strokeWidth = if (hint || near) 3.5f else 2.2f
                                    strokeJoin = Paint.Join.ROUND; pathEffect = DashPathEffect(floatArrayOf(6f, 5f), 0f)
                                }
                                val ghost = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL; color = if (near) good else android.graphics.Color.WHITE; alpha = if (near) 90 else 70 }
                                drawPart(cnv, p, pic, outline = outline, ghostFill = ghost)
                            }
                        }
                        cnv.restoreToCount(layer)
                        cnv.restore()
                    }
                }
                if (complete && reduce) Box(Modifier.align(Alignment.TopCenter).padding(8.dp).clip(RoundedCornerShape(16.dp)).background(c.surface).padding(horizontal = 14.dp, vertical = 6.dp)) {
                    Text(T.ready.tx, style = MaterialTheme.typography.titleLarge, color = c.text)
                }
            }
        }
    }

    val trayView = @Composable { mod: Modifier ->
        FitGrid(tray.size, mod, gap = 8.dp, maxCell = 120.dp) { i, s ->
            val p = tray[i]
            val o = orients[p.id] ?: Orient()
            val isSel = sel == p.id
            val dragging = drag?.id == p.id
            val name = b.partName(p).get(lang) + if (canTurn(p, level) || canFlip(p, level)) " (${T.canTurn.get(lang)})" else ""
            Box(
                Modifier.size(s).graphicsLayer { alpha = if (dragging) 0.35f else 1f }
                    .onGloballyPositioned { itemPos[p.id] = it.positionInWindow() }
                    .pointerInput(p.id) {
                        detectDragGestures(
                            onDragStart = { off -> curMove(p, (itemPos[p.id] ?: Offset.Zero) + off) },
                            onDrag = { ch, d -> ch.consume(); drag?.let { curMove(p, it.finger + d) } },
                            onDragEnd = { curDrop() },
                            onDragCancel = { drag = null },
                        )
                    }
                    .shadow(4.dp, RoundedCornerShape(18.dp)).clip(RoundedCornerShape(18.dp)).background(c.surface)
                    .border(if (isSel) 4.dp else 1.dp, if (isSel) c.primary else c.line, RoundedCornerShape(18.dp))
                    .pressable(role = Role.Button, sound = false) { choose(p) }
                    .semantics { contentDescription = name; if (isSel) stateDescription = "selected" },
            ) {
                Canvas(Modifier.fillMaxSize().padding(6.dp)) { drawPartIcon(p, pics[partReq(p).key], o) }
                if (isSel) Box(Modifier.align(Alignment.TopEnd).padding(4.dp).size(24.dp).clip(RoundedCornerShape(12.dp)).background(c.primary), contentAlignment = Alignment.Center) {
                    Icon(Icons.Rounded.PanTool, null, tint = c.primaryInk, modifier = Modifier.size(15.dp))
                }
            }
        }
    }

    val controls = @Composable {
        if (!complete && selPart != null && (canTurn(selPart, level) || canFlip(selPart, level))) {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                if (canTurn(selPart, level)) KidButton(T.rotate.tx, { Sfx.play("click"); orients[selPart.id] = (orients[selPart.id] ?: Orient()).let { it.copy(rot = (it.rot + 90) % 360) } }, icon = Icons.Rounded.RotateRight)
                if (canFlip(selPart, level)) KidButton(T.flip.tx, { Sfx.play("click"); orients[selPart.id] = (orients[selPart.id] ?: Orient()).let { it.copy(flip = !it.flip) } }, icon = Icons.Rounded.Flip)
            }
        }
        if (!complete && msg.isNotEmpty()) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Icon(Icons.Rounded.PanTool, null, tint = c.accent, modifier = Modifier.size(20.dp))
            Text(msg, style = MaterialTheme.typography.titleSmall.copy(fontFamily = if (lang == "te") WLFonts.telugu else WLFonts.kid, fontSize = 16.sp), color = c.text, maxLines = 2, textAlign = TextAlign.Center)
        }
    }
    val doneButtons = @Composable { mod: Modifier ->
        Column(mod, verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) {
            KidButton(T.again.tx, { alive++ }, icon = Icons.Rounded.PlayArrow, primary = true)
            if (onNextLevel != null) KidButton(T.nextLevel.tx, onNextLevel, icon = Icons.Rounded.Add)
            KidButton(T.another.tx, onAnother, icon = Icons.Rounded.GridView)
        }
    }

    Box(Modifier.fillMaxSize().onGloballyPositioned { rootPos = it.positionInWindow() }) {
        BoxWithConstraints(Modifier.fillMaxSize()) {
            val land = maxWidth > maxHeight * 1.15f
            Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                PromptBar(if (complete) L("You built a ${model.name.en.lowercase()}!", "నువ్వు ${model.name.te ?: model.name.en} తయారు చేశావు!") else T.howTo, maxLines = 2)
                if (land) Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    board(Modifier.weight(1.7f).fillMaxSize())
                    if (complete) doneButtons(Modifier.weight(1f).fillMaxSize())
                    else Column(Modifier.weight(1f).fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        trayView(Modifier.weight(1f).fillMaxWidth())
                        controls()
                    }
                } else {
                    board(Modifier.weight(1.3f).fillMaxWidth())
                    if (complete) doneButtons(Modifier.weight(1f).fillMaxWidth())
                    else {
                        trayView(Modifier.weight(0.75f).fillMaxWidth())
                        controls()
                    }
                }
            }
        }
        // the part following the finger
        val d = drag
        if (d != null && boardRect.width > 0f) {
            val p = partById(d.id)
            val k = boardRect.width / BW
            val px = (max(p.w, p.h) * 1.15f + 6f) * k
            val sizeDp: Dp = with(density) { px.toDp() }
            Canvas(
                Modifier.offset { IntOffset((d.shown.x - rootPos.x - px / 2).roundToInt(), (d.shown.y - rootPos.y - px / 2).roundToInt()) }
                    .size(sizeDp).graphicsLayer { scaleX = 1.06f; scaleY = 1.06f; alpha = 0.92f },
            ) { drawPartIcon(p, pics[partReq(p).key], orients[p.id] ?: Orient()) }
        }
    }
}

// ------------------------------------------------------------------ free build
@Composable
private fun FreeBuild(b: EarlyBundle, saved: Saved<BuildState>) {
    val say = rememberSay()
    val reduce = LocalReduceMotion.current
    val lang = WL.lang
    var d by remember { mutableStateOf(saved.value.free ?: b.freeInit) }
    var go by rememberSaveable { mutableIntStateOf(0) }
    val pics = rememberPics(listOf(sceneReq("road"), freeReq(d)))
    Narrate(T.freeSay, "free")
    fun set(n: FreeDesign) { d = n; saved.update { it.copy(free = n) }; Sfx.play("snap") }

    val prog = remember { Animatable(0f) }
    var running by remember { mutableStateOf(false) }
    val stopRef = remember { arrayOfNulls<() -> Unit>(1) }
    DisposableEffect(Unit) { onDispose { stopRef[0]?.invoke() } }
    LaunchedEffect(go) {
        if (go == 0) return@LaunchedEffect
        stopRef[0]?.invoke()
        val body = b.freeBodies.firstOrNull { it.id == d.body }
        stopRef[0] = Sfx.cues(listOfNotNull(body?.let { 0L to it.sfx }, 2400L to "horn"))
        if (reduce) return@LaunchedEffect
        running = true
        prog.snapTo(0f)
        prog.animateTo(1f, tween(b.aliveMs.toInt(), easing = LinearEasing))
        running = false
    }
    val t = prog.value

    val stage = @Composable { mod: Modifier ->
        BoxWithConstraints(mod, contentAlignment = Alignment.Center) {
            val bw = min(maxWidth, maxHeight * (BW / BH))
            Canvas(Modifier.size(bw, bw * (BH / BW)).shadow(4.dp, RoundedCornerShape(18.dp)).clip(RoundedCornerShape(18.dp)).semantics { contentDescription = T.free.get(lang) }) {
                val k = size.width / BW
                drawIntoCanvas { cv ->
                    val c = cv.nativeCanvas
                    c.save(); c.clipRect(0f, 0f, size.width, size.height); c.scale(k, k)
                    drawPrims(c, pics["scenery:road"])
                    val mx = if (running) away(t, 360f, 0f, 0f) else floatArrayOf(0f, 0f, 0f, 1f)
                    val layer = if (mx[3] < 1f) c.saveLayerAlpha(-BW, -BH, BW * 2, BH * 2, (mx[3] * 255).roundToInt().coerceIn(0, 255)) else c.save()
                    c.translate(mx[0], mx[1])
                    val e = EASE.transform(t)
                    drawPrims(c, pics[freeReq(d).key], roleXf = { p -> if (running && p.role == "wheel") RoleXf(rotate = 900f * e) else null })
                    c.restoreToCount(layer)
                    c.restore()
                }
            }
        }
    }

    @Composable
    fun Opt(on: Boolean, label: String, onClick: () -> Unit, swatch: String? = null, modifier: Modifier = Modifier) {
        val c = WL.colors
        Row(
            modifier.heightIn(min = 52.dp).clip(RoundedCornerShape(16.dp)).background(if (on) c.math else c.surface)
                .border(if (on) 3.dp else 1.5.dp, if (on) c.primary else c.line, RoundedCornerShape(16.dp))
                .pressable(role = Role.RadioButton, onClick = onClick).padding(horizontal = 8.dp, vertical = 4.dp)
                .semantics { contentDescription = label; stateDescription = if (on) "selected" else "" },
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally),
        ) {
            if (swatch != null) Swatch(swatch, 28.dp)
            if (on) Icon(Icons.Rounded.Check, null, tint = c.mathInk, modifier = Modifier.size(18.dp))
            if (swatch == null) Text(label, style = MaterialTheme.typography.titleSmall.copy(fontFamily = if (lang == "te") WLFonts.telugu else WLFonts.kid, fontSize = 15.sp), color = if (on) c.mathInk else c.text, maxLines = 1, textAlign = TextAlign.Center)
        }
    }

    val options = @Composable { mod: Modifier ->
        Column(mod, verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterVertically)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                b.freeBodies.forEach { fb -> Opt(d.body == fb.id, fb.name.get(lang), { set(d.copy(body = fb.id)) }, modifier = Modifier.weight(1f)) }
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                b.freeWheels.forEach { fw -> Opt(d.wheel == fw.id, fw.name.get(lang), { set(d.copy(wheel = fw.id)) }, modifier = Modifier.weight(1f)) }
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                b.palette.forEachIndexed { i, col -> Opt(d.colour == col, T.colourNames.getOrNull(i)?.get(lang) ?: col, { set(d.copy(colour = col)) }, swatch = col, modifier = Modifier.weight(1f)) }
            }
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                KidButton(T.go.tx, { go++; say(T.offWeGo) }, icon = Icons.Rounded.PlayArrow, primary = true)
            }
        }
    }

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val land = maxWidth > maxHeight * 1.15f
        if (land) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
            stage(Modifier.weight(1.4f).fillMaxSize())
            options(Modifier.weight(1f).fillMaxSize())
        } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            stage(Modifier.weight(1f).fillMaxWidth())
            options(Modifier.fillMaxWidth())
        }
    }
}

