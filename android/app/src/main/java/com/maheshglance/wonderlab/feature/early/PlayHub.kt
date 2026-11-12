package com.maheshglance.wonderlab.feature.early

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.shell.HubScaffold

private data class HubTile(val to: String, val title: L, val art: String, val tint: String)

private val TILES = listOf(
    HubTile("play/pictures", UI.pictures, "mango", "art"),
    HubTile("play/stories", UI.stories, "crow", "math"),
    HubTile("play/shapes", UI.shapes, "shape-star", "lab"),
    HubTile("play/sort", UI.sort, "box", "next"),
    HubTile("play/build", UI.build, "tractor", "art"),
    HubTile("play/daily", L("Daily Surprise", "రోజూ ఆశ్చర్యం"), "rainbow", "math"),
    HubTile("play/memory", L("Memory Match", "జ్ఞాపకాల ఆట"), "parrot", "lab"),
    HubTile("play/colours", L("Colour Mixing", "రంగులు కలుపుదాం"), "c-purple", "next"),
    HubTile("play/rhymes", L("Rhymes & Songs", "పాటలు, గేయాలు"), "star", "art"),
    HubTile("play/opposites", L("Opposites", "వ్యతిరేక పదాలు"), "umbrella", "math"),
    HubTile("play/patterns", L("Patterns", "నమూనాలు"), "shape-heart", "lab"),
    HubTile("play/safari", L("Sound Safari", "శబ్దాల సఫారీ"), "lion", "next"),
    HubTile("play/stickers", L("Sticker Book", "స్టిక్కర్ పుస్తకం"), "flower", "art"),
)

/** Play & Learn menu (/play): every game on one screen. */
@Composable
fun PlayHub() {
    val app = LocalApp.current
    val b = rememberEarly()
    val phone = LocalWindow.current.isPhone
    TrackLast("/play", UI.playLearn)
    HubScaffold(Routes.PLAY) {
        Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
            TopBar(UI.playLearn.tx)
            if (b == null) { Loading(); return@Column }
            Column(
                Modifier.weight(1f).fillMaxWidth().padding(horizontal = if (phone) 10.dp else 20.dp, vertical = if (phone) 8.dp else 14.dp),
                verticalArrangement = Arrangement.spacedBy(if (phone) 8.dp else 12.dp),
            ) {
                PromptBar(L("What shall we play?", "ఏ ఆట ఆడదాం?"), maxLines = 1)
                FitGrid(TILES.size, Modifier.weight(1f).fillMaxWidth(), gap = if (phone) 8.dp else 14.dp, aspect = 1.05f, maxCell = 230.dp) { i, _ ->
                    val t = TILES[i]
                    BigTile(t.art, t.title, { app.go(t.to) }, Modifier.fillMaxSize(), tint = tint(t.tint))
                }
            }
        }
    }
}

