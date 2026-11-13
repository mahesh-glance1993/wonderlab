package com.maheshglance.wonderlab.core.platform

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow

/** Short messages for platforms without a system toast (iOS). */
object ToastBus {
    internal val message = MutableStateFlow<Pair<String, Long>?>(null)
    fun show(text: String) { message.value = text to nanoTime() }
}

/** Shows [ToastBus] messages at the bottom of the screen for ~2.5 s, like an Android toast. */
@Composable
fun ToastHost() {
    val m by ToastBus.message.collectAsState()
    LaunchedEffect(m) { if (m != null) { delay(2500); if (ToastBus.message.value == m) ToastBus.message.value = null } }
    Box(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).padding(bottom = 32.dp), contentAlignment = Alignment.BottomCenter) {
        AnimatedVisibility(m != null, enter = fadeIn(), exit = fadeOut()) {
            Text(
                m?.first.orEmpty(),
                Modifier.widthIn(max = 520.dp).background(Color(0xE6202436), RoundedCornerShape(20.dp)).padding(horizontal = 18.dp, vertical = 10.dp),
                color = Color.White, style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center,
            )
        }
    }
}
