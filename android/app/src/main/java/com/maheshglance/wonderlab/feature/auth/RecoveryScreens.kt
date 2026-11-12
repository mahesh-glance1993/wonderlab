package com.maheshglance.wonderlab.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.net.ApiError
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

private const val PW_HINT = "At least 8 characters, with letters and a number."

/** `/forgot` and `/forgot/code`: reset by emailed link or by recovery code (each plus the security answer). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ForgotScreen(initial: String = "email") {
    val app = LocalApp.current
    var mode by remember { mutableStateOf(if (initial == "code") "code" else "email") }
    AuthShell("Reset your password", "Use your verified email or one of your recovery codes. Either way you'll also answer your security question.", onBack = { app.back() }, emoji = "🔑") {
        Segmented(listOf("email" to "Email me a link", "code" to "Use a recovery code"), mode, { mode = it })
        if (mode == "email") ForgotEmail() else ForgotCode()
        FlowRow(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally)) {
            LinkButton("I have a reset link") { app.go("reset") }
            LinkButton("Forgot username?") { app.go("forgot/username") }
            LinkButton("Back to sign in") { app.replace(Routes.SIGNIN) }
        }
    }
}

@Composable
private fun ForgotEmail() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var id by remember { mutableStateOf("") }
    var msg by remember { mutableStateOf<String?>(null) }
    val form = rememberForm()
    fun submit() = scope.launch {
        form.run {
            if (id.isBlank()) throw FormProblem("Enter your username or email.")
            val r = app.api.post("/auth/forgot-password", buildJsonObject { put("identifier", id.trim()) })
            msg = (r["message"] as? JsonPrimitive)?.content ?: "If the details match an account, we have sent instructions."
        }
    }
    val m = msg
    if (m != null) {
        AlertBox(m, AlertKind.Good)
        Text("Open the link in the email on this device, or copy it and choose \"I have a reset link\". The link works once and expires in 30 minutes.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
        WLButton("I have a reset link", { app.go("reset") }, kind = BtnKind.Primary, modifier = Modifier.fillMaxWidth())
        return
    }
    FormError(form)
    Field("Username or email", id, { id = it }, keyboard = KeyboardOptions(imeAction = ImeAction.Done, autoCorrectEnabled = false), actions = KeyboardActions(onDone = { submit() }))
    WLButton("Send reset link", { submit() }, kind = BtnKind.Primary, loading = form.busy, modifier = Modifier.fillMaxWidth())
}

@Composable
private fun ForgotCode() {
    val app = LocalApp.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var step by remember { mutableIntStateOf(1) }
    var username by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var answer by remember { mutableStateOf("") }
    var pw by remember { mutableStateOf("") }
    var pw2 by remember { mutableStateOf("") }
    var question by remember { mutableStateOf("") }
    val form = rememberForm()

    fun check() = scope.launch {
        form.run {
            if (username.isBlank() || code.isBlank()) throw FormProblem("Enter your username and a recovery code.")
            val r = app.api.post("/auth/recovery-code/check", buildJsonObject { put("username", username.trim()); put("code", code.trim()) })
            question = (r["securityQuestion"] as? JsonPrimitive)?.content ?: "Security answer"
            step = 2
        }
    }
    fun reset() = scope.launch {
        form.run {
            passwordProblem(pw)?.let { throw FormProblem(it, mapOf("newPassword" to it)) }
            if (pw != pw2) throw FormProblem("Passwords do not match.", mapOf("confirm" to "Passwords do not match."))
            val r = app.api.post("/auth/reset-with-code", buildJsonObject {
                put("username", username.trim()); put("code", code.trim()); put("securityAnswer", answer); put("newPassword", pw)
            })
            pw = ""; pw2 = ""; answer = ""
            val left = (r["codesLeft"] as? JsonPrimitive)?.content ?: "0"
            runCatching { app.repo.refresh() }
            toast(context, "Password changed. $left recovery codes left. Please sign in.")
            app.replace(Routes.SIGNIN)
        }
    }

    FormError(form)
    if (step == 1) {
        UsernameField(username, { username = it })
        Field("Recovery code", code, { code = it }, hint = "Like ABCDE-FGHJK",
            keyboard = KeyboardOptions(capitalization = KeyboardCapitalization.Characters, imeAction = ImeAction.Done, autoCorrectEnabled = false),
            actions = KeyboardActions(onDone = { check() }))
        WLButton("Next", { check() }, kind = BtnKind.Primary, loading = form.busy, modifier = Modifier.fillMaxWidth())
    } else {
        Field(question, answer, { answer = it }, singleLine = false, keyboard = KeyboardOptions(imeAction = ImeAction.Next, autoCorrectEnabled = false))
        PasswordField("New password", pw, { pw = it }, form.field("newPassword"), PW_HINT, newPassword = true)
        PasswordField("Confirm new password", pw2, { pw2 = it }, form.field("confirm"), newPassword = true, imeAction = ImeAction.Done, onDone = { reset() })
        WLButton("Reset password", { reset() }, kind = BtnKind.Primary, loading = form.busy, modifier = Modifier.fillMaxWidth())
        Text("All devices will be signed out after the reset.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
    }
}

/**
 * `/reset?token=…` — choose a new password from the emailed link. Without an Android App Link the parent can
 * paste the link (or just its token) here.
 */
@Composable
fun ResetScreen(initialToken: String?) {
    val app = LocalApp.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var token by remember { mutableStateOf(initialToken?.let(::tokenFrom).orEmpty()) }
    var pasted by remember { mutableStateOf("") }
    var question by remember { mutableStateOf<String?>(null) }
    var bad by remember { mutableStateOf<String?>(null) }
    var answer by remember { mutableStateOf("") }
    var pw by remember { mutableStateOf("") }
    var pw2 by remember { mutableStateOf("") }
    val form = rememberForm()

    LaunchedEffect(token) {
        if (token.isBlank()) return@LaunchedEffect
        bad = null; question = null
        try {
            val r = app.api.post("/auth/reset-token-info", buildJsonObject { put("token", token) })
            question = (r["securityQuestion"] as? JsonPrimitive)?.content ?: "Security answer"
        } catch (e: ApiError) {
            bad = if (e.status == 0) OFFLINE_AUTH else e.message
        }
    }

    fun reset() = scope.launch {
        form.run {
            passwordProblem(pw)?.let { throw FormProblem(it, mapOf("newPassword" to it)) }
            if (pw != pw2) throw FormProblem("Passwords do not match.", mapOf("confirm" to "Passwords do not match."))
            app.api.post("/auth/reset-with-token", buildJsonObject { put("token", token); put("securityAnswer", answer); put("newPassword", pw) })
            pw = ""; pw2 = ""; answer = ""
            runCatching { app.repo.refresh() }
            toast(context, "Password changed. Please sign in.")
            app.replace(Routes.SIGNIN)
        }
    }

    AuthShell("Choose a new password", onBack = { app.back() }, emoji = "🔑") {
        when {
            token.isBlank() -> {
                Text("Paste the reset link from your email (or just the code after \"token=\").", style = MaterialTheme.typography.bodyMedium, color = WL.colors.text)
                Field("Reset link", pasted, { pasted = it }, singleLine = false,
                    keyboard = KeyboardOptions(imeAction = ImeAction.Done, autoCorrectEnabled = false), actions = KeyboardActions(onDone = { token = tokenFrom(pasted) }))
                WLButton("Continue", { token = tokenFrom(pasted) }, kind = BtnKind.Primary, enabled = pasted.isNotBlank(), modifier = Modifier.fillMaxWidth())
            }
            bad != null -> {
                AlertBox(bad!!, AlertKind.Bad)
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    WLButton("Try another link", { pasted = ""; token = ""; bad = null }, modifier = Modifier.fillMaxWidth())
                    WLButton("Request a new link", { app.go(Routes.FORGOT) }, kind = BtnKind.Ghost, modifier = Modifier.fillMaxWidth())
                }
            }
            question == null -> Text("Checking link…", style = MaterialTheme.typography.bodyLarge, color = WL.colors.muted)
            else -> {
                FormError(form)
                Field(question!!, answer, { answer = it }, singleLine = false, keyboard = KeyboardOptions(imeAction = ImeAction.Next, autoCorrectEnabled = false))
                PasswordField("New password", pw, { pw = it }, form.field("newPassword"), PW_HINT, newPassword = true)
                PasswordField("Confirm new password", pw2, { pw2 = it }, form.field("confirm"), newPassword = true, imeAction = ImeAction.Done, onDone = { reset() })
                WLButton("Reset password", { reset() }, kind = BtnKind.Primary, loading = form.busy, modifier = Modifier.fillMaxWidth())
                Text("All devices will be signed out after the reset.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            }
        }
    }
}

/** `/forgot/username` — emails the username to a verified parent email. */
@Composable
fun ForgotUsernameScreen() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var msg by remember { mutableStateOf<String?>(null) }
    val form = rememberForm()
    fun submit() = scope.launch {
        form.run {
            if (!EMAIL_RE.matches(email.trim())) throw FormProblem("Enter a valid email address.", mapOf("email" to "Enter a valid email address."))
            val r = app.api.post("/auth/forgot-username", buildJsonObject { put("email", email.trim()) })
            msg = (r["message"] as? JsonPrimitive)?.content ?: "If that email belongs to a verified account, we have sent the username to it."
        }
    }
    AuthShell("Forgot username", "We'll email the username to a verified parent email.", onBack = { app.back() }, emoji = "🔑") {
        val m = msg
        if (m != null) AlertBox(m, AlertKind.Good) else {
            FormError(form)
            EmailField(email, { email = it }, "Parent email", form.field("email"), imeAction = ImeAction.Done, onDone = { submit() })
            WLButton("Send username", { submit() }, kind = BtnKind.Primary, loading = form.busy, modifier = Modifier.fillMaxWidth())
        }
        LinkButton("Back to sign in") { app.replace(Routes.SIGNIN) }
    }
}

/** `/verify-email?token=…` — confirms the parent email (paste fallback when opened without the link). */
@Composable
fun VerifyEmailScreen(initialToken: String?) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var token by remember { mutableStateOf(initialToken?.let(::tokenFrom).orEmpty()) }
    var pasted by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("idle") } // idle | checking | ok | <error>
    LaunchedEffect(token) {
        if (token.isBlank()) return@LaunchedEffect
        state = "checking"
        state = try {
            app.api.post("/auth/verify-email", buildJsonObject { put("token", token) }); "ok"
        } catch (e: ApiError) { if (e.status == 0) OFFLINE_AUTH else e.message ?: "This link is invalid or has expired." }
    }
    AuthShell("Confirm email", onBack = { app.back() }, emoji = "🔑") {
        when (state) {
            "idle" -> {
                Text("Paste the confirmation link from your email.", style = MaterialTheme.typography.bodyMedium, color = WL.colors.text)
                Field("Confirmation link", pasted, { pasted = it }, singleLine = false, keyboard = KeyboardOptions(imeAction = ImeAction.Done, autoCorrectEnabled = false),
                    actions = KeyboardActions(onDone = { token = tokenFrom(pasted) }))
                WLButton("Confirm", { token = tokenFrom(pasted) }, kind = BtnKind.Primary, enabled = pasted.isNotBlank(), modifier = Modifier.fillMaxWidth())
            }
            "checking" -> Text("Checking…", style = MaterialTheme.typography.bodyLarge, color = WL.colors.muted)
            "ok" -> AlertBox("Email confirmed. You can now use it to recover your account.", AlertKind.Good)
            else -> {
                AlertBox(state, AlertKind.Bad)
                WLButton("Try another link", { pasted = ""; token = ""; state = "idle" }, modifier = Modifier.fillMaxWidth())
            }
        }
        WLButton("Continue", { scope.launch { runCatching { app.repo.refresh() }; app.replace(Routes.HOME) } }, kind = if (state == "ok") BtnKind.Primary else BtnKind.Ghost, modifier = Modifier.fillMaxWidth())
    }
}
