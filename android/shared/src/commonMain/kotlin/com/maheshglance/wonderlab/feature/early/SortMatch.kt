package com.maheshglance.wonderlab.feature.early

import com.maheshglance.wonderlab.core.design.FitText

import com.maheshglance.wonderlab.core.platform.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.PanTool
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.feature.early.audio.Sfx
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer

// Sort & Match: sort by colour / size / kind (tap a picture, then tap a basket), and match pairs
// (mother & baby, object & shadow).

@Serializable
data class SortState(val level: Int = 0, val adapt: Adapt = Adapt(), val played: List<String> = emptyList())

private data class SortMode(val id: String, val title: L, val art: String, val tint: String)
private val SORT_MODES = listOf(
    SortMode("colour", L("Sort by colour", "రంగుల వారీగా"), "c-red", "art"),
    SortMode("size", L("Big and small", "పెద్దది, చిన్నది"), "elephant", "math"),
    SortMode("category", L("Fruits or animals?", "పండ్లా, జంతువులా?"), "banana", "lab"),
    SortMode("baby", L("Mother and baby", "అమ్మ, పిల్ల"), "hen", "next"),
    SortMode("shadow", L("Find the shadow", "నీడను కనిపెట్టు"), "bicycle", "games"),
)

private val strMap = MapSerializer(String.serializer(), String.serializer())
private val intMap = MapSerializer(String.serializer(), Int.serializer())

@Composable
fun SortMatchScreen() {
    val app = LocalApp.current
    TrackLast("/play/sort", UI.sort)
    val saved = rememberSaved("sort", SortState.serializer(), SortState())
    var mode by rememberSaveable { mutableStateOf<String?>(null) }
    var session by rememberSaveable { mutableIntStateOf(0) }
    val back: () -> Unit = { if (mode != null) { mode = null } else app.back() }
    BackHandler(mode != null) { back() }
    EarlyScreen(UI.sort.tx, back) { b ->
        val m = mode
        if (m == null) ActMenu(UI.pickGame, SORT_MODES.size) { i ->
            val sm = SORT_MODES[i]
            BigTile(sm.art, sm.title, { mode = sm.id; session++ }, Modifier.fillMaxSize(), tint = tint(sm.tint), sub = if (saved.value.played.contains(sm.id)) "✓" else null)
        } else key(m, session) {
            if (m == "baby" || m == "shadow") Matcher(b, m, saved, onAgain = { session++ }, onMenu = { mode = null })
            else Sorter(b, m, saved, onAgain = { session++ }, onMenu = { mode = null })
        }
    }
}

private class SortMsg(val ok: Boolean, val text: String)

@Composable
private fun Sorter(b: EarlyBundle, kind: String, saved: Saved<SortState>, onAgain: () -> Unit, onMenu: () -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("sort")
    val lang = WL.lang
    val roundState = rememberActState(SortRound.serializer())
    val placedState = rememberActState(strMap)
    val wrongState = rememberActState(intMap)
    var sel by rememberSaveable { mutableStateOf<String?>(null) }
    var mistakes by rememberSaveable { mutableIntStateOf(0) }
    var msgOk by rememberSaveable { mutableStateOf<Boolean?>(null) }
    var msgText by rememberSaveable { mutableStateOf("") }
    LaunchedEffect(Unit) { if (roundState.value == null) roundState.value = app.engine.early<SortRound>("sortRound", newSeed(), kind, saved.current().level) }
    val round = roundState.value
    val prompt = round?.let { r ->
        when (kind) {
            "colour" -> L("Put each picture in the right colour basket: ${r.baskets.joinToString(" or ") { it.label.en }}.", "ప్రతి బొమ్మను సరైన రంగు బుట్టలో పెట్టు: ${r.baskets.joinToString(" లేదా ") { it.label.te ?: it.label.en }}.")
            "size" -> L("Is it big or small? Tap a picture, then a box.", "పెద్దదా, చిన్నదా? బొమ్మను తాకి, తర్వాత పెట్టెను తాకు.")
            else -> L("Tap a picture, then its basket: ${r.baskets.joinToString(" or ") { it.label.en }}.", "బొమ్మను తాకి, దాని బుట్టను తాకు: ${r.baskets.joinToString(" లేదా ") { it.label.te ?: it.label.en }}.")
        }
    }
    Narrate(prompt, round?.items?.firstOrNull()?.key)
    if (round == null || prompt == null) { EarlyLoading(); return }
    val placed = placedState.value ?: emptyMap()
    val wrong = wrongState.value ?: emptyMap()
    val left = round.items.filter { placed[it.key] == null }
    val done = left.isEmpty()
    if (done) { DonePanel(onAgain, onMenu); return }

    fun picName(art: String): L = b.pic[art]?.name ?: L(art, art)
    fun itemLabel(i: SortItem): String = if (kind == "size") "${(if (i.big == true) L("Big", "పెద్ద") else L("Small", "చిన్న")).get(lang)} ${picName(i.art).get(lang)}" else picName(i.art).get(lang)
    val chooseItem: (String) -> Unit = { key ->
        Tones.tap(); Sfx.play("pop"); sel = key
        val it = round.items.first { x -> x.key == key }
        val p = b.pic[it.art]
        say(if (p != null) (if (kind == "size") L("${if (it.big == true) "Big" else "Small"} ${p.en.lowercase()}", "${if (it.big == true) "పెద్ద" else "చిన్న"} ${p.te}") else p.name) else L(it.art, it.art))
    }
    val chooseBasket: (String) -> Unit = { bid ->
        val s = sel
        if (s == null) {
            val l = L("First tap a picture.", "ముందు ఒక బొమ్మను తాకు.")
            say(l); msgOk = false; msgText = l.get(lang)
        } else {
            val it = round.items.first { x -> x.key == s }
            val ok = it.basket == bid
            val basket = round.baskets.first { x -> x.id == bid }
            record("$kind:${it.art}", ok, if ((wrong[s] ?: 0) >= 2) 1 else 0)
            if (ok) {
                val p = placed + (s to bid)
                placedState.value = p; sel = null
                val text = L("Yes! ${b.pic[it.art]?.en ?: it.art} goes in ${basket.label.en}.", "అవును! ${b.pic[it.art]?.te ?: it.art} — ${basket.label.te ?: basket.label.en}.")
                msgOk = true; msgText = text.get(lang); say(text); Sfx.play("snap")
                if (p.size == round.items.size) {
                    EarlyFx.celebrate(); Sfx.play("success")
                    val mm = mistakes
                    saved.update { st -> st.copy(played = (st.played + kind).distinct(), level = if (mm <= 1) minOf(2, st.level + 1) else if (mm >= 4) maxOf(0, st.level - 1) else st.level) }
                }
            } else {
                wrongState.value = wrong + (s to ((wrong[s] ?: 0) + 1)); mistakes++
                msgOk = false; msgText = ""; say(UI.tryAgain)
            }
        }
    }
    val hintBasket = sel?.let { s -> if ((wrong[s] ?: 0) >= 2) round.items.firstOrNull { it.key == s }?.basket else null }
    val land = LocalWindow.current.landscape

    val tray = @Composable { m: Modifier ->
        FitGrid(left.size, m, gap = 10.dp, maxCell = 200.dp) { i, _ ->
            val it = left[i]
            PicButton(it.art, itemLabel(it), { chooseItem(it.key) }, Modifier.fillMaxSize(), state = if (sel == it.key) Pick.Selected else null,
                artScale = when (it.big) { true -> 0.9f; false -> 0.45f; null -> 0.78f })
        }
    }
    val baskets = @Composable { m: Modifier ->
        val content = @Composable { bm: Modifier -> round.baskets.forEach { bk -> Basket(b, bk, round.items.filter { placed[it.key] == bk.id }, hintBasket == bk.id, bm) { chooseBasket(bk.id) } } }
        if (land) Column(m, verticalArrangement = Arrangement.spacedBy(10.dp)) { content(Modifier.weight(1f).fillMaxWidth()) }
        else Row(m, horizontalArrangement = Arrangement.spacedBy(10.dp)) { content(Modifier.weight(1f).fillMaxHeight()) }
    }
    val footer = @Composable {
        val ok = msgOk
        if (ok != null && (ok || msgText.isEmpty())) EarlyFeedback(ok, sel?.let { wrong[it] } ?: 0, extra = msgText.ifEmpty { null })
        if (ok == false && msgText.isNotEmpty()) Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Icon(Icons.Rounded.Info, null, tint = WL.colors.mathInk); Text(msgText, style = actText(17), color = WL.colors.text)
        }
    }
    if (land) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Column(Modifier.weight(0.3f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) { PromptBar(prompt, maxLines = 4); footer() }
        tray(Modifier.weight(0.35f).fillMaxHeight())
        baskets(Modifier.weight(0.35f).fillMaxHeight())
    } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        PromptBar(prompt)
        tray(Modifier.weight(1f).fillMaxWidth())
        baskets(Modifier.weight(0.85f).fillMaxWidth())
        footer()
    }
}

/** A sorting basket (or box): colour swatch / picture, its name, and the pictures already in it. */
@Composable
private fun Basket(b: EarlyBundle, bk: SortBasket, inside: List<SortItem>, hint: Boolean, modifier: Modifier, onTap: () -> Unit) {
    val c = WL.colors
    val label = bk.label.tx
    Column(
        modifier.clip(RoundedCornerShape(22.dp)).background(c.surface2)
            .border(if (hint) 4.dp else 2.dp, if (hint) c.accent else c.line, RoundedCornerShape(22.dp))
            .pressable(role = Role.Button, onClick = onTap).padding(8.dp)
            .semantics { contentDescription = "$label (${inside.size})" },
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            when {
                bk.colour != null -> Swatch(b.colourNames[bk.colour]?.hex ?: "#999999", 34.dp)
                bk.art != null -> PicArt(bk.art, if (bk.id == "small") 24.dp else 40.dp)
            }
            FitText(label, style = actText(19), color = c.text, maxLines = 1)
            if (hint) Icon(Icons.Rounded.PanTool, null, tint = c.accent)
        }
        Box(Modifier.weight(1f).fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(c.surface), contentAlignment = Alignment.Center) {
            if (inside.isNotEmpty()) FitGrid(inside.size, Modifier.fillMaxSize().padding(4.dp), gap = 4.dp, maxCell = 80.dp) { i, s ->
                val it = inside[i]
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { PicArt(it.art, if (it.big == false) s * 0.55f else s * 0.9f) }
            }
        }
    }
}

@Composable
private fun Matcher(b: EarlyBundle, kind: String, saved: Saved<SortState>, onAgain: () -> Unit, onMenu: () -> Unit) {
    val app = LocalApp.current
    val say = rememberSay()
    val record = rememberRecord("sort")
    val scope = rememberCoroutineScope()
    val lang = WL.lang
    val roundState = rememberActState(MatchRound.serializer())
    var matched by rememberSaveable { mutableStateOf(listOf<String>()) }
    var sel by rememberSaveable { mutableStateOf<String?>(null) } // "l:<key>" or "r:<key>"
    val wrongState = rememberActState(intMap)
    var msgOk by rememberSaveable { mutableStateOf<Boolean?>(null) }
    var msgText by rememberSaveable { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) { if (roundState.value == null) roundState.value = app.engine.early<MatchRound>("matchRound", newSeed(), kind, saved.current().adapt.choices) }
    val prompt = if (kind == "baby") L("Match each mother with her baby!", "ప్రతి అమ్మను తన పిల్లతో జత చేయి!") else L("Match each picture with its shadow!", "ప్రతి బొమ్మను దాని నీడతో జత చేయి!")
    val round = roundState.value
    Narrate(prompt, round?.left?.firstOrNull()?.key)
    if (round == null) { EarlyLoading(); return }
    val wrong = wrongState.value ?: emptyMap()
    val done = matched.size == round.left.size
    if (done) { DonePanel(onAgain, onMenu); return }
    fun leftOfRight(rk: String): String = round.pairs.entries.firstOrNull { it.value == rk }?.key ?: ""
    val selSide = sel?.substringBefore(':')
    val selKey = sel?.substringAfter(':')

    val tap: (String, String) -> Unit = { side, k ->
        val lk = if (side == "l") k else leftOfRight(k)
        if (!matched.contains(lk)) {
            val card = (if (side == "l") round.left else round.right).first { it.key == k }
            if (sel == null || selSide == side) {
                Tones.tap(); Sfx.play("pop"); sel = "$side:$k"; say(card.label)
            } else {
                val l = if (side == "l") k else selKey!!
                val r = if (side == "r") k else selKey!!
                val ok = round.pairs[l] == r
                record("$kind:$l", ok, if ((wrong[l] ?: 0) >= 2) 1 else 0)
                if (ok) {
                    val m = matched + l
                    matched = m; sel = null
                    val lc = round.left.first { it.key == l }; val rc = round.right.first { it.key == r }
                    val text = if (kind == "baby") L("${lc.label.en} and ${rc.label.en.lowercase()}!", "${lc.label.te ?: lc.label.en}, ${rc.label.te ?: rc.label.en}!")
                    else L("Yes! That is the ${lc.label.en.lowercase()}’s shadow.", "అవును! అది ${lc.label.te ?: lc.label.en} నీడ.")
                    msgOk = true; msgText = text.get(lang); say(text); Sfx.play("snap")
                    val first = (wrong[l] ?: 0) == 0
                    scope.launch { val a = app.engine.adaptNext(saved.current().adapt, true, first); saved.update { it.copy(adapt = a) } }
                    if (m.size == round.left.size) { EarlyFx.celebrate(); Sfx.play("success"); saved.update { it.copy(played = (it.played + kind).distinct()) } }
                } else {
                    wrongState.value = wrong + (l to ((wrong[l] ?: 0) + 1))
                    scope.launch { val a = app.engine.adaptNext(saved.current().adapt, false); saved.update { it.copy(adapt = a) } }
                    msgOk = false; msgText = null; say(UI.tryAgain)
                    sel = "l:$l"
                }
            }
        }
    }
    val selLeft = if (selSide == "l") selKey else null
    val hintRight = selLeft?.let { if ((wrong[it] ?: 0) >= 2) round.pairs[it] else null }
    val land = LocalWindow.current.landscape

    val column = @Composable { side: String, cards: List<MatchCard>, m: Modifier ->
        FitGrid(cards.size, m, gap = 10.dp, maxCell = 220.dp, fixedCols = if (land) cards.size else 1) { i, _ ->
            val cd = cards[i]
            val lk = if (side == "l") cd.key else leftOfRight(cd.key)
            val isM = matched.contains(lk)
            val pressed = sel == "$side:${cd.key}"
            val hint = side == "r" && hintRight == cd.key
            PicButton(
                cd.art, "${cd.label.get(lang)}${if (isM) " ✓ ${matched.indexOf(lk) + 1}" else ""}", { tap(side, cd.key) }, Modifier.fillMaxSize(),
                state = when { pressed -> Pick.Selected; hint -> Pick.Hint; else -> null }, enabled = !isM, showLabel = kind == "baby",
                shadow = cd.shadow, artScale = if (cd.small) 0.5f else 0.78f, badge = if (isM) "${matched.indexOf(lk) + 1}" else null,
                bg = if (isM) WL.colors.goodBg else null,
            )
        }
    }
    val footer = @Composable {
        val ok = msgOk
        if (ok != null) EarlyFeedback(ok, if (ok) 0 else (selLeft?.let { wrong[it] } ?: 0), extra = msgText)
    }
    if (land) Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Column(Modifier.weight(0.32f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) { PromptBar(prompt, maxLines = 4); footer() }
        Column(Modifier.weight(0.68f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            column("l", round.left, Modifier.weight(1f).fillMaxWidth())
            column("r", round.right, Modifier.weight(1f).fillMaxWidth())
        }
    } else Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        PromptBar(prompt)
        Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            column("l", round.left, Modifier.weight(1f).fillMaxHeight())
            column("r", round.right, Modifier.weight(1f).fillMaxHeight())
        }
        footer()
    }
}
