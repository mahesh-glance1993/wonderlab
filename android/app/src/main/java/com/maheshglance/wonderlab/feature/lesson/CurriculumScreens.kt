package com.maheshglance.wonderlab.feature.lesson

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Explore
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.data.MasteryState
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.EmojiText
import com.maheshglance.wonderlab.core.design.ErrorState
import com.maheshglance.wonderlab.core.design.Loading
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.SmallShape
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.design.pressable
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.appState
import com.maheshglance.wonderlab.ui.shell.HubScaffold
import com.maheshglance.wonderlab.ui.t
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer

private data class Status(val key: String, val label: String, val emoji: String)

/** The website's statusOf(). */
@Composable
private fun statusOf(m: MasteryState?): Status = when {
    m == null || m.attempts == 0 -> Status("new", t("notStarted"), "✨")
    m.masteredAt != null -> Status("mastered", t("mastered"), "✅")
    m.attempts >= 3 && m.correct.toDouble() / m.attempts < 0.6 -> Status("practice", t("needsPractice"), "⚠️")
    else -> Status("progress", t("inProgress"), "⏳")
}

private fun lessonPath(unitId: String, objectiveId: String, mode: String) = "lesson/${Uri.encode(unitId)}/${Uri.encode(objectiveId)}?mode=$mode"

/** /learn?subject=math|physics|early — curriculum browser (website Curriculum.tsx). Revisit / explore neighbouring classes. */
@Composable
fun LearnScreen(subject: String?) {
    val app = LocalApp.current
    val s by appState()
    val profile = s.profile ?: return
    val own = profile.classLevel
    val pres = rememberPresentation(own, profile.ageBand)
    val early = pres?.tier == "early"
    var level by rememberSaveable(profile.id) { mutableIntStateOf(own) }
    val eng = remember { LessonEngine(app.engine) }
    val data by produceState<CurriculumData?>(null, level) { value = null; value = eng.curriculum(level) }
    val labels by produceState(emptyList<String>()) { value = runCatching { app.engine.get<List<String>>("lesson.classLabels") }.getOrDefault(emptyList()) }
    val win = LocalWindow.current
    val title = when (subject) { "early" -> t("e_world"); "physics" -> "Physics"; else -> t("math") }
    val label = { l: Int -> labels.getOrNull(l) ?: "Class $l" }
    HubScaffold(Routes.LEARN) {
        Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
            TopBar(title, onBack = { app.back() }, subtitle = label(level), actions = {
                if (level == own && !early) WLButton(ls("diagTitle"), { app.go("lesson/diagnostic") }, small = true, icon = Icons.Rounded.Explore)
                WLButton(if (subject == "physics") t("math") else "Physics", { app.go("learn?subject=${if (subject == "physics") "math" else "physics"}") }, small = true)
            })
            // class switcher: revisit / mine / explore
            Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(own - 1, own, own + 1).filter { it in 0..12 }.forEach { l ->
                    val on = l == level
                    Box(
                        Modifier.weight(1f).heightIn(min = 44.dp).clip(RoundedCornerShape(999.dp)).background(if (on) WL.colors.math else WL.colors.surface2).pressable { level = l }.padding(horizontal = 10.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(when { l == own -> "${label(l)} (mine)"; l < own -> "Revisit ${label(l)}"; else -> "Explore ${label(l)}" },
                            style = MaterialTheme.typography.labelMedium, color = if (on) WL.colors.mathInk else WL.colors.muted, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
            val d = data
            when {
                d == null -> Loading(text = "Loading lessons…")
                else -> {
                    val units = d.units.filter { subject == null || it.subject == subject || (subject == "math" && it.subject == "early" && level <= 2) }
                    if (units.isEmpty()) ErrorState("No units for this subject in ${d.label} yet.")
                    else LazyVerticalGrid(
                        GridCells.Fixed(if (win.isPhone && !win.landscape) 1 else if (win.isPhone || win.width < 1000.dp) 2 else 3),
                        Modifier.fillMaxSize(), contentPadding = PaddingValues(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        items(units, key = { it.id }) { u -> UnitCard(u, s.learner.mastery, early) }
                    }
                }
            }
        }
    }
}

@Composable
private fun UnitCard(u: CUnit, mastery: Map<String, MasteryState>, early: Boolean) {
    val app = LocalApp.current
    WLCard(Modifier.fillMaxWidth(), padding = 14.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            EmojiImage(when (u.subject) { "physics" -> "🔬"; "early" -> "🌍"; else -> "🔢" }, 32.dp)
            Column(Modifier.weight(1f)) {
                EmojiText(L(u.title), style = MaterialTheme.typography.titleMedium, color = WL.colors.text)
                u.source?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, maxLines = 1, overflow = TextOverflow.Ellipsis) }
            }
            if (u.enrichment) Pill("Enrichment", bg = WL.colors.games, fg = WL.colors.gamesInk)
        }
        Column(Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            u.objectives.forEach { o ->
                val st = statusOf(mastery[o.id])
                Column(Modifier.fillMaxWidth().clip(SmallShape).background(WL.colors.surface2).padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        EmojiText(L(o.title), Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            EmojiImage(st.emoji, 18.dp)
                            Text(st.label, style = MaterialTheme.typography.labelSmall, color = when (st.key) { "mastered" -> WL.colors.good; "practice" -> WL.colors.warn; else -> WL.colors.muted })
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        WLButton(t("learn"), { app.go(lessonPath(u.id, o.id, "learn")) }, small = true, kind = BtnKind.Primary)
                        WLButton(t("practice"), { app.go(lessonPath(u.id, o.id, "practice")) }, small = true)
                        if (!early) WLButton(t("test"), { app.go(lessonPath(u.id, o.id, "test")) }, small = true)
                    }
                }
            }
        }
    }
}

/** /next — "What should I learn next?" (website Next.tsx): recommend() + the practice queue. */
@Composable
fun NextScreen() {
    val app = LocalApp.current
    val s by appState()
    val profile = s.profile ?: return
    val lang = WL.lang
    val pres = rememberPresentation(profile.classLevel, profile.ageBand)
    val eng = remember { LessonEngine(app.engine) }
    val lastObj = s.prefs.lastActivity?.path?.let { Regex("^/lesson/[^/]+/([^?]+)").find(it)?.groupValues?.get(1) }?.let { Uri.decode(it) }
    val mastery = s.learner.mastery
    val data by produceState<NextData?>(null, profile.classLevel, mastery, lastObj) {
        value = eng.next(profile.classLevel, AppJson.encodeToJsonElement(MapSerializer(String.serializer(), MasteryState.serializer()), mastery), lastObj)
    }
    val rec = data?.rec
    LaunchedEffect(rec?.objectiveId, pres?.readAloud) {
        if (rec != null && pres?.readAloud == true) app.say(com.maheshglance.wonderlab.core.data.Localized("${rec.objectiveTitle.en}. ${rec.reason.en}", rec.objectiveTitle.te?.let { "$it. ${rec.reason.te ?: ""}" }), lang)
    }
    val win = LocalWindow.current
    HubScaffold(Routes.LEARN) {
        Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
            TopBar(t("whatNext"), onBack = { app.back() })
            val d = data
            if (d == null) { Loading(text = "Thinking…"); return@Column }
            val due = d.due
            val content: @Composable (Modifier) -> Unit = { m ->
                if (rec != null) WLCard(m, color = WL.colors.next, padding = 18.dp) {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            EmojiImage("🧭", if (win.isPhone) 56.dp else 80.dp)
                            Column(Modifier.weight(1f)) {
                                EmojiText(L(rec.objectiveTitle), style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                                Text(L(rec.unitTitle), style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                            }
                        }
                        Row(Modifier.fillMaxWidth().clip(SmallShape).background(WL.colors.surface).padding(12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            EmojiImage("💡", 24.dp)
                            EmojiText("${t("recommendedBecause")} ${L(rec.reason)}", style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
                        }
                        if (pres?.readAloud == true) Narration(com.maheshglance.wonderlab.core.data.Localized("${rec.objectiveTitle.en}. ${rec.reason.en}", rec.objectiveTitle.te?.let { "$it. ${rec.reason.te ?: ""}" }))
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            WLButton(t("start"), { app.go(lessonPath(rec.unitId, rec.objectiveId, rec.mode)) }, kind = BtnKind.Primary, icon = Icons.Rounded.PlayArrow)
                            WLButton("Choose something else", { app.go(Routes.LEARN) })
                        }
                    }
                }
            }
            val queue: @Composable (Modifier) -> Unit = { m ->
                if (due.size > 1) WLCard(m, padding = 16.dp) {
                    Text("Practice queue", style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
                    Text("Skills to revisit, picked from questions you missed earlier.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                    Column(Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        due.take(6).forEach { x ->
                            Row(Modifier.fillMaxWidth().clip(SmallShape).background(WL.colors.surface2).pressable { app.go(lessonPath(x.unitId, x.objectiveId, "practice")) }.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                EmojiImage("🔁", 22.dp)
                                EmojiText(L(x.title), Modifier.weight(1f), style = MaterialTheme.typography.bodyLarge, color = WL.colors.mathInk)
                            }
                        }
                    }
                }
            }
            val pad = Modifier.padding(if (win.isPhone) 12.dp else 24.dp)
            if (win.landscape && due.size > 1) Row(pad.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(16.dp), verticalAlignment = Alignment.CenterVertically) {
                content(Modifier.weight(1.3f)); queue(Modifier.weight(1f))
            } else Column(pad.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically), horizontalAlignment = Alignment.CenterHorizontally) {
                content(Modifier.widthIn(max = 720.dp).fillMaxWidth()); queue(Modifier.widthIn(max = 720.dp).fillMaxWidth())
            }
        }
    }
    if (Color.Unspecified == Color.Transparent) Unit
}
