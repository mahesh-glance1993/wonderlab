package com.maheshglance.wonderlab.feature.games

import androidx.navigation.NavGraphBuilder
import com.maheshglance.wonderlab.ui.arg
import com.maheshglance.wonderlab.ui.learnerScreen

/** Website routes: /games (library), /games/daily, /games/:gameId. */
fun NavGraphBuilder.gamesGraph() {
    learnerScreen("games") { GamesHub() }
    learnerScreen("games/daily") { GameScreen(null, isDaily = true) }
    learnerScreen("games/{gameId}") { val id = it.arg("gameId"); GameScreen(id, isDaily = id == "daily") }
}
