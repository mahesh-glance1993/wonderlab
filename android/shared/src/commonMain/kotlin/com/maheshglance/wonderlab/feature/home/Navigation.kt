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
    composable(Routes.SETUP) { com.maheshglance.wonderlab.feature.parent.SetupScreen() }
    learnerScreen("${Routes.LEARN}?subject={subject}") { e -> com.maheshglance.wonderlab.feature.lesson.LearnScreen(e.arg("subject")) }
    learnerScreen(Routes.NEXT) { com.maheshglance.wonderlab.feature.lesson.NextScreen() }
    learnerScreen(Routes.PROGRESS) { com.maheshglance.wonderlab.feature.progress.ProgressScreen() }
}
