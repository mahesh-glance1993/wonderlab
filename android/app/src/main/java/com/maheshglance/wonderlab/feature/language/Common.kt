package com.maheshglance.wonderlab.feature.language

import com.maheshglance.wonderlab.core.design.FitText

import android.content.Context
import android.widget.Toast
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Translate
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.data.Presentation
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.ErrorState
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLFonts
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.AppContext
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.t
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlin.random.Random

// ---------------- fonts & text ----------------

/** Course-script font: bundled Noto Sans Telugu for Telugu, the kid-friendly Andika for English (website: .lang-te / .lang-en). */
fun scriptFont(script: String): FontFamily = if (script == "te") WLFonts.telugu else WLFonts.kid

/** Text in the course script with the right font (emoji drawn as 3D pictures). */
@Composable
fun LT(
    text: String,
    script: String,
    modifier: Modifier = Modifier,
    style: TextStyle = MaterialTheme.typography.bodyLarge,
    color: Color = WL.colors.text,
    textAlign: TextAlign? = null,
    maxLines: Int = Int.MAX_VALUE,
    fontSize: TextUnit = TextUnit.Unspecified,
    weight: FontWeight? = null,
) {
    EmojiText(text, modifier, style = style.copy(fontFamily = scriptFont(script), fontWeight = weight ?: style.fontWeight), color = color, textAlign = textAlign, maxLines = maxLines, fontSize = fontSize)
}

/** English gloss under Telugu text, shown when "Show in English" is on. */
@Composable
fun Gloss(show: Boolean, text: String?, modifier: Modifier = Modifier, textAlign: TextAlign? = null) {
    if (!show || text.isNullOrBlank()) return
    Text(text, modifier, style = MaterialTheme.typography.bodyMedium.copy(fontFamily = WLFonts.body, fontStyle = FontStyle.Italic), color = WL.colors.muted, textAlign = textAlign)
}

// ---------------- "Show in English" (remembered on this device, like the website's localStorage) ----------------

private object GlossPref {
    var state: MutableState<Boolean>? = null
    fun get(ctx: Context): MutableState<Boolean> = state ?: mutableStateOf(ctx.getSharedPreferences("wl-lang", Context.MODE_PRIVATE).getBoolean("gloss", false)).also { state = it }
    fun set(ctx: Context, v: Boolean) { get(ctx).value = v; ctx.getSharedPreferences("wl-lang", Context.MODE_PRIVATE).edit().putBoolean("gloss", v).apply() }
}

@Composable
fun rememberGloss(): Pair<Boolean, (Boolean) -> Unit> {
    val ctx = LocalContext.current
    val s = remember { GlossPref.get(ctx) }
    return s.value to { v: Boolean -> GlossPref.set(ctx, v) }
}

@Composable
fun GlossToggle(on: Boolean, set: (Boolean) -> Unit, compact: Boolean = LocalWindow.current.isPhone) {
    if (compact) IconBtn(Icons.Rounded.Translate, if (on) "Hide English" else "Show in English", { set(!on) }, size = 44.dp,
        bg = if (on) WL.colors.math else WL.colors.surface2, tint = if (on) WL.colors.mathInk else WL.colors.text)
    else WLButton(if (on) "Hide English" else "Show in English", { set(!on) }, small = true, icon = Icons.Rounded.Translate, kind = if (on) BtnKind.Primary else BtnKind.Normal)
}

// ---------------- narration ----------------

/**
 * Narration in the course script, regardless of the UI language (website: util.ts useSay).
 * Telugu uses the device's Telugu voice; when there is none the English gloss (if any) is read instead.
 */
class Sayer(private val app: AppContext) {
    fun say(text: String?, script: String, en: String? = null) {
        if (text.isNullOrBlank()) return
        app.say(text.replace('\n', ' '), if (script == "te") "te" else "en", en?.replace('\n', ' '))
    }
    fun teVoice(): Boolean = app.speech.hasTelugu()
}

@Composable
fun rememberSayer(): Sayer { val app = LocalApp.current; return remember(app) { Sayer(app) } }

/** "Telugu voice not available" note (website: common.tsx VoiceNote). */
@Composable
fun VoiceNote(course: String, modifier: Modifier = Modifier) {
    val app = LocalApp.current
    var te by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { repeat(6) { te = app.speech.hasTelugu(); if (te) return@LaunchedEffect; delay(800) } }
    if (course != "telugu" || te) return
    AlertBox("Telugu voice not available on this device — read along with the text.", AlertKind.Info, modifier)
}

// ---------------- presentation (tier, read-aloud, typing) ----------------

private val presCache = mutableStateMapOf<String, Presentation>()

@Composable
fun rememberPresentation(): Presentation {
    val app = LocalApp.current
    val s by appState()
    val p = s.profile ?: return Presentation()
    val key = "${p.classLevel}|${p.ageBand}"
    LaunchedEffect(key) { if (presCache[key] == null) runCatching { presCache[key] = app.engine.get<Presentation>("core.presentation", p.classLevel, p.ageBand) } }
    return presCache[key] ?: Presentation(tier = WL.tier.tier)
}

// ---------------- badges & celebration ----------------

private var badgeTitles: Map<String, String>? = null

private suspend fun badgeTitle(app: AppContext, id: String): String {
    val m = badgeTitles ?: runCatching { app.engine.call("language.badges").jsonArray.associate { e -> val o = e as JsonObject; o.str("id")!! to (o.str("title") ?: "") } }.getOrNull()?.also { badgeTitles = it }
    return m?.get(id) ?: id
}

private fun toast(ctx: Context, text: String) = Toast.makeText(ctx, text, Toast.LENGTH_SHORT).show()

/** Award one badge (once) with a toast — website util.ts awardBadge. */
suspend fun awardBadge(app: AppContext, ctx: Context, id: String) {
    if (app.repo.award(id)) toast(ctx, "Badge earned: ${badgeTitle(app, id)}")
}

/** Award unit badges that are now complete — website util.ts awardUnitBadges. */
suspend fun awardUnitBadges(app: AppContext, ctx: Context, course: String) {
    val acts = langActivities(app)
    val ids = runCatching { app.engine.call("language.earnedBadges", course, acts).jsonArray.map { it.jsonPrimitive.content } }.getOrDefault(emptyList())
    for (id in ids) awardBadge(app, ctx, id)
}

/** The learner's language activity states in the website's ActivityMap shape. */
fun langActivities(app: AppContext): JsonObject {
    val acts = app.repo.state.value.learner.activities
    return JsonObject(acts.filterKeys { it.startsWith("lang:") }.mapValues { (_, v) -> buildJsonObject { put("state", v.state ?: JsonObject(emptyMap())); put("updatedAt", v.updatedAt) } })
}

fun objState(app: AppContext, key: String): LObjState? = decodeOrNull(app.repo.state.value.learner.activities[LangKeys.activityId(key)]?.state)

/** Confetti burst (website kit.ts celebrate). Call `Celebrate.fire()`; `ConfettiLayer()` draws it. */
object Celebrate {
    val tick = mutableIntStateOf(0)
    fun fire() { tick.intValue++ }
}

@Composable
fun BoxScope.ConfettiLayer() {
    val reduce = LocalReduceMotion.current
    val tick = Celebrate.tick.intValue
    if (tick == 0 || reduce) return
    val anim = remember(tick) { Animatable(0f) }
    val parts = remember(tick) { List(30) { Triple(Random.nextFloat(), Random.nextFloat() * 0.4f, it) } }
    LaunchedEffect(tick) { anim.snapTo(0f); anim.animateTo(1.4f, tween(1800, easing = LinearEasing)) }
    val colors = listOf(Color(0xFFE8998D), Color(0xFFF4D58D), Color(0xFFB5D99C), Color(0xFF8ECAE6), Color(0xFFB39CD0), Color(0xFFF2A7C3))
    if (anim.value >= 1.4f) return
    Canvas(Modifier.matchParentSize()) {
        parts.forEach { (x, d, i) ->
            val p = ((anim.value - d) / 1f).coerceIn(0f, 1f)
            if (p > 0f && p < 1f) drawRect(colors[i % colors.size], Offset(x * size.width, -20f + p * (size.height + 40f)), Size(14f, 22f))
        }
    }
}

// ---------------- screen frame ----------------

/**
 * Top bar for language screens: Back, Home (website Page header), a title in the course script, and actions.
 */
@Composable
fun LangBar(title: String, script: String = "en", subtitle: String? = null, subtitleScript: String = script, actions: @Composable RowScope.() -> Unit = {}) {
    val app = LocalApp.current
    val phone = LocalWindow.current.isPhone
    Surface(color = WL.colors.surface, shadowElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Row(
            Modifier.windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top + WindowInsetsSides.Horizontal))
                .defaultMinSize(minHeight = if (phone) 52.dp else 60.dp)
                .padding(horizontal = if (phone) 6.dp else 14.dp, vertical = 3.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(if (phone) 4.dp else 8.dp),
        ) {
            IconBtn(Icons.AutoMirrored.Rounded.ArrowBack, "Back", { app.back() }, size = 44.dp)
            IconBtn(Icons.Rounded.Home, "Home", { app.go(Routes.HOME) }, size = 44.dp)
            Column(Modifier.weight(1f).padding(start = 4.dp)) {
                if (subtitle != null) LT(subtitle, subtitleScript, style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, maxLines = 1)
                LT(title, script, style = MaterialTheme.typography.titleLarge, weight = FontWeight.Bold, maxLines = 2)
            }
            actions()
        }
    }
}

/** Full-screen frame (bar + body that fills the rest, inside safe insets) with the confetti layer. */
@Composable
fun LangFrame(bar: @Composable () -> Unit, content: @Composable () -> Unit) {
    Box(Modifier.fillMaxSize().background(WL.colors.bg)) {
        Column(Modifier.fillMaxSize()) {
            bar()
            Box(Modifier.weight(1f).fillMaxWidth().windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Bottom + WindowInsetsSides.Horizontal))) { content() }
        }
        ConfettiLayer()
    }
}

/** Website NotFound.tsx. */
@Composable
fun LangNotFound() {
    val app = LocalApp.current
    LangFrame({ LangBar("Not found") }) {
        Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) {
            EmojiImage("🙈", 96.dp)
            Text("We could not find that lesson.", style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
            WLButton("Back to Languages", { app.go("lang") }, kind = BtnKind.Primary)
        }
    }
}

/** Loading → content, or NotFound when the engine has no such item. */
@Composable
fun <T> LoadOr(state: Loadable<T>, content: @Composable (T) -> Unit) {
    when (state) {
        is Loadable.Loading -> Loading()
        is Loadable.Missing -> LangNotFound()
        is Loadable.Failed -> ErrorState(state.message)
        is Loadable.Ready -> content(state.value)
    }
}

sealed interface Loadable<out T> {
    data object Loading : Loadable<Nothing>
    data object Missing : Loadable<Nothing>
    data class Failed(val message: String) : Loadable<Nothing>
    data class Ready<T>(val value: T) : Loadable<T>
}

/** Engine call → Loadable (null result = Missing). Re-runs when the call arguments change. */
@Composable
inline fun <reified T> rememberEngine(fn: String, vararg args: Any?): Loadable<T> {
    val app = LocalApp.current
    val keys = listOf(fn) + args.toList()
    var s by remember(keys) { mutableStateOf<Loadable<T>>(Loadable.Loading) }
    LaunchedEffect(keys) {
        s = try {
            val r: JsonElement = app.engine.call(fn, *args)
            if (r is kotlinx.serialization.json.JsonNull) Loadable.Missing
            else Loadable.Ready(com.maheshglance.wonderlab.core.engine.AppJson.decodeFromJsonElement(kotlinx.serialization.serializer<T>(), r))
        } catch (e: Exception) { Loadable.Failed(e.message ?: "Something went wrong") }
    }
    return s
}

// ---------------- small widgets ----------------

/** Website kit Segmented. */
@Composable
fun <T> Segmented(value: T, options: List<Pair<T, String>>, onChange: (T) -> Unit, modifier: Modifier = Modifier, small: Boolean = true) {
    Row(modifier.clip(RoundedCornerShape(16.dp)).background(WL.colors.surface2).padding(3.dp), horizontalArrangement = Arrangement.spacedBy(3.dp)) {
        options.forEach { (v, label) ->
            val on = v == value
            Box(
                Modifier.weight(1f, fill = false).defaultMinSize(minHeight = if (small) 40.dp else 48.dp)
                    .clip(RoundedCornerShape(13.dp)).background(if (on) WL.colors.primary else Color.Transparent)
                    .pressable { onChange(v) }.padding(horizontal = 12.dp),
                contentAlignment = Alignment.Center,
            ) { FitText(label, color = if (on) WL.colors.primaryInk else WL.colors.text, style = MaterialTheme.typography.labelMedium, maxLines = 1) }
        }
    }
}

/** Key / tile button in the course script (website .lang-key / .lang-tile). */
@Composable
fun LKeyBtn(text: String, script: String, onClick: () -> Unit, modifier: Modifier = Modifier, selected: Boolean = false, enabled: Boolean = true, minSize: Dp = 44.dp, fontSize: TextUnit = TextUnit.Unspecified, label: String? = null) {
    val c = WL.colors
    Box(
        modifier.defaultMinSize(minWidth = minSize, minHeight = minSize).clip(RoundedCornerShape(12.dp))
            .background(if (selected) c.math else if (enabled) c.paper else c.surface2)
            .border(2.dp, if (selected) c.primary else c.line, RoundedCornerShape(12.dp))
            .pressable(enabled) { onClick() }
            .padding(horizontal = 8.dp, vertical = 2.dp),
        contentAlignment = Alignment.Center,
    ) {
        LT(text, script, style = MaterialTheme.typography.titleMedium, color = if (enabled) c.ink else c.muted, fontSize = fontSize, maxLines = 1, weight = FontWeight.Bold)
        if (label != null) Text(label, Modifier.align(Alignment.BottomEnd), style = MaterialTheme.typography.labelSmall, color = c.warn)
    }
}

/** Website kit ReportProblem: sends the lesson + question id (queued when offline). */
@Composable
fun ReportProblemButton(lessonId: String, questionId: String?) {
    val app = LocalApp.current
    val s by appState()
    var open by remember { mutableStateOf(false) }
    var text by remember { mutableStateOf("") }
    var sent by remember { mutableStateOf(false) }
    val profile = s.profile ?: return
    IconBtn(Icons.Rounded.Flag, t("reportProblem"), { open = true; sent = false; text = "" }, size = 40.dp, bg = Color.Transparent, tint = WL.colors.muted)
    if (open) AlertDialog(
        onDismissRequest = { open = false },
        title = { Text(t("reportProblem"), style = MaterialTheme.typography.titleLarge) },
        text = {
            if (sent) AlertBox("Thank you! We will look at it.", AlertKind.Good)
            else Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("We will send the lesson and question number. You don't need to type your name.", color = WL.colors.muted)
                OutlinedTextField(text, { text = it.take(500) }, label = { Text("What looks wrong? (optional)") }, minLines = 2, maxLines = 4, keyboardOptions = KeyboardOptions.Default)
            }
        },
        confirmButton = {
            if (sent) TextButton({ open = false }) { Text("Close") }
            else TextButton({
                app.repo.queueRequest("POST", "/p/${profile.id}/reports", buildJsonObject {
                    put("classLevel", profile.classLevel); put("lessonId", lessonId); questionId?.let { put("questionId", it) }; put("contentVersion", 1); put("description", text)
                })
                sent = true
            }) { Text("Send") }
        },
        dismissButton = { if (!sent) TextButton({ open = false }) { Text("Cancel") } },
        containerColor = WL.colors.surface,
    )
}

/** Correct / wrong tone (website kit Feedback plays one when it appears). */
fun feedbackTone(ok: Boolean) { if (ok) Tones.correct() else Tones.wrong() }

