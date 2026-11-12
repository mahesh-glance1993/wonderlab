package com.maheshglance.wonderlab.feature.art

import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.maheshglance.wonderlab.feature.art.coloring.ColorHomeScreen
import com.maheshglance.wonderlab.feature.art.engine.ArtIds
import com.maheshglance.wonderlab.feature.art.paint.NewCanvasScreen
import com.maheshglance.wonderlab.feature.art.paint.StudioScreen
import com.maheshglance.wonderlab.feature.art.print.PrintScreen
import com.maheshglance.wonderlab.feature.art.tracing.TraceHomeScreen
import com.maheshglance.wonderlab.feature.art.tracing.TraceScreen
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.NeedLearner
import com.maheshglance.wonderlab.ui.arg
import com.maheshglance.wonderlab.ui.learnerScreen

private fun opt(name: String) = navArgument(name) { type = NavType.StringType; nullable = true; defaultValue = null }

/**
 * Art Studio routes (same paths as the website routes under /art):
 *  art · art/paint · art/paint/{id}[?size&paper&page] · art/gallery · art/color · art/color/{pageId}
 *  art/trace · art/trace/{sheetId}[?i] · art/print/{kind}/{id}[?i]
 */
fun NavGraphBuilder.artGraph() {
    learnerScreen("art") { ArtHomeScreen() }
    learnerScreen("art/paint") { NewCanvasScreen() }
    composable("art/paint/{id}?size={size}&paper={paper}&page={page}", arguments = listOf(opt("id"), opt("size"), opt("paper"), opt("page"))) { e ->
        NeedLearner {
            val id = e.arg("id")
            if (id == null || !ArtIds.UUID_RE.matches(id)) { val app = LocalApp.current; LaunchedEffect(Unit) { app.replaceTop("art/paint") } }
            else StudioScreen(id, e.arg("size"), e.arg("paper"), e.arg("page"))
        }
    }
    learnerScreen("art/gallery") { GalleryScreen() }
    learnerScreen("art/color") { ColorHomeScreen() }
    learnerScreen("art/color/{pageId}") { e ->
        // a new colouring project with that page as its locked outline layer
        val app = LocalApp.current
        val pageId = e.arg("pageId").orEmpty()
        val id = remember { ArtIds.uuid() }
        LaunchedEffect(Unit) { app.replaceTop("art/paint/$id?page=${java.net.URLEncoder.encode(pageId, "UTF-8")}&size=large") }
    }
    learnerScreen("art/trace") { TraceHomeScreen() }
    composable("art/trace/{sheetId}?i={i}", arguments = listOf(opt("sheetId"), opt("i"))) { e ->
        NeedLearner { TraceScreen(e.arg("sheetId").orEmpty(), e.arg("i")?.toIntOrNull() ?: 0) }
    }
    composable("art/print/{kind}/{id}?i={i}", arguments = listOf(opt("kind"), opt("id"), opt("i"))) { e ->
        NeedLearner { PrintScreen(e.arg("kind").orEmpty(), e.arg("id").orEmpty(), e.arg("i")?.toIntOrNull()) }
    }
}

/** Replaces the current screen (like the website's <Navigate replace>). */
fun com.maheshglance.wonderlab.ui.AppContext.replaceTop(path: String) {
    val cur = nav.currentDestination?.id
    runCatching {
        nav.navigate(path.trimStart('/')) {
            if (cur != null) popUpTo(cur) { inclusive = true }
            launchSingleTop = true
        }
    }.onFailure { go("art") }
}
