package com.maheshglance.wonderlab.feature.notes

import androidx.navigation.NavGraphBuilder
import com.maheshglance.wonderlab.ui.arg
import com.maheshglance.wonderlab.ui.learnerScreen

fun NavGraphBuilder.notesGraph() {
    learnerScreen(NOTES_ROUTE) { NotesHome() }
    learnerScreen("$NOTES_ROUTE/edit/{key}?subject={subject}&title={title}") { e -> NoteEditor(e.arg("key") ?: "free", e.arg("subject"), e.arg("title")) }
}
