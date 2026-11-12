package com.maheshglance.wonderlab.feature.home

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.maheshglance.wonderlab.ui.NeedAccount
import com.maheshglance.wonderlab.ui.Placeholder
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.arg
import com.maheshglance.wonderlab.ui.learnerScreen

fun NavGraphBuilder.homeGraph() {
    learnerScreen(Routes.HOME) { HomeScreen() }
    composable("${Routes.WHO}?next={next}") { e -> NeedAccount { WhoScreen(e.arg("next")) } }
    composable(Routes.SETUP) { NeedAccount { Placeholder("Set up learners") } }
    learnerScreen("${Routes.LEARN}?subject={subject}") { Placeholder("Lessons") }
    learnerScreen(Routes.NEXT) { Placeholder("What next") }
    learnerScreen(Routes.PROGRESS) { Placeholder("Progress") }
}
