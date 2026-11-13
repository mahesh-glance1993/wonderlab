package com.maheshglance.wonderlab.feature.parent

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.ExpandLess
import androidx.compose.material.icons.rounded.ExpandMore
import androidx.compose.material.icons.rounded.VolumeUp
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.maheshglance.wonderlab.core.data.Prefs
import com.maheshglance.wonderlab.core.data.Profile
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.ConfirmDialog
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.net.ApiError
import com.maheshglance.wonderlab.feature.auth.DropdownField
import com.maheshglance.wonderlab.feature.auth.Segmented
import com.maheshglance.wonderlab.feature.auth.toast
import com.maheshglance.wonderlab.feature.home.Toggle
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.decodeFromJsonElement

val NATURAL_SPEAKERS = listOf(
    "luna" to "Luna (warm, female)", "asteria" to "Asteria (clear, female)", "athena" to "Athena (calm, female)", "hera" to "Hera (gentle, female)",
    "aurora" to "Aurora (bright, female)", "orion" to "Orion (friendly, male)", "apollo" to "Apollo (calm, male)", "arcas" to "Arcas (soft, male)",
)

/** Learner profiles: edit, remove (permanent), and every learner setting. */
@Composable
fun LearnersSection() {
    val s by appState()
    val levels = rememberLevels()
    var editing by remember { mutableStateOf<Profile?>(null) }
    var adding by remember { mutableStateOf(false) }
    var removing by remember { mutableStateOf<Profile?>(null) }
    val app = LocalApp.current
    val context = LocalPlatform.current
    val scope = rememberCoroutineScope()

    Text("Learners", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
    if (s.profiles.isEmpty()) AlertBox("No learners yet. Add one to start.", AlertKind.Info)
    s.profiles.forEach { p -> LearnerCard(p, levels, onEdit = { editing = p }, onRemove = { removing = p }) }
    WLButton("Add learner", { adding = true }, icon = Icons.Rounded.Add, kind = BtnKind.Primary)

    if (adding || editing != null) ProfileDialog(editing, onClose = { adding = false; editing = null }) { p ->
        toast(context, if (editing == null) "${p.nickname} added" else "Saved")
        adding = false; editing = null
    }
    removing?.let { p ->
        ConfirmDialog(
            "Remove ${p.nickname}?",
            "This permanently deletes ${p.nickname}'s progress, artwork and saved work on all devices. It cannot be undone. Consider exporting your data first (Your data → Export).",
            "Delete permanently",
            onConfirm = {
                scope.launch {
                    try { app.repo.deleteProfile(p.id); toast(context, "Learner removed") }
                    catch (e: ApiError) { toast(context, if (e.status == 0) "You are offline. Removing a learner needs internet." else e.message ?: "Could not remove.") }
                    removing = null
                }
            },
            onDismiss = { removing = null }, dismiss = "Keep", danger = true,
        )
    }
}

@Composable
fun ProfileDialog(initial: Profile?, onClose: () -> Unit, onSaved: (Profile) -> Unit) {
    val win = LocalWindow.current
    Dialog(onDismissRequest = onClose, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Box(Modifier.fillMaxSize().imePadding().padding(if (win.isPhone) 10.dp else 32.dp), contentAlignment = Alignment.Center) {
            WLCard(Modifier.widthIn(max = 860.dp).fillMaxWidth(), padding = if (win.isPhone) 14.dp else 22.dp) {
                Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(if (initial == null) "Add learner" else "Edit ${initial.nickname}", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                    ProfileForm(initial, if (initial == null) "Add learner" else "Save", onSaved = onSaved, onCancel = onClose)
                }
            }
        }
    }
}

@Composable
private fun LearnerCard(p: Profile, levels: Levels, onEdit: () -> Unit, onRemove: () -> Unit) {
    val s by appState()
    var open by rememberSaveable(p.id) { mutableStateOf(false) }
    WLCard(Modifier.fillMaxWidth(), padding = 14.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            EmojiImage(levels.emoji(p.avatar), 56.dp)
            Column(Modifier.weight(1f)) {
                Text(p.nickname + if (p.id == s.profileId) " · learning now" else "", style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
                Text("${levels.classLabel(p.classLevel)} · ${levels.bandLabel(p.ageBand)}", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
            }
            IconBtn(Icons.Rounded.Edit, "Edit ${p.nickname}", onEdit, size = 44.dp)
            IconBtn(Icons.Rounded.Delete, "Remove ${p.nickname}", onRemove, size = 44.dp, tint = WL.colors.bad, bg = WL.colors.badBg)
        }
        WLButton("Comfort, sound & reading settings", { open = !open }, kind = BtnKind.Ghost, icon = if (open) Icons.Rounded.ExpandLess else Icons.Rounded.ExpandMore, small = true, modifier = Modifier.padding(top = 6.dp))
        if (open) LearnerSettings(p)
    }
}

/** Every learner preference (same keys as the website). Saved instantly; the active learner's are also kept offline. */
@Composable
fun LearnerSettings(p: Profile) {
    val app = LocalApp.current
    val s by appState()
    val scope = rememberCoroutineScope()
    var local by remember(p.id) { mutableStateOf<Map<String, JsonElement>>(emptyMap()) }
    var error by remember { mutableStateOf<String?>(null) }
    val prefs = remember(p.prefs, local) { runCatching { AppJson.decodeFromJsonElement<Prefs>(JsonObject(p.prefs + local)) }.getOrDefault(Prefs()) }
    val tier = when { p.classLevel <= 2 -> "early"; p.classLevel <= 5 -> "primary"; else -> "older" }
    val speed = prefs.readingSpeed ?: when (tier) { "early" -> "slower"; "primary" -> "slow"; else -> "normal" }

    fun save(k: String, v: Any) {
        val e: JsonElement = when (v) { is Boolean -> JsonPrimitive(v); is Number -> JsonPrimitive(v); else -> JsonPrimitive(v.toString()) }
        local = local + (k to e); error = null
        if (p.id == s.profileId) app.repo.updatePrefs(mapOf(k to e))
        else scope.launch {
            try { app.repo.updateProfile(p.id, JsonObject(mapOf("prefs" to JsonObject(mapOf(k to e))))) }
            catch (x: ApiError) { error = if (x.status == 0) "You are offline — this setting was not saved." else x.message; local = local - k }
        }
    }

    Column(Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        error?.let { AlertBox(it, AlertKind.Bad) }
        AdaptiveColumns(minTwoCol = 640.dp, left = {
            SubTitle("Language & reading")
            if (p.classLevel <= 5) {
                Label("Language")
                Segmented(listOf("en" to "English", "te" to "తెలుగు (Telugu)"), prefs.language, { save("language", it) })
            }
            Toggle("Read instructions aloud", prefs.narration) { save("narration", it) }
            Label("Reading speed")
            Segmented(listOf("slower" to "Very slow", "slow" to "Slow", "normal" to "Normal"), speed, { save("readingSpeed", it) })
            Toggle("Natural voice (needs internet)", prefs.naturalVoice) { save("naturalVoice", it) }
            if (prefs.naturalVoice) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Box(Modifier.weight(1f)) {
                    DropdownField("Natural voice", NATURAL_SPEAKERS.map { it.second }, NATURAL_SPEAKERS.indexOfFirst { it.first == prefs.naturalSpeaker }.coerceAtLeast(0),
                        { save("naturalSpeaker", NATURAL_SPEAKERS[it].first) })
                }
                IconBtn(Icons.Rounded.VolumeUp, "Try voice", { app.speech.speak("Hello! Let us learn something new today.", "en") }, size = 48.dp)
            }
            Text("Without internet the device's own voice is used.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
        }, right = {
            SubTitle("Comfort & screen time")
            Toggle("Break reminders", prefs.breakEnabled) { save("breakEnabled", it) }
            if (prefs.breakEnabled) {
                Label("Remind after (minutes of activity)")
                Segmented(listOf(10, 15, 20, 30, 45).map { it to "$it" }, prefs.breakMinutes, { save("breakMinutes", it) })
            }
            Toggle("Offer optional timers in games", prefs.timers) { save("timers", it) }
            Label("Text size")
            Segmented(listOf(1f to "Normal", 1.15f to "Large", 1.3f to "Extra large"), prefs.textSize, { save("textSize", it) })
            Label("Theme")
            Segmented(listOf("system" to "Match device", "light" to "Light", "dark" to "Dark"), prefs.theme, { save("theme", it) })
            Toggle("Reduce motion", prefs.reduceMotion) { save("reduceMotion", it) }
            Toggle("Mute sounds and narration", prefs.mute) { save("mute", it) }
            var vol by remember(p.id, prefs.volume) { mutableFloatStateOf(prefs.volume) }
            Label("Volume: ${(vol * 100).toInt()}%")
            Slider(vol, { vol = (it * 10).toInt() / 10f }, onValueChangeFinished = { save("volume", vol) }, enabled = !prefs.mute,
                colors = SliderDefaults.colors(thumbColor = WL.colors.primary, activeTrackColor = WL.colors.primary))
        })
    }
}

@Composable private fun SubTitle(text: String) = Text(text, style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
@Composable private fun Label(text: String) = Text(text, style = MaterialTheme.typography.labelLarge, color = WL.colors.muted)
