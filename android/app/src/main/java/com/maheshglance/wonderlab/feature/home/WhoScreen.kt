package com.maheshglance.wonderlab.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Tile
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.t

/** "Who is learning today?" — big avatar tiles that always fit the screen. */
@Composable
fun WhoScreen(next: String?) {
    val app = LocalApp.current
    val s by appState()
    val win = LocalWindow.current
    LaunchedEffect(s.account, s.profiles.size) {
        if (s.account == null) app.replace(Routes.SIGNIN) else if (s.profiles.isEmpty()) app.replace(Routes.SETUP)
    }
    Column(Modifier.fillMaxSize()) {
        TopBar("WonderLab", actions = { IconBtn(Icons.Rounded.Settings, t("parent"), { app.go(Routes.PARENT) }, size = 44.dp) })
        Column(Modifier.weight(1f).fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(t("whoIsLearning"), style = MaterialTheme.typography.headlineMedium, textAlign = TextAlign.Center, color = WL.colors.text)
            val cols = when { s.profiles.size <= 2 -> s.profiles.size.coerceAtLeast(1); win.isPhone && !win.landscape -> 2; else -> 3.coerceAtMost(s.profiles.size) }
            val rows = s.profiles.chunked(cols)
            Column(Modifier.weight(1f).fillMaxWidth(if (win.isPhone) 1f else 0.8f), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                rows.forEach { row ->
                    Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                        row.forEach { p ->
                            Tile(
                                title = p.nickname,
                                subtitle = CLASS_LABELS.getOrNull(p.classLevel)?.first,
                                emoji = AVATARS[p.avatar] ?: "🦉",
                                centered = true,
                                onClick = { app.repo.selectProfile(p.id); app.replace(next?.takeIf { it.isNotBlank() } ?: Routes.HOME) },
                                modifier = Modifier.weight(1f).fillMaxHeight(),
                            )
                        }
                        repeat(cols - row.size) { Spacer(Modifier.weight(1f)) }
                    }
                }
            }
        }
    }
}
