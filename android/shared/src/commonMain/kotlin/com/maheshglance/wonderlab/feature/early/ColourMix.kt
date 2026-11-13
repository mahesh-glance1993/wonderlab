package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.platform.BackHandler
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Palette
import androidx.compose.material.icons.rounded.Replay
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.boundsInRoot
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlin.math.roundToInt

// Colour Mixing: pour paints into the bowl (tap a pot or drag it to the bowl) and see what colour they make.
// "Mix & play" is free; "Make a colour" asks for a colour in 3 levels.
private object CT {
    val title = L("Colour Mixing", "రంగులు కలుపుదాం")
    val pick = L("Let’s mix paints!", "రంగులు కలుపుదాం!")
    val free = L("Mix & play", "కలిపి ఆడు")
    val make = L("Make a colour", "రంగు తయారు చెయ్యి")
    val how = L("Tap a paint pot, or drag it into the bowl.", "రంగు డబ్బాను తాకు, లేదా గిన్నెలోకి లాగు.")
    val empty = L("Empty the bowl", "గిన్నె ఖాళీ చెయ్యి")
    val full = L("The bowl is full. Empty it to mix again.", "గిన్నె నిండింది. మళ్ళీ కలపడానికి ఖాళీ చెయ్యి.")
    val bowl = L("Mixing bowl", "కలిపే గిన్నె")
    val emptyBowl = L("The bowl is empty.", "గిన్నె ఖాళీగా ఉంది.")
    val newColour = L("A new colour!", "కొత్త రంగు!")
    val made = L("Colours you made", "నువ్వు చేసిన రంగులు")
    val tryThis = L("try this", "ఇది ప్రయత్నించు")
}
private val MIX_LEVELS = listOf(L("3 paints", "3 రంగులు"), L("+ white", "+ తెలుపు"), L("+ black", "+ నలుపు"))
private const val MIX_ROUNDS = 5
private val PAINT_ORDER = listOf("red", "yellow", "blue", "white", "black")

@Serializable data class MixSave(val level: Int = 0, val made: List<String> = emptyList(), val sets: Int = 0)

// ---- the website's mixing rules (activities.ts mixPaints / mixHex / recipeFor) ----
fun mixPaintsOf(b: EarlyBundle, paints: List<String>): String? {
    val set = paints.distinct()
    if (set.isEmpty()) return null
    if (set.size == 1) return set[0]
    val key = set.sortedBy { PAINT_ORDER.indexOf(it) }
    return b.recipes.firstOrNull { it.paints.distinct().sortedBy { p -> PAINT_ORDER.indexOf(p) } == key }?.makes
}
fun mixHexOf(b: EarlyBundle, paints: List<String>): String? {
    mixPaintsOf(b, paints)?.let { return b.mixColours[it]?.hex }
    if (paints.isEmpty()) return null
    val rgb = paints.map { p -> val h = b.mixColours[p]?.hex ?: "#808080"; listOf(1, 3, 5).map { h.substring(it, it + 2).toInt(16) } }
    return "#" + (0..2).joinToString("") { i -> (rgb.sumOf { it[i] }.toDouble() / paints.size).roundToInt().toString(16).padStart(2, '0') }
}
fun recipeOf(b: EarlyBundle, c: String): List<String> = b.recipes.firstOrNull { it.makes == c }?.paints ?: listOf(c)
private fun nameOfColour(b: EarlyBundle, c: String): Localized = b.mixColours[c]?.name ?: L(c, c)

/** "red and yellow" / "ఎరుపు, పసుపు" */
private fun paintList(b: EarlyBundle, paints: List<String>): Localized {
    val u = paints.distinct()
    val en = u.map { nameOfColour(b, it).en.lowercase() }
    return L(if (en.size > 1) "${en.dropLast(1).joinToString(", ")} and ${en.last()}" else en.firstOrNull() ?: "", u.joinToString(", ") { nameOfColour(b, it).get("te") })
}
private fun cap(s: String) = s.replaceFirstChar { it.uppercase() }
private fun resultSay(b: EarlyBundle, paints: List<String>): Localized {
    val c = mixPaintsOf(b, paints)
    val u = paints.distinct()
    val l = paintList(b, paints)
    if (c == null) return L("${cap(l.en)} make a new colour!", "${l.get("te")} కలిపితే కొత్త రంగు!")
    if (u.size == 1) return L("${nameOfColour(b, c).en}!", "${nameOfColour(b, c).get("te")}!")
    return L("${cap(l.en)} make ${nameOfColour(b, c).en.lowercase()}!", "${l.get("te")} కలిపితే ${nameOfColour(b, c).get("te")}!")
}

@Composable
fun ColourMixScreen() {
    val app = LocalApp.current
    TrackLast("/play/colours", CT.title)
    val saved = rememberSaved("colours", MixSave.serializer(), MixSave())
    var mode by rememberSaveable { mutableStateOf<String?>(null) }
    var run by rememberSaveable { mutableStateOf(0) }
    val level = saved.value.level.coerceIn(0, 2)
    BackHandler(mode != null) { mode = null }
    EarlyScreen(CT.title.tx, { if (mode != null) mode = null else app.back() }) { b ->
        when (mode) {
            null -> Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                PromptBar(CT.pick)
                LevelPicker(MIX_LEVELS, level, { v -> saved.update { it.copy(level = v) } })
                FitGrid(2, Modifier.weight(1f).fillMaxWidth(), maxCell = 280.dp) { i, _ ->
                    if (i == 0) BigTile("c-green", CT.free, { mode = "free"; run++ }, Modifier.fillMaxSize(), tint = tint("art"))
                    else BigTile("c-purple", CT.make, { mode = "make"; run++ }, Modifier.fillMaxSize(), tint = tint("lab"))
                }
                if (saved.value.made.isNotEmpty()) MadeList(b, saved.value.made)
            }
            "free" -> key(run, WL.lang) { FreeMix(b, level, saved.value.made) { c -> saved.update { s -> s.copy(made = if (s.made.contains(c)) s.made else s.made + c) } } }
            else -> key(run, level, WL.lang) {
                MakeColour(b, level, onAgain = { run++ }, onMenu = { mode = null }) { perfect ->
                    saved.update { s -> s.copy(sets = s.sets + 1, level = if (perfect && s.level < 2) s.level + 1 else s.level) }
                }
            }
        }
    }
}

@Composable
private fun MadeList(b: EarlyBundle, made: List<String>) {
    val list = made.filter { b.mixColours.containsKey(it) }
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(WL.colors.surface).padding(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(CT.made.tx, style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            list.take(8).forEach { c ->
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Swatch(b.mixColours[c]!!.hex, 26.dp)
                    if (list.size <= 5) Text(nameOfColour(b, c).tx, style = MaterialTheme.typography.labelSmall, color = WL.colors.muted, maxLines = 1)
                }
            }
        }
    }
}

// ---- drawings (the website's SVG paths) ----
private fun bowlBody() = compileSvg(listOf(
    svg("ellipse", "cx" to 100, "cy" to 122, "rx" to 70, "ry" to 6, "fill" to "rgba(0,0,0,.12)"),
    svg("path", "d" to "M14 40 Q20 118 100 118 Q180 118 186 40Z", "fill" to "#F7F4EC", "stroke" to "#3A3530", "strokeWidth" to 3, "strokeLinejoin" to "round"),
))
private fun bowlLiquid(hex: String) = compileSvg(listOf(svg("path", "d" to "M24 48 Q34 110 100 110 Q166 110 176 48Z", "fill" to hex)))
private fun bowlRim(hex: String?, bowl: List<String>, b: EarlyBundle) = compileSvg(listOf(
    svg("ellipse", "cx" to 100, "cy" to 40, "rx" to 86, "ry" to 14, "fill" to (hex ?: "#E9E3D6"), "stroke" to "#3A3530", "strokeWidth" to 3),
) + bowl.mapIndexed { i, p -> svg("circle", "cx" to 70 + i * 30, "cy" to 40, "r" to 6, "fill" to (b.mixColours[p]?.hex ?: "#888"), "stroke" to "#3A3530", "strokeWidth" to 1.5) })
private fun paintPot(hex: String) = compileSvg(listOf(
    svg("path", "d" to "M-30 -18 H30 L26 40 Q25 46 18 46 H-18 Q-25 46 -26 40Z", "fill" to "#DCD6CB", "stroke" to "#3A3530", "strokeWidth" to 2.4, "strokeLinejoin" to "round"),
    svg("ellipse", "cy" to -18, "rx" to 30, "ry" to 9, "fill" to hex, "stroke" to "#3A3530", "strokeWidth" to 2.4),
    svg("path", "d" to "M-26 -12 Q-24 6 -18 4 Q-14 -2 -12 10 Q-8 18 -4 4 Q0 -8 -26 -12Z", "fill" to hex, "stroke" to "#3A3530", "strokeWidth" to 1.6),
    svg("path", "d" to "M8 -26 L30 -48", "stroke" to "#8A5A36", "strokeWidth" to 5, "strokeLinecap" to "round", "fill" to "none"),
))

@Composable
fun PaintPot(hex: String, size: Dp, modifier: Modifier = Modifier) {
    val pic = remember(hex) { paintPot(hex) }
    Canvas(modifier.size(size)) { drawSvg(pic, -50f, -50f, 100f, 100f) }
}

/** The bowl + pots, shared by both modes. Pots can be tapped or dragged into the bowl. */
@Composable
private fun Mixer(b: EarlyBundle, paints: List<String>, bowl: List<String>, onAdd: (String) -> Unit, onEmpty: () -> Unit, modifier: Modifier, hint: List<String>? = null, disabled: Boolean = false) {
    val reduce = LocalReduceMotion.current
    val density = LocalDensity.current
    val hex = mixHexOf(b, bowl)
    val res = mixPaintsOf(b, bowl)
    val add by rememberUpdatedState(onAdd)
    var origin by remember { mutableStateOf(Offset.Zero) }
    var bowlRect by remember { mutableStateOf(Rect.Zero) }
    val potAt = remember { mutableStateMapOf<String, Offset>() }
    var ghost by remember { mutableStateOf<Pair<String, Offset>?>(null) }
    val body = remember { bowlBody() }
    val liquid = remember(hex) { hex?.let { bowlLiquid(it) } }
    val rim = remember(hex, bowl) { bowlRim(hex, bowl, b) }
    val pour = remember { Animatable(1f) }
    LaunchedEffect(bowl.size) { if (!reduce && bowl.isNotEmpty()) { pour.snapTo(0.6f); pour.animateTo(1f, tween(500)) } }
    val bowlLabel = if (bowl.isNotEmpty()) "${CT.bowl.tx}: ${paintList(b, bowl).tx} → ${res?.let { nameOfColour(b, it).tx } ?: CT.newColour.tx}" else "${CT.bowl.tx}: ${CT.emptyBowl.tx}"
    val near = ghost?.let { bowlRect.contains(it.second) } == true

    val bowlView = @Composable { m: Modifier ->
        Column(m, horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                Modifier.weight(1f).fillMaxWidth().onGloballyPositioned { bowlRect = it.boundsInRoot() }
                    .graphicsLayer { val s = if (near) 1.05f else 1f; scaleX = s; scaleY = s }
                    .semantics { contentDescription = bowlLabel },
            ) {
                Canvas(Modifier.fillMaxSize()) { drawSvg(body, 0f, 0f, 200f, 130f) }
                if (liquid != null) Canvas(Modifier.fillMaxSize().graphicsLayer { scaleY = pour.value; transformOrigin = TransformOrigin(0.5f, 0.85f) }) { drawSvg(liquid, 0f, 0f, 200f, 130f) }
                Canvas(Modifier.fillMaxSize()) { drawSvg(rim, 0f, 0f, 200f, 130f) }
            }
            Text(if (bowl.isNotEmpty()) res?.let { nameOfColour(b, it).tx } ?: CT.newColour.tx else CT.emptyBowl.tx, style = MaterialTheme.typography.titleLarge, color = WL.colors.text, textAlign = TextAlign.Center)
        }
    }
    val potsView = @Composable { m: Modifier ->
        Column(m, verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            FitGrid(paints.size, Modifier.weight(1f).fillMaxWidth(), gap = 8.dp, aspect = 0.85f, maxCell = 150.dp) { i, _ ->
                val p = paints[i]
                val hinted = hint?.contains(p) == true
                PicButton(
                    p, nameOfColour(b, p).tx + if (hinted) " (${CT.tryThis.tx})" else "", { if (!disabled) add(p) },
                    Modifier.fillMaxSize()
                        .onGloballyPositioned { potAt[p] = it.positionInRoot() }
                        .pointerInput(p, disabled) {
                            if (disabled) return@pointerInput
                            detectDragGestures(
                                onDragStart = { o -> ghost = p to ((potAt[p] ?: Offset.Zero) + o) },
                                onDrag = { ch, d -> ch.consume(); ghost = ghost?.let { it.first to (it.second + d) } },
                                onDragEnd = { val g = ghost; ghost = null; if (g != null && bowlRect.contains(g.second)) add(g.first) },
                                onDragCancel = { ghost = null },
                            )
                        },
                    state = if (hinted) Pick.Hint else null, enabled = !disabled, showLabel = true, artScale = 0.9f,
                    picture = { sz -> PaintPot(b.mixColours[p]?.hex ?: "#888", sz) },
                )
            }
            KidButton(CT.empty.tx, onEmpty, icon = Icons.Rounded.Replay, enabled = bowl.isNotEmpty() && !disabled)
        }
    }
    Box(modifier.onGloballyPositioned { origin = it.positionInRoot() }) {
        if (LocalWindow.current.landscape) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            bowlView(Modifier.weight(1f).fillMaxHeight()); potsView(Modifier.weight(1f).fillMaxHeight())
        } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            bowlView(Modifier.weight(1f).fillMaxWidth()); potsView(Modifier.weight(0.8f).fillMaxWidth())
        }
        ghost?.let { (p, at) ->
            val half = with(density) { 36.dp.toPx() }
            PaintPot(b.mixColours[p]?.hex ?: "#888", 72.dp, Modifier.offset { IntOffset((at.x - origin.x - half).roundToInt(), (at.y - origin.y - half).roundToInt()) })
        }
    }
}

@Composable
private fun MixMessage(text: String?) {
    Row(Modifier.fillMaxWidth().height(48.dp), horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically) {
        if (text != null) { Icon(Icons.Rounded.Palette, null, tint = WL.colors.accent); Text(text, style = MaterialTheme.typography.titleMedium, color = WL.colors.text, maxLines = 2) }
    }
}

@Composable
private fun FreeMix(b: EarlyBundle, level: Int, made: List<String>, onMade: (String) -> Unit) {
    val say = rememberSay()
    val badge = rememberBadge()
    val record = rememberRecord("colours")
    val scope = rememberCoroutineScope()
    var bowl by rememberActJson<List<String>> { emptyList() }
    var msg by rememberActJson<Localized?> { null }
    val known = remember { made.toMutableSet() }
    Narrate(CT.how, "free")
    fun add(p: String) {
        if (bowl.size >= b.maxBowl) { Sfx.play("pop"); msg = CT.full; say(CT.full); return }
        val next = bowl + p
        bowl = next
        Sfx.play("splash")
        val c = mixPaintsOf(b, next)
        val line = resultSay(b, next)
        msg = line
        scope.launch { delay(250); say(line) }
        if (c != null && next.distinct().size > 1 && !known.contains(c)) {
            known += c
            onMade(c)
            record("free:$c", true, 0)
            scope.launch { delay(300); Sfx.play("sparkle") }
            if (b.recipes.all { known.contains(it.makes) }) badge("play:mix-all", L("Colour wizard", "రంగుల మాంత్రికుడు"))
        }
    }
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        PromptBar(CT.how, maxLines = 2)
        Mixer(b, b.mixPaints.getOrElse(level) { b.mixPaints.first() }, bowl, { add(it) }, { Sfx.play("whoosh"); bowl = emptyList(); msg = null }, Modifier.weight(1f).fillMaxWidth())
        MixMessage(msg?.tx)
        if (made.isNotEmpty() && !LocalWindow.current.landscape) MadeList(b, made)
    }
}

@Composable
private fun MakeColour(b: EarlyBundle, level: Int, onAgain: () -> Unit, onMenu: () -> Unit, onDone: (Boolean) -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("colours")
    val stickers = rememberStickers()
    val scope = rememberCoroutineScope()
    val seed by rememberSaveable { mutableStateOf(newSeed()) }
    var idx by rememberSaveable { mutableStateOf(0) }
    var round by rememberActJson<MixRound?> { null }
    var lastTarget by rememberSaveable { mutableStateOf<String?>(null) }
    var bowl by rememberActJson<List<String>> { emptyList() }
    var misses by rememberSaveable { mutableStateOf(0) }
    var allFirst by rememberSaveable { mutableStateOf(true) }
    var solved by rememberSaveable { mutableStateOf(false) }
    var msg by rememberActJson<Localized?> { null }
    var finished by rememberSaveable { mutableStateOf(false) }
    var sticker by rememberActJson<Sticker?> { null }

    LaunchedEffect(idx) { if (round == null) round = app.engine.early<MixRound>("mixRound", roundSeed(seed, idx), level, lastTarget) }
    val r = round
    val t = r?.let { nameOfColour(b, it.target) }
    val prompt = if (t != null) L("Can you make ${t.en.lowercase()}?", "${t.get("te")} తయారు చెయ్యగలవా?") else null
    Narrate(if (finished) null else prompt, "$idx-${r != null}")
    if (finished) { DonePanel(onAgain, onMenu) { StickerReveal(sticker) }; return }
    if (r == null || t == null || prompt == null) { EarlyLoading(); return }
    val need = recipeOf(b, r.target)

    fun add(p: String) {
        if (solved) return
        if (bowl.size >= b.maxBowl) { Sfx.play("pop"); msg = CT.full; say(CT.full); return }
        val next = bowl + p
        bowl = next
        Sfx.play("splash")
        if (mixPaintsOf(b, next) == r.target) {
            solved = true
            val rs = resultSay(b, next)
            val line = L("Yes! ${rs.en}", "అవును! ${rs.get("te")}")
            msg = line
            scope.launch { delay(250); Sfx.play("sparkle"); say(line) }
            record(r.target, true, if (misses >= 2) 1 else 0)
            return
        }
        // wrong once the bowl holds as many paints as the recipe (or any paint that isn't needed)
        val wrongPaint = !need.contains(p)
        if (wrongPaint || next.distinct().size >= need.size) {
            val c = mixPaintsOf(b, next)
            val line = if (c != null && next.distinct().size > 1)
                L("That makes ${nameOfColour(b, c).en.lowercase()}. We need ${t.en.lowercase()}. Empty the bowl and try again.", "అది ${nameOfColour(b, c).get("te")}. మనకు ${t.get("te")} కావాలి. గిన్నె ఖాళీ చేసి మళ్ళీ ప్రయత్నించు.")
            else L("Not quite. We need ${t.en.lowercase()}. Empty the bowl and try again.", "సరిగ్గా కాదు. మనకు ${t.get("te")} కావాలి. గిన్నె ఖాళీ చేసి మళ్ళీ ప్రయత్నించు.")
            msg = line; say(line)
            misses++; allFirst = false
            record(r.target, false, 0)
        } else msg = resultSay(b, next)
    }
    fun next() {
        if (idx + 1 >= MIX_ROUNDS) {
            finished = true; EarlyFx.celebrate(); Sfx.play("success"); say(UI.allDone)
            onDone(allFirst)
            scope.launch { sticker = stickers.give("mix", false) }
            return
        }
        lastTarget = r.target; round = null; bowl = emptyList(); misses = 0; solved = false; msg = null; idx++
    }
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        RoundDots(idx, MIX_ROUNDS)
        PromptBar(prompt, leading = { Swatch(b.mixColours[r.target]?.hex ?: "#888", 40.dp) }, maxLines = 2)
        Mixer(b, r.paints, bowl, { add(it) }, { Sfx.play("whoosh"); bowl = emptyList(); msg = null }, Modifier.weight(1f).fillMaxWidth(),
            hint = if (misses >= 2 && !solved) need else null, disabled = solved)
        if (solved) QuizFooter(true, misses, { next() }, extra = resultSay(b, bowl).tx) else MixMessage(msg?.tx)
    }
}
