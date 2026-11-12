package com.maheshglance.wonderlab.core.design

import android.content.Context
import android.graphics.BitmapFactory
import android.util.LruCache
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.text.InlineTextContent
import androidx.compose.foundation.text.appendInlineContent
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.Placeholder
import androidx.compose.ui.text.PlaceholderVerticalAlign
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import com.maheshglance.wonderlab.core.engine.AppJson
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/**
 * Realistic pictures: every emoji the curriculum uses is shown as a bundled Microsoft Fluent Emoji 3D image
 * (assets/emoji/<codepoints>.webp, MIT licence) — identical on every phone, never a blank box, works offline.
 */
object EmojiAssets {
    private var index: Map<String, String>? = null
    private val cache = object : LruCache<String, ImageBitmap>(16 * 1024 * 1024) {
        override fun sizeOf(key: String, value: ImageBitmap) = value.width * value.height * 4
    }

    fun index(context: Context): Map<String, String> = index ?: runCatching {
        context.assets.open("emoji/index.json").bufferedReader().use { r ->
            AppJson.parseToJsonElement(r.readText()).jsonObject.mapValues { it.value.jsonPrimitive.content }
        }
    }.getOrDefault(emptyMap()).also { index = it }

    private fun normalise(e: String) = e.replace("️", "")

    /** File name for one emoji (with or without variation selectors), or null when no 3D image exists. */
    fun fileFor(context: Context, emoji: String): String? {
        val idx = index(context)
        return idx[emoji] ?: idx[normalise(emoji)] ?: idx.entries.firstOrNull { normalise(it.key) == normalise(emoji) }?.value
    }

    fun bitmap(context: Context, emoji: String): ImageBitmap? {
        val name = fileFor(context, emoji) ?: return null
        cache.get(name)?.let { return it }
        return runCatching {
            context.assets.open("emoji/$name.webp").use { BitmapFactory.decodeStream(it) }?.asImageBitmap()
        }.getOrNull()?.also { cache.put(name, it) }
    }

    private val RE = Regex("(?:\\p{IsRegional_Indicator}{2})|(?:[#*0-9]\\uFE0F?\\u20E3)|(?:[\\x{1F000}-\\x{1FAFF}\\x{2600}-\\x{27BF}\\x{2B00}-\\x{2BFF}\\x{2300}-\\x{23FF}\\x{2190}-\\x{21FF}\\x{3030}\\x{303D}\\x{3297}\\x{3299}\\x{00A9}\\x{00AE}\\x{203C}\\x{2049}\\x{2122}\\x{2139}\\x{24C2}\\x{25AA}-\\x{25FE}\\x{2934}\\x{2935}](?:\\uFE0F|[\\x{1F3FB}-\\x{1F3FF}])?(?:\\u200D[\\x{1F000}-\\x{1FAFF}\\x{2600}-\\x{27BF}\\x{2B00}-\\x{2BFF}](?:\\uFE0F|[\\x{1F3FB}-\\x{1F3FF}])?)*)")

    /** Splits text into plain runs and emoji runs. */
    fun split(text: String): List<Pair<Boolean, String>> {
        val out = mutableListOf<Pair<Boolean, String>>()
        var i = 0
        for (m in RE.findAll(text)) {
            if (m.range.first > i) out += false to text.substring(i, m.range.first)
            out += true to m.value
            i = m.range.last + 1
        }
        if (i < text.length) out += false to text.substring(i)
        return out
    }

    fun hasEmoji(text: String) = RE.containsMatchIn(text)
}

/** One realistic picture. Falls back to the system emoji glyph only if no 3D image exists. */
@Composable
fun EmojiImage(emoji: String, size: Dp, modifier: Modifier = Modifier, label: String? = null) {
    val ctx = LocalContext.current
    val bmp = remember(emoji) { EmojiAssets.bitmap(ctx, emoji) }
    val m = if (label != null) modifier.semantics { contentDescription = label } else modifier
    if (bmp != null) Image(bmp, contentDescription = null, modifier = m.size(size), filterQuality = FilterQuality.High)
    else Text(emoji, modifier = m, fontSize = (size.value * 0.8f).let { androidx.compose.ui.unit.TextUnit(it, androidx.compose.ui.unit.TextUnitType.Sp) })
}

/**
 * Text where any emoji is drawn as its 3D picture, inline, sized to the text (e.g. "What comes next? 🥭 🍌 🥭 …").
 * `emojiScale` makes pictures bigger than letters (1.4em by default).
 */
@Composable
fun EmojiText(
    text: String,
    modifier: Modifier = Modifier,
    style: TextStyle = LocalTextStyle.current,
    color: Color = Color.Unspecified,
    textAlign: TextAlign? = null,
    emojiScale: Float = 1.4f,
    maxLines: Int = Int.MAX_VALUE,
    fontSize: TextUnit = TextUnit.Unspecified,
) {
    val ctx = LocalContext.current
    val parts = remember(text) { EmojiAssets.split(text) }
    if (parts.none { it.first }) {
        Text(text, modifier, style = style, color = color, textAlign = textAlign, maxLines = maxLines, fontSize = fontSize)
        return
    }
    val inline = HashMap<String, InlineTextContent>()
    val annotated: AnnotatedString = buildAnnotatedString {
        parts.forEachIndexed { i, (isEmoji, s) ->
            if (isEmoji && EmojiAssets.fileFor(ctx, s) != null) {
                val id = "e$i"
                appendInlineContent(id, s)
                inline[id] = InlineTextContent(Placeholder(emojiScale.em, emojiScale.em, PlaceholderVerticalAlign.Center)) {
                    val bmp = remember(s) { EmojiAssets.bitmap(ctx, s) }
                    if (bmp != null) Image(bmp, contentDescription = s, filterQuality = FilterQuality.High)
                }
            } else append(s)
        }
    }
    Text(annotated, modifier, style = style, color = color, textAlign = textAlign, inlineContent = inline, maxLines = maxLines, fontSize = fontSize)
}

@Suppress("unused") private val defaultEmojiSize = 48.dp
