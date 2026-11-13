package com.maheshglance.wonderlab.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.maheshglance.wonderlab.core.design.ErrorState
import com.maheshglance.wonderlab.core.design.TopBar

/** Temporary screen used while a feature is being built. */
@Composable
fun Placeholder(title: String) {
    val app = LocalApp.current
    Column(Modifier.fillMaxSize()) {
        TopBar(title, onBack = { app.back() })
        ErrorState("$title is coming soon.", null)
    }
}
