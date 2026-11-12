package com.maheshglance.wonderlab.feature.early

import androidx.navigation.NavGraphBuilder
import com.maheshglance.wonderlab.ui.Placeholder
import com.maheshglance.wonderlab.ui.learnerScreen

fun NavGraphBuilder.playGraph() {
    learnerScreen("play") { Placeholder("play") }
    learnerScreen("play/{activity}") { Placeholder("play/{activity}") }
    learnerScreen("play/stories/{storyId}") { Placeholder("play/stories/{storyId}") }
}
