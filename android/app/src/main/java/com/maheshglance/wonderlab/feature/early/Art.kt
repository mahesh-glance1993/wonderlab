package com.maheshglance.wonderlab.feature.early

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameMillis
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material3.Text
import com.maheshglance.wonderlab.core.design.EmojiAssets
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.WLFonts

/*
 * Pictures for Play & Learn. Every picture that has an emoji is shown as its realistic 3D image (bundled
 * Fluent Emoji). The website's own drawings are kept where a drawing is functional: shapes, paint splashes,
 * story props that change (the pot's water level, the growing mango tree, the open/closed umbrella…),
 * Build It parts, backdrops and counting pictures.
 */

/** Extra 3D pictures for story props / activity drawings that are not Picture Fun items. */
private val EXTRA_EMOJI = mapOf(
    "hub-shapes" to "🔷", "hub-colours" to "🎨", "hub-patterns" to "🧩",
    "child" to "👦", "child2" to "👧", "adult" to "👩", "pebble" to "🪨", "sprout" to "🌱", "drops" to "💧", "kitten" to "🐈",
    "bird" to "🐦", "box" to "📦", "ant" to "🐜", "leaf" to "🍃", "kite" to "🪁", "fish" to "🐟", "rooster" to "🐓", "calf" to "🐄",
    "grass" to "🌾", "lamp" to "🪔", "house" to "🏠", "gift" to "🎁", "rainbow" to "🌈", "water" to "💧",
    "x-hot" to "☕", "x-cold" to "🧊", "x-thunder" to "⛈️", "x-wind" to "🌬️", "x-fire" to "🔥", "x-stream" to "🏞️",
)
/** Variants that still have a matching 3D picture. */
private val VARIANT_EMOJI = mapOf(
    "child|girl" to "👧", "child|jacket" to "🧒", "child|boy" to "👦", "peacock|open" to "🦚", "house|red" to "🏠",
    "x-sky|day" to "☀️", "x-sky|night" to "🌙", "cloud|white" to "☁️", "cloud|grey" to "🌧️", "kite|red" to "🪁",
)

/** The 3D picture for a picture id (+ variant), or null when the website drawing must be used. */
fun emojiFor(b: EarlyBundle?, id: String, v: String? = null): String? {
    if (id.startsWith("c-") || id.startsWith("shape-") || id.startsWith("num:")) return null
    if (!v.isNullOrEmpty()) return VARIANT_EMOJI["$id|$v"]
    return b?.pic?.get(id)?.emoji ?: EXTRA_EMOJI[id]
}

/** True when every look an actor can take has a 3D picture (so it can be shown as one). */
fun emojiForAll(b: EarlyBundle?, id: String, variants: Collection<String?>): String? {
    val e = emojiFor(b, id, null)
    val all = variants.filterNot { it.isNullOrEmpty() }
    if (all.isEmpty()) return e
    val mapped = all.map { emojiFor(b, id, it) }
    return if (mapped.all { it != null } && mapped.toSet().size == 1) mapped.first() else null
}

/**
 * One picture, fitted in a square of `size`. `shadow` draws it as a dark silhouette (Find the shadow);
 * `forceDrawing` uses the website drawing even when a 3D picture exists (paired opposites, variants).
 */
@Composable
fun PicArt(id: String, size: Dp, modifier: Modifier = Modifier, v: String? = null, shadow: Boolean = false, forceDrawing: Boolean = false, label: String? = null) {
    val b = EarlyContent.bundle
    val m = (if (label != null) modifier.semantics { contentDescription = label } else modifier).size(size)
    if (id.startsWith("num:")) { NumberArt(id.removePrefix("num:").toIntOrNull() ?: 0, m); return }
    val emoji = if (forceDrawing) null else emojiFor(b, id, v)
    if (emoji != null) { Emoji3D(emoji, m, shadow); return }
    val pic = rememberArtSvg(id, v)
    if (pic != null && pic.prims.isNotEmpty()) SvgArt(pic, m, tint = if (shadow) 0xFF2E2A33.toInt() else null, time = rememberAnimTime(id))
    else {
        // no drawing: fall back to the item's emoji (always realistic) or a question mark
        val e = b?.pic?.get(id)?.emoji ?: EXTRA_EMOJI[id]
        if (e != null) Emoji3D(e, m, shadow) else Box(m, contentAlignment = Alignment.Center) { Text("?", fontSize = (size.value * 0.5f).sp, fontWeight = FontWeight.Bold) }
    }
}

/** The bundled 3D image (with an optional silhouette tint); fills the given modifier's size. */
@Composable
fun Emoji3D(emoji: String, modifier: Modifier, shadow: Boolean = false) {
    val ctx = LocalContext.current
    val bmp = remember(emoji) { EmojiAssets.bitmap(ctx, emoji) }
    if (bmp != null) Image(
        bmp, contentDescription = null, modifier = modifier, filterQuality = FilterQuality.High,
        colorFilter = if (shadow) ColorFilter.tint(Color(0xFF2E2A33)) else null,
    ) else BoxWithConstraints(modifier, contentAlignment = Alignment.Center) {
        Text(emoji, fontSize = (maxHeight.value * 0.7f).sp, modifier = if (shadow) Modifier.alpha(0.6f) else Modifier)
    }
}

/** Ticks for the website's small CSS effects (flicker, steam) on drawings that use them. */
@Composable
private fun rememberAnimTime(id: String): Long {
    val reduce = LocalReduceMotion.current
    if (reduce || (id != "x-fire" && id != "x-hot")) return -1
    var t by remember { mutableLongStateOf(0L) }
    LaunchedEffect(id) { val start = withFrameMillis { it }; while (true) withFrameMillis { t = it - start } }
    return t
}

/** "num:3": the number with that many dots (story counting answers). */
@Composable
fun NumberArt(n: Int, modifier: Modifier) {
    BoxWithConstraints(modifier, contentAlignment = Alignment.Center) {
        val s = minOf(maxWidth, maxHeight)
        Text("$n", fontFamily = WLFonts.kid, fontWeight = FontWeight.Bold, fontSize = (s.value * 0.44f).sp, color = Color(0xFF1D2540), modifier = Modifier.align(Alignment.Center).scale(1f).alpha(1f).let { it })
        Canvas(Modifier.fillMaxSize()) {
            val u = size.minDimension / 100f
            for (i in 0 until n) {
                val cx = size.width / 2 + (i - (n - 1) / 2f) * 16 * u
                val cy = size.height / 2 + 30 * u
                drawCircle(Color(0xFFE0A63A), 6 * u, Offset(cx, cy))
                drawCircle(Color(0xFF3A3530), 6 * u, Offset(cx, cy), style = Stroke(1.5f * u))
            }
        }
    }
}

/** A coloured paint swatch disc (colour names, mixing results). */
@Composable
fun Swatch(hex: String, diameter: Dp, modifier: Modifier = Modifier) {
    val c = parseColor(hex)?.let { Color(it) } ?: Color.Gray
    Canvas(modifier.size(diameter)) {
        drawCircle(c)
        drawCircle(Color(0x553A3530), style = Stroke(2.dp.toPx()))
        drawCircle(Color.White.copy(alpha = 0.35f), radius = size.minDimension * 0.16f, center = Offset(size.width * 0.35f, size.height * 0.32f))
    }
}

fun hexColor(hex: String?, fallback: Color = Color.Gray): Color = hex?.let { parseColor(it) }?.let { Color(it) } ?: fallback
