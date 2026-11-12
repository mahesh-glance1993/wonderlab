package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.MenuBook
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PanTool
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Replay
import androidx.compose.material.icons.rounded.SkipNext
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameMillis
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.min
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.FitToScreen
import com.maheshglance.wonderlab.core.design.LocalReduceMotion
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLFonts
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

/*
 * Story Time (/play/stories, /play/stories/:storyId): interactive picture stories with read-aloud, karaoke
 * highlight, page animations with synced sound effects, tap / counting moments and picture questions —
 * a native port of StoryTime.tsx + useStoryMotion.ts. Characters are realistic 3D pictures that move;
 * props that change (the pot's water, the growing tree…) keep the website's drawings, which blink their eyes.
 */

@Serializable
data class StoriesState(val pages: Map<String, Int> = emptyMap(), val done: List<String> = emptyList(), val autoTurn: Boolean? = null)

private val NUM_WORDS = listOf(
    L("zero", "సున్నా"), L("one", "ఒకటి"), L("two", "రెండు"), L("three", "మూడు"), L("four", "నాలుగు"), L("five", "ఐదు"),
    L("six", "ఆరు"), L("seven", "ఏడు"), L("eight", "ఎనిమిది"), L("nine", "తొమ్మిది"), L("ten", "పది"),
)
private const val ANIM_FALLBACK_MS = 900L

private fun kidStyle(size: Int, lang: String) = TextStyle(fontFamily = if (lang == "te") WLFonts.telugu else WLFonts.kid, fontWeight = FontWeight.Bold, fontSize = size.sp, lineHeight = (size * 1.3f).sp)

// =============================================================================================
// Story list
// =============================================================================================

@Composable
fun StoryListScreen() {
    val app = LocalApp.current
    val saved = rememberSaved("stories", StoriesState.serializer(), StoriesState())
    TrackLast("/play/stories", UI.stories)
    EarlyScreen(UI.stories.tx, { app.back() }) { b ->
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            PromptBar(L("Pick a story!", "ఒక కథ ఎంచుకో!"), maxLines = 1)
            FitGrid(b.stories.size, Modifier.weight(1f).fillMaxWidth(), gap = 8.dp, aspect = 1.05f, maxCell = 220.dp) { i, _ ->
                val s = b.stories[i]
                val p = saved.value.pages[s.id]
                val sub = if (s.id in saved.value.done) "✓" else if (p != null && p > 0) "${minOf(p + 1, s.pages.size)} / ${s.pages.size}" else null
                BigTile(s.cover, s.title, { app.go("play/stories/${s.id}") }, Modifier.fillMaxSize(), tint = tint(listOf("art", "math", "lab", "next")[i % 4]), sub = sub)
            }
        }
    }
}

// =============================================================================================
// Reader
// =============================================================================================

@Composable
fun StoryReaderScreen(storyId: String) {
    val app = LocalApp.current
    val b = EarlyContent.bundle
    val story = b?.story?.get(storyId)
    val title = story?.title?.tx ?: UI.stories.tx
    LaunchedEffect(b, story) { if (b != null && story == null) { app.nav.popBackStack(); app.go("play/stories") } }
    DisposableEffect(Unit) { onDispose { app.speech.stop() } }
    EarlyScreen(title, { app.back() }) { bundle ->
        val st = bundle.story[storyId] ?: return@EarlyScreen
        Reader(bundle, st)
    }
}

@Composable
private fun Reader(b: EarlyBundle, story: Story) {
    val app = LocalApp.current
    val say = rememberSay()
    val badge = rememberBadge()
    val saved = rememberSaved("stories", StoriesState.serializer(), StoriesState())
    TrackLast("/play/stories/${story.id}", story.title)
    val n = story.pages.size
    var page by rememberSaveable(story.id) {
        val p = saved.value.pages[story.id] ?: 0
        mutableIntStateOf(if (p >= n + story.questions.size || p < 0) 0 else minOf(p, n))
    }
    var finished by rememberSaveable(story.id) { mutableStateOf(false) }

    val go = { p: Int ->
        page = p
        saved.update { it.copy(pages = it.pages + (story.id to p)) }
    }
    val finish = {
        finished = true
        EarlyFx.celebrate()
        say(L("The end! You finished “${story.title.en}”.", "కథ అయిపోయింది! “${story.title.te ?: story.title.en}” పూర్తి చేశావు."))
        val done = (saved.current().done + story.id).distinct()
        saved.update { it.copy(done = (it.done + story.id).distinct(), pages = it.pages + (story.id to 0)) }
        badge("play:story:${story.id}", story.title)
        if (done.isNotEmpty()) badge("play:first-story", null)
        if (done.size >= 5) badge("play:5-stories", null)
    }

    when {
        finished -> TheEnd(story, onAgain = { finished = false; go(0) }, onMore = { app.back() })
        page < n -> {
            val motion = b.motion[story.id]?.getOrNull(page)
            androidx.compose.runtime.key(story.id, page, WL.lang) {
                StoryPageView(
                    b, story.pages[page], motion, page, n, autoTurn = saved.value.autoTurn == true,
                    onAutoTurn = { on -> saved.update { it.copy(autoTurn = on) } },
                    onBack = if (page > 0) ({ com.maheshglance.wonderlab.core.audio.Tones.tap(); go(page - 1) }) else null,
                    onNext = { com.maheshglance.wonderlab.core.audio.Tones.tap(); go(page + 1) },
                )
            }
        }
        else -> Questions(b, story, onBack = { go(n - 1) }, onDone = finish)
    }
}

@Composable
private fun TheEnd(story: Story, onAgain: () -> Unit, onMore: () -> Unit) {
    val reduce = LocalReduceMotion.current
    val s = remember { Animatable(if (reduce) 1f else 0.3f) }
    LaunchedEffect(Unit) { if (!reduce) s.animateTo(1f, androidx.compose.animation.core.spring(dampingRatio = 0.4f, stiffness = 260f)) }
    BoxWithConstraints(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        val pic = min(maxHeight * 0.3f, 170.dp)
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Emoji3D("⭐", Modifier.size(pic * 0.6f).graphicsLayer { scaleX = s.value; scaleY = s.value })
                PicArt(story.cover, pic, label = story.title.tx)
            }
            Text(L("The end!", "కథ అయిపోయింది!").tx, style = MaterialTheme.typography.headlineMedium.copy(fontFamily = if (WL.lang == "te") WLFonts.telugu else WLFonts.kid), color = WL.colors.text, textAlign = TextAlign.Center)
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                KidButton(L("Read again", "మళ్ళీ చదువు").tx, onAgain, icon = Icons.Rounded.Replay, primary = true)
                KidButton(L("More stories", "ఇంకా కథలు").tx, onMore, icon = Icons.Rounded.MenuBook)
            }
        }
    }
}

private data class PlayState(
    val shown: Set<String> = emptySet(), val hidden: Set<String> = emptySet(), val v: Map<String, String> = emptyMap(),
    val moved: Map<String, Pair<Float, Float>> = emptyMap(), val counted: List<String> = emptyList(), val done: Boolean = false,
    val reactId: String? = null, val reactN: Int = 0,
)

/** Every look (`v`) an actor can take on this page — decides whether it can be a 3D picture. */
private fun variantsOf(a: Actor, page: StoryPage, pm: PageMotion?): Set<String?> {
    val out = mutableSetOf(a.v)
    pm?.init?.get(a.id)?.let { out += it }
    pm?.sets?.filter { it.actor == a.id }?.forEach { out += it.v }
    val act = page.act
    if (act != null) {
        act.set?.get(a.id)?.let { out += it }
        if (act.kind == "count" && act.each == "set" && a.id in act.actors) act.eachV?.let { out += it }
        if (act.kind == "count" && act.level == a.id) for (k in 1..act.actors.size + 1) out += k.toString()
    }
    return out
}

@Composable
private fun StoryPageView(b: EarlyBundle, page: StoryPage, motion: PageMotion?, index: Int, total: Int, autoTurn: Boolean, onAutoTurn: (Boolean) -> Unit, onBack: (() -> Unit)?, onNext: () -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val lang = WL.lang
    val reduced = LocalReduceMotion.current
    val scope = rememberCoroutineScope()
    val text = page.text.get(lang)
    val words = remember(text) { text.split(Regex("\\s+")).filter { it.isNotBlank() } }
    val clock = remember(page, motion) { PageClock(motion, reduced, scope) }
    var ps by remember(page) { mutableStateOf(PlayState()) }
    var bubble by remember(page) { mutableStateOf<String?>(null) }
    var speaking by remember { mutableStateOf(false) }
    var held by remember { mutableStateOf(false) }
    var word by remember { mutableIntStateOf(-1) }
    val armed = remember { object { var karaoke = false; var anim = false; var narrCut = false; var fallback: Job? = null; var karaokeJob: Job? = null; var timings: List<Int> = emptyList() } }

    // drawings for this page (one engine call), sounds rendered ahead, word timings
    val allActors = page.actors + (motion?.extras ?: emptyList())
    val emojiOf = remember(page, motion) { allActors.associate { a -> a.id to emojiForAll(b, a.art, variantsOf(a, page, motion)) } }
    LaunchedEffect(page) {
        val keys = allActors.filter { emojiOf[it.id] == null }.flatMap { a -> variantsOf(a, page, motion).map { a.art to it } }
        SvgStore.preloadArts(app.engine, keys)
    }
    LaunchedEffect(motion) {
        if (motion != null) Sfx.prewarm(listOf(motion.bed) + motion.cues.map { it.sfx } + motion.tap.values.flatMap { t -> t.cues.map { it.sfx } })
    }
    LaunchedEffect(text) { armed.timings = app.engine.early<List<Int>>("wordTimings", text) ?: emptyList() }

    // frame loop drives the page clock (and tap animations / blinking)
    LaunchedEffect(clock) { while (true) withFrameMillis { clock.tick(nowMs()) } }
    DisposableEffect(clock) { onDispose { clock.stopSounds() } }

    // quiet looping background for the whole page, silent while paused
    val paused = clock.status == MotionStatus.Paused
    DisposableEffect(motion?.bed, paused) {
        val h = motion?.bed?.takeIf { !paused }?.let { Sfx.ambience(it) }
        onDispose { h?.stop() }
    }

    // narration starts the animation and the karaoke highlight
    LaunchedEffect(clock) {
        app.speech.speaking.collect { on ->
            speaking = on
            armed.karaokeJob?.cancel()
            if (on && armed.karaoke && !reduced) {
                armed.karaoke = false
                val tm = armed.timings
                armed.karaokeJob = scope.launch {
                    for ((i, ms) in tm.withIndex()) { word = i; delay(ms.toLong()) }
                    delay(200); word = -1
                }
            } else { armed.karaoke = false; word = -1 }
            if (on && armed.anim) { armed.anim = false; clock.start() }
        }
    }
    val read = {
        armed.karaoke = true
        armed.anim = true
        armed.fallback?.cancel()
        armed.fallback = scope.launch { delay(ANIM_FALLBACK_MS); if (armed.anim) { armed.anim = false; clock.start() } }
        say(page.text)
    }
    LaunchedEffect(page) { delay(300); read() }

    val replay = {
        held = false
        armed.narrCut = false
        app.speech.stop()
        clock.reset()
        read()
    }
    val pauseAll = {
        armed.narrCut = speaking
        armed.anim = false
        armed.fallback?.cancel()
        app.speech.stop()
        clock.pause()
        held = true
    }
    val playAll = {
        held = false
        if (clock.status == MotionStatus.Paused) {
            clock.resume()
            if (armed.narrCut) { armed.narrCut = false; armed.karaoke = true; say(page.text) }
        } else replay()
    }
    val busy = !held && (clock.status == MotionStatus.Running || speaking)

    // optional auto-turn a few seconds after the animation and narration have finished
    val animDone = clock.status == MotionStatus.Done
    LaunchedEffect(autoTurn, animDone, speaking, held, ps) {
        if (autoTurn && animDone && !speaking && !held) { delay(b.autoTurnMs); onNext() }
    }

    val act = page.act
    val visible = { a: Actor -> if (a.hidden) a.id in ps.shown else a.id !in ps.hidden }
    val tappable = remember(act) { if (act == null) emptySet() else if (act.kind == "tap") setOfNotNull(act.actor) else act.actors.toSet() }
    val nameOf = { a: Actor -> (b.pic[a.id]?.name ?: b.propNames[a.id] ?: b.pic[a.art]?.name ?: b.propNames[a.art] ?: L(a.art, a.art)).get(lang) }
    val tapSound = { a: Actor -> if (!clock.tap(a.id)) { (Sfx.forWord(a.id) ?: Sfx.forWord(a.art))?.let { Sfx.play(it) } } }

    val tapActor: (Actor) -> Unit = tap@{ a ->
        val ac = act ?: return@tap
        if (ac.kind == "tap") {
            ps = ps.copy(
                done = true, reactId = if (ac.react != null) a.id else null, reactN = ps.reactN + 1,
                shown = ps.shown + (ac.show ?: emptyList()), hidden = ps.hidden + (ac.hide ?: emptyList()),
                v = ps.v + (ac.set ?: emptyMap()), moved = ac.move?.let { ps.moved + (it.actor to (it.dx to it.dy)) } ?: ps.moved,
            )
            tapSound(a)
            say(ac.say); bubble = ac.say.get(lang)
            return@tap
        }
        if (a.id in ps.counted) { val k = ps.counted.indexOf(a.id) + 1; say(NUM_WORDS.getOrNull(k) ?: L("$k", "$k")); return@tap }
        val counted = ps.counted + a.id
        val all = counted.size == ac.actors.size
        ps = ps.copy(
            counted = counted, done = all,
            hidden = if (ac.each == "hide") ps.hidden + a.id else ps.hidden,
            v = ps.v + (if (ac.each == "set" && ac.eachV != null) mapOf(a.id to ac.eachV) else emptyMap()) + (if (ac.level != null) mapOf(ac.level to "${counted.size + 1}") else emptyMap()),
            shown = if (all && ac.show != null) ps.shown + ac.show else ps.shown,
        )
        tapSound(a)
        if (all) { clock.tap("@done"); say(ac.say); bubble = ac.say.get(lang) }
        else say(NUM_WORDS.getOrNull(counted.size) ?: L("${counted.size}", "${counted.size}"))
    }

    // ---------------- layout ----------------
    val stage = @Composable { m: Modifier ->
        StoryStage(b, page, motion, clock, ps, bubble, emojiOf, visible, tappable, nameOf, tapActor, held, reduced, m)
    }
    val textRow = @Composable {
        Row(
            Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(WL.colors.surface).padding(6.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            SpeakButton({ say(page.text) }, size = 48.dp)
            val hl = WL.colors.warnBg
            val annotated = buildAnnotatedString {
                words.forEachIndexed { i, w ->
                    if (i == word) withStyle(SpanStyle(background = hl, color = WL.colors.warn)) { append(w) } else append(w)
                    append(' ')
                }
            }
            FitText(annotated, Modifier.weight(1f), style = kidStyle(19, lang), color = WL.colors.text, maxLines = 4)
            CtlIcon(Icons.Rounded.MenuBook, L("Read to me", "చదివి వినిపించు").get(lang)) { read() }
        }
    }
    val hint = @Composable {
        if (act != null && !ps.done) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Icon(Icons.Rounded.PanTool, null, tint = WL.colors.accent, modifier = Modifier.size(20.dp))
            Text(act.prompt.get(lang) + if (act.kind == "count" && ps.counted.isNotEmpty()) " (${ps.counted.size})" else "", style = kidStyle(16, lang), color = WL.colors.accent, maxLines = 2)
        }
    }
    val controls = @Composable {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            CtlChip(if (busy) Icons.Rounded.Pause else Icons.Rounded.PlayArrow, (if (busy) L("Pause", "ఆపు") else L("Play", "ఆడించు")).get(lang), Modifier.weight(1f)) { if (busy) pauseAll() else playAll() }
            CtlChip(Icons.Rounded.Replay, L("Replay page", "మళ్ళీ చూపించు").get(lang), Modifier.weight(1f)) { replay() }
            CtlChip(if (autoTurn) Icons.Rounded.Check else Icons.Rounded.SkipNext, L("Turn pages by itself", "పేజీలు తానే తిరగాలి").get(lang), Modifier.weight(1.3f), on = autoTurn) { onAutoTurn(!autoTurn) }
        }
    }
    val nav = @Composable {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            KidButton(UI.back.tx, { onBack?.invoke() }, Modifier.weight(1f), icon = Icons.AutoMirrored.Rounded.ArrowBack, enabled = onBack != null)
            KidButton(UI.next.tx, onNext, Modifier.weight(1f), primary = act == null || ps.done, trailingIcon = Icons.AutoMirrored.Rounded.ArrowForward)
        }
    }

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val wide = maxWidth > maxHeight * 1.15f
        if (wide) {
            Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Box(Modifier.weight(1.45f).fillMaxHeight(), contentAlignment = Alignment.Center) { stage(Modifier) }
                FitToScreen(Modifier.weight(1f).fillMaxHeight()) {
                    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        RoundDots(index, total)
                        textRow(); hint(); controls(); nav()
                    }
                }
            }
        } else {
            Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                RoundDots(index, total)
                Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) { stage(Modifier) }
                textRow(); hint(); controls(); nav()
            }
        }
    }
    if (motion != null) Box(Modifier.size(1.dp).semantics { contentDescription = "${L("What’s happening:", "ఏం జరుగుతోంది:").get(lang)} ${motion.what.get(lang)}" })
}

/** The 400×260 stage scaled to fit: backdrop, actors with their motion, tap spots and the speech bubble. */
@Composable
private fun StoryStage(
    b: EarlyBundle, page: StoryPage, motion: PageMotion?, clock: PageClock, ps: PlayState, bubble: String?, emojiOf: Map<String, String?>,
    visible: (Actor) -> Boolean, tappable: Set<String>, nameOf: (Actor) -> String, tapActor: (Actor) -> Unit, held: Boolean, reduced: Boolean, modifier: Modifier,
) {
    BoxWithConstraints(modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        val w = min(maxWidth, maxHeight * (400f / 260f))
        val h = w * (260f / 400f)
        val k = w / 400f // dp per stage unit
        val bg = rememberSvg("bg:${page.bg}", "svgBackdrop", page.bg)
        val lang = WL.lang
        Box(Modifier.size(w, h).clip(RoundedCornerShape(18.dp)).background(Color(0xFFCFE6F2)).semantics { contentDescription = page.text.get(lang) }) {
            Canvas(Modifier.fillMaxSize()) {
                if (bg != null) drawSvg(bg, 0f, 0f, 400f, 260f)
                // gentle depth: light from the sky, soft shade on the ground, a quiet vignette
                drawRect(Brush.verticalGradient(0f to Color.White.copy(alpha = 0.22f), 0.45f to Color.Transparent, endY = size.height))
                drawRect(Brush.verticalGradient(0.7f to Color.Transparent, 1f to Color.Black.copy(alpha = 0.14f), startY = 0f, endY = size.height))
                drawRect(Brush.radialGradient(0.65f to Color.Transparent, 1f to Color.Black.copy(alpha = 0.10f), center = Offset(size.width / 2, size.height / 2), radius = size.maxDimension * 0.75f))
            }
            val extras = motion?.extras ?: emptyList()
            extras.filter { it.back }.forEachIndexed { i, a -> StoryActor(b, a, i, true, clock, ps, emojiOf[a.id], true, k, held, reduced, page.act?.react) }
            page.actors.forEachIndexed { i, a -> StoryActor(b, a, i, false, clock, ps, emojiOf[a.id], visible(a), k, held, reduced, page.act?.react) }
            extras.filter { !it.back }.forEachIndexed { i, a -> StoryActor(b, a, i, true, clock, ps, emojiOf[a.id], true, k, held, reduced, page.act?.react) }
            // tap spots (big, invisible circles over the tappable actors)
            for (a in page.actors) {
                if (a.id !in tappable || !visible(a)) continue
                val (dx, dy) = ps.moved[a.id] ?: (0f to 0f)
                val size = maxOf(64.dp, k * (80f * (a.s ?: 1f) * 0.9f))
                val ci = ps.counted.indexOf(a.id)
                Box(
                    Modifier.offset(k * (a.x + dx) - size / 2, k * (a.y + dy) - size / 2).size(size).clip(CircleShape)
                        .pressable(role = Role.Button) { tapActor(a) }
                        .semantics { contentDescription = nameOf(a) + if (ci >= 0) " ${ci + 1}" else "" },
                ) {
                    if (ci >= 0 && page.act?.kind == "count" && page.act?.each != "hide") Box(
                        Modifier.align(Alignment.TopEnd).size(38.dp).clip(CircleShape).background(WL.colors.primary).border(2.dp, Color.White, CircleShape),
                        contentAlignment = Alignment.Center,
                    ) { Text("${ci + 1}", color = WL.colors.primaryInk, fontWeight = FontWeight.Bold, fontSize = 20.sp) }
                }
            }
            AnimatedVisibility(bubble != null, Modifier.align(Alignment.BottomCenter).padding(8.dp), enter = fadeIn(), exit = fadeOut()) {
                Text(
                    bubble ?: "", Modifier.clip(RoundedCornerShape(18.dp)).background(Color(0xF2FBFAF6)).padding(horizontal = 14.dp, vertical = 6.dp),
                    style = kidStyle(17, lang), color = Color(0xFF1D2540), textAlign = TextAlign.Center, maxLines = 2,
                )
            }
        }
    }
}

/** One actor: placed at its resting point, moved by the page / tap animation, wiggles or jumps when tapped. */
@Composable
private fun StoryActor(b: EarlyBundle, a: Actor, i: Int, isExtra: Boolean, clock: PageClock, ps: PlayState, emoji: String?, show: Boolean, k: Dp, held: Boolean, reduced: Boolean, react: String?) {
    val (mdx, mdy) = ps.moved[a.id] ?: (0f to 0f)
    val dx by animateFloatAsState(mdx, if (reduced) tween(0) else tween(800, easing = STORY_EASE), label = "mx")
    val dy by animateFloatAsState(mdy, if (reduced) tween(0) else tween(800, easing = STORY_EASE), label = "my")
    val hideDelay = if (!show) clock.tapDelay(a.id).toInt() else 0
    val vis by animateFloatAsState(if (show) 1f else 0f, if (reduced) tween(0) else tween(450, delayMillis = hideDelay, easing = STORY_EASE), label = "vis")
    // tap reaction (el-react wiggle / jump, 0.6 s)
    val reactP = remember { Animatable(1f) }
    LaunchedEffect(ps.reactN, ps.reactId) {
        if (ps.reactId == a.id && react != null && !reduced) { reactP.snapTo(0f); reactP.animateTo(1f, tween(600, easing = STORY_EASE)) }
    }
    val box = k * (100f * 0.8f * (a.s ?: 1f))
    val v = ps.v[a.id] ?: clock.v[a.id] ?: a.v
    Box(
        Modifier.offset(k * (a.x + dx) - box / 2, k * (a.y + dy) - box / 2).size(box)
            .graphicsLayer {
                val p = clock.pose(a.id)
                val unit = k.toPx()
                if (p != null) {
                    translationX = p.x * unit; translationY = p.y * unit; rotationZ = p.r
                    scaleX = p.s * p.sx; scaleY = p.s * p.sy
                }
                alpha = vis * (p?.o ?: 1f)
                transformOrigin = if (clock.origin(a.id) == "bottom") TransformOrigin(0.5f, 1f) else TransformOrigin.Center
            }
            .graphicsLayer {
                val t = reactP.value
                if (t < 1f && react != null) {
                    if (react == "wiggle") rotationZ = when { t < 0.25f -> -5f * (t / 0.25f); t < 0.75f -> -5f + 10f * ((t - 0.25f) / 0.5f); else -> 5f * (1 - (t - 0.75f) / 0.25f) }
                    else translationY = -0.14f * size.height * (if (t < 0.4f) t / 0.4f else (1 - t) / 0.6f)
                }
                if (a.flip) scaleX = -1f
            },
    ) {
        if (emoji != null) Emoji3D(emoji, Modifier.fillMaxSize().padding(box * 0.04f))
        else {
            Crossfade(v, animationSpec = tween(if (reduced) 0 else 600), label = "look") { vv ->
                SvgArt(rememberArtSvg(a.art, vv), Modifier.fillMaxSize())
            }
            val blink = b.blink[a.art]
            if (blink != null && !isExtra && !reduced) Lids(blink, i, clock, held)
        }
    }
}

/** Eyelids that close briefly a few times (el-blink: 4 s cycle, 5 times, starting 1.2 s + a little per actor). */
@Composable
private fun Lids(blink: Blink, i: Int, clock: PageClock, held: Boolean) {
    val lid = hexColor(blink.c)
    val delayS = 1.2f + ((i * 0.9f) % 3f)
    Canvas(Modifier.fillMaxSize()) {
        if (held) return@Canvas
        val tt = (clock.frame - clock.born) / 1000f - delayS
        if (tt < 0f || tt >= 20f) return@Canvas
        val p = (tt % 4f) / 4f
        val sc = when { p < 0.92f -> 0f; p < 0.96f -> STORY_EASE.transform((p - 0.92f) / 0.04f); else -> STORY_EASE.transform((1f - p) / 0.04f) }
        if (sc <= 0f) return@Canvas
        val u = size.minDimension / 100f
        for (e in blink.e) {
            if (e.size < 3) continue
            val r = (e[2] + 0.6f) * u
            val cx = size.width / 2 + e[0] * u; val cy = size.height / 2 + e[1] * u
            drawOval(lid, Offset(cx - r, cy - r), Size(r * 2, r * 2 * sc))
        }
    }
}

@Composable
private fun CtlChip(icon: ImageVector, text: String, modifier: Modifier = Modifier, on: Boolean = false, onClick: () -> Unit) {
    val c = WL.colors
    Row(
        modifier.heightIn(min = 52.dp).clip(RoundedCornerShape(16.dp)).background(if (on) c.goodBg else c.surface)
            .border(if (on) 3.dp else 1.5.dp, if (on) c.good else c.line, RoundedCornerShape(16.dp))
            .pressable(role = Role.Button, onClick = onClick).padding(horizontal = 8.dp, vertical = 4.dp)
            .semantics { contentDescription = text },
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally),
    ) {
        Icon(icon, null, tint = if (on) c.good else c.text, modifier = Modifier.size(22.dp))
        FitText(text, style = MaterialTheme.typography.labelMedium, color = if (on) c.good else c.text, maxLines = 2, textAlign = TextAlign.Center)
    }
}

@Composable
private fun CtlIcon(icon: ImageVector, label: String, onClick: () -> Unit) {
    Box(
        Modifier.size(48.dp).clip(CircleShape).background(WL.colors.surface2).pressable(role = Role.Button, onClick = onClick).semantics { contentDescription = label },
        contentAlignment = Alignment.Center,
    ) { Icon(icon, null, tint = WL.colors.text, modifier = Modifier.size(24.dp)) }
}

// =============================================================================================
// Questions after the story
// =============================================================================================

private fun choiceLabel(b: EarlyBundle, c: String, labels: Map<String, L>?): L {
    labels?.get(c)?.let { return it }
    if (c.startsWith("num:")) { val k = c.removePrefix("num:").toIntOrNull() ?: 0; val w = NUM_WORDS.getOrNull(k); return L("$k (${w?.en ?: k})", "$k (${w?.te ?: k})") }
    return b.pic[c]?.name ?: b.propNames[c] ?: L(c, c)
}

@Composable
private fun Questions(b: EarlyBundle, story: Story, onBack: () -> Unit, onDone: () -> Unit) {
    val say = rememberSay()
    val record = rememberRecord("stories")
    var qi by rememberSaveable(story.id) { mutableIntStateOf(0) }
    var wrong by remember(qi) { mutableStateOf(listOf<String>()) }
    var solved by remember(qi) { mutableStateOf(false) }
    val q = story.questions.getOrNull(qi) ?: run { LaunchedEffect(Unit) { onDone() }; return }
    Narrate(q.q, qi)
    val pick = { c: String ->
        if (!solved) {
            val ok = c == q.answer
            record("${story.id}:q$qi", ok, if (wrong.size >= 2) 1 else 0)
            if (ok) { solved = true; val l = choiceLabel(b, c, q.labels); say(L("${UI.wellDone.en} ${l.en}!", "${UI.wellDone.te} ${l.te ?: l.en}!")) }
            else { wrong = wrong + c; say(UI.tryAgain) }
        }
    }
    val stateOf = { c: String -> if (solved && c == q.answer) Pick.Right else if (c in wrong) Pick.Wrong else if (wrong.size >= 2 && c == q.answer) Pick.Hint else null }
    val next = { if (qi + 1 >= story.questions.size) onDone() else { qi += 1 } }
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        RoundDots(qi, story.questions.size)
        PromptBar(q.q)
        FitGrid(q.choices.size, Modifier.weight(1f).fillMaxWidth(), gap = 12.dp, maxCell = 260.dp) { i, _ ->
            val c = q.choices[i]
            val lab = choiceLabel(b, c, q.labels)
            Box(Modifier.fillMaxSize()) {
                PicButton(c, lab.tx, { pick(c) }, Modifier.fillMaxSize(), state = stateOf(c), enabled = !solved, showLabel = true)
                SpeakButton({ say(lab) }, Modifier.align(Alignment.TopStart).padding(6.dp), size = 44.dp)
            }
        }
        if (solved || wrong.isNotEmpty()) EarlyFeedback(solved, wrong.size)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            KidButton(UI.back.tx, { if (qi == 0) onBack() else { qi -= 1 } }, Modifier.weight(1f), icon = Icons.AutoMirrored.Rounded.ArrowBack)
            KidButton(UI.next.tx, next, Modifier.weight(1f), primary = solved, enabled = solved, trailingIcon = Icons.AutoMirrored.Rounded.ArrowForward)
        }
    }
}

