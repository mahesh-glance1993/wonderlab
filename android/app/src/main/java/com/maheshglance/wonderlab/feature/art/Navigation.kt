package com.maheshglance.wonderlab.feature.art

import androidx.navigation.NavGraphBuilder
import com.maheshglance.wonderlab.ui.Placeholder
import com.maheshglance.wonderlab.ui.learnerScreen

fun NavGraphBuilder.artGraph() {
    learnerScreen("art") { Placeholder("art") }
    learnerScreen("art/paint") { Placeholder("art/paint") }
    learnerScreen("art/paint/{id}") { Placeholder("art/paint/{id}") }
    learnerScreen("art/color") { Placeholder("art/color") }
    learnerScreen("art/color/{pageId}") { Placeholder("art/color/{pageId}") }
    learnerScreen("art/gallery") { Placeholder("art/gallery") }
    learnerScreen("art/trace") { Placeholder("art/trace") }
    learnerScreen("art/trace/{sheetId}") { Placeholder("art/trace/{sheetId}") }
}
