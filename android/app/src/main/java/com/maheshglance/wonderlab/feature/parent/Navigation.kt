package com.maheshglance.wonderlab.feature.parent

import androidx.navigation.NavGraphBuilder
import com.maheshglance.wonderlab.ui.Placeholder
import com.maheshglance.wonderlab.ui.learnerScreen

fun NavGraphBuilder.parentGraph() {
    learnerScreen("parent") { Placeholder("parent") }
    learnerScreen("downloads") { Placeholder("downloads") }
    learnerScreen("editor") { Placeholder("editor") }
}
