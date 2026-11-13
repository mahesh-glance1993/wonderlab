package com.maheshglance.wonderlab.feature.parent

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.data.AgeBandInfo
import com.maheshglance.wonderlab.core.data.AvatarInfo
import com.maheshglance.wonderlab.core.data.ClassInfo
import com.maheshglance.wonderlab.core.data.Profile
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.auth.Field
import com.maheshglance.wonderlab.feature.auth.FormError
import com.maheshglance.wonderlab.feature.auth.FormProblem
import com.maheshglance.wonderlab.feature.auth.Segmented
import com.maheshglance.wonderlab.feature.auth.rememberForm
import com.maheshglance.wonderlab.feature.home.AVATARS
import com.maheshglance.wonderlab.feature.home.CLASS_LABELS
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/** Classes, age bands and avatars — from the shared engine (same lists as the website), with built-in fallbacks. */
data class Levels(val classes: List<ClassInfo>, val bands: List<AgeBandInfo>, val avatars: List<AvatarInfo>) {
    fun classLabel(level: Int) = classes.firstOrNull { it.level == level }?.label ?: CLASS_LABELS.getOrNull(level)?.first ?: "Class"
    fun bandLabel(id: String) = bands.firstOrNull { it.id == id }?.label ?: "$id years"
    fun emoji(avatar: String) = avatars.firstOrNull { it.id == avatar }?.emoji ?: AVATARS[avatar] ?: "🦉"

    /** Same rule as the website's suggestAgeBand. */
    fun suggestBand(level: Int): String {
        val a = classes.firstOrNull { it.level == level }?.typicalAge ?: (level + 3)
        return when { a <= 4 -> "3-4"; a <= 6 -> "5-6"; a <= 8 -> "7-8"; a <= 10 -> "9-10"; a <= 12 -> "11-12"; a <= 14 -> "13-14"; else -> "15-16" }
    }

    companion object {
        val Fallback = Levels(
            CLASS_LABELS.mapIndexed { i, (en, te) -> ClassInfo(i, if (i < 3) en.lowercase() else "c${i - 2}", en, te, i + 3) },
            listOf("3-4", "5-6", "7-8", "9-10", "11-12", "13-14", "15-16").map { AgeBandInfo(it, "${it.replace("-", "–")} years", it) },
            AVATARS.map { (id, e) -> AvatarInfo(id, e) },
        )
    }
}

private var levelsCache: Levels? = null

@Composable
fun rememberLevels(): Levels {
    val app = LocalApp.current
    var levels by remember { mutableStateOf(levelsCache ?: Levels.Fallback) }
    LaunchedEffect(Unit) {
        if (levelsCache == null) runCatching {
            Levels(app.engine.get<List<ClassInfo>>("core.classes"), app.engine.get<List<AgeBandInfo>>("core.ageBands"), app.engine.get<List<AvatarInfo>>("core.avatars"))
        }.getOrNull()?.takeIf { it.classes.isNotEmpty() && it.avatars.isNotEmpty() }?.let { levelsCache = it; levels = it }
    }
    return levels
}

/**
 * Create / edit a learner profile: nickname (never a full name), one of 12 avatars (3D pictures), class and age
 * band. Phones stack the parts; tablets use two columns.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProfileForm(initial: Profile?, submitLabel: String, onSaved: (Profile) -> Unit, onCancel: (() -> Unit)? = null) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val levels = rememberLevels()
    val win = LocalWindow.current
    var nickname by remember(initial?.id) { mutableStateOf(initial?.nickname.orEmpty()) }
    var avatar by remember(initial?.id) { mutableStateOf(initial?.avatar ?: "owl") }
    var classLevel by remember(initial?.id) { mutableStateOf(initial?.classLevel) }
    var ageBand by remember(initial?.id) { mutableStateOf(initial?.ageBand) }
    var bandTouched by remember(initial?.id) { mutableStateOf(initial != null) }
    var language by remember(initial?.id) { mutableStateOf("en") }
    val form = rememberForm()

    fun submit() = scope.launch {
        form.run {
            val problems = buildMap {
                if (nickname.isBlank()) put("nickname", "Type a nickname.")
                else if (nickname.trim().length > 20) put("nickname", "Use a short nickname (up to 20 letters).")
                if (classLevel == null) put("classLevel", "Choose a class.")
                if (ageBand == null) put("ageBand", "Choose an age band.")
            }
            if (problems.isNotEmpty()) throw FormProblem("Please check the highlighted fields.", problems)
            val p = if (initial == null) {
                val prefs = if (classLevel!! <= 5 && language == "te") buildJsonObject { put("language", "te") } else JsonObject(emptyMap())
                app.repo.createProfile(nickname.trim(), avatar, classLevel!!, ageBand!!, prefs)
            } else {
                app.repo.updateProfile(initial.id, buildJsonObject {
                    put("nickname", nickname.trim()); put("avatar", avatar); put("classLevel", classLevel!!); put("ageBand", ageBand!!)
                })
            }
            onSaved(p)
        }
    }

    val namePart: @Composable () -> Unit = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Field("Nickname", nickname, { if (it.length <= 20) nickname = it }, error = form.field("nickname"),
                hint = "A first name or fun name. No surnames, emails or phone numbers.",
                keyboard = KeyboardOptions(capitalization = KeyboardCapitalization.Words, imeAction = ImeAction.Done))
            Text("Avatar", style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
            AvatarGrid(levels.avatars, avatar) { avatar = it }
            form.field("avatar")?.let { Text(it, color = WL.colors.bad, style = MaterialTheme.typography.bodySmall) }
        }
    }
    val levelPart: @Composable () -> Unit = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Class", style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                levels.classes.forEach { c ->
                    WLButton(c.label, {
                        classLevel = c.level
                        if (!bandTouched) ageBand = levels.suggestBand(c.level)
                    }, kind = if (classLevel == c.level) BtnKind.Primary else BtnKind.Normal, small = true)
                }
            }
            Hint(form.field("classLevel"), "Sets which lessons appear. Learners can still revisit or explore other classes.")
            Text("Age band", style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                levels.bands.forEach { b ->
                    WLButton(b.label, { ageBand = b.id; bandTouched = true }, kind = if (ageBand == b.id) BtnKind.Primary else BtnKind.Normal, small = true)
                }
            }
            Hint(form.field("ageBand"), "Used for reading level, instructions and button size. We don't ask for a birth date.")
            if (initial == null && (classLevel ?: 99) <= 5) {
                Text("Language", style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
                Segmented(listOf("en" to "English", "te" to "తెలుగు (Telugu)"), language, { language = it })
            }
        }
    }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        FormError(form)
        BoxWithConstraints(Modifier.fillMaxWidth()) {
            if (!win.isPhone && maxWidth >= 640.dp) Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                Box(Modifier.weight(1f)) { namePart() }
                Box(Modifier.weight(1f)) { levelPart() }
            } else Column(verticalArrangement = Arrangement.spacedBy(12.dp)) { namePart(); levelPart() }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            if (onCancel != null) WLButton("Cancel", onCancel, modifier = Modifier.weight(1f))
            WLButton(submitLabel, { submit() }, kind = BtnKind.Primary, loading = form.busy, modifier = Modifier.weight(if (onCancel != null) 2f else 1f))
        }
    }
}

@Composable
private fun Hint(error: String?, hint: String) =
    Text(error ?: hint, style = MaterialTheme.typography.bodySmall, color = if (error != null) WL.colors.bad else WL.colors.muted)

/** 12 avatars as 3D pictures; 6 per row (4 on very narrow screens). */
@Composable
fun AvatarGrid(avatars: List<AvatarInfo>, selected: String, onSelect: (String) -> Unit) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val cols = if (maxWidth < 300.dp) 4 else 6
        val cell = ((maxWidth - 8.dp * (cols - 1)) / cols).coerceAtMost(72.dp)
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            avatars.chunked(cols).forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    row.forEach { a ->
                        val sel = a.id == selected
                        Box(
                            Modifier.size(cell).clip(RoundedCornerShape(16.dp))
                                .background(if (sel) WL.colors.math else WL.colors.surface2)
                                .border(3.dp, if (sel) WL.colors.primary else Color.Transparent, RoundedCornerShape(16.dp))
                                .pressable(role = Role.RadioButton) { onSelect(a.id) }
                                .semantics { contentDescription = a.id; this.selected = sel },
                            contentAlignment = Alignment.Center,
                        ) { EmojiImage(a.emoji, cell * 0.68f) }
                    }
                }
            }
        }
    }
}

