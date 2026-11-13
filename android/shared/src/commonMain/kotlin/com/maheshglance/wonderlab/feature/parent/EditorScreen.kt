package com.maheshglance.wonderlab.feature.parent

import com.maheshglance.wonderlab.core.platform.*

import com.maheshglance.wonderlab.core.design.FitText

import com.maheshglance.wonderlab.core.platform.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
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
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.ErrorState
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.net.ApiError
import com.maheshglance.wonderlab.feature.auth.Field
import com.maheshglance.wonderlab.feature.auth.Segmented
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.NeedAccount
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.put
import java.text.DateFormat
import java.util.Date

private val EditorJson = Json { prettyPrint = true }
private fun enc(id: String) = urlEncode(id).replace("+", "%20")
private fun JsonElement?.str(): String? = (this as? JsonPrimitive)?.contentOrNull
private fun JsonElement?.int(): Int? = (this as? JsonPrimitive)?.intOrNull
private fun JsonElement?.long(): Long? = (this as? JsonPrimitive)?.longOrNull
private fun fmt(sec: Long?) = if (sec == null || sec == 0L) "" else DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(sec * 1000))

private data class EItem(val id: String, val kind: String, val published: Int?, val latest: Int)

/**
 * Restricted educator/admin content editor (`/editor`): search items, edit JSON → save draft → validate → preview →
 * publish → roll back, plus the problem-reports inbox. The server enforces the role.
 */
@Composable
fun EditorScreen() = NeedAccount {
    val app = LocalApp.current
    val s by appState()
    var tab by remember { mutableStateOf("content") }
    val role = s.account?.role ?: "parent"
    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar("Content editor", onBack = { app.back() })
        if (role != "parent") Segmented(listOf("content" to "Content", "reports" to "Problem reports"), tab, { tab = it }, Modifier.padding(start = 12.dp, end = 12.dp, top = 10.dp))
        when {
            role == "parent" -> ErrorState("Only educators can use the content editor.", null)
            !s.online -> ErrorState("The content editor needs an internet connection.", null)
            tab == "reports" -> ReportsTab()
            else -> ContentTab()
        }
    }
}

@Composable
private fun ContentTab() {
    val app = LocalApp.current
    val win = LocalWindow.current
    var q by remember { mutableStateOf("") }
    var items by remember { mutableStateOf<List<EItem>>(emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }
    var sel by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(q) {
        delay(250)
        try {
            items = app.api.get("/admin/items?q=${enc(q.trim())}")["items"]?.jsonArray?.map { e ->
                val o = e.jsonObject
                EItem(o["id"].str().orEmpty(), o["kind"].str().orEmpty(), o["published_version"].int(), o["latest_version"].int() ?: 1)
            } ?: emptyList()
            error = null
        } catch (e: ApiError) { error = if (e.status == 0) "You are offline." else e.message }
    }
    val twoPane = !win.isPhone
    BackHandler(enabled = !twoPane && sel != null) { sel = null }

    val list: @Composable (Modifier) -> Unit = { mod ->
        Column(mod.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Field("Search by id", q, { q = it }, hint = "e.g. m7.frac", keyboard = KeyboardOptions(autoCorrectEnabled = false))
            error?.let { AlertBox(it, AlertKind.Bad) }
            LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                items(items, key = { it.id }) { i ->
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(if (sel == i.id) WL.colors.math else WL.colors.surface).pressable { sel = i.id }.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Pill(i.kind)
                        FitText(i.id, style = MaterialTheme.typography.bodyMedium, color = WL.colors.text, maxLines = 1, modifier = Modifier.weight(1f))
                        Text("v${i.published ?: "?"}", style = MaterialTheme.typography.labelSmall, color = WL.colors.muted)
                    }
                }
            }
        }
    }
    if (twoPane) Row(Modifier.fillMaxSize()) {
        list(Modifier.width(if (win.width >= 1000.dp) 340.dp else 280.dp).fillMaxHeight())
        VerticalDivider(color = WL.colors.line)
        Box(Modifier.weight(1f).fillMaxHeight()) {
            val id = sel
            if (id == null) Text("Choose an item to edit. Static questions, objectives and translations can be corrected here without updating the app.",
                Modifier.padding(24.dp), color = WL.colors.muted)
            else ItemEditor(id)
        }
    } else {
        val id = sel
        if (id == null) list(Modifier.fillMaxSize()) else ItemEditor(id)
    }
}

private data class EVersion(val version: Int, val status: String, val data: JsonElement, val validation: JsonObject?, val publishedAt: Long?, val author: String?, val publisher: String?)

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ItemEditor(id: String) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var item by remember(id) { mutableStateOf<EItem?>(null) }
    var versions by remember(id) { mutableStateOf<List<EVersion>>(emptyList()) }
    var draft by remember(id) { mutableStateOf("") }
    var preview by remember(id) { mutableStateOf<JsonObject?>(null) }
    var msg by remember(id) { mutableStateOf<Pair<Boolean, String>?>(null) }
    var reload by remember(id) { mutableIntStateOf(0) }
    var busy by remember { mutableStateOf(false) }

    LaunchedEffect(id, reload) {
        try {
            val r = app.api.get("/admin/items/${enc(id)}")
            val it = r["item"]!!.jsonObject
            val itm = EItem(it["id"].str() ?: id, it["kind"].str().orEmpty(), it["published_version"].int(), it["latest_version"].int() ?: 1)
            val vs = r["versions"]?.jsonArray?.map { e ->
                val o = e.jsonObject
                EVersion(o["version"].int() ?: 0, o["status"].str().orEmpty(), o["data"] ?: JsonNull, o["validation"] as? JsonObject, o["published_at"].long(), o["author"].str(), o["publisher"].str())
            } ?: emptyList()
            item = itm; versions = vs
            if (reload == 0) {
                val pub = vs.firstOrNull { v -> v.version == itm.published } ?: vs.firstOrNull()
                draft = EditorJson.encodeToString(JsonElement.serializer(), pub?.data ?: JsonObject(emptyMap()))
            }
        } catch (e: ApiError) { msg = false to (if (e.status == 0) "You are offline." else e.message ?: "Could not load.") }
    }
    val parsed = remember(draft) { runCatching { AppJson.parseToJsonElement(draft) as? JsonObject }.getOrNull() }

    fun act(ok: String, block: suspend () -> Unit) = scope.launch {
        busy = true; msg = null
        try { block(); msg = true to ok; loadContentOverrides(app); reload++ }
        catch (e: ApiError) { msg = false to (e.message ?: "Failed.") }
        catch (e: IllegalStateException) { msg = false to (e.message ?: "Failed.") }
        finally { busy = false }
    }

    Column(Modifier.fillMaxSize().imePadding().verticalScroll(rememberScrollState()).padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SettingsCard(id, subtitle = "Kind: ${item?.kind ?: "…"} · Published version: v${item?.published ?: "?"} · Latest: v${item?.latest ?: "?"}") {
            msg?.let { (ok, t) -> AlertBox(t, if (ok) AlertKind.Good else AlertKind.Bad) }
            OutlinedTextField(
                draft, { draft = it }, Modifier.fillMaxWidth().heightIn(min = 220.dp, max = 420.dp),
                label = { Text("Edit (JSON)") }, isError = parsed == null,
                supportingText = { Text(if (parsed == null) "This is not valid JSON." else "Change wording, answers, hints or Telugu text. Saving creates a new draft; learners keep seeing the published version until you publish.") },
                textStyle = TextStyle(fontFamily = FontFamily.Monospace, fontSize = 13.sp, color = WL.colors.ink),
                keyboardOptions = KeyboardOptions(autoCorrectEnabled = false),
                colors = OutlinedTextFieldDefaults.colors(focusedContainerColor = WL.colors.paper, unfocusedContainerColor = WL.colors.paper, focusedBorderColor = WL.colors.primary, unfocusedBorderColor = WL.colors.line),
            )
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                WLButton("Preview", { preview = parsed }, icon = Icons.Rounded.Visibility, enabled = parsed != null, small = true)
                WLButton("Save as new draft", { act("Draft saved.") { app.api.post("/admin/items/${enc(id)}/drafts", buildJsonObject { put("data", parsed!!) }) } },
                    icon = Icons.Rounded.Add, kind = BtnKind.Primary, enabled = parsed != null && !busy, small = true)
            }
        }
        preview?.let { Preview(it, item?.kind.orEmpty()) }
        SettingsCard("Version history", subtitle = "Earlier learner attempts keep the version they answered; reviews show that original wording.") {
            versions.forEach { v ->
                Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(WL.colors.surface2).padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("v${v.version}", style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                        Pill(v.status, bg = if (v.status == "published") WL.colors.goodBg else WL.colors.surface, fg = if (v.status == "published") WL.colors.good else WL.colors.text)
                        val valid = v.validation
                        if (valid != null) {
                            val ok = valid["ok"]?.jsonPrimitive?.booleanOrNull == true
                            val errs = (valid["issues"] as? JsonArray)?.count { it.jsonObject["level"].str() == "error" } ?: 0
                            Pill(if (ok) "Valid" else "$errs errors", bg = if (ok) WL.colors.goodBg else WL.colors.warnBg, fg = if (ok) WL.colors.good else WL.colors.warn)
                        }
                    }
                    Text("Author: ${v.author ?: "bundled"} · Published by: ${v.publisher?.let { "$it · ${fmt(v.publishedAt)}" } ?: if (v.status == "published") "bundled" else "—"}",
                        style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                    v.validation?.let { valid ->
                        (valid["issues"] as? JsonArray)?.takeIf { it.isNotEmpty() }?.let { iss ->
                            Text(iss.joinToString("\n") { "• " + (it.jsonObject["message"].str() ?: "") }, style = MaterialTheme.typography.bodySmall, color = WL.colors.warn)
                        }
                    }
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        WLButton("Open", { draft = EditorJson.encodeToString(JsonElement.serializer(), v.data); preview = v.data as? JsonObject }, small = true)
                        if (v.status == "draft") WLButton("Validate", {
                            act("Validated.") {
                                val r = app.api.post("/admin/items/${enc(id)}/versions/${v.version}/validate")
                                if (r["ok"]?.jsonPrimitive?.booleanOrNull != true) {
                                    val issues = (r["issues"] as? JsonArray)?.joinToString("; ") { it.jsonObject["message"].str().orEmpty() }.orEmpty()
                                    throw IllegalStateException("Validation failed: $issues")
                                }
                            }
                        }, small = true, enabled = !busy)
                        if (v.status == "validated") WLButton("Publish", { act("v${v.version} published.") { app.api.post("/admin/items/${enc(id)}/versions/${v.version}/publish") } },
                            kind = BtnKind.Primary, small = true, enabled = !busy)
                        if (v.status == "archived") WLButton("Roll back to this", {
                            act("Rolled back to v${v.version}.") { app.api.post("/admin/items/${enc(id)}/rollback", buildJsonObject { put("toVersion", v.version) }) }
                        }, small = true, enabled = !busy)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun Preview(data: JsonObject, kind: String) {
    if (kind != "question") {
        SettingsCard("Preview") { Text(EditorJson.encodeToString(JsonElement.serializer(), data), fontFamily = FontFamily.Monospace, style = MaterialTheme.typography.bodySmall, color = WL.colors.text) }
        return
    }
    val prompt = data["prompt"] as? JsonObject
    val choices = (data["choices"] as? JsonArray)?.mapNotNull { it as? JsonObject }.orEmpty()
    val answer = data["answer"] as? JsonObject
    val correct = answer?.get("correct")
    val correctIds = when (correct) { is JsonArray -> correct.mapNotNull { it.str() }.toSet(); is JsonPrimitive -> setOfNotNull(correct.contentOrNull); else -> emptySet() }
    val hints = (data["hints"] as? JsonArray)?.mapNotNull { (it as? JsonObject)?.get("en").str() }.orEmpty()
    SettingsCard("Learner preview") {
        Text(prompt?.get("en").str() ?: "(no English prompt)", style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
        prompt?.get("te").str()?.let { Text(it, style = MaterialTheme.typography.bodyLarge, color = WL.colors.text) }
        if (choices.isNotEmpty()) FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            choices.forEach { c ->
                val right = c["id"].str() in correctIds
                Text((c["label"] as? JsonObject)?.get("en").str() ?: c["id"].str().orEmpty(),
                    Modifier.clip(RoundedCornerShape(12.dp)).background(if (right) WL.colors.goodBg else WL.colors.surface2).padding(horizontal = 12.dp, vertical = 8.dp),
                    color = if (right) WL.colors.good else WL.colors.text, style = MaterialTheme.typography.bodyLarge)
            }
        }
        Text("Hints: ${hints.joinToString(" → ").ifEmpty { "none" }}", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
        when {
            answer == null -> AlertBox("No answer key — fix before publishing.", AlertKind.Bad)
            choices.isNotEmpty() && correctIds.isNotEmpty() && correctIds.any { id -> choices.none { it["id"].str() == id } } ->
                AlertBox("The answer key points to a choice that does not exist — fix before publishing.", AlertKind.Bad)
            else -> AlertBox("Answer key present. Use Validate to run the full server checks (the answer key must grade as correct).", AlertKind.Info)
        }
    }
}

private data class EReport(val id: String, val classLevel: Int?, val lesson: String, val question: String, val version: Int?, val description: String, val status: String, val createdAt: Long)

@Composable
private fun ReportsTab() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    val levels = rememberLevels()
    var reports by remember { mutableStateOf<List<EReport>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var reload by remember { mutableIntStateOf(0) }
    LaunchedEffect(reload) {
        try {
            reports = app.api.get("/admin/reports")["reports"]?.jsonArray?.map { e ->
                val o = e.jsonObject
                EReport(o["id"].str().orEmpty(), o["class_level"].int(), o["lesson_id"].str().orEmpty(), o["question_id"].str().orEmpty(), o["content_version"].int(),
                    o["description"].str().orEmpty(), o["status"].str() ?: "open", o["created_at"].long() ?: 0)
            } ?: emptyList()
        } catch (e: ApiError) { error = e.message }
    }
    val dateFmt = remember { DateFormat.getDateInstance(DateFormat.MEDIUM) }
    LazyColumn(Modifier.fillMaxSize(), contentPadding = androidx.compose.foundation.layout.PaddingValues(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        error?.let { item { AlertBox(it, AlertKind.Bad) } }
        val list = reports
        if (list == null) item { Text("Loading…", color = WL.colors.muted) }
        else if (list.isEmpty()) item { Text("No reports yet.", color = WL.colors.muted) }
        else items(list, key = { it.id }) { r ->
            SettingsCard("${r.lesson.ifBlank { "General" }}${if (r.question.isNotBlank()) " · ${r.question} (v${r.version ?: "?"})" else ""}",
                subtitle = "${dateFmt.format(Date(r.createdAt * 1000))} · ${r.classLevel?.let { levels.classLabel(it) } ?: "—"}") {
                Text(r.description.ifBlank { "—" }, style = MaterialTheme.typography.bodyMedium, color = WL.colors.text)
                Segmented(listOf("open" to "Open", "fixed" to "Fixed", "wontfix" to "Won't fix"), r.status, { st ->
                    scope.launch {
                        try { app.api.patch("/admin/reports/${r.id}", buildJsonObject { put("status", st) }); reload++ } catch (e: ApiError) { error = e.message }
                    }
                })
            }
        }
    }
}
