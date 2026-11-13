package com.maheshglance.wonderlab.feature.lesson

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.MenuBook
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.Stop
import androidx.compose.material.icons.rounded.VolumeOff
import androidx.compose.material.icons.rounded.VolumeUp
import androidx.compose.material.icons.rounded.ExpandLess
import androidx.compose.material.icons.rounded.ExpandMore
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.data.Presentation
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.FitToScreen
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.SmallShape
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.t
import kotlinx.coroutines.delay
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

// ---------------------------------------------------------------- presentation (tier, read-aloud) for the learner

@Composable
fun rememberPresentation(level: Int, band: String): Presentation? {
    val app = LocalApp.current
    val p by produceState<Presentation?>(PRES_CACHE["$level|$band"], level, band) {
        if (value == null) value = runCatching { app.engine.get<Presentation>("core.presentation", level, band) }.getOrNull()?.also { PRES_CACHE["$level|$band"] = it } ?: Presentation()
    }
    return p
}
private val PRES_CACHE = mutableMapOf<String, Presentation>()

// ---------------------------------------------------------------- narration (website NarrationControls)

@Composable
fun Narration(text: Localized, size: Dp = 44.dp) {
    val app = LocalApp.current
    val lang = WL.lang
    val speaking by app.speech.speaking.collectAsState()
    val s by app.repo.state.collectAsState()
    val mute = s.prefs.mute
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
        IconBtn(Icons.Rounded.VolumeUp, t("listen"), { app.say(text, lang) }, tint = WL.colors.mathInk, bg = WL.colors.math, size = size)
        if (speaking) IconBtn(Icons.Rounded.Stop, t("stop"), { app.speech.stop() }, size = size)
        IconBtn(if (mute) Icons.Rounded.VolumeOff else Icons.Rounded.VolumeUp, if (mute) t("unmute") else t("mute"), {
            app.repo.updatePrefs(mapOf("mute" to JsonPrimitive(!mute)))
        }, size = size * 0.82f, bg = Color.Transparent, tint = WL.colors.muted)
    }
}

// ---------------------------------------------------------------- learn / practice / test switch

@Composable
fun ModeTabs(mode: String, onChange: (String) -> Unit, modifier: Modifier = Modifier, compact: Boolean = false) {
    val c = WL.colors
    val modeLabel = ls("lessonMode")
    Row(modifier.clip(RoundedCornerShape(999.dp)).background(c.surface2).padding(4.dp).semantics { contentDescription = modeLabel }, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        listOf(Triple("learn", "📖", t("learn")), Triple("practice", "💡", t("practice")), Triple("test", "🏆", t("test"))).forEach { (m, e, label) ->
            val on = m == mode
            Row(
                Modifier.weight(1f, fill = !compact).heightIn(min = 44.dp).clip(RoundedCornerShape(999.dp)).background(if (on) c.surface else Color.Transparent)
                    .pressable { onChange(m) }.semantics { selected = on; role = Role.Tab }.padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically,
            ) {
                EmojiImage(e, 22.dp)
                Text(label, style = MaterialTheme.typography.labelLarge, color = if (on) c.mathInk else c.muted, maxLines = 1)
            }
        }
    }
}

// ---------------------------------------------------------------- instruction blocks (Learn mode)

@Composable
fun Blocks(blocks: List<JsonObject>, visualSize: Dp, modifier: Modifier = Modifier) {
    val app = LocalApp.current
    Column(modifier, verticalArrangement = Arrangement.spacedBy(10.dp)) {
        blocks.forEach { b ->
            when (b.str("type")) {
                "text" -> EmojiText(L(b.loc("text")), style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                "formula" -> Box(Modifier.fillMaxWidth().clip(SmallShape).background(WL.colors.math).padding(horizontal = 14.dp, vertical = 10.dp).semantics { contentDescription = b.str("say") ?: b.str("tex") ?: "" }, contentAlignment = Alignment.Center) {
                    Text(b.str("tex") ?: "", style = MaterialTheme.typography.headlineSmall.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold), color = WL.colors.mathInk, textAlign = TextAlign.Center)
                }
                "visual" -> b.obj("visual")?.let { vis ->
                    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) { val alt = L(b.loc("alt")); Visual(vis, visualSize, Modifier.semantics { contentDescription = alt }) }
                }
                "steps" -> Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    b.locList("steps").forEachIndexed { i, s -> NumberedLine(i + 1, L(s)) }
                }
                "tip" -> Row(Modifier.fillMaxWidth().clip(SmallShape).background(WL.colors.warnBg).padding(12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    EmojiImage("💡", 28.dp)
                    EmojiText(L(b.loc("tip") ?: b.loc("text")), style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = WL.colors.text)
                }
                "activity" -> b.str("path")?.let { path -> ActivityButton(b.str("activityId") ?: "", L(b.loc("label")), path) { app.go(path) } }
            }
        }
    }
}

@Composable
fun NumberedLine(n: Int, text: String, done: Boolean = false) {
    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.Top) {
        Box(Modifier.size(28.dp).clip(CircleShape).background(if (done) WL.colors.good else WL.colors.math), contentAlignment = Alignment.Center) {
            Text("$n", style = MaterialTheme.typography.labelLarge, color = if (done) Color.White else WL.colors.mathInk)
        }
        EmojiText(text, Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
    }
}

@Composable
fun ActivityButton(id: String, label: String, path: String, onClick: () -> Unit) {
    val emoji = when { id.startsWith("lab") -> "🔬"; id.startsWith("art") -> "🎨"; else -> "🧩" }
    Row(
        Modifier.clip(RoundedCornerShape(16.dp)).background(WL.colors.lab).pressable(onClick = onClick).padding(horizontal = 14.dp, vertical = 10.dp).semantics { contentDescription = "$label ($path)" },
        horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically,
    ) {
        EmojiImage(emoji, 26.dp)
        Text(label, style = MaterialTheme.typography.labelLarge, color = WL.colors.labInk)
    }
}

/** "Try it out" — linked activities (games / lab / art) for this objective. */
@Composable
fun ActivityLinks(acts: List<LActivity>, modifier: Modifier = Modifier) {
    if (acts.isEmpty()) return
    val app = LocalApp.current
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) { EmojiImage("✨", 22.dp); Text(ls("linkedActivities"), style = MaterialTheme.typography.titleMedium, color = WL.colors.text) }
        FlowButtons { acts.forEach { a -> ActivityButton(a.id, L(a.label), a.path) { app.go(a.path) } } }
    }
}

@OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
fun FlowButtons(content: @Composable () -> Unit) =
    androidx.compose.foundation.layout.FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) { content() }

// ---------------------------------------------------------------- worked solution

@Composable
fun SolutionView(q: LQuestion, startOpen: Boolean) {
    if (q.solution.isEmpty()) return
    var open by rememberSaveable(q.id) { mutableStateOf(startOpen) }
    Column(Modifier.fillMaxWidth().clip(SmallShape).background(WL.colors.surface2).padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(Modifier.fillMaxWidth().clip(SmallShape).pressable { open = !open }, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(Icons.AutoMirrored.Rounded.MenuBook, null, tint = WL.colors.mathInk)
            Text(ls("howToSolve"), style = MaterialTheme.typography.titleMedium, color = WL.colors.text, modifier = Modifier.weight(1f))
            Icon(if (open) Icons.Rounded.ExpandLess else Icons.Rounded.ExpandMore, null, tint = WL.colors.muted)
        }
        AnimatedVisibility(open, enter = fadeIn() + expandVertically()) {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) { q.solution.forEachIndexed { i, s -> NumberedLine(i + 1, L(s)) } }
        }
    }
}

/** "Your answer / Correct answer" comparison after a wrong answer. */
@Composable
fun Compare(yours: String, correct: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf(ls("yourAnswer") to (yours.ifBlank { ls("noAnswer") }), ls("correctAnswer") to correct).forEachIndexed { i, (h, v) ->
            Column(Modifier.weight(1f).clip(SmallShape).background(if (i == 0) WL.colors.badBg else WL.colors.goodBg).padding(10.dp)) {
                Text(h, style = MaterialTheme.typography.labelMedium, color = WL.colors.muted)
                EmojiText(v, style = MaterialTheme.typography.titleMedium, color = if (i == 0) WL.colors.bad else WL.colors.good)
            }
        }
    }
}

// ---------------------------------------------------------------- one-screen question layout

/**
 * Prompt + answer on ONE screen: side by side when there is width (tablet, landscape), stacked otherwise; each part
 * scales down (never scrolls) when it would not fit. `actions` is a fixed bar at the bottom.
 */
@Composable
fun QuestionLayout(
    modifier: Modifier = Modifier,
    prompt: @Composable ColumnScope.(visual: Dp, w: Dp) -> Unit,
    answer: @Composable ColumnScope.(Room) -> Unit,
    actions: (@Composable RowScope.() -> Unit)? = null,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        BoxWithConstraints(Modifier.weight(1f).fillMaxWidth()) {
            val w = maxWidth; val h = maxHeight
            val wide = w >= 560.dp && w > h * 1.15f
            if (wide) {
                Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    val pw = (w - 16.dp) * 0.48f; val aw = w - 16.dp - pw
                    WLCard(Modifier.width(pw).fillMaxSize(), padding = 14.dp) {
                        FitToScreen(Modifier.fillMaxSize(), minScale = 0.4f) {
                            Column(Modifier.width(pw - 28.dp), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                prompt(minOf((pw - 40.dp).value, (h * 0.62f).value).dp, pw - 28.dp)
                            }
                        }
                    }
                    FitToScreen(Modifier.width(aw).fillMaxSize(), minScale = 0.4f) {
                        Column(Modifier.width(aw), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            answer(Room(aw, h * 0.9f, wide = true))
                        }
                    }
                }
            } else {
                WLCard(Modifier.fillMaxSize(), padding = 12.dp) {
                    FitToScreen(Modifier.fillMaxSize(), minScale = 0.4f, alignTop = true) {
                        Column(Modifier.width(w - 24.dp), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            prompt(minOf((w * 0.72f).value, (h * 0.3f).value).coerceAtLeast(110f).dp, w - 24.dp)
                            answer(Room(w - 24.dp, h * 0.5f, wide = false))
                        }
                    }
                }
            }
        }
        if (actions != null) Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.End), verticalAlignment = Alignment.CenterVertically, content = actions)
    }
}

/** The question's prompt, read-aloud and picture (website QuestionPrompt). */
@Composable
fun QuestionPrompt(v: QView, autoRead: Boolean, tier: String, visual: Dp, w: Dp, compact: Boolean = false) {
    val app = LocalApp.current
    val lang = WL.lang
    val q = v.q
    val say = q.say ?: q.prompt
    val read = autoRead || (!compact && q.type == "spoken" && (tier == "early" || tier == "primary"))
    LaunchedEffect(q.id, read) { if (read) app.say(say, lang) }
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        EmojiText(L(q.prompt), Modifier.weight(1f), style = if (compact) MaterialTheme.typography.titleMedium else MaterialTheme.typography.headlineSmall, color = WL.colors.text, emojiScale = 1.5f)
        if (!compact) Narration(say)
    }
    q.unitHint?.let { Text("ⓘ $it", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted) }
    val vis = q.visual
    if (vis != null && !(v.kind == "count" && vis.str("kind") == "objects")) {
        if (q.type == "count" && vis.str("kind") == "objects" && !compact) CountObjects(vis, Room(w, visual, w > 480.dp), 0, q.id + ":help", false) { }
        else Visual(vis, if (compact) visual * 0.6f else visual, animate = !compact)
    }
}

// ---------------------------------------------------------------- celebration

@Composable
fun Confetti(trigger: Int) {
    if (trigger == 0 || LocalReduceMotion.current) return
    val p = remember(trigger) { Animatable(0f) }
    var show by remember(trigger) { mutableStateOf(true) }
    LaunchedEffect(trigger) { p.animateTo(1f, tween(2200, easing = LinearEasing)); delay(100); show = false }
    if (!show) return
    val pieces = remember(trigger) { List(70) { Triple(Random.nextFloat(), Random.nextFloat() * 0.6f + 0.4f, Random.nextFloat() * 360f) } }
    val colors = listOf(Color(0xFF8B7CF6), Color(0xFFF59E0B), Color(0xFF22C55E), Color(0xFFEC4899), Color(0xFF3B82F6), Color(0xFFEF4444))
    Canvas(Modifier.fillMaxSize()) {
        pieces.forEachIndexed { i, (x0, speed, rot) ->
            val t = p.value
            val x = (x0 + 0.05f * sin((t * 10 + i).toDouble()).toFloat()) * size.width
            val y = (-0.1f + t * speed * 1.4f) * size.height
            rotate(rot + t * 720f * speed, Offset(x, y)) {
                drawRect(colors[i % colors.size].copy(alpha = (1.2f - t).coerceIn(0f, 1f)), Offset(x - 6f, y - 3f), Size(12f + 4f * cos(i.toFloat()), 7f))
            }
        }
    }
}

// ---------------------------------------------------------------- report a problem (website ReportProblem)

@Composable
fun ReportProblemButton(lessonId: String?, questionId: String?, contentVersion: Int?, size: Dp = 44.dp) {
    val app = LocalApp.current
    val s by app.repo.state.collectAsState()
    val profile = s.profile ?: return
    var open by remember { mutableStateOf(false) }
    var sent by remember { mutableStateOf(false) }
    var text by remember { mutableStateOf("") }
    IconBtn(Icons.Rounded.Flag, t("reportProblem"), { open = true; sent = false }, size = size, bg = Color.Transparent, tint = WL.colors.muted)
    if (open) Dialog(onDismissRequest = { open = false }) {
        WLCard(padding = 20.dp) {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(t("reportProblem"), style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
                if (sent) AlertBox(ls("reportSent"), AlertKind.Good)
                else {
                    Text(ls("reportBody"), style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                    Text(ls("reportField"), style = MaterialTheme.typography.labelMedium, color = WL.colors.text)
                    BasicTextField(
                        text, { text = it.take(500) },
                        Modifier.fillMaxWidth().heightIn(min = 90.dp).clip(SmallShape).background(WL.colors.surface2).padding(12.dp),
                        textStyle = MaterialTheme.typography.bodyLarge.copy(color = WL.colors.text), cursorBrush = SolidColor(WL.colors.primary),
                    )
                    WLButton(ls("send"), {
                        app.repo.queueRequest("POST", "/p/${profile.id}/reports", buildJsonObject {
                            put("classLevel", profile.classLevel)
                            lessonId?.let { put("lessonId", it) }
                            questionId?.let { put("questionId", it) }
                            contentVersion?.let { put("contentVersion", it) }
                            put("description", text)
                        })
                        sent = true; text = ""
                    }, kind = BtnKind.Primary, modifier = Modifier.fillMaxWidth())
                }
                WLButton(t("close"), { open = false }, kind = BtnKind.Ghost, modifier = Modifier.align(Alignment.End))
            }
        }
    }
}

@Composable
fun HintBox(n: Int, text: String) {
    Row(Modifier.fillMaxWidth().clip(SmallShape).background(WL.colors.math).padding(10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Rounded.Lightbulb, null, tint = WL.colors.mathInk)
        EmojiText("${ls("hintN", "n" to n)}: $text", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = WL.colors.mathInk)
    }
}

@Composable
fun SmallMeterRow(label: String, progress: Float, modifier: Modifier = Modifier) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        FitText(label, style = MaterialTheme.typography.labelMedium, color = WL.colors.muted, maxLines = 1)
        Box(Modifier.weight(1f).height(10.dp).clip(RoundedCornerShape(5.dp)).background(WL.colors.surface2)) {
            Box(Modifier.fillMaxWidth(progress.coerceIn(0f, 1f)).height(10.dp).clip(RoundedCornerShape(5.dp)).background(WL.colors.primary))
        }
    }
}

@Suppress("unused") private val unusedW = Modifier.widthIn(0.dp).padding(0.dp)
@Suppress("unused") private val unusedSp = 0.sp
