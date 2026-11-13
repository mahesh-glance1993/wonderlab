package com.maheshglance.wonderlab.feature.lab

import com.maheshglance.wonderlab.core.platform.*

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
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
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.savedstate.read
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.maheshglance.wonderlab.core.design.CardShape
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.games.EmojiPill
import com.maheshglance.wonderlab.feature.games.j
import com.maheshglance.wonderlab.feature.games.list
import com.maheshglance.wonderlab.feature.games.str
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.NeedLearner
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.learnerScreen
import kotlinx.serialization.json.JsonElement

/** URL preset keys the website accepts (e.g. /lab/forces?mass=5&force=20 from a lesson). */
private val PRESET_KEYS = listOf("u", "a", "t", "mass", "force", "friction", "cells", "bulbs", "closed", "angle")

/** Website routes: /lab (index) and /lab/motion|forces|circuit|light (with optional presets). */
fun NavGraphBuilder.labGraph() {
    learnerScreen("lab") { LabIndex() }
    composable(
        "lab/{labId}?" + PRESET_KEYS.joinToString("&") { "$it={$it}" },
        arguments = listOf(navArgument("labId") { type = NavType.StringType }) + PRESET_KEYS.map { k -> navArgument(k) { type = NavType.StringType; nullable = true; defaultValue = null } },
    ) { entry ->
        NeedLearner {
            val args = entry.arguments
            val query = PRESET_KEYS.mapNotNull { k -> args?.read { getStringOrNull(k) }?.let { k to it } }.toMap()
            when (args?.read { getStringOrNull("labId") }) {
                "motion" -> MotionLab(query)
                "forces" -> ForcesLab(query)
                "circuit" -> CircuitLab(query)
                "light" -> LightLab(query)
                else -> { val app = LocalApp.current; LaunchedEffect(Unit) { app.nav.popBackStack(); app.go("lab") } }
            }
        }
    }
}

@Composable
private fun LabIndex() {
    val app = LocalApp.current
    val s by appState()
    val tier = rememberLabTier()
    val win = LocalWindow.current
    var labs by remember { mutableStateOf<List<JsonElement>>(emptyList()) }
    LaunchedEffect(Unit) { labs = runCatching { app.engine.call("lab.labs").list() }.getOrDefault(emptyList()) }
    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar("Physics Lab", onBack = { app.back() })
        if (labs.isEmpty()) { Loading(); return@Column }
        val pad = if (win.isPhone) 12.dp else 20.dp
        Column(Modifier.weight(1f).windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Bottom + WindowInsetsSides.Horizontal)).padding(pad), verticalArrangement = Arrangement.spacedBy(pad)) {
            Text(if (tier.simple) "Pick an experiment. Guess what will happen, then try it!" else "Choose a simulation. Predict, run the experiment, then explain what you saw.", style = MaterialTheme.typography.bodyLarge, color = WL.colors.muted)
            val cols = if (win.landscape || win.width >= 900.dp) 4 else 2
            labs.chunked(cols).forEach { row ->
                Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(pad)) {
                    row.forEach { l ->
                        val id = l.j("id").str() ?: ""
                        val done = s.learner.rewards.containsKey("lab:$id:challenge")
                        BoxWithConstraints(
                            Modifier.weight(1f).fillMaxHeight().shadow(6.dp, CardShape, clip = false).clip(CardShape).background(WL.colors.lab).pressable { app.go("lab/$id") }.padding(14.dp),
                        ) {
                            val pic = (minOf(maxWidth.value, maxHeight.value) * 0.38f).coerceIn(36f, 120f).dp
                            val roomy = maxHeight > 200.dp
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                EmojiImage(l.j("emoji").str() ?: "🔬", pic)
                                Text(l.j("title").str() ?: "", style = MaterialTheme.typography.titleMedium, color = WL.colors.labInk)
                                FitText(l.j(if (tier.simple) "descSimple" else "desc").str() ?: "", style = MaterialTheme.typography.bodySmall, color = WL.colors.text, maxLines = 3)
                                if (roomy) FitText("Suits ${l.j("classes").str()}", style = MaterialTheme.typography.labelSmall, color = WL.colors.muted, maxLines = 2)
                                if (done) EmojiPill("👑", "Challenge done", bg = WL.colors.goodBg, fg = WL.colors.good)
                            }
                        }
                    }
                }
            }
        }
    }
}
