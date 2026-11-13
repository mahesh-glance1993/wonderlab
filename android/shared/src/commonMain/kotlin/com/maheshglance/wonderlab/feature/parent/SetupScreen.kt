package com.maheshglance.wonderlab.feature.parent

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.data.Profile
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.feature.auth.toast
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.NeedAccount
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState

/** First-run parent setup (`/setup`): add one or more learner profiles. Behind the parent check. */
@Composable
fun SetupScreen() = NeedAccount {
    val app = LocalApp.current
    val s by appState()
    val context = LocalContext.current
    val win = LocalWindow.current
    val levels = rememberLevels()
    var adding by remember { mutableStateOf(s.profiles.isEmpty()) }

    fun done() {
        val ps = app.repo.state.value.profiles
        if (ps.size == 1) { app.repo.selectProfile(ps[0].id); app.replace(Routes.HOME) } else app.replace(Routes.WHO)
    }

    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar("Set up learners", onBack = if (s.profiles.isNotEmpty()) ({ app.replace(Routes.WHO) }) else null)
        ParentGate("Adding learners is a parent action.") {
            Column(
                Modifier.fillMaxSize().imePadding().verticalScroll(rememberScrollState()).padding(if (win.isPhone) 12.dp else 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Column(Modifier.widthIn(max = 900.dp).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text("Who will learn with WonderLab?", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                    Text("Each learner gets separate progress, recommendations, artwork and settings.", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                    if (s.profiles.isNotEmpty()) LearnerChips(s.profiles, levels)
                    if (adding) {
                        WLCard(Modifier.fillMaxWidth(), padding = if (win.isPhone) 14.dp else 20.dp) {
                            ProfileForm(null, "Add learner", onSaved = { p -> toast(context, "${p.nickname} added"); adding = false },
                                onCancel = if (s.profiles.isNotEmpty()) ({ adding = false }) else null)
                        }
                    } else Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        WLButton("Add another learner", { adding = true }, icon = Icons.Rounded.Add, modifier = Modifier.weight(1f))
                        if (s.profiles.isNotEmpty()) WLButton("Done", ::done, kind = BtnKind.Primary, modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
private fun LearnerChips(profiles: List<Profile>, levels: Levels) {
    androidx.compose.foundation.layout.FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        profiles.forEach { p ->
            Row(
                Modifier.background(WL.colors.surface, RoundedCornerShape(18.dp)).padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                EmojiImage(levels.emoji(p.avatar), 36.dp)
                Column {
                    Text(p.nickname, style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                    Text(levels.classLabel(p.classLevel), style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                }
            }
        }
    }
}
