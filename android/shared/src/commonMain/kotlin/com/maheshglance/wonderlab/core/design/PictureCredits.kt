package com.maheshglance.wonderlab.core.design

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.res.Res
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/** Attribution for one bundled photograph (files/photos/credits.json, written by scripts/fetch-photos.mjs). */
data class PhotoCredit(val key: String, val title: String, val author: String, val licence: String, val licenceUrl: String, val source: String)

/** Reads the photo credits bundled with the app (empty if the file is missing). */
suspend fun loadPhotoCredits(): List<PhotoCredit> = withContext(Dispatchers.Default) {
    runCatching {
        AppJson.parseToJsonElement(Res.readBytes("files/photos/credits.json").decodeToString()).jsonObject.map { (k, v) ->
            val o = v.jsonObject
            fun f(n: String) = o[n]?.jsonPrimitive?.content.orEmpty()
            PhotoCredit(k, f("title"), f("author"), f("licence"), f("licenceUrl"), f("source"))
        }.sortedBy { it.title.lowercase() }
    }.getOrDefault(emptyList())
}

/**
 * "Picture credits" — every photograph shown to Class 1–10 learners with its title, author, licence and source page
 * (CC BY and CC BY-SA photos require this attribution). Full-screen, with a back button.
 */
@Composable
fun PictureCreditsScreen(onBack: () -> Unit) {
    val phone = LocalWindow.current.isPhone
    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        TopBar("Picture credits", onBack = onBack, subtitle = "Photos and pictures used in WonderLab")
        PictureCreditsList(Modifier.fillMaxSize(), contentPadding = if (phone) PaddingValues(12.dp) else PaddingValues(horizontal = 24.dp, vertical = 16.dp))
    }
}

/** The credits as a scrolling list (for embedding in an existing screen that has its own top bar). */
@Composable
fun PictureCreditsList(modifier: Modifier = Modifier, contentPadding: PaddingValues = PaddingValues(12.dp)) {
    var credits by remember { mutableStateOf<List<PhotoCredit>?>(null) }
    LaunchedEffect(Unit) { credits = loadPhotoCredits() }
    val c = WL.colors
    val list = credits
    if (list == null) { Loading(modifier); return }
    LazyColumn(modifier, contentPadding = contentPadding, verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item {
            Column(Modifier.widthIn(max = 760.dp).padding(bottom = 6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Photographs (shown from Class 1 upwards) are freely licensed images from Wikimedia Commons, used under the licence named for each one. " +
                    "Photos may be cropped and resized. Tap a source to see the original.", style = MaterialTheme.typography.bodyMedium, color = c.text)
                Text("Pre-primary pictures and symbols: Microsoft Fluent Emoji 3D (MIT licence).", style = MaterialTheme.typography.bodySmall, color = c.muted)
            }
        }
        items(list, key = { it.key }) { CreditRow(it) }
    }
}

@Composable
private fun CreditRow(p: PhotoCredit) {
    val c = WL.colors
    val uri = LocalUriHandler.current
    val bmp = remember(p.key) { EmojiAssets.load("files/photos/${p.key}.webp") }
    Row(Modifier.widthIn(max = 760.dp).fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(c.surface).padding(10.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        if (bmp != null) Image(bmp, contentDescription = null, contentScale = ContentScale.Crop, filterQuality = FilterQuality.High,
            modifier = Modifier.size(56.dp).clip(RoundedCornerShape(12.dp)))
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(p.title, style = MaterialTheme.typography.titleSmall, color = c.text, maxLines = 2)
            Text("by ${p.author}", style = MaterialTheme.typography.bodySmall, color = c.muted, maxLines = 2)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(p.licence, style = MaterialTheme.typography.bodySmall.copy(textDecoration = if (p.licenceUrl.isNotBlank()) TextDecoration.Underline else null),
                    color = c.primary, modifier = Modifier.clickable(enabled = p.licenceUrl.isNotBlank()) { runCatching { uri.openUri(p.licenceUrl) } })
                if (p.source.isNotBlank()) Text("Source", style = MaterialTheme.typography.bodySmall.copy(textDecoration = TextDecoration.Underline),
                    color = c.primary, modifier = Modifier.clickable { runCatching { uri.openUri(p.source) } })
            }
        }
    }
}
