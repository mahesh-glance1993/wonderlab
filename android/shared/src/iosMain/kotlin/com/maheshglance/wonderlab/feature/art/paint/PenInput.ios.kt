package com.maheshglance.wonderlab.feature.art.paint

import androidx.compose.ui.input.pointer.PointerEvent
import androidx.compose.ui.input.pointer.PointerInputChange

/** Compose on iOS exposes no raw UITouch (no coalesced touches / altitude angle): use Compose's own samples. */
actual fun platformPenSamples(event: PointerEvent, change: PointerInputChange, includeHistory: Boolean): List<PenSample>? = null
