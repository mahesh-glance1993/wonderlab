package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.platform.BackHandler
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlin.math.ceil

// Memory Match: turn over two cards at a time and find the pairs. Animal and vehicle cards play their
// sound when turned over; other cards say their name.

private object MT {
    val title = L("Memory Match", "జ్ఞాపకాల ఆట")
    val pick = L("Find the pairs! Pick some cards.", "జతలు కనిపెట్టు! కార్డులు ఎంచుకో.")
    val how = L("Turn over two cards. Can you find two the same?", "రెండు కార్డులు తిప్పు. ఒకేలాంటి రెండు కనిపెట్టగలవా?")
    val notSame = L("Not the same. Try to remember them!", "ఒకటి కాదు. గుర్తు పెట్టుకో!")
    val card = L("Card", "కార్డు"); val faceDown = L("face down", "బోర్లా ఉంది"); val found = L("found", "దొరికింది")
    val moves = L("Turns", "ప్రయత్నాలు"); val pairs = L("Pairs", "జతలు"); val best = L("Best", "ఉత్తమం")
}

@Serializable
data class MemSave(val size: String = "small", val best: Map<String, Int> = emptyMap(), val games: Int = 0)

/** The website's MemState and its rules (memoryFlip / memoryHide / memoryDone / memoryStars). */
@Serializable
data class MemState(val open: List<Int> = emptyList(), val matched: List<String> = emptyList(), val moves: Int = 0)

private fun memoryFlip(cards: List<MemCard>, s: MemState, i: Int): Pair<MemState, String> {
    val c = cards.getOrNull(i)
    if (c == null || s.open.size >= 2 || s.open.contains(i) || s.matched.contains(c.pair)) return s to "ignored"
    val open = s.open + i
    if (open.size == 1) return s.copy(open = open) to "first"
    val moves = s.moves + 1
    val a = cards[open[0]]
    if (a.pair == c.pair) return s.copy(open = emptyList(), matched = s.matched + c.pair, moves = moves) to "match"
    return s.copy(open = open, moves = moves) to "miss"
}
private fun memoryDone(cards: List<MemCard>, s: MemState) = cards.isNotEmpty() && s.matched.size * 2 == cards.size
private fun isFaceUp(cards: List<MemCard>, s: MemState, i: Int) = s.open.contains(i) || (cards.getOrNull(i)?.let { s.matched.contains(it.pair) } ?: false)
private fun memoryStars(moves: Int, pairs: Int): Int = when {
    moves <= ceil(pairs * 1.5).toInt() -> 3
    moves <= ceil(pairs * 2.5).toInt() -> 2
    else -> 1
}

@Composable
fun MemoryMatchScreen() {
    val app = LocalApp.current
    TrackLast("/play/memory", MT.title)
    val saved = rememberSaved("memory", MemSave.serializer(), MemSave())
    var theme by rememberSaveable { mutableStateOf<String?>(null) }
    var run by rememberSaveable { mutableIntStateOf(0) }
    val back: () -> Unit = { if (theme != null) { theme = null } else app.back() }
    BackHandler(theme != null) { back() }
    val lang = WL.lang
    EarlyScreen(MT.title.tx, back) { b ->
        val sizes = b.memorySizes
        val size = sizes.firstOrNull { it.id == saved.value.size } ?: sizes.first()
        val th = theme
        if (th == null) ActMenu(MT.pick, b.memoryThemes.size, above = {
            LevelPicker(sizes.map { it.name }, sizes.indexOf(size), { i -> saved.update { it.copy(size = sizes[i].id) } })
        }) { i ->
            val t = b.memoryThemes[i]
            BigTile(t.cover, t.title, { theme = t.id; run++ }, Modifier.fillMaxSize())
        } else key(th, size.id, run, lang) {
            Board(b, th, size, saved.value.best[size.id], onAgain = { run++ }, onMenu = { theme = null }) { moves ->
                saved.update { s -> s.copy(games = s.games + 1, best = s.best + (size.id to minOf(moves, s.best[size.id] ?: Int.MAX_VALUE))) }
            }
        }
    }
}

@Composable
private fun Board(b: EarlyBundle, theme: String, size: MemorySize, best: Int?, onAgain: () -> Unit, onMenu: () -> Unit, onFinish: (Int) -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("memory")
    val badge = rememberBadge()
    val stickers = rememberStickers()
    val scope = rememberCoroutineScope()
    val lang = WL.lang
    val seed = rememberSaveable { newSeed() }
    val cardsState = rememberActState(ListSerializer(MemCard.serializer()))
    val stState = rememberActState(MemState.serializer())
    val stickerState = rememberActState(Sticker.serializer())
    var finished by rememberSaveable { mutableStateOf(false) }
    var hideJob by androidx.compose.runtime.remember { mutableStateOf<Job?>(null) }
    LaunchedEffect(Unit) { if (cardsState.value == null) cardsState.value = app.engine.early<List<MemCard>>("memoryDeck", seed, size.id, theme) }
    Narrate(MT.how, "start")
    val cards = cardsState.value
    val s = stState.value ?: MemState()
    // a miss that was showing when the screen rotated: turn the cards back
    LaunchedEffect(cards != null) { if (s.open.size >= 2) { delay(1300); stState.value = (stState.value ?: MemState()).copy(open = emptyList()) } }
    if (cards == null) { EarlyLoading(); return }
    val pairs = size.pairs

    if (finished) {
        val stars = memoryStars(s.moves, pairs)
        DonePanel(onAgain, onMenu, extra = {
            Row(Modifier.semantics { contentDescription = "$stars / 3" }, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                for (k in 1..3) Emoji3D("⭐", Modifier.size(40.dp).graphicsLayer { alpha = if (k <= stars) 1f else 0.25f })
            }
            Text("${MT.moves.tx}: ${s.moves}${if (best != null) " · ${MT.best.tx}: ${minOf(best, s.moves)}" else ""}", style = actText(18), color = WL.colors.text)
            StickerReveal(stickerState.value, size = 64.dp)
        })
        return
    }

    val flip: (Int) -> Unit = flip@{ i ->
        val cur = stState.value ?: MemState()
        val (next, event) = memoryFlip(cards, cur, i)
        if (event == "ignored") return@flip
        val card = cards[i]
        val name = b.pic[card.pair]?.name ?: L(card.pair, card.pair)
        stState.value = next
        // the card's own sound for animals/vehicles; otherwise its name
        val hasSfx = itemSfx(b, card.pair) != null
        if (hasSfx) playItemSfx(b, card.pair) else { Sfx.play("whoosh"); say(name) }
        when (event) {
            "match" -> {
                val msg = L("Two of the same: ${name.en.lowercase()}!", "రెండూ ఒకటే: ${name.te ?: name.en}!")
                scope.launch { delay(350); Sfx.play("sparkle") }
                scope.launch { delay(if (hasSfx) 900 else 700); say(msg) }
                if (memoryDone(cards, next)) scope.launch {
                    delay(1400)
                    finished = true; EarlyFx.celebrate(); Sfx.play("success")
                    say(L("You found all the pairs in ${next.moves} turns!", "${next.moves} ప్రయత్నాల్లో అన్ని జతలు కనిపెట్టావు!"))
                    record("$theme:${size.id}", true, if (memoryStars(next.moves, pairs) == 1) 1 else 0)
                    onFinish(next.moves)
                    stickerState.value = stickers.give("memory", false)
                    if (size.id == "large") badge("play:memory-large", L("Super memory", "అద్భుత జ్ఞాపకశక్తి"))
                }
            }
            "miss" -> {
                hideJob = scope.launch { delay(1300); stState.value = (stState.value ?: MemState()).copy(open = emptyList()) }
                scope.launch { delay(800); say(MT.notSame) }
            }
            else -> {}
        }
    }

    val c = WL.colors
    ActPlay(
        header = {
            PromptBar(MT.how)
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Text("${MT.pairs.tx}: ${s.matched.size} / $pairs", style = actText(18), color = c.text)
                Text("${MT.moves.tx}: ${s.moves}", style = actText(18), color = c.text)
            }
        },
        footer = {},
    ) {
        val land = LocalWindow.current.landscape
        FitGrid(cards.size, Modifier.fillMaxSize(), gap = 10.dp, maxCell = 200.dp, fixedCols = if (land) null else size.cols) { i, _ ->
            val up = isFaceUp(cards, s, i)
            val done = s.matched.contains(cards[i].pair)
            val name = b.pic[cards[i].pair]?.name?.get(lang) ?: cards[i].pair
            MemoryCard(cards[i].art, up, done, "${MT.card.get(lang)} ${i + 1}: ${if (up) "$name${if (done) ", ${MT.found.get(lang)}" else ""}" else MT.faceDown.get(lang)}") { flip(i) }
        }
    }
}

/** A card that turns over in 3D: star back, picture front, a tick when its pair is found. */
@Composable
private fun MemoryCard(art: String, up: Boolean, done: Boolean, label: String, onTap: () -> Unit) {
    val c = WL.colors
    val reduce = LocalReduceMotion.current
    val rot by animateFloatAsState(if (up) 180f else 0f, tween(if (reduce) 0 else 420), label = "flip")
    val shape = RoundedCornerShape(18.dp)
    Box(
        Modifier.fillMaxSize().graphicsLayer { rotationY = rot; cameraDistance = 14f * density }
            .clip(shape).pressable(!done, role = Role.Button, sound = false, onClick = onTap).semantics { contentDescription = label },
        contentAlignment = Alignment.Center,
    ) {
        if (rot <= 90f) {
            Box(Modifier.fillMaxSize().background(Brush.linearGradient(listOf(c.primary, Color(0xFF8E6BB8)))).border(4.dp, Color.White.copy(alpha = .7f), shape), contentAlignment = Alignment.Center) {
                Emoji3D("⭐", Modifier.fillMaxSize(0.45f))
            }
        } else {
            Box(
                Modifier.fillMaxSize().graphicsLayer { rotationY = 180f }.background(if (done) c.goodBg else c.surface).border(if (done) 4.dp else 2.dp, if (done) c.good else c.line, shape),
                contentAlignment = Alignment.Center,
            ) {
                Box(Modifier.fillMaxSize(0.8f), contentAlignment = Alignment.Center) { PicArtFill(art) }
                if (done) Box(Modifier.align(Alignment.TopEnd).padding(5.dp).size(26.dp).clip(CircleShape).background(c.good), contentAlignment = Alignment.Center) {
                    Icon(Icons.Rounded.Check, null, tint = Color.White, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

/** A picture filling its box. */
@Composable
private fun PicArtFill(art: String) {
    androidx.compose.foundation.layout.BoxWithConstraints(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        PicArt(art, androidx.compose.ui.unit.min(maxWidth, maxHeight))
    }
}

