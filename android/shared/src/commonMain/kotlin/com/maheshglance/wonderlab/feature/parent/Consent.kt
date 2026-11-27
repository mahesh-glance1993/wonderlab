package com.maheshglance.wonderlab.feature.parent

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.feature.auth.FormError
import com.maheshglance.wonderlab.feature.auth.FormProblem
import com.maheshglance.wonderlab.feature.auth.LinkButton
import com.maheshglance.wonderlab.feature.auth.rememberForm
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

// Parental consent (DPDP Act 2023) and links to the Privacy Policy / Terms, which live on the website
// (src/features/legal on the web; same text in English and Telugu).

const val LEGAL_SITE = "https://learn.maheshglance.com"
const val PRIVACY_URL = "$LEGAL_SITE/privacy"
const val TERMS_URL = "$LEGAL_SITE/terms"

/** Two link buttons that open the Privacy Policy and Terms in the browser. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LegalLinks(telugu: Boolean = false) {
    val uri = LocalUriHandler.current
    val q = if (telugu) "?lang=te" else ""
    FlowRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        LinkButton(if (telugu) "గోప్యతా విధానం" else "Privacy Policy") { runCatching { uri.openUri(PRIVACY_URL + q) } }
        LinkButton(if (telugu) "నిబంధనలు" else "Terms of Use") { runCatching { uri.openUri(TERMS_URL + q) } }
    }
}

/** The required sign-up / first-setup checkbox (same wording as the website). */
@Composable
fun ConsentCheckbox(checked: Boolean, onChange: (Boolean) -> Unit, error: String? = null) {
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked, onChange)
            Column(Modifier.weight(1f)) {
                Text("I am the parent/guardian (18+) and agree to the Privacy Policy and Terms",
                    style = MaterialTheme.typography.bodyMedium, color = WL.colors.text)
                Text("నేను తల్లిదండ్రి/సంరక్షకుడిని (18+), గోప్యతా విధానం మరియు నిబంధనలకు అంగీకరిస్తున్నాను",
                    style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            }
        }
        LegalLinks()
        if (error != null) Text(error, style = MaterialTheme.typography.bodySmall, color = WL.colors.bad, modifier = Modifier.padding(start = 12.dp))
    }
}

/** Asked once, after the parent check, when the account has not agreed to the current Privacy Policy and Terms. */
@Composable
fun ConsentCard(modifier: Modifier = Modifier.fillMaxWidth()) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var agreed by remember { mutableStateOf(false) }
    var deleteOpen by remember { mutableStateOf(false) }
    val form = rememberForm()
    WLCard(modifier, padding = 22.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                EmojiImage("🛡️", 48.dp)
                Text("Privacy and parental consent", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
            }
            Text("Before you continue, please read our Privacy Policy and Terms. They explain what WonderLab stores about your family, that there are no ads or tracking, and how to download or delete your data.",
                style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
            Text("కొనసాగే ముందు దయచేసి మా గోప్యతా విధానం మరియు నిబంధనలను చదవండి.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            FormError(form)
            ConsentCheckbox(agreed, { agreed = it }, form.field("consent"))
            WLButton("Agree and continue", {
                scope.launch { form.run {
                    if (!agreed) throw FormProblem("Please tick the box to agree.", mapOf("consent" to "Please tick the box to agree."))
                    app.api.post("/account/consent", buildJsonObject { put("consent", true) })
                    app.repo.refresh()
                } }
            }, kind = BtnKind.Primary, loading = form.busy, enabled = agreed, modifier = Modifier.fillMaxWidth())
            Text("Don't agree? WonderLab can't be used without it, but you can delete the account and all its data instead.",
                style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            WLButton("Delete account and all data…", { deleteOpen = true }, kind = BtnKind.Danger, icon = Icons.Rounded.Delete, small = true)
        }
    }
    if (deleteOpen) DeleteAccountDialog { deleteOpen = false }
}
