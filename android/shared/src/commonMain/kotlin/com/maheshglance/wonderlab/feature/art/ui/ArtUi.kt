package com.maheshglance.wonderlab.feature.art.ui

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.data.Presentation
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.delay
import kotlin.math.PI
import kotlin.math.sin
import kotlin.random.Random

/** The active learner's presentation (tier, read-aloud, typing allowed) — same rules as the website. */
@Composable
fun rememberPresentation(): Presentation {
    val app = LocalApp.current
    val s by appState()
    val p = s.profile
    val v by produceState(Presentation(tier = WL.tier.tier), p?.classLevel, p?.ageBand) {
        if (p != null) runCatching { value = app.engine.get<Presentation>("core.presentation", p.classLevel, p.ageBand) }
    }
    return v
}

/** Transient status line (the website's toast / art-msg live region). */
class Toaster { val text: MutableState<String?> = mutableStateOf(null); var seq by mutableStateOf(0); fun show(t: String) { text.value = t; seq++ } }

@Composable
fun rememberToaster() = remember { Toaster() }

@Composable
fun BoxScope.ToastHost(t: Toaster, modifier: Modifier = Modifier) {
    LaunchedEffect(t.seq) { if (t.text.value != null) { delay(4500); t.text.value = null } }
    AnimatedVisibility(t.text.value != null, enter = fadeIn(), exit = fadeOut(), modifier = modifier.align(Alignment.TopCenter).padding(top = 10.dp, start = 16.dp, end = 16.dp)) {
        Box(
            Modifier.widthIn(max = 520.dp).clip(RoundedCornerShape(16.dp)).background(WL.colors.text.copy(alpha = 0.88f)).padding(horizontal = 16.dp, vertical = 10.dp)
                .semantics { liveRegion = LiveRegionMode.Polite },
        ) { Text(t.text.value ?: "", color = WL.colors.surface, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), textAlign = TextAlign.Center) }
    }
}

/** A burst of confetti + the completion jingle (the website's celebrate()). */
class Celebration { var key by mutableStateOf(0); fun fire() { key++; Tones.complete() } }

@Composable
fun rememberCelebration() = remember { Celebration() }

@Composable
fun BoxScope.CelebrationHost(c: Celebration) {
    if (c.key == 0 || LocalReduceMotion.current) return
    var t by remember(c.key) { mutableStateOf(0f) }
    LaunchedEffect(c.key) {
        val start = withFrameNanos { it }
        while (t < 1f) { withFrameNanos { now -> t = ((now - start) / 2_200_000_000f).coerceAtMost(1f) } }
    }
    if (t >= 1f) return
    val pieces = remember(c.key) { List(70) { floatArrayOf(Random.nextFloat(), Random.nextFloat() * 0.3f, Random.nextFloat() * 360f, Random.nextInt(6).toFloat(), 0.6f + Random.nextFloat()) } }
    val colors = listOf(Color(0xFFE53935), Color(0xFFFDD835), Color(0xFF43A047), Color(0xFF1E88E5), Color(0xFF8E24AA), Color(0xFFFB8C00))
    Canvas(Modifier.matchParentSize()) {
        pieces.forEach { p ->
            val x = p[0] * size.width + sin((t * 6 + p[0] * 10) * PI.toFloat()) * 20f
            val y = (p[1] + t * p[4] * 1.3f) * size.height - size.height * 0.1f
            rotate(p[2] + t * 720f, Offset(x, y)) { drawRect(colors[p[3].toInt()], Offset(x - 6f, y - 10f), Size(12f, 20f), alpha = 1f - t * 0.6f) }
        }
    }
}

/** Segmented choice (the website's Segmented control). */
@Composable
fun <T> Segmented(options: List<Pair<T, String>>, value: T, onChange: (T) -> Unit, modifier: Modifier = Modifier) {
    val c = WL.colors
    Row(modifier.clip(RoundedCornerShape(14.dp)).background(c.surface2).padding(3.dp), horizontalArrangement = Arrangement.spacedBy(3.dp)) {
        options.forEach { (v, label) ->
            val on = v == value
            Box(
                Modifier.weight(1f).defaultMinSize(minHeight = 40.dp).clip(RoundedCornerShape(11.dp)).background(if (on) c.surface else Color.Transparent)
                    .then(if (on) Modifier.border(2.dp, c.primary, RoundedCornerShape(11.dp)) else Modifier)
                    .semantics { selected = on }
                    .pressable(role = Role.Tab) { onChange(v) }.padding(horizontal = 6.dp, vertical = 6.dp),
                contentAlignment = Alignment.Center,
            ) { FitText(label, style = MaterialTheme.typography.labelMedium, color = if (on) c.text else c.muted, textAlign = TextAlign.Center, maxLines = 2) }
        }
    }
}

@Composable
fun LabeledSlider(label: String, valueText: String, value: Float, range: ClosedFloatingPointRange<Float>, onChange: (Float) -> Unit, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth()) {
            Text(label, style = MaterialTheme.typography.labelMedium, color = WL.colors.text, modifier = Modifier.weight(1f))
            Text(valueText, style = MaterialTheme.typography.labelMedium, color = WL.colors.muted)
        }
        Slider(value, onChange, valueRange = range, colors = SliderDefaults.colors(thumbColor = WL.colors.primary, activeTrackColor = WL.colors.primary))
    }
}

@Composable
fun SubTitle(text: String) = Text(text, style = MaterialTheme.typography.labelLarge, color = WL.colors.muted, modifier = Modifier.padding(top = 4.dp, bottom = 2.dp))

/** Modal card dialog in the app's style. */
@Composable
fun ArtDialog(title: String, onDismiss: () -> Unit, wide: Boolean = false, content: @Composable ColumnScope.() -> Unit) {
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Column(
            Modifier.padding(20.dp).widthIn(max = if (wide) 640.dp else 460.dp).fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(WL.colors.surface).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
            content()
        }
    }
}

@Composable
fun FullBox(content: @Composable BoxScope.() -> Unit) = Box(Modifier.fillMaxSize(), content = content)
