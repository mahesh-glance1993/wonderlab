package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.platform.BackHandler
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.spring
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Extension
import androidx.compose.material.icons.rounded.Image
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.min
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer

// Shape Play: meet the shapes, find shapes in a scene, build a picture from shapes, what comes next?

@Serializable
data class ShapesState(
    val seen: List<String> = emptyList(), val found: List<String> = emptyList(), val builds: List<String> = emptyList(),
    val adapt: Adapt = Adapt(), val patternLevel: Int = 0, val patternStreak: Int = 0,
)

private data class ShapeMode(val id: String, val title: L, val art: String, val tint: String)
private val SHAPE_MODES = listOf(
    ShapeMode("learn", L("Meet the shapes", "ఆకారాలు తెలుసుకో"), "shape-circle", "math"),
    ShapeMode("find", L("Find the shapes", "ఆకారాలు వెతుకు"), "shape-star", "lab"),
    ShapeMode("build", L("Build a picture", "బొమ్మ కట్టు"), "shape-triangle", "next"),
    ShapeMode("pattern", L("What comes next?", "తర్వాత ఏది?"), "shape-heart", "art"),
)
private fun plural(s: ShapeDef) = L("${s.name.en.lowercase()}s", (s.name.te ?: s.name.en) + "లు")
private const val PATTERN_ROUNDS = 6
private const val INK = "#3A3530"

/** One placed shape on the 400×260 stage (the website's ShapeEl). `outline`: "next" | "later". */
private fun placedNode(b: EarlyBundle, p: Placed, outline: String? = null, grow: Float = 0f): SNode? {
    val sh = b.shape[p.shape] ?: return null
    val x = p.x - grow; val y = p.y - grow; val w = p.w + grow * 2; val h = p.h + grow * 2
    val t = "translate($x $y) rotate(${p.rot ?: 0f} ${w / 2} ${h / 2}) scale(${w / 100f} ${h / 100f})"
    return if (outline != null) svg(
        "path", "d" to sh.path, "transform" to t, "fill" to "none", "stroke" to (if (outline == "next") "#4338CA" else "#7A8794"),
        "strokeWidth" to (if (outline == "next") 3.5 else 2.5), "vectorEffect" to "non-scaling-stroke", "strokeDasharray" to "16 11", "strokeLinejoin" to "round",
    ) else svg("path", "d" to sh.path, "transform" to t, "fill" to p.fill, "stroke" to INK, "strokeWidth" to 2, "vectorEffect" to "non-scaling-stroke", "strokeLinejoin" to "round")
}

private fun hexOf(c: Color) = com.maheshglance.wonderlab.core.platform.hexRgb(c.toArgb())

/** The 400×260 stage scaled to fit, with taps reported in stage units. */
@Composable
private fun ShapeStage(nodes: List<SNode>, cacheKey: String, modifier: Modifier, label: String, onTap: ((Float, Float) -> Unit)? = null) {
    val pic = remember(cacheKey) { compileSvg(nodes) }
    val tap by rememberUpdatedState(onTap)
    BoxWithConstraints(modifier, contentAlignment = Alignment.Center) {
        val k = minOf(maxWidth.value / 400f, maxHeight.value / 260f)
        Canvas(
            Modifier.size((400 * k).dp, (260 * k).dp).clip(RoundedCornerShape(18.dp)).border(2.dp, WL.colors.line, RoundedCornerShape(18.dp))
                .semantics { contentDescription = label }
                .pointerInput(onTap != null) { if (onTap != null) detectTapGestures { o -> tap?.invoke(o.x / size.width * 400f, o.y / size.height * 260f) } },
        ) { drawSvg(pic, 0f, 0f, 400f, 260f) }
    }
}

@Composable
fun ShapePlayScreen() {
    val app = LocalApp.current
    TrackLast("/play/shapes", UI.shapes)
    val saved = rememberSaved("shapes", ShapesState.serializer(), ShapesState())
    var mode by rememberSaveable { mutableStateOf<String?>(null) }
    var sub by rememberSaveable { mutableStateOf<String?>(null) }
    var session by rememberSaveable { mutableIntStateOf(0) }
    val back: () -> Unit = { if (sub != null) { sub = null } else if (mode != null) { mode = null } else app.back() }
    BackHandler(mode != null) { back() }
    val lang = WL.lang
    EarlyScreen(UI.shapes.tx, back) { b ->
        val m = mode
        val sb = sub
        when {
            m == null -> ActMenu(L("Let us play with shapes!", "ఆకారాలతో ఆడుకుందాం!"), SHAPE_MODES.size) { i ->
                val sm = SHAPE_MODES[i]
                BigTile(sm.art, sm.title, { mode = sm.id; session++ }, Modifier.fillMaxSize(), tint = tint(sm.tint))
            }
            m == "learn" -> ShapeLearn(b, saved)
            m == "find" && sb == null -> ActMenu(L("Pick a picture!", "ఒక బొమ్మ ఎంచుకో!"), b.shapeScenes.size) { i ->
                val s = b.shapeScenes[i]
                BigTile("shape-${s.target}", s.title, { sub = s.id }, Modifier.fillMaxSize(), sub = if (saved.value.found.contains(s.target)) "✓" else null)
            }
            m == "find" -> b.shapeScenes.firstOrNull { it.id == sb }?.let { scene ->
                key(sb, session, lang) { FindScene(b, scene, saved, onAgain = { session++ }, onMenu = { mode = null; sub = null }, onAnother = { sub = null }) }
            }
            m == "build" && sb == null -> ActMenu(L("What shall we build?", "ఏమి కడదాం?"), b.shapeBuilds.size) { i ->
                val p = b.shapeBuilds[i]
                BigTile(null, p.name, { sub = p.id }, Modifier.fillMaxSize(), sub = if (saved.value.builds.contains(p.id)) "✓" else null, picture = { s ->
                    ShapeStage(p.slots.mapNotNull { placedNode(b, it) }, "thumb:${p.id}", Modifier.size(s), p.name.tx)
                })
            }
            m == "build" -> b.shapeBuilds.firstOrNull { it.id == sb }?.let { puzzle ->
                key(sb, session, lang) { ShapeBuildView(b, puzzle, saved, onAgain = { session++ }, onMenu = { mode = null; sub = null }, onAnother = { sub = null }) }
            }
            else -> key(session, lang) { ShapePatterns(b, saved, onAgain = { session++ }, onMenu = { mode = null }) }
        }
    }
}

// ---------------------------------------------------------------- Meet the shapes
@Composable
private fun ShapeLearn(b: EarlyBundle, saved: Saved<ShapesState>) {
    val say = rememberSay()
    val reduce = LocalReduceMotion.current
    var cur by rememberSaveable { mutableStateOf<String?>(null) }
    var n by rememberSaveable { mutableIntStateOf(0) }
    val lang = WL.lang
    val open: (String) -> Unit = { id ->
        Tones.tap(); Sfx.play("pop"); cur = id; n++
        b.shape[id]?.let { s -> say(L("${s.name.en}. ${s.hint.en}", "${s.name.te ?: s.name.en}. ${s.hint.te ?: s.hint.en}")) }
        if (!saved.current().seen.contains(id)) saved.update { it.copy(seen = (it.seen + id).distinct()) }
    }
    val land = LocalWindow.current.landscape
    val prompt = L("Tap a shape to see it drawn!", "ఆకారాన్ని తాకితే అది గీస్తాం!")
    val big = @Composable { m: Modifier ->
        val s = cur?.let { b.shape[it] }
        if (s != null) BoxWithConstraints(m, contentAlignment = Alignment.Center) {
            val sc = remember(n) { Animatable(if (reduce) 1f else 0.2f) }
            LaunchedEffect(n) { if (!reduce) sc.animateTo(1f, spring(dampingRatio = 0.45f, stiffness = 250f)) }
            val pic = min(maxHeight * 0.95f, maxWidth * 0.45f)
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Box(Modifier.size(pic).scale(sc.value)) { PicArt("shape-${s.id}", pic) }
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(s.name.tx, style = actText(30), color = WL.colors.text)
                    Text(s.hint.tx, style = actText(18, bold = false), color = WL.colors.muted, maxLines = 3)
                    SpeakButton({ say(L("${s.name.en}. ${s.hint.en}", "${s.name.te ?: s.name.en}. ${s.hint.te ?: s.hint.en}")) }, size = 56.dp)
                }
            }
        } else Box(m)
    }
    val grid = @Composable { m: Modifier ->
        FitGrid(b.shapes.size, m, gap = 10.dp, maxCell = 200.dp) { i, _ ->
            val x = b.shapes[i]
            PicButton("shape-${x.id}", x.name.get(lang), { open(x.id) }, Modifier.fillMaxSize(), showLabel = true,
                state = if (saved.value.seen.contains(x.id) && cur == x.id) Pick.Right else null)
        }
    }
    if (land) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        Column(Modifier.weight(0.45f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(10.dp)) { PromptBar(prompt); big(Modifier.weight(1f).fillMaxWidth()) }
        grid(Modifier.weight(0.55f).fillMaxHeight())
    } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        PromptBar(prompt)
        if (cur != null) big(Modifier.weight(0.7f).fillMaxWidth())
        grid(Modifier.weight(1f).fillMaxWidth())
    }
}

// ---------------------------------------------------------------- Find the shapes
@Composable
private fun FindScene(b: EarlyBundle, scene: ShapeScene, saved: Saved<ShapesState>, onAgain: () -> Unit, onMenu: () -> Unit, onAnother: () -> Unit) {
    val say = rememberSay()
    val record = rememberRecord("shapes")
    val badge = rememberBadge()
    val lang = WL.lang
    val target = b.shape[scene.target] ?: return
    val targets = scene.items.indices.filter { scene.items[it].shape == scene.target }
    var found by rememberSaveable { mutableStateOf(listOf<Int>()) }
    var misses by rememberSaveable { mutableIntStateOf(0) }
    var lastOk by rememberSaveable { mutableStateOf<Boolean?>(null) }
    var lastText by rememberSaveable { mutableStateOf("") }
    val pl = plural(target)
    val prompt = L("Tap all the ${pl.en}!", "అన్ని ${pl.te} తాకు!")
    Narrate(prompt, scene.id)
    val done = found.size == targets.size

    val tapItem: (Int) -> Unit = { i ->
        if (!done && !found.contains(i)) {
            val it = scene.items[i]
            val itShape = b.shape[it.shape]
            val label = it.label ?: itShape?.name ?: L(it.shape, it.shape)
            if (it.shape == scene.target) {
                Tones.tap()
                val f = found + i
                found = f
                record("find:${scene.id}:$i", true, if (misses >= 2) 1 else 0)
                if (f.size == targets.size) {
                    val msg = L("You found all ${targets.size} ${pl.en}!", "${targets.size} ${pl.te} అన్నీ కనిపెట్టావు!")
                    lastOk = true; lastText = msg.get(lang); say(msg); EarlyFx.celebrate(); Sfx.play("success")
                    val allFound = (saved.current().found + scene.target).distinct()
                    saved.update { s -> s.copy(found = allFound) }
                    if (b.shapes.all { s -> allFound.contains(s.id) }) badge("play:all-shapes", null)
                } else {
                    val msg = L("${f.size}! A ${target.name.en.lowercase()} — the ${label.en}.", "${f.size}! ${label.te ?: label.en} — ${target.name.te ?: target.name.en}.")
                    lastOk = true; lastText = msg.get(lang); say(msg); Sfx.play("snap")
                }
            } else {
                misses++
                record("find:${scene.id}:$i", false, 0)
                val sn = itShape?.name ?: L(it.shape, it.shape)
                val msg = L("That ${label.en} is a ${sn.en.lowercase()}. Look for ${pl.en}!", "${label.te ?: label.en} ${sn.te ?: sn.en}. ${pl.te} కోసం చూడు!")
                lastOk = false; lastText = msg.get(lang); say(msg)
            }
        }
    }
    // generous hit areas (±12 like the website); the smallest matching item wins so little shapes stay tappable
    val onStage: (Float, Float) -> Unit = { x, y ->
        val hits = scene.items.indices.filter { i -> val p = scene.items[i]; x >= p.x - 12 && x <= p.x + p.w + 12 && y >= p.y - 12 && y <= p.y + p.h + 12 }
        val exact = hits.filter { i -> val p = scene.items[i]; x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h }
        (exact.ifEmpty { hits }).minByOrNull { i -> scene.items[i].w * scene.items[i].h }?.let(tapItem)
    }
    if (done) {
        DonePanel(onAgain, onMenu, extra = { KidButton(L("Another picture", "ఇంకో బొమ్మ").tx, onAnother, icon = Icons.Rounded.Image) })
        return
    }
    val nodes = buildList {
        add(svg("rect", "width" to 400, "height" to 260, "fill" to scene.sky))
        add(svg("rect", "y" to 200, "width" to 400, "height" to 60, "fill" to scene.ground))
        scene.decor.forEach { p -> placedNode(b, p)?.let { add(it) } }
        scene.items.forEachIndexed { i, p ->
            placedNode(b, p)?.let { add(it) }
            if (found.contains(i)) {
                placedNode(b, p, "next", 4f)?.let { add(it) }
                add(svg("circle", "cx" to p.x + p.w, "cy" to p.y, "r" to 11, "fill" to "#2F6B4F", "stroke" to "#FFFFFF", "strokeWidth" to 2))
                add(svg("path", "d" to "M${p.x + p.w - 5} ${p.y} l3.5 3.5 l6 -7", "stroke" to "#FFFFFF", "strokeWidth" to 2.6, "fill" to "none", "strokeLinecap" to "round"))
            } else if (misses >= 2 && p.shape == scene.target) placedNode(b, p, "later", 5f)?.let { add(it) }
        }
    }
    ActPlay(
        header = {
            PromptBar(prompt, leading = { PicArt("shape-${target.id}", 36.dp) }, trailing = { Text("${found.size} / ${targets.size}", style = actText(20), color = WL.colors.text) })
        },
        footer = { lastOk?.let { ok -> EarlyFeedback(ok, misses, extra = lastText) } },
    ) {
        ShapeStage(nodes, "scene:${scene.id}:${found.joinToString()}:${misses >= 2}", Modifier.fillMaxSize(), scene.title.tx, onStage)
    }
}

// ---------------------------------------------------------------- Build a picture
@Composable
private fun ShapeBuildView(b: EarlyBundle, puzzle: ShapeBuild, saved: Saved<ShapesState>, onAgain: () -> Unit, onMenu: () -> Unit, onAnother: () -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("shapes")
    val scope = rememberCoroutineScope()
    val lang = WL.lang
    val seed = rememberSaveable { newSeed() }
    var step by rememberSaveable { mutableIntStateOf(0) }
    var wrong by rememberSaveable { mutableStateOf(listOf<String>()) }
    val choicesState = rememberActState(ListSerializer(String.serializer()))
    val n = puzzle.slots.size
    val done = step >= n
    val slot = puzzle.slots[minOf(step, n - 1)]
    LaunchedEffect(Unit) { if (choicesState.value == null) choicesState.value = app.engine.early<List<String>>("buildChoices", seed, slot.shape, saved.current().adapt.choices) }
    val prompt = if (done) L("You built a ${puzzle.name.en.lowercase()}!", "${puzzle.name.te ?: puzzle.name.en} కట్టావు!") else L("Which shape fits the dotted line?", "చుక్కల గీతలో ఏ ఆకారం సరిపోతుంది?")
    Narrate(prompt, step)
    val choices = choicesState.value

    val pick: (String) -> Unit = { s ->
        if (!done) {
            val ok = s == slot.shape
            record("build:${puzzle.id}:$step", ok, if (wrong.size >= 2) 1 else 0)
            val first = ok && wrong.isEmpty()
            scope.launch { val a = app.engine.adaptNext(saved.current().adapt, ok, first); saved.update { it.copy(adapt = a) } }
            val sn = b.shape[s]?.name ?: L(s, s)
            if (!ok) {
                wrong = wrong + s
                say(L("That is a ${sn.en.lowercase()}. ${UI.tryAgain.en}", "అది ${sn.te ?: sn.en}. ${UI.tryAgain.te}"))
            } else {
                Tones.correct(); Sfx.play("snap")
                val ns = step + 1
                step = ns; wrong = emptyList()
                if (ns >= n) { EarlyFx.celebrate(); Sfx.play("success"); saved.update { it.copy(builds = (it.builds + puzzle.id).distinct()) } }
                else {
                    say(L("${sn.en}! ${UI.wellDone.en}", "${sn.te ?: sn.en}! ${UI.wellDone.te}"))
                    scope.launch {
                        val a = app.engine.adaptNext(saved.current().adapt, true)
                        choicesState.value = app.engine.early<List<String>>("buildChoices", seed + ns * 101, puzzle.slots[ns].shape, a.choices) ?: choicesState.value
                    }
                }
            }
        }
    }
    fun stateOf(s: String): Pick? = when { wrong.contains(s) -> Pick.Wrong; wrong.size >= 2 && s == slot.shape -> Pick.Hint; else -> null }
    val nodes = buildList {
        add(svg("rect", "width" to 400, "height" to 260, "fill" to hexOf(WL.colors.paper)))
        puzzle.slots.forEachIndexed { i, p -> (if (i < step) placedNode(b, p) else placedNode(b, p, if (i == step) "next" else "later"))?.let { add(it) } }
    }
    val stage = @Composable { m: Modifier -> ShapeStage(nodes, "build:${puzzle.id}:$step:${WL.colors.dark}", m, "${puzzle.name.get(lang)}: $step / $n") }
    if (done) {
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            stage(Modifier.weight(0.8f).fillMaxWidth())
            DonePanel(onAgain, onMenu, Modifier.weight(1f), extra = { KidButton(L("Build another", "ఇంకొకటి కట్టు").tx, onAnother, icon = Icons.Rounded.Extension) })
        }
        return
    }
    ActPlay(
        header = { RoundDots(step, n); PromptBar(prompt) },
        footer = { if (wrong.isNotEmpty()) EarlyFeedback(false, wrong.size) },
    ) {
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            stage(Modifier.weight(1.3f).fillMaxWidth())
            if (choices == null) Box(Modifier.weight(1f)) { EarlyLoading() }
            else FitGrid(choices.size, Modifier.weight(1f).fillMaxWidth(), gap = 10.dp, maxCell = 180.dp) { i, _ ->
                val s = choices[i]
                val st = stateOf(s)
                PicButton("shape-$s", b.shape[s]?.name?.get(lang) ?: s, { pick(s) }, Modifier.fillMaxSize(), state = st, enabled = st != Pick.Wrong, showLabel = true)
            }
        }
    }
}

// ---------------------------------------------------------------- What comes next? (shapes)
@Composable
private fun ShapePatterns(b: EarlyBundle, saved: Saved<ShapesState>, onAgain: () -> Unit, onMenu: () -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("shapes")
    val scope = rememberCoroutineScope()
    val lang = WL.lang
    val seed = rememberSaveable { newSeed() }
    var idx by rememberSaveable { mutableIntStateOf(0) }
    val roundState = rememberActState(ShapePatternRound.serializer())
    var wrong by rememberSaveable { mutableStateOf(listOf<String>()) }
    var solved by rememberSaveable { mutableStateOf(false) }
    var finished by rememberSaveable { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        if (roundState.value == null) { val st = saved.current(); roundState.value = app.engine.early<ShapePatternRound>("patternRound", seed, st.patternLevel, st.adapt.choices) }
    }
    val prompt = L("Which shape comes next?", "తర్వాత ఏ ఆకారం వస్తుంది?")
    Narrate(if (finished) null else prompt, "$idx-${roundState.value?.answer}")
    if (finished) { DonePanel(onAgain, onMenu); return }
    val round = roundState.value ?: run { EarlyLoading(); return }

    val pick: (String) -> Unit = { s ->
        if (!solved) {
            val ok = s == round.answer
            record("pattern:${round.unit.joinToString("-")}", ok, if (wrong.size >= 2) 1 else 0)
            val first = ok && wrong.isEmpty()
            val hadWrong = wrong.isNotEmpty()
            saved.update { x ->
                val streak = if (first) x.patternStreak + 1 else 0
                val up = streak >= 3
                x.copy(patternStreak = if (up) 0 else streak, patternLevel = if (up) minOf(2, x.patternLevel + 1) else if (!ok && hadWrong) maxOf(0, x.patternLevel - 1) else x.patternLevel)
            }
            scope.launch { val a = app.engine.adaptNext(saved.current().adapt, ok, first); saved.update { it.copy(adapt = a) } }
            val sn = b.shape[s]?.name ?: L(s, s)
            if (ok) { solved = true; Sfx.play("snap"); say(L("${sn.en}! ${UI.wellDone.en}", "${sn.te ?: sn.en}! ${UI.wellDone.te}")) }
            else { wrong = wrong + s; say(UI.tryAgain) }
        }
    }
    val next: () -> Unit = {
        if (idx + 1 >= PATTERN_ROUNDS) { finished = true; EarlyFx.celebrate(); Sfx.play("success") }
        else scope.launch {
            val st = saved.current()
            val r = app.engine.early<ShapePatternRound>("patternRound", seed + (idx + 1) * 31, st.patternLevel, st.adapt.choices)
            if (r != null) { roundState.value = r; idx += 1; wrong = emptyList(); solved = false }
        }
    }
    fun stateOf(s: String): Pick? = when {
        solved && s == round.answer -> Pick.Right
        wrong.contains(s) -> Pick.Wrong
        wrong.size >= 2 && s == round.answer -> Pick.Hint
        else -> null
    }
    val nextButton: @Composable () -> Unit = { NextButton(next) }
    val seqText = round.seq.joinToString(", ") { b.shape[it]?.name?.get(lang) ?: it } + ", ?"
    ActPlay(
        header = { RoundDots(idx, PATTERN_ROUNDS); PromptBar(prompt) },
        footer = { ActFooter(solved || wrong.isNotEmpty(), solved, wrong.size, buttons = if (solved) nextButton else null) },
    ) {
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            PatternStrip(round.seq.map { "shape-$it" }, round.seq.size, if (solved) "shape-${round.answer}" else null, seqText, Modifier.weight(0.7f).fillMaxWidth())
            FitGrid(round.choices.size, Modifier.weight(1f).fillMaxWidth(), gap = 10.dp, maxCell = 200.dp) { i, _ ->
                val s = round.choices[i]
                val st = stateOf(s)
                PicButton("shape-$s", b.shape[s]?.name?.get(lang) ?: s, { pick(s) }, Modifier.fillMaxSize(), state = st, enabled = !solved && st != Pick.Wrong, showLabel = true)
            }
        }
    }
}

/**
 * A row of pattern pictures with one gap ("?") at `blank`; once solved the gap shows `answer` in green.
 * Always one row, sized to fit the width.
 */
@Composable
internal fun PatternStrip(items: List<String>, blank: Int, answer: String?, label: String, modifier: Modifier) {
    val c = WL.colors
    val count = maxOf(items.size, blank + 1)
    FitGrid(count, modifier.semantics { contentDescription = label }, gap = 6.dp, maxCell = 120.dp, fixedCols = count) { i, s ->
        val isGap = i == blank
        Box(
            Modifier.fillMaxSize().clip(RoundedCornerShape(14.dp)).background(if (isGap) (if (answer != null) c.goodBg else c.warnBg) else c.surface)
                .border(if (isGap) 3.dp else 1.dp, if (isGap) (if (answer != null) c.good else c.accent) else c.line, RoundedCornerShape(14.dp)),
            contentAlignment = Alignment.Center,
        ) {
            val art = if (isGap) answer else items.getOrNull(i)
            if (art != null) PicArt(art, s * 0.8f) else Text("?", style = actText((s.value * 0.45f).toInt().coerceAtLeast(14)), color = c.accent, textAlign = TextAlign.Center)
        }
    }
}

