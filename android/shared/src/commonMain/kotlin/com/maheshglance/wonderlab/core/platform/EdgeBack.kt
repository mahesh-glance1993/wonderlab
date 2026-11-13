package com.maheshglance.wonderlab.core.platform

import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp

/**
 * Back handlers registered by screens (BackHandler on iOS): the newest enabled one wins, like Android's dispatcher.
 * The iOS edge-swipe gesture asks this first and falls back to normal navigation.
 */
object BackStack {
    private val handlers = ArrayList<Pair<Any, () -> Boolean>>()
    fun push(owner: Any, enabled: () -> Boolean) { handlers.add(owner to enabled) }
    fun remove(owner: Any) { handlers.removeAll { it.first === owner } }
    internal val callbacks = HashMap<Any, () -> Unit>()
    /** Runs the newest enabled handler; false when none is registered. */
    fun dispatch(): Boolean {
        for (i in handlers.indices.reversed()) {
            val (owner, enabled) = handlers[i]
            if (enabled()) { callbacks[owner]?.invoke(); return true }
        }
        return false
    }
}

/**
 * iPad / iPhone swipe-from-left-edge back gesture (iOS has no Back button). A 24 dp strip on the leading edge;
 * a rightward swipe of 72 dp or more goes back. Taps pass through.
 */
@Composable
fun EdgeSwipeBack(onBack: () -> Unit) {
    val trigger = with(LocalDensity.current) { 72.dp.toPx() }
    Box(Modifier.fillMaxHeight().width(24.dp).pointerInput(Unit) {
        var dx = 0f
        detectHorizontalDragGestures(
            onDragStart = { dx = 0f },
            onHorizontalDrag = { _, d -> dx += d },
            onDragEnd = { if (dx > trigger) { if (!BackStack.dispatch()) onBack() } },
        )
    })
}
