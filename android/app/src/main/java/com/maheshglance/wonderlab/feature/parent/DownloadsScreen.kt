package com.maheshglance.wonderlab.feature.parent

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.CloudOff
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Sync
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.data.PackInfo
import com.maheshglance.wonderlab.core.data.SyncStatus
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.ConfirmDialog
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.text.DateFormat
import java.util.Date

private val KIND_EMOJI = mapOf("lessons" to "📚", "games" to "🎲", "lab" to "🔦", "art" to "🖍️", "tracing" to "✏️", "coloring" to "🌈", "narration" to "🔊")
private val KIND_NAMES = mapOf("lessons" to "lessons, practice, tests & hints", "games" to "games", "lab" to "simulations", "art" to "painting, tracing & colouring",
    "tracing" to "tracing", "coloring" to "colouring", "narration" to "recorded narration")
private const val LAST_SYNC_KEY = "device-last-sync"

private fun fmtBytes(b: Long): String = when {
    b >= 1L shl 30 -> "%.1f GB".format(b / (1L shl 30).toDouble())
    b >= 1L shl 20 -> "%.1f MB".format(b / (1L shl 20).toDouble())
    b >= 1L shl 10 -> "%.0f KB".format(b / 1024.0)
    else -> "$b B"
}

private fun dirSize(f: File): Long = if (f.isDirectory) f.listFiles()?.sumOf { dirSize(it) } ?: 0 else f.length()

/**
 * `/downloads` — in the app every pack is part of the APK, so this honestly shows "on this device" for each pack
 * of the learner's class (same pack list as the website), plus sync status, learners saved here, storage, and
 * "Remove this device's data" (parent check).
 */
@Composable
fun DownloadsScreen() {
    val app = LocalApp.current
    val s by appState()
    val profile = s.profile ?: return
    val win = LocalWindow.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val levels = rememberLevels()
    var packs by remember { mutableStateOf<List<PackInfo>?>(null) }
    var used by remember { mutableLongStateOf(-1L) }
    var lastSync by remember { mutableLongStateOf(app.application.store.readText(LAST_SYNC_KEY)?.toLongOrNull() ?: 0L) }
    var removeAsk by remember { mutableStateOf(false) }
    var removeUnsynced by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        packs = runCatching { app.engine.get<List<PackInfo>>("core.packs") }.getOrDefault(emptyList())
        app.repo.countPending()
        used = withContext(Dispatchers.IO) { dirSize(context.filesDir) + dirSize(context.cacheDir) }
    }
    // remember the last moment this device was confirmed fully uploaded
    LaunchedEffect(s.online, s.pending, s.sync) {
        if (s.online && s.pending == 0 && s.sync == SyncStatus.Idle) {
            val now = System.currentTimeMillis()
            app.application.store.writeText(LAST_SYNC_KEY, now.toString()); lastSync = now
        }
    }

    val classPacks = packs.orEmpty().filter { profile.classLevel in it.classLevels || it.kind == "lessons" }
    val classLabel = { p: PackInfo ->
        when {
            p.kind == "lessons" && p.classLevels.size == 1 -> levels.classLabel(p.classLevels[0])
            p.classLevels.size > 10 -> "All classes"
            p.classLevels.isEmpty() -> ""
            else -> "${levels.classLabel(p.classLevels.first())}–${levels.classLabel(p.classLevels.last().coerceAtMost(12))}"
        }
    }

    val status: @Composable ColumnScope.() -> Unit = {
        SettingsCard("Offline use on this device") {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                EmojiImage("📦", 56.dp)
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Icon(Icons.Rounded.CheckCircle, null, tint = WL.colors.good)
                        Text("Everything is on this device", style = MaterialTheme.typography.titleMedium, color = WL.colors.good)
                    }
                    Text("${profile.nickname}'s lessons, practice, tests, games, simulations, art and language courses are built into the app and work without internet. Nothing needs downloading.",
                        style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                }
            }
            SyncLine()
            if (lastSync > 0) Text("Last confirmed in sync: ${DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(lastSync))}",
                style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
        }
        SettingsCard("Learners on this device") {
            s.profiles.forEach { p ->
                val saved = app.repo.hasOfflineData(p.id)
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(WL.colors.surface2).padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    EmojiImage(levels.emoji(p.avatar), 36.dp)
                    Column(Modifier.weight(1f)) {
                        Text(p.nickname, style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
                        Text(levels.classLabel(p.classLevel), style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                    }
                    if (saved || p.id == s.profileId) Pill("Available offline", bg = WL.colors.goodBg, fg = WL.colors.good)
                    else Pill("Open once online to save progress here")
                }
            }
            val kinds = classPacks.filter { profile.classLevel in it.classLevels }.mapNotNull { KIND_NAMES[it.kind] }.distinct()
            Text("Offline, ${profile.nickname} can use: ${kinds.joinToString(", ").ifEmpty { "lessons" }}. Sign-in, password recovery, account and session settings, natural voices, the content editor and publishing need internet.",
                style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
        }
    }
    val packList: @Composable ColumnScope.() -> Unit = {
        SettingsCard("Packs", subtitle = "Part of the app on this device — updated with the app from the store.") {
            if (packs == null) Text("Loading…", color = WL.colors.muted)
            classPacks.forEach { p ->
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(WL.colors.surface2).padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    EmojiImage(KIND_EMOJI[p.kind] ?: "📦", 36.dp)
                    Column(Modifier.weight(1f)) {
                        Text(if (WL.lang == "te" && !p.titleTe.isNullOrBlank()) p.titleTe else p.title, style = MaterialTheme.typography.titleSmall, color = WL.colors.text)
                        Text(classLabel(p), style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                    }
                    Pill("On this device", bg = WL.colors.goodBg, fg = WL.colors.good, icon = Icons.Rounded.CheckCircle)
                }
            }
        }
        SettingsCard("Storage") {
            Text(if (used >= 0) "Saved progress and settings use ${fmtBytes(used)} on this device." else "Measuring…", style = MaterialTheme.typography.bodyMedium, color = WL.colors.text)
            Text("Important: uninstalling the app or clearing its storage removes any work not yet synced. Connect regularly so work is uploaded.",
                style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            ParentGate("Removing this device's data is done by a parent.", inline = true) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    WLButton("Remove this device's data", { removeAsk = true }, kind = BtnKind.Danger, icon = Icons.Rounded.Delete, small = true)
                    Text("Removes saved learner data, queued uploads and offline access for every account on this device, and signs out. Lessons and games stay — they are part of the app.",
                        style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                }
            }
        }
    }

    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar("Downloads", onBack = { app.back() })
        Column(Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState()).padding(if (win.isPhone) 12.dp else 20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Column(Modifier.widthIn(max = 1100.dp).fillMaxWidth()) { AdaptiveColumns(left = status, right = packList) }
        }
    }

    if (removeAsk) ConfirmDialog(
        if (removeUnsynced) "Delete unsynced work?" else "Remove this device's data?",
        if (removeUnsynced) "${s.pending} item(s) have not been uploaded yet and will be lost." else "You will be signed out and everything WonderLab saved on this device will be removed. Synced progress stays safe in your account.",
        if (removeUnsynced) "Delete anyway" else "Remove",
        onConfirm = {
            scope.launch {
                val r = removeDeviceData(app, force = removeUnsynced)
                if (r == "unsynced") removeUnsynced = true else { removeAsk = false; removeUnsynced = false; app.replace(Routes.SIGNIN) }
            }
        },
        onDismiss = { removeAsk = false; removeUnsynced = false }, dismiss = "Keep everything", danger = true,
    )
}

/** "Offline · saved on this device · N awaiting sync" / "Everything is synced", with Retry and Sign in. */
@Composable
fun SyncLine() {
    val app = LocalApp.current
    val s by appState()
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(if (!s.online) Icons.Rounded.CloudOff else Icons.Rounded.Sync, null, tint = if (!s.online || s.pending > 0) WL.colors.warn else WL.colors.good)
            val text = buildString {
                if (!s.online) append("Offline · saved on this device. ")
                append(when {
                    s.sync == SyncStatus.Syncing -> "Syncing…"
                    s.pending > 0 -> "${s.pending} item${if (s.pending == 1) "" else "s"} awaiting sync."
                    else -> "Everything is synced."
                })
            }
            Text(text, style = MaterialTheme.typography.bodyMedium, color = WL.colors.text, modifier = Modifier.weight(1f))
            if (s.pending > 0 && s.online && s.sync != SyncStatus.Paused) WLButton("Retry sync", { app.repo.retrySync() }, small = true)
        }
        if (s.sync == SyncStatus.Paused) {
            AlertBox(s.syncMessage ?: "Uploads are paused until a parent signs in again as ${s.account?.username}.", AlertKind.Warn)
            WLButton("Sign in", { app.go(Routes.SIGNIN) }, kind = BtnKind.Primary, small = true)
        } else if (s.sync == SyncStatus.Error && s.syncMessage != null) AlertBox(s.syncMessage!!, AlertKind.Warn)
    }
}
