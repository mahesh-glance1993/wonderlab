package com.maheshglance.wonderlab.core.design

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.res.Res
import com.maheshglance.wonderlab.res.andika_bold
import com.maheshglance.wonderlab.res.andika_regular
import com.maheshglance.wonderlab.res.baloo2
import com.maheshglance.wonderlab.res.noto_sans_telugu
import com.maheshglance.wonderlab.res.nunito
import org.jetbrains.compose.resources.FontResource

/** WonderLab palette — same tokens as the website (calm, low-glare, WCAG AA text pairs). */
@Immutable
data class WLColors(
    val bg: Color, val surface: Color, val surface2: Color, val text: Color, val muted: Color, val line: Color,
    val primary: Color, val primaryInk: Color, val accent: Color, val focus: Color,
    val good: Color, val goodBg: Color, val bad: Color, val badBg: Color, val warn: Color, val warnBg: Color,
    val paper: Color, val ink: Color,
    val math: Color, val mathInk: Color, val lab: Color, val labInk: Color, val art: Color, val artInk: Color,
    val games: Color, val gamesInk: Color, val next: Color, val nextInk: Color, val dl: Color, val dlInk: Color, val prog: Color, val progInk: Color,
    val dark: Boolean,
)

val LightColors = WLColors(
    bg = Color(0xFFF6F7FC), surface = Color.White, surface2 = Color(0xFFEEF0F8), text = Color(0xFF1D2540), muted = Color(0xFF4F5B76), line = Color(0xFFD6DAE8),
    primary = Color(0xFF5145CD), primaryInk = Color.White, accent = Color(0xFF92400E), focus = Color(0xFF4338CA),
    good = Color(0xFF2F6B4F), goodBg = Color(0xFFDCEBDF), bad = Color(0xFF94473B), badBg = Color(0xFFF4DED7), warn = Color(0xFF7A5A12), warnBg = Color(0xFFF3E7C4),
    paper = Color.White, ink = Color(0xFF1D2540),
    math = Color(0xFFE8E7FF), mathInk = Color(0xFF4338CA), lab = Color(0xFFDDF5F0), labInk = Color(0xFF0F766E), art = Color(0xFFFCE7F0), artInk = Color(0xFF9D174D),
    games = Color(0xFFFFF1D6), gamesInk = Color(0xFF92400E), next = Color(0xFFDCEBDF), nextInk = Color(0xFF2F6B4F), dl = Color(0xFFE2EEF6), dlInk = Color(0xFF1F5C80), prog = Color(0xFFE5EFFF), progInk = Color(0xFF1D4ED8),
    dark = false,
)
val DarkColors = WLColors(
    bg = Color(0xFF101426), surface = Color(0xFF1A2136), surface2 = Color(0xFF232B44), text = Color(0xFFF2F4FF), muted = Color(0xFFB7C0D8), line = Color(0xFF333D5A),
    primary = Color(0xFFB7AEFF), primaryInk = Color(0xFF201846), accent = Color(0xFFFCD34D), focus = Color(0xFFC4B5FD),
    good = Color(0xFF9CD3B4), goodBg = Color(0xFF284034), bad = Color(0xFFEBA89A), badBg = Color(0xFF4A3430), warn = Color(0xFFE8CF8A), warnBg = Color(0xFF3F3624),
    paper = Color(0xFFE8E3D7), ink = Color(0xFF2F3A35),
    math = Color(0xFF252A4D), mathInk = Color(0xFFA5B4FC), lab = Color(0xFF15333A), labInk = Color(0xFF5EEAD4), art = Color(0xFF3A1F33), artInk = Color(0xFFF9A8D4),
    games = Color(0xFF3A2E18), gamesInk = Color(0xFFFCD34D), next = Color(0xFF1D3A2E), nextInk = Color(0xFFA6D6BB), dl = Color(0xFF1C3247), dlInk = Color(0xFF9FD2F2), prog = Color(0xFF1E2D4D), progInk = Color(0xFF93C5FD),
    dark = true,
)

@Composable
private fun vfont(res: FontResource, w: Int) =
    org.jetbrains.compose.resources.Font(res, FontWeight(w), variationSettings = FontVariation.Settings(FontVariation.weight(w)))

/**
 * Bundled fonts (OFL): Nunito (body), Baloo 2 (headings), Andika (early readers), Noto Sans Telugu.
 * Loaded from the shared resources by [WonderLabTheme] before any screen is drawn.
 */
object WLFonts {
    var body: FontFamily = FontFamily.Default; private set
    var head: FontFamily = FontFamily.Default; private set
    var kid: FontFamily = FontFamily.Default; private set
    var telugu: FontFamily = FontFamily.Default; private set

    @Composable
    internal fun load() {
        body = FontFamily(vfont(Res.font.nunito, 400), vfont(Res.font.nunito, 600), vfont(Res.font.nunito, 700), vfont(Res.font.nunito, 800), vfont(Res.font.nunito, 900))
        head = FontFamily(vfont(Res.font.baloo2, 500), vfont(Res.font.baloo2, 600), vfont(Res.font.baloo2, 700), vfont(Res.font.baloo2, 800))
        kid = FontFamily(org.jetbrains.compose.resources.Font(Res.font.andika_regular, FontWeight.Normal), org.jetbrains.compose.resources.Font(Res.font.andika_bold, FontWeight.Bold))
        telugu = FontFamily(vfont(Res.font.noto_sans_telugu, 400), vfont(Res.font.noto_sans_telugu, 600), vfont(Res.font.noto_sans_telugu, 700))
    }
}

/** Presentation tier sizes (website: early 64px targets, primary 56px, others 48px). */
@Immutable
data class TierDims(val tier: String, val target: Dp, val tileMin: Dp, val textScale: Float)

fun tierDims(tier: String, bigTargets: Boolean = false, textScale: Float = 1f) = when {
    tier == "early" || bigTargets -> TierDims(tier, 64.dp, 150.dp, textScale)
    tier == "primary" -> TierDims(tier, 56.dp, 130.dp, textScale)
    else -> TierDims(tier, 48.dp, 110.dp, textScale)
}

val LocalWLColors = staticCompositionLocalOf { LightColors }
val LocalTier = staticCompositionLocalOf { tierDims("primary") }
val LocalLang = staticCompositionLocalOf { "en" }
val LocalReduceMotion = staticCompositionLocalOf { false }

object WL {
    val colors: WLColors @Composable get() = LocalWLColors.current
    val tier: TierDims @Composable get() = LocalTier.current
    val lang: String @Composable get() = LocalLang.current
}

@Composable
fun WonderLabTheme(
    theme: String = "system",
    tier: String = "primary",
    bigTargets: Boolean = false,
    textScale: Float = 1f,
    lang: String = "en",
    reduceMotion: Boolean = false,
    content: @Composable () -> Unit,
) {
    WLFonts.load()
    val dark = theme == "dark" || (theme == "system" && isSystemInDarkTheme())
    val c = if (dark) DarkColors else LightColors
    val scheme = if (dark) darkColorScheme(primary = c.primary, onPrimary = c.primaryInk, background = c.bg, onBackground = c.text, surface = c.surface, onSurface = c.text, surfaceVariant = c.surface2, onSurfaceVariant = c.muted, outline = c.line, error = c.bad, secondaryContainer = c.math, onSecondaryContainer = c.mathInk)
    else lightColorScheme(primary = c.primary, onPrimary = c.primaryInk, background = c.bg, onBackground = c.text, surface = c.surface, onSurface = c.text, surfaceVariant = c.surface2, onSurfaceVariant = c.muted, outline = c.line, error = c.bad, secondaryContainer = c.math, onSecondaryContainer = c.mathInk)
    val s = textScale
    val body = if (lang == "te") WLFonts.telugu else WLFonts.body
    val head = if (lang == "te") WLFonts.telugu else WLFonts.head
    val typo = Typography(
        displaySmall = TextStyle(fontFamily = head, fontWeight = FontWeight.Bold, fontSize = (30 * s).sp, lineHeight = (36 * s).sp),
        headlineMedium = TextStyle(fontFamily = head, fontWeight = FontWeight.Bold, fontSize = (26 * s).sp, lineHeight = (31 * s).sp),
        headlineSmall = TextStyle(fontFamily = head, fontWeight = FontWeight.Bold, fontSize = (22 * s).sp, lineHeight = (27 * s).sp),
        titleLarge = TextStyle(fontFamily = head, fontWeight = FontWeight.Bold, fontSize = (20 * s).sp, lineHeight = (25 * s).sp),
        titleMedium = TextStyle(fontFamily = head, fontWeight = FontWeight.Bold, fontSize = (17 * s).sp, lineHeight = (22 * s).sp),
        titleSmall = TextStyle(fontFamily = body, fontWeight = FontWeight.ExtraBold, fontSize = (15 * s).sp, lineHeight = (20 * s).sp),
        bodyLarge = TextStyle(fontFamily = body, fontWeight = FontWeight.SemiBold, fontSize = (17 * s).sp, lineHeight = (25 * s).sp),
        bodyMedium = TextStyle(fontFamily = body, fontWeight = FontWeight.SemiBold, fontSize = (15 * s).sp, lineHeight = (22 * s).sp),
        bodySmall = TextStyle(fontFamily = body, fontWeight = FontWeight.SemiBold, fontSize = (13 * s).sp, lineHeight = (18 * s).sp),
        labelLarge = TextStyle(fontFamily = body, fontWeight = FontWeight.ExtraBold, fontSize = (16 * s).sp, lineHeight = (20 * s).sp),
        labelMedium = TextStyle(fontFamily = body, fontWeight = FontWeight.ExtraBold, fontSize = (14 * s).sp, lineHeight = (18 * s).sp),
        labelSmall = TextStyle(fontFamily = body, fontWeight = FontWeight.Bold, fontSize = (12 * s).sp, lineHeight = (16 * s).sp),
    )
    CompositionLocalProvider(
        LocalWLColors provides c,
        LocalTier provides tierDims(tier, bigTargets, textScale),
        LocalLang provides lang,
        LocalReduceMotion provides reduceMotion,
    ) {
        MaterialTheme(colorScheme = scheme, typography = typo, content = content)
    }
}
