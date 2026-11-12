package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.min
import com.maheshglance.wonderlab.core.design.IconBtn
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Meter
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp

// Sticker Book: every sticker earned in the Daily Surprise and the newer games, grouped by game.
// Stickers not yet earned show as grey shapes with a "play to earn" button for their game.
private object SBT {
    val title = L("Sticker Book", "స్టిక్కర్ పుస్తకం")
    val intro = L("Your stickers! Play games to fill the book.", "నీ స్టిక్కర్లు! ఆటలు ఆడి పుస్తకం నింపు.")
    val locked = L("Not yet earned", "ఇంకా రాలేదు")
    val play = L("Play", "ఆడు")
    val streak = L("Daily Surprise days in a row", "వరుసగా రోజూ ఆశ్చర్యం")
}
private val SOURCE_ROUTES = mapOf(
    "daily" to "play/daily", "memory" to "play/memory", "mix" to "play/colours", "rhymes" to "play/rhymes",
    "opposites" to "play/opposites", "patterns" to "play/patterns", "safari" to "play/safari",
)

@Composable
fun StickerBookScreen() {
    val app = LocalApp.current
    TrackLast("/play/stickers", SBT.title)
    val book = rememberStickers()
    EarlyScreen(SBT.title.tx, { app.back() }) { b ->
        val st = book.state
        val total = b.stickers.size
        val have = st.earned.keys.count { b.sticker.containsKey(it) }
        val days = dailyStreak(st.days, dayKey())
        val sources = b.stickerSources.keys.toList()
        val land = LocalWindow.current.landscape
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            PromptBar(SBT.intro, maxLines = 2, trailing = {
                Column(horizontalAlignment = Alignment.End) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Emoji3D("⭐", Modifier.size(22.dp))
                        Text("$have / $total", style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                    }
                    if (days > 0) Text("☀ ${SBT.streak.tx}: $days", style = MaterialTheme.typography.labelSmall, color = WL.colors.muted, maxLines = 1)
                }
            })
            Meter(have / total.coerceAtLeast(1).toFloat(), Modifier.semantics { contentDescription = "${SBT.title.get("en")} $have / $total" }, color = WL.colors.good)
            // the Daily Surprise page is the biggest (14 stickers); the six game pages share the rest of the screen
            val daily = sources.firstOrNull { it == "daily" }
            val others = sources.filter { it != "daily" }
            val body = @Composable { dailyMod: Modifier, othersMod: Modifier ->
                if (daily != null) BookPage(b, daily, st, dailyMod)
                FitGrid(others.size, othersMod, gap = 8.dp, aspect = 1.5f, maxCell = 320.dp) { i, _ -> BookPage(b, others[i], st, Modifier.fillMaxSize()) }
            }
            if (land) Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                body(Modifier.weight(0.42f).fillMaxHeight(), Modifier.weight(0.58f).fillMaxHeight())
            } else Column(Modifier.weight(1f).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                body(Modifier.weight(0.4f).fillMaxWidth(), Modifier.weight(0.6f).fillMaxWidth())
            }
        }
    }
}

@Composable
private fun BookPage(b: EarlyBundle, src: String, st: StickerState, modifier: Modifier) {
    val app = LocalApp.current
    val say = rememberSay()
    val c = WL.colors
    val list = b.stickers.filter { it.source == src }
    val got = list.count { st.earned.containsKey(it.id) }
    val name = b.stickerSources[src] ?: L(src, src)
    Column(modifier.clip(RoundedCornerShape(18.dp)).background(c.surface).padding(6.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            FitText(name.tx, style = MaterialTheme.typography.titleSmall, color = c.text, maxLines = 1, modifier = Modifier.weight(1f))
            Text("$got / ${list.size}", style = MaterialTheme.typography.labelMedium, color = c.muted)
            if (got < list.size) SOURCE_ROUTES[src]?.let { route -> IconBtn(Icons.Rounded.PlayArrow, "${SBT.play.tx} ${name.tx}", { app.go(route) }, tint = c.primaryInk, bg = c.primary, size = 36.dp) }
        }
        FitGrid(list.size, Modifier.weight(1f).fillMaxWidth(), gap = 4.dp, maxCell = 110.dp) { i, _ ->
            val s = list[i]
            val earned = st.earned.containsKey(s.id)
            BoxWithConstraints(
                Modifier.fillMaxSize().clip(RoundedCornerShape(12.dp)).pressable(role = Role.Button) {
                    if (earned) { Sfx.play("sparkle"); say(s.name) }
                    else { Sfx.play("pop"); say(L("Play ${name.en} to earn this sticker.", "ఈ స్టిక్కర్ కోసం ${name.get("te")} ఆడు.")) }
                }.semantics { contentDescription = if (earned) s.name.get("en") else "${SBT.locked.get("en")} (${name.get("en")})" },
                contentAlignment = Alignment.Center,
            ) {
                val d = min(maxWidth, maxHeight) * 0.92f
                Box(contentAlignment = Alignment.Center) { StickerArt(s, d, locked = !earned) }
            }
        }
    }
}
