package com.maheshglance.wonderlab.feature.art.paint

import androidx.compose.ui.input.pointer.PointerEvent
import androidx.compose.ui.input.pointer.PointerInputChange

/** One input sample in the canvas view's coordinates: pressure 0..1, tilt in radians from perpendicular (0 = upright / unknown). */
class PenSample(val x: Float, val y: Float, val pressure: Float, val tiltRad: Float)

/**
 * Full-fidelity samples for `change` from the platform's raw event: every batched (historical) point with its own
 * pressure and pen tilt, then the current point. Returns null when the platform has no raw event to read
 * (callers then fall back to Compose's positions and current pressure).
 */
expect fun platformPenSamples(event: PointerEvent, change: PointerInputChange, includeHistory: Boolean): List<PenSample>?

/** Samples for `change`: the platform's raw samples when available, else Compose's historical positions with interpolated pressure. */
fun penSamples(event: PointerEvent, change: PointerInputChange, includeHistory: Boolean, lastPressure: Float): List<PenSample> {
    platformPenSamples(event, change, includeHistory)?.let { return it }
    val out = ArrayList<PenSample>()
    if (includeHistory) {
        val hist = change.historical
        hist.forEachIndexed { i, h ->
            val t = (i + 1f) / (hist.size + 1)
            out += PenSample(h.position.x, h.position.y, lastPressure + (change.pressure - lastPressure) * t, 0f)
        }
    }
    out += PenSample(change.position.x, change.position.y, change.pressure, 0f)
    return out
}
