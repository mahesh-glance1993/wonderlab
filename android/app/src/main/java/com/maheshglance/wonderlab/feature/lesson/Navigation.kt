package com.maheshglance.wonderlab.feature.lesson

import androidx.navigation.NavGraphBuilder
import com.maheshglance.wonderlab.ui.Placeholder
import com.maheshglance.wonderlab.ui.learnerScreen

fun NavGraphBuilder.lessonGraph() {
    learnerScreen("lesson/diagnostic") { Placeholder("lesson/diagnostic") }
    learnerScreen("lesson/{unitId}") { Placeholder("lesson/{unitId}") }
    learnerScreen("lesson/{unitId}/{objectiveId}") { Placeholder("lesson/{unitId}/{objectiveId}") }
}
