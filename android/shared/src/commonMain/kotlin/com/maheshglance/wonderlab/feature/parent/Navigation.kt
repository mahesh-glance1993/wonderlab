package com.maheshglance.wonderlab.feature.parent

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.arg
import com.maheshglance.wonderlab.ui.learnerScreen

/**
 * Parent routes: parent, parent/{section} (learners | progress | account | security | data), downloads, editor.
 * `setup` (SetupScreen) and `progress` (feature.progress.ProgressScreen) are wired by the home graph.
 */
fun NavGraphBuilder.parentGraph() {
    composable(Routes.PARENT) { ParentScreen(null) }
    composable("${Routes.PARENT}/{section}") { e -> ParentScreen(e.arg("section")) }
    learnerScreen(Routes.DOWNLOADS) { DownloadsScreen() }
    composable(Routes.EDITOR) { EditorScreen() }
    composable("credits") { val app = com.maheshglance.wonderlab.ui.LocalApp.current; com.maheshglance.wonderlab.core.design.PictureCreditsScreen { app.back() } }
}
