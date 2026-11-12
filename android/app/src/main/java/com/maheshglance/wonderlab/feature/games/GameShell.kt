package com.maheshglance.wonderlab.feature.games

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Lightbulb
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.RestartAlt
import androidx.compose.material.icons.rounded.Timer
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.LifecycleResumeEffect
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.data.Presentation
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.ErrorState
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.ui.AppContext
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.buildJsonObject
import kotlin.random.Random

/** What a game board gets: the round, progress and display data from the engine, plus a way to act. */
class BoardState(
    val round: JsonElement,
    val progress: JsonElement,
    val view: JsonElement,
    val solved: Boolean,
    val hints: Int,
    val variant: String,
    val lang: String,
    val reduceMotion: Boolean,
    val allowTyping: Boolean,
    val act: (JsonObject) -> Unit,
)

private data class Feed(val ok: Boolean?, val msg: JsonElement, val n: Int)

/**
 * The website's GameShell: variants, levels with adaptive difficulty, hints, restart / new round, optional
 * count-up timer, feedback, persistence (saveActivityState), attempts and private badges, daily streaks.
 */
@Stable
class GameController(
    private val app: AppContext,
    val info: GameInfo,
    private val storageKey: String,
    val daily: DailySpec?,
    private val dailyDate: String?,
    private val classLevel: Int,
    private val scope: CoroutineScope,
    val notices: Notices,
) {
    private val id = info.id
    var saved by mutableStateOf<GSaved?>(null); private set
    var round by mutableStateOf<JsonElement?>(null); private set
    var instructions by mutableStateOf<JsonElement?>(null); private set
    var hintList by mutableStateOf<List<JsonElement>>(emptyList()); private set
    var view by mutableStateOf<JsonElement?>(null); private set
    var feed by mutableStateOf<Any?>(null); private set
    var feedN by mutableIntStateOf(0); private set
    var elapsed by mutableIntStateOf(0)
    var error by mutableStateOf<String?>(null); private set
    var touched = false; private set
    private var dirty = false
    private val mutex = Mutex()
    var lang = "en"
    var presentation = Presentation()

    private val engine get() = app.engine
    private val repo get() = app.repo

    private fun show(ok: Boolean?, msg: JsonElement) { feed = Feed(ok, msg, ++feedN) }
    fun feedOk(): Boolean? = (feed as? Feed)?.ok
    fun feedMsg(): JsonElement? = (feed as? Feed)?.msg
    fun clearFeed() { feed = null }

    private fun say(l: JsonElement?) { if (l != null) app.say(l.loc(lang), lang, l.j("en").str()) }

    private suspend fun load(s: GSaved, adopt: Boolean = true) {
        val r = engine.call("games.generate", id, s.seed, s.level)
        val d = engine.call("games.describe", id, r, s.progress)
        round = r; instructions = d.j("instructions"); hintList = d.j("hints").list(); view = d.j("view")
        if (adopt) { saved = s; elapsed = s.elapsed }
    }

    private suspend fun fresh(variant: String, adjust: Int, stats: GStats = GStats(), timerOn: Boolean = false, dailyInfo: GDaily? = null): GSaved {
        val seed = daily?.seed ?: Random.nextLong(0, 1L shl 31)
        val level = daily?.level ?: engine.call("games.levelFor", id, classLevel, variant, adjust).int() ?: 0
        val st = engine.call("games.start", id, seed, level)
        val s = GSaved(game = id, variant = variant, timerOn = timerOn, adjust = adjust, stats = stats, daily = dailyInfo, seed = seed, level = level,
            progress = st.j("progress") ?: JsonObject(emptyMap()), hints = if (variant == "guided") 1 else 0)
        round = st.j("round"); instructions = st.j("instructions"); hintList = st.j("hints").list(); view = st.j("view")
        saved = s; elapsed = 0
        return s
    }

    private suspend fun restore(raw: JsonElement?): GSaved? {
        val s = readSaved(raw) ?: return null
        if (daily != null && (s.daily?.date != dailyDate || s.game != id)) {
            // a new day: keep the streak record, start today's puzzle
            return fresh("regular", 0, s.stats, dailyInfo = s.daily?.copy(date = dailyDate ?: s.daily.date))
        }
        load(s)
        return s
    }

    /** First load (or adopting learner state that arrived later, if the learner hasn't started). */
    fun start(stored: JsonElement?) = scope.launch {
        mutex.withLock {
            runCatching {
                if (saved != null && (touched || stored == null)) return@withLock
                val r = restore(stored)
                if (r == null && saved == null) fresh("regular", 0, dailyInfo = if (daily != null) GDaily(dailyDate ?: todayKey(), 0, null) else null)
                if (presentation.readAloud) say(instructions)
            }.onFailure { error = it.message ?: "Could not start the game" }
        }
    }

    private fun update(s: GSaved) { touched = true; dirty = true; saved = s }

    fun save() {
        val s = saved ?: return
        if (!dirty) return
        dirty = false
        repo.saveActivityState(storageKey, AppJson.encodeToJsonElement(GSaved.serializer(), s.copy(elapsed = elapsed)))
    }
    fun markDirty() { dirty = true }

    /** One learner action → the engine (same reducers as the website's views) → effects. */
    fun act(action: JsonObject) = scope.launch {
        mutex.withLock {
            val s = saved ?: return@withLock
            val r = round ?: return@withLock
            val res = runCatching { engine.call("games.act", id, r, s.progress, action, s.solved) }.getOrNull() ?: return@withLock
            update(s.copy(progress = res.j("progress") ?: s.progress))
            hintList = res.j("hints").list(); view = res.j("view")
            val fx = res.j("fx").obj()
            fx["say"]?.let { say(it) }
            fx["notice"]?.let { show(null, it) }
            fx["mistake"]?.let { mistake(it) }
            fx["complete"]?.let { complete(it, fx["perfect"].bool() ?: true) }
        }
    }

    private fun mistake(msg: JsonElement) {
        val cur = saved ?: return
        if (cur.solved) return
        update(cur.copy(mistakes = cur.mistakes + 1))
        show(false, msg)
        Tones.wrong()
    }

    private suspend fun complete(msg: JsonElement?, perfect: Boolean) {
        val cur = saved ?: return
        if (cur.solved) return
        val correct = perfect && cur.mistakes == 0
        if (cur.replay == true) {
            update(cur.copy(solved = true)); show(true, msg ?: GamesStore.strings["correct"] ?: JsonPrimitive("")); Tones.correct(); return
        }
        var st = cur.stats.copy(rounds = cur.stats.rounds + 1)
        var adjust = cur.adjust
        if (correct) {
            st = st.copy(firstTry = st.firstTry + 1, streak = st.streak + 1, wrongRun = 0)
            st = st.copy(best = maxOf(st.best, st.streak))
            if (daily == null && st.streak % 4 == 0) adjust = minOf(1, adjust + 1)
        } else {
            st = st.copy(streak = 0, wrongRun = st.wrongRun + 1)
            if (daily == null && st.wrongRun >= 2) { adjust = maxOf(-1, adjust - 1); st = st.copy(wrongRun = 0) }
        }
        val challengeWin = cur.variant == "challenge" && correct && cur.hints == 0
        if (challengeWin) st = st.copy(challenge = st.challenge + 1)
        var dailyInfo = cur.daily
        if (daily != null && dailyDate != null) {
            val prevStreak = if (dailyInfo?.lastSolved == prevDateKey(dailyDate)) dailyInfo.streak else 0
            dailyInfo = GDaily(dailyDate, prevStreak + 1, dailyDate)
        }
        update(cur.copy(solved = true, stats = st, adjust = adjust, daily = dailyInfo))
        show(true, msg ?: GamesStore.strings[if (correct) "solvedFirstTry" else "correct"] ?: JsonPrimitive(""))
        Tones.complete()
        runCatching { repo.recordAttempt("$id:${cur.level}:${cur.seed}", 1, info.objectiveId, "game", correct, hintsUsed = cur.hints) }
        val ids = mutableListOf("game:$id:first")
        if (st.rounds >= 5) ids += "game:$id:5"
        if (challengeWin) { ids += "game:$id:challenge"; notices.celebrate() }
        if (daily != null && dailyInfo != null) {
            ids += "game:daily:first"
            if (dailyInfo.streak >= 3) ids += "game:daily:streak3"
            if (dailyInfo.streak >= 7) ids += "game:daily:streak7"
            notices.celebrate()
        }
        for (b in ids) if (repo.award(b)) GamesStore.badges.firstOrNull { it.id == b }?.let { notices.show("${sx("newBadge", lang)}: ${it.title(lang)}") }
    }

    /** Leaving an attempted-but-unsolved round still records an (incorrect) attempt. */
    private suspend fun recordSkip() {
        val cur = saved ?: return
        if (!cur.solved && (cur.mistakes > 0 || cur.hints > (if (cur.variant == "guided") 1 else 0)))
            runCatching { repo.recordAttempt("$id:${cur.level}:${cur.seed}", 1, info.objectiveId, "game", false, hintsUsed = cur.hints) }
    }

    fun newRound(variant: String? = null) = scope.launch {
        mutex.withLock {
            val prev = saved ?: return@withLock
            recordSkip()
            feed = null
            runCatching { fresh(variant ?: prev.variant, prev.adjust, prev.stats, prev.timerOn, prev.daily) }.onFailure { error = it.message }
            touched = true; dirty = true
            if (presentation.readAloud) say(instructions)
        }
    }

    fun restart() = scope.launch {
        mutex.withLock {
            val prev = saved ?: return@withLock
            val r = round ?: return@withLock
            feed = null
            val p = runCatching { engine.call("games.init", id, r) }.getOrNull() ?: return@withLock
            update(prev.copy(progress = p, solved = false, replay = (prev.replay == true) || prev.solved))
            runCatching { engine.call("games.describe", id, r, p) }.getOrNull()?.let { hintList = it.j("hints").list(); view = it.j("view") }
        }
    }

    fun showHint() {
        val cur = saved ?: return
        update(cur.copy(hints = minOf(hintList.size, cur.hints + 1)))
        val h = hintList.getOrNull(minOf(hintList.size - 1, cur.hints))
        if (h != null && presentation.readAloud) say(h)
    }

    fun toggleTimer() { saved?.let { update(it.copy(timerOn = !it.timerOn)) } }
    fun speakInstructions() = say(instructions)
}

@Composable
fun GameScreen(gameId: String?, isDaily: Boolean) {
    val app = LocalApp.current
    val s by appState()
    val profile = s.profile ?: return
    val lang = WL.lang
    var ready by remember { mutableStateOf(GamesStore.games.isNotEmpty()) }
    var dailySpec by remember { mutableStateOf<DailySpec?>(null) }
    val today = remember { todayKey() }
    LaunchedEffect(Unit) {
        runCatching {
            GamesStore.load(app.engine)
            if (isDaily) dailySpec = AppJson.decodeFromJsonElement(DailySpec.serializer(), app.engine.call("games.daily", today, profile.id, profile.classLevel))
        }
        ready = true
    }
    if (!ready || (isDaily && dailySpec == null && GamesStore.games.isEmpty())) { Column(Modifier.fillMaxSize().background(WL.colors.bg)) { TopBar(sx("library", lang), onBack = { app.back() }); Loading() }; return }
    val id = if (isDaily) dailySpec?.gameId else gameId
    val info = GamesStore.game(id)
    if (info == null) {
        Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
            TopBar(sx("library", lang), onBack = { app.back() })
            Box(Modifier.weight(1f)) {
                ErrorState(sx("notFound", lang), null)
                WLButton(sx("backToGames", lang), { app.go("games") }, Modifier.align(Alignment.BottomCenter).padding(32.dp), kind = BtnKind.Primary)
            }
        }
        return
    }
    val storageKey = if (isDaily) "game:daily" else "game:${info.id}"
    val scope = rememberCoroutineScope()
    val notices = remember { Notices() }
    val pres = rememberPresentation()
    val ctl = remember(info.id, isDaily) { GameController(app, info, storageKey, dailySpec, if (isDaily) today else null, profile.classLevel, scope, notices) }
    ctl.lang = lang; ctl.presentation = pres
    val stored = s.learner.activities[storageKey]?.state

    LaunchedEffect(ctl) {
        app.repo.setLastActivity(if (isDaily) "/games/daily" else "/games/${info.id}", if (isDaily) sx("dailyPuzzle", lang) else info.title)
    }
    LaunchedEffect(ctl, stored == null) { if (!ctl.touched) ctl.start(stored) }

    // persistence: debounced, flushed when leaving or pausing
    val sv = ctl.saved
    LaunchedEffect(sv) { if (sv != null) { delay(500); ctl.save() } }
    DisposableEffect(ctl) { onDispose { ctl.save() } }
    LifecycleResumeEffect(ctl) { onPauseOrDispose { ctl.markDirty(); ctl.save() } }

    // count-up timer (never a deadline), only when the parent allows timers
    val timersAllowed = s.prefs.timers
    val timerOn = timersAllowed && sv?.timerOn == true
    LaunchedEffect(timerOn, sv?.solved, sv?.seed) { while (timerOn && sv?.solved == false) { delay(1000); ctl.elapsed += 1 } }

    val title = if (isDaily) "${sx("dailyPuzzle", lang)} · ${info.title(lang)}" else info.title(lang)
    Box(Modifier.fillMaxSize().background(WL.colors.bg)) {
        Column(Modifier.fillMaxSize()) {
            TopBar(title, onBack = { app.back() }, actions = {
                if (timersAllowed && sv != null) {
                    WLButton(if (sv.timerOn) "%d:%02d".format(ctl.elapsed / 60, ctl.elapsed % 60) else sx("timerOff", lang), { ctl.toggleTimer() }, icon = Icons.Rounded.Timer, small = true)
                }
            })
            when {
                ctl.error != null && sv == null -> ErrorState(ctl.error ?: "", { ctl.start(stored) })
                sv == null || ctl.round == null -> Loading()
                else -> GameBody(ctl, sv, timersAllowed, pres)
            }
        }
        NoticeHost(notices)
    }
}

@Composable
private fun GameBody(ctl: GameController, sv: GSaved, timersAllowed: Boolean, pres: Presentation) {
    val win = LocalWindow.current
    val lang = WL.lang
    val wide = win.landscape && win.width >= 640.dp
    val board = BoardState(ctl.round!!, sv.progress, ctl.view ?: JsonObject(emptyMap()), sv.solved, sv.hints, sv.variant, lang, LocalReduceMotion.current, pres.allowTyping) { ctl.act(it) }
    val pad = if (win.isPhone) 10.dp else 18.dp
    val boardBox: @Composable (Modifier) -> Unit = { m ->
        Box(m.clip(RoundedCornerShape(24.dp)).background(WL.colors.surface).padding(if (win.isPhone) 8.dp else 14.dp)) { GameBoard(ctl.info.id, board) }
    }
    val inset = Modifier.windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Bottom + WindowInsetsSides.Horizontal))
    if (wide) {
        Row(Modifier.fillMaxSize().then(inset).padding(pad), horizontalArrangement = Arrangement.spacedBy(pad)) {
            boardBox(Modifier.weight(1f).fillMaxHeight())
            Column(Modifier.width(if (win.width >= 1000.dp) 360.dp else 300.dp).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Instructions(ctl, maxLines = 5)
                StatusBar(ctl, sv)
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.Bottom)) {
                    Hints(ctl, sv, maxLines = 3)
                    FeedbackLine(ctl)
                }
                Actions(ctl, sv, vertical = true)
            }
        }
    } else {
        Column(Modifier.fillMaxSize().then(inset).padding(pad), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Instructions(ctl, maxLines = 3)
            StatusBar(ctl, sv)
            boardBox(Modifier.weight(1f).fillMaxWidth())
            Hints(ctl, sv, maxLines = 2)
            FeedbackLine(ctl)
            Actions(ctl, sv, vertical = false)
        }
    }
}

@Composable
private fun Instructions(ctl: GameController, maxLines: Int) {
    val lang = WL.lang
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(WL.colors.games).padding(horizontal = 12.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Icon(Icons.Rounded.Info, null, tint = WL.colors.gamesInk, modifier = Modifier.size(20.dp))
        // the whole instruction always shows: it shrinks to fit instead of being cut off
            val ins = ctl.instructions.loc(lang)
            if (com.maheshglance.wonderlab.core.design.EmojiAssets.hasEmoji(ins)) EmojiText(ins, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium, color = WL.colors.gamesInk, maxLines = maxLines + 2)
            else androidx.compose.foundation.text.BasicText(ins, Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium.copy(color = WL.colors.gamesInk), maxLines = maxLines,
                autoSize = androidx.compose.foundation.text.TextAutoSize.StepBased(minFontSize = androidx.compose.ui.unit.TextUnit(10f, androidx.compose.ui.unit.TextUnitType.Sp), maxFontSize = MaterialTheme.typography.bodyMedium.fontSize))
        SpeakButton({ ctl.speakInstructions() }, size = 40.dp)
    }
}

@Composable
private fun StatusBar(ctl: GameController, sv: GSaved) {
    val lang = WL.lang
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        if (ctl.daily == null) Segmented(ctl.info.variants.map { it to sx(it, lang) }, sv.variant, { ctl.newRound(it) }, Modifier.weight(1f, fill = false))
        EmojiPill("🎯", "${sx("level", lang)} ${sv.level + 1}")
        if (sv.stats.streak > 1) EmojiPill("⭐", "${sv.stats.streak} ${sx("streak", lang)}")
        if (ctl.daily != null && (sv.daily?.streak ?: 0) > 0) EmojiPill("☀️", "${sv.daily?.streak} ${sx("dayStreak", lang)}")
    }
}

@Composable
private fun Hints(ctl: GameController, sv: GSaved, maxLines: Int) {
    val lang = WL.lang
    if (sv.hints <= 0 || ctl.hintList.isEmpty()) return
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(WL.colors.warnBg).padding(horizontal = 12.dp, vertical = 6.dp), verticalArrangement = Arrangement.spacedBy(2.dp)) {
        ctl.hintList.take(sv.hints).forEach { h ->
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.Top) {
                Icon(Icons.Rounded.Lightbulb, null, tint = WL.colors.warn, modifier = Modifier.size(16.dp).padding(top = 2.dp))
                FitText(h.loc(lang), style = MaterialTheme.typography.bodySmall, color = WL.colors.warn, maxLines = maxLines)
            }
        }
    }
}

@Composable
private fun FeedbackLine(ctl: GameController) {
    val lang = WL.lang
    val msg = ctl.feedMsg() ?: return
    AnimatedVisibility(true, enter = fadeIn() + slideInVertically { it / 3 }) {
        val ok = ctl.feedOk()
        AlertBox(msg.loc(lang), when (ok) { true -> AlertKind.Good; false -> AlertKind.Bad; null -> AlertKind.Info })
    }
}

@Composable
private fun Actions(ctl: GameController, sv: GSaved, vertical: Boolean) {
    val lang = WL.lang
    val hintBtn: @Composable (Modifier) -> Unit = { m ->
        if (sv.variant == "challenge") Row(m.padding(horizontal = 6.dp), verticalAlignment = Alignment.CenterVertically) { IconLabel(Icons.Rounded.Lock, sx("noHintsChallenge", lang), WL.colors.muted) }
        else WLButton(sx("hint", lang), { ctl.showHint() }, m, icon = Icons.Rounded.Lightbulb, enabled = !sv.solved && sv.hints < ctl.hintList.size, small = true)
    }
    val restart: @Composable (Modifier) -> Unit = { m -> WLButton(sx("restart", lang), { ctl.restart() }, m, icon = Icons.Rounded.RestartAlt, small = true) }
    val next: @Composable (Modifier) -> Unit = { m ->
        if (ctl.daily == null) WLButton(sx(if (sv.solved) "next" else "newRound", lang), { ctl.newRound() }, m, icon = Icons.AutoMirrored.Rounded.ArrowForward, kind = if (sv.solved) BtnKind.Primary else BtnKind.Normal, small = true)
        else if (sv.daily?.lastSolved == ctl.daily.let { todayKey() }) EmojiPill("✅", sx("dailyDone", lang), m, bg = WL.colors.goodBg, fg = WL.colors.good)
    }
    if (vertical) {
        Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) { hintBtn(Modifier.weight(1f)); restart(Modifier.weight(1f)) }
            next(Modifier.fillMaxWidth())
        }
    } else {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            hintBtn(Modifier)
            restart(Modifier)
            Spacer(Modifier.weight(1f))
            next(Modifier)
        }
    }
}

/** Dispatches to the board for each game. */
@Composable
fun GameBoard(id: String, b: BoardState) {
    when (id) {
        "counting" -> CountingBoard(b)
        "shapes" -> ShapesBoard(b)
        "patterns" -> PatternsBoard(b)
        "numberline" -> NumberLineBoard(b)
        "fractions" -> FractionsBoard(b)
        "logic" -> LogicBoard(b)
        "balance" -> BalanceBoard(b)
        "circuits" -> CircuitsBoard(b)
        else -> Text(id)
    }
}

/** Builds an action object: act("tap", "i" to 3). */
fun action(type: String, vararg pairs: Pair<String, Any?>): JsonObject = buildJsonObject {
    put("type", type)
    pairs.forEach { (k, v) -> put(k, com.maheshglance.wonderlab.core.engine.Engine.toJson(v)) }
}

