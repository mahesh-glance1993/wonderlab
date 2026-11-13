package com.maheshglance.wonderlab.feature.art.paint

import com.maheshglance.wonderlab.core.platform.*

import com.maheshglance.wonderlab.core.design.FitText

import android.graphics.Bitmap
import android.view.MotionEvent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.ArrowDownward
import androidx.compose.material.icons.rounded.ArrowUpward
import androidx.compose.material.icons.rounded.Brush
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Image
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.LockOpen
import androidx.compose.material.icons.rounded.PanTool
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material.icons.rounded.VisibilityOff
import androidx.compose.material3.Icon
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
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush as GBrush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.pointerInteropFilter
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.ConfirmDialog
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.Meter
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.art.engine.ArtColor
import com.maheshglance.wonderlab.feature.art.engine.ArtIds
import com.maheshglance.wonderlab.feature.art.engine.Brushes
import com.maheshglance.wonderlab.feature.art.engine.Calibration
import com.maheshglance.wonderlab.feature.art.engine.IntensitySource
import com.maheshglance.wonderlab.feature.art.engine.Palette
import com.maheshglance.wonderlab.feature.art.engine.Paper
import com.maheshglance.wonderlab.feature.art.engine.Pressure
import com.maheshglance.wonderlab.feature.art.engine.Project
import com.maheshglance.wonderlab.feature.art.engine.ProjectOps
import com.maheshglance.wonderlab.feature.art.engine.LayerProps
import com.maheshglance.wonderlab.feature.art.ui.ArtDialog
import com.maheshglance.wonderlab.feature.art.ui.LabeledSlider
import com.maheshglance.wonderlab.feature.art.ui.Segmented
import com.maheshglance.wonderlab.feature.art.ui.SubTitle
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin

/** Built-in colour sets (always available alongside the colour wheel) — same as the website. */
data class PresetSet(val id: String, val en: String, val te: String, val colors: List<String>)
val PRESETS = listOf(
    PresetSet("crayons", "Classic Crayons", "క్రేయాన్ రంగులు", listOf("#D64545", "#F28C28", "#F2C94C", "#34A853", "#3675D3", "#8054C7", "#8B5A3C", "#20242E", "#FFFFFF")),
    PresetSet("watercolors", "Soft Watercolours", "మెత్తని వాటర్ కలర్స్", listOf("#E8A5B7", "#F6BC9B", "#F4D889", "#A9C5A0", "#A5CCE8", "#B8ACE0")),
)
val KID_SWATCHES = listOf("#e53935", "#fb8c00", "#fdd835", "#9ccc65", "#43a047", "#26a69a", "#81d4fa", "#1e88e5", "#8e24aa", "#ec407a", "#6d4c41", "#ffccbc")

fun hexColor(hex: String) = Color(ArtColor.argb(hex))

@Composable
fun Swatch(hex: String, selected: Boolean, onPick: (String) -> Unit, lang: String, big: Boolean = false) {
    val name = ArtColor.colorName(hex, lang)
    val sz = if (big) 46.dp else 36.dp
    val light = (ArtColor.parseHex(hex)?.let { it[0] * 0.3 + it[1] * 0.59 + it[2] * 0.11 } ?: 0.0) > 150
    Box(
        Modifier.size(sz).clip(CircleShape).background(hexColor(hex))
            .border(if (selected) 3.dp else 1.dp, if (selected) WL.colors.primary else WL.colors.line, CircleShape)
            .semantics { contentDescription = "$name ($hex)"; this.selected = selected }
            .pressable(role = Role.RadioButton) { onPick(hex) },
        contentAlignment = Alignment.Center,
    ) { if (selected) Icon(Icons.Rounded.Check, null, tint = if (light) Color.Black else Color.White, modifier = Modifier.size(sz * 0.55f)) }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SwatchRow(colors: List<String>, current: String, onPick: (String) -> Unit, lang: String, big: Boolean = false) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        colors.forEach { Swatch(it, it.equals(current, ignoreCase = true), onPick, lang, big) }
    }
}

/** Colour at a point of the wheel (x, y relative to centre, r = radius); null outside the circle. */
fun wheelColor(x: Float, y: Float, r: Float, v: Float): FloatArray? {
    val d = hypot(x, y)
    if (d > r * 1.04f) return null
    val h = ((toDegrees(atan2(y, x).toDouble()).toFloat()) + 360f) % 360f
    return floatArrayOf(h, min(1f, d / r), v)
}

/**
 * A full colour circle: hue goes around, colour strength grows from the white centre to the edge, and a
 * Light ↔ Dark slider sets brightness. Tap or drag anywhere (finger, pen or mouse).
 */
@Composable
fun ColorWheel(hsv: FloatArray, onChange: (Float, Float, Float) -> Unit, size: Dp, lang: String) {
    val te = lang == "te"
    val (h, s, v) = Triple(hsv[0], hsv[1], hsv[2])
    val px = with(LocalDensity.current) { size.roundToPx() }.coerceIn(64, 900)
    val vq = (v * 100).roundToInt()
    val disc: ImageBitmap = remember(px, vq) {
        val arr = IntArray(px * px); val R = px / 2f; val vv = vq / 100f
        for (y in 0 until px) for (x in 0 until px) {
            val dx = x + 0.5f - R; val dy = y + 0.5f - R; val d = hypot(dx, dy)
            if (d > R) continue
            val c = ArtColor.hsvToRgb(((toDegrees(atan2(dy, dx).toDouble()).toFloat()) + 360f) % 360f, d / R, vv)
            val a = (min(1f, R - d) * 255).roundToInt()
            arr[y * px + x] = (a shl 24) or (c[0] shl 16) or (c[1] shl 8) or c[2]
        }
        Bitmap.createBitmap(arr, px, px, Bitmap.Config.ARGB_8888).asImageBitmap()
    }
    val hex = ArtColor.toHex(ArtColor.hsvToRgb(h, s, v))
    val cur by androidx.compose.runtime.rememberUpdatedState(hsv)
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Canvas(
            Modifier.size(size)
                .semantics { contentDescription = "${if (te) "రంగుల చక్రం" else "Colour wheel"}: ${if (te) "రంగు" else "hue"} ${h.roundToInt()}°, ${if (te) "గాఢత" else "strength"} ${(s * 100).roundToInt()}%, $hex" }
                .pointerInput(px) {
                    detectTapGestures { o -> wheelColor(o.x - this.size.width / 2f, o.y - this.size.height / 2f, this.size.width / 2f, cur[2])?.let { onChange(it[0], it[1], it[2]) } }
                }
                .pointerInput(px) {
                    detectDragGestures { ch, _ -> val o = ch.position; wheelColor(o.x - this.size.width / 2f, o.y - this.size.height / 2f, this.size.width / 2f, cur[2])?.let { onChange(it[0], it[1], it[2]) } }
                },
        ) {
            drawImage(disc, dstSize = androidx.compose.ui.unit.IntSize(this.size.width.roundToInt(), this.size.height.roundToInt()))
            val r = this.size.width / 2
            val a = toRadians(h.toDouble())
            val c = Offset(r + (cos(a) * s * r).toFloat(), r + (sin(a) * s * r).toFloat())
            drawCircle(hexColor(hex), 12.dp.toPx(), c)
            drawCircle(Color.White, 12.dp.toPx(), c, style = Stroke(3.dp.toPx()))
            drawCircle(Color.Black.copy(alpha = 0.5f), 13.5.dp.toPx(), c, style = Stroke(1.dp.toPx()))
        }
        // brightness
        val full = hexColor(ArtColor.toHex(ArtColor.hsvToRgb(h, s, 1f)))
        Column(Modifier.width(size)) {
            Text(if (te) "వెలుగు ↔ చీకటి" else "Light ↔ Dark", style = MaterialTheme.typography.labelMedium, color = WL.colors.muted)
            Box(Modifier.fillMaxWidth().height(10.dp).clip(RoundedCornerShape(5.dp)).background(GBrush.horizontalGradient(listOf(full, Color.Black))))
            androidx.compose.material3.Slider(
                value = 1.05f - v, onValueChange = { onChange(h, s, (1.05f - it).coerceIn(0.05f, 1f)) }, valueRange = 0.05f..1f,
                modifier = Modifier.semantics { contentDescription = if (te) "వెలుగు" else "Brightness" },
            )
        }
    }
}

@Composable
fun ColorPanel(
    color: String, onChange: (String) -> Unit, recent: List<String>, palettes: List<Palette>, onPalettes: (List<Palette>) -> Unit,
    early: Boolean, allowTyping: Boolean, lang: String, wheelSize: Dp,
) {
    var hsv by remember { mutableStateOf(ArtColor.rgbToHsv(ArtColor.parseHex(color) ?: intArrayOf(0, 0, 0))) }
    var lastOut by remember { mutableStateOf(color) }
    var hex by remember { mutableStateOf(color) }
    LaunchedEffect(color) {
        // follow outside changes (eyedropper, swatches) without losing hue when saturation is 0
        if (color != lastOut) { hsv = ArtColor.rgbToHsv(ArtColor.parseHex(color) ?: intArrayOf(0, 0, 0)); lastOut = color }
        hex = color
    }
    val setFromHsv = { h: Float, s: Float, v: Float ->
        hsv = floatArrayOf(h, s, v)
        val out = ArtColor.toHex(ArtColor.hsvToRgb(h, s, v))
        lastOut = out
        onChange(out)
    }
    val pick = { h: String -> lastOut = ""; onChange(h) }
    val name = ArtColor.colorName(color, lang)
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Box(Modifier.size(30.dp).clip(CircleShape).background(hexColor(color)).border(1.dp, WL.colors.line, CircleShape))
            Text(name, style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
            if (!early) Text(color, style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
        }
        if (early) SubTitle(if (lang == "te") "ఏ రంగైనా ఎంచుకో" else "Pick any colour")
        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { ColorWheel(hsv, setFromHsv, wheelSize, lang) }
        SwatchRow(listOf("#000000", "#ffffff") + KID_SWATCHES, color, pick, lang, big = early)
        PRESETS.forEach { ps ->
            SubTitle(if (lang == "te") ps.te else ps.en)
            SwatchRow(ps.colors, color, pick, lang, big = early)
        }
        if (early) return@Column
        if (allowTyping) {
            OutlinedTextField(
                hex, { hex = it.take(7) }, label = { Text("HEX") }, singleLine = true, modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { val n = ArtColor.normalizeHex(hex); if (n != null) pick(n) else hex = color }),
                supportingText = { Text("Type a colour like #3366ff and press Done") },
            )
        }
        if (recent.isNotEmpty()) { SubTitle("Recent colours"); SwatchRow(recent, color, pick, lang) }
        SubTitle("My palettes")
        val addToPalette = { pid: String? ->
            if (palettes.isEmpty() || pid == null) onPalettes(palettes + Palette(ArtIds.shortId(), "Palette ${palettes.size + 1}", listOf(color)))
            else onPalettes(palettes.map { p -> if (p.id == pid && color !in p.colors) p.copy(colors = (p.colors + color).takeLast(24)) else p })
        }
        palettes.forEach { p ->
            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(WL.colors.surface2).padding(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(p.name, style = MaterialTheme.typography.labelLarge, color = WL.colors.muted, modifier = Modifier.weight(1f))
                    IconBtn(Icons.Rounded.Add, "Add current colour to ${p.name}", { addToPalette(p.id) }, size = 36.dp, bg = WL.colors.surface)
                    Spacer(Modifier.width(4.dp))
                    IconBtn(Icons.Rounded.Delete, "Delete ${p.name}", { onPalettes(palettes.filter { it.id != p.id }) }, size = 36.dp, bg = WL.colors.surface)
                }
                if (p.colors.isNotEmpty()) SwatchRow(p.colors, color, pick, lang)
            }
        }
        WLButton(if (palettes.isNotEmpty()) "New palette" else "Save colour to a palette", { addToPalette(null) }, icon = Icons.Rounded.Add, small = true)
    }
}

/** Brush settings: size, opacity, fill spread, pressure, paper. */
@Composable
fun BrushPanel(ctl: StudioController, early: Boolean, lang: String, onCalibrate: () -> Unit, onPaper: (String) -> Unit, pressureMode: String, setPressureMode: (String) -> Unit, hasCalibration: Boolean) {
    val c = WL.colors
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        SubTitle("Size")
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            (if (early) listOf(10, 24, 48) else Brushes.SIZE_PRESETS).forEach { sz ->
                val on = ctl.size.roundToInt() == sz
                Box(
                    Modifier.size(if (early) 56.dp else 46.dp).clip(RoundedCornerShape(12.dp)).background(if (on) c.art else c.surface2)
                        .border(2.dp, if (on) c.primary else Color.Transparent, RoundedCornerShape(12.dp))
                        .semantics { contentDescription = "Size $sz"; selected = on }.pressable(role = Role.RadioButton) { ctl.size = sz.toFloat() },
                    contentAlignment = Alignment.Center,
                ) { Box(Modifier.size(min(28f, 4 + sz / 3.5f).dp).clip(CircleShape).background(c.text)) }
            }
        }
        if (!early) LabeledSlider("Fine size", "${ctl.size.roundToInt()}px", ctl.size, 1f..200f, { ctl.size = it.roundToInt().toFloat() })
        if (!early) LabeledSlider("Opacity", "${(ctl.opacity * 100).roundToInt()}%", ctl.opacity, 0.05f..1f, { ctl.opacity = (it * 100).roundToInt() / 100f })
        if (ctl.tool == Tool.Fill) {
            SubTitle("Fill spreads over")
            Segmented(listOf("small" to "Same colour", "medium" to "Similar", "large" to "Most colours"), ctl.fillTol, { ctl.fillTol = it })
        }
        SubTitle("Pressure")
        val src = ctl.showSource
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Icon(if (src == IntensitySource.Pen) Icons.Rounded.Edit else Icons.Rounded.PanTool, null, tint = c.text, modifier = Modifier.size(20.dp))
            Text(if (src == IntensitySource.Pen) "Pen Pressure" else "Manual Intensity", style = MaterialTheme.typography.titleSmall, color = c.text)
        }
        if (!early) Segmented(listOf("auto" to "Use pen pressure", "manual" to "Always manual"), pressureMode, setPressureMode)
        if (early) {
            val v = if (ctl.intensity < 0.45f) 0.35f else if (ctl.intensity < 0.75f) 0.6f else 0.9f
            Segmented(listOf(0.35f to "Light", 0.6f to "Medium", 0.9f to "Strong"), v, { ctl.intensity = it })
        } else {
            LabeledSlider("Manual intensity", "${(ctl.intensity * 100).roundToInt()}%", ctl.intensity, 0.05f..1f, { ctl.intensity = (it * 100).roundToInt() / 100f })
            Text("Used for finger, mouse, or pens without pressure.", style = MaterialTheme.typography.bodySmall, color = c.muted)
            WLButton(if (hasCalibration) "Recalibrate pen" else "Calibrate pen", onCalibrate, icon = Icons.Rounded.Settings, small = true)
        }
        if (!early) {
            SubTitle("Paper")
            @OptIn(ExperimentalLayoutApi::class)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Paper.PAPERS.forEach { (id, label) ->
                    val on = ctl.project?.paper == id
                    Column(
                        Modifier.width(72.dp).clip(RoundedCornerShape(12.dp)).border(2.dp, if (on) c.primary else c.line, RoundedCornerShape(12.dp))
                            .semantics { selected = on }.pressable(role = Role.RadioButton) { onPaper(id) }.padding(4.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        PaperSwatch(id, Modifier.fillMaxWidth().height(34.dp), corner = 8.dp)
                        FitText(label, style = MaterialTheme.typography.labelSmall, color = c.text, maxLines = 2)
                    }
                }
            }
        }
        if (ctl.tool == Tool.Brush && Brushes.def(ctl.brush).fixedColor != null)
            Text("The pencil is always grey. Pick Colour pencil for colours.", style = MaterialTheme.typography.bodySmall, color = c.muted)
    }
}

/** Layers, top first: select, show/hide, lock, move, rename, delete. */
@Composable
fun LayersPanel(project: Project, ver: Int, allowTyping: Boolean, onSelect: (String) -> Unit, onAdd: () -> Unit, onDelete: (String) -> Unit, onProps: (String, LayerProps) -> Unit, onMove: (String, Int) -> Unit) {
    val c = WL.colors
    var editing by remember { mutableStateOf<String?>(null) }
    var confirm by remember { mutableStateOf<String?>(null) }
    val n = project.layers.size
    @Suppress("UNUSED_VARIABLE") val v = ver
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        project.layers.withIndex().reversed().forEach { (i, l) ->
            val active = l.id == project.active
            val tpl = l.kind == "template"
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(if (active) c.art else c.surface2).padding(horizontal = 6.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp),
            ) {
                Row(
                    Modifier.weight(1f).clip(RoundedCornerShape(10.dp)).pressable(enabled = !tpl) { onSelect(l.id) }.padding(6.dp)
                        .semantics { contentDescription = if (tpl) "Outline layer (always locked)" else "Draw on ${l.name}"; selected = active },
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    if (active) Icon(Icons.Rounded.Brush, null, tint = c.artInk, modifier = Modifier.size(18.dp))
                    if (tpl) Icon(Icons.Rounded.Image, null, tint = c.muted, modifier = Modifier.size(18.dp))
                    FitText(l.name, style = MaterialTheme.typography.labelLarge.copy(fontWeight = if (active) FontWeight.Bold else FontWeight.Medium), color = c.text, maxLines = 1)
                    if (tpl) Text("outline", style = MaterialTheme.typography.labelSmall, color = c.muted)
                }
                val b = 34.dp
                IconBtn(if (l.visible) Icons.Rounded.Visibility else Icons.Rounded.VisibilityOff, "${if (l.visible) "Hide" else "Show"} ${l.name}", { onProps(l.id, LayerProps(visible = !l.visible)) }, size = b, bg = Color.Transparent)
                IconBtn(if (l.locked) Icons.Rounded.Lock else Icons.Rounded.LockOpen, if (tpl) "${l.name} is always locked" else "${if (l.locked) "Unlock" else "Lock"} ${l.name}", { onProps(l.id, LayerProps(locked = !l.locked)) }, size = b, bg = Color.Transparent, enabled = !tpl)
                IconBtn(Icons.Rounded.ArrowUpward, "Move ${l.name} up", { onMove(l.id, 1) }, size = b, bg = Color.Transparent, enabled = i < n - 1)
                IconBtn(Icons.Rounded.ArrowDownward, "Move ${l.name} down", { onMove(l.id, -1) }, size = b, bg = Color.Transparent, enabled = i > 0)
                if (!tpl && allowTyping) IconBtn(Icons.Rounded.Edit, "Rename ${l.name}", { editing = l.id }, size = b, bg = Color.Transparent)
                if (!tpl) IconBtn(Icons.Rounded.Delete, "Delete ${l.name}", { confirm = l.id }, size = b, bg = Color.Transparent, enabled = ProjectOps.canDeleteLayer(project, l.id))
            }
        }
        WLButton("Add layer", onAdd, icon = Icons.Rounded.Add, small = true)
    }
    editing?.let { id ->
        val l = ProjectOps.layerById(project, id)
        if (l != null) TextDialog("Layer name", l.name, 30, onDismiss = { editing = null }) { t -> if (t.isNotBlank() && t != l.name) onProps(id, LayerProps(name = t.trim().take(30))); editing = null }
    }
    confirm?.let { id ->
        ConfirmDialog(
            "Delete this layer?", "“${ProjectOps.layerById(project, id)?.name}” will be removed. You can bring it back with Undo.", "Delete layer",
            onConfirm = { onDelete(id); confirm = null }, onDismiss = { confirm = null }, dismiss = "Keep it", danger = true,
        )
    }
}

/** Single text field dialog (rename picture / layer). */
@Composable
fun TextDialog(title: String, initial: String, max: Int, onDismiss: () -> Unit, label: String = "Name", onSave: (String) -> Unit) {
    var v by remember { mutableStateOf(initial) }
    ArtDialog(title, onDismiss) {
        OutlinedTextField(
            v, { v = it.take(max) }, label = { Text(label) }, singleLine = true, modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done), keyboardActions = KeyboardActions(onDone = { if (v.isNotBlank()) onSave(v.trim().take(max)) }),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            WLButton("Save", { onSave(v.trim().take(max)) }, kind = BtnKind.Primary, enabled = v.isNotBlank())
            WLButton("Cancel", onDismiss, kind = BtnKind.Ghost)
        }
    }
}

/** Light-to-heavy pressure pad: records the learner's own pressure range. */
@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun CalibrationDialog(current: Calibration?, onSave: (Calibration?) -> Unit, onClose: () -> Unit) {
    var phase by remember { mutableStateOf("light") }
    var live by remember { mutableStateOf(0f) }
    var count by remember { mutableStateOf(0) }
    var sawMouse by remember { mutableStateOf(false) }
    val light = remember { mutableStateListOf<Float>() }
    val heavy = remember { mutableStateListOf<Float>() }
    var result by remember { mutableStateOf<Calibration?>(null) }
    val reset = { light.clear(); heavy.clear(); phase = "light"; count = 0 }
    ArtDialog("Pen pressure check", onClose) {
        if (phase != "result") {
            Text(if (phase == "light") "Step 1: Scribble very lightly." else "Step 2: Now scribble pressing hard.", style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
            Text("Use your pen or stylus inside the box.", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
            Box(
                Modifier.fillMaxWidth().height(160.dp).clip(RoundedCornerShape(16.dp)).background(WL.colors.surface2).border(2.dp, WL.colors.line, RoundedCornerShape(16.dp))
                    .semantics { contentDescription = if (phase == "light") "Scribble lightly here" else "Scribble hard here" }
                    .pointerInteropFilter { ev ->
                        if (ev.getToolType(0) == MotionEvent.TOOL_TYPE_MOUSE) { sawMouse = true; return@pointerInteropFilter true }
                        val bucket = if (phase == "light") light else heavy
                        for (h in 0 until ev.historySize) ev.getHistoricalPressure(0, h).takeIf { it > 0 }?.let { bucket.add(it) }
                        ev.pressure.takeIf { it > 0 }?.let { bucket.add(it) }
                        live = ev.pressure; count = bucket.size
                        true
                    },
                contentAlignment = Alignment.Center,
            ) { Text(if (phase == "light") "Light" else "Heavy", style = MaterialTheme.typography.headlineSmall, color = WL.colors.muted) }
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Pressure now", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                Box(Modifier.weight(1f)) { Meter(live) }
                Text("${(live * 100).roundToInt()}%", style = MaterialTheme.typography.bodySmall, color = WL.colors.text)
            }
            if (sawMouse) AlertBox("A mouse has no pressure. Use a pen, or choose Manual Intensity instead.", AlertKind.Info)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                WLButton(if (phase == "light") "Next" else "Finish", {
                    if (phase == "light") { phase = "heavy"; count = 0 } else { result = Pressure.computeCalibration(light.toList(), heavy.toList()); phase = "result" }
                }, kind = BtnKind.Primary, enabled = count >= 10)
                WLButton("Cancel", onClose, kind = BtnKind.Ghost)
            }
        } else {
            val r = result
            if (r != null) {
                AlertBox("Done! Light = ${(r.min * 100).roundToInt()}%, heavy = ${(r.max * 100).roundToInt()}%. Your strokes now use your whole range.", AlertKind.Good)
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { WLButton("Save", { onSave(r) }, kind = BtnKind.Primary); WLButton("Try again", reset) }
            } else {
                AlertBox("We could not feel enough difference between light and heavy. This device may not report pen pressure — Manual Intensity will be used.", AlertKind.Warn)
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { WLButton("Try again", reset); WLButton("Close", onClose, kind = BtnKind.Ghost) }
            }
            if (current != null) WLButton("Reset to default", { onSave(null) }, kind = BtnKind.Ghost, small = true)
        }
    }
}
