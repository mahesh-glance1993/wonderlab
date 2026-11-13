package com.maheshglance.wonderlab.feature.parent

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.Logout
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material.icons.rounded.Key
import androidx.compose.material.icons.rounded.PhoneAndroid
import androidx.compose.material.icons.rounded.Schedule
import androidx.compose.material.icons.rounded.Shield
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.data.MasteryState
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.ConfirmDialog
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.Meter
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.net.ApiError
import com.maheshglance.wonderlab.feature.auth.DropdownField
import com.maheshglance.wonderlab.feature.auth.EmailField
import com.maheshglance.wonderlab.feature.auth.Field
import com.maheshglance.wonderlab.feature.auth.FormError
import com.maheshglance.wonderlab.feature.auth.FormProblem
import com.maheshglance.wonderlab.feature.auth.PasswordField
import com.maheshglance.wonderlab.feature.auth.RecoveryCodes
import com.maheshglance.wonderlab.feature.auth.passwordProblem
import com.maheshglance.wonderlab.feature.auth.rememberForm
import com.maheshglance.wonderlab.feature.auth.rememberSecurityQuestions
import com.maheshglance.wonderlab.feature.auth.toast
import com.maheshglance.wonderlab.feature.progress.masteryStatus
import com.maheshglance.wonderlab.feature.progress.rememberOutline
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.put
import java.text.DateFormat
import java.util.Date

private val PrettyJson = Json { prettyPrint = true }
private fun fmtTime(sec: Long): String = DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(sec * 1000))
private fun ApiError.friendly() = if (status == 0) "You are offline. This needs an internet connection." else message ?: "Could not save."

// ---------------------------------------------------------------- progress (any learner in the family)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ParentProgressSection() {
    val app = LocalApp.current
    val s by appState()
    val levels = rememberLevels()
    var pid by remember { mutableStateOf(s.profileId ?: s.profiles.firstOrNull()?.id) }
    val p = s.profiles.firstOrNull { it.id == pid }
    val outline = rememberOutline(p?.classLevel)
    var mastery by remember(pid) { mutableStateOf<Map<String, MasteryState>?>(null) }
    var note by remember(pid) { mutableStateOf<String?>(null) }
    LaunchedEffect(pid) {
        val id = pid ?: return@LaunchedEffect
        mastery = try {
            app.api.get("/p/$id/state")["mastery"]?.jsonArray?.map { AppJson.decodeFromJsonElement<MasteryState>(it) }?.associateBy { it.objectiveId } ?: emptyMap()
        } catch (e: ApiError) {
            note = if (e.status == 0) "Offline — showing what is saved on this device." else e.message
            if (id == app.repo.state.value.profileId) app.repo.state.value.learner.mastery else emptyMap()
        }
    }

    Text("Progress", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
    if (p == null) { Text("No learners yet.", color = WL.colors.muted); return }
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        s.profiles.forEach { x ->
            Row(
                Modifier.clip(RoundedCornerShape(16.dp)).background(if (x.id == pid) WL.colors.primary else WL.colors.surface2)
                    .padding(start = 8.dp), verticalAlignment = Alignment.CenterVertically,
            ) {
                EmojiImage(levels.emoji(x.avatar), 28.dp)
                WLButton(x.nickname, { pid = x.id }, kind = if (x.id == pid) BtnKind.Primary else BtnKind.Ghost, small = true)
            }
        }
    }
    Text("${p.nickname} · ${levels.classLabel(p.classLevel)}", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
    note?.let { AlertBox(it, AlertKind.Warn) }
    val m = mastery
    if (outline == null || m == null) { Text("Loading…", color = WL.colors.muted); return }
    val rows = outline.units.map { u ->
        val st = u.objectives.map { masteryStatus(m[it.id]) }
        RowData(u.title.en, st.count { it == "mastered" }, st.count { it != "new" }, st.count { it == "practice" }, st.size)
    }
    SettingsCard("Progress by topic") {
        rows.forEach { r ->
            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(WL.colors.surface2).padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(r.title, style = MaterialTheme.typography.titleSmall, color = WL.colors.text, modifier = Modifier.weight(1f))
                    if (r.practice > 0) Pill("${r.practice} need practice", bg = WL.colors.warnBg, fg = WL.colors.warn)
                }
                Meter(if (r.total == 0) 0f else r.mastered.toFloat() / r.total, color = WL.colors.good)
                Text("Mastered ${r.mastered} / ${r.total} · Started ${r.started}", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            }
        }
    }
    val weak = rows.filter { it.practice > 0 }
    if (weak.isNotEmpty()) AlertBox("Areas that need practice: ${weak.joinToString(", ") { it.title }}.", AlertKind.Warn)
}

private data class RowData(val title: String, val mastered: Int, val started: Int, val practice: Int, val total: Int)

// ---------------------------------------------------------------- account

@Composable
fun AccountSection() {
    val app = LocalApp.current
    val s by appState()
    val scope = rememberCoroutineScope()
    val questions = rememberSecurityQuestions()
    val acct = s.account ?: return
    var email by remember(acct.email) { mutableStateOf(acct.email.orEmpty()) }
    var current by remember { mutableStateOf("") }
    var next by remember { mutableStateOf("") }
    var q by remember { mutableIntStateOf(0) }
    var answer by remember { mutableStateOf("") }
    val emailForm = rememberForm(); val pwForm = rememberForm(); val qForm = rememberForm()
    var emailOk by remember { mutableStateOf<String?>(null) }
    var pwOk by remember { mutableStateOf<String?>(null) }
    var qOk by remember { mutableStateOf<String?>(null) }

    suspend fun patch(body: JsonObject) { app.api.patch("/account", body); app.repo.refresh() }

    Text("Account", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
    AdaptiveColumns(left = {
        SettingsCard("Email", subtitle = when {
            acct.email == null -> "No email. You recover your account with recovery codes."
            acct.emailVerified -> "Verified — can be used for recovery."
            else -> "Not verified yet — check your inbox."
        }) {
            emailOk?.let { AlertBox(it, AlertKind.Good) }
            FormError(emailForm)
            EmailField(email, { email = it }, "Parent email", emailForm.field("email"), imeAction = ImeAction.Done)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                WLButton("Save email", {
                    emailOk = null
                    scope.launch { emailForm.run {
                        patch(buildJsonObject { if (email.isBlank()) put("email", JsonNull) else put("email", email.trim()) })
                        emailOk = if (email.isBlank()) "Email removed." else "Saved. We sent a confirmation link."
                    } }
                }, kind = BtnKind.Primary, loading = emailForm.busy, small = true)
                if (acct.email != null && !acct.emailVerified) WLButton("Resend link", {
                    emailOk = null
                    scope.launch { emailForm.run { app.api.post("/account/resend-verification"); emailOk = "Link sent." } }
                }, small = true)
                if (acct.email != null && !acct.emailVerified) WLButton("Paste link", { app.go("verify-email") }, kind = BtnKind.Ghost, small = true)
            }
        }
        SettingsCard("Security question", subtitle = "Current: ${acct.securityQuestion ?: "—"}") {
            qOk?.let { AlertBox(it, AlertKind.Good) }
            FormError(qForm)
            DropdownField("New question", questions, q, { q = it })
            Field("Answer", answer, { answer = it }, keyboard = KeyboardOptions(imeAction = ImeAction.Done, autoCorrectEnabled = false))
            WLButton("Save question", {
                qOk = null
                scope.launch { qForm.run {
                    if (answer.trim().length < 2) throw FormProblem("Type an answer.")
                    patch(buildJsonObject { put("securityQuestion", q); put("securityAnswer", answer) })
                    answer = ""; qOk = "Security question updated."
                } }
            }, kind = BtnKind.Primary, loading = qForm.busy, small = true)
        }
    }, right = {
        SettingsCard("Password", subtitle = "Other devices will be signed out when you change it.") {
            pwOk?.let { AlertBox(it, AlertKind.Good) }
            FormError(pwForm)
            PasswordField("Current password", current, { current = it }, pwForm.field("currentPassword"))
            PasswordField("New password", next, { next = it }, pwForm.field("newPassword"), "At least 8 characters with letters and a number.", newPassword = true, imeAction = ImeAction.Done)
            WLButton("Change password", {
                pwOk = null
                scope.launch { pwForm.run {
                    passwordProblem(next)?.let { throw FormProblem(it, mapOf("newPassword" to it)) }
                    patch(buildJsonObject { put("currentPassword", current); put("newPassword", next) })
                    current = ""; next = ""; pwOk = "Password changed. Other devices were signed out."
                } }
            }, kind = BtnKind.Primary, loading = pwForm.busy, small = true)
        }
    })
}

// ---------------------------------------------------------------- sign-in & security

private data class SessionRow(val id: String, val persistent: Boolean, val lastSeen: Long, val device: String, val current: Boolean)

@Composable
fun SecuritySection() {
    val app = LocalApp.current
    val s by appState()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var sessions by remember { mutableStateOf<List<SessionRow>?>(null) }
    var codesLeft by remember { mutableStateOf<Int?>(null) }
    var codes by remember { mutableStateOf<List<String>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var confirmCodes by remember { mutableStateOf(false) }
    var reload by remember { mutableIntStateOf(0) }
    val codesForm = rememberForm()

    LaunchedEffect(reload) {
        try {
            sessions = app.api.get("/account/sessions")["sessions"]?.jsonArray?.map { e ->
                val o = e.jsonObject
                SessionRow(o["id"]?.jsonPrimitive?.contentOrNull.orEmpty(), o["persistent"]?.jsonPrimitive?.booleanOrNull == true,
                    o["lastSeen"]?.jsonPrimitive?.longOrNull ?: 0, o["device"]?.jsonPrimitive?.contentOrNull.orEmpty(), o["current"]?.jsonPrimitive?.booleanOrNull == true)
            } ?: emptyList()
            codesLeft = app.api.get("/account/recovery-codes")["remaining"]?.jsonPrimitive?.intOrNull
            error = null
        } catch (e: ApiError) { error = e.friendly() }
    }
    fun act(block: suspend () -> Unit, ok: String) = scope.launch {
        try { block(); toast(context, ok); reload++ } catch (e: ApiError) { error = e.friendly() }
    }

    Text("Sign-in & security", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
    error?.let { AlertBox(it, AlertKind.Bad) }
    AdaptiveColumns(minTwoCol = 820.dp, left = {
        SettingsCard("Signed-in devices", subtitle = "Trusted devices stay signed in. Sign-out, inactivity or a password reset means signing in again.") {
            val list = sessions
            if (list == null) Text("Loading…", color = WL.colors.muted)
            list?.forEach { r ->
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(WL.colors.surface2).padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Icon(if (r.persistent) Icons.Rounded.Shield else Icons.Rounded.Schedule, null, tint = WL.colors.muted)
                    Column(Modifier.weight(1f)) {
                        Text(r.device.ifBlank { "Device" }, style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
                        Text("${if (r.persistent) "Kept signed in" else "Shared device"} · last used ${fmtTime(r.lastSeen)}", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                    }
                    if (r.current) Pill("This device", icon = Icons.Rounded.PhoneAndroid)
                    else WLButton("Sign out", { act({ app.api.delete("/account/sessions/${r.id}") }, "Signed out that device") }, kind = BtnKind.Danger, small = true)
                }
            }
            WLButton("Sign out all other devices", { act({ app.api.post("/account/sessions/revoke-others") }, "Other devices signed out") }, icon = Icons.AutoMirrored.Rounded.Logout, small = true)
        }
    }, right = {
        SettingsCard("Recovery codes", subtitle = "${codesLeft ?: "…"} unused codes left. Making new codes cancels the old ones.") {
            FormError(codesForm)
            val c = codes
            if (c != null) {
                RecoveryCodes(c, s.account?.username.orEmpty(), cellWidth = 140.dp)
                AlertBox("These are shown only once. Save them somewhere safe.", AlertKind.Warn)
            } else WLButton("Make new recovery codes", { confirmCodes = true }, icon = Icons.Rounded.Key, loading = codesForm.busy, small = true)
        }
    })
    if (confirmCodes) ConfirmDialog("Make new recovery codes?", "Your old codes will stop working.", "Make new codes", onConfirm = {
        confirmCodes = false
        scope.launch { codesForm.run {
            codes = app.api.post("/account/recovery-codes")["recoveryCodes"]?.jsonArray?.map { (it as JsonPrimitive).content }
            codesLeft = codes?.size
        } }
    }, onDismiss = { confirmCodes = false })
}

// ---------------------------------------------------------------- your data

@Composable
fun DataSection() {
    val app = LocalApp.current
    val s by appState()
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var exportText by remember { mutableStateOf<String?>(null) }
    val exportForm = rememberForm()
    val saver = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        val text = exportText
        if (uri != null && text != null) runCatching { context.contentResolver.openOutputStream(uri)?.use { it.write(text.toByteArray()) } }
            .onSuccess { toast(context, "Exported") }.onFailure { toast(context, "Could not save the file.") }
        exportText = null
    }
    var deleteOpen by remember { mutableStateOf(false) }
    var removeAsk by remember { mutableStateOf(false) }
    var removeUnsynced by remember { mutableStateOf(false) }
    var report by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { app.repo.countPending() }

    Text("Your data", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
    AdaptiveColumns(left = {
        SettingsCard("Export", subtitle = "Download all learner progress, settings and artwork as a JSON file.") {
            FormError(exportForm)
            WLButton("Export my family's data", {
                scope.launch { exportForm.run {
                    exportText = PrettyJson.encodeToString(JsonObject.serializer(), app.api.get("/account/export"))
                    saver.launch("wonderlab-export.json")
                } }
            }, icon = Icons.Rounded.Download, loading = exportForm.busy, small = true)
        }
        SettingsCard("Report a problem", subtitle = "Something wrong in a lesson, game or translation? Tell us privately — no personal details needed.") {
            WLButton("Report a problem", { report = true }, icon = Icons.Rounded.Flag, small = true, enabled = s.profiles.isNotEmpty())
        }
        SettingsCard("This device", subtitle = "Removes saved learner data, queued uploads and offline access for every account on this device, and signs out. Lessons, games and art stay — they are part of the app.") {
            if (s.pending > 0) AlertBox("${s.pending} change(s) on this device haven't synced yet.", AlertKind.Warn)
            WLButton("Remove this device's data", { removeAsk = true }, kind = BtnKind.Danger, icon = Icons.Rounded.Delete, small = true)
        }
    }, right = {
        SettingsCard("Delete account", subtitle = "Permanently deletes your account, all learner profiles, progress and artwork. This cannot be undone.") {
            if (s.pending > 0) AlertBox("${s.pending} change(s) on this device haven't synced yet.", AlertKind.Warn)
            WLButton("Delete account…", { deleteOpen = true }, kind = BtnKind.Danger, icon = Icons.Rounded.Delete, small = true)
        }
        Row(Modifier.padding(4.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            EmojiImage("🔒", 36.dp)
            Text("WonderLab collects only what it needs: a username, password and security answer (stored as secure hashes), an optional email, and each learner's nickname, avatar, class and age band. No ads, tracking, public profiles, public galleries, leaderboards or chat.",
                style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
        }
    })

    if (report) ReportProblemDialog(null, null, null) { report = false }
    if (removeAsk) ConfirmDialog(
        if (removeUnsynced) "Delete unsynced work?" else "Remove this device's data?",
        if (removeUnsynced) "${s.pending} item(s) have not been uploaded yet and will be lost." else "You will be signed out and everything WonderLab saved on this device will be removed. Your account and synced progress stay safe on the server.",
        if (removeUnsynced) "Delete anyway" else "Remove",
        onConfirm = {
            scope.launch {
                val r = removeDeviceData(app, force = removeUnsynced)
                if (r == "unsynced") removeUnsynced = true else { removeAsk = false; removeUnsynced = false; app.replace(Routes.SIGNIN) }
            }
        },
        onDismiss = { removeAsk = false; removeUnsynced = false }, dismiss = "Keep everything", danger = true,
    )
    if (deleteOpen) DeleteAccountDialog { deleteOpen = false }
}

@Composable
private fun DeleteAccountDialog(onClose: () -> Unit) {
    val app = LocalApp.current
    val s by appState()
    val scope = rememberCoroutineScope()
    var confirm by remember { mutableStateOf("") }
    val form = rememberForm()
    val username = s.account?.username.orEmpty()
    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("Delete account permanently?", style = MaterialTheme.typography.titleLarge) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                FormError(form)
                Field("Type your username ($username) to confirm", confirm, { confirm = it }, error = form.field("confirmUsername"),
                    keyboard = KeyboardOptions(autoCorrectEnabled = false))
            }
        },
        confirmButton = {
            TextButton(enabled = !form.busy && confirm.isNotBlank(), onClick = {
                scope.launch { form.run {
                    app.api.request("/account", "DELETE", buildJsonObject { put("confirmUsername", confirm.trim()) })
                    app.repo.signOut(force = true)
                    onClose()
                    app.replace(Routes.SIGNUP)
                } }
            }) { Text("Delete everything", color = WL.colors.bad) }
        },
        dismissButton = { TextButton(onClose) { Text("Cancel") } },
        containerColor = WL.colors.surface,
    )
}
