package com.maheshglance.wonderlab.feature.language

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.Pill
import com.maheshglance.wonderlab.core.design.SpeakButton
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLCard

// Learn-mode builders (website Builders.tsx): గుణింతం (consonant + vowel sign), ఒత్తు (conjunct), CVC word blending.

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun Picker(label: String, options: List<String>, value: String, script: String, render: (String) -> String = { it }, onPick: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        LT(label, "te", style = MaterialTheme.typography.labelLarge, color = WL.colors.muted)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(5.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            options.forEach { o -> LKeyBtn(render(o), script, { onPick(o) }, selected = o == value, minSize = 44.dp) }
        }
    }
}

/** Two columns on wide screens (output | pickers), one column on phones. */
@Composable
private fun BuilderLayout(title: String, sub: String, out: @Composable ColumnScope.() -> Unit, pickers: @Composable ColumnScope.() -> Unit) {
    WLCard(Modifier.fillMaxWidth(), padding = 14.dp, flat = true) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            LT(title, "te", style = MaterialTheme.typography.titleLarge, weight = FontWeight.Bold)
            Text(sub, style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
        }
        BoxWithConstraints(Modifier.fillMaxWidth().padding(top = 8.dp)) {
            if (maxWidth >= 680.dp) Row(horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                Column(Modifier.weight(0.42f), verticalArrangement = Arrangement.spacedBy(10.dp), content = out)
                Column(Modifier.weight(0.58f), verticalArrangement = Arrangement.spacedBy(10.dp), content = pickers)
            } else Column(verticalArrangement = Arrangement.spacedBy(10.dp)) { out(); pickers() }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun OutRow(content: @Composable () -> Unit) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(6.dp), itemVerticalAlignment = Alignment.CenterVertically) { content() }
}

@Composable
private fun Big(text: String, script: String = "te") = LT(text, script, fontSize = 48.sp, color = WL.colors.primary, weight = FontWeight.Bold, maxLines = 1)

@Composable
private fun Mid(text: String, script: String = "te") = LT(text, script, style = MaterialTheme.typography.headlineSmall, maxLines = 1)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun GuninthamBuilder(sayer: Sayer) {
    val b = rememberBuilders() ?: return
    var c by rememberSaveable { mutableStateOf("క") }
    var v by rememberSaveable { mutableStateOf("ఆ") }
    val syl = { cc: String, vv: String -> b.gunintham[cc]?.getOrNull(b.guninthamVowels.indexOf(vv)) ?: (cc + (b.vowelSigns[vv] ?: "")) }
    val out = syl(c, v)
    val pick = { nc: String, nv: String -> c = nc; v = nv; sayer.say(syl(nc, nv), "te") }
    BuilderLayout("గుణింతం తయారీ", "(Syllable builder)", out = {
        OutRow {
            Mid(c); Mid("+"); Mid(v + (b.vowelSignShown[v]?.takeIf { it.isNotEmpty() }?.let { " ($it)" } ?: "")); Mid("=")
            Big(out)
            SpeakButton({ sayer.say(out, "te") }, size = 44.dp)
        }
        b.signNames[v]?.let { LT("గుర్తు పేరు: $it", "te", style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted) }
        Text("Full గుణింతం of $c", style = MaterialTheme.typography.labelLarge, color = WL.colors.muted)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(5.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            (b.gunintham[c] ?: emptyList()).forEachIndexed { i, sy -> LKeyBtn(sy, "te", { pick(c, b.guninthamVowels[i]) }, selected = b.guninthamVowels[i] == v, minSize = 44.dp) }
        }
    }, pickers = {
        Picker("హల్లు (consonant)", b.consonants, c, "te") { pick(it, v) }
        Picker("అచ్చు (vowel sign)", b.guninthamVowels, v, "te") { pick(c, it) }
    })
}

@Composable
fun OttuBuilder(sayer: Sayer) {
    val b = rememberBuilders() ?: return
    var a by rememberSaveable { mutableStateOf("క") }
    var s by rememberSaveable { mutableStateOf("క") }
    val out = a + b.virama + s
    BuilderLayout("ఒత్తు తయారీ", "(Conjunct builder)", out = {
        OutRow {
            Mid(a); Mid("+"); Mid("$s ఒత్తు"); Mid("=")
            Big(out)
            SpeakButton({ sayer.say(out, "te") }, size = 44.dp)
        }
        Row { LT(if (a == s) "ద్విత్వాక్షరం (double)" else "సంయుక్తాక్షరం (mixed)", "te", style = MaterialTheme.typography.titleMedium, color = WL.colors.mathInk) }
    }, pickers = {
        Picker("మొదటి హల్లు (first consonant)", b.ottuOptions, a, "te") { a = it }
        Picker("ఒత్తుగా వచ్చే హల్లు (consonant written below)", b.ottuOptions, s, "te") { s = it }
    })
}

@Composable
fun CvcBuilder(sayer: Sayer) {
    val b = rememberBuilders() ?: return
    var w0 by rememberSaveable { mutableStateOf("c") }
    var w1 by rememberSaveable { mutableStateOf("a") }
    var w2 by rememberSaveable { mutableStateOf("t") }
    val w = listOf(w0, w1, w2)
    val word = w.joinToString("")
    val real = word in b.cvc.real
    WLCard(Modifier.fillMaxWidth(), padding = 14.dp, flat = true) {
        Text("Word builder", style = MaterialTheme.typography.titleLarge, color = WL.colors.text)
        Column(Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            OutRow {
                w.forEach { LT(it, "en", fontSize = 34.sp, weight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 4.dp)) }
                Mid("→", "en")
                Big(word, "en")
                Pill(if (real) "✓ a real word" else "a made-up word", bg = if (real) WL.colors.goodBg else WL.colors.surface2, fg = if (real) WL.colors.good else WL.colors.text)
                SpeakButton({ sayer.say("${w.joinToString(", ")}. $word", "en") }, size = 44.dp)
            }
            Picker("First sound", b.cvc.onsets, w0, "en") { w0 = it }
            Picker("Middle vowel", b.cvc.vowels, w1, "en") { w1 = it }
            Picker("Last sound", b.cvc.codas, w2, "en") { w2 = it }
        }
    }
}
