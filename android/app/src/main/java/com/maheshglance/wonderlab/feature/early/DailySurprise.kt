package com.maheshglance.wonderlab.feature.early

import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.MenuBook
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.min
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLFonts
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// Daily Surprise: one short challenge a day (a pattern, an opposite, a colour mix and a sound), the same for
// everyone on the same day. Finishing it unwraps the day's sticker for the Sticker Book.
private object DT {
    val title = L("Daily Surprise", "రోజూ ఆశ్చర్యం")
    val intro = L("A little surprise is waiting! Finish today’s 4 games to open it.", "ఒక చిన్న ఆశ్చర్యం ఎదురుచూస్తోంది! ఈరోజు 4 ఆటలు పూర్తి చేసి దాన్ని తెరువు.")
    val start = L("Open today’s games", "ఈరోజు ఆటలు మొదలుపెట్టు")
    val doneToday = L("You did today’s surprise! Come back tomorrow for a new one.", "ఈరోజు ఆశ్చర్యం పూర్తి చేశావు! రేపు కొత్తది కోసం మళ్ళీ రా.")
    val again = L("Play today’s games again", "ఈరోజు ఆటలు మళ్ళీ ఆడు")
    val book = L("Sticker book", "స్టిక్కర్ పుస్తకం")
    val unwrap = L("You opened the surprise!", "ఆశ్చర్యాన్ని తెరిచావు!")
    val streak = L("Days in a row", "వరుసగా రోజులు")
    val hear = L("Hear it again", "మళ్ళీ విను")
    val listen = L("Listen! What makes this sound?", "విను! ఈ శబ్దం దేనిది?")
    val mixAsk = L("Which two paints make", "ఏ రెండు రంగులు కలిపితే వస్తుంది")
    val open = L("Open the surprise!", "ఆశ్చర్యం తెరువు!")
}

/** The day before "2026-11-09" (prevDay). */
fun prevDayKey(key: String): String {
    val p = key.split("-").mapNotNull { it.toIntOrNull() }
    if (p.size != 3) return key
    val c = java.util.Calendar.getInstance().apply { clear(); set(p[0], p[1] - 1, p[2]); add(java.util.Calendar.DAY_OF_MONTH, -1) }
    return dayKey(c)
}
/** Days in a row the daily challenge was done, ending today (or yesterday). */
fun dailyStreak(days: List<String>, today: String): Int {
    val set = days.toSet()
    var k = if (set.contains(today)) today else prevDayKey(today)
    var n = 0
    while (set.contains(k)) { n++; k = prevDayKey(k) }
    return n
}

@Composable
fun DailySurpriseScreen() {
    val app = LocalApp.current
    TrackLast("/play/daily", DT.title)
    val stickers = rememberStickers()
    val scope = rememberCoroutineScope()
    val today = remember { dayKey() }
    var steps by rememberActJson<List<DailyStep>?> { null }
    var phase by rememberSaveable { mutableStateOf("intro") }
    var run by rememberSaveable { mutableStateOf(0) }
    var got by rememberActJson<Sticker?> { null }
    val st = stickers.state
    val done = st.days.contains(today)
    LaunchedEffect(today) { if (steps == null) steps = app.engine.early<List<DailyStep>>("dailyChallenge", today, Sfx.NAMES) }
    Narrate(if (phase == "intro") (if (done) DT.doneToday else DT.intro) else null, "$phase-$done")
    BackHandler(phase != "intro") { phase = "intro" }

    EarlyScreen(DT.title.tx, { if (phase != "intro") phase = "intro" else app.back() }) { b ->
        when (phase) {
            "intro" -> {
                val todays = st.earned.entries.filter { (id, at) -> b.sticker[id]?.source == "daily" && dayKeyOf(at) == today }.mapNotNull { b.sticker[it.key] }
                val days = dailyStreak(st.days, today)
                Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    PromptBar(if (done) DT.doneToday else DT.intro)
                    BoxWithConstraints(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        val s = min(min(maxWidth, maxHeight) * 0.85f, 260.dp)
                        if (done && todays.isNotEmpty()) StickerArt(todays.first(), s) else Gift(s)
                    }
                    if (days > 0) StreakLine(days)
                    val buttons = @Composable {
                        KidButton((if (done) DT.again else DT.start).tx, { phase = "play"; run++ }, icon = Icons.Rounded.PlayArrow, primary = true)
                        KidButton(DT.book.tx, { app.go("play/stickers") }, icon = Icons.Rounded.MenuBook)
                    }
                    if (LocalWindow.current.isPhone && !LocalWindow.current.landscape) Column(verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) { buttons() }
                    else Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { buttons() }
                }
            }
            "play" -> {
                val s = steps
                if (s.isNullOrEmpty()) EarlyLoading()
                else key(run, WL.lang) {
                    Challenge(b, s) {
                        val wasDone = done
                        scope.launch {
                            got = if (wasDone) null else stickers.give("daily", true)
                            phase = "done"
                        }
                    }
                }
            }
            else -> Unwrapped(got, dailyStreak(st.days + today, today), onBook = { app.go("play/stickers") }, onBack = { phase = "intro" })
        }
    }
}

@Composable
private fun StreakLine(days: Int) {
    Row(
        Modifier.clip(RoundedCornerShape(999.dp)).background(WL.colors.games).padding(horizontal = 14.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Emoji3D("⭐", Modifier.size(24.dp))
        Text("${DT.streak.tx}: $days", style = MaterialTheme.typography.titleMedium, color = WL.colors.gamesInk)
    }
}

/** The wrapped gift (3D), gently wiggling. */
@Composable
private fun Gift(size: Dp) {
    val reduce = LocalReduceMotion.current
    val rot = remember { Animatable(0f) }
    LaunchedEffect(reduce) {
        if (reduce) return@LaunchedEffect
        while (true) {
            delay(1700)
            for (a in listOf(-6f, 6f, -3f, 0f)) rot.animateTo(a, tween(140))
        }
    }
    Box(Modifier.graphicsLayer { rotationZ = rot.value; transformOrigin = androidx.compose.ui.graphics.TransformOrigin(0.5f, 0.9f) }) {
        Emoji3D("🎁", Modifier.size(size))
    }
}

@Composable
private fun Unwrapped(s: Sticker?, days: Int, onBook: () -> Unit, onBack: () -> Unit) {
    val say = rememberSay()
    val reduce = LocalReduceMotion.current
    val pop = remember { Animatable(if (reduce) 1f else 0.2f) }
    LaunchedEffect(Unit) {
        EarlyFx.celebrate(); Sfx.play("success")
        say(if (s != null) L("${DT.unwrap.en} You got a sticker: ${s.name.en}!", "${DT.unwrap.get("te")} నీకు స్టిక్కర్ వచ్చింది: ${s.name.get("te")}!") else UI.allDone)
        if (!reduce) pop.animateTo(1f, spring(dampingRatio = 0.4f, stiffness = 260f))
    }
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) {
        Text((if (s != null) DT.unwrap else UI.allDone).tx, style = MaterialTheme.typography.headlineMedium.copy(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid), color = WL.colors.text, textAlign = TextAlign.Center)
        if (s != null) BoxWithConstraints(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
            StickerArt(s, min(min(maxWidth, maxHeight) * 0.85f, 240.dp), Modifier.graphicsLayer { scaleX = pop.value; scaleY = pop.value })
        }
        if (s != null) Text(s.name.tx, style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
        if (days > 0) StreakLine(days)
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            KidButton(DT.book.tx, onBook, icon = Icons.Rounded.MenuBook, primary = true)
            KidButton(UI.back.tx, onBack, icon = Icons.AutoMirrored.Rounded.ArrowBack)
        }
    }
}

private fun stepPrompt(b: EarlyBundle, s: DailyStep): Localized = when (s.kind) {
    "pattern" -> s.pattern?.let { patPrompt(it) } ?: UI.next
    "opposite" -> s.opposite?.let { oppPrompt(it) } ?: UI.next
    "mix" -> { val c = s.quiz?.let { b.mixColours[it.target] }; L("${DT.mixAsk.en} ${c?.en?.lowercase() ?: ""}?", "${DT.mixAsk.get("te")} ${c?.name?.get("te") ?: ""}?") }
    else -> DT.listen
}

@Composable
private fun Challenge(b: EarlyBundle, steps: List<DailyStep>, onDone: () -> Unit) {
    val say = rememberSay()
    val record = rememberRecord("daily")
    val scope = rememberCoroutineScope()
    val player = remember { SafariPlayer() }
    DisposableEffect(Unit) { onDispose { player.stop() } }
    var idx by rememberSaveable { mutableStateOf(0) }
    var wrong by rememberActJson<List<String>> { emptyList() }
    var solved by rememberSaveable { mutableStateOf(false) }
    val step = steps[idx.coerceIn(0, steps.size - 1)]
    val prompt = stepPrompt(b, step)
    Narrate(prompt, idx)
    LaunchedEffect(idx) { step.safari?.let { r -> delay(2200); player.play(b, r.target, scope) } }

    fun answer(key: String, ok: Boolean, praise: Localized) {
        if (solved) return
        record(step.kind, ok, if (wrong.size >= 2) 1 else 0)
        if (ok) { solved = true; Sfx.play("sparkle"); say(praise) }
        else { Sfx.play("pop"); wrong = wrong + key; say(L("Try again! ${prompt.en}", "మళ్ళీ ప్రయత్నించు! ${prompt.get("te")}")) }
    }
    fun next() {
        player.stop()
        if (idx + 1 >= steps.size) { onDone(); return }
        idx++; wrong = emptyList(); solved = false
    }

    var praise: Localized = L("Well done!", "భలే!")
    var hero: (@Composable (Modifier) -> Unit)? = null
    var top: @Composable () -> Unit = {}
    var choices: @Composable (Modifier) -> Unit = {}
    val pr = step.pattern; val op = step.opposite; val q = step.quiz; val sf = step.safari
    when {
        pr != null -> {
            praise = patPraise(b, pr)
            val pp = praise
            hero = { m -> PatternRow(b, pr, solved, m) }
            choices = { m ->
                FitGrid(pr.choices.size, m, maxCell = 220.dp) { i, _ ->
                    val t = pr.choices[i]
                    PicButton(t, b.tokenName(t).tx, { answer(t, t == pr.answer, pp) }, Modifier.fillMaxSize(), state = pickState(t, pr.answer, solved, wrong), enabled = !solved, showLabel = true)
                }
            }
        }
        op != null -> {
            praise = L("Yes, ${op.ask.word.en}!", "అవును, ${op.ask.word.get("te")}!")
            val pp = praise
            val shown = op.shown
            if (op.kind == "opposite" && shown != null) hero = { m -> OppHero(b, shown, m) }
            choices = { m ->
                FitGrid(op.choices.size, m, maxCell = 240.dp) { i, _ ->
                    val s = op.choices[i]
                    val stt = pickState(s.key, op.ask.key, solved, wrong)
                    OppPick(b, s, { answer(s.key, s.key == op.ask.key, pp) }, stt, !solved, solved || wrong.contains(s.key), Modifier.fillMaxSize())
                }
            }
        }
        q != null -> {
            val c = b.mixColours[q.target]
            val right = q.options.getOrNull(q.answer) ?: emptyList()
            val names = right.map { b.mixColours[it]?.name ?: L(it, it) }
            praise = L("Yes! ${names.joinToString(" and ") { it.en }} make ${c?.en?.lowercase() ?: ""}.", "అవును! ${names.joinToString(", ") { it.get("te") }} కలిపితే ${c?.name?.get("te") ?: ""}.")
            val pp = praise
            hero = { m ->
                BoxWithConstraints(m, contentAlignment = Alignment.Center) {
                    val sw = min(min(maxWidth, maxHeight) * 0.6f, 160.dp)
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Swatch(c?.hex ?: "#888", sw)
                        Text(c?.name?.tx ?: "", style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
                    }
                }
            }
            choices = { m ->
                FitGrid(q.options.size, m, aspect = 2.2f, maxCell = 300.dp, fixedCols = 1) { i, _ ->
                    val opt = q.options[i]
                    val key = "$i"
                    val lang = WL.lang
                    PicButton(key, opt.joinToString(" + ") { (b.mixColours[it]?.name ?: L(it, it)).get(lang) }, { answer(key, i == q.answer, pp) }, Modifier.fillMaxSize(),
                        state = pickState(key, "${q.answer}", solved, wrong), enabled = !solved,
                        picture = { sz -> MixOption(b, opt, sz) })
                }
            }
        }
        sf != null -> {
            val t = b.safariById[sf.target]
            praise = L("Yes! The ${t?.name?.en?.lowercase() ?: ""}.", "అవును! ${t?.name?.get("te") ?: ""}.")
            val pp = praise
            top = { KidButton(DT.hear.tx, { player.play(b, sf.target, scope) }, icon = Icons.AutoMirrored.Rounded.VolumeUp, primary = true) }
            choices = { m ->
                FitGrid(sf.choices.size, m, maxCell = 240.dp) { i, _ ->
                    val id = sf.choices[i]
                    val s = b.safariById[id] ?: return@FitGrid
                    PicButton(s.art, s.name.tx, {
                        val ok = id == sf.target
                        if (!ok) scope.launch { delay(700); player.play(b, id, scope) }
                        answer(id, ok, pp)
                    }, Modifier.fillMaxSize(), state = pickState(id, sf.target, solved, wrong), enabled = !solved, showLabel = true)
                }
            }
        }
    }
    val last = idx + 1 >= steps.size
    val pp = praise
    QuizLayout(
        dots = { RoundDots(idx, maxOf(steps.size, b.dailySteps)) },
        prompt = { PromptBar(prompt); top() },
        hero = hero,
        heroWeight = 0.35f,
        choices = choices,
        footer = {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically) {
                if (solved || wrong.isNotEmpty()) EarlyFeedback(solved, wrong.size, Modifier.weight(1f, fill = false), extra = if (solved) pp.tx else null)
                if (solved) {
                    if (last) KidButton(DT.open.tx, { next() }, icon = Icons.Rounded.AutoAwesome, primary = true) else NextButton({ next() })
                }
            }
        },
    )
}

/** "red + yellow" with swatches. */
@Composable
private fun MixOption(b: EarlyBundle, paints: List<String>, size: Dp) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        paints.forEachIndexed { k, p ->
            if (k > 0) Text("+", style = MaterialTheme.typography.headlineMedium, color = WL.colors.text)
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Swatch(b.mixColours[p]?.hex ?: "#888", size * 0.55f)
                Text((b.mixColours[p]?.name ?: L(p, p)).tx, style = MaterialTheme.typography.titleSmall, color = WL.colors.text, maxLines = 1)
            }
        }
    }
}
