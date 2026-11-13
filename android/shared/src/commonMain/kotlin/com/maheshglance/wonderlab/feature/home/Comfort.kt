package com.maheshglance.wonderlab.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.t
import kotlinx.serialization.json.JsonPrimitive

/** Learner comfort settings (text size, theme, motion, sound) — same options as the website's ComfortSettings. */
@Composable
fun ComfortButton() {
    var open by remember { mutableStateOf(false) }
    IconBtn(Icons.Rounded.Tune, "Comfort settings", { open = true }, size = 44.dp)
    if (open) ComfortDialog { open = false }
}

@Composable
fun ComfortDialog(onClose: () -> Unit) {
    val app = LocalApp.current
    val s by appState()
    val p = s.prefs
    fun set(k: String, v: Any) = app.repo.updatePrefs(mapOf(k to when (v) { is Boolean -> JsonPrimitive(v); is Number -> JsonPrimitive(v); else -> JsonPrimitive(v.toString()) }))
    Dialog(onDismissRequest = onClose) {
        WLCard(padding = 22.dp) {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text("Comfort", style = MaterialTheme.typography.headlineSmall)
                Text(t("textSize"), style = MaterialTheme.typography.titleSmall)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf(1f to "A", 1.15f to "A+", 1.3f to "A++").forEach { (v, l) -> WLButton(l, { set("textSize", v) }, kind = if (p.textSize == v) BtnKind.Primary else BtnKind.Normal, small = true) }
                }
                Text(t("theme"), style = MaterialTheme.typography.titleSmall)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("system" to "Auto", "light" to t("light"), "dark" to t("dark")).forEach { (v, l) -> WLButton(l, { set("theme", v) }, kind = if (p.theme == v) BtnKind.Primary else BtnKind.Normal, small = true) }
                }
                Toggle(t("reduceMotion"), p.reduceMotion) { set("reduceMotion", it) }
                Toggle("Read aloud", p.narration) { set("narration", it) }
                Toggle(t("mute"), p.mute) { set("mute", it) }
                Text(t("volume"), style = MaterialTheme.typography.titleSmall)
                Slider(p.volume, { set("volume", (it * 20).toInt() / 20f) }, colors = SliderDefaults.colors(thumbColor = WL.colors.primary, activeTrackColor = WL.colors.primary))
                WLButton(t("done"), onClose, kind = BtnKind.Primary, modifier = Modifier.fillMaxWidth())
            }
        }
    }
}

@Composable
fun Toggle(label: String, value: Boolean, onChange: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Text(label, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
        Switch(value, onChange)
    }
}
