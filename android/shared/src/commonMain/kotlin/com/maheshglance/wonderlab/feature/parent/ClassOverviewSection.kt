package com.maheshglance.wonderlab.feature.parent

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Share
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Meter
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.net.ApiError
import com.maheshglance.wonderlab.feature.auth.DropdownField
import com.maheshglance.wonderlab.feature.auth.Field
import com.maheshglance.wonderlab.feature.auth.FormError
import com.maheshglance.wonderlab.feature.auth.Segmented
import com.maheshglance.wonderlab.feature.auth.rememberForm
import com.maheshglance.wonderlab.feature.auth.toast
import com.maheshglance.wonderlab.feature.lesson.L
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray

// Teachers and tuition centres: one account, one learner profile per student. The numbers come from the shared
// engine (src/features/parent/classroom.ts), so the app and the website show exactly the same overview.

/** Most learner profiles per account and per "add several" step — same values as the server (engine fallback). */
const val MAX_PROFILES = 60
const val MAX_BULK = 60

@Serializable data class SubjectSummary(val subject: String, val name: String, val chapters: Int = 0, val chaptersDone: Int = 0, val skills: Int = 0, val mastered: Int = 0, val masteryPct: Int = 0, val needsHelp: Int = 0)
@Serializable data class WeakSkill(val objectiveId: String, val title: Localized, val chapter: Localized, val subject: String, val attempts: Int, val accuracyPct: Int, val masteryPct: Int, val needsHelp: Boolean)
@Serializable data class LearnerSummary(
    val id: String, val nickname: String, val avatar: String, val classLevel: Int, val classLabel: String, val board: String = "ts",
    val lastActive: Long? = null, val subjects: List<SubjectSummary> = emptyList(), val masteryPct: Int = 0, val chaptersDone: Int = 0,
    val chapters: Int = 0, val needsHelp: Int = 0, val weakest: List<WeakSkill> = emptyList(),
)
@Serializable data class OverviewRow(val learner: LearnerSummary, val subject: SubjectSummary)
@Serializable data class LevelOption(val level: Int, val label: String)
@Serializable data class SubjectOption(val subject: String, val name: String)
@Serializable data class OverviewFilters(val levels: List<LevelOption> = emptyList(), val subjects: List<SubjectOption> = emptyList())
@Serializable data class NameIssue(val name: String = "", val problem: String? = null, val warning: String? = null)
@Serializable data class NameCheck(val names: List<String> = emptyList(), val problems: List<NameIssue> = emptyList(), val warnings: List<NameIssue> = emptyList())

private val SORTS = listOf("name" to "Name", "mastery" to "Lowest mastery", "needsHelp" to "Needs help", "lastActive" to "Least active", "class" to "Class")

/** "Today", "Yesterday", "5 days ago" or a date. */
fun lastActiveText(sec: Long?): String {
    if (sec == null || sec <= 0) return "Never"
    val today = isoLocalDate(nowMillis())
    val day = isoLocalDate(sec * 1000)
    if (day == today) return "Today"
    if (day == isoLocalDate(nowMillis() - 86_400_000L)) return "Yesterday"
    val days = ((nowMillis() / 1000 - sec) / 86_400).toInt()
    return if (days in 1..13) "$days days ago" else formatDate(sec * 1000)
}


/** `parent/class`: every learner × subject — chapters done, mastery, last active, needs help — with CSV export. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ClassOverviewSection() {
    val app = LocalApp.current
    val platform = LocalPlatform.current
    val scope = rememberCoroutineScope()
    val phone = LocalWindow.current.isPhone
    var reload by remember { mutableIntStateOf(0) }
    var raw by remember { mutableStateOf<JsonElement?>(null) }
    var list by remember { mutableStateOf<List<LearnerSummary>?>(null) }
    var filters by remember { mutableStateOf(OverviewFilters()) }
    var error by remember { mutableStateOf<String?>(null) }
    var level by remember { mutableStateOf<Int?>(null) }
    var subject by remember { mutableStateOf<String?>(null) }
    var sort by remember { mutableStateOf("name") }
    var rows by remember { mutableStateOf<List<OverviewRow>>(emptyList()) }
    var open by remember { mutableStateOf<LearnerSummary?>(null) }
    var csvText by remember { mutableStateOf<String?>(null) }
    val fileSaver = rememberFileSaver()
    val saver = com.maheshglance.wonderlab.feature.auth.SaveLauncher { name ->
        csvText?.let { t -> fileSaver.save(name, "text/csv", t.encodeToByteArray()) { ok -> toast(platform, if (ok) "Saved" else "Could not save the file.") } }
        csvText = null
    }

    LaunchedEffect(reload) {
        error = null
        try {
            val r = app.api.get("/profiles/overview")
            val summaries = app.engine.call("core.classOverview", r)
            raw = summaries
            list = AppJson.decodeFromJsonElement<List<LearnerSummary>>(summaries)
            filters = app.engine.get<OverviewFilters>("core.classOverviewFilters", summaries)
        } catch (e: ApiError) {
            error = if (e.status == 0) "The class overview needs an internet connection." else e.message ?: "Could not load the class overview."
        } catch (e: Exception) {
            error = "Could not load the class overview."
        }
    }
    LaunchedEffect(raw, level, subject, sort) {
        val r = raw ?: return@LaunchedEffect
        rows = runCatching { app.engine.get<List<OverviewRow>>("core.classOverviewRows", r, level, subject, sort) }.getOrDefault(emptyList())
    }
    suspend fun csv(): String? {
        val r = raw ?: return null
        val dates = list.orEmpty().filter { (it.lastActive ?: 0) > 0 }.associate { it.id to isoLocalDate(it.lastActive!! * 1000) }
        return app.engine.call("core.classOverviewCsv", r, level, subject, sort, dates).jsonPrimitive.content
    }

    Text("Class overview", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
    Text("Every learner on this account, by subject. Mastery is the average progress toward mastering each skill (100% = all mastered). A chapter is done when all its skills are mastered. Needs help counts skills tried 3 or more times with under 60% correct.",
        style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
    error?.let {
        AlertBox(it, AlertKind.Bad)
        WLButton("Try again", { reload++ }, icon = Icons.Rounded.Refresh, small = true)
        return
    }
    val all = list ?: run { Text("Loading class overview…", color = WL.colors.muted); return }
    if (all.isEmpty()) { AlertBox("No learners yet. Add one profile per student in Learners (you can add several at once).", AlertKind.Info); return }

    // filters
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val levelNames = listOf("All classes") + filters.levels.map { it.label }
        val subjectNames = listOf("All subjects") + filters.subjects.map { it.name }
        val levelPick: @Composable (Modifier) -> Unit = { m -> Box(m) { DropdownField("Class", levelNames, filters.levels.indexOfFirst { it.level == level } + 1, { i -> level = if (i == 0) null else filters.levels[i - 1].level }) } }
        val subjectPick: @Composable (Modifier) -> Unit = { m -> Box(m) { DropdownField("Subject", subjectNames, filters.subjects.indexOfFirst { it.subject == subject } + 1, { i -> subject = if (i == 0) null else filters.subjects[i - 1].subject }) } }
        val sortPick: @Composable (Modifier) -> Unit = { m -> Box(m) { DropdownField("Sort by", SORTS.map { it.second }, SORTS.indexOfFirst { it.first == sort }, { i -> sort = SORTS[i].first }) } }
        if (maxWidth >= 600.dp) Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            levelPick(Modifier.weight(1f)); subjectPick(Modifier.weight(1f)); sortPick(Modifier.weight(1f))
        } else Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            levelPick(Modifier.fillMaxWidth()); subjectPick(Modifier.fillMaxWidth()); sortPick(Modifier.fillMaxWidth())
        }
    }
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp), itemVerticalAlignment = Alignment.CenterVertically) {
        WLButton("Share CSV", { scope.launch { csv()?.let { platform.shareText("WonderLab class overview", it) } } }, icon = Icons.Rounded.Share, small = true, enabled = rows.isNotEmpty())
        WLButton("Save CSV file", { scope.launch { csvText = csv(); if (csvText != null) saver.launch("wonderlab-class-${isoLocalDate(nowMillis())}.csv") } }, icon = Icons.Rounded.Download, small = true, enabled = rows.isNotEmpty())
        WLButton("Refresh", { reload++ }, icon = Icons.Rounded.Refresh, small = true, kind = BtnKind.Ghost)
        val help = rows.filter { it.subject.needsHelp > 0 }.map { it.learner.id }.toSet().size
        Text("${all.size} learner${if (all.size == 1) "" else "s"}${if (help > 0) " · $help need help" else ""}", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
    }
    if (rows.isEmpty()) { Text("No learners match these filters.", color = WL.colors.muted); return }
    if (!phone) Row(Modifier.fillMaxWidth().padding(horizontal = 10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf("Learner" to 1.6f, "Subject" to 1.2f, "Chapters" to 0.8f, "Mastery" to 1.3f, "Last active" to 1f, "Needs help" to 1f).forEach { (h, w) ->
            Text(h, Modifier.weight(w), style = MaterialTheme.typography.labelLarge, color = WL.colors.muted)
        }
    }
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        rows.forEach { r -> OverviewRowView(r, phone) { open = r.learner } }
    }
    open?.let { LearnerDetailDialog(it) { open = null } }
}

@Composable
private fun OverviewRowView(r: OverviewRow, phone: Boolean, onOpen: () -> Unit) {
    val c = WL.colors
    val levels = rememberLevels()
    val l = r.learner; val s = r.subject
    val mod = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(c.surface).pressable(role = Role.Button, onClick = onOpen).padding(10.dp)
    val help: @Composable () -> Unit = { if (s.needsHelp > 0) Pill("${s.needsHelp} need help", bg = c.warnBg, fg = c.warn) else Text("—", color = c.muted) }
    if (phone) Column(mod, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            EmojiImage(levels.emoji(l.avatar), 28.dp)
            Text(l.nickname, Modifier.weight(1f), style = MaterialTheme.typography.titleSmall, color = c.text)
            help()
        }
        Text("${l.classLabel} · ${s.name} · ${s.chaptersDone}/${s.chapters} chapters · last active ${lastActiveText(l.lastActive).lowercase()}", style = MaterialTheme.typography.bodySmall, color = c.muted)
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(Modifier.weight(1f)) { Meter(s.masteryPct / 100f, color = c.good) }
            Text("${s.masteryPct}%", style = MaterialTheme.typography.labelLarge, color = c.text)
        }
    } else Row(mod.heightIn(min = 48.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(Modifier.weight(1.6f), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            EmojiImage(levels.emoji(l.avatar), 28.dp)
            Column { Text(l.nickname, style = MaterialTheme.typography.titleSmall, color = c.text); Text(l.classLabel, style = MaterialTheme.typography.bodySmall, color = c.muted) }
        }
        Text(s.name, Modifier.weight(1.2f), style = MaterialTheme.typography.bodyMedium, color = c.text)
        Text("${s.chaptersDone} / ${s.chapters}", Modifier.weight(0.8f), style = MaterialTheme.typography.bodyMedium, color = c.text)
        Row(Modifier.weight(1.3f), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Box(Modifier.weight(1f)) { Meter(s.masteryPct / 100f, color = c.good) }
            Text("${s.masteryPct}%", Modifier.width(44.dp), style = MaterialTheme.typography.labelLarge, color = c.text)
        }
        Text(lastActiveText(l.lastActive), Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium, color = c.text)
        Box(Modifier.weight(1f)) { help() }
    }
}

@Composable
private fun LearnerDetailDialog(l: LearnerSummary, onClose: () -> Unit) {
    val win = LocalWindow.current
    Dialog(onDismissRequest = onClose, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Box(Modifier.fillMaxSize().padding(if (win.isPhone) 10.dp else 32.dp), contentAlignment = Alignment.Center) {
            WLCard(Modifier.widthIn(max = 640.dp).fillMaxWidth(), padding = if (win.isPhone) 14.dp else 22.dp) {
                Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("${l.nickname} · ${l.classLabel}", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                    Text("Mastery ${l.masteryPct}% · ${l.chaptersDone} of ${l.chapters} chapters done · last active ${lastActiveText(l.lastActive).lowercase()}", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                    Text("Weakest skills", style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                    if (l.weakest.isEmpty()) Text("No skills to work on yet — either nothing has been practised or everything tried is mastered.", color = WL.colors.muted)
                    l.weakest.forEachIndexed { i, w ->
                        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(WL.colors.surface2).padding(10.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("${i + 1}. ${L(w.title)}", Modifier.weight(1f), style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
                                if (w.needsHelp) Pill("Needs help", bg = WL.colors.warnBg, fg = WL.colors.warn)
                            }
                            Text("${w.subject} · ${L(w.chapter)} · ${w.attempts} tries, ${w.accuracyPct}% correct", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                        }
                    }
                    Text("By subject", style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                    l.subjects.forEach { s ->
                        Text("${s.name}: ${s.masteryPct}% · ${s.chaptersDone}/${s.chapters} chapters" + if (s.needsHelp > 0) " · ${s.needsHelp} need help" else "", style = MaterialTheme.typography.bodyMedium, color = WL.colors.text)
                    }
                    WLButton("Close", onClose, modifier = Modifier.fillMaxWidth())
                }
            }
        }
    }
}

/** Add several learners at once: paste first names, choose one class. All or nothing on the server. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun BulkAddDialog(onClose: () -> Unit, onAdded: (Int) -> Unit) {
    val app = LocalApp.current
    val s by appState()
    val win = LocalWindow.current
    val scope = rememberCoroutineScope()
    val levels = rememberLevels()
    var text by remember { mutableStateOf("") }
    var classLevel by remember { mutableStateOf<Int?>(null) }
    var language by remember { mutableStateOf("en") }
    var check by remember { mutableStateOf(NameCheck()) }
    val form = rememberForm()
    val existing = s.profiles.map { it.nickname }
    LaunchedEffect(text, existing) {
        check = runCatching { app.engine.get<NameCheck>("core.parseNames", text, existing) }.getOrDefault(NameCheck())
    }
    val left = MAX_PROFILES - s.profiles.size
    val over = check.names.size > left
    val canSave = !form.busy && classLevel != null && check.names.isNotEmpty() && check.problems.isEmpty() && !over

    Dialog(onDismissRequest = onClose, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Box(Modifier.fillMaxSize().imePadding().padding(if (win.isPhone) 10.dp else 32.dp), contentAlignment = Alignment.Center) {
            WLCard(Modifier.widthIn(max = 720.dp).fillMaxWidth(), padding = if (win.isPhone) 14.dp else 22.dp) {
                Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Add several learners", style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                    AlertBox("Use first names or nicknames only — no surnames, roll numbers, phone numbers or emails. Add an initial if two students share a name.", AlertKind.Info)
                    FormError(form)
                    Field("First names", text, { text = it }, Modifier.heightIn(min = 140.dp), singleLine = false,
                        hint = "One per line, or separated by commas. Up to ${minOf(MAX_BULK, maxOf(0, left))} more ($MAX_PROFILES per account).",
                        keyboard = KeyboardOptions(capitalization = KeyboardCapitalization.Words, autoCorrectEnabled = false))
                    Text("Class", style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        levels.classes.forEach { c -> WLButton(c.label, { classLevel = c.level }, kind = if (classLevel == c.level) BtnKind.Primary else BtnKind.Normal, small = true) }
                    }
                    if ((classLevel ?: 99) <= 5) {
                        Text("Language", style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
                        Segmented(listOf("en" to "English", "te" to "తెలుగు (Telugu)"), language, { language = it })
                    }
                    if (check.names.isNotEmpty()) Text("${check.names.size} learner${if (check.names.size == 1) "" else "s"} to add: ${check.names.joinToString(", ")}. Avatars are given automatically; each learner can change theirs.",
                        style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                    check.problems.forEach { AlertBox((if (it.name.isNotEmpty()) "“${it.name}”: " else "") + (it.problem ?: ""), AlertKind.Bad) }
                    check.warnings.forEach { AlertBox("“${it.name}”: ${it.warning ?: ""}", AlertKind.Warn) }
                    if (over) AlertBox(if (left <= 0) "This account already has $MAX_PROFILES learners, the most one account can hold. Remove a learner who has left first."
                        else "Only $left more learner${if (left == 1) "" else "s"} can be added ($MAX_PROFILES per account).", AlertKind.Bad)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        WLButton("Cancel", onClose, modifier = Modifier.weight(1f))
                        WLButton("Add ${if (check.names.isEmpty()) "" else "${check.names.size} "}learner${if (check.names.size == 1) "" else "s"}", {
                            scope.launch {
                                form.run {
                                    val body = buildJsonObject {
                                        putJsonArray("nicknames") { check.names.forEach { add(JsonPrimitive(it)) } }
                                        put("classLevel", classLevel!!)
                                        put("language", language)
                                    }
                                    val r = app.api.post("/profiles/bulk", body)
                                    app.repo.refresh()
                                    onAdded((r["profiles"] as? kotlinx.serialization.json.JsonArray)?.size ?: check.names.size)
                                }
                            }
                        }, kind = BtnKind.Primary, icon = Icons.Rounded.Add, enabled = canSave, loading = form.busy, modifier = Modifier.weight(2f))
                    }
                    Text("Each student gets their own private profile on this account. Progress is never shared with other accounts.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                }
            }
        }
    }
}
