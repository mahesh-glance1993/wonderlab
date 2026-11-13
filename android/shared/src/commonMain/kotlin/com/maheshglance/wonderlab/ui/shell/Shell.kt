package com.maheshglance.wonderlab.ui.shell

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CloudOff
import androidx.compose.material.icons.rounded.Sync
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.NavigationRailItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.LifecycleResumeEffect
import com.maheshglance.wonderlab.core.data.SyncStatus
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.t
import kotlinx.coroutines.delay

/** "Offline · saved on this device" / sync problems — a thin bar above the system navigation. */
@Composable
fun OfflineBar() {
    val app = LocalApp.current
    val s by app.repo.state.collectAsState()
    val show = s.account != null && (!s.online || s.sync == SyncStatus.Paused || s.sync == SyncStatus.Error)
    AnimatedVisibility(show) {
        val c = WL.colors
        Row(
            Modifier.fillMaxWidth().background(c.warnBg).windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Bottom + WindowInsetsSides.Horizontal)).padding(horizontal = 14.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Icon(if (!s.online) Icons.Rounded.CloudOff else Icons.Rounded.Sync, null, tint = c.warn, modifier = Modifier.size(18.dp))
            val msg = when {
                !s.online -> "Offline · saved on this device" + if (s.pending > 0) " · ${s.pending} waiting to sync" else ""
                else -> s.syncMessage ?: "Couldn't sync yet"
            }
            Text(msg, color = c.warn, style = MaterialTheme.typography.labelMedium, modifier = Modifier.weight(1f))
            if (s.online && s.sync == SyncStatus.Paused) WLButton("Sign in", { app.go(Routes.SIGNIN) }, small = true)
            else if (s.online) WLButton("Retry", { app.repo.retrySync() }, small = true)
        }
    }
}

/** Gentle screen-time break reminder (parent setting: breakEnabled / breakMinutes). */
@Composable
fun BreakReminder() {
    val app = LocalApp.current
    val s by app.repo.state.collectAsState()
    val prefs = s.prefs
    var since by remember { mutableLongStateOf(nowMillis()) }
    var show by remember { mutableStateOf(false) }
    LifecycleResumeEffect(Unit) { onPauseOrDispose { } }
    LaunchedEffect(prefs.breakEnabled, prefs.breakMinutes, s.profileId) {
        since = nowMillis()
        while (prefs.breakEnabled && s.profileId != null) {
            delay(30_000)
            if (nowMillis() - since > prefs.breakMinutes * 60_000L) { show = true; since = nowMillis() }
        }
    }
    if (show) Dialog(onDismissRequest = { show = false }) {
        WLCard(padding = 24.dp) {
            Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                EmojiImage("🧘", 96.dp)
                Text("Time for a little break!", style = MaterialTheme.typography.headlineSmall, textAlign = TextAlign.Center)
                Text("Look far away, stretch your arms, and drink some water. 🌳💧", style = MaterialTheme.typography.bodyLarge, textAlign = TextAlign.Center, color = WL.colors.muted)
                WLButton("I'm back", { show = false; since = nowMillis() }, kind = BtnKind.Primary)
            }
        }
    }
}

data class HubTab(val route: String, val label: String, val emoji: String)

/**
 * Top-level layout for hub screens (Home, Learn, Play, Art, Progress):
 * a bottom navigation bar on phones, a navigation rail on tablets / landscape — like a native app.
 */
@Composable
fun HubScaffold(current: String, content: @Composable () -> Unit) {
    val app = LocalApp.current
    val s by app.repo.state.collectAsState()
    val win = LocalWindow.current
    val early = (s.profile?.classLevel ?: 3) <= 2
    val tabs = listOf(
        HubTab(Routes.HOME, if (early) "Home" else t("appName").let { "Home" }, "🏠"),
        HubTab(Routes.LEARN, if (early) "Learn" else "Lessons", "📚"),
        HubTab(if (early) Routes.PLAY else Routes.GAMES, if (early) "Play" else "Games", if (early) "🧸" else "🧩"),
        HubTab(Routes.ART, "Art", "🎨"),
        HubTab(Routes.PROGRESS, if (early) "Stars" else "Progress", "⭐"),
    )
    val c = WL.colors
    // Tabs always open their own top screen: Home pops back to Home; other tabs sit directly above Home.
    val onTab = { r: String ->
        if (r != current) {
            if (r == Routes.HOME) { if (!app.nav.popBackStack(Routes.HOME, inclusive = false)) app.nav.navigate(Routes.HOME) { launchSingleTop = true } }
            else app.nav.navigate(r) { popUpTo(Routes.HOME) { inclusive = false }; launchSingleTop = true }
        }
    }
    if (win.isTablet || win.landscape) {
        Row(Modifier.fillMaxSize()) {
            NavigationRail(containerColor = c.surface, modifier = Modifier.windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Vertical + WindowInsetsSides.Start))) {
                // fill the height only: fillMaxSize here would stretch the rail across the whole tablet and hide the page
                Column(Modifier.fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterVertically)) {
                    tabs.forEach { tab ->
                        NavigationRailItem(
                            selected = current == tab.route,
                            onClick = { onTab(tab.route) },
                            icon = { EmojiImage(tab.emoji, 34.dp) },
                            label = { Text(tab.label, style = MaterialTheme.typography.labelMedium) },
                            colors = NavigationRailItemDefaults.colors(indicatorColor = c.math, selectedTextColor = c.mathInk, unselectedTextColor = c.muted),
                        )
                    }
                }
            }
            Box(Modifier.weight(1f).fillMaxSize()) { content() }
        }
    } else {
        Column(Modifier.fillMaxSize()) {
            Box(Modifier.weight(1f).fillMaxWidth()) { content() }
            NavigationBar(containerColor = c.surface, tonalElevation = 0.dp) {
                tabs.forEach { tab ->
                    NavigationBarItem(
                        selected = current == tab.route,
                        onClick = { onTab(tab.route) },
                        icon = { EmojiImage(tab.emoji, 28.dp) },
                        label = { Text(tab.label, style = MaterialTheme.typography.labelSmall, maxLines = 1) },
                        colors = NavigationBarItemDefaults.colors(indicatorColor = c.math, selectedTextColor = c.mathInk, unselectedTextColor = c.muted),
                    )
                }
            }
        }
    }
}
