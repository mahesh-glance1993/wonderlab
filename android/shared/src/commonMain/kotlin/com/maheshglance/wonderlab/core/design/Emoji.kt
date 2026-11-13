package com.maheshglance.wonderlab.core.design

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
import com.maheshglance.wonderlab.core.platform.Platform
import com.maheshglance.wonderlab.res.Res
import kotlinx.atomicfu.locks.SynchronizedObject
import kotlinx.atomicfu.locks.synchronized
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/**
 * Realistic pictures: every emoji the curriculum uses is shown as a bundled Microsoft Fluent Emoji 3D image
 * (assets/emoji/<codepoints>.webp, MIT licence) — identical on every phone, never a blank box, works offline.
 */
object EmojiAssets : SynchronizedObject() {
    /** Set once at start-up (decoding WebP is done by the platform). */
    internal var platform: Platform? = null
    private var index: Map<String, String>? = null
    private const val MAX_BYTES = 16 * 1024 * 1024
    private val cache = LinkedHashMap<String, ImageBitmap>()
    private var cacheBytes = 0

    /** Reads a bundled resource file synchronously (they are small and read once, then cached). */
    private fun readRes(path: String): ByteArray = runBlocking { Res.readBytes(path) }

    fun index(): Map<String, String> = index ?: runCatching {
        AppJson.parseToJsonElement(readRes("files/emoji/index.json").decodeToString()).jsonObject.mapValues { it.value.jsonPrimitive.content }
    }.getOrDefault(emptyMap()).also { index = it }

    private fun normalise(e: String) = e.replace("️", "")

    /** File name for one emoji (with or without variation selectors), or null when no 3D image exists. */
    fun fileFor(emoji: String): String? {
        val idx = index()
        return idx[emoji] ?: idx[normalise(emoji)] ?: idx.entries.firstOrNull { normalise(it.key) == normalise(emoji) }?.value
    }

    fun bitmap(emoji: String): ImageBitmap? {
        val name = fileFor(emoji) ?: return null
        synchronized(this) { cache[name]?.let { cache.remove(name); cache[name] = it; return it } }
        val bmp = runCatching { platform?.decodeImage(readRes("files/emoji/$name.webp")) }.getOrNull() ?: return null
        synchronized(this) {
            cache[name] = bmp; cacheBytes += bmp.width * bmp.height * 4
            while (cacheBytes > MAX_BYTES && cache.size > 1) {
                val k = cache.keys.first(); val v = cache.remove(k)!!; cacheBytes -= v.width * v.height * 4
            }
        }
        return bmp
    }

    // Emoji scanner (a plain code-point state machine, so it behaves identically on Android and iOS):
    // regional-indicator flag pairs, keycaps ("1️⃣"), and pictographs with optional variation selector /
    // skin tone, joined by ZWJ into sequences ("👩‍🔬").
    private fun cpAt(s: String, i: Int): Int {
        val c = s[i]
        if (c.isHighSurrogate() && i + 1 < s.length && s[i + 1].isLowSurrogate()) return 0x10000 + ((c.code - 0xD800) shl 10) + (s[i + 1].code - 0xDC00)
        return c.code
    }
    private fun cpLen(cp: Int) = if (cp >= 0x10000) 2 else 1
    private fun isRegional(cp: Int) = cp in 0x1F1E6..0x1F1FF
    private fun isSkin(cp: Int) = cp in 0x1F3FB..0x1F3FF
    private fun isBase(cp: Int) = cp in 0x1F000..0x1FAFF || cp in 0x2600..0x27BF || cp in 0x2B00..0x2BFF || cp in 0x2300..0x23FF ||
        cp in 0x2190..0x21FF || cp == 0x3030 || cp == 0x303D || cp == 0x3297 || cp == 0x3299 || cp == 0xA9 || cp == 0xAE ||
        cp == 0x203C || cp == 0x2049 || cp == 0x2122 || cp == 0x2139 || cp == 0x24C2 || cp in 0x25AA..0x25FE || cp == 0x2934 || cp == 0x2935
    private fun isJoinable(cp: Int) = cp in 0x1F000..0x1FAFF || cp in 0x2600..0x27BF || cp in 0x2B00..0x2BFF

    /** Length (in chars) of the emoji starting at i, or 0 when there is none. */
    private fun emojiAt(s: String, i: Int): Int {
        val cp = cpAt(s, i)
        if (isRegional(cp)) {
            val j = i + 2
            return if (j < s.length && isRegional(cpAt(s, j))) 4 else 0
        }
        if (cp == '#'.code || cp == '*'.code || cp in '0'.code..'9'.code) {
            var j = i + 1
            if (j < s.length && s[j].code == 0xFE0F) j++
            return if (j < s.length && s[j].code == 0x20E3) j + 1 - i else 0
        }
        if (!isBase(cp)) return 0
        var j = i + cpLen(cp)
        fun modifier() {
            if (j < s.length) { val m = cpAt(s, j); if (m == 0xFE0F || isSkin(m)) j += cpLen(m) }
        }
        modifier()
        while (j < s.length && s[j].code == 0x200D && j + 1 < s.length) {
            val n = cpAt(s, j + 1)
            if (!isJoinable(n)) break
            j += 1 + cpLen(n)
            modifier()
        }
        return j - i
    }

    /** Splits text into plain runs and emoji runs. */
    fun split(text: String): List<Pair<Boolean, String>> {
        val out = mutableListOf<Pair<Boolean, String>>()
        var i = 0
        var plainStart = 0
        while (i < text.length) {
            val n = emojiAt(text, i)
            if (n > 0) {
                if (i > plainStart) out += false to text.substring(plainStart, i)
                out += true to text.substring(i, i + n)
                i += n; plainStart = i
            } else i += cpLen(cpAt(text, i))
        }
        if (plainStart < text.length) out += false to text.substring(plainStart)
        return out
    }

    fun hasEmoji(text: String): Boolean {
        var i = 0
        while (i < text.length) { if (emojiAt(text, i) > 0) return true; i += cpLen(cpAt(text, i)) }
        return false
    }
}

/** One realistic picture. Falls back to the system emoji glyph only if no 3D image exists. */
@Composable
fun EmojiImage(emoji: String, size: Dp, modifier: Modifier = Modifier, label: String? = null) {
    val bmp = remember(emoji) { EmojiAssets.bitmap(emoji) }
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
    val parts = remember(text) { EmojiAssets.split(text) }
    if (parts.none { it.first }) {
        Text(text, modifier, style = style, color = color, textAlign = textAlign, maxLines = maxLines, fontSize = fontSize)
        return
    }
    val inline = HashMap<String, InlineTextContent>()
    val annotated: AnnotatedString = buildAnnotatedString {
        parts.forEachIndexed { i, (isEmoji, s) ->
            if (isEmoji && EmojiAssets.fileFor(s) != null) {
                val id = "e$i"
                appendInlineContent(id, s)
                inline[id] = InlineTextContent(Placeholder(emojiScale.em, emojiScale.em, PlaceholderVerticalAlign.Center)) {
                    val bmp = remember(s) { EmojiAssets.bitmap(s) }
                    if (bmp != null) Image(bmp, contentDescription = s, filterQuality = FilterQuality.High)
                }
            } else append(s)
        }
    }
    Text(annotated, modifier, style = style, color = color, textAlign = textAlign, inlineContent = inline, maxLines = maxLines, fontSize = fontSize)
}

@Suppress("unused") private val defaultEmojiSize = 48.dp
