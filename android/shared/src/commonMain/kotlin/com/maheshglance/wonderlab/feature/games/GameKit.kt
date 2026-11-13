package com.maheshglance.wonderlab.feature.games

import com.maheshglance.wonderlab.core.platform.*

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.data.Presentation
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.delay
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.longOrNull
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

// ------------------------------------------------------------------ JSON access (engine results)
fun JsonElement?.j(key: String): JsonElement? = (this as? JsonObject)?.get(key)
fun JsonElement?.str(): String? = (this as? JsonPrimitive)?.takeIf { it.isString }?.content
fun JsonElement?.int(): Int? = (this as? JsonPrimitive)?.let { it.intOrNull ?: it.doubleOrNull?.toInt() }
fun JsonElement?.long(): Long? = (this as? JsonPrimitive)?.let { it.longOrNull ?: it.doubleOrNull?.toLong() }
fun JsonElement?.dbl(): Double? = (this as? JsonPrimitive)?.doubleOrNull
fun JsonElement?.bool(): Boolean? = (this as? JsonPrimitive)?.booleanOrNull
fun JsonElement?.list(): List<JsonElement> = (this as? JsonArray) ?: emptyList()
fun JsonElement?.obj(): JsonObject = (this as? JsonObject) ?: JsonObject(emptyMap())
fun JsonElement?.ints(): List<Int> = list().map { it.int() ?: 0 }
fun JsonElement?.strs(): List<String> = list().mapNotNull { it.str() }
/** Localised text {en, te}. */
fun JsonElement?.loc(lang: String): String {
    val te = j("te").str()
    return if (lang == "te" && !te.isNullOrBlank()) te else j("en").str() ?: ""
}
fun JsonObject.with(vararg pairs: Pair<String, JsonElement>): JsonObject = JsonObject(this + pairs)
fun jsonOf(vararg pairs: Pair<String, Any?>): JsonObject = JsonObject(pairs.associate { (k, v) -> k to com.maheshglance.wonderlab.core.engine.Engine.toJson(v) })

/** The website's lab `fmt`: fixed decimals, trailing zeros removed, never "-0". */
fun fmtNum(n: Double, dp: Int = 2): String {
    if (!n.isFinite()) return n.toString()
    return plainNumber(n, dp)
}

/** "**bold**" markers → bold spans. */
fun boldMarkup(s: String): AnnotatedString = buildAnnotatedString {
    val parts = s.split("**")
    parts.forEachIndexed { i, p -> if (i % 2 == 1) withStyle(SpanStyle(fontWeight = FontWeight.ExtraBold)) { append(p) } else append(p) }
}

// ------------------------------------------------------------------ presentation (read-aloud, typing, tier)
/** The learner's presentation (same rules as the website's presentationFor, via the engine). */
@Composable
fun rememberPresentation(): Presentation {
    val app = LocalApp.current
    val s by appState()
    val lvl = s.profile?.classLevel ?: 6
    val band = s.profile?.ageBand ?: ""
    val fallback = remember(lvl, band) {
        val tier = if (lvl <= 2) "early" else if (lvl <= 5) "primary" else if (lvl <= 8) "middle" else "senior"
        val young = band == "3-4" || band == "5-6"
        Presentation(tier, tier == "early" || young, tier == "early" || young, tier != "early", lvl <= 5)
    }
    var pres by remember(lvl, band) { mutableStateOf(fallback) }
    LaunchedEffect(lvl, band) { runCatching { pres = app.engine.get<Presentation>("core.presentation", lvl, band) } }
    return pres
}

// ------------------------------------------------------------------ toasts + celebration (website's toast() / celebrate())
@Stable
class Notices {
    var toast by mutableStateOf<String?>(null)
    var toastN by mutableIntStateOf(0)
    var confetti by mutableIntStateOf(0)
    fun show(text: String) { toast = text; toastN++ }
    fun celebrate() { confetti++ }
}

@Composable
fun BoxScope.NoticeHost(n: Notices) {
    LaunchedEffect(n.toastN) { if (n.toast != null) { delay(3200); n.toast = null } }
    AnimatedVisibility(n.toast != null, enter = fadeIn() + slideInVertically { it }, exit = fadeOut() + slideOutVertically { it }, modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 84.dp, start = 16.dp, end = 16.dp)) {
        Row(
            Modifier.shadow(10.dp, RoundedCornerShape(18.dp)).clip(RoundedCornerShape(18.dp)).background(WL.colors.text).padding(horizontal = 18.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            EmojiText("⭐ " + (n.toast ?: ""), color = WL.colors.bg, style = MaterialTheme.typography.labelLarge)
        }
    }
    if (n.confetti > 0) Confetti(n.confetti)
}

private data class Bit(val x: Float, val vx: Float, val vy: Float, val spin: Float, val color: Color, val w: Float)

/** A short burst of confetti (skipped when the learner prefers reduced motion). */
@Composable
fun Confetti(key: Int) {
    if (LocalReduceMotion.current) return
    var t by remember(key) { mutableFloatStateOf(0f) }
    val bits = remember(key) {
        val cols = listOf(Color(0xFFF6C344), Color(0xFF5145CD), Color(0xFF2FA37A), Color(0xFFE5637A), Color(0xFF4AA8E0), Color(0xFFF08A3C))
        List(90) { Bit(Random.nextFloat(), (Random.nextFloat() - .5f) * .35f, -(.35f + Random.nextFloat() * .55f), Random.nextFloat() * 720f - 360f, cols[it % cols.size], 6f + Random.nextFloat() * 8f) }
    }
    LaunchedEffect(key) {
        val start = withFrameNanos { it }
        while (t < 2.4f) { withFrameNanos { now -> t = (now - start) / 1e9f } }
    }
    if (t >= 2.4f) return
    Canvas(Modifier.fillMaxSize()) {
        bits.forEach { b ->
            val x = (b.x + b.vx * t) * size.width
            val y = size.height * (1.02f + b.vy * t * 1.6f + 0.55f * t * t)
            rotate(b.spin * t, Offset(x, y)) { drawRect(b.color.copy(alpha = (1f - t / 2.4f).coerceIn(0f, 1f)), Offset(x - b.w / 2, y - b.w / 4), Size(b.w, b.w / 2)) }
        }
    }
}

// ------------------------------------------------------------------ small controls
/** Segmented control (website's <Segmented>), compact enough for phone headers. */
@Composable
fun <T> Segmented(options: List<Pair<T, String>>, value: T, onChange: (T) -> Unit, modifier: Modifier = Modifier, small: Boolean = true, enabled: Boolean = true) {
    val c = WL.colors
    Row(modifier.clip(RoundedCornerShape(14.dp)).background(c.surface2).padding(3.dp), horizontalArrangement = Arrangement.spacedBy(3.dp)) {
        options.forEach { (v, label) ->
            val on = v == value
            Box(
                Modifier.defaultMinSize(minHeight = if (small) 38.dp else 46.dp).clip(RoundedCornerShape(11.dp))
                    .background(if (on) c.surface else Color.Transparent)
                    .then(if (on) Modifier.border(2.dp, c.primary, RoundedCornerShape(11.dp)) else Modifier)
                    .semantics { selected = on }
                    .pressable(enabled, role = Role.Tab) { if (!on) onChange(v) }
                    .padding(horizontal = if (small) 10.dp else 14.dp, vertical = 6.dp),
                contentAlignment = Alignment.Center,
            ) { FitText(label, style = MaterialTheme.typography.labelMedium, color = if (on) c.primary else c.muted, maxLines = 1) }
        }
    }
}

/** Compact pill with an emoji picture. */
@Composable
fun EmojiPill(emoji: String, text: String, modifier: Modifier = Modifier, bg: Color = WL.colors.surface2, fg: Color = WL.colors.text) {
    Row(modifier.clip(RoundedCornerShape(999.dp)).background(bg).padding(horizontal = 10.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        EmojiText("$emoji $text", style = MaterialTheme.typography.labelSmall, color = fg, maxLines = 1)
    }
}

/** A chunky button that can hold any content (used for hop buttons, palette numbers, options). */
@Composable
fun KeyButton(onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, bg: Color = WL.colors.surface, border: Color = Color.Transparent, minSize: Dp = 48.dp, role: Role = Role.Button, content: @Composable RowScope.() -> Unit) {
    Row(
        modifier.defaultMinSize(minWidth = minSize, minHeight = minSize)
            .shadow(if (enabled) 3.dp else 0.dp, RoundedCornerShape(14.dp), clip = false)
            .clip(RoundedCornerShape(14.dp)).background(if (enabled) bg else bg.copy(alpha = .45f))
            .border(2.5.dp, border, RoundedCornerShape(14.dp))
            .pressable(enabled, role = role, onClick = onClick).padding(horizontal = 8.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically, content = content,
    )
}

@Composable
fun IconLabel(icon: ImageVector, text: String, color: Color = WL.colors.text, modifier: Modifier = Modifier) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Icon(icon, null, tint = color, modifier = Modifier.size(18.dp))
        Text(text, color = color, style = MaterialTheme.typography.labelMedium, textAlign = TextAlign.Start)
    }
}

/** Point on a circle (degrees, y up → screen y down). */
fun polar(cx: Float, cy: Float, r: Float, deg: Double) = Offset(cx + r * cos(deg * PI / 180).toFloat(), cy - r * sin(deg * PI / 180).toFloat())
