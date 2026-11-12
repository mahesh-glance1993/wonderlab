package com.maheshglance.wonderlab.feature.language

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.automirrored.rounded.MenuBook
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Draw
import androidx.compose.material.icons.rounded.EditNote
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Meter
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.design.WLFonts
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState

@Composable
fun rememberClassNames(): List<String> = (rememberEngine<List<String>>("language.classNames") as? Loadable.Ready)?.value ?: emptyList()

private fun List<String>.cls(i: Int) = getOrNull(i) ?: "Class ${i - 2}"

/** /lang — course chooser (website CourseMap.tsx LanguageHome). */
@Composable
fun LanguageHome() {
    val app = LocalApp.current
    val s by appState()
    val win = LocalWindow.current
    val names = rememberClassNames()
    val lvl = s.profile?.classLevel ?: 0
    LangFrame({ LangBar("Languages") }) {
        Column(Modifier.fillMaxSize().padding(if (win.isPhone) 14.dp else 24.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text("Learn to read, write and use Telugu and English — ${names.cls(lvl)} and beyond.", style = MaterialTheme.typography.bodyLarge, color = WL.colors.muted)
            val tiles: @Composable (Modifier) -> Unit = { m ->
                CourseTile("అ", "te", "తెలుగు", "Telugu — letters, గుణింతాలు, reading, grammar", WL.colors.games, WL.colors.gamesInk, m) { app.go("lang/telugu") }
                CourseTile("Aa", "en", "English", "Phonics, reading, grammar, writing", WL.colors.math, WL.colors.mathInk, m) { app.go("lang/english") }
            }
            if (win.isPhone && !win.landscape) Column(Modifier.weight(1f).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) { tiles(Modifier.weight(1f).fillMaxWidth()) }
            else Row(Modifier.weight(1f).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(18.dp)) { tiles(Modifier.weight(1f).fillMaxHeight()) }
        }
    }
}

@Composable
private fun CourseTile(glyph: String, script: String, title: String, sub: String, bg: androidx.compose.ui.graphics.Color, ink: androidx.compose.ui.graphics.Color, modifier: Modifier, onClick: () -> Unit) {
    BoxWithConstraints(modifier.clip(RoundedCornerShape(26.dp)).background(bg).pressable(onClick = onClick).padding(18.dp)) {
        val g = (minOf(maxWidth.value, maxHeight.value) * 0.38f).coerceIn(40f, 150f)
        Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) {
            LT(glyph, script, color = ink, fontSize = g.sp, weight = FontWeight.Bold, maxLines = 1)
            LT(title, script, style = MaterialTheme.typography.headlineMedium, color = ink, weight = FontWeight.Bold)
            LT(sub, "te", style = MaterialTheme.typography.bodyMedium, color = WL.colors.text, textAlign = TextAlign.Center)
        }
    }
}

/** /lang/:course — classes + unit cards (website CourseMap.tsx CourseMap). May scroll when a class has many units. */
@Composable
fun CourseMapScreen(course: String, classArg: Int?) {
    val s by appState()
    val own = s.profile?.classLevel ?: 0
    val names = rememberClassNames()
    var level by rememberSaveable { mutableIntSaveable(classArg ?: own) }
    val data = rememberEngine<LCourseMap>("language.courseMap", course, level)
    val (gloss, setGloss) = rememberGloss()
    val win = LocalWindow.current
    val head = (data as? Loadable.Ready)?.value
    // a class with no content falls back to the learner's own class (website: ?class must be one of the levels)
    LaunchedEffect(head?.levels) { if (head != null && level !in head.levels && own in head.levels) level = own }
    val script = head?.script ?: if (course == "telugu") "te" else "en"
    LoadOr(data) { C ->
        LangFrame({
            LangBar(C.title + if (script == "te") " · Telugu" else "", script) { if (script == "te") GlossToggle(gloss, setGloss) }
        }) {
            Column(Modifier.fillMaxSize().padding(horizontal = if (win.isPhone) 10.dp else 20.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ClassChips(C.levels, level, own, names) { level = it }
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (level > 0) WLButton(if (win.isPhone) "" else "Revisit ${names.cls(level - 1)}", { level -= 1 }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowBack)
                    Text(
                        names.cls(level) + when { level == own -> " — your class"; level < own -> " — revision"; else -> " — explore ahead" },
                        Modifier.weight(1f), style = MaterialTheme.typography.titleLarge, color = WL.colors.text, textAlign = TextAlign.Center,
                    )
                    if (level < 12) WLButton(if (win.isPhone) "" else "Explore ${names.cls(level + 1)}", { level += 1 }, small = true, icon = Icons.AutoMirrored.Rounded.ArrowForward)
                }
                if (C.units.isEmpty()) Text("No units for this class yet.", color = WL.colors.muted)
                val cols = when { win.width >= 900.dp -> 3; win.width >= 600.dp -> 2; else -> 1 }.coerceAtMost(C.units.size.coerceAtLeast(1))
                Column(Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    C.units.chunked(cols).forEach { row ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            row.forEach { u -> UnitCard(course, script, u, gloss, Modifier.weight(1f)) }
                            repeat(cols - row.size) { Spacer(Modifier.weight(1f)) }
                        }
                    }
                }
            }
        }
    }
}

private fun mutableIntSaveable(v: Int) = androidx.compose.runtime.mutableIntStateOf(v)

@Composable
private fun ClassChips(levels: List<Int>, level: Int, own: Int, names: List<String>, onPick: (Int) -> Unit) {
    val list = rememberLazyListState()
    LaunchedEffect(level, levels) { val i = levels.indexOf(level); if (i >= 0) list.animateScrollToItem((i - 1).coerceAtLeast(0)) }
    LazyRow(state = list, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        itemsIndexed(levels) { _, l ->
            val on = l == level
            Box(
                Modifier.clip(RoundedCornerShape(999.dp)).background(if (on) WL.colors.primary else WL.colors.surface2)
                    .pressable { onPick(l) }.padding(horizontal = 14.dp, vertical = 9.dp),
            ) { Text(names.cls(l) + if (l == own) " (my class)" else "", style = MaterialTheme.typography.labelMedium, color = if (on) WL.colors.primaryInk else WL.colors.text) }
        }
    }
}

/** Unit card (website CourseMap.tsx UnitCard). */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun UnitCard(course: String, script: String, unit: LUnit, gloss: Boolean, modifier: Modifier = Modifier) {
    val app = LocalApp.current
    val s by appState()
    val acts = s.learner.activities
    fun st(oid: String): LObjState? = decodeOrNull(acts[LangKeys.activityId(LangKeys.objectiveKey(course, unit.id, oid))]?.state)
    val done = unit.objectives.count { LangKeys.passed(st(it.id)) }
    WLCard(modifier, padding = 14.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            LT(unit.title, script, Modifier.weight(1f).pressable(sound = false) { app.go("lang/$course/${unit.id}") }, style = MaterialTheme.typography.titleLarge, color = WL.colors.primary, weight = FontWeight.Bold)
            if (done == unit.objectives.size) Pill("Complete", icon = Icons.Rounded.CheckCircle, bg = WL.colors.goodBg, fg = WL.colors.good)
            else Pill("$done of ${unit.objectives.size} passed")
        }
        if (script == "te") Gloss(gloss, unit.titleEn)
        Spacer(Modifier.size(6.dp))
        Meter(if (unit.objectives.isEmpty()) 0f else done.toFloat() / unit.objectives.size)
        Spacer(Modifier.size(4.dp))
        unit.objectives.forEach { o ->
            val x = st(o.id)
            val passed = LangKeys.passed(x)
            Column(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    LT(o.title, script, Modifier.weight(1f, fill = false), style = MaterialTheme.typography.titleMedium, weight = FontWeight.Bold)
                    if (passed) Pill("Passed", icon = Icons.Rounded.CheckCircle, bg = WL.colors.goodBg, fg = WL.colors.good)
                }
                if (script == "te") Gloss(gloss, o.titleEn)
                val status = buildString {
                    if (x?.learned == true) append("Learned · ")
                    x?.practiceBest?.let { append("Practice best ${Math.round(it * 100)}% · ") }
                    x?.testBest?.let { append("Test best ${Math.round(it * 100)}%") }
                    if (x?.learned != true && x?.practiceBest == null && x?.testBest == null) append("Not started")
                }.removeSuffix(" · ")
                Text(status, style = MaterialTheme.typography.bodySmall.copy(fontFamily = WLFonts.body), color = WL.colors.muted)
                val base = "lang/$course/${unit.id}/${o.id}"
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    WLButton("Learn", { app.go("$base?mode=learn") }, small = true, icon = Icons.AutoMirrored.Rounded.MenuBook, modifier = Modifier.weight(1f))
                    WLButton("Practice", { app.go("$base?mode=practice") }, small = true, icon = Icons.Rounded.EditNote, modifier = Modifier.weight(1f))
                    WLButton("Test", { app.go("$base?mode=test") }, small = true, icon = Icons.Rounded.Star, modifier = Modifier.weight(1f))
                }
            }
        }
        if (unit.trace.isNotEmpty() || unit.read.isNotEmpty()) {
            FlowRow(Modifier.padding(top = 6.dp), horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                unit.trace.forEach { t -> ExtraChip("✏️", "Trace: ", t.title, script) { app.go("lang/$course/trace/${t.id}") } }
                unit.read.forEach { p -> ExtraChip("📖", "Read along: ", p.title, script) { app.go("lang/$course/read/${p.id}") } }
            }
        }
        unit.badge?.let { b ->
            Row(Modifier.padding(top = 6.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                EmojiImage("🏆", 20.dp)
                Text("Badge: ${b.title} — pass every objective (${Math.round(LangKeys.PASS * 100)}%+).", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            }
        }
    }
}

@Composable
private fun ExtraChip(emoji: String, label: String, title: String, script: String, onClick: () -> Unit) {
    Row(
        Modifier.clip(RoundedCornerShape(14.dp)).background(WL.colors.surface2).pressable(onClick = onClick).padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        EmojiImage(emoji, 22.dp)
        Text(label, style = MaterialTheme.typography.labelMedium, color = WL.colors.text)
        LT(title, script, style = MaterialTheme.typography.labelLarge, weight = FontWeight.Bold)
    }
}

/** /lang/:course/:unitId (website CourseMap.tsx UnitPage). */
@Composable
fun UnitScreen(course: String, unitId: String) {
    val data = rememberEngine<LUnit>("language.unit", course, unitId)
    val names = rememberClassNames()
    val (gloss, setGloss) = rememberGloss()
    val win = LocalWindow.current
    val script = if (course == "telugu") "te" else "en"
    LoadOr(data) { u ->
        LangFrame({ LangBar(u.title, script, subtitle = names.cls(u.level), subtitleScript = "en") { if (course == "telugu") GlossToggle(gloss, setGloss) } }) {
            Box(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(if (win.isPhone) 10.dp else 24.dp), contentAlignment = Alignment.TopCenter) {
                UnitCard(course, script, u, gloss, Modifier.fillMaxWidth().then(if (win.isTablet) Modifier.padding(horizontal = 40.dp) else Modifier))
            }
        }
    }
}
