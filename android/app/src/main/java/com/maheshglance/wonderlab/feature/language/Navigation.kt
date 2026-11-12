package com.maheshglance.wonderlab.feature.language

import androidx.compose.runtime.key
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.maheshglance.wonderlab.ui.NeedLearner
import com.maheshglance.wonderlab.ui.arg
import com.maheshglance.wonderlab.ui.learnerScreen

/**
 * Language courses (website src/features/language/index.tsx, mounted under /lang):
 *   lang                                  course chooser
 *   lang/{course}[?class=N]               course map for a class
 *   lang/{course}/{unitId}                unit page
 *   lang/{course}/{unitId}/{objectiveId}[?mode=learn|practice|test]   objective (Learn / Practice / Test)
 *   lang/{course}/read/{passageId}        read-along
 *   lang/{course}/trace/{setId}           letter tracing
 *   lang/{course}/print/{setId}           printable tracing sheet (Android print / PDF)
 * The read / trace / print literals share one 4-segment route with objectives and are dispatched here first,
 * so they always win over the {unitId}/{objectiveId} pattern (as the website's route order does).
 */
fun NavGraphBuilder.languageGraph() {
    learnerScreen("lang") { LanguageHome() }
    composable(
        "lang/{course}?class={class}",
        arguments = listOf(navArgument("class") { type = NavType.StringType; nullable = true; defaultValue = null }),
    ) { e -> NeedLearner { val c = e.arg("course") ?: ""; key(c) { CourseMapScreen(c, e.arg("class")?.toIntOrNull()) } } }
    learnerScreen("lang/{course}/{unitId}") { e -> val c = e.arg("course") ?: ""; val u = e.arg("unitId") ?: ""; key(c, u) { UnitScreen(c, u) } }
    composable(
        "lang/{course}/{a}/{b}?mode={mode}",
        arguments = listOf(navArgument("mode") { type = NavType.StringType; nullable = true; defaultValue = null }),
    ) { e ->
        NeedLearner {
            val c = e.arg("course") ?: ""
            val a = e.arg("a") ?: ""
            val b = e.arg("b") ?: ""
            key(c, a, b) {
                when (a) {
                    "read" -> ReadAlongScreen(c, b)
                    "trace" -> TraceScreen(c, b)
                    "print" -> PrintScreen(c, b)
                    else -> ActivityScreen(c, a, b, e.arg("mode"))
                }
            }
        }
    }
}
