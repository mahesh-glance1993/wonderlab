package com.maheshglance.wonderlab.feature.parent

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.rounded.Logout
import androidx.compose.material.icons.rounded.Badge
import androidx.compose.material.icons.rounded.CloudDone
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Face
import androidx.compose.material.icons.rounded.Insights
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Security
import androidx.compose.material.icons.rounded.Storage
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.NeedAccount
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.launch

data class ParentSection(val key: String, val title: String, val desc: String, val icon: ImageVector, val link: String? = null)

private val SECTIONS = listOf(
    ParentSection("learners", "Learners", "Profiles, comfort, sound and reading settings", Icons.Rounded.Face),
    ParentSection("progress", "Progress", "Topics mastered and areas to practise", Icons.Rounded.Insights),
    ParentSection("account", "Account", "Email, password and security question", Icons.Rounded.Badge),
    ParentSection("security", "Sign-in & security", "Signed-in devices and recovery codes", Icons.Rounded.Security),
    ParentSection("data", "Your data", "Export, report a problem, remove or delete", Icons.Rounded.Storage),
    ParentSection("downloads", "Offline & sync", "What works offline on this device", Icons.Rounded.CloudDone, link = Routes.DOWNLOADS),
)
private val EDITOR = ParentSection("editor", "Content editor", "Correct questions and objectives (educators)", Icons.Rounded.Edit, link = Routes.EDITOR)

/**
 * Parent settings (`/parent`, `/parent/{section}`). Tablets: list–detail in two panes. Phones: the section list,
 * then one section per screen. Everything sits behind the parent password check.
 */
@Composable
fun ParentScreen(section: String? = null) = NeedAccount {
    val app = LocalApp.current
    val s by appState()
    val win = LocalWindow.current
    val scope = rememberCoroutineScope()
    val signOut = rememberSignOutFlow()
    val sections = SECTIONS + if ((s.account?.role ?: "parent") != "parent") listOf(EDITOR) else emptyList()
    var selected by rememberSaveable(section) { mutableStateOf(section?.takeIf { k -> SECTIONS.any { it.key == k } } ?: "learners") }
    val twoPane = !win.isPhone || (win.landscape && win.width >= 700.dp)
    val showingDetail = !twoPane && section != null
    val current = sections.firstOrNull { it.key == (if (twoPane) selected else section) }

    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar(
            if (showingDetail) current?.title ?: "Parent settings" else "Parent settings",
            onBack = { if (showingDetail) app.back() else if (s.profile != null) app.replace(Routes.HOME) else app.replace(Routes.WHO) },
            subtitle = s.account?.username?.let { "Signed in as $it" },
            actions = {
                if (rememberParentVerified(s)) IconBtn(Icons.Rounded.Lock, "Lock parent settings", { scope.launch { app.repo.endParentMode() } }, size = 44.dp)
                IconBtn(Icons.AutoMirrored.Rounded.Logout, "Sign out", { scope.launch { signOut.start() } }, size = 44.dp, enabled = !signOut.busy)
            },
        )
        Box(Modifier.weight(1f).fillMaxWidth()) {
            ParentGate {
                if (twoPane) Row(Modifier.fillMaxSize()) {
                    Column(Modifier.width(if (win.width >= 1000.dp) 320.dp else 270.dp).fillMaxHeight().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        sections.forEach { sec ->
                            SectionRow(sec, sec.key == selected, chevron = sec.link != null) { if (sec.link != null) app.go(sec.link) else selected = sec.key }
                        }
                    }
                    VerticalDivider(color = WL.colors.line)
                    Box(Modifier.weight(1f).fillMaxHeight()) { SectionBody(selected) }
                } else if (section == null) {
                    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        sections.forEach { sec -> SectionRow(sec, false, chevron = true) { app.go(sec.link ?: "parent/${sec.key}") } }
                    }
                } else SectionBody(section)
            }
        }
    }
    SignOutDialog(signOut)
}

@Composable
private fun SectionRow(sec: ParentSection, selected: Boolean, chevron: Boolean, onClick: () -> Unit) {
    val c = WL.colors
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(if (selected) c.math else c.surface).pressable(onClick = onClick).padding(12.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Box(Modifier.size(44.dp).clip(RoundedCornerShape(14.dp)).background(if (selected) c.surface else c.surface2), contentAlignment = Alignment.Center) {
            Icon(sec.icon, null, tint = if (selected) c.mathInk else c.text)
        }
        Column(Modifier.weight(1f)) {
            Text(sec.title, style = MaterialTheme.typography.titleMedium, color = if (selected) c.mathInk else c.text)
            FitText(sec.desc, style = MaterialTheme.typography.bodySmall, color = c.muted, maxLines = 2)
        }
        if (chevron) Icon(Icons.AutoMirrored.Rounded.KeyboardArrowRight, null, tint = c.muted)
    }
}

@Composable
private fun SectionBody(key: String) {
    val phone = LocalWindow.current.isPhone
    Column(
        Modifier.fillMaxSize().imePadding().verticalScroll(rememberScrollState()).padding(if (phone) 12.dp else 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Column(Modifier.widthIn(max = 1000.dp).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            when (key) {
                "progress" -> ParentProgressSection()
                "account" -> AccountSection()
                "security" -> SecuritySection()
                "data" -> DataSection()
                else -> LearnersSection()
            }
        }
    }
}
