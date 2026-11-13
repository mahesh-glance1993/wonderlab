package com.maheshglance.wonderlab.feature.art

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Brush
import androidx.compose.material.icons.rounded.ContentCopy
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Palette
import androidx.compose.material.icons.rounded.Print
import androidx.compose.material3.Icon
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
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.WonderLabApp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.CardShape
import com.maheshglance.wonderlab.core.design.ConfirmDialog
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.art.data.ArtStorage
import com.maheshglance.wonderlab.feature.art.data.GalleryItem
import com.maheshglance.wonderlab.feature.art.engine.ArtImages
import com.maheshglance.wonderlab.feature.art.engine.DrawList
import com.maheshglance.wonderlab.feature.art.engine.LayerStack
import com.maheshglance.wonderlab.feature.art.engine.ProjectOps
import com.maheshglance.wonderlab.feature.art.engine.Templates
import com.maheshglance.wonderlab.feature.art.paint.TextDialog
import com.maheshglance.wonderlab.feature.art.ui.ArtConflictHost
import com.maheshglance.wonderlab.feature.art.ui.ToastHost
import com.maheshglance.wonderlab.feature.art.ui.rememberPresentation
import com.maheshglance.wonderlab.feature.art.ui.rememberToaster
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.maheshglance.wonderlab.core.platform.formatDate
import com.maheshglance.wonderlab.core.platform.rememberFileSaver
import com.maheshglance.wonderlab.feature.art.engine.release
import kotlinx.atomicfu.locks.SynchronizedObject
import kotlinx.atomicfu.locks.synchronized

/** Off-screen rendering of a saved artwork (gallery export & print) — the website's artFile.renderArtwork. */
suspend fun renderArtwork(app: WonderLabApp, pid: String, id: String): Pair<String, ImageBitmap>? {
    val a = ArtStorage.load(app, pid, id) ?: return null
    val p = withContext(Dispatchers.Default) { ProjectOps.deserialize(a.data) }
    val tpl = HashMap<String, DrawList>()
    for (l in p.layers) l.template?.let { t -> Templates.drawList(app.engine, t.id)?.let { tpl[t.id] = it } }
    return withContext(Dispatchers.Default) {
        val st = LayerStack(p) { tpl[it.id] }
        try { st.renderAll(); a.title to st.flatten(true) } finally { st.dispose() }
    }
}

/** Private gallery for the active learner profile. */
@Composable
fun GalleryScreen() {
    val app = LocalApp.current
    val s by appState()
    val pid = s.profile?.id ?: return
    val pres = rememberPresentation()
    val scope = rememberCoroutineScope()
    val toaster = rememberToaster()
    Templates.rememberTextSupport()
    var items by remember { mutableStateOf<List<GalleryItem>?>(null) }
    var offline by remember { mutableStateOf(false) }
    var confirm by remember { mutableStateOf<GalleryItem?>(null) }
    var rename by remember { mutableStateOf<GalleryItem?>(null) }
    var busy by remember { mutableStateOf<String?>(null) }
    var reload by remember { mutableStateOf(0) }

    LaunchedEffect(pid, reload) {
        com.maheshglance.wonderlab.feature.art.data.ArtSync.retry(app.application)
        val (list, off) = ArtStorage.fetchGallery(app.application, pid)
        items = list; offline = off
    }
    val act = { id: String, fn: suspend () -> Unit ->
        scope.launch { busy = id; try { fn() } catch (e: Exception) { toaster.show("Sorry, that did not work. Try again.") } finally { busy = null } }
        Unit
    }
    val saver = rememberFileSaver()
    val savePng = { id: String, fileName: String ->
        act(id) {
            val r = renderArtwork(app.application, pid, id) ?: throw IllegalStateException()
            val bytes = try { withContext(Dispatchers.Default) { app.platform.encodePng(r.second) } } finally { r.second.release() }
            saver.save(fileName, "image/png", bytes) { ok -> if (ok) toaster.show("Saved as a picture") }
        }
    }
    val win = LocalWindow.current
    Box(Modifier.fillMaxSize().background(WL.colors.bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar("My Gallery", onBack = { app.back() }, actions = {
                WLButton(if (win.isPhone) "New" else "New painting", { app.go("art/paint") }, kind = BtnKind.Primary, icon = Icons.Rounded.Add, small = true)
            })
            Column(Modifier.weight(1f).fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Icon(Icons.Rounded.Lock, null, tint = WL.colors.muted, modifier = Modifier.size(16.dp))
                    Text("Only you (and your grown-ups) can see these pictures.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                }
                if (offline) AlertBox("Offline — showing pictures saved on this device.", AlertKind.Warn)
                val list = items
                when {
                    list == null -> Loading()
                    list.isEmpty() -> Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(14.dp, Alignment.CenterVertically)) {
                        EmojiImage("🖍️", 96.dp)
                        Text("No pictures yet. Let's make one!", style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            WLButton("Paint", { app.go("art/paint") }, icon = Icons.Rounded.Brush)
                            WLButton("Colour", { app.go("art/color") }, icon = Icons.Rounded.Palette)
                        }
                    }
                    else -> BoxWithConstraints(Modifier.fillMaxSize()) {
                        val cols = (maxWidth / 230.dp).toInt().coerceIn(2, 6)
                        LazyVerticalGrid(GridCells.Fixed(cols), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxSize()) {
                            items(list, key = { it.id }) { it ->
                                GalleryCard(it, busy == it.id, pres.allowTyping,
                                    onOpen = { app.go("art/paint/${it.id}") },
                                    onDuplicate = { act(it.id) { val nid = ArtStorage.duplicate(app.application, pid, it.id); if (nid != null) { toaster.show("Copy made"); reload++ } } },
                                    onRename = { rename = it },
                                    onPng = { savePng(it.id, "${it.title.replace(Regex("[^\\w\\- ]+"), "").trim().ifEmpty { "picture" }}.png") },
                                    onPrint = { app.go("art/print/art/${it.id}") },
                                    onDelete = { confirm = it })
                            }
                        }
                    }
                }
            }
        }
        ToastHost(toaster)
    }
    confirm?.let { it ->
        ConfirmDialog("Delete this picture?", "“${it.title}” will be deleted from your gallery on all devices. This cannot be undone.", "Delete",
            onConfirm = { confirm = null; act(it.id) { ArtStorage.remove(app.application, pid, it.id); items = items?.filter { x -> x.id != it.id }; toaster.show("Picture deleted") } },
            onDismiss = { confirm = null }, dismiss = "Keep it", danger = true)
    }
    rename?.let { it ->
        TextDialog("Rename picture", it.title, 60, onDismiss = { rename = null }) { t -> rename = null; act(it.id) { ArtStorage.rename(app.application, pid, it.id, t); reload++ } }
    }
    ArtConflictHost()
}

/** Decoded gallery thumbnails (most recently used last, at most 60). */
private object ThumbCache {
    private val lock = SynchronizedObject()
    private val map = LinkedHashMap<String, ImageBitmap>()
    fun get(k: String): ImageBitmap? = synchronized(lock) { map.remove(k)?.also { map[k] = it } }
    fun put(k: String, v: ImageBitmap) = synchronized(lock) {
        map.remove(k); map[k] = v
        while (map.size > 60) map.remove(map.keys.first())
    }
}
private val thumbCache = ThumbCache

@Composable
private fun GalleryCard(it: GalleryItem, busy: Boolean, allowTyping: Boolean, onOpen: () -> Unit, onDuplicate: () -> Unit, onRename: () -> Unit, onPng: () -> Unit, onPrint: () -> Unit, onDelete: () -> Unit) {
    val c = WL.colors
    val thumb = remember(it.id, it.thumb?.length, it.updatedAt) {
        it.thumb?.let { t -> val k = "${it.id}:${t.length}:${t.hashCode()}"; thumbCache.get(k) ?: ArtImages.decodeDataUrl(t)?.also { b -> thumbCache.put(k, b) } }
    }
    Column(Modifier.fillMaxWidth().clip(CardShape).background(c.surface).padding(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Box(Modifier.fillMaxWidth().aspectRatio(4f / 3f).clip(RoundedCornerShape(12.dp)).background(Color.White).pressable(onClick = onOpen).semantics { contentDescription = "Open ${it.title}" }, contentAlignment = Alignment.Center) {
            if (thumb != null) Image(thumb, null, contentScale = ContentScale.Fit, modifier = Modifier.fillMaxSize()) else EmojiImage("🖍️", 56.dp)
            if (busy) androidx.compose.material3.CircularProgressIndicator(Modifier.size(28.dp))
        }
        FitText(it.title, style = MaterialTheme.typography.titleSmall, color = c.text, maxLines = 1)
        Text(formatDate(it.updatedAt),style = MaterialTheme.typography.bodySmall, color = c.muted)
        if (it.unsynced) Pill("On this device — will upload")
        if (it.conflictOf != null) Pill("Copy from another device")
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            val sz = 36.dp
            IconBtn(Icons.Rounded.Brush, "Open ${it.title}", onOpen, size = sz)
            IconBtn(Icons.Rounded.ContentCopy, "Duplicate ${it.title}", onDuplicate, size = sz)
            if (allowTyping) IconBtn(Icons.Rounded.Edit, "Rename ${it.title}", onRename, size = sz)
            IconBtn(Icons.Rounded.Download, "Save ${it.title} as PNG", onPng, size = sz)
            IconBtn(Icons.Rounded.Print, "Print ${it.title}", onPrint, size = sz)
            IconBtn(Icons.Rounded.Delete, "Delete ${it.title}", onDelete, size = sz, tint = c.bad, bg = c.badBg)
        }
    }
}
