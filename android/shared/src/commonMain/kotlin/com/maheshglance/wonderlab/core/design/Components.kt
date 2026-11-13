package com.maheshglance.wonderlab.core.design

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.ErrorOutline
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.VolumeUp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.audio.Tones

val CardShape = RoundedCornerShape(22.dp)
val SmallShape = RoundedCornerShape(14.dp)
val ButtonShape = RoundedCornerShape(16.dp)

/** Press feedback shared by all tappable surfaces: gentle scale + haptic + tap tone. */
@Composable
fun Modifier.pressable(enabled: Boolean = true, role: Role = Role.Button, sound: Boolean = true, onClick: () -> Unit): Modifier {
    val src = remember { MutableInteractionSource() }
    val pressed by src.collectIsPressedAsState()
    val reduce = LocalReduceMotion.current
    val s by animateFloatAsState(if (pressed && !reduce) 0.96f else 1f, Motion.press(), label = "press")
    val haptic = LocalHapticFeedback.current
    return this.scale(s).clickable(src, indication = androidx.compose.material3.ripple(), enabled = enabled, role = role) {
        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
        if (sound) Tones.tap()
        onClick()
    }
}

enum class BtnKind { Normal, Primary, Danger, Ghost }

@Composable
fun WLButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    kind: BtnKind = BtnKind.Normal,
    icon: ImageVector? = null,
    enabled: Boolean = true,
    small: Boolean = false,
    loading: Boolean = false,
) {
    val c = WL.colors
    val (bg, fg) = when (kind) {
        BtnKind.Primary -> c.primary to c.primaryInk
        BtnKind.Danger -> c.badBg to c.bad
        BtnKind.Ghost -> Color.Transparent to c.text
        BtnKind.Normal -> c.surface2 to c.text
    }
    val h = if (small) 44.dp else WL.tier.target
    Row(
        modifier
            .defaultMinSize(minHeight = h, minWidth = h)
            .then(if (kind != BtnKind.Ghost) Modifier.shadow(if (enabled) 3.dp else 0.dp, ButtonShape, clip = false) else Modifier)
            .clip(ButtonShape)
            .background(if (enabled) bg else bg.copy(alpha = 0.5f))
            .pressable(enabled && !loading, onClick = onClick)
            .padding(horizontal = if (small) 12.dp else 18.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (loading) CircularProgressIndicator(Modifier.size(20.dp), color = fg, strokeWidth = 2.5.dp)
        else if (icon != null) Icon(icon, null, tint = fg.copy(alpha = if (enabled) 1f else .6f), modifier = Modifier.size(if (small) 20.dp else 24.dp))
        if (text.isNotEmpty()) Text(text, color = fg.copy(alpha = if (enabled) 1f else .6f), style = if (small) MaterialTheme.typography.labelMedium else MaterialTheme.typography.labelLarge, textAlign = TextAlign.Center)
    }
}

@Composable
fun IconBtn(icon: ImageVector, label: String, onClick: () -> Unit, modifier: Modifier = Modifier, tint: Color = WL.colors.text, bg: Color = WL.colors.surface2, size: Dp = 48.dp, enabled: Boolean = true) {
    Box(
        modifier.size(size).clip(CircleShape).background(bg).pressable(enabled, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) { Icon(icon, contentDescription = label, tint = tint.copy(alpha = if (enabled) 1f else .4f), modifier = Modifier.size(size * 0.5f)) }
}

@Composable
fun WLCard(modifier: Modifier = Modifier, color: Color = WL.colors.surface, padding: Dp = 18.dp, flat: Boolean = false, content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier
            .then(if (flat) Modifier.border(1.dp, WL.colors.line, CardShape) else Modifier.shadow(6.dp, CardShape, clip = false, ambientColor = Color(0x331D2540), spotColor = Color(0x331D2540)))
            .clip(CardShape).background(color).padding(padding),
        content = content,
    )
}

/** Home / menu tile: 3D picture + title + subtitle, coloured by area. Fills the cell it is given. */
@Composable
fun Tile(
    title: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    emoji: String? = null,
    icon: ImageVector? = null,
    subtitle: String? = null,
    color: Color = WL.colors.surface,
    ink: Color = WL.colors.text,
    centered: Boolean = WL.tier.tier == "early",
    badge: String? = null,
) {
    BoxWithConstraintsTile(modifier, color, onClick) { w, h ->
        val pic = (minOf(w.value, h.value) * if (centered) 0.42f else 0.30f).coerceIn(36f, 120f).dp
        Column(
            Modifier.fillMaxSize().padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp, if (centered) Alignment.CenterVertically else Alignment.Top),
            horizontalAlignment = if (centered) Alignment.CenterHorizontally else Alignment.Start,
        ) {
            if (emoji != null) EmojiImage(emoji, pic)
            else if (icon != null) Box(Modifier.size(pic).clip(RoundedCornerShape(18.dp)).background(WL.colors.surface), contentAlignment = Alignment.Center) { Icon(icon, null, tint = ink, modifier = Modifier.size(pic * 0.55f)) }
            // titles wrap between words and shrink to fit the tile — never cut off with "…"
            androidx.compose.foundation.text.BasicText(
                title,
                style = MaterialTheme.typography.titleMedium.copy(color = ink, textAlign = if (centered) TextAlign.Center else TextAlign.Start, lineHeight = androidx.compose.ui.unit.TextUnit(1.12f, androidx.compose.ui.unit.TextUnitType.Em)),
                maxLines = 2,
                autoSize = androidx.compose.foundation.text.TextAutoSize.StepBased(minFontSize = androidx.compose.ui.unit.TextUnit(11f, androidx.compose.ui.unit.TextUnitType.Sp), maxFontSize = MaterialTheme.typography.titleMedium.fontSize),
                modifier = Modifier.fillMaxWidth(),
            )
            if (subtitle != null && h > 120.dp) FitText(subtitle, style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, textAlign = if (centered) TextAlign.Center else TextAlign.Start, maxLines = 2)
        }
        if (badge != null) Box(Modifier.align(Alignment.TopEnd).padding(8.dp).clip(RoundedCornerShape(999.dp)).background(WL.colors.primary).padding(horizontal = 8.dp, vertical = 2.dp)) {
            Text(badge, color = WL.colors.primaryInk, style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
private fun BoxWithConstraintsTile(modifier: Modifier, color: Color, onClick: () -> Unit, content: @Composable androidx.compose.foundation.layout.BoxScope.(Dp, Dp) -> Unit) {
    androidx.compose.foundation.layout.BoxWithConstraints(
        modifier
            .shadow(6.dp, CardShape, clip = false, ambientColor = Color(0x331D2540), spotColor = Color(0x331D2540))
            .clip(CardShape).background(color).pressable(onClick = onClick),
    ) { content(maxWidth, maxHeight) }
}

/** Answer choice card (MCQ, picture choices). `state`: null | "selected" | "right" | "wrong". */
@Composable
fun ChoiceCard(onClick: () -> Unit, modifier: Modifier = Modifier, state: String? = null, enabled: Boolean = true, content: @Composable ColumnScope.() -> Unit) {
    val c = WL.colors
    val (bg, border) = when (state) {
        "right" -> c.goodBg to c.good
        "wrong" -> c.badBg to c.bad
        "selected" -> c.surface to c.primary
        else -> c.surface to Color.Transparent
    }
    Column(
        modifier
            .defaultMinSize(minHeight = maxOf(WL.tier.target, 64.dp))
            .shadow(5.dp, RoundedCornerShape(18.dp), clip = false)
            .clip(RoundedCornerShape(18.dp))
            .background(bg)
            .border(BorderStroke(3.dp, border), RoundedCornerShape(18.dp))
            .pressable(enabled, onClick = onClick)
            .padding(10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        content = content,
    )
}

@Composable
fun Pill(text: String, modifier: Modifier = Modifier, bg: Color = WL.colors.surface2, fg: Color = WL.colors.text, icon: ImageVector? = null) {
    Row(modifier.clip(RoundedCornerShape(999.dp)).background(bg).padding(horizontal = 12.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        if (icon != null) Icon(icon, null, tint = fg, modifier = Modifier.size(16.dp))
        Text(text, color = fg, style = MaterialTheme.typography.labelSmall)
    }
}

@Composable
fun Meter(progress: Float, modifier: Modifier = Modifier, color: Color = WL.colors.primary) {
    LinearProgressIndicator(progress = { progress.coerceIn(0f, 1f) }, modifier.fillMaxWidth().height(12.dp).clip(RoundedCornerShape(6.dp)), color = color, trackColor = WL.colors.surface2, drawStopIndicator = {})
}

enum class AlertKind { Info, Good, Bad, Warn }

@Composable
fun AlertBox(text: String, kind: AlertKind = AlertKind.Info, modifier: Modifier = Modifier) {
    val c = WL.colors
    val (bg, fg, ic) = when (kind) {
        AlertKind.Good -> Triple(c.goodBg, c.good, Icons.Rounded.CheckCircle)
        AlertKind.Bad -> Triple(c.badBg, c.bad, Icons.Rounded.ErrorOutline)
        AlertKind.Warn -> Triple(c.warnBg, c.warn, Icons.Rounded.Info)
        AlertKind.Info -> Triple(c.math, c.mathInk, Icons.Rounded.Info)
    }
    Row(modifier.fillMaxWidth().clip(SmallShape).background(bg).padding(12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Icon(ic, null, tint = fg)
        EmojiText(text, color = fg, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold))
    }
}

/** Animated feedback after checking an answer. */
@Composable
fun Feedback(visible: Boolean, good: Boolean, text: String, modifier: Modifier = Modifier) {
    AnimatedVisibility(visible, enter = fadeIn() + slideInVertically { it / 3 }, modifier = modifier) {
        AlertBox(text, if (good) AlertKind.Good else AlertKind.Bad)
    }
}

@Composable
fun Loading(modifier: Modifier = Modifier, text: String = "Loading…") {
    Column(modifier.fillMaxSize(), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        CircularProgressIndicator(color = WL.colors.primary)
        Spacer(Modifier.height(12.dp))
        Text(text, color = WL.colors.muted, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
fun ErrorState(message: String, onRetry: (() -> Unit)? = null, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) {
        EmojiImage("🙈", 96.dp)
        Text(message, textAlign = TextAlign.Center, style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
        if (onRetry != null) WLButton("Try again", onRetry, kind = BtnKind.Primary)
    }
}

/**
 * App top bar (compact on phones). Back on the left, title (wraps, never cut), actions on the right.
 * Draws behind the status bar with its own padding so content never sits under system UI.
 */
@Composable
fun TopBar(title: String, onBack: (() -> Unit)? = null, modifier: Modifier = Modifier, subtitle: String? = null, actions: @Composable RowScope.() -> Unit = {}) {
    val phone = LocalWindow.current.isPhone
    Surface(color = WL.colors.surface, shadowElevation = 1.dp, modifier = modifier.fillMaxWidth()) {
        Row(
            Modifier.windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top + WindowInsetsSides.Horizontal))
                .defaultMinSize(minHeight = if (phone) 56.dp else 64.dp)
                .padding(horizontal = if (phone) 8.dp else 16.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(if (phone) 6.dp else 10.dp),
        ) {
            if (onBack != null) IconBtn(Icons.AutoMirrored.Rounded.ArrowBack, "Back", onBack, size = if (phone) 44.dp else 48.dp)
            Column(Modifier.weight(1f)) {
                EmojiText(title, style = MaterialTheme.typography.titleLarge.copy(semanticsHeading = true), color = WL.colors.text, maxLines = 2)
                if (subtitle != null) FitText(subtitle, style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, maxLines = 1)
            }
            actions()
        }
    }
}

private fun androidx.compose.ui.text.TextStyle.copy(semanticsHeading: Boolean) = this

/** Read-aloud button used next to prompts. */
@Composable
fun SpeakButton(onClick: () -> Unit, modifier: Modifier = Modifier, size: Dp = 48.dp) =
    IconBtn(Icons.Rounded.VolumeUp, "Read aloud", onClick, modifier, tint = WL.colors.mathInk, bg = WL.colors.math, size = size)

@Composable
fun SectionTitle(text: String, modifier: Modifier = Modifier) =
    Text(text, style = MaterialTheme.typography.headlineSmall, color = WL.colors.text, modifier = modifier.semantics { heading() })

@Composable
fun ConfirmDialog(title: String, text: String, confirm: String, onConfirm: () -> Unit, onDismiss: () -> Unit, dismiss: String = "Cancel", danger: Boolean = false) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title, style = MaterialTheme.typography.titleLarge) },
        text = { Text(text, style = MaterialTheme.typography.bodyLarge) },
        confirmButton = { TextButton(onClick = onConfirm) { Text(confirm, color = if (danger) WL.colors.bad else WL.colors.primary, style = MaterialTheme.typography.labelLarge) } },
        dismissButton = { TextButton(onClick = onDismiss) { Text(dismiss, style = MaterialTheme.typography.labelLarge) } },
        containerColor = WL.colors.surface,
    )
}

/** Standard screen body padding that respects the navigation bar / gesture area. */
@Composable
fun Modifier.screenPadding(phone: Boolean) = this
    .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Bottom + WindowInsetsSides.Horizontal))
    .padding(if (phone) PaddingValues(12.dp) else PaddingValues(horizontal = 24.dp, vertical = 16.dp))

@Suppress("unused") private val unusedWidth = Modifier.width(0.dp)

/**
 * Text that always shows in full: it wraps between words up to [maxLines] and shrinks (down to 9 sp) to fit its space,
 * instead of being cut off with "…". Only if it still cannot fit at the smallest size is it trimmed.
 * Drop-in for Material Text in labels, tiles, chips and buttons.
 */
@Composable
fun FitText(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = Color.Unspecified,
    fontSize: androidx.compose.ui.unit.TextUnit = androidx.compose.ui.unit.TextUnit.Unspecified,
    fontWeight: FontWeight? = null,
    fontFamily: androidx.compose.ui.text.font.FontFamily? = null,
    textAlign: TextAlign? = null,
    lineHeight: androidx.compose.ui.unit.TextUnit = androidx.compose.ui.unit.TextUnit.Unspecified,
    maxLines: Int = 2,
    style: androidx.compose.ui.text.TextStyle = androidx.compose.material3.LocalTextStyle.current,
) = FitText(androidx.compose.ui.text.AnnotatedString(text), modifier, color, fontSize, fontWeight, fontFamily, textAlign, lineHeight, maxLines, style)

@Composable
fun FitText(
    text: androidx.compose.ui.text.AnnotatedString,
    modifier: Modifier = Modifier,
    color: Color = Color.Unspecified,
    fontSize: androidx.compose.ui.unit.TextUnit = androidx.compose.ui.unit.TextUnit.Unspecified,
    fontWeight: FontWeight? = null,
    fontFamily: androidx.compose.ui.text.font.FontFamily? = null,
    textAlign: TextAlign? = null,
    lineHeight: androidx.compose.ui.unit.TextUnit = androidx.compose.ui.unit.TextUnit.Unspecified,
    maxLines: Int = 2,
    style: androidx.compose.ui.text.TextStyle = androidx.compose.material3.LocalTextStyle.current,
) {
    val base = style.merge(
        color = if (color != Color.Unspecified) color else if (style.color != Color.Unspecified) style.color else androidx.compose.material3.LocalContentColor.current,
        fontSize = fontSize, fontWeight = fontWeight, fontFamily = fontFamily, textAlign = textAlign ?: TextAlign.Unspecified, lineHeight = lineHeight,
    )
    val max = if (base.fontSize.isSp) base.fontSize else androidx.compose.ui.unit.TextUnit(16f, androidx.compose.ui.unit.TextUnitType.Sp)
    val min = androidx.compose.ui.unit.TextUnit(minOf(9f, max.value), androidx.compose.ui.unit.TextUnitType.Sp)
    androidx.compose.foundation.text.BasicText(
        text, modifier, style = base, maxLines = maxLines, overflow = TextOverflow.Ellipsis,
        autoSize = androidx.compose.foundation.text.TextAutoSize.StepBased(minFontSize = min, maxFontSize = max),
    )
}
