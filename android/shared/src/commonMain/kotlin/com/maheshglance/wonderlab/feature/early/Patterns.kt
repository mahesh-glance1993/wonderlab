package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.platform.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.min
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.serializer

// =============================================================================================
// Shared helpers for the newer Play & Learn games (used by Patterns, Opposites, Rhymes, Safari,
// Colour Mixing, Daily Surprise and the Sticker Book).
// =============================================================================================

/** A saveable state for any @Serializable value (rounds, lists) — survives rotation. */
@Composable
inline fun <reified T> rememberActJson(vararg keys: Any?, noinline init: () -> T): MutableState<T> {
    val ser = serializer<T>()
    return rememberSaveable(*keys, stateSaver = Saver<T, String>(save = { AppJson.encodeToString(ser, it) }, restore = { AppJson.decodeFromString(ser, it) })) { mutableStateOf(init()) }
}

/** Seed for round `idx` of a session (round 0 uses the seed, then seed + idx × 7919 — as on the website). */
fun roundSeed(seed: Int, idx: Int): Int = seed + idx * 7919

/**
 * One-screen quiz layout: progress dots + prompt, an optional "hero" picture, the choices and a footer
 * (feedback + Next). Portrait stacks them; landscape puts prompt/hero on the left and choices on the right.
 */
@Composable
internal fun QuizLayout(
    dots: (@Composable () -> Unit)?, prompt: @Composable () -> Unit, hero: (@Composable (Modifier) -> Unit)?,
    choices: @Composable (Modifier) -> Unit, footer: @Composable () -> Unit, heroWeight: Float = 0.45f,
) {
    val win = LocalWindow.current
    if (win.landscape) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        Column(Modifier.weight(0.44f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            dots?.invoke(); prompt()
            if (hero != null) hero(Modifier.weight(1f).fillMaxWidth()) else Spacer(Modifier.weight(1f))
            footer()
        }
        choices(Modifier.weight(0.56f).fillMaxHeight())
    } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        dots?.invoke(); prompt()
        hero?.invoke(Modifier.weight(heroWeight).fillMaxWidth())
        choices(Modifier.weight(1f).fillMaxWidth())
        footer()
    }
}

/** Feedback + Next in a fixed-height row (so the screen never jumps). */
@Composable
internal fun QuizFooter(solved: Boolean, tries: Int, onNext: () -> Unit, extra: String? = null, nextText: String? = null) {
    Row(Modifier.fillMaxWidth().heightIn(min = 64.dp), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically) {
        if (solved || tries > 0) EarlyFeedback(solved, tries, Modifier.weight(1f, fill = false), extra = extra)
        if (solved) NextButton(onNext, text = nextText)
    }
}

/** Choice state shared by the quizzes (right / wrong / hint after two misses). */
fun pickState(key: String, answer: String, solved: Boolean, wrong: List<String>): Pick? = when {
    solved && key == answer -> Pick.Right
    wrong.contains(key) -> Pick.Wrong
    !solved && wrong.size >= 2 && key == answer -> Pick.Hint
    else -> null
}

// =============================================================================================
// Patterns: what comes next? Colour, shape and picture sequences in 3 levels.
// =============================================================================================
private object PT {
    val title = L("Patterns", "నమూనాలు")
    val pick = L("What comes next? Pick a pattern game!", "తర్వాత ఏది వస్తుంది? ఒక ఆట ఎంచుకో!")
    val level = L("How hard?", "ఎంత కష్టం?")
    val next = L("What comes next?", "తర్వాత ఏది వస్తుంది?")
    val missing = L("Which one is missing?", "ఏది తప్పిపోయింది?")
    val gap = L("missing", "ఖాళీ")
}
private data class PatKindDef(val id: String, val title: L, val art: String, val tint: String)
private val PAT_KINDS = listOf(
    PatKindDef("colour", L("Colours", "రంగులు"), "c-blue", "art"),
    PatKindDef("shape", L("Shapes", "ఆకారాలు"), "shape-star", "lab"),
    PatKindDef("picture", L("Pictures", "బొమ్మలు"), "apple", "next"),
)
private const val PAT_ROUNDS = 6

@Serializable data class PatSave(val level: Int = 0, val sets: Int = 0, val kinds: List<String> = emptyList())

fun patPrompt(r: PatRound): Localized = if (r.blank == r.seq.size - 1) PT.next else PT.missing
fun patPraise(b: EarlyBundle, r: PatRound): Localized {
    val names = r.unit.map { b.tokenName(it) }
    return L("${names.joinToString(", ") { it.en }}!", "${names.joinToString(", ") { it.get("te") }}!")
}

/** The row of pattern pictures with one gap (shared with the Daily Surprise). */
@Composable
fun PatternRow(b: EarlyBundle, round: PatRound, solved: Boolean, modifier: Modifier = Modifier) {
    val label = round.seq.mapIndexed { i, t -> if (i == round.blank && !solved) "(${PT.gap.tx})" else b.tokenName(t).tx }.joinToString(", ")
    val c = WL.colors
    BoxWithConstraints(modifier.semantics { contentDescription = label }, contentAlignment = Alignment.Center) {
        val n = round.seq.size
        val gap = 6.dp
        val cell = min(min((maxWidth - gap * (n - 1)) / n, maxHeight), 120.dp)
        Row(horizontalArrangement = Arrangement.spacedBy(gap), verticalAlignment = Alignment.CenterVertically) {
            round.seq.forEachIndexed { i, t ->
                val blank = i == round.blank
                Box(
                    Modifier.size(cell).clip(RoundedCornerShape(16.dp))
                        .background(if (blank && solved) c.goodBg else if (blank) c.warnBg else c.surface)
                        .border(if (blank) 3.dp else 0.dp, if (blank && solved) c.good else if (blank) c.accent else c.surface, RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    if (blank && !solved) Text("?", fontSize = (cell.value * 0.5f).sp, fontWeight = FontWeight.Bold, color = c.accent)
                    else PicArt(t, cell * 0.8f)
                }
            }
        }
    }
}

@Composable
fun PatternsScreen() {
    val app = LocalApp.current
    TrackLast("/play/patterns", PT.title)
    val saved = rememberSaved("patterns", PatSave.serializer(), PatSave())
    var kind by rememberSaveable { mutableStateOf<String?>(null) }
    var run by rememberSaveable { mutableStateOf(0) }
    val level = saved.value.level.coerceIn(0, 2)
    BackHandler(kind != null) { kind = null }
    EarlyScreen(PT.title.tx, { if (kind != null) kind = null else app.back() }) { b ->
        val k = kind
        if (k == null) {
            Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                PromptBar(PT.pick)
                LevelPicker(b.patLevels, level, { v -> saved.update { it.copy(level = v) } })
                FitGrid(PAT_KINDS.size, Modifier.weight(1f).fillMaxWidth(), gap = 12.dp, maxCell = 260.dp) { i, _ ->
                    val d = PAT_KINDS[i]
                    BigTile(d.art, d.title, { kind = d.id; run++ }, Modifier.fillMaxSize(), tint = tint(d.tint), sub = if (saved.value.kinds.contains(d.id)) "✓" else null)
                }
            }
        } else key(k, level, run, WL.lang) {
            PatSession(b, k, level, onAgain = { run++ }, onMenu = { kind = null }) { perfect ->
                saved.update { s -> s.copy(sets = s.sets + 1, kinds = if (s.kinds.contains(k)) s.kinds else s.kinds + k, level = if (perfect && s.level < 2) s.level + 1 else s.level) }
            }
        }
    }
}

@Composable
private fun PatSession(b: EarlyBundle, kind: String, level: Int, onAgain: () -> Unit, onMenu: () -> Unit, onDone: (Boolean) -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("patterns")
    val badge = rememberBadge()
    val stickers = rememberStickers()
    val scope = rememberCoroutineScope()
    val seed by rememberSaveable { mutableStateOf(newSeed()) }
    var idx by rememberSaveable { mutableStateOf(0) }
    var round by rememberActJson<PatRound?> { null }
    var wrong by rememberActJson<List<String>> { emptyList() }
    var solved by rememberSaveable { mutableStateOf(false) }
    var first by rememberSaveable { mutableStateOf(0) }
    var finished by rememberSaveable { mutableStateOf(false) }
    var sticker by rememberActJson<Sticker?> { null }

    LaunchedEffect(idx) {
        if (round == null) round = app.engine.early<PatRound>("patRound", roundSeed(seed, idx), kind, level, if (idx >= 3) 4 else 3)
    }
    val r = round
    Narrate(if (finished || r == null) null else patPrompt(r), "$idx-${r != null}")

    if (finished) { DonePanel(onAgain, onMenu) { StickerReveal(sticker) }; return }
    if (r == null) { EarlyLoading(); return }

    fun pick(t: String) {
        if (solved) return
        val ok = r.answer == t
        record("$kind:${r.unit.size}:L$level", ok, if (wrong.size >= 2) 1 else 0)
        if (ok) {
            solved = true; Sfx.play("sparkle"); if (wrong.isEmpty()) first++
            say(patPraise(b, r))
        } else {
            Sfx.play("pop"); wrong = wrong + t
            val n = b.tokenName(t)
            say(L("Not ${n.en.lowercase()}. Look at the pattern again.", "${n.get("te")} కాదు. నమూనాను మళ్ళీ చూడు."))
        }
    }
    fun next() {
        if (idx + 1 >= PAT_ROUNDS) {
            val perfect = first >= PAT_ROUNDS
            finished = true; EarlyFx.celebrate(); Sfx.play("success"); say(UI.allDone)
            onDone(perfect)
            scope.launch { sticker = stickers.give("patterns", false) }
            if (level == 2 && perfect) badge("play:patterns-pro", L("Pattern pro", "నమూనాల నిపుణుడు"))
            return
        }
        round = null; wrong = emptyList(); solved = false; idx++
    }
    QuizLayout(
        dots = { RoundDots(idx, PAT_ROUNDS) },
        prompt = { PromptBar(patPrompt(r)) },
        hero = { m -> PatternRow(b, r, solved, m) },
        heroWeight = 0.35f,
        choices = { m ->
            FitGrid(r.choices.size, m, maxCell = 220.dp) { i, _ ->
                val t = r.choices[i]
                val st = pickState(t, r.answer, solved, wrong)
                PicButton(t, b.tokenName(t).tx, { pick(t) }, Modifier.fillMaxSize(), state = st, enabled = !solved, showLabel = true)
            }
        },
        footer = { QuizFooter(solved, wrong.size, { next() }, extra = if (solved) patPraise(b, r).tx else null) },
    )
}
