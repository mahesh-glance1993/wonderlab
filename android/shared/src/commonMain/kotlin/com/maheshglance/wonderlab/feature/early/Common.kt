package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.GridView
import androidx.compose.material.icons.rounded.MenuBook
import androidx.compose.material.icons.rounded.PanTool
import androidx.compose.material.icons.rounded.Replay
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameMillis
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.min
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.design.CardShape
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.ErrorState
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLFonts
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.JsonObject
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

// =============================================================================================
// Words, narration, saved state, records, badges, stickers
// =============================================================================================

/** UI words (the website's UI object in common.tsx). */
object UI {
    val playLearn = L("Play & Learn", "ఆడుకుందాం, నేర్చుకుందాం")
    val pictures = L("Picture Fun", "బొమ్మల ఆట")
    val stories = L("Story Time", "కథల సమయం")
    val shapes = L("Shape Play", "ఆకారాల ఆట")
    val sort = L("Sort & Match", "వేరుచేద్దాం, జతచేద్దాం")
    val build = L("Build It", "తయారు చేద్దాం")
    val wellDone = L("Well done!", "భలే!")
    val tryAgain = L("Try again!", "మళ్ళీ ప్రయత్నించు!")
    val lookHere = L("Look — this one!", "చూడు — ఇదే!")
    val next = L("Next", "తర్వాత")
    val back = L("Back", "వెనక్కి")
    val listen = L("Listen", "విను")
    val playAgain = L("Play again", "మళ్ళీ ఆడు")
    val allDone = L("All done! Great job!", "అయిపోయింది! చాలా బాగా చేశావు!")
    val menu = L("Choose a game", "ఆట ఎంచుకో")
    val round = L("Round", "ఆట")
    val of = L("of", "/")
    val pickGame = L("Pick a game!", "ఒక ఆట ఎంచుకో!")
    val newBadge = L("New badge", "కొత్త బ్యాడ్జ్")
    val newSticker = L("New sticker!", "కొత్త స్టిక్కర్!")
    val stickerBook = L("Sticker book", "స్టిక్కర్ పుస్తకం")
}

/** Badge names (BADGES in common.tsx). */
val BADGES: Map<String, L> = mapOf(
    "play:first-story" to L("First story", "మొదటి కథ"),
    "play:5-stories" to L("Five stories", "ఐదు కథలు"),
    "play:50-pictures" to L("50 pictures", "50 బొమ్మలు"),
    "play:all-shapes" to L("Shape finder", "ఆకారాల వేటగాడు"),
    "play:build-first" to L("First build", "మొదటి నిర్మాణం"),
    "play:build-5" to L("Five builds", "ఐదు నిర్మాణాలు"),
    "play:build-all" to L("Master builder", "గొప్ప నిర్మాత"),
)
/** Sticker-count badges (STICKER_BADGES in actCommon.tsx). */
val STICKER_BADGES: List<Triple<String, Int, L>> = listOf(
    Triple("play:stickers-5", 5, L("Sticker starter", "స్టిక్కర్ల మొదలు")),
    Triple("play:stickers-15", 15, L("Sticker collector", "స్టిక్కర్ల సేకర్త")),
    Triple("play:stickers-all", 30, L("Sticker book full", "స్టిక్కర్ పుస్తకం నిండింది")),
)

/** Text of a Localized in the learner's language. */
@Composable fun tx(l: Localized?): String = l?.get(WL.lang) ?: ""
val Localized.tx: String @Composable get() = get(WL.lang)

/** Speaks Localized text in the learner's language (English when no Telugu voice). */
@Composable
fun rememberSay(): (Localized) -> Unit {
    val app = LocalApp.current
    val lang = WL.lang
    return remember(app, lang) { { l: Localized -> app.say(l, lang) } }
}

/** Speak `l` 250 ms after `key` changes (new round / page) — useNarrate. */
@Composable
fun Narrate(l: Localized?, key: Any?) {
    val say = rememberSay()
    val cur by rememberUpdatedState(l)
    LaunchedEffect(key) { delay(250); cur?.let(say) }
}

/** Remember this place for "Continue" on the home screen (useLastActivity). */
@Composable
fun TrackLast(path: String, label: Localized) {
    val app = LocalApp.current
    val text = label.tx
    LaunchedEffect(path, text) { app.repo.setLastActivity(path, text) }
}

/** Per-activity saved state `play:<id>` (useActivity): defaults merged with what was saved; unknown keys kept. */
class Saved<T>(private val key: String, private val ser: KSerializer<T>, private val init: T, private val read: () -> JsonObject?, private val write: (JsonObject) -> Unit, val value: T) {
    fun current(): T = decode(read())
    private fun decode(o: JsonObject?): T = o?.let { runCatching { AppJson.decodeFromJsonElement(ser, JsonObject(defaults() + it)) }.getOrNull() } ?: init
    private fun defaults(): Map<String, kotlinx.serialization.json.JsonElement> = (AppJson.encodeToJsonElement(ser, init) as? JsonObject) ?: emptyMap()
    /** Updates from the latest saved value (like the web's ref) and saves on the device + server. */
    fun update(f: (T) -> T) {
        val raw = read()
        val next = f(decode(raw))
        val enc = AppJson.encodeToJsonElement(ser, next) as? JsonObject ?: return
        write(JsonObject((raw ?: emptyMap()) + enc))
    }
    @Suppress("unused") val id get() = key
}

@Composable
fun <T> rememberSaved(id: String, ser: KSerializer<T>, init: T): Saved<T> {
    val app = LocalApp.current
    val s by appState()
    val key = "play:$id"
    val raw = s.learner.activities[key]?.state as? JsonObject
    val read = { app.repo.state.value.learner.activities[key]?.state as? JsonObject }
    val write = { o: JsonObject -> app.repo.saveActivityState(key, o) }
    val decoded = remember(raw) { raw?.let { r -> runCatching { AppJson.decodeFromJsonElement(ser, JsonObject(((AppJson.encodeToJsonElement(ser, init) as? JsonObject) ?: emptyMap()) + r)) }.getOrNull() } ?: init }
    return Saved(key, ser, init, read, write, decoded)
}

/** Records one answer for mastery (objective play:<activity>) — useRecord. */
@Composable
fun rememberRecord(activity: String): (qid: String, correct: Boolean, hints: Int) -> Unit {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    return remember(activity) {
        { qid, correct, hints ->
            scope.launch { runCatching { app.repo.recordAttempt("play:$activity:$qid", 1, "play:$activity", "game", correct, hintsUsed = hints) } }
            Unit
        }
    }
}

/** Awards a badge once and shows "New badge: …" (useBadge). Returns true when it is new. */
@Composable
fun rememberBadge(): (id: String, name: Localized?) -> Boolean {
    val app = LocalApp.current
    val lang = WL.lang
    return remember(app, lang) {
        { id, name ->
            val fresh = runCatching { app.repo.award(id) }.getOrDefault(false)
            if (fresh) EarlyFx.toast("${UI.newBadge.get(lang)}: ${(name ?: BADGES[id] ?: L("Badge", "బ్యాడ్జ్")).get(lang)}", "🏅")
            fresh
        }
    }
}

/** Sticker Book state + give(source) which earns the next sticker for that game (useStickers). */
class StickerBook(val state: StickerState, val give: suspend (source: String, day: Boolean) -> Sticker?)

@Composable
fun rememberStickers(): StickerBook {
    val app = LocalApp.current
    val saved = rememberSaved("stickers", StickerState.serializer(), StickerState())
    val badge = rememberBadge()
    return StickerBook(saved.value) { source, day ->
        val key = dayKey()
        val cur = saved.current()
        val r = app.engine.early<GiveResult>("giveSticker", json(cur), source, key, nowMillis(), day)
        if (r != null) {
            saved.update { r.state }
            if (r.sticker != null) for ((id, at, name) in STICKER_BADGES) if (r.count >= at) badge(id, name)
        }
        r?.sticker
    }
}

/** Local calendar day, e.g. 2026-11-09 (dayKey in activities.ts). */
fun dayKey(): String = dayKeyOf(nowMillis())
fun dayKeyOf(epochMs: Long): String = isoLocalDate(epochMs)
fun dayKey(year: Int, month: Int, day: Int): String = "${year.toString().padStart(4, '0')}-${pad2(month)}-${pad2(day)}"

fun newSeed(): Int = Random.nextInt(0, Int.MAX_VALUE)

// ---- sounds for pictures ----
/** The sound effect for a picture (animals, birds, vehicles, nature), if it has one (itemSfx). */
fun itemSfx(b: EarlyBundle?, id: String): String? {
    val p = b?.pic?.get(id) ?: return null
    if (p.cat !in setOf("animal", "bird", "vehicle", "nature")) return null
    return Sfx.forWord(p.id) ?: Sfx.forWord(p.en)
}
fun playItemSfx(b: EarlyBundle?, id: String) { itemSfx(b, id)?.let { Sfx.play(it) } }

/** Plays a sound once the narration started with `key` has finished (or soon if nothing is spoken). */
@Composable
fun SfxAfterNarration(name: String?, key: Any?, play: (String) -> Unit = { Sfx.play(it) }) {
    val app = LocalApp.current
    LaunchedEffect(key) {
        if (name == null) return@LaunchedEffect
        val started = withTimeoutOrNull(1600) { app.speech.speaking.first { it } }
        if (started != null) { app.speech.speaking.first { !it }; delay(250) }
        play(name)
    }
}

// ---- celebration + toasts ----
object EarlyFx {
    var burst by mutableIntStateOf(0)
        private set
    var message by mutableStateOf<Pair<Int, String>?>(null)
        private set
    private var n = 0
    /** Confetti + a little cheer (celebrate in ui/kit). */
    fun celebrate() { burst++ }
    fun toast(text: String, emoji: String = "⭐") { n++; message = n to "$emoji $text" }
    internal fun clear(id: Int) { if (message?.first == id) message = null }
}

// =============================================================================================
// Screen frame
// =============================================================================================

/** A Play & Learn screen: top bar + one-screen body + confetti/toast overlays. Ducks sounds under narration. */
@Composable
fun EarlyScreen(title: String, onBack: () -> Unit, modifier: Modifier = Modifier, actions: @Composable RowScope.() -> Unit = {}, content: @Composable BoxScope.(EarlyBundle) -> Unit) {
    val app = LocalApp.current
    val b = rememberEarly()
    LaunchedEffect(Unit) { app.speech.speaking.collect { Sfx.setSpeaking(it) } }
    val phone = LocalWindow.current.isPhone
    Box(modifier.fillMaxSize().background(WL.colors.bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar(title, onBack = onBack, actions = actions)
            Box(
                Modifier.weight(1f).fillMaxWidth()
                    .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Bottom + WindowInsetsSides.Horizontal))
                    .padding(horizontal = if (phone) 10.dp else 20.dp, vertical = if (phone) 8.dp else 14.dp),
            ) {
                when {
                    b != null -> content(b)
                    EarlyContent.error != null -> ErrorState(EarlyContent.error ?: "", onRetry = null)
                    else -> Loading()
                }
            }
        }
        Confetti()
        ToastHost(Modifier.align(Alignment.TopCenter).padding(top = 72.dp))
    }
}

@Composable
private fun ToastHost(modifier: Modifier) {
    val msg = EarlyFx.message
    LaunchedEffect(msg?.first) { val id = msg?.first ?: return@LaunchedEffect; delay(2800); EarlyFx.clear(id) }
    AnimatedVisibility(msg != null, modifier, enter = fadeIn() + slideInVertically { -it }, exit = fadeOut() + slideOutVertically { -it }) {
        val text = msg?.second ?: ""
        Box(Modifier.shadow(8.dp, RoundedCornerShape(999.dp)).clip(RoundedCornerShape(999.dp)).background(WL.colors.surface).border(2.dp, WL.colors.accent.copy(alpha = .4f), RoundedCornerShape(999.dp)).padding(horizontal = 18.dp, vertical = 10.dp)) {
            EmojiText(text, style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
        }
    }
}

private class Bit(val x: Float, val vx: Float, val vy: Float, val spin: Float, val color: Color, val w: Float, val h: Float, val delay: Float)

/** Confetti burst whenever EarlyFx.celebrate() is called (off in reduced motion). */
@Composable
private fun Confetti() {
    val reduce = LocalReduceMotion.current
    val burst = EarlyFx.burst
    if (burst == 0 || reduce) return
    val colors = listOf(Color(0xFFE8665F), Color(0xFFF2C14E), Color(0xFF4F86C6), Color(0xFF5E9E62), Color(0xFFE58FB0), Color(0xFF8E6BB8), Color(0xFFE8862E))
    val bits = remember(burst) { List(90) { Bit(Random.nextFloat(), (Random.nextFloat() - 0.5f) * 0.5f, 0.5f + Random.nextFloat() * 0.8f, (Random.nextFloat() - 0.5f) * 900f, colors[it % colors.size], 7f + Random.nextFloat() * 7f, 10f + Random.nextFloat() * 10f, Random.nextFloat() * 0.25f) } }
    var t by remember(burst) { mutableStateOf(0f) }
    LaunchedEffect(burst) { val start = withFrameMillis { it }; while (t < 2.2f) withFrameMillis { t = (it - start) / 1000f } }
    if (t >= 2.2f) return
    Canvas(Modifier.fillMaxSize()) {
        for (b in bits) {
            val tt = (t - b.delay).coerceAtLeast(0f)
            if (tt <= 0f) continue
            val x = (b.x + b.vx * tt) * size.width
            val y = -20f + (b.vy * tt + 0.45f * tt * tt) * size.height * 0.55f
            val a = (1f - (tt / 2f)).coerceIn(0f, 1f)
            val ang = b.spin * tt
            val cx = cos(toRadians(ang.toDouble())).toFloat()
            drawRect(b.color.copy(alpha = a), Offset(x, y), Size(b.w * dp1() * kotlin.math.abs(cx).coerceAtLeast(0.2f), b.h * dp1()))
        }
    }
}
private fun androidx.compose.ui.graphics.drawscope.DrawScope.dp1() = density

// =============================================================================================
// Building blocks
// =============================================================================================

enum class Pick { Right, Wrong, Hint, Selected }

/** Prompt line: replay (speaker) button + big words. `leading` can add a little picture before the words. */
@Composable
fun PromptBar(l: Localized, modifier: Modifier = Modifier, text: String? = null, leading: (@Composable () -> Unit)? = null, trailing: (@Composable () -> Unit)? = null, maxLines: Int = 3) {
    val say = rememberSay()
    val phone = LocalWindow.current.isPhone
    Row(
        modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(WL.colors.surface).padding(horizontal = 8.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        SpeakButton({ com.maheshglance.wonderlab.core.audio.Tones.tap(); say(l) }, size = if (phone) 48.dp else 56.dp)
        leading?.invoke()
        EmojiText(
            text ?: l.tx, modifier = Modifier.weight(1f),
            style = TextStyle(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid, fontWeight = FontWeight.Bold, fontSize = if (phone) 19.sp else 24.sp, lineHeight = if (phone) 24.sp else 30.sp),
            color = WL.colors.text, maxLines = maxLines,
        )
        trailing?.invoke()
    }
}

/** Progress dots for a short set of rounds. */
@Composable
fun RoundDots(done: Int, total: Int, modifier: Modifier = Modifier) {
    val label = "${UI.round.tx} ${minOf(done + 1, total)} ${UI.of.tx} $total"
    Row(modifier.semantics { contentDescription = label }, horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
        repeat(total) { i ->
            val on = i < done; val cur = i == done
            val sz by animateFloatAsState(if (cur) 22f else 16f, spring(dampingRatio = 0.5f), label = "dot")
            Box(
                Modifier.size(sz.dp).clip(CircleShape).background(if (on) WL.colors.good else if (cur) WL.colors.primary else WL.colors.surface2)
                    .border(2.dp, if (cur) WL.colors.primary else WL.colors.line, CircleShape),
                contentAlignment = Alignment.Center,
            ) { if (on) Icon(Icons.Rounded.Check, null, tint = Color.White, modifier = Modifier.size(12.dp)) }
        }
    }
}

/** Gentle feedback: "Well done!" / "Try again!" / "Look — this one!" + optional extra words. */
@Composable
fun EarlyFeedback(ok: Boolean, tries: Int, modifier: Modifier = Modifier, extra: String? = null) {
    val c = WL.colors
    val text = (if (ok) UI.wellDone else if (tries >= 2) UI.lookHere else UI.tryAgain).tx + (extra?.let { " $it" } ?: "")
    val s = remember { Animatable(0.85f) }
    LaunchedEffect(ok, tries) { s.snapTo(0.85f); s.animateTo(1f, spring(dampingRatio = 0.45f, stiffness = Spring.StiffnessMediumLow)) }
    Row(
        modifier.graphicsLayer { scaleX = s.value; scaleY = s.value }.clip(RoundedCornerShape(18.dp)).background(if (ok) c.goodBg else c.warnBg).padding(horizontal = 14.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(if (ok) "🌟" else "🤔", fontSize = 22.sp)
        EmojiText(text, style = MaterialTheme.typography.titleMedium.copy(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid), color = if (ok) c.good else c.warn, maxLines = 2)
    }
}

/** Big kid button (64 dp). */
@Composable
fun KidButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier, icon: ImageVector? = null, primary: Boolean = false, enabled: Boolean = true, trailingIcon: ImageVector? = null) {
    val c = WL.colors
    val bg = if (primary) c.primary else c.surface
    val fg = if (primary) c.primaryInk else c.text
    Row(
        modifier.defaultMinSize(minHeight = WL.tier.target, minWidth = WL.tier.target)
            .shadow(if (enabled) 4.dp else 0.dp, RoundedCornerShape(20.dp), clip = false)
            .clip(RoundedCornerShape(20.dp)).background(if (enabled) bg else bg.copy(alpha = .5f))
            .border(if (primary) 0.dp else 1.5.dp, c.line, RoundedCornerShape(20.dp))
            .pressable(enabled, onClick = onClick).padding(horizontal = 18.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
    ) {
        if (icon != null) Icon(icon, null, tint = fg, modifier = Modifier.size(26.dp))
        Text(text, color = fg, style = MaterialTheme.typography.titleMedium.copy(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid), textAlign = TextAlign.Center, maxLines = 2)
        if (trailingIcon != null) Icon(trailingIcon, null, tint = fg, modifier = Modifier.size(26.dp))
    }
}

/** "Next" button used after a round is solved. */
@Composable
fun NextButton(onClick: () -> Unit, modifier: Modifier = Modifier, text: String? = null) =
    KidButton(text ?: UI.next.tx, onClick, modifier, primary = true, trailingIcon = Icons.AutoMirrored.Rounded.ArrowForward)

/**
 * A big picture button. Shows a 3D picture (or the website drawing), an optional word, and its state:
 * right (green + tick + bounce), wrong (red, shakes, faded), hint (pulsing hand), selected (blue ring).
 */
@Composable
fun PicButton(
    art: String, label: String, onPick: () -> Unit, modifier: Modifier = Modifier,
    state: Pick? = null, enabled: Boolean = true, showLabel: Boolean = false, v: String? = null, shadow: Boolean = false,
    artScale: Float = 0.78f, forceDrawing: Boolean = false, badge: String? = null, bg: Color? = null,
    picture: (@Composable (Dp) -> Unit)? = null,
) {
    val c = WL.colors
    val reduce = LocalReduceMotion.current
    val border = when (state) { Pick.Right -> c.good; Pick.Wrong -> c.bad; Pick.Hint -> c.accent; Pick.Selected -> c.primary; null -> Color.Transparent }
    val bounce = remember { Animatable(1f) }
    val shake = remember { Animatable(0f) }
    LaunchedEffect(state) {
        if (reduce) return@LaunchedEffect
        if (state == Pick.Right) { bounce.snapTo(0.9f); bounce.animateTo(1f, spring(dampingRatio = 0.35f, stiffness = 500f)) }
        if (state == Pick.Wrong) { for (x in listOf(-10f, 9f, -6f, 4f, 0f)) shake.animateTo(x, tween(55)) }
    }
    val pulse = if (state == Pick.Hint && !reduce) rememberInfiniteTransition(label = "hint").animateFloat(1f, 1.06f, infiniteRepeatable(tween(600), RepeatMode.Reverse), label = "p").value else 1f
    BoxWithConstraints(
        modifier
            .graphicsLayer { translationX = shake.value * density; scaleX = bounce.value * pulse; scaleY = bounce.value * pulse; alpha = if (state == Pick.Wrong) 0.55f else 1f }
            .shadow(if (state == Pick.Wrong) 1.dp else 5.dp, RoundedCornerShape(22.dp), clip = false)
            .clip(RoundedCornerShape(22.dp))
            .background(bg ?: when (state) { Pick.Right -> c.goodBg; Pick.Wrong -> c.badBg; else -> c.surface })
            .border(BorderStroke(if (state == null) 0.dp else 4.dp, border), RoundedCornerShape(22.dp))
            .pressable(enabled && state != Pick.Wrong, role = Role.Button, onClick = onPick)
            .semantics { contentDescription = label; if (state != null) stateDescription = state.name },
        contentAlignment = Alignment.Center,
    ) {
        // long labels (e.g. story titles) wrap to two lines and shrink to fit — never cut off with "…"
        val labelH = if (showLabel) (minOf(maxHeight * 0.3f, 52.dp)) else 0.dp
        val pic = min(maxWidth, maxHeight - labelH) * artScale
        Column(Modifier.fillMaxSize().padding(4.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                if (picture != null) picture(pic) else PicArt(art, pic, v = v, shadow = shadow, forceDrawing = forceDrawing)
            }
            if (showLabel) androidx.compose.foundation.text.BasicText(
                label,
                style = MaterialTheme.typography.titleMedium.copy(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid, color = c.text, textAlign = TextAlign.Center, lineHeight = 1.1.em),
                maxLines = 2,
                autoSize = androidx.compose.foundation.text.TextAutoSize.StepBased(minFontSize = 10.sp, maxFontSize = if (labelH < 36.dp) 15.sp else 17.sp),
                modifier = Modifier.fillMaxWidth().padding(horizontal = 4.dp).heightIn(max = labelH),
            )
        }
        val corner = Modifier.align(Alignment.TopEnd).padding(6.dp).size(30.dp).clip(CircleShape)
        when {
            state == Pick.Right -> Box(corner.background(c.good), contentAlignment = Alignment.Center) { Icon(Icons.Rounded.Check, null, tint = Color.White, modifier = Modifier.size(20.dp)) }
            state == Pick.Hint -> Box(corner.background(c.accent), contentAlignment = Alignment.Center) { Icon(Icons.Rounded.PanTool, null, tint = Color.White, modifier = Modifier.size(18.dp)) }
            state == Pick.Selected -> Box(corner.background(c.primary), contentAlignment = Alignment.Center) { Icon(Icons.Rounded.PanTool, null, tint = c.primaryInk, modifier = Modifier.size(18.dp)) }
            badge != null -> Box(corner.background(c.good), contentAlignment = Alignment.Center) { Text(badge, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp) }
        }
    }
}

/**
 * Lays `count` cells out to fill the available space as large as possible (no scrolling): picks the number of
 * columns that gives the biggest cells, then sizes the rows to fill the height. `aspect` = cell width / height.
 */
@Composable
fun FitGrid(count: Int, modifier: Modifier = Modifier, gap: Dp = 12.dp, aspect: Float = 1f, maxCell: Dp = 300.dp, fixedCols: Int? = null, cell: @Composable (index: Int, size: Dp) -> Unit) {
    BoxWithConstraints(modifier, contentAlignment = Alignment.Center) {
        if (count <= 0) return@BoxWithConstraints
        val w = maxWidth; val h = maxHeight
        var best = 1; var bestS = 0f
        for (cols in (fixedCols?.let { it..it } ?: 1..count)) {
            val rows = ceil(count / cols.toFloat()).toInt()
            val cw = (w - gap * (cols - 1)) / cols
            val ch = (h - gap * (rows - 1)) / rows
            val s = minOf(cw.value, ch.value * aspect)
            if (s > bestS + 0.5f) { bestS = s; best = cols }
        }
        val cols = best
        val rows = ceil(count / cols.toFloat()).toInt()
        val cw = minOf(((w - gap * (cols - 1)) / cols).value, (((h - gap * (rows - 1)) / rows).value) * aspect, maxCell.value * aspect.coerceAtLeast(1f)).dp
        val ch = (cw.value / aspect).dp
        Column(verticalArrangement = Arrangement.spacedBy(gap), horizontalAlignment = Alignment.CenterHorizontally) {
            for (r in 0 until rows) Row(horizontalArrangement = Arrangement.spacedBy(gap)) {
                for (k in 0 until cols) {
                    val i = r * cols + k
                    if (i < count) Box(Modifier.size(cw, ch)) { cell(i, minOf(cw, ch)) }
                }
            }
        }
    }
}

/** A large menu tile (BigTile): picture + title; the title is read aloud on tap. */
@Composable
fun BigTile(art: String?, title: Localized, onGo: () -> Unit, modifier: Modifier = Modifier, tint: Color = WL.colors.surface, sub: String? = null, v: String? = null, picture: (@Composable (Dp) -> Unit)? = null) {
    val say = rememberSay()
    val c = WL.colors
    BoxWithConstraints(
        modifier.shadow(6.dp, CardShape, clip = false).clip(CardShape).background(tint)
            .pressable(role = Role.Button) { say(title); onGo() }.semantics { contentDescription = title.get("en") },
    ) {
        val small = maxHeight < 120.dp
        // room for a two-line title; long titles wrap between words and shrink to fit — never cut off with "…"
        val titleH = if (small) 32.dp else 44.dp
        val pic = min(maxWidth * 0.72f, maxHeight - titleH - 14.dp).coerceAtLeast(24.dp)
        Column(Modifier.fillMaxSize().padding(6.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(2.dp, Alignment.CenterVertically)) {
            Box(Modifier.size(pic), contentAlignment = Alignment.Center) { if (picture != null) picture(pic) else if (art != null) PicArt(art, pic, v = v) }
            androidx.compose.foundation.text.BasicText(
                title.tx,
                style = MaterialTheme.typography.titleMedium.copy(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid, color = c.text, textAlign = TextAlign.Center, lineHeight = 1.12.em),
                maxLines = 2,
                autoSize = androidx.compose.foundation.text.TextAutoSize.StepBased(minFontSize = 10.sp, maxFontSize = if (small) 14.sp else 18.sp),
                modifier = Modifier.fillMaxWidth().heightIn(max = titleH),
            )
        }
        if (sub != null) Box(Modifier.align(Alignment.TopEnd).padding(6.dp).clip(RoundedCornerShape(999.dp)).background(c.good).padding(horizontal = 8.dp, vertical = 2.dp)) {
            Text(sub, color = Color.White, style = MaterialTheme.typography.labelMedium)
        }
    }
}

/** Area tints used by the website (var(--c-art) …). */
@Composable fun tint(name: String): Color = when (name) { "art" -> WL.colors.art; "math" -> WL.colors.math; "lab" -> WL.colors.lab; "next" -> WL.colors.next; "games" -> WL.colors.games; else -> WL.colors.surface }

/** Level / option buttons (pressed state shown with a tick and border, not colour alone). */
@Composable
fun LevelPicker(options: List<Localized>, value: Int, onChange: (Int) -> Unit, modifier: Modifier = Modifier) {
    val say = rememberSay()
    val c = WL.colors
    Row(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically) {
        options.forEachIndexed { i, o ->
            val on = i == value
            Row(
                Modifier.heightIn(min = 52.dp).clip(RoundedCornerShape(16.dp)).background(if (on) c.math else c.surface)
                    .border(if (on) 3.dp else 1.5.dp, if (on) c.primary else c.line, RoundedCornerShape(16.dp))
                    .pressable(role = Role.RadioButton) { say(o); onChange(i) }.padding(horizontal = 14.dp, vertical = 6.dp)
                    .semantics { stateDescription = if (on) "selected" else "" },
                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                if (on) Icon(Icons.Rounded.Check, null, tint = c.mathInk, modifier = Modifier.size(20.dp))
                Text(o.tx, style = MaterialTheme.typography.titleSmall.copy(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid, fontSize = 16.sp), color = if (on) c.mathInk else c.text, maxLines = 1)
            }
        }
    }
}

/** End-of-set panel with a bouncing star, play again / choose a game, and optional extra content (sticker…). */
@Composable
fun DonePanel(onAgain: () -> Unit, onMenu: () -> Unit, modifier: Modifier = Modifier, extra: @Composable () -> Unit = {}) {
    val reduce = LocalReduceMotion.current
    val s = remember { Animatable(if (reduce) 1f else 0.2f) }
    val spin = rememberInfiniteTransition(label = "star").animateFloat(-6f, 6f, infiniteRepeatable(tween(900), RepeatMode.Reverse), label = "r")
    LaunchedEffect(Unit) { if (!reduce) s.animateTo(1f, spring(dampingRatio = 0.4f, stiffness = 300f)) }
    val land = LocalWindow.current.landscape
    BoxWithConstraints(modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        val star = min(maxHeight * (if (land) 0.42f else 0.3f), 180.dp)
        val wide = maxWidth > 420.dp
        val buttons = @Composable {
            KidButton(UI.playAgain.tx, onAgain, icon = Icons.Rounded.Replay, primary = true)
            KidButton(UI.menu.tx, onMenu, icon = Icons.Rounded.GridView)
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically)) {
            Box(Modifier.size(star).scale(s.value).rotate(if (reduce) 0f else spin.value)) { Emoji3D("⭐", Modifier.fillMaxSize()) }
            Text(UI.allDone.tx, style = MaterialTheme.typography.headlineMedium.copy(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid), color = WL.colors.text, textAlign = TextAlign.Center)
            extra()
            if (wide) Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { buttons() } else Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(10.dp)) { buttons() }
        }
    }
}

/** A round sticker: picture on a coloured disc with a white rim. Locked ones are a grey silhouette. */
@Composable
fun StickerArt(s: Sticker, size: Dp, modifier: Modifier = Modifier, locked: Boolean = false) {
    Box(
        modifier.size(size).shadow(if (locked) 0.dp else 4.dp, CircleShape).clip(CircleShape)
            .background(if (locked) WL.colors.surface2 else hexColor(s.bg)).border(size * 0.06f, Color.White, CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        val forceDrawing = s.art.startsWith("c-") || s.art.startsWith("shape-")
        PicArt(s.art, size * 0.66f, v = if (s.v == "open" && s.art == "peacock") "open" else s.v, shadow = locked, forceDrawing = forceDrawing)
    }
}

/** "You got a sticker!" panel shown inside DonePanel. */
@Composable
fun StickerReveal(s: Sticker?, modifier: Modifier = Modifier, size: Dp = 84.dp) {
    if (s == null) return
    val app = LocalApp.current
    val reduce = LocalReduceMotion.current
    val sc = remember { Animatable(if (reduce) 1f else 0f) }
    LaunchedEffect(s.id) { if (!reduce) sc.animateTo(1f, spring(dampingRatio = 0.4f, stiffness = 260f)) }
    Row(
        modifier.clip(RoundedCornerShape(22.dp)).background(WL.colors.surface).padding(10.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        StickerArt(s, size, Modifier.scale(sc.value))
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(UI.newSticker.tx, style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
            Text(s.name.tx, style = MaterialTheme.typography.bodyLarge, color = WL.colors.muted)
            KidButton(UI.stickerBook.tx, { app.go("play/stickers") }, icon = Icons.Rounded.MenuBook)
        }
    }
}

/** Center a spinner while a round loads. */
@Composable
fun EarlyLoading() = Loading()
