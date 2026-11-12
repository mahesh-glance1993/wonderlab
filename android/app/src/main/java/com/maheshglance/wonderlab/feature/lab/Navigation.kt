package com.maheshglance.wonderlab.feature.lab

import androidx.navigation.NavGraphBuilder
import com.maheshglance.wonderlab.ui.Placeholder
import com.maheshglance.wonderlab.ui.learnerScreen

fun NavGraphBuilder.labGraph() {
    learnerScreen("lab") { Placeholder("lab") }
    learnerScreen("lab/{labId}") { Placeholder("lab/{labId}") }
}
