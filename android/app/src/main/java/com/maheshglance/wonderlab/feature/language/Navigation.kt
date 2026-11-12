package com.maheshglance.wonderlab.feature.language

import androidx.navigation.NavGraphBuilder
import com.maheshglance.wonderlab.ui.Placeholder
import com.maheshglance.wonderlab.ui.learnerScreen

fun NavGraphBuilder.languageGraph() {
    learnerScreen("lang") { Placeholder("lang") }
    learnerScreen("lang/{course}") { Placeholder("lang/{course}") }
    learnerScreen("lang/{course}/{unitId}") { Placeholder("lang/{course}/{unitId}") }
    learnerScreen("lang/{course}/{unitId}/{objectiveId}") { Placeholder("lang/{course}/{unitId}/{objectiveId}") }
    learnerScreen("lang/{course}/read/{passageId}") { Placeholder("lang/{course}/read/{passageId}") }
    learnerScreen("lang/{course}/trace/{setId}") { Placeholder("lang/{course}/trace/{setId}") }
}
