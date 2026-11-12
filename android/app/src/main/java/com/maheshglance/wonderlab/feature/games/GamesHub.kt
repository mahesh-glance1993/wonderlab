package com.maheshglance.wonderlab.feature.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.EmojiEvents
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.CardShape
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.shell.HubScaffold
import kotlinx.serialization.json.JsonArray

@Composable
fun GamesHub() {
    val app = LocalApp.current
    val s by appState()
    val profile = s.profile ?: return
    val lang = WL.lang
    val win = LocalWindow.current
    var ready by remember { mutableStateOf(GamesStore.games.isNotEmpty()) }
    var order by remember { mutableStateOf<List<Pair<String, Boolean>>>(emptyList()) }
    var daily by remember { mutableStateOf<DailySpec?>(null) }
    var showBadges by remember { mutableStateOf(false) }
    val today = remember { todayKey() }
    LaunchedEffect(profile.id, profile.classLevel) {
        runCatching {
            GamesStore.load(app.engine)
            order = (app.engine.call("games.library", profile.classLevel) as? JsonArray).list().map { (it.j("id").str() ?: "") to (it.j("fits").bool() == true) }
            daily = com.maheshglance.wonderlab.core.engine.AppJson.decodeFromJsonElement(DailySpec.serializer(), app.engine.call("games.daily", today, profile.id, profile.classLevel))
        }
        ready = true
    }
    HubScaffold(Routes.GAMES) {
        Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
            TopBar(sx("library", lang), onBack = { app.back() }, actions = {
                val earned = GamesStore.badges.count { s.learner.rewards.containsKey(it.id) }
                WLButton("$earned", { showBadges = true }, icon = Icons.Rounded.EmojiEvents, small = true)
            })
            if (!ready || order.isEmpty()) { Loading(); return@Column }
            val pad = if (win.isPhone) 10.dp else 18.dp
            Column(Modifier.weight(1f).fillMaxWidth().padding(pad), verticalArrangement = Arrangement.spacedBy(pad)) {
                daily?.let { d -> DailyCard(d, today, Modifier.fillMaxWidth()) { app.go("games/daily") } }
                val cols = when { win.isPhone && !win.landscape -> 2; win.isPhone -> 4; win.landscape -> 4; else -> 2 }
                val rows = order.chunked(cols)
                Column(Modifier.weight(1f).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(pad)) {
                    rows.forEach { row ->
                        Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(pad)) {
                            row.forEach { (id, fits) -> GamesStore.game(id)?.let { g -> GameCard(g, fits, Modifier.weight(1f).fillMaxHeight()) { app.go("games/${g.id}") } } }
                            repeat(cols - row.size) { Spacer(Modifier.weight(1f)) }
                        }
                    }
                }
            }
        }
    }
    if (showBadges) BadgesDialog { showBadges = false }
}

@Composable
private fun DailyCard(d: DailySpec, today: String, modifier: Modifier, onClick: () -> Unit) {
    val s by appState()
    val lang = WL.lang
    val g = GamesStore.game(d.gameId) ?: return
    val st = readSaved(s.learner.activities["game:daily"]?.state)
    val solvedToday = st?.daily?.lastSolved == today
    val streak = st?.daily?.let { if (it.lastSolved == today || it.lastSolved == prevDateKey(today)) it.streak else 0 } ?: 0
    Row(
        modifier.shadow(6.dp, CardShape, clip = false).clip(CardShape).background(WL.colors.next).pressable(onClick = onClick).padding(horizontal = 14.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        EmojiImage("☀️", 48.dp)
        Column(Modifier.weight(1f)) {
            Text("${sx("dailyPuzzle", lang)} · ${g.title(lang)}", style = MaterialTheme.typography.titleMedium, color = WL.colors.nextInk, maxLines = 1, overflow = TextOverflow.Ellipsis)
            EmojiText(if (solvedToday) "✅ ${sx("dailyDone", lang)}" else sx("dailyBody", lang), style = MaterialTheme.typography.bodySmall, color = WL.colors.nextInk, maxLines = 2)
        }
        if (streak > 0) EmojiPill("🚩", "$streak ${sx("dayStreak", lang)}")
        EmojiImage(g.emoji, 40.dp)
    }
}

@Composable
private fun GameCard(g: GameInfo, fits: Boolean, modifier: Modifier, onClick: () -> Unit) {
    val s by appState()
    val lang = WL.lang
    val st = readSaved(s.learner.activities["game:${g.id}"]?.state)
    val stars = GamesStore.badges.count { it.id.startsWith("game:${g.id}:") && s.learner.rewards.containsKey(it.id) }
    BoxWithConstraints(
        modifier.shadow(6.dp, CardShape, clip = false).clip(CardShape).background(if (fits) WL.colors.games else WL.colors.surface)
            .then(if (fits) Modifier.border(2.dp, WL.colors.gamesInk.copy(alpha = .35f), CardShape) else Modifier)
            .pressable(onClick = onClick).padding(10.dp),
    ) {
        val pic = (minOf(maxWidth.value, maxHeight.value) * 0.34f).coerceIn(30f, 96f).dp
        val roomy = maxHeight > 150.dp
        val tall = maxHeight > 220.dp
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top) {
                EmojiImage(g.emoji, pic)
                Spacer(Modifier.weight(1f))
                if (stars > 0) EmojiText("⭐".repeat(stars), style = MaterialTheme.typography.labelSmall, emojiScale = 1.2f)
            }
            Text(g.title(lang), style = MaterialTheme.typography.titleMedium, color = if (fits) WL.colors.gamesInk else WL.colors.text, maxLines = 2, overflow = TextOverflow.Ellipsis)
            Text("${sx("classes", lang)}: ${g.range(lang)}", style = MaterialTheme.typography.labelSmall, color = WL.colors.muted, maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (roomy) Text(g.objectives(lang), style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, maxLines = if (tall) 4 else 2, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f, fill = false))
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                if (fits) Text("★ ${sx("greatForClass", lang)}", style = MaterialTheme.typography.labelSmall, color = WL.colors.gamesInk, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f, fill = false))
                if (st != null && st.stats.rounds > 0) Text("${st.stats.rounds} ${sx("roundsPlayed", lang)}", style = MaterialTheme.typography.labelSmall, color = WL.colors.muted, maxLines = 1)
            }
        }
    }
}

@Composable
private fun BadgesDialog(onDismiss: () -> Unit) {
    val s by appState()
    val lang = WL.lang
    val earned = GamesStore.badges.filter { s.learner.rewards.containsKey(it.id) }.sortedByDescending { s.learner.rewards[it.id] ?: 0 }
    Dialog(onDismissRequest = onDismiss) {
        WLCard(Modifier.fillMaxWidth().heightIn(max = 560.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                EmojiImage("👑", 36.dp)
                Text(sx("badges", lang), style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
            }
            Text(sx("badgesPrivate", lang), style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            if (earned.isEmpty()) Text(sx("noBadges", lang), style = MaterialTheme.typography.bodyLarge, color = WL.colors.text, modifier = Modifier.padding(vertical = 12.dp))
            else LazyVerticalGrid(GridCells.Adaptive(150.dp), Modifier.weight(1f, fill = false).padding(vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(6.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(earned, key = { it.id }) { b ->
                    Row(Modifier.clip(RoundedCornerShape(14.dp)).background(WL.colors.games).padding(8.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        EmojiImage(b.emoji, 26.dp)
                        Text(b.title(lang), style = MaterialTheme.typography.labelSmall, color = WL.colors.gamesInk, maxLines = 3)
                    }
                }
            }
            Text("${GamesStore.badges.size - earned.size} ${sx("locked", lang)}", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.CenterEnd) { WLButton("OK", onDismiss, kind = BtnKind.Primary, small = true) }
        }
    }
    @Suppress("UNUSED_EXPRESSION") Color.Unspecified
}
