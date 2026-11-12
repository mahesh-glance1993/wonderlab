package com.maheshglance.wonderlab.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.navigation.NavHostController
import com.maheshglance.wonderlab.WonderLabApp
import com.maheshglance.wonderlab.core.audio.Speech
import com.maheshglance.wonderlab.core.data.AppRepository
import com.maheshglance.wonderlab.core.data.AppState
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.engine.Engine
import com.maheshglance.wonderlab.core.net.Api
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonPrimitive

/**
 * What every screen needs: services + navigation. Get it with `val app = LocalApp.current`.
 * Navigation uses the website's paths (without the leading slash), e.g. app.go("play/pictures").
 */
class AppContext(
    val application: WonderLabApp,
    val nav: NavHostController,
) {
    val repo: AppRepository get() = application.repo
    val engine: Engine get() = application.engine
    val speech: Speech get() = application.speech
    val api: Api get() = application.api

    /** Navigate to a website-style path ("/play/pictures", "lesson/u1/o2?mode=practice"). */
    fun go(path: String) {
        val p = path.trimStart('/').ifEmpty { Routes.HOME }
        runCatching { nav.navigate(p) { launchSingleTop = true } }.onFailure { nav.navigate(Routes.HOME) { launchSingleTop = true } }
    }

    /** Replace the current screen (e.g. after sign-in). */
    fun replace(path: String) {
        val p = path.trimStart('/').ifEmpty { Routes.HOME }
        nav.navigate(p) { popUpTo(0) { inclusive = true }; launchSingleTop = true }
    }

    fun back() { if (!nav.popBackStack()) go(Routes.HOME) }

    /** Speaks a Localized text in the learner's language. */
    fun say(text: Localized, lang: String) = speech.speak(text.get(lang), lang, text.en)
    fun say(text: String, lang: String = "en", fallbackEn: String? = null) = speech.speak(text, lang, fallbackEn)
}

val LocalApp = staticCompositionLocalOf<AppContext> { error("AppContext not provided") }

/** UI strings from the website's i18n (loaded through the engine once per language). */
val LocalStrings = staticCompositionLocalOf<JsonObject> { JsonObject(emptyMap()) }

@Composable
fun t(key: String): String = LocalStrings.current[key]?.jsonPrimitive?.content ?: key

@Composable
fun appState(): State<AppState> = LocalApp.current.repo.state.collectAsState()

object Routes {
    const val HOME = "home"
    const val SIGNIN = "signin"
    const val SIGNUP = "signup"
    const val FORGOT = "forgot"
    const val WHO = "who"
    const val SETUP = "setup"
    const val LEARN = "learn"
    const val NEXT = "next"
    const val PROGRESS = "progress"
    const val DOWNLOADS = "downloads"
    const val PARENT = "parent"
    const val PLAY = "play"
    const val GAMES = "games"
    const val LAB = "lab"
    const val ART = "art"
    const val LANG = "lang"
    const val EDITOR = "editor"
}
