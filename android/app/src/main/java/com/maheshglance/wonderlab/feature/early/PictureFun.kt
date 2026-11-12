package com.maheshglance.wonderlab.feature.early

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.PanTool
import androidx.compose.material.icons.rounded.VolumeUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.min
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLFonts
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.engine.Engine
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.launch
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer

// =============================================================================================
// Shared layout helpers for the activity screens (Picture Fun, Sort & Match, Memory Match, Shape Play)
// =============================================================================================

/** A round / deck kept as JSON in saved instance state, so it survives rotation. */
internal class ActJson<T>(private val s: MutableState<String?>, private val ser: KSerializer<T>) {
    private var cacheStr: String? = null
    private var cacheVal: T? = null
    var value: T?
        get() {
            val str = s.value
            if (str != cacheStr) { cacheStr = str; cacheVal = str?.let { runCatching { AppJson.decodeFromString(ser, it) }.getOrNull() } }
            return cacheVal
        }
        set(v) { s.value = v?.let { AppJson.encodeToString(ser, it) } }
}

@Composable
internal fun <T> rememberActState(ser: KSerializer<T>, vararg keys: Any?): ActJson<T> {
    val s = rememberSaveable(*keys) { mutableStateOf<String?>(null) }
    return remember(s) { ActJson(s, ser) }
}

/** adapt() from logicCore.ts through the engine (max is always passed: 4 choices unless said otherwise). */
internal suspend fun Engine.adaptNext(a: Adapt, correct: Boolean, firstTry: Boolean = correct, max: Int = 4): Adapt =
    early<Adapt>("adapt", json(a), correct, firstTry, max) ?: a

/** Kid-font text style. */
@Composable
internal fun actText(size: Int, bold: Boolean = true): TextStyle =
    TextStyle(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid, fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal, fontSize = size.sp, lineHeight = (size * 1.25f).sp)

/** A menu page: prompt + optional controls + tiles filling the rest of the screen. */
@Composable
internal fun ActMenu(prompt: Localized, count: Int, above: (@Composable () -> Unit)? = null, below: (@Composable () -> Unit)? = null, aspect: Float = 1.05f, cell: @Composable (Int) -> Unit) {
    val phone = LocalWindow.current.isPhone
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(if (phone) 8.dp else 12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        PromptBar(prompt, maxLines = 2)
        above?.invoke()
        FitGrid(count, Modifier.weight(1f).fillMaxWidth(), gap = if (phone) 8.dp else 14.dp, aspect = aspect, maxCell = 240.dp) { i, _ -> cell(i) }
        below?.invoke()
    }
}

/**
 * Play page layout that always fits one screen: portrait = header / body (fills) / footer;
 * landscape = header + footer on the left, body on the right.
 */
@Composable
internal fun ActPlay(header: @Composable ColumnScope.() -> Unit, footer: @Composable ColumnScope.() -> Unit, body: @Composable BoxScope.() -> Unit) {
    val land = LocalWindow.current.landscape
    if (land) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        Column(Modifier.weight(0.38f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) {
            header(); footer()
        }
        Box(Modifier.weight(0.62f).fillMaxHeight(), contentAlignment = Alignment.Center) { body() }
    } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        header()
        Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) { body() }
        Column(Modifier.fillMaxWidth().heightIn(min = 64.dp), verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) { footer() }
    }
}

/** Feedback words + the buttons that follow (side by side in portrait, stacked in landscape). */
@Composable
internal fun ActFooter(show: Boolean, ok: Boolean, tries: Int, extra: String? = null, buttons: (@Composable () -> Unit)? = null) {
    val land = LocalWindow.current.landscape
    if (!show && buttons == null) return
    if (land) Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (show) EarlyFeedback(ok, tries, extra = extra)
        buttons?.let { Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) { it() } }
    } else Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically) {
        if (show) EarlyFeedback(ok, tries, Modifier.weight(1f, fill = false), extra = extra)
        buttons?.invoke()
    }
}

// =============================================================================================
// Picture Fun: find the picture, what is this?, odd one out, and who says ___?
// =============================================================================================

@Serializable
data class PicState(val adapt: Adapt = Adapt(), val recognised: Int = 0, val played: List<String> = emptyList(), val lastSet: String? = null)

private data class PicMode(val id: String, val title: L, val art: String, val tint: String)
private val PIC_MODES = listOf(
    PicMode("find", L("Find it", "కనిపెట్టు"), "apple", "math"),
    PicMode("what", L("What is this?", "ఇది ఏమిటి?"), "parrot", "next"),
    PicMode("odd", L("Which is different?", "ఏది వేరు?"), "banana", "lab"),
    PicMode("sound", L("Who says it?", "ఎవరు అంటారు?"), "cow", "art"),
)
private const val PIC_ROUNDS = 6

private fun picPromptFor(b: EarlyBundle, r: PicRound): L {
    val t = b.pic[r.target] ?: return L("", "")
    return when (r.mode) {
        "find" -> L("Find the ${t.en.lowercase()}.", "${t.te} ఎక్కడ?")
        "what" -> L("What is this?", "ఇది ఏమిటి?")
        "odd" -> L("Which one is different?", "వీటిలో ఏది వేరు?")
        else -> L("Who says “${t.sound?.en ?: ""}”?", "“${t.sound?.te ?: t.sound?.en ?: ""}” అని ఎవరు అంటారు?")
    }
}
private fun picPraiseFor(b: EarlyBundle, r: PicRound): L {
    val t = b.pic[r.target] ?: return L("", "")
    val base = r.base?.let { b.catNames[it] }
    if (r.mode == "odd" && base != null) return L("The ${t.en.lowercase()} is different. The others are ${base.en}.", "${t.te} వేరు. మిగతావి ${base.te ?: base.en}.")
    if (r.mode == "sound") return L("The ${t.en.lowercase()} says ${t.sound?.en ?: ""}", "${t.te}: ${t.sound?.te ?: t.sound?.en ?: ""}")
    return L("${t.en}!", "${t.te}!")
}

@Composable
fun PictureFunScreen() {
    val app = LocalApp.current
    TrackLast("/play/pictures", UI.pictures)
    val saved = rememberSaved("pictures", PicState.serializer(), PicState())
    var mode by rememberSaveable { mutableStateOf<String?>(null) }
    var setId by rememberSaveable { mutableStateOf<String?>(null) }
    var session by rememberSaveable { mutableIntStateOf(0) }
    val needsSet = mode == "find" || mode == "what"
    val playing = mode != null && (!needsSet || setId != null)
    val back: () -> Unit = {
        when {
            playing && needsSet -> { setId = null }
            mode != null -> { mode = null }
            else -> app.back()
        }
    }
    BackHandler(mode != null) { back() }
    val lang = WL.lang
    EarlyScreen(UI.pictures.tx, back) { b ->
        when {
            mode == null -> ActMenu(UI.pickGame, PIC_MODES.size) { i ->
                val m = PIC_MODES[i]
                BigTile(m.art, m.title, { mode = m.id }, Modifier.fillMaxSize(), tint = tint(m.tint))
            }
            needsSet && setId == null -> ActMenu(L("Pick some pictures!", "బొమ్మలు ఎంచుకో!"), b.sets.size) { i ->
                val s = b.sets[i]
                BigTile(s.cover, s.title, { setId = s.id; session++; saved.update { it.copy(lastSet = s.id) } }, Modifier.fillMaxSize(),
                    sub = if (saved.value.played.contains("$mode:${s.id}")) "✓" else null)
            }
            else -> key(mode, setId, session, lang) {
                PicSession(b, mode!!, setId, saved, onAgain = { session++ }, onMenu = { setId = null; mode = null })
            }
        }
    }
}

@Composable
private fun PicSession(b: EarlyBundle, mode: String, setId: String?, saved: Saved<PicState>, onAgain: () -> Unit, onMenu: () -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("pictures")
    val badge = rememberBadge()
    val scope = rememberCoroutineScope()
    val seed = rememberSaveable { newSeed() }
    var idx by rememberSaveable { mutableIntStateOf(0) }
    val roundState = rememberActState(PicRound.serializer())
    var wrong by rememberSaveable { mutableStateOf(listOf<String>()) }
    var solved by rememberSaveable { mutableStateOf(false) }
    var finished by rememberSaveable { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        if (roundState.value == null) roundState.value = app.engine.early<PicRound>("picRound", seed, mode, setId, saved.current().adapt.choices, null)
    }
    val round = roundState.value
    val prompt = round?.let { picPromptFor(b, it) }
    Narrate(if (finished) null else prompt, "$idx-${round?.target}")
    // "Who says ___?" plays the real sound after the question is read
    val roundSfx = if (mode == "sound" && !finished && round != null) itemSfx(b, round.target) else null
    SfxAfterNarration(roundSfx, "$idx-${round?.target}")
    if (finished) { DonePanel(onAgain, onMenu); return }
    if (round == null || prompt == null) { EarlyLoading(); return }
    val lang = WL.lang

    val pick: (String) -> Unit = { id ->
        if (!solved) {
            val ok = id == round.target
            playItemSfx(b, id)
            record("$mode:${round.target}", ok, if (wrong.size >= 2) 1 else 0)
            val first = ok && wrong.isEmpty()
            scope.launch { val a = app.engine.adaptNext(saved.current().adapt, ok, first, if (mode == "what") 3 else 4); saved.update { it.copy(adapt = a) } }
            if (ok) {
                solved = true
                say(picPraiseFor(b, round))
                val rec = saved.current().recognised
                saved.update { it.copy(recognised = it.recognised + 1) }
                if (rec + 1 >= 50) badge("play:50-pictures", null)
            } else {
                say(if (wrong.isNotEmpty()) L("${UI.tryAgain.en} ${prompt.en}", "${UI.tryAgain.te} ${prompt.te}") else UI.tryAgain)
                wrong = wrong + id
            }
        }
    }
    val next: () -> Unit = {
        if (idx + 1 >= PIC_ROUNDS) {
            finished = true; EarlyFx.celebrate(); say(UI.allDone)
            saved.update { it.copy(played = (it.played + "$mode:${setId ?: "mix"}").distinct()) }
        } else scope.launch {
            val r = app.engine.early<PicRound>("picRound", seed + (idx + 1) * 7919, mode, setId, saved.current().adapt.choices, round.target)
            if (r != null) { roundState.value = r; idx += 1; wrong = emptyList(); solved = false }
        }
        Unit
    }
    fun stateOf(id: String): Pick? = when {
        solved && id == round.target -> Pick.Right
        wrong.contains(id) -> Pick.Wrong
        !solved && wrong.size >= 2 && id == round.target -> Pick.Hint
        else -> null
    }
    val target = b.pic[round.target]
    val solvedButtons: @Composable () -> Unit = {
        target?.sound?.let { s -> SpeakButton({ say(s) }, size = 56.dp) }
        NextButton(next)
    }
    ActPlay(
        header = {
            RoundDots(idx, PIC_ROUNDS)
            PromptBar(prompt)
            if (roundSfx != null) KidButton(L("Hear the sound", "శబ్దం విను").tx, { Sfx.play(roundSfx) }, icon = Icons.Rounded.VolumeUp)
        },
        footer = {
            ActFooter(solved || wrong.isNotEmpty(), solved, wrong.size, extra = if (solved) picPraiseFor(b, round).get(lang) else null, buttons = if (solved) solvedButtons else null)
        },
    ) {
        if (mode == "what") {
            val land = LocalWindow.current.landscape
            val hero = @Composable { m: Modifier ->
                BoxWithConstraints(m, contentAlignment = Alignment.Center) {
                    val s = min(maxWidth, maxHeight) * 0.9f
                    val hasSfx = itemSfx(b, round.target) != null
                    Box(
                        Modifier.size(s).clip(RoundedCornerShape(28.dp)).background(WL.colors.surface)
                            .then(if (hasSfx) Modifier.pressable(role = Role.Button) { playItemSfx(b, round.target) } else Modifier)
                            .semantics { contentDescription = (if (hasSfx) L("A picture. Tap to hear its sound.", "ఒక బొమ్మ. దాని శబ్దం వినడానికి తాకు.") else L("A picture", "ఒక బొమ్మ")).get(lang) },
                        contentAlignment = Alignment.Center,
                    ) { PicArt(round.target, s * 0.8f) }
                }
            }
            val words = @Composable { m: Modifier ->
                Column(m, verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically)) {
                    round.choices.forEach { id ->
                        val p = b.pic[id] ?: return@forEach
                        WordChoice(p.name, stateOf(id), enabled = !solved && stateOf(id) != Pick.Wrong) { pick(id) }
                    }
                }
            }
            if (land) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) { hero(Modifier.weight(1f).fillMaxHeight()); words(Modifier.weight(1f).fillMaxHeight()) }
            else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) { hero(Modifier.weight(1f).fillMaxWidth()); words(Modifier.fillMaxWidth()) }
        } else {
            FitGrid(round.choices.size, Modifier.fillMaxSize(), gap = 12.dp, maxCell = 260.dp) { i, _ ->
                val id = round.choices[i]
                val st = stateOf(id)
                PicButton(id, b.pic[id]?.name?.get(lang) ?: id, { pick(id) }, Modifier.fillMaxSize(), state = st, enabled = !solved && st != Pick.Wrong, showLabel = solved || mode == "odd")
            }
        }
    }
}

/** A spoken word choice ("What is this?"): speaker + big word button with its state. */
@Composable
internal fun WordChoice(word: Localized, state: Pick?, enabled: Boolean, onPick: () -> Unit) {
    val say = rememberSay()
    val c = WL.colors
    val (bg, border) = when (state) { Pick.Right -> c.goodBg to c.good; Pick.Wrong -> c.badBg to c.bad; Pick.Hint -> c.warnBg to c.accent; Pick.Selected -> c.surface to c.primary; null -> c.surface to c.line }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        SpeakButton({ say(word) }, size = 56.dp)
        Row(
            Modifier.weight(1f).heightIn(min = 64.dp).clip(RoundedCornerShape(20.dp)).background(bg)
                .border(if (state == null) 1.5.dp else 4.dp, border, RoundedCornerShape(20.dp))
                .pressable(enabled, role = Role.Button, onClick = onPick).padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
        ) {
            if (state == Pick.Right) Icon(Icons.Rounded.Check, null, tint = c.good)
            if (state == Pick.Hint) Icon(Icons.Rounded.PanTool, null, tint = c.accent)
            Text(word.tx, style = actText(24), color = if (state == Pick.Wrong) c.text.copy(alpha = .5f) else c.text, textAlign = TextAlign.Center, maxLines = 2)
        }
    }
}

