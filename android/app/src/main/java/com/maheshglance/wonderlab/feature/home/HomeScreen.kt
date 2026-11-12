package com.maheshglance.wonderlab.feature.home

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Language
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.SwitchAccount
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.Tile
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLColors
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.shell.HubScaffold
import com.maheshglance.wonderlab.ui.t
import kotlinx.serialization.json.JsonPrimitive

private data class HomeTile(val key: String, val path: String, val emoji: String, val label: String, val earlyLabel: String, val desc: String, val color: (WLColors) -> Pair<Color, Color>, val show: (Int) -> Boolean = { true })

private val TILES = listOf(
    HomeTile("play", "play", "🧸", "e_play", "e_play", "Pictures, stories and shapes", { it.art to it.artInk }) { it <= 2 },
    HomeTile("next", "next", "🧭", "whatNext", "e_next", "A suggestion picked for you", { it.next to it.nextInk }),
    HomeTile("telugu", "lang/telugu", "📖", "telugu", "telugu", "అక్షరాలు, పదాలు, చదవడం, వ్యాకరణం", { it.games to it.gamesInk }),
    HomeTile("english", "lang/english", "🔤", "englishCourse", "englishCourse", "Letters, phonics, reading and grammar", { it.math to it.mathInk }),
    HomeTile("math", "learn?subject=math", "🔢", "math", "e_math", "Lessons, practice and tests", { it.math to it.mathInk }),
    HomeTile("lab", "lab", "🔬", "physicsLab", "e_world", "Experiments with motion, forces, circuits and light", { it.lab to it.labInk }),
    HomeTile("art", "art", "🎨", "artStudio", "e_art", "Trace, colour and paint", { it.art to it.artInk }),
    HomeTile("games", "games", "🧩", "games", "e_games", "Puzzles that build skills", { it.games to it.gamesInk }),
    HomeTile("progress", "progress", "🏆", "myProgress", "e_progress", "Stars, badges and skills", { it.prog to it.progInk }),
    HomeTile("downloads", "downloads", "📥", "downloads", "downloads", "Use lessons offline", { it.dl to it.dlInk }),
)

@Composable
fun HomeScreen() {
    val app = LocalApp.current
    val s by appState()
    val profile = s.profile ?: return
    val lang = WL.lang
    val early = profile.classLevel <= 2
    val win = LocalWindow.current
    val stars = s.learner.rewards.size + s.learner.mastery.values.sumOf { it.correct }
    val last = s.prefs.lastActivity
    val greeting = if (lang == "te") "నమస్తే ${profile.nickname}!" else "Hi ${profile.nickname}!"
    val avatar = AVATARS[profile.avatar] ?: "🦉"
    val classLabel = CLASS_LABELS.getOrNull(profile.classLevel)?.let { if (lang == "te") it.second else it.first } ?: ""
    val tiles = TILES.filter { it.show(profile.classLevel) }.map { if (early && it.key == "lab") it.copy(path = "learn?subject=early", emoji = "🌍") else it }

    LaunchedEffect(profile.id) {
        if (early) app.say(if (lang == "te") "నమస్తే ${profile.nickname}! ఏం చేద్దాం?" else "Hi ${profile.nickname}! What would you like to do?", lang, "Hi ${profile.nickname}! What would you like to do?")
    }

    HubScaffold(Routes.HOME) {
        Column(Modifier.fillMaxSize()) {
            TopBar(t("appName"), actions = {
                if (profile.classLevel <= 5) IconBtn(Icons.Rounded.Language, if (lang == "te") "Switch to English" else "తెలుగుకు మార్చు", {
                    app.repo.updatePrefs(mapOf("language" to JsonPrimitive(if (lang == "te") "en" else "te")))
                }, size = 44.dp)
                ComfortButton()
                IconBtn(Icons.Rounded.SwitchAccount, t("switchLearner"), { app.go(Routes.WHO) }, size = 44.dp)
                IconBtn(Icons.Rounded.Settings, t("settings"), { app.go(Routes.PARENT) }, size = 44.dp)
            })
            Column(
                Modifier.weight(1f).fillMaxWidth().padding(horizontal = if (win.isPhone) 12.dp else 20.dp, vertical = if (win.isPhone) 10.dp else 16.dp),
                verticalArrangement = Arrangement.spacedBy(if (win.isPhone) 10.dp else 14.dp),
            ) {
                // greeting + continue, in one row on wide screens
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Row(
                        Modifier.weight(1f).clip(RoundedCornerShape(22.dp)).background(WL.colors.surface).padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        EmojiImage(avatar, if (win.isPhone) 52.dp else 68.dp)
                        Column(Modifier.weight(1f)) {
                            FitText(greeting, style = MaterialTheme.typography.headlineSmall, color = WL.colors.text, maxLines = 1)
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("$classLabel · ", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                                EmojiImage("⭐", 18.dp)
                                Text("$stars ${t("stars")}", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                            }
                        }
                        if (early) SpeakButton({ app.say(if (lang == "te") "నమస్తే ${profile.nickname}! ఏం చేద్దాం?" else "Hi ${profile.nickname}! What would you like to do?", lang, "Hi ${profile.nickname}! What would you like to do?") }, size = 44.dp)
                    }
                    if (last != null && !win.isPhone) ContinueChip(last.label, early) { app.go(last.path) }
                }
                if (last != null && win.isPhone) ContinueChip(last.label, early, Modifier.fillMaxWidth()) { app.go(last.path) }

                // tiles fill the rest of the screen exactly
                val cols = when { win.isPhone && !win.landscape -> 2; win.isPhone -> 5; win.landscape -> 5; else -> 3 }
                val rows = tiles.chunked(cols)
                Column(Modifier.weight(1f).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(if (win.isPhone) 10.dp else 14.dp)) {
                    rows.forEach { row ->
                        Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(if (win.isPhone) 10.dp else 14.dp)) {
                            row.forEach { tile ->
                                val (bg, ink) = tile.color(WL.colors)
                                Tile(
                                    title = t(if (early) tile.earlyLabel else tile.label),
                                    subtitle = if (!early) tile.desc else null,
                                    emoji = tile.emoji, color = bg, ink = ink,
                                    centered = true,
                                    onClick = { app.go(tile.path) },
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
}

@Composable
private fun ContinueChip(label: String, early: Boolean, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val c = WL.colors
    Row(
        modifier.clip(RoundedCornerShape(22.dp)).background(c.next).pressable(onClick = onClick).padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(Modifier.size(40.dp).clip(RoundedCornerShape(14.dp)).background(c.surface), contentAlignment = Alignment.Center) { Icon(Icons.Rounded.PlayArrow, null, tint = c.nextInk) }
        Column {
            Text(t(if (early) "e_continue" else "continueLearning"), style = MaterialTheme.typography.titleMedium, color = c.nextInk)
            FitText(label, style = MaterialTheme.typography.bodySmall, color = c.muted, maxLines = 1)
        }
    }
}

val AVATARS = mapOf("owl" to "🦉", "lion" to "🦁", "panda" to "🐼", "rabbit" to "🐰", "fox" to "🦊", "frog" to "🐸", "monkey" to "🐵", "tiger" to "🐯", "koala" to "🐨", "turtle" to "🐢", "penguin" to "🐧", "octopus" to "🐙")
val CLASS_LABELS = listOf("Nursery" to "నర్సరీ", "LKG" to "ఎల్‌కేజీ", "UKG" to "యూకేజీ") + (1..10).map { "Class $it" to "${it}వ తరగతి" }
