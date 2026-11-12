package com.maheshglance.wonderlab.feature.art

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Tile
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.feature.art.ui.rememberPresentation
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.shell.HubScaffold

private data class ArtTile(val path: String, val emoji: String, val en: String, val te: String, val descEn: String, val descTe: String)

private val TILES = listOf(
    ArtTile("art/paint", "🖍️", "Paint", "పెయింట్", "Pencils, crayons, watercolour and more", "ఖాళీ కాగితంపై గీయి"),
    ArtTile("art/color", "🪣", "Colour", "రంగులు వేయి", "Animals, vehicles, patterns, science", "బొమ్మలకు రంగులు"),
    ArtTile("art/trace", "✏️", "Trace", "దిద్దు", "Lines, shapes, numbers and letters", "గీతలు, అంకెలు, అక్షరాలు"),
    ArtTile("art/gallery", "⭐", "My Gallery", "నా గ్యాలరీ", "Your saved pictures", "నీ బొమ్మలు"),
)

/** Art Studio hub: Paint, Colour, Trace, My Gallery — four big tiles that fill one screen. */
@Composable
fun ArtHomeScreen() {
    val app = LocalApp.current
    val te = WL.lang == "te"
    val win = LocalWindow.current
    val pres = rememberPresentation()
    LaunchedEffect(pres.readAloud) {
        if (pres.readAloud) app.say(if (te) "ఆర్ట్ స్టూడియో. పెయింట్, రంగులు, దిద్దడం." else "Art Studio. Paint, colour, trace, or see your gallery.", WL_LANG(te), "Art Studio. Paint, colour, trace, or see your gallery.")
    }
    HubScaffold(Routes.ART) {
        Column(Modifier.fillMaxSize()) {
            TopBar(if (te) "ఆర్ట్ స్టూడియో" else "Art Studio", onBack = { app.go(Routes.HOME) })
            val cols = if (win.landscape || win.isTablet && win.width > 700.dp) 4 else 2
            val gap = if (win.isPhone) 12.dp else 18.dp
            Column(Modifier.weight(1f).fillMaxWidth().padding(if (win.isPhone) 12.dp else 24.dp), verticalArrangement = Arrangement.spacedBy(gap)) {
                TILES.chunked(cols).forEach { row ->
                    Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(gap)) {
                        row.forEach { t ->
                            Tile(
                                title = if (te) t.te else t.en, subtitle = if (te) t.descTe else t.descEn, emoji = t.emoji,
                                color = WL.colors.art, ink = WL.colors.artInk, centered = true,
                                onClick = { app.go(t.path) }, modifier = Modifier.weight(1f).fillMaxHeight(),
                            )
                        }
                    }
                }
            }
        }
    }
}

@Suppress("FunctionName") private fun WL_LANG(te: Boolean) = if (te) "te" else "en"
