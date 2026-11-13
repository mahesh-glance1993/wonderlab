package com.maheshglance.wonderlab.feature.parent

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Flag
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.net.ApiError
import com.maheshglance.wonderlab.feature.auth.Field
import com.maheshglance.wonderlab.ui.AppContext
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.t
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/**
 * Removes this device's WonderLab data: signs out (unless unsynced work would be lost and `force` is false) and
 * deletes every saved account snapshot, learner cache, queued upload and cached content on this device.
 * Returns "unsynced" when the parent must confirm first.
 */
suspend fun removeDeviceData(app: AppContext, force: Boolean): String {
    val r = app.repo.signOut(force)
    if (r == "unsynced") return r
    app.application.store.clearAll()
    app.api.cookieJar.clear()
    return "ok"
}

/** Sign out with the website's "unsynced work" confirmation. Call `start()` from a button. */
class SignOutFlow(private val app: AppContext) {
    var confirm by mutableStateOf(false)
    var busy by mutableStateOf(false)
    suspend fun start(force: Boolean = false) {
        busy = true
        try {
            val r = app.repo.signOut(force)
            if (r == "unsynced") confirm = true else { confirm = false; app.replace(Routes.SIGNIN) }
        } finally { busy = false }
    }
}

@Composable
fun rememberSignOutFlow(): SignOutFlow { val app = LocalApp.current; return remember { SignOutFlow(app) } }

@Composable
fun SignOutDialog(flow: SignOutFlow) {
    val scope = rememberCoroutineScope()
    val s by appState()
    if (!flow.confirm) return
    AlertDialog(
        onDismissRequest = { flow.confirm = false },
        title = { Text("Unsaved work on this device", style = MaterialTheme.typography.titleLarge) },
        text = {
            Text("${s.pending} change(s) — progress or artwork — haven't reached the server yet (this device may be offline). If you sign out now, that work will be deleted from this device.",
                style = MaterialTheme.typography.bodyLarge)
        },
        confirmButton = { TextButton({ scope.launch { flow.start(force = true) } }) { Text("Sign out and delete unsynced work", color = WL.colors.bad) } },
        dismissButton = { TextButton({ flow.confirm = false }) { Text("Stay signed in") } },
        containerColor = WL.colors.surface,
    )
}

/**
 * Private "Report a problem" (no personal details): sends the class and, when given, the lesson / question /
 * content version to `/api/p/:pid/reports`. Queued for later when offline. Reusable by lesson and game screens.
 */
@Composable
fun ReportProblemButton(lessonId: String? = null, questionId: String? = null, contentVersion: Int? = null, modifier: Modifier = Modifier) {
    val s by appState()
    var open by remember { mutableStateOf(false) }
    if (s.profile == null) return
    WLButton(t("reportProblem").let { if (it == "reportProblem") "Report a problem" else it }, { open = true }, modifier, kind = BtnKind.Ghost, icon = Icons.Rounded.Flag, small = true)
    if (open) ReportProblemDialog(lessonId, questionId, contentVersion) { open = false }
}

@Composable
fun ReportProblemDialog(lessonId: String?, questionId: String?, contentVersion: Int?, onClose: () -> Unit) {
    val app = LocalApp.current
    val s by appState()
    val scope = rememberCoroutineScope()
    var text by remember { mutableStateOf("") }
    var sent by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    val p = s.profile ?: s.profiles.firstOrNull()
    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("Report a problem", style = MaterialTheme.typography.titleLarge) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                val done = sent
                if (done != null) AlertBox(done, AlertKind.Good)
                else {
                    Text(if (lessonId != null || questionId != null) "We will send the lesson and question number. You don't need to type your name."
                        else "Tell us what looks wrong in WonderLab. You don't need to type your name.", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                    Field("What looks wrong? (optional)", text, { if (it.length <= 500) text = it }, singleLine = false,
                        keyboard = KeyboardOptions(capitalization = KeyboardCapitalization.Sentences))
                }
            }
        },
        confirmButton = {
            if (sent == null) TextButton(enabled = !busy && p != null, onClick = {
                val pid = p?.id ?: return@TextButton
                val body = buildJsonObject {
                    put("classLevel", p.classLevel)
                    lessonId?.let { put("lessonId", it) }; questionId?.let { put("questionId", it) }; contentVersion?.let { put("contentVersion", it) }
                    put("description", text.trim())
                }
                busy = true
                scope.launch {
                    sent = try {
                        app.api.post("/p/$pid/reports", body); "Thank you! We will look at it."
                    } catch (e: ApiError) {
                        if (e.status == 0) { app.repo.queueRequest("POST", "/p/$pid/reports", body); "Thank you! It will be sent when you're online." }
                        else "Thank you! We will look at it."
                    }
                    busy = false
                }
            }) { Text("Send", color = WL.colors.primary) }
            else TextButton(onClose) { Text(t("done").let { if (it == "done") "Done" else it }) }
        },
        dismissButton = { if (sent == null) TextButton(onClose) { Text("Cancel") } },
        containerColor = WL.colors.surface,
    )
}

