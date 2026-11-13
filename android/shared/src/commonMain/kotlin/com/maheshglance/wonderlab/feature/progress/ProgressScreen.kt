package com.maheshglance.wonderlab.feature.progress

import com.maheshglance.wonderlab.core.platform.*

import com.maheshglance.wonderlab.core.design.FitText

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ExpandLess
import androidx.compose.material.icons.rounded.ExpandMore
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.data.CurriculumUnit
import com.maheshglance.wonderlab.core.data.MasteryState
import com.maheshglance.wonderlab.core.data.Objective
import com.maheshglance.wonderlab.core.data.Outline
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Meter
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.shell.HubScaffold
import com.maheshglance.wonderlab.ui.t
import java.text.DateFormat
import java.util.Date

/** Objective status, same rule as the website's statusOf(): new | progress | practice | mastered. */
fun masteryStatus(m: MasteryState?): String = when {
    m == null || m.attempts == 0 -> "new"
    m.masteredAt != null -> "mastered"
    m.attempts >= 3 && m.correct.toDouble() / m.attempts < 0.6 -> "practice"
    else -> "progress"
}

fun statusLabel(key: String) = when (key) { "mastered" -> "Mastered"; "practice" -> "Needs practice"; "progress" -> "In progress"; else -> "Not started" }

private val BADGE_NAMES = mapOf("play" to "Play & Learn", "lang" to "Language", "mastered" to "Skill mastered", "game" to "Game badge", "lab" to "Lab challenge", "art" to "Art milestone", "daily" to "Daily puzzle")
private val BADGE_EMOJI = mapOf("play" to "🧸", "lang" to "🗣️", "mastered" to "💡", "game" to "🎲", "lab" to "🔦", "art" to "🖍️", "daily" to "🧩")

fun badgeName(id: String): String {
    val kind = id.substringBefore(':')
    val rest = id.substringAfter(':', "").replace(':', ' ').replace('-', ' ').replace('_', ' ').trim()
    val name = BADGE_NAMES[kind] ?: "Badge"
    return if (rest.isEmpty()) name else "$name: $rest"
}

fun lessonPath(unitId: String, objectiveId: String, mode: String) =
    "lesson/${urlEncode(unitId)}/${urlEncode(objectiveId)}?mode=$mode"

/** Curriculum outline for a class (from the shared engine), cached per class for the session. */
private val outlineCache = java.util.concurrent.ConcurrentHashMap<Int, Outline>()

/** Forget cached outlines (after educator overrides change). */
fun clearOutlineCache() = outlineCache.clear()

@Composable
fun rememberOutline(level: Int?): Outline? {
    val app = LocalApp.current
    var o by remember(level) { mutableStateOf(level?.let { outlineCache[it] }) }
    LaunchedEffect(level) {
        if (level != null && o == null) runCatching { app.engine.get<Outline>("core.outline", level) }.getOrNull()?.let { outlineCache[level] = it; o = it }
    }
    return o
}

/** `/progress`: stars, badges and stickers, skills mastered, what needs practice, and per-unit mastery. */
@Composable
fun ProgressScreen() {
    val app = LocalApp.current
    val s by appState()
    val profile = s.profile ?: return
    val win = LocalWindow.current
    val lang = WL.lang
    val early = profile.classLevel <= 2
    val outline = rememberOutline(profile.classLevel)
    val learner = s.learner
    val objectives = outline?.units.orEmpty().flatMap { u -> u.objectives.map { o -> Triple(u, o, masteryStatus(learner.mastery[o.id])) } }
    val mastered = objectives.filter { it.third == "mastered" }
    val practice = objectives.filter { it.third == "practice" }
    val rewards = learner.rewards.entries.sortedByDescending { it.value }
    val stars = learner.mastery.values.sumOf { it.correct } + rewards.size

    HubScaffold(Routes.PROGRESS) {
        Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
            TopBar(t("myProgress").let { if (it == "myProgress") "My progress" else it })
            Column(
                Modifier.weight(1f).fillMaxWidth().verticalScroll(rememberScrollState()).padding(if (win.isPhone) 12.dp else 20.dp),
                verticalArrangement = Arrangement.spacedBy(if (win.isPhone) 12.dp else 16.dp),
            ) {
                // headline numbers
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(if (win.isPhone) 8.dp else 14.dp)) {
                    StatCard("⭐", "$stars", t("stars").let { if (it == "stars") "Stars" else it }, Modifier.weight(1f), WL.colors.prog)
                    StatCard("💡", if (outline == null) "…" else "${mastered.size} / ${objectives.size}", "Skills mastered", Modifier.weight(1f), WL.colors.math,
                        progress = if (objectives.isEmpty()) null else mastered.size.toFloat() / objectives.size)
                    StatCard("🎀", "${rewards.size}", "Badges", Modifier.weight(1f), WL.colors.art)
                }

                if (mastered.isEmpty() && rewards.isEmpty()) {
                    WLCard(Modifier.fillMaxWidth()) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                            EmojiImage("🌱", 64.dp)
                            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("Complete lessons, games and art to collect stars and badges.", style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                                WLButton(t("whatNext").let { if (it == "whatNext") "What next?" else it }, { app.go(Routes.NEXT) }, kind = BtnKind.Primary, small = true)
                            }
                        }
                    }
                }

                val canDo: @Composable ColumnScope.() -> Unit = {
                    if (mastered.isNotEmpty()) Section(t("canNowDo").let { if (it == "canNowDo") "I can now do" else it }, "💡") {
                        mastered.forEach { (_, o, _) -> Bullet(o.title.get(lang), WL.colors.good) }
                    }
                    if (practice.isNotEmpty()) Section(t("needsPractice").let { if (it == "needsPractice") "Needs practice" else it }, "🎯") {
                        practice.forEach { (u, o, _) ->
                            Row(
                                Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(WL.colors.warnBg).pressable { app.go(lessonPath(u.id, o.id, "practice")) }.padding(horizontal = 12.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Text(o.title.get(lang), style = MaterialTheme.typography.bodyLarge, color = WL.colors.text, modifier = Modifier.weight(1f))
                                Text(t("practice").let { if (it == "practice") "Practice" else it }, style = MaterialTheme.typography.labelLarge, color = WL.colors.warn)
                            }
                        }
                    }
                }
                val badges: @Composable ColumnScope.() -> Unit = {
                    if (rewards.isNotEmpty()) Section("Badges", "🎀") { BadgeWall(rewards.map { it.key to it.value }, early) }
                }
                BoxWithConstraints(Modifier.fillMaxWidth()) {
                    if (maxWidth >= 720.dp) Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(16.dp), content = canDo)
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(16.dp), content = badges)
                    } else Column(verticalArrangement = Arrangement.spacedBy(12.dp)) { canDo(); badges() }
                }

                if (outline != null && outline.units.isNotEmpty()) Section("Skills in each topic", "📚") {
                    outline.units.forEach { u -> UnitRow(u, learner.mastery, lang) { o, mode -> app.go(lessonPath(u.id, o.id, mode)) } }
                }
            }
        }
    }
}

@Composable
private fun StatCard(emoji: String, value: String, label: String, modifier: Modifier, color: Color, progress: Float? = null) {
    val phone = LocalWindow.current.isPhone
    Column(
        modifier.clip(RoundedCornerShape(22.dp)).background(color).padding(if (phone) 10.dp else 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        EmojiImage(emoji, if (phone) 40.dp else 56.dp)
        Text(value, style = if (phone) MaterialTheme.typography.titleLarge else MaterialTheme.typography.headlineMedium, color = WL.colors.text, maxLines = 1)
        Text(label, style = MaterialTheme.typography.labelMedium, color = WL.colors.muted, textAlign = TextAlign.Center, maxLines = 2)
        if (progress != null) Meter(progress, Modifier.padding(top = 4.dp), WL.colors.good)
    }
}

@Composable
private fun Section(title: String, emoji: String, content: @Composable ColumnScope.() -> Unit) {
    WLCard(Modifier.fillMaxWidth(), padding = 16.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            EmojiImage(emoji, 32.dp)
            Text(title, style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
        }
        Column(Modifier.padding(top = 10.dp), verticalArrangement = Arrangement.spacedBy(8.dp), content = content)
    }
}

@Composable
private fun Bullet(text: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Box(Modifier.size(10.dp).clip(RoundedCornerShape(5.dp)).background(color))
        Text(text, style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun BadgeWall(rewards: List<Pair<String, Long>>, early: Boolean) {
    val fmt = remember { DateFormat.getDateInstance(DateFormat.MEDIUM) }
    val size: Dp = if (early) 120.dp else 104.dp
    FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        rewards.forEach { (id, at) ->
            Column(
                Modifier.widthIn(min = size, max = size + 40.dp).clip(RoundedCornerShape(18.dp)).background(WL.colors.surface2).padding(10.dp),
                horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                EmojiImage(BADGE_EMOJI[id.substringBefore(':')] ?: "🎀", if (early) 56.dp else 44.dp)
                FitText(badgeName(id), style = MaterialTheme.typography.labelMedium, color = WL.colors.text, textAlign = TextAlign.Center, maxLines = 3)
                if (at > 0) Text(fmt.format(Date(at * 1000)), style = MaterialTheme.typography.labelSmall, color = WL.colors.muted)
            }
        }
    }
}

@Composable
private fun UnitRow(u: CurriculumUnit, mastery: Map<String, MasteryState>, lang: String, onOpen: (Objective, String) -> Unit) {
    var open by rememberSaveable(u.id) { mutableStateOf(false) }
    val st = u.objectives.map { masteryStatus(mastery[it.id]) }
    val m = st.count { it == "mastered" }
    val p = st.count { it == "practice" }
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(WL.colors.surface2)) {
        Row(Modifier.fillMaxWidth().pressable { open = !open }.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(u.title.get(lang), style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                Meter(if (st.isEmpty()) 0f else m.toFloat() / st.size, color = WL.colors.good)
                Text("$m of ${st.size} mastered" + if (p > 0) " · $p need practice" else "", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
            }
            Icon(if (open) Icons.Rounded.ExpandLess else Icons.Rounded.ExpandMore, if (open) "Hide skills" else "Show skills", tint = WL.colors.muted)
        }
        if (open) Column(Modifier.padding(start = 12.dp, end = 12.dp, bottom = 12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            u.objectives.forEachIndexed { i, o ->
                val key = st[i]
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(WL.colors.surface).pressable { onOpen(o, if (key == "new") "learn" else "practice") }.padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(o.title.get(lang), style = MaterialTheme.typography.bodyMedium, color = WL.colors.text, modifier = Modifier.weight(1f))
                    StatusPill(key)
                }
            }
        }
    }
}

@Composable
fun StatusPill(key: String) {
    val c = WL.colors
    val (bg, fg) = when (key) { "mastered" -> c.goodBg to c.good; "practice" -> c.warnBg to c.warn; "progress" -> c.math to c.mathInk; else -> c.surface2 to c.muted }
    Pill(statusLabel(key), bg = bg, fg = fg)
}
