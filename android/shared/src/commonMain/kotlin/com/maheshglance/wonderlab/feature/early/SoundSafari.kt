package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.platform.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.VolumeOff
import androidx.compose.material3.Icon
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
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.feature.early.audio.SfxHandle
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

// Sound Safari: listen to a sound and pick what made it — animals, vehicles, or nature.
// When sound is muted a written clue is shown instead.
private object ST {
    val title = L("Sound Safari", "శబ్దాల సఫారీ")
    val pick = L("Let’s go on a sound safari! What shall we listen to?", "శబ్దాల సఫారీకి వెళ్దాం! ఏమి విందాం?")
    val ask = L("Listen! What makes this sound?", "విను! ఈ శబ్దం దేనిది?")
    val hear = L("Hear it again", "మళ్ళీ విను")
    val muted = L("Sound is off. Here is a clue:", "శబ్దం ఆపివేయబడింది. ఇదిగో ఒక సూచన:")
    val heard = L("Sounds heard", "విన్న శబ్దాలు")
    val notReady = L("These sounds are not ready yet.", "ఈ శబ్దాలు ఇంకా సిద్ధంగా లేవు.")
}
private const val SAFARI_ROUNDS = 6

@Serializable data class SafariSave(val adapt: Adapt = Adapt(), val heard: List<String> = emptyList(), val sets: Int = 0)

/** Plays safari sounds one at a time and remembers which picture is playing. */
class SafariPlayer {
    var playingId by mutableStateOf<String?>(null)
    private var handle: SfxHandle? = null
    fun play(b: EarlyBundle, id: String, scope: kotlinx.coroutines.CoroutineScope) {
        val src = b.safariById[id] ?: return
        handle?.stop()
        val h = Sfx.play(src.sfx)
        handle = h
        if (h != null) { playingId = id; scope.launch { h.await(); if (playingId == id) playingId = null } }
    }
    fun stop() { handle?.stop(); handle = null; playingId = null }
}

@Composable
fun SoundSafariScreen() {
    val app = LocalApp.current
    TrackLast("/play/safari", ST.title)
    val saved = rememberSaved("safari", SafariSave.serializer(), SafariSave())
    var group by rememberSaveable { mutableStateOf<String?>(null) }
    var run by rememberSaveable { mutableStateOf(0) }
    BackHandler(group != null) { group = null }
    EarlyScreen(ST.title.tx, { if (group != null) group = null else app.back() }) { b ->
        val available = remember(b) { b.safari.filter { Sfx.has(it.sfx) } }
        val g = group
        if (g == null) {
            val groups = b.safariGroups.filter { gr -> available.count { gr.id == "mix" || it.group == gr.id } >= 3 }
            Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                PromptBar(ST.pick)
                FitGrid(groups.size, Modifier.weight(1f).fillMaxWidth(), maxCell = 260.dp) { i, _ ->
                    val gr = groups[i]
                    BigTile(gr.cover, gr.title, { group = gr.id; run++ }, Modifier.fillMaxSize(), tint = tint(listOf("next", "math", "lab", "art")[i % 4]))
                }
                Text("${ST.heard.tx}: ${saved.value.heard.count { b.safariById.containsKey(it) }} / ${available.size}", style = MaterialTheme.typography.bodyLarge, color = WL.colors.muted)
            }
        } else key(g, run, WL.lang) {
            SafariSession(b, g, saved, onAgain = { run++ }, onMenu = { group = null })
        }
    }
}

@Composable
private fun SafariSession(b: EarlyBundle, group: String, saved: Saved<SafariSave>, onAgain: () -> Unit, onMenu: () -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("safari")
    val badge = rememberBadge()
    val stickers = rememberStickers()
    val scope = rememberCoroutineScope()
    val player = remember { SafariPlayer() }
    DisposableEffect(Unit) { onDispose { player.stop() } }
    val seed by rememberSaveable { mutableStateOf(newSeed()) }
    var idx by rememberSaveable { mutableStateOf(0) }
    var round by rememberActJson<SafariRound?> { null }
    var loaded by rememberSaveable { mutableStateOf(false) }
    var lastTarget by rememberSaveable { mutableStateOf<String?>(null) }
    var wrong by rememberActJson<List<String>> { emptyList() }
    var solved by rememberSaveable { mutableStateOf(false) }
    var finished by rememberSaveable { mutableStateOf(false) }
    var sticker by rememberActJson<Sticker?> { null }

    LaunchedEffect(idx) {
        if (round == null) {
            round = app.engine.early<SafariRound>("safariRound", roundSeed(seed, idx), group, saved.current().adapt.choices, Sfx.NAMES, lastTarget)
            loaded = true
        }
    }
    val r = round
    Narrate(if (finished || r == null) null else ST.ask, "$idx-${r != null}")
    SfxAfterNarration(if (finished) null else r?.target, "$idx-${r?.target}") { id -> player.play(b, id, scope) }

    if (finished) { DonePanel(onAgain, onMenu) { StickerReveal(sticker) }; return }
    if (r == null) { if (loaded) Text(ST.notReady.tx) else EarlyLoading(); return }
    val target = b.safariById[r.target] ?: return

    fun pick(id: String) {
        if (solved) return
        val ok = r.target == id
        val src = b.safariById[id] ?: return
        record("$group:${r.target}", ok, if (wrong.size >= 2) 1 else 0)
        val first = ok && wrong.isEmpty()
        scope.launch { app.engine.early<Adapt>("adapt", json(saved.current().adapt), ok, first, null)?.let { a -> saved.update { it.copy(adapt = a) } } }
        if (ok) {
            solved = true; Sfx.play("sparkle")
            saved.update { s -> s.copy(heard = if (s.heard.contains(id)) s.heard else s.heard + id) }
            say(L("Yes! That was the sound of the ${src.name.en.lowercase()}.", "అవును! అది ${src.name.get("te")} శబ్దం."))
        } else {
            wrong = wrong + id
            scope.launch { delay(900); player.play(b, id, scope) } // let them hear the difference
            say(L("No, that is the ${src.name.en.lowercase()}. Listen to its sound.", "కాదు, అది ${src.name.get("te")}. దాని శబ్దం విను."))
        }
    }
    fun next() {
        player.stop()
        if (idx + 1 >= SAFARI_ROUNDS) {
            finished = true; EarlyFx.celebrate(); Sfx.play("success"); say(UI.allDone)
            saved.update { it.copy(sets = it.sets + 1) }
            scope.launch { sticker = stickers.give("safari", false) }
            if (group == "nature") badge("play:safari-nature", L("Nature listener", "ప్రకృతి శ్రోత"))
            return
        }
        lastTarget = r.target; round = null; wrong = emptyList(); solved = false; idx++
    }
    QuizLayout(
        dots = { RoundDots(idx, SAFARI_ROUNDS) },
        prompt = {
            PromptBar(ST.ask)
            KidButton(ST.hear.tx, { player.play(b, r.target, scope) }, icon = Icons.AutoMirrored.Rounded.VolumeUp, primary = true)
            if (Tones.muted && target.clue != null) MutedClue(target.clue)
        },
        hero = null,
        choices = { m ->
            FitGrid(r.choices.size, m, maxCell = 240.dp) { i, _ ->
                val id = r.choices[i]
                val s = b.safariById[id] ?: return@FitGrid
                val st = pickState(id, r.target, solved, wrong)
                PicButton(s.art, s.name.tx, { pick(id) }, Modifier.fillMaxSize(), state = st, enabled = !solved, showLabel = true,
                    bg = if (player.playingId == id && id != r.target) WL.colors.math else null)
            }
        },
        footer = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                if (solved) KidButton(target.name.tx, { player.play(b, r.target, scope) }, icon = Icons.AutoMirrored.Rounded.VolumeUp)
            }
            QuizFooter(solved, wrong.size, { next() }, extra = if (solved) target.name.tx else null)
        },
    )
}

/** "Sound is off. Here is a clue: “Moo, moo!”" */
@Composable
fun MutedClue(clue: Localized) {
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(WL.colors.warnBg).padding(10.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Icon(Icons.Rounded.VolumeOff, null, tint = WL.colors.warn)
        Text("${ST.muted.tx} “${clue.tx}”", style = MaterialTheme.typography.titleMedium, color = WL.colors.warn)
    }
}
