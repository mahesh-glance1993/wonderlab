package com.maheshglance.wonderlab.feature.early

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.NavGraphBuilder
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.arg
import com.maheshglance.wonderlab.ui.learnerScreen

/** Play & Learn routes (the website's /play routes). Activity ids are the website's. */
fun NavGraphBuilder.playGraph() {
    learnerScreen("play") { PlayHub() }
    learnerScreen("play/{activity}") { e -> PlayActivity(e.arg("activity") ?: "") }
    learnerScreen("play/stories/{storyId}") { e -> StoryReaderScreen(e.arg("storyId") ?: "") }
}

@Composable
private fun PlayActivity(id: String) {
    when (id) {
        "pictures" -> PictureFunScreen()
        "stories" -> StoryListScreen()
        "shapes" -> ShapePlayScreen()
        "sort" -> SortMatchScreen()
        "build" -> BuildItScreen()
        "memory" -> MemoryMatchScreen()
        "colours" -> ColourMixScreen()
        "rhymes" -> RhymesScreen()
        "opposites" -> OppositesScreen()
        "patterns" -> PatternsScreen()
        "safari" -> SoundSafariScreen()
        "daily" -> DailySurpriseScreen()
        "stickers" -> StickerBookScreen()
        else -> { val app = LocalApp.current; LaunchedEffect(id) { app.nav.popBackStack(); app.go("play") } }
    }
}
