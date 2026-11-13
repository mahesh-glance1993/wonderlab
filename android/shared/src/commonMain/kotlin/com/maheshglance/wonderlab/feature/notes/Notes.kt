package com.maheshglance.wonderlab.feature.notes

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.core.platform.formatDateTime
import com.maheshglance.wonderlab.core.platform.nowMillis
import com.maheshglance.wonderlab.core.platform.randomUuid
import com.maheshglance.wonderlab.core.platform.encodePathSegment as urlEncode
import com.maheshglance.wonderlab.ui.AppContext
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.shell.HubScaffold
import kotlinx.coroutines.delay
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement

/**
 * My Notes: each learner writes and keeps their own notes — one note per chapter (opened from the lesson) plus free
 * notes — typed and/or handwritten (finger or Apple Pencil / stylus). Saved on the device straight away and synced to
 * the account (learner activity state "notes:<key>"), so notes follow the child to the website and other devices.
 */
@Serializable
data class NoteDoc(
    val key: String,
    val subject: String = "general",
    val title: String = "",
    val chapter: String? = null,
    val text: String = "",
    /** handwriting: strokes as "x,y x,y …" in 0..1000 page units */
    val ink: List<String> = emptyList(),
    val createdAt: Long = 0,
    val updatedAt: Long = 0,
    val deleted: Boolean = false,
)

private val NotesJson = Json { ignoreUnknownKeys = true; encodeDefaults = true }
const val NOTES_ROUTE = "notes"

val SUBJECT_INFO: Map<String, Pair<String, String>> = mapOf(
    "math" to ("Maths" to "🔢"), "physics" to ("Physics" to "🧲"), "chemistry" to ("Chemistry" to "⚗️"),
    "biology" to ("Biology" to "🌿"), "science" to ("Science" to "🔬"), "evs" to ("EVS" to "🌍"), "social" to ("Social Studies" to "🗺️"),
    "telugu" to ("Telugu" to "📖"), "hindi" to ("Hindi" to "📜"), "english" to ("English" to "🔤"), "general" to ("My notes" to "📝"),
)

fun subjectName(s: String) = SUBJECT_INFO[s]?.first ?: s.replaceFirstChar { it.uppercase() }
fun subjectEmoji(s: String) = SUBJECT_INFO[s]?.second ?: "📝"

/** All of the current learner's notes (newest first). */
fun allNotes(app: AppContext): List<NoteDoc> =
    app.repo.state.value.learner.activities.filterKeys { it.startsWith("notes:") }.values
        .mapNotNull { s -> s.state?.let { runCatching { NotesJson.decodeFromJsonElement<NoteDoc>(it) }.getOrNull() } }
        .filter { !it.deleted }.sortedByDescending { it.updatedAt }

fun readNote(app: AppContext, key: String): NoteDoc? =
    app.repo.state.value.learner.activities["notes:$key"]?.state?.let { runCatching { NotesJson.decodeFromJsonElement<NoteDoc>(it) }.getOrNull() }

fun saveNote(app: AppContext, n: NoteDoc) {
    val doc = n.copy(updatedAt = nowMillis(), createdAt = if (n.createdAt == 0L) nowMillis() else n.createdAt)
    app.repo.saveActivityState("notes:${n.key}", NotesJson.encodeToJsonElement(doc))
}

/** Path to a chapter's note (from a lesson). */
fun chapterNotePath(unitId: String, subject: String, chapter: String) =
    "$NOTES_ROUTE/edit/${urlEncode("unit-$unitId")}?subject=${urlEncode(subject)}&title=${urlEncode(chapter)}"

/** Adds a line to a chapter's note (e.g. "Save to my notes" on a key point). */
fun appendToChapterNote(app: AppContext, unitId: String, subject: String, chapter: String, line: String) {
    val key = "unit-$unitId"
    val cur = readNote(app, key) ?: NoteDoc(key, subject, chapter, chapter)
    saveNote(app, cur.copy(text = (cur.text.trimEnd() + "\n• " + line.trim()).trimStart('\n'), deleted = false))
    app.platform.toast("Saved to your notes")
}

// ------------------------------------------------------------------------------------------------ list

@Composable
fun NotesHome() {
    val app = LocalApp.current
    val s by appState()
    val win = LocalWindow.current
    val notes = remember(s.learner.activities) { allNotes(app) }
    var query by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf<String?>(null) }
    val shown = notes.filter { (subject == null || it.subject == subject) && (query.isBlank() || it.title.contains(query, true) || it.text.contains(query, true)) }
    HubScaffold(NOTES_ROUTE) {
        Column(Modifier.fillMaxSize()) {
            TopBar("My Notes", subtitle = "${notes.size} note${if (notes.size == 1) "" else "s"} · saved on this device and in your account")
            Column(Modifier.weight(1f).fillMaxWidth().padding(horizontal = if (win.isPhone) 12.dp else 20.dp, vertical = 10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(query, { query = it }, Modifier.weight(1f), placeholder = { Text("Search your notes") }, singleLine = true, shape = RoundedCornerShape(16.dp))
                    WLButton("New note", { app.go("$NOTES_ROUTE/edit/${urlEncode("free-" + randomUuid())}?subject=${urlEncode(subject ?: "general")}&title=") }, kind = BtnKind.Primary, icon = Icons.Rounded.Add)
                }
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Chip("All", null, subject == null) { subject = null }
                    notes.map { it.subject }.distinct().sorted().forEach { sub -> Chip(subjectName(sub), subjectEmoji(sub), subject == sub) { subject = sub } }
                }
                if (shown.isEmpty()) Column(Modifier.fillMaxWidth().padding(top = 40.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    EmojiImage("📝", 96.dp)
                    Text(if (notes.isEmpty()) "No notes yet" else "No notes match", style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
                    Text("Open any lesson and tap Notes to write about that chapter, or start a new note here. Tip: tap \"Save to notes\" on key points while you learn.",
                        style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                }
                else LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(shown, key = { it.key }) { n ->
                        Row(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(WL.colors.surface)
                                .pressable { app.go("$NOTES_ROUTE/edit/${urlEncode(n.key)}?subject=${urlEncode(n.subject)}&title=${urlEncode(n.title)}") }.padding(14.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically,
                        ) {
                            EmojiImage(subjectEmoji(n.subject), 40.dp)
                            Column(Modifier.weight(1f)) {
                                Text(n.title.ifBlank { "Untitled note" }, style = MaterialTheme.typography.titleMedium, color = WL.colors.text, maxLines = 1)
                                Text(n.text.lineSequence().firstOrNull { it.isNotBlank() }?.take(120) ?: if (n.ink.isNotEmpty()) "Handwritten note" else "Empty",
                                    style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, maxLines = 2)
                                Text("${subjectName(n.subject)} · ${formatDateTime(n.updatedAt)}", style = MaterialTheme.typography.labelSmall, color = WL.colors.muted)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Chip(label: String, emoji: String?, on: Boolean, onClick: () -> Unit) {
    Row(
        Modifier.clip(RoundedCornerShape(999.dp)).background(if (on) WL.colors.math else WL.colors.surface).pressable(onClick = onClick).padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically,
    ) {
        if (emoji != null) EmojiImage(emoji, 20.dp)
        Text(label, style = MaterialTheme.typography.labelLarge, color = if (on) WL.colors.mathInk else WL.colors.text)
    }
}

// ------------------------------------------------------------------------------------------------ editor

@Composable
fun NoteEditor(key: String, subject: String?, title: String?) {
    val app = LocalApp.current
    val win = LocalWindow.current
    val existing = remember(key) { readNote(app, key) }
    var doc by remember(key) { mutableStateOf(existing ?: NoteDoc(key, subject ?: "general", title.orEmpty(), title?.takeIf { it.isNotBlank() })) }
    var dirty by remember { mutableStateOf(false) }
    var savedAt by remember { mutableStateOf(existing?.updatedAt ?: 0L) }
    var draw by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    // autosave shortly after the learner stops typing / drawing, and when leaving
    LaunchedEffect(doc) { if (dirty) { delay(700); saveNote(app, doc); savedAt = nowMillis(); dirty = false } }
    val leave = { if (dirty) saveNote(app, doc); app.back() }
    com.maheshglance.wonderlab.core.platform.BackHandler { leave() }
    val edit = { f: (NoteDoc) -> NoteDoc -> doc = f(doc); dirty = true }

    Column(Modifier.fillMaxSize().background(WL.colors.bg).imePadding()) {
        TopBar(doc.title.ifBlank { "New note" }, onBack = leave, subtitle = "${subjectName(doc.subject)} · " + if (dirty) "Saving…" else if (savedAt > 0) "Saved" else "Not saved yet", actions = {
            IconBtn(Icons.Rounded.Delete, "Delete note", { confirmDelete = true }, size = 44.dp)
        })
        Column(
            Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState()).padding(horizontal = if (win.isPhone) 12.dp else 24.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            OutlinedTextField(doc.title, { t -> edit { it.copy(title = t.take(120)) } }, Modifier.fillMaxWidth(), label = { Text("Title") }, singleLine = true, shape = RoundedCornerShape(14.dp))
            Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                SUBJECT_INFO.keys.forEach { sub -> Chip(subjectName(sub), subjectEmoji(sub), doc.subject == sub) { edit { it.copy(subject = sub) } } }
            }
            Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                WLButton("Type", { draw = false }, small = true, kind = if (!draw) BtnKind.Primary else BtnKind.Normal)
                WLButton("Write by hand", { draw = true }, small = true, kind = if (draw) BtnKind.Primary else BtnKind.Normal)
                if (!draw) {
                    WLButton("• Point", { edit { it.copy(text = it.text.trimEnd() + "\n• ") } }, small = true)
                    WLButton("Heading", { edit { it.copy(text = it.text.trimEnd() + "\n\n## ") } }, small = true)
                } else WLButton("Clear drawing", { edit { it.copy(ink = emptyList()) } }, small = true)
            }
            if (!draw) OutlinedTextField(
                doc.text, { t -> edit { it.copy(text = t.take(40_000)) } },
                Modifier.fillMaxWidth().heightIn(min = 320.dp),
                placeholder = { Text("Write your notes here — in your own words. What did you learn? What is the formula? What should you remember for the exam?") },
                shape = RoundedCornerShape(16.dp), textStyle = MaterialTheme.typography.bodyLarge,
            )
            else InkPad(doc.ink, Modifier.fillMaxWidth().height(if (win.isPhone) 460.dp else 640.dp)) { strokes -> edit { it.copy(ink = strokes) } }
            Text("${doc.text.split(Regex("\\s+")).count { it.isNotBlank() }} words" + if (doc.ink.isNotEmpty()) " · ${doc.ink.size} pen strokes" else "",
                style = MaterialTheme.typography.labelSmall, color = WL.colors.muted)
        }
    }
    if (confirmDelete) androidx.compose.material3.AlertDialog(
        onDismissRequest = { confirmDelete = false },
        title = { Text("Delete this note?") },
        text = { Text("\"${doc.title.ifBlank { "Untitled note" }}\" will be removed from this device and your account.") },
        confirmButton = { WLButton("Delete", { saveNote(app, doc.copy(deleted = true, text = "", ink = emptyList())); confirmDelete = false; app.back() }, kind = BtnKind.Danger) },
        dismissButton = { WLButton("Keep", { confirmDelete = false }) },
    )
}

/** Handwriting pad: finger or stylus; strokes stored in 0..1000 page units so they scale with the screen. */
@Composable
private fun InkPad(ink: List<String>, modifier: Modifier, onChange: (List<String>) -> Unit) {
    val strokes = remember { mutableStateListOf<List<Offset>>().apply { addAll(ink.map(::decode)) } }
    var live by remember { mutableStateOf<List<Offset>>(emptyList()) }
    val inkColor = WL.colors.text
    val lineColor = WL.colors.line
    Box(modifier.clip(RoundedCornerShape(16.dp)).background(Color.White).border(1.dp, WL.colors.line, RoundedCornerShape(16.dp))) {
        Canvas(Modifier.fillMaxSize().pointerInput(Unit) {
            fun norm(p: Offset) = Offset((p.x / size.width * 1000f).coerceIn(0f, 1000f), (p.y / size.height * 1000f).coerceIn(0f, 1000f))
            detectDragGestures(
                onDragStart = { live = listOf(norm(it)) },
                onDrag = { ch, _ -> live = live + norm(ch.position) },
                onDragEnd = { if (live.size > 1) { strokes += live; onChange(strokes.map(::encode)) }; live = emptyList() },
                onDragCancel = { live = emptyList() },
            )
        }) {
            // ruled lines like an exercise book
            var y = 48f
            while (y < size.height) { drawLine(lineColor, Offset(0f, y), Offset(size.width, y), 1f); y += 48f }
            fun draw(pts: List<Offset>) {
                if (pts.size < 2) return
                val path = Path()
                pts.forEachIndexed { i, p -> val x = p.x / 1000f * size.width; val yy = p.y / 1000f * size.height; if (i == 0) path.moveTo(x, yy) else path.lineTo(x, yy) }
                drawPath(path, inkColor, style = Stroke(width = 5f, cap = StrokeCap.Round, join = StrokeJoin.Round))
            }
            strokes.forEach(::draw)
            draw(live)
        }
    }
}

private fun encode(pts: List<Offset>) = pts.joinToString(" ") { "${it.x.toInt()},${it.y.toInt()}" }
private fun decode(s: String) = s.split(' ').mapNotNull { p -> p.split(',').takeIf { it.size == 2 }?.let { (x, y) -> Offset(x.toFloatOrNull() ?: return@let null, y.toFloatOrNull() ?: return@let null) } }
