package com.maheshglance.wonderlab.core.design

import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import kotlin.math.min

/** Window classes (Material guidance): phones are Compact, small tablets/foldables Medium, tablets Expanded. */
enum class WidthClass { Compact, Medium, Expanded }
enum class HeightClass { Compact, Medium, Expanded }

@Immutable
data class WindowInfo(val width: Dp, val height: Dp) {
    val widthClass get() = when { width < 600.dp -> WidthClass.Compact; width < 840.dp -> WidthClass.Medium; else -> WidthClass.Expanded }
    val heightClass get() = when { height < 480.dp -> HeightClass.Compact; height < 900.dp -> HeightClass.Medium; else -> HeightClass.Expanded }
    val isPhone get() = widthClass == WidthClass.Compact || heightClass == HeightClass.Compact
    val isTablet get() = !isPhone
    val landscape get() = width > height
    /** Columns for tile grids that must fit on one screen. */
    fun columns(min: Int = 2, max: Int = 4) = when (widthClass) { WidthClass.Compact -> if (landscape) max else min; WidthClass.Medium -> (min + 1).coerceAtMost(max); WidthClass.Expanded -> max }
}

val LocalWindow = staticCompositionLocalOf { WindowInfo(400.dp, 800.dp) }

@Composable
fun rememberWindowInfo(): WindowInfo {
    val c = LocalConfiguration.current
    return WindowInfo(c.screenWidthDp.dp, c.screenHeightDp.dp)
}

/**
 * Keeps a screen on ONE screen: lays the content out at its natural size and, only if it is taller (or wider)
 * than the space available, scales it down to fit — no scrolling, nothing cut off. Content smaller than the
 * space is centred. Use for activity/game/question screens whose parts must be seen together.
 */
@Composable
fun FitToScreen(modifier: Modifier = Modifier, minScale: Float = 0.55f, alignTop: Boolean = false, content: @Composable () -> Unit) {
    Layout(content = content, modifier = modifier) { measurables, constraints ->
        val maxW = constraints.maxWidth
        val maxH = constraints.maxHeight
        val loose = Constraints(minWidth = 0, maxWidth = maxW, minHeight = 0, maxHeight = Constraints.Infinity)
        val placeables = measurables.map { it.measure(loose) }
        val childW = placeables.maxOfOrNull { it.width } ?: 0
        val childH = placeables.maxOfOrNull { it.height } ?: 0
        val boundedH = if (constraints.hasBoundedHeight) maxH else childH
        val scale = if (childH > boundedH && childH > 0) (boundedH.toFloat() / childH).coerceAtLeast(minScale) else 1f
        val w = if (constraints.hasBoundedWidth) maxW else childW
        layout(w, boundedH) {
            placeables.forEach { p ->
                val x = (w - p.width) / 2
                val scaledH = (p.height * scale).toInt()
                val y = if (alignTop || scale < 1f) 0 else (boundedH - scaledH) / 2
                p.placeWithLayer(x, y) {
                    scaleX = scale; scaleY = scale
                    transformOrigin = TransformOrigin(0.5f, 0f)
                }
            }
        }
    }
}

/** Gives the available size to content so it can choose sizes that fit (e.g. picture size from height). */
@Composable
fun WithSize(modifier: Modifier = Modifier, content: @Composable (w: Dp, h: Dp) -> Unit) {
    BoxWithConstraints(modifier) { content(maxWidth, maxHeight) }
}

/** Picks a size that lets `count` items of aspect 1 fit in `cols` columns inside w × h with gaps. */
fun fitCell(w: Dp, h: Dp, count: Int, cols: Int, gap: Dp = 12.dp, max: Dp = 220.dp): Dp {
    val rows = (count + cols - 1) / cols
    val byW = (w - gap * (cols - 1)) / cols
    val byH = (h - gap * (rows - 1)) / rows
    return min(min(byW.value, byH.value), max.value).coerceAtLeast(40f).dp
}
