package com.maheshglance.wonderlab.feature.art.paint

import android.view.MotionEvent
import androidx.compose.ui.input.pointer.PointerEvent
import androidx.compose.ui.input.pointer.PointerInputChange
import androidx.compose.ui.input.pointer.PointerType

actual fun platformPenSamples(event: PointerEvent, change: PointerInputChange, includeHistory: Boolean): List<PenSample>? {
    val me = event.motionEvent ?: return null
    val pen = change.type == PointerType.Stylus || change.type == PointerType.Eraser
    val idx = when {
        me.pointerCount == 1 -> 0
        pen -> (0 until me.pointerCount).firstOrNull {
            val t = me.getToolType(it); t == MotionEvent.TOOL_TYPE_STYLUS || t == MotionEvent.TOOL_TYPE_ERASER
        } ?: return null
        else -> return null
    }
    // MotionEvent coordinates are the root view's; Compose's are the canvas's — same scale, constant offset
    val ox = change.position.x - me.getX(idx); val oy = change.position.y - me.getY(idx)
    val out = ArrayList<PenSample>(me.historySize + 1)
    if (includeHistory) for (h in 0 until me.historySize) {
        out += PenSample(
            me.getHistoricalX(idx, h) + ox, me.getHistoricalY(idx, h) + oy, me.getHistoricalPressure(idx, h),
            me.getHistoricalAxisValue(MotionEvent.AXIS_TILT, idx, h),
        )
    }
    out += PenSample(change.position.x, change.position.y, me.getPressure(idx), me.getAxisValue(MotionEvent.AXIS_TILT, idx))
    return out
}
