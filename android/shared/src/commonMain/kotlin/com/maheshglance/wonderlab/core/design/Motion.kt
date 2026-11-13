package com.maheshglance.wonderlab.core.design

import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable

/**
 * WonderLab motion tokens (docs/DESIGN_SYSTEM.md → Motion). Same values on the website (styles.css --dur-*).
 * Motion only explains what just happened; with Reduce Motion (app setting OR the device's accessibility setting)
 * every token becomes an instant change.
 */
object Motion {
    /** Press / tap feedback (button scale, chip highlight). */
    const val PRESS = 120
    /** Local state changes: validation, check results, toggles, expanding a hint. */
    const val LOCAL = 200
    /** Larger custom transitions: stage changes in a lesson, dialogs, celebration banners. */
    const val TRANSITION = 280

    /** Material "standard" curve: quick start, gentle settle. */
    val Standard = CubicBezierEasing(0.2f, 0f, 0f, 1f)
    /** Entering elements decelerate into place. */
    val Enter = CubicBezierEasing(0f, 0f, 0f, 1f)
    /** Leaving elements accelerate away. */
    val Exit = CubicBezierEasing(0.3f, 0f, 1f, 1f)

    @Composable fun <T> press(): AnimationSpec<T> = if (LocalReduceMotion.current) snap() else tween(PRESS, easing = Standard)
    @Composable fun <T> local(): AnimationSpec<T> = if (LocalReduceMotion.current) snap() else tween(LOCAL, easing = Standard)
    @Composable fun <T> transition(): AnimationSpec<T> = if (LocalReduceMotion.current) snap() else tween(TRANSITION, easing = Enter)
}
