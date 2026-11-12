package com.maheshglance.wonderlab.feature.early

import androidx.compose.runtime.Composable
import com.maheshglance.wonderlab.core.design.ErrorState
import com.maheshglance.wonderlab.ui.LocalApp

// Temporary placeholders while each activity is ported (each is removed when its own file exists).
@Composable private fun Soon(title: L) { val app = LocalApp.current; EarlyScreen(title.tx, { app.back() }) { ErrorState("${title.tx}…", null) } }
@Composable fun PictureFunScreen() = Soon(UI.pictures)
@Composable fun StoryListScreen() = Soon(UI.stories)
@Composable fun StoryReaderScreen(id: String) = Soon(UI.stories)
@Composable fun ShapePlayScreen() = Soon(UI.shapes)
@Composable fun SortMatchScreen() = Soon(UI.sort)
@Composable fun BuildItScreen() = Soon(UI.build)
@Composable fun MemoryMatchScreen() = Soon(L("Memory Match", ""))
@Composable fun ColourMixScreen() = Soon(L("Colour Mixing", ""))
@Composable fun RhymesScreen() = Soon(L("Rhymes & Songs", ""))
@Composable fun OppositesScreen() = Soon(L("Opposites", ""))
@Composable fun PatternsScreen() = Soon(L("Patterns", ""))
@Composable fun SoundSafariScreen() = Soon(L("Sound Safari", ""))
@Composable fun DailySurpriseScreen() = Soon(L("Daily Surprise", ""))
@Composable fun StickerBookScreen() = Soon(L("Sticker Book", ""))
