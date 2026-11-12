package com.maheshglance.wonderlab.feature.parent

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.data.AppState
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.feature.auth.FormError
import com.maheshglance.wonderlab.feature.auth.FormProblem
import com.maheshglance.wonderlab.feature.auth.LinkButton
import com.maheshglance.wonderlab.feature.auth.PasswordField
import com.maheshglance.wonderlab.feature.auth.rememberForm
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/** True while the parent check (10 minutes after re-entering the password) is still valid; re-evaluated every 10 s. */
@Composable
fun rememberParentVerified(s: AppState): Boolean {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) { while (true) { delay(10_000); now = System.currentTimeMillis() } }
    return (s.session?.verifiedUntil ?: 0) > now / 1000
}

/**
 * Sensitive parent areas require re-entering the parent password (valid for 10 minutes), like the website's
 * ParentGate. `inline` renders a compact card in place (for a single action inside a page).
 */
@Composable
fun ParentGate(reason: String = "This area is for parents.", inline: Boolean = false, content: @Composable () -> Unit) {
    val s by appState()
    if (rememberParentVerified(s)) { content(); return }
    if (inline) { GateCard(reason); return }
    Box(Modifier.fillMaxSize().imePadding(), contentAlignment = Alignment.Center) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
            GateCard(reason, Modifier.widthIn(max = 460.dp).fillMaxWidth())
        }
    }
}

@Composable
private fun GateCard(reason: String, modifier: Modifier = Modifier.fillMaxWidth()) {
    val app = LocalApp.current
    val s by appState()
    val scope = rememberCoroutineScope()
    var pw by remember { mutableStateOf("") }
    val form = rememberForm()
    fun submit() = scope.launch {
        form.run {
            if (pw.isEmpty()) throw FormProblem("Enter your password.")
            app.repo.verifyParent(pw)
            pw = ""
        }
    }
    WLCard(modifier, padding = 22.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                EmojiImage("🔒", 48.dp)
                Text("Parent check", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
            }
            Text("$reason Enter the password for ${s.account?.username ?: "this account"}.", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
            if (!s.online) AlertBox("Parent settings need an internet connection.", AlertKind.Warn)
            FormError(form)
            PasswordField("Parent password", pw, { pw = it }, imeAction = ImeAction.Done, onDone = { submit() })
            WLButton("Continue", { submit() }, kind = BtnKind.Primary, loading = form.busy, enabled = s.online, modifier = Modifier.fillMaxWidth())
            LinkButton("Forgot password?") { app.go(Routes.FORGOT) }
        }
    }
}

/** Lays cards out in two columns when there is room (tablets), one column otherwise. */
@Composable
fun AdaptiveColumns(minTwoCol: Dp = 720.dp, gap: Dp = 14.dp, left: @Composable ColumnScope.() -> Unit, right: @Composable ColumnScope.() -> Unit) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        if (maxWidth >= minTwoCol) Row(horizontalArrangement = Arrangement.spacedBy(gap)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(gap), content = left)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(gap), content = right)
        } else Column(verticalArrangement = Arrangement.spacedBy(gap)) { left(); right() }
    }
}

/** Titled flat card used across the parent area. */
@Composable
fun SettingsCard(title: String, modifier: Modifier = Modifier, subtitle: String? = null, content: @Composable ColumnScope.() -> Unit) {
    WLCard(modifier.fillMaxWidth(), padding = 16.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(title, style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
            if (subtitle != null) Text(subtitle, style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            content()
        }
    }
}
