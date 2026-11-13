package com.maheshglance.wonderlab.feature.lesson

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.maheshglance.wonderlab.ui.NeedLearner
import com.maheshglance.wonderlab.ui.arg
import com.maheshglance.wonderlab.ui.learnerScreen

/**
 * Lesson routes (the website lesson routes):
 *   lesson/diagnostic                               optional starting check for the learner's class
 *   lesson/{unitId}                                 the unit's first objective
 *   lesson/{unitId}/{objectiveId}?mode=learn|practice|test
 * LearnScreen (learn?subject=…) and NextScreen (next) are wired into the home graph.
 */
fun NavGraphBuilder.lessonGraph() {
    learnerScreen("lesson/diagnostic") { DiagnosticScreen() }
    learnerScreen("lesson/{unitId}") { e ->
        val unit = e.arg("unitId") ?: ""
        if (unit == "diagnostic") DiagnosticScreen() else LessonRoute(unit, null, null)
    }
    composable(
        "lesson/{unitId}/{objectiveId}?mode={mode}",
        arguments = listOf(navArgument("mode") { type = NavType.StringType; nullable = true; defaultValue = null }),
    ) { e -> NeedLearner { LessonRoute(e.arg("unitId") ?: "", e.arg("objectiveId"), e.arg("mode")) } }
}
