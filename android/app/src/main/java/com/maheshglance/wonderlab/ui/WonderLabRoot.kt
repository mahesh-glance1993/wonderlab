package com.maheshglance.wonderlab.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.maheshglance.wonderlab.WonderLabApp
import com.maheshglance.wonderlab.core.audio.SpeechPrefs
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.data.Presentation
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WonderLabTheme
import com.maheshglance.wonderlab.core.design.rememberWindowInfo
import com.maheshglance.wonderlab.feature.art.artGraph
import com.maheshglance.wonderlab.feature.auth.authGraph
import com.maheshglance.wonderlab.feature.early.playGraph
import com.maheshglance.wonderlab.feature.games.gamesGraph
import com.maheshglance.wonderlab.feature.home.homeGraph
import com.maheshglance.wonderlab.feature.lab.labGraph
import com.maheshglance.wonderlab.feature.language.languageGraph
import com.maheshglance.wonderlab.feature.lesson.lessonGraph
import com.maheshglance.wonderlab.feature.parent.parentGraph
import com.maheshglance.wonderlab.ui.shell.BreakReminder
import com.maheshglance.wonderlab.ui.shell.OfflineBar
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject

/** Presentation for the active learner (tier, read-aloud, big targets), cached per class/band. */
private val presentationCache = mutableStateMapOf<String, Presentation>()

@Composable
fun WonderLabRoot(application: WonderLabApp) {
    val state by application.repo.state.collectAsState()
    val nav = rememberNavController()
    val ctx = remember(nav) { AppContext(application, nav) }
    val profile = state.profile
    val prefs = state.prefs

    // emailed links (reset password / verify email) arriving while the app is open
    val link by application.pendingLinks.collectAsState()
    LaunchedEffect(link, state.ready) {
        val i = link ?: return@LaunchedEffect
        if (state.ready && i.data != null) { runCatching { nav.handleDeepLink(i) }; application.pendingLinks.value = null }
    }

    val presKey = profile?.let { "${it.classLevel}|${it.ageBand}" }
    LaunchedEffect(presKey) {
        if (profile != null && presKey != null && presentationCache[presKey] == null)
            runCatching { presentationCache[presKey] = application.engine.get<Presentation>("core.presentation", profile.classLevel, profile.ageBand) }
    }
    val pres = presKey?.let { presentationCache[it] } ?: Presentation()
    val lang = if (pres.teluguAvailable && prefs.language == "te") "te" else "en"

    val strings = remember { mutableStateMapOf<String, JsonObject>() }
    LaunchedEffect(lang) { if (strings[lang] == null) runCatching { strings[lang] = application.engine.call("core.strings", lang).jsonObject } }

    // audio prefs follow the learner (same defaults as the website)
    LaunchedEffect(prefs, pres.tier) {
        val speed = prefs.readingSpeed ?: when (pres.tier) { "early" -> "slower"; "primary" -> "slow"; else -> "normal" }
        application.speech.prefs = SpeechPrefs(prefs.mute, prefs.volume, when (speed) { "slower" -> 0.7f; "slow" -> 0.8f; else -> 0.92f }, prefs.naturalVoice, prefs.naturalSpeaker, prefs.narration)
        Tones.muted = prefs.mute; Tones.volume = prefs.volume
    }

    WonderLabTheme(theme = prefs.theme, tier = pres.tier, bigTargets = pres.bigTargets, textScale = prefs.textSize, lang = lang, reduceMotion = prefs.reduceMotion) {
        CompositionLocalProvider(LocalApp provides ctx, LocalStrings provides (strings[lang] ?: strings["en"] ?: JsonObject(emptyMap())), LocalWindow provides rememberWindowInfo()) {
            Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
                Box(Modifier.weight(1f)) {
                    if (!state.ready) Loading()
                    else NavHost(nav, startDestination = Routes.HOME) {
                        authGraph()
                        homeGraph()
                        lessonGraph()
                        playGraph()
                        gamesGraph()
                        labGraph()
                        artGraph()
                        languageGraph()
                        parentGraph()
                    }
                }
                OfflineBar()
            }
            BreakReminder()
            // uploads artwork saved on the device and shows the two-device clash dialog on any screen
            if (state.account != null && state.profile != null) com.maheshglance.wonderlab.feature.art.ui.ArtSyncHost()
        }
    }
}

/**
 * Route guards, like the website: signed in → has learner profiles → learner chosen.
 * Use for every learner screen: `composable("play") { NeedLearner { PlayHome() } }`.
 */
@Composable
fun NeedLearner(content: @Composable () -> Unit) {
    val app = LocalApp.current
    val s by app.repo.state.collectAsState()
    when {
        !s.ready -> Loading()
        s.account == null -> LaunchedEffect(Unit) { app.replace(Routes.SIGNIN) }
        s.profiles.isEmpty() -> LaunchedEffect(Unit) { app.replace(Routes.SETUP) }
        s.profile == null -> LaunchedEffect(Unit) { app.replace(Routes.WHO) }
        else -> content()
    }
}

@Composable
fun NeedAccount(content: @Composable () -> Unit) {
    val app = LocalApp.current
    val s by app.repo.state.collectAsState()
    when {
        !s.ready -> Loading()
        s.account == null -> LaunchedEffect(Unit) { app.replace(Routes.SIGNIN) }
        else -> content()
    }
}

/** Shorthand for a learner screen route. */
fun NavGraphBuilder.learnerScreen(route: String, content: @Composable (androidx.navigation.NavBackStackEntry) -> Unit) =
    composable(route) { entry -> NeedLearner { content(entry) } }

fun androidx.navigation.NavBackStackEntry.arg(name: String): String? = arguments?.getString(name)
