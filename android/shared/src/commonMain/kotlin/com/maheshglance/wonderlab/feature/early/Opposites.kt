package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.design.FitText

import com.maheshglance.wonderlab.core.platform.BackHandler
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.min
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLFonts
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

// Opposites & Sizes: big/small, tall/short, full/empty, hot/cold, day/night and more — tap the right picture.
// Level 3 shows one picture and asks for its opposite.
private object OT {
    val title = L("Opposites", "వ్యతిరేక పదాలు")
    val pick = L("Big or small? Hot or cold? Let’s find out!", "పెద్దదా చిన్నదా? వేడిదా చల్లనిదా? చూద్దాం!")
    val level = L("Which game?", "ఏ ఆట?")
    val start = L("Start", "మొదలు")
    val learn = L("All the opposites", "అన్ని వ్యతిరేక పదాలు")
}
private const val OPP_ROUNDS = 6

@Serializable data class OppSave(val level: Int = 0, val sets: Int = 0, val seen: List<String> = emptyList())

private fun cap(s: String) = s.replaceFirstChar { it.uppercase() }

fun oppPrompt(r: OppRound): Localized =
    if (r.kind == "pick") L("Tap the ${r.ask.word.en} one.", "${r.ask.word.get("te")} ఏది? తాకు.")
    else L("This is ${r.shown?.word?.en ?: ""}. Which picture is the opposite?", "ఇది ${r.shown?.word?.get("te") ?: ""}. దీనికి వ్యతిరేకం ఏది?")

private fun oppPraise(b: EarlyBundle, r: OppRound): Localized {
    val p = b.opposites.firstOrNull { it.id == r.pair } ?: return UI.wellDone
    return L("Yes! ${cap(p.a.word.en)} and ${p.b.word.en} are opposites.", "అవును! ${p.a.word.get("te")}, ${p.b.word.get("te")} — వ్యతిరేక పదాలు.")
}

/** Both sides of a pair use the same kind of picture: 3D when both have one, otherwise both drawings. */
fun oppNeedsDrawing(b: EarlyBundle, side: OppSide): Boolean {
    val pair = b.opposites.firstOrNull { side.key.startsWith("${it.id}:") } ?: return emojiFor(b, side.art, side.v) == null
    return emojiFor(b, pair.a.art, pair.a.v) == null || emojiFor(b, pair.b.art, pair.b.v) == null
}

/** The picture for one side of an opposite pair (scaled down for "small"). */
@Composable
fun OppArt(b: EarlyBundle, side: OppSide, size: Dp, modifier: Modifier = Modifier) {
    Box(modifier.size(size), contentAlignment = Alignment.Center) {
        PicArt(side.art, size * (side.scale ?: 1f), v = side.v, forceDrawing = oppNeedsDrawing(b, side))
    }
}

/** A choice button showing an opposite side (word shown when solved / wrong). */
@Composable
fun OppPick(b: EarlyBundle, s: OppSide, onPick: () -> Unit, state: Pick?, enabled: Boolean, showLabel: Boolean, modifier: Modifier = Modifier) {
    PicButton(s.art, s.word.tx, onPick, modifier, state = state, enabled = enabled, showLabel = showLabel, picture = { sz -> OppArt(b, s, sz) })
}

@Composable
fun OppositesScreen() {
    val app = LocalApp.current
    TrackLast("/play/opposites", OT.title)
    val saved = rememberSaved("opposites", OppSave.serializer(), OppSave())
    var playing by rememberSaveable { mutableStateOf(false) }
    var run by rememberSaveable { mutableStateOf(0) }
    val level = saved.value.level.coerceIn(0, 2)
    BackHandler(playing) { playing = false }
    EarlyScreen(OT.title.tx, { if (playing) playing = false else app.back() }) { b ->
        if (!playing) OppMenu(b, level, { v -> saved.update { it.copy(level = v) } }) { playing = true; run++ }
        else key(run, level, WL.lang) {
            OppSession(b, level, onAgain = { run++ }, onMenu = { playing = false }) { perfect, seen ->
                saved.update { s -> s.copy(sets = s.sets + 1, seen = (s.seen + seen).distinct(), level = if (perfect && s.level < 2) s.level + 1 else s.level) }
            }
        }
    }
}

@Composable
private fun OppMenu(b: EarlyBundle, level: Int, onLevel: (Int) -> Unit, onStart: () -> Unit) {
    val land = LocalWindow.current.landscape
    val controls = @Composable {
        PromptBar(OT.pick)
        LevelPicker(b.oppLevels, level, onLevel)
        KidButton(OT.start.tx, onStart, icon = Icons.Rounded.PlayArrow, primary = true)
    }
    if (land) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        Column(Modifier.weight(0.42f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) { controls() }
        OppGallery(b, Modifier.weight(0.58f).fillMaxHeight())
    } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        controls()
        OppGallery(b, Modifier.weight(1f).fillMaxWidth())
    }
}

/** Every pair: tap a picture to hear its word. */
@Composable
private fun OppGallery(b: EarlyBundle, modifier: Modifier) {
    val say = rememberSay()
    val c = WL.colors
    Column(modifier, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(OT.learn.tx, style = MaterialTheme.typography.titleMedium, color = c.text)
        FitGrid(b.opposites.size, Modifier.weight(1f).fillMaxWidth(), gap = 8.dp, aspect = 2f, maxCell = 220.dp) { i, _ ->
            val p = b.opposites[i]
            Row(Modifier.fillMaxSize().clip(RoundedCornerShape(16.dp)).background(c.surface).padding(4.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                for (s in listOf(p.a, p.b)) {
                    BoxWithConstraints(
                        Modifier.weight(1f).fillMaxHeight().clip(RoundedCornerShape(12.dp))
                            .pressable(role = Role.Button) { Sfx.play("pop"); say(L(cap(s.word.en), s.word.get("te"))) }
                            .semantics { contentDescription = s.word.get("en") },
                    ) {
                        val labelH = min(maxHeight * 0.3f, 22.dp)
                        val artS = min(maxWidth, maxHeight - labelH) * 0.9f
                        Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                            OppArt(b, s, artS)
                            FitText(s.word.tx, fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid, fontSize = if (labelH < 18.dp) 11.sp else 14.sp, color = c.text, maxLines = 1, textAlign = TextAlign.Center)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun OppSession(b: EarlyBundle, level: Int, onAgain: () -> Unit, onMenu: () -> Unit, onDone: (Boolean, List<String>) -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("opposites")
    val badge = rememberBadge()
    val stickers = rememberStickers()
    val scope = rememberCoroutineScope()
    val seed by rememberSaveable { mutableStateOf(newSeed()) }
    var idx by rememberSaveable { mutableStateOf(0) }
    var round by rememberActJson<OppRound?> { null }
    var lastPair by rememberSaveable { mutableStateOf<String?>(null) }
    var wrong by rememberActJson<List<String>> { emptyList() }
    var solved by rememberSaveable { mutableStateOf(false) }
    var firstTries by rememberSaveable { mutableStateOf(0) }
    var seen by rememberActJson<List<String>> { emptyList() }
    var finished by rememberSaveable { mutableStateOf(false) }
    var sticker by rememberActJson<Sticker?> { null }

    LaunchedEffect(idx) { if (round == null) round = app.engine.early<OppRound>("oppRound", roundSeed(seed, idx), level, lastPair) }
    val r = round
    Narrate(if (finished || r == null) null else oppPrompt(r), "$idx-${r != null}")
    if (finished) { DonePanel(onAgain, onMenu) { StickerReveal(sticker) }; return }
    if (r == null) { EarlyLoading(); return }
    val prompt = oppPrompt(r)

    fun pick(s: OppSide) {
        if (solved) return
        val ok = r.ask.key == s.key
        record("${r.kind}:${r.ask.key}", ok, if (wrong.size >= 2) 1 else 0)
        if (ok) {
            solved = true; Sfx.play("sparkle")
            if (wrong.isEmpty()) firstTries++
            seen = seen + r.pair
            say(oppPraise(b, r))
        } else {
            Sfx.play("pop"); wrong = wrong + s.key
            say(L("That one is ${s.word.en}. ${prompt.en}", "అది ${s.word.get("te")}. ${prompt.get("te")}"))
        }
    }
    fun next() {
        if (idx + 1 >= OPP_ROUNDS) {
            val perfect = firstTries >= OPP_ROUNDS
            finished = true; EarlyFx.celebrate(); Sfx.play("success"); say(UI.allDone)
            onDone(perfect, seen)
            scope.launch { sticker = stickers.give("opposites", false) }
            if (level == 2 && perfect) badge("play:opposites-pro", L("Opposites expert", "వ్యతిరేక పదాల నిపుణుడు"))
            return
        }
        lastPair = r.pair; round = null; wrong = emptyList(); solved = false; idx++
    }
    val shown = r.shown
    val hero: (@Composable (Modifier) -> Unit)? = if (r.kind == "opposite" && shown != null) { m -> OppHero(b, shown, m) } else null
    QuizLayout(
        dots = { RoundDots(idx, OPP_ROUNDS) },
        prompt = { PromptBar(prompt) },
        hero = hero,
        heroWeight = 0.4f,
        choices = { m ->
            FitGrid(r.choices.size, m, maxCell = 240.dp) { i, _ ->
                val s = r.choices[i]
                val st = pickState(s.key, r.ask.key, solved, wrong)
                OppPick(b, s, { pick(s) }, st, !solved, solved || wrong.contains(s.key), Modifier.fillMaxSize())
            }
        },
        footer = { QuizFooter(solved, wrong.size, { next() }, extra = if (solved) oppPraise(b, r).tx else null) },
    )
}

/** The picture whose opposite is asked for, with its word. */
@Composable
fun OppHero(b: EarlyBundle, s: OppSide, modifier: Modifier) {
    BoxWithConstraints(modifier.clip(RoundedCornerShape(22.dp)).background(WL.colors.surface).semantics { contentDescription = s.word.get("en") }, contentAlignment = Alignment.Center) {
        val label = 30.dp
        val artS = min(maxWidth, maxHeight - label) * 0.85f
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            OppArt(b, s, artS)
            Text(s.word.tx, style = MaterialTheme.typography.titleLarge.copy(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid), color = WL.colors.text)
        }
    }
}
