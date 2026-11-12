package com.maheshglance.wonderlab.feature.games

import androidx.navigation.NavGraphBuilder
import com.maheshglance.wonderlab.ui.Placeholder
import com.maheshglance.wonderlab.ui.learnerScreen

fun NavGraphBuilder.gamesGraph() {
    learnerScreen("games") { Placeholder("games") }
    learnerScreen("games/{gameId}") { Placeholder("games/{gameId}") }
}
