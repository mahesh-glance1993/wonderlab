package com.maheshglance.wonderlab.feature.lesson

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import kotlinx.serialization.json.JsonObject
import kotlin.math.abs
import kotlin.math.roundToInt

private data class EVar(val sym: String, val name: String, val unit: String?, val min: Double, val max: Double, val step: Double, val value: Double)

/**
 * Interactive "what if?" formula explorer (lesson block `explore`): sliders for every input, the result updated live,
 * and a plain-language explanation of what changed and WHY (direct / inverse / square …), plus common mistakes.
 */
@Composable
fun FormulaExplorer(spec: JsonObject) {
    val c = WL.colors
    val lang = WL.lang
    val res = spec.obj("result") ?: return
    val expr = res.str("expr") ?: return
    val resSym = res.str("sym") ?: "y"
    val resName = L(res.loc("name"))
    val resUnit = res.str("unit")
    val decimals = res.num("decimals")?.toInt() ?: 2
    val vars = remember(spec) {
        spec.arr("vars")?.mapNotNull { e ->
            (e as? JsonObject)?.let { v ->
                EVar(v.str("sym") ?: return@let null, v.loc("name")?.get(lang) ?: "", v.str("unit"), v.num("min") ?: 0.0, v.num("max") ?: 10.0, v.num("step") ?: 1.0, v.num("value") ?: 1.0)
            }
        } ?: emptyList()
    }
    val names = vars.associate { it.sym to it.name }
    val values = remember(spec) { mutableStateMapOf<String, Double>().apply { vars.forEach { put(it.sym, it.value) } } }
    var why by remember(spec) { mutableStateOf("") }
    val notes = spec.arr("notes")?.mapNotNull { it as? JsonObject } ?: emptyList()
    val result = Formula.safeEval(expr, values.toMap())
    // result range across the sliders (for the gauge)
    val range = remember(spec) {
        val pts = buildList { vars.forEach { v -> listOf(v.min, v.max).forEach { x -> add(Formula.safeEval(expr, vars.associate { it.sym to it.value } + (v.sym to x))) } } }.filter { it.isFinite() }
        (pts.minOrNull() ?: 0.0) to (pts.maxOrNull() ?: 1.0)
    }
    val frac = if (result.isFinite() && range.second > range.first) ((result - range.first) / (range.second - range.first)).toFloat().coerceIn(0.03f, 1f) else 0.5f
    val gauge by animateFloatAsState(frac, tween(350), label = "gauge")

    Column(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(c.surface).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            EmojiImage("🧪", 32.dp)
            Column(Modifier.weight(1f)) {
                Text(L(spec.loc("title")).ifBlank { "What if?" }, style = MaterialTheme.typography.titleLarge, color = c.text)
                Text("Move the sliders and watch what happens.", style = MaterialTheme.typography.bodySmall, color = c.muted)
            }
        }
        Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(c.math).padding(vertical = 10.dp), contentAlignment = Alignment.Center) {
            Text(spec.str("formula") ?: "", style = MaterialTheme.typography.headlineSmall.copy(fontFamily = FontFamily.Serif, fontWeight = FontWeight.SemiBold), color = c.mathInk)
        }
        vars.forEach { v ->
            val cur = values[v.sym] ?: v.value
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("${v.sym} · ${v.name}", Modifier.weight(1f), style = MaterialTheme.typography.labelLarge, color = c.text)
                    Text("${Formula.fmt(cur, 3)}${v.unit?.let { " $it" } ?: ""}", style = MaterialTheme.typography.titleMedium, color = c.mathInk)
                }
                Slider(
                    value = cur.toFloat(),
                    onValueChange = { raw ->
                        val snapped = (v.min + ((raw - v.min) / v.step).roundToInt() * v.step).coerceIn(v.min, v.max)
                        val before = values.toMap()
                        if (abs(snapped - cur) > 1e-12) {
                            values[v.sym] = snapped
                            why = explain(expr, resSym, resName, resUnit, decimals, v, before, values.toMap(), notes, lang)
                        }
                    },
                    valueRange = v.min.toFloat()..v.max.toFloat(),
                    colors = SliderDefaults.colors(thumbColor = c.primary, activeTrackColor = c.primary),
                    modifier = Modifier.semantics { contentDescription = "${v.name}, ${Formula.fmt(cur, 3)} ${v.unit ?: ""}" },
                )
            }
        }
        // result + gauge
        Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(c.goodBg).padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("$resName ($resSym) = ${Formula.fmt(result, decimals)}${resUnit?.let { " $it" } ?: ""}", style = MaterialTheme.typography.titleLarge, color = c.good)
            Box(Modifier.fillMaxWidth().height(14.dp).clip(RoundedCornerShape(7.dp)).background(c.surface)) {
                Box(Modifier.fillMaxWidth(gauge).height(14.dp).clip(RoundedCornerShape(7.dp)).background(c.good))
            }
        }
        AnimatedContent(why, transitionSpec = { fadeIn(tween(250)) togetherWith fadeOut(tween(150)) }, label = "why") { w ->
            if (w.isNotBlank()) Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(c.warnBg).padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.Top,
            ) {
                EmojiImage("💡", 26.dp)
                Text(w, style = MaterialTheme.typography.bodyLarge, color = c.text)
            }
        }
        spec.loc("realWorld")?.let { rw -> Text("In real life: ${L(rw)}", style = MaterialTheme.typography.bodyMedium, color = c.muted) }
        val mistakes = spec.arr("mistakes")?.mapNotNull { it as? JsonObject } ?: emptyList()
        if (mistakes.isNotEmpty()) {
            var open by remember { mutableStateOf(false) }
            WLButton(if (open) "Hide common mistakes" else "Common mistakes (${mistakes.size})", { open = !open }, small = true, kind = BtnKind.Normal)
            if (open) mistakes.forEach { m ->
                Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(c.badBg).padding(10.dp)) {
                    Text("✗ ${L(m.loc("wrong"))}", style = MaterialTheme.typography.labelLarge, color = c.bad)
                    Text(L(m.loc("why")), style = MaterialTheme.typography.bodyMedium, color = c.text)
                }
            }
        }
        WLButton("Reset", { vars.forEach { values[it.sym] = it.value }; why = "" }, small = true)
        if (names.isEmpty()) Text("—", textAlign = TextAlign.Center)
    }
}

private fun explain(expr: String, resSym: String, resName: String, resUnit: String?, decimals: Int, v: EVar, from: Map<String, Double>, to: Map<String, Double>, notes: List<JsonObject>, lang: String): String {
    val r0 = Formula.safeEval(expr, from); val r1 = Formula.safeEval(expr, to)
    val up = (to[v.sym] ?: 0.0) > (from[v.sym] ?: 0.0)
    val u = { s: String? -> s?.let { " $it" } ?: "" }
    val moved = "${v.name} (${v.sym}) ${if (up) "went up" else "went down"} to ${Formula.fmt(to[v.sym] ?: 0.0, 3)}${u(v.unit)}"
    val resLine = when {
        r1 > r0 -> "$resName rose to ${Formula.fmt(r1, decimals)}${u(resUnit)}"
        r1 < r0 -> "$resName fell to ${Formula.fmt(r1, decimals)}${u(resUnit)}"
        else -> "$resName stayed at ${Formula.fmt(r0, decimals)}${u(resUnit)}"
    }
    val rel = Formula.relation(expr, v.sym, from, v.max)
    val note = notes.firstOrNull { it.str("sym") == v.sym }?.let { n -> n.loc(if (up) "up" else "down")?.get(lang) }
    return "$moved, so $resLine. ${Formula.why(rel, resSym, v.sym)}" + (note?.let { " $it" } ?: "")
}
