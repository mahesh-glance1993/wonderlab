package com.maheshglance.wonderlab.feature.art.paint

import com.maheshglance.wonderlab.core.design.FitText

import android.graphics.Paint
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.Redo
import androidx.compose.material.icons.automirrored.rounded.Undo
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.CloudOff
import androidx.compose.material.icons.rounded.CloudUpload
import androidx.compose.material.icons.rounded.Colorize
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.ErrorOutline
import androidx.compose.material.icons.rounded.FormatColorFill
import androidx.compose.material.icons.rounded.Image
import androidx.compose.material.icons.rounded.PanTool
import androidx.compose.material.icons.rounded.Print
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material.icons.rounded.ZoomIn
import androidx.compose.material.icons.rounded.ZoomOut
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.isCtrlPressed
import androidx.compose.ui.input.key.isMetaPressed
import androidx.compose.ui.input.key.isShiftPressed
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.input.pointer.PointerEventType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.isCtrlPressed as ptrCtrl
import androidx.compose.ui.input.pointer.isMetaPressed as ptrMeta
import androidx.compose.ui.input.pointer.pointerInteropFilter
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.maheshglance.wonderlab.core.design.ErrorState
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.art.data.ArtSync
import com.maheshglance.wonderlab.feature.art.data.ArtSyncStatus
import com.maheshglance.wonderlab.feature.art.engine.Brushes
import com.maheshglance.wonderlab.feature.art.engine.IntensitySource
import com.maheshglance.wonderlab.feature.art.engine.ProjectOps
import com.maheshglance.wonderlab.feature.art.ui.ArtConflictHost
import com.maheshglance.wonderlab.feature.art.ui.CelebrationHost
import com.maheshglance.wonderlab.feature.art.ui.Segmented
import com.maheshglance.wonderlab.feature.art.ui.ToastHost
import com.maheshglance.wonderlab.feature.art.ui.rememberCelebration
import com.maheshglance.wonderlab.feature.art.ui.rememberPresentation
import com.maheshglance.wonderlab.feature.art.ui.rememberToaster
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonPrimitive

private enum class PanelTab { Colour, Brush, Layers }

/**
 * Paint studio: full-screen canvas; tools in a vertical rail on tablets/landscape and a compact bottom bar on
 * phones; colour / brush / layer panels docked on wide screens and as sheets elsewhere. Never scrolls the page.
 */
@OptIn(ExperimentalComposeUiApi::class, ExperimentalMaterial3Api::class)
@Composable
fun StudioScreen(routeId: String, sizeParam: String?, paperParam: String?, pageParam: String?) {
    val app = LocalApp.current
    val s by appState()
    val pid = s.profile?.id ?: return
    val pres = rememberPresentation()
    val early = WL.tier.tier == "early"
    val allowTyping = pres.allowTyping
    val lang = WL.lang
    val win = LocalWindow.current
    val scope = rememberCoroutineScope()
    val toaster = rememberToaster()
    val celebration = rememberCelebration()
    val ctl = remember(routeId) { StudioController(app.application, pid, routeId, early, scope) { toaster.show(it) } }
    val prefs = s.prefs

    LaunchedEffect(routeId) { ctl.load(sizeParam, paperParam, pageParam) }

    // save when the app goes to the background and when leaving; free the bitmaps afterwards
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    DisposableEffect(routeId) {
        val obs = LifecycleEventObserver { _, e -> if (e == Lifecycle.Event.ON_STOP) scope.launch { ctl.saveNow() } }
        lifecycle.addObserver(obs)
        onDispose {
            lifecycle.removeObserver(obs)
            app.application.scope.launch(Dispatchers.Main) {
                ctl.endStroke(true)
                while (ctl.busy) kotlinx.coroutines.delay(50) // never free bitmaps a background replay is using
                ctl.saveNow(); ctl.dispose()
            }
        }
    }
    // keep manual intensity in prefs (debounced)
    LaunchedEffect(ctl.intensity) {
        if (kotlin.math.abs(ctl.intensity - prefs.manualIntensity) < 0.005f) return@LaunchedEffect
        kotlinx.coroutines.delay(700)
        app.repo.updatePrefs(mapOf("manualIntensity" to JsonPrimitive((ctl.intensity * 100).toInt() / 100f)))
    }
    // the server kept both copies after an offline edit clash: keep working on our copy
    val moved by ArtSync.moved.collectAsState()
    LaunchedEffect(moved) {
        val m = moved ?: return@LaunchedEffect
        if (m.pid == pid && m.originalId == ctl.id) { ctl.movedTo(m.copyId); toaster.show("This picture changed on another device, so your version was kept as a separate copy.") }
    }

    var sheet by rememberSaveable { mutableStateOf<String?>(null) } // "panel" on phones
    var tab by rememberSaveable { mutableStateOf(PanelTab.Colour) }
    var docked by rememberSaveable { mutableStateOf(win.width > 900.dp) }
    var calib by remember { mutableStateOf(false) }
    var renaming by remember { mutableStateOf(false) }
    val ctx = LocalContext.current

    val exportLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("image/png")) { uri ->
        if (uri != null) scope.launch {
            val bmp = ctl.flattened() ?: return@launch
            val ok = withContext(Dispatchers.IO) { runCatching { ctx.contentResolver.openOutputStream(uri)?.use { bmp.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, it) } }.isSuccess }
            bmp.recycle()
            toaster.show(if (ok) "Saved as a picture" else "Sorry, that did not work. Try again.")
        }
    }
    val safeName = ctl.title.replace(Regex("[^\\w\\- ]+"), "").trim().ifEmpty { "picture" }

    if (ctl.status == "error") {
        Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
            StudioTop("Art Studio", null, ctl, early, allowTyping, onBack = { app.go("art/gallery") }, onRename = {})
            ErrorState("This picture could not be opened.", null)
        }
        return
    }

    val wide = win.landscape || win.isTablet
    val focus = remember { FocusRequester() }
    LaunchedEffect(ctl.status) { if (ctl.status == "ready") runCatching { focus.requestFocus() } }

    Box(
        Modifier.fillMaxSize().background(WL.colors.bg)
            .focusRequester(focus).focusable()
            .onPreviewKeyEvent { e -> handleKey(e, ctl, lang) },
    ) {
        Column(Modifier.fillMaxSize()) {
            StudioTop(ctl.title, ctl, ctl, early, allowTyping, onBack = { app.back() }, onRename = { renaming = true },
                trailing = {
                    if (wide && !docked) IconBtn(Icons.Rounded.Tune, "Show panel", { docked = true; if (win.width <= 900.dp) sheet = "panel" }, size = 44.dp)
                })
            if (wide) {
                Row(Modifier.weight(1f).fillMaxWidth()) {
                    ToolBar(ctl, early, lang, vertical = true, onPanel = { if (win.width > 900.dp) docked = !docked else sheet = "panel" }, onColour = { tab = PanelTab.Colour; if (win.width > 900.dp) docked = true else sheet = "panel" })
                    Box(Modifier.weight(1f).fillMaxHeight()) {
                        CanvasView(ctl, lang)
                        CanvasOverlays(ctl)
                        ToastHost(toaster)
                        CelebrationHost(celebration)
                    }
                    if (docked && win.width > 900.dp) {
                        Surface(color = WL.colors.surface, shadowElevation = 4.dp, modifier = Modifier.width(360.dp).fillMaxHeight().windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.End + WindowInsetsSides.Bottom))) {
                            StudioPanel(ctl, tab, { tab = it }, early, allowTyping, lang, prefs.pressureMode, { calib = true }, onClose = { docked = false },
                                onPng = { exportLauncher.launch("$safeName.png") }, onPrint = { scope.launch { ctl.markDirty(); ctl.saveNow(); app.go("art/print/art/${ctl.id}") } },
                                onGallery = { scope.launch { ctl.saveNow(); app.go("art/gallery") } }, onDone = { celebration.fire(); ctl.project?.meta?.pageId?.let { app.repo.award("art-colour-$it") } })
                        }
                    }
                }
            } else {
                Box(Modifier.weight(1f).fillMaxWidth()) {
                    CanvasView(ctl, lang)
                    CanvasOverlays(ctl)
                    ToastHost(toaster)
                    CelebrationHost(celebration)
                }
                ToolBar(ctl, early, lang, vertical = false, onPanel = { tab = if (tab == PanelTab.Colour) PanelTab.Brush else tab; sheet = "panel" }, onColour = { tab = PanelTab.Colour; sheet = "panel" })
            }
        }
        if (ctl.status == "loading") Box(Modifier.fillMaxSize().background(WL.colors.bg.copy(alpha = 0.6f))) { Loading(text = "Opening…") }
    }

    if (sheet == "panel") {
        val st = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        ModalBottomSheet(onDismissRequest = { sheet = null }, sheetState = st, containerColor = WL.colors.surface) {
            Box(Modifier.fillMaxWidth().fillMaxHeight(0.82f)) {
                StudioPanel(ctl, tab, { tab = it }, early, allowTyping, lang, prefs.pressureMode, { calib = true }, onClose = { sheet = null },
                    onPng = { exportLauncher.launch("$safeName.png") }, onPrint = { sheet = null; scope.launch { ctl.markDirty(); ctl.saveNow(); app.go("art/print/art/${ctl.id}") } },
                    onGallery = { sheet = null; scope.launch { ctl.saveNow(); app.go("art/gallery") } }, onDone = { sheet = null; celebration.fire(); ctl.project?.meta?.pageId?.let { app.repo.award("art-colour-$it") } },
                    onPicked = { if (!win.isTablet) sheet = null })
            }
        }
    }
    if (calib) CalibrationDialog(PalettePrefs.calibration(app.application), onClose = { calib = false }, onSave = { c ->
        PalettePrefs.saveCalibration(app.application, c); calib = false; toaster.show(if (c != null) "Pen calibrated" else "Calibration reset")
    })
    if (renaming) TextDialog("Rename picture", ctl.title, 60, onDismiss = { renaming = false }) { t -> ctl.rename(t); renaming = false }
    ArtConflictHost()
}

private fun handleKey(e: androidx.compose.ui.input.key.KeyEvent, ctl: StudioController, lang: String): Boolean {
    if (e.key == Key.Spacebar) { ctl.spaceHeld = e.type == KeyEventType.KeyDown; return true }
    if (e.type != KeyEventType.KeyDown) return false
    val mod = e.isCtrlPressed || e.isMetaPressed
    if (mod && e.key == Key.Z) { if (e.isShiftPressed) ctl.redo() else ctl.undo(); return true }
    if (mod && e.key == Key.Y) { ctl.redo(); return true }
    if (mod) return false
    when (e.key) {
        Key.B -> ctl.setTool(Tool.Brush, ctl.brush, lang)
        Key.E -> ctl.setTool(Tool.Brush, "eraser", lang)
        Key.G, Key.F -> ctl.setTool(Tool.Fill, lang = lang)
        Key.I -> ctl.setTool(Tool.Eyedropper, lang = lang)
        Key.H -> if (!ctl.early) ctl.setTool(Tool.Hand, lang = lang) else return false
        Key.Plus, Key.Equals, Key.NumPadAdd -> ctl.zoomBy(1.25f)
        Key.Minus, Key.NumPadSubtract -> ctl.zoomBy(0.8f)
        Key.Zero -> ctl.fit()
        Key.LeftBracket -> ctl.nudgeSize(false)
        Key.RightBracket -> ctl.nudgeSize(true)
        else -> return false
    }
    return true
}

@Composable
private fun StudioTop(title: String, ctlOrNull: StudioController?, ctl: StudioController, early: Boolean, allowTyping: Boolean, onBack: () -> Unit, onRename: () -> Unit, trailing: @Composable () -> Unit = {}) {
    val phone = LocalWindow.current.isPhone
    Surface(color = WL.colors.surface, shadowElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Row(
            Modifier.windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top + WindowInsetsSides.Horizontal)).defaultMinSize(minHeight = 52.dp).padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            IconBtn(Icons.AutoMirrored.Rounded.ArrowBack, "Back", onBack, size = 44.dp)
            val canRename = !early && allowTyping && ctlOrNull != null
            Row(Modifier.weight(1f).clip(RoundedCornerShape(10.dp)).then(if (canRename) Modifier.pressable(onClick = onRename).semantics { contentDescription = "Rename picture: $title" } else Modifier).padding(horizontal = 6.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                FitText(title, style = MaterialTheme.typography.titleMedium, color = WL.colors.text, maxLines = 1, modifier = Modifier.weight(1f, fill = false))
                if (canRename) Icon(Icons.Rounded.Edit, null, tint = WL.colors.muted, modifier = Modifier.size(16.dp))
            }
            if (ctlOrNull != null) {
                SaveStatus(ctl, compact = phone)
                @Suppress("UNUSED_VARIABLE") val v = ctl.ver
                IconBtn(Icons.AutoMirrored.Rounded.Undo, "Undo", { ctl.undo() }, size = 44.dp, enabled = ctl.canUndo)
                IconBtn(Icons.AutoMirrored.Rounded.Redo, "Redo", { ctl.redo() }, size = 44.dp, enabled = ctl.canRedo)
            }
            trailing()
        }
    }
}

@Composable
private fun SaveStatus(ctl: StudioController, compact: Boolean) {
    val app = LocalApp.current
    val sync by ArtSync.status.collectAsState()
    val msg by ArtSync.message.collectAsState()
    data class L(val icon: ImageVector, val text: String, val color: Color, val retry: (() -> Unit)? = null)
    val c = WL.colors
    val l = when {
        ctl.local == "saving" -> L(Icons.Rounded.CloudUpload, "Saving…", c.muted)
        ctl.local == "error" -> L(Icons.Rounded.ErrorOutline, "Could not save", c.bad) { ctl.retrySave() }
        ctl.local == "idle" -> null
        sync == ArtSyncStatus.Saving -> L(Icons.Rounded.CloudUpload, "Saving…", c.muted)
        sync == ArtSyncStatus.Offline -> L(Icons.Rounded.CloudOff, "Offline (saved on device)", c.warn)
        sync == ArtSyncStatus.Error -> L(Icons.Rounded.ErrorOutline, msg?.takeIf { it.startsWith("Saved on this device") } ?: "Saved on device — not uploaded", c.bad) { ArtSync.retry(app.application) }
        else -> L(Icons.Rounded.Check, "Saved", c.good)
    } ?: return
    Row(
        Modifier.clip(RoundedCornerShape(999.dp)).background(c.surface2).then(if (l.retry != null) Modifier.pressable(onClick = l.retry) else Modifier)
            .semantics { contentDescription = l.text + if (l.retry != null) ". Tap to retry" else "" }.padding(horizontal = 8.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Icon(l.icon, null, tint = l.color, modifier = Modifier.size(18.dp))
        if (!compact) Text(if (l.retry != null) "${l.text} · Retry" else l.text, style = MaterialTheme.typography.labelSmall, color = c.text, maxLines = 1)
    }
}

@OptIn(ExperimentalComposeUiApi::class)
@Composable
private fun CanvasView(ctl: StudioController, lang: String) {
    val shadow = remember { Paint().apply { color = 0x33000000; setShadowLayer(18f, 0f, 4f, 0x55000000) } }
    val bg = WL.colors.surface2
    Canvas(
        Modifier.fillMaxSize().background(bg)
            .onSizeChanged { ctl.onViewport(it.width.toFloat(), it.height.toFloat()) }
            .semantics { contentDescription = "Canvas. ${if (ctl.tool == Tool.Brush) Brushes.def(ctl.brush).label else ctl.tool.name} selected." }
            .pointerInteropFilter { ev -> ctl.onTouch(ev, lang) }
            .pointerInput(Unit) {
                awaitPointerEventScope {
                    while (true) {
                        val e = awaitPointerEvent()
                        if (e.type != PointerEventType.Scroll) continue
                        val ch = e.changes.firstOrNull() ?: continue
                        ctl.onScroll(ch.scrollDelta.x, ch.scrollDelta.y, ch.position.x, ch.position.y, e.keyboardModifiers.let { m -> m.ptrCtrl || m.ptrMeta })
                        ch.consume()
                    }
                }
            },
    ) {
        @Suppress("UNUSED_VARIABLE") val f = ctl.frame
        val st = ctl.stack ?: return@Canvas
        val p = ctl.project ?: return@Canvas
        drawIntoCanvas { c ->
            val nc = c.nativeCanvas
            nc.save()
            nc.translate(ctl.tx, ctl.ty); nc.scale(ctl.s, ctl.s)
            nc.drawRect(0f, 0f, p.w.toFloat(), p.h.toFloat(), shadow)
            nc.clipRect(0f, 0f, p.w.toFloat(), p.h.toFloat())
            st.drawInto(nc, true, ctl.livePainter, filter = ctl.s < 2f)
            nc.restore()
        }
    }
}

@Composable
private fun androidx.compose.foundation.layout.BoxScope.CanvasOverlays(ctl: StudioController) {
    val c = WL.colors
    val src = ctl.showSource
    Row(
        Modifier.align(Alignment.BottomStart).padding(10.dp).clip(RoundedCornerShape(999.dp)).background(c.surface.copy(alpha = 0.92f)).padding(horizontal = 10.dp, vertical = 6.dp)
            .semantics { contentDescription = if (src == IntensitySource.Pen) "Your pen pressure controls the strokes" else "The intensity slider controls the strokes" },
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Icon(if (src == IntensitySource.Pen) Icons.Rounded.Edit else Icons.Rounded.PanTool, null, tint = c.text, modifier = Modifier.size(16.dp))
        Text(if (src == IntensitySource.Pen) "Pen Pressure" else "Manual Intensity", style = MaterialTheme.typography.labelSmall, color = c.text)
    }
    Row(
        Modifier.align(Alignment.BottomEnd).padding(10.dp).clip(RoundedCornerShape(999.dp)).background(c.surface.copy(alpha = 0.92f)).padding(2.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconBtn(Icons.Rounded.ZoomOut, "Zoom out", { ctl.zoomBy(0.8f) }, size = 40.dp, bg = Color.Transparent)
        Box(Modifier.clip(RoundedCornerShape(10.dp)).pressable { ctl.fit() }.semantics { contentDescription = "Zoom ${ctl.zoom}%. Fit to screen" }.padding(horizontal = 6.dp, vertical = 8.dp)) {
            Text("${ctl.zoom}%", style = MaterialTheme.typography.labelMedium, color = c.text)
        }
        IconBtn(Icons.Rounded.ZoomIn, "Zoom in", { ctl.zoomBy(1.25f) }, size = 40.dp, bg = Color.Transparent)
    }
    if (ctl.busy) Box(Modifier.align(Alignment.TopEnd).padding(10.dp)) { androidx.compose.material3.CircularProgressIndicator(Modifier.size(22.dp), strokeWidth = 2.5.dp) }
}

private data class ToolItem(val key: String, val label: String, val emoji: String?, val icon: ImageVector?, val selected: Boolean, val onClick: () -> Unit)

/** Tool rail (vertical) / bottom toolbar: brushes fit inline when there is room, otherwise behind one brush button. */
@Composable
private fun ToolBar(ctl: StudioController, early: Boolean, lang: String, vertical: Boolean, onPanel: () -> Unit, onColour: () -> Unit) {
    val c = WL.colors
    val brushes = if (early) Brushes.EARLY else Brushes.ORDER
    val te = lang == "te"
    val tools = buildList {
        add(ToolItem("fill", "Fill", "🪣", null, ctl.tool == Tool.Fill) { ctl.setTool(Tool.Fill, lang = lang) })
        add(ToolItem("pick", "Pick", null, Icons.Rounded.Colorize, ctl.tool == Tool.Eyedropper) { ctl.setTool(Tool.Eyedropper, lang = lang) })
        if (!early) add(ToolItem("hand", "Move", "✋", null, ctl.tool == Tool.Hand) { ctl.setTool(Tool.Hand, lang = lang) })
    }
    val brushItems = brushes.map { b -> val d = Brushes.def(b); ToolItem(b, if (te) d.labelTe else d.label, d.emoji, null, ctl.tool == Tool.Brush && ctl.brush == b) { ctl.setTool(Tool.Brush, b, lang) } }
    Surface(color = c.surface, shadowElevation = 3.dp) {
        BoxWithConstraints(
            if (vertical) Modifier.fillMaxHeight().windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Start + WindowInsetsSides.Bottom)).padding(vertical = 6.dp, horizontal = 4.dp)
            else Modifier.fillMaxWidth().navigationBarsPadding().padding(horizontal = 4.dp, vertical = 4.dp),
        ) {
            val avail = if (vertical) maxHeight else maxWidth
            val item = if (early) 60.dp else if (vertical) 58.dp else 54.dp
            val fixed = tools.size + 2 // tools + colour + panel
            val inline = avail >= item * (fixed + brushItems.size)
            val n = if (inline) fixed + brushItems.size else fixed + 1
            val cell: Dp = minOf(item + 12.dp, avail / n)
            val content: @Composable () -> Unit = {
                if (inline) brushItems.forEach { ToolButton(it, cell, vertical) }
                else BrushPicker(ctl, brushItems, cell, vertical, te)
                tools.forEach { ToolButton(it, cell, vertical) }
                // colour chip
                Box(Modifier.size(cell).padding(4.dp).clip(RoundedCornerShape(14.dp)).pressable(onClick = onColour).semantics { contentDescription = "Colours: ${com.maheshglance.wonderlab.feature.art.engine.ArtColor.colorName(ctl.color, lang)}" }, contentAlignment = Alignment.Center) {
                    Box(Modifier.size(cell * 0.62f).clip(CircleShape).background(hexColor(ctl.color)).border(3.dp, c.surface, CircleShape).border(4.dp, c.line, CircleShape))
                }
                ToolButton(ToolItem("panel", if (early) "Size" else "More", null, Icons.Rounded.Tune, false, onPanel), cell, vertical)
            }
            if (vertical) Column(Modifier.fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(0.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) { content() }
            else Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly, verticalAlignment = Alignment.CenterVertically) { content() }
        }
    }
}

@Composable
private fun ToolButton(t: ToolItem, cell: Dp, vertical: Boolean) {
    val c = WL.colors
    Column(
        Modifier.size(cell).padding(3.dp).clip(RoundedCornerShape(14.dp)).background(if (t.selected) c.art else Color.Transparent)
            .then(if (t.selected) Modifier.border(2.dp, c.primary, RoundedCornerShape(14.dp)) else Modifier)
            .semantics { contentDescription = t.label; selected = t.selected }.pressable(onClick = t.onClick),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
    ) {
        val pic = cell * 0.46f
        if (t.emoji != null) EmojiImage(t.emoji, pic) else if (t.icon != null) Icon(t.icon, null, tint = if (t.selected) c.artInk else c.text, modifier = Modifier.size(pic * 0.85f))
        if (cell >= 52.dp) FitText(t.label, style = MaterialTheme.typography.labelSmall, color = if (t.selected) c.artInk else c.muted, maxLines = 1, textAlign = TextAlign.Center)
    }
    @Suppress("UNUSED_EXPRESSION") vertical
}

@Composable
private fun BrushPicker(ctl: StudioController, items: List<ToolItem>, cell: Dp, vertical: Boolean, te: Boolean) {
    var open by remember { mutableStateOf(false) }
    val cur = items.firstOrNull { it.key == ctl.brush } ?: items.first()
    Box {
        ToolButton(cur.copy(selected = ctl.tool == Tool.Brush, onClick = { open = true }, label = cur.label), cell, vertical)
        DropdownMenu(open, { open = false }) {
            items.forEach { it2 ->
                DropdownMenuItem(
                    text = { Column { Text(it2.label, style = MaterialTheme.typography.titleSmall); Text(Brushes.def(it2.key).hint, style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, maxLines = 2) } },
                    leadingIcon = { EmojiImage(it2.emoji ?: "🖍️", 32.dp) },
                    trailingIcon = { if (it2.selected) Icon(Icons.Rounded.Check, null) },
                    onClick = { open = false; it2.onClick() },
                )
            }
        }
    }
    @Suppress("UNUSED_EXPRESSION") te
}

/** Colour / Brush / Layers panel with save & share actions (docked on wide screens, a sheet on phones). */
@Composable
private fun StudioPanel(
    ctl: StudioController, tab: PanelTab, setTab: (PanelTab) -> Unit, early: Boolean, allowTyping: Boolean, lang: String, pressureMode: String,
    onCalibrate: () -> Unit, onClose: () -> Unit, onPng: () -> Unit, onPrint: () -> Unit, onGallery: () -> Unit, onDone: () -> Unit, onPicked: () -> Unit = {},
) {
    val app = LocalApp.current
    val p = ctl.project ?: return
    @Suppress("UNUSED_VARIABLE") val v = ctl.ver
    Column(Modifier.fillMaxSize().padding(horizontal = 14.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (!early) Segmented(listOf(PanelTab.Colour to "Colour", PanelTab.Brush to "Brush", PanelTab.Layers to "Layers"), tab, setTab, Modifier.weight(1f))
            else Spacer(Modifier.weight(1f))
            IconBtn(Icons.Rounded.Close, "Close panel", onClose, size = 40.dp)
        }
        Column(Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            val wheel = if (LocalWindow.current.isPhone) 210.dp else 240.dp
            if (early || tab == PanelTab.Colour) ColorPanel(ctl.color, { ctl.pickColor(it) }, p.recent, p.palettes, { ctl.setPalettes(it) }, early, allowTyping, lang, wheel)
            if (early || tab == PanelTab.Brush) BrushPanel(ctl, early, lang, onCalibrate, { ctl.changePaper(it) }, pressureMode,
                { app.repo.updatePrefs(mapOf("pressureMode" to JsonPrimitive(it))) }, PalettePrefs.calibration(app.application) != null)
            if (!early && tab == PanelTab.Layers) LayersPanel(p, ctl.ver, allowTyping,
                onSelect = { ctl.selectLayer(it); onPicked() },
                onAdd = { ctl.layerAction { pp -> ProjectOps.addLayer(pp) } },
                onDelete = { id -> ctl.layerAction { pp -> ProjectOps.deleteLayer(pp, id) } },
                onProps = { id, pr -> ctl.layerAction { pp -> ProjectOps.setLayerProps(pp, id, pr) } },
                onMove = { id, d -> ctl.layerAction { pp -> ProjectOps.moveLayer(pp, id, d) } })
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            WLButton("PNG", onPng, icon = Icons.Rounded.Download, small = true, modifier = Modifier.weight(1f))
            WLButton("Print", onPrint, icon = Icons.Rounded.Print, small = true, modifier = Modifier.weight(1f))
            WLButton("Gallery", onGallery, icon = Icons.Rounded.Image, small = true, modifier = Modifier.weight(1f))
        }
        if (p.meta.kind == "color") WLButton("I'm done!", onDone, icon = Icons.Rounded.AutoAwesome, kind = com.maheshglance.wonderlab.core.design.BtnKind.Primary, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(2.dp))
    }
}

@Suppress("unused") private val keepShadow = Modifier.shadow(0.dp)
