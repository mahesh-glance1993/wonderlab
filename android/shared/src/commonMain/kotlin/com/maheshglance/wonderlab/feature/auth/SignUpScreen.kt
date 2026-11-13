package com.maheshglance.wonderlab.feature.auth

import com.maheshglance.wonderlab.core.platform.*

import com.maheshglance.wonderlab.core.platform.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Meter
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.put

private val STEP1 = setOf("username", "password", "confirm")

@Composable
fun rememberSecurityQuestions(): List<String> {
    val app = LocalApp.current
    var qs by remember { mutableStateOf(SECURITY_QUESTIONS_FALLBACK) }
    LaunchedEffect(Unit) {
        runCatching { app.engine.call("core.securityQuestions").jsonArray.map { (it as JsonPrimitive).content } }.getOrNull()?.takeIf { it.isNotEmpty() }?.let { qs = it }
    }
    return qs
}

/**
 * Parent sign-up. Phones: two short steps (account → recovery); tablets: one two-column form.
 * Afterwards the one-time recovery codes are shown and must be acknowledged.
 */
@Composable
fun SignUpScreen() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val win = LocalWindow.current
    val questions = rememberSecurityQuestions()
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var question by remember { mutableIntStateOf(0) }
    var answer by remember { mutableStateOf("") }
    var keep by remember { mutableStateOf(true) }
    var step by remember { mutableIntStateOf(1) }
    var codes by remember { mutableStateOf<List<String>?>(null) }
    var saved by remember { mutableStateOf(false) }
    val form = rememberForm()
    val twoCol = !win.isPhone

    fun step1Problems(): Map<String, String> = buildMap {
        if (!USERNAME_RE.matches(username.trim())) put("username", "Use 3–32 letters, numbers, dots, dashes or underscores.")
        passwordProblem(password)?.let { put("password", it) }
        if (password != confirm) put("confirm", "Passwords do not match.")
    }

    fun next() {
        val p = step1Problems()
        if (p.isNotEmpty()) form.fail("Please check the highlighted fields.", p) else { form.clear(); step = 2 }
    }

    fun submit() {
        scope.launch {
            form.run {
                val p = step1Problems().toMutableMap()
                if (email.isNotBlank() && !EMAIL_RE.matches(email.trim())) p["email"] = "Enter a valid email address."
                if (answer.trim().length < 2) p["securityAnswer"] = "Type an answer."
                if (p.isNotEmpty()) throw FormProblem("Please check the highlighted fields.", p)
                val r = app.api.post("/auth/register", buildJsonObject {
                    put("username", username.trim()); put("password", password)
                    email.trim().takeIf { it.isNotEmpty() }?.let { put("email", it) }
                    put("securityQuestion", question); put("securityAnswer", answer)
                    put("keepSignedIn", keep); put("deviceLabel", deviceLabel(app.platform))
                })
                password = ""; confirm = ""; answer = ""
                codes = r["recoveryCodes"]?.jsonArray?.map { (it as JsonPrimitive).content } ?: emptyList()
            }
            if (!twoCol && form.fields.keys.any { it in STEP1 }) step = 1
        }
    }

    BackHandler(enabled = codes == null && step == 2 && !twoCol) { step = 1 }
    // the account exists now: the codes must be acknowledged before leaving
    BackHandler(enabled = codes != null) { }

    val done = codes
    if (done != null) {
        AuthShell("Save your recovery codes", "These codes let you reset your password if you forget it — even without email. Each code works once. We will not show them again.", emoji = "🔑", wide = true) {
            RecoveryCodes(done, username.trim())
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Checkbox(saved, { saved = it })
                Text("I have saved these codes somewhere safe.", style = MaterialTheme.typography.bodyMedium)
            }
            if (email.isNotBlank()) AlertBox("We sent a confirmation link to ${email.trim()}. Confirm it to use email recovery.", AlertKind.Info)
            WLButton("Continue to set up learners", {
                scope.launch { runCatching { app.repo.refresh() }; app.replace(Routes.SETUP) }
            }, kind = BtnKind.Primary, enabled = saved, modifier = Modifier.fillMaxWidth())
        }
        return
    }

    val accountPart: @Composable () -> Unit = {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (twoCol) Text("Account", style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
            UsernameField(username, { username = it }, form.field("username"), "3–32 letters, numbers, dots, dashes or underscores. Avoid your child's real name.")
            PasswordField("Password", password, { password = it }, form.field("password"), "At least 8 characters, with letters and a number.", newPassword = true)
            PasswordField("Confirm password", confirm, { confirm = it }, form.field("confirm"), newPassword = true,
                imeAction = if (twoCol) ImeAction.Next else ImeAction.Done, onDone = { if (!twoCol) next() })
        }
    }
    val recoveryPart: @Composable () -> Unit = {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (twoCol) Text("Recovery", style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
            EmailField(email, { email = it }, "Parent email (optional, recommended)", form.field("email"), "Used only to recover your account. Without email, you'll use recovery codes.")
            DropdownField("Security question", questions, question, { question = it }, form.field("securityQuestion"),
                "Asked as an extra check during password recovery. It never resets your password on its own.")
            Field("Answer", answer, { answer = it }, error = form.field("securityAnswer"),
                keyboard = androidx.compose.foundation.text.KeyboardOptions(imeAction = ImeAction.Done, autoCorrectEnabled = false),
                actions = androidx.compose.foundation.text.KeyboardActions(onDone = { submit() }))
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Checkbox(keep, { keep = it })
                Text("Keep me signed in on this device", style = MaterialTheme.typography.bodyMedium)
            }
        }
    }

    AuthShell(
        "Create a parent account",
        "Parents create the account; children get their own profiles with just a nickname, avatar, class and age band.",
        onBack = { if (!twoCol && step == 2) step = 1 else app.back() },
        wide = true,
    ) {
        if (!twoCol) {
            Text("Step $step of 2 · ${if (step == 1) "Account" else "Recovery"}", style = MaterialTheme.typography.labelLarge, color = WL.colors.muted)
            Meter(step / 2f)
        }
        FormError(form)
        if (twoCol) {
            Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                Column(Modifier.weight(1f)) { accountPart() }
                Column(Modifier.weight(1f)) { recoveryPart() }
            }
            WLButton("Create account", ::submit, kind = BtnKind.Primary, loading = form.busy, modifier = Modifier.fillMaxWidth())
        } else if (step == 1) {
            accountPart()
            WLButton("Next", ::next, kind = BtnKind.Primary, modifier = Modifier.fillMaxWidth())
        } else {
            recoveryPart()
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                WLButton("Back", { form.clear(); step = 1 }, modifier = Modifier.weight(1f))
                WLButton("Create account", ::submit, kind = BtnKind.Primary, loading = form.busy, modifier = Modifier.weight(2f))
            }
        }
        Row(Modifier.fillMaxWidth().padding(top = 2.dp), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
            Text("Already have an account?", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
            LinkButton("Sign in") { app.replace(Routes.SIGNIN) }
        }
        Text("WonderLab has no ads, no tracking, no public profiles, no chat. We store only what's needed to run your family's account.",
            style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
    }
}
