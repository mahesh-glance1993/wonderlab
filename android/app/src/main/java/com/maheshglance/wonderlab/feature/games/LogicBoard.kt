package com.maheshglance.wonderlab.feature.games

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Backspace
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.pressable
import kotlin.math.ceil
import kotlin.math.min

@Composable
fun LogicBoard(b: BoardState) {
    val kind = b.round.j("kind").str() ?: "sudoku"
    val magic = kind == "magic"
    val n = b.view.j("n").int() ?: 4
    val br = b.view.j("br").int() ?: 2
    val bc = b.view.j("bc").int() ?: 2
    val givens = b.round.j("givens").ints()
    val grid = b.progress.j("grid").ints()
    val sel = b.progress.j("sel").int() ?: 0
    val conflicts = b.view.j("conflicts").ints().toSet()
    val sums = b.view.j("sums").list()
    val palette = b.view.j("palette").ints()
    val total = b.round.j("total").int() ?: 0
    val lang = b.lang
    val c = WL.colors
    fun isGiven(i: Int) = (givens.getOrNull(i) ?: 0) != 0

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val wide = maxWidth > maxHeight * 1.15f
        val palCount = palette.size + 2
        // palette layout: as many per row as fit
        val gridArea = @Composable { side: Dp ->
            val sumW = if (magic) 34.dp else 0.dp
            val g = side - sumW
            val cell = g / n
            Column {
                Row {
                    Column(Modifier.size(g).shadow(6.dp, RoundedCornerShape(12.dp)).clip(RoundedCornerShape(12.dp)).background(c.surface).border(3.dp, c.text, RoundedCornerShape(12.dp))) {
                        for (r in 0 until n) Row {
                            for (col in 0 until n) {
                                val i = r * n + col
                                val v = grid.getOrNull(i) ?: 0
                                val bad = conflicts.contains(i)
                                val given = isGiven(i)
                                Box(
                                    Modifier.size(cell)
                                        .background(when { i == sel -> c.math; bad -> c.badBg; given -> c.surface2; else -> c.surface })
                                        .semantics {
                                            selected = i == sel
                                            contentDescription = "${if (lang == "te") "వరుస" else "Row"} ${r + 1}, ${if (lang == "te") "నిలువు" else "column"} ${col + 1}: ${if (v != 0) v else if (lang == "te") "ఖాళీ" else "empty"}${if (given) " (given)" else ""}${if (bad) " — repeats" else ""}"
                                        }
                                        .pressable(sound = false) { b.act(action("sel", "i" to i)) },
                                    contentAlignment = Alignment.Center,
                                ) {
                                    if (v != 0) Text("$v", fontSize = (cell.value * .5f).sp, fontWeight = if (given) FontWeight.Black else FontWeight.Bold, color = if (bad) c.bad else if (given) c.text else c.primary)
                                    if (bad) Text("!", color = c.bad, fontWeight = FontWeight.Black, fontSize = (cell.value * .28f).sp, modifier = Modifier.align(Alignment.TopEnd).padding(end = 3.dp))
                                }
                            }
                        }
                    }
                    if (magic) Column(Modifier.width(sumW).padding(start = 4.dp)) { for (r in 0 until 3) Box(Modifier.size(sumW - 4.dp, cell), contentAlignment = Alignment.Center) { SumBadge(sums.getOrNull(r), total) } }
                }
                if (magic) Row(verticalAlignment = Alignment.CenterVertically) {
                    for (col in 0 until 3) Box(Modifier.size(cell, 28.dp), contentAlignment = Alignment.Center) { SumBadge(sums.getOrNull(3 + col), total) }
                    Row(Modifier.padding(start = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("↘", color = c.muted); SumBadge(sums.getOrNull(6), total); Text(" ↙", color = c.muted); SumBadge(sums.getOrNull(7), total)
                    }
                }
            }
            // box borders over the grid are drawn by a canvas overlay below
            @Suppress("UNUSED_EXPRESSION") Offset.Zero
        }
        val pal = @Composable { perRow: Int, key: Dp ->
            Column(verticalArrangement = Arrangement.spacedBy(6.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                palette.chunked(perRow).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        row.forEach { v ->
                            val usedUp = magic && grid.contains(v)
                            KeyButton({ b.act(action("set", "v" to v)) }, Modifier.size(key), enabled = !b.solved && !isGiven(sel), bg = if (usedUp) c.surface2 else c.surface, minSize = key) {
                                Text("$v", fontSize = (key.value * .42f).sp, fontWeight = FontWeight.Black, color = if (usedUp) c.muted else c.text)
                            }
                        }
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    WLButton(if (lang == "te") "తుడిచివేయి" else "Erase", { b.act(action("erase")) }, icon = Icons.Rounded.Backspace, enabled = !b.solved && !isGiven(sel), small = true)
                    WLButton(if (lang == "te") "సరిచూడు" else "Check", { b.act(action("check")) }, icon = Icons.Rounded.Check, kind = BtnKind.Primary, enabled = !b.solved, small = true)
                }
            }
        }
        val bw = maxWidth; val bh = maxHeight
        if (wide) {
            val side = min(maxHeight.value, maxWidth.value * 0.58f).dp
            Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally), verticalAlignment = Alignment.CenterVertically) {
                Box { gridArea(side - if (magic) 30.dp else 0.dp); if (!magic) BoxLines(side, n, br, bc) }
                val avail = bw - side - 12.dp
                val perRow = if (palette.size > 6) 3 else 2
                pal(perRow, min(((avail.value - 6 * (perRow - 1)) / perRow), (bh.value - 60) / ceil(palette.size / perRow.toDouble()).toFloat() - 6).coerceIn(40f, 72f).dp)
            }
        } else {
            val perRow = if (palette.size <= 6 || maxWidth > 520.dp) palette.size else ceil(palette.size / 2.0).toInt()
            val palRows = ceil(palette.size / perRow.toDouble()).toInt()
            val key = min((maxWidth.value - 6 * (perRow - 1)) / perRow, 60f).coerceAtLeast(36f).dp
            val palH = key * palRows + 6.dp * palRows + 50.dp
            val side = min(maxWidth.value, (maxHeight - palH - 10.dp - if (magic) 30.dp else 0.dp).value).coerceAtLeast(120f).dp
            Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceEvenly, horizontalAlignment = Alignment.CenterHorizontally) {
                Box { gridArea(side); if (!magic) BoxLines(side, n, br, bc) }
                pal(perRow, key)
            }
        }
        @Suppress("UNUSED_EXPRESSION") palCount
    }
}

/** Thick lines between sudoku boxes. */
@Composable
private fun BoxLines(side: Dp, n: Int, br: Int, bc: Int) {
    val ink = WL.colors.text
    Canvas(Modifier.size(side)) {
        val cell = size.width / n
        for (c in 1 until n) if (c % bc == 0) drawLine(ink, Offset(c * cell, 0f), Offset(c * cell, size.height), strokeWidth = 3.dp.toPx())
        else drawLine(ink.copy(alpha = .18f), Offset(c * cell, 0f), Offset(c * cell, size.height), strokeWidth = 1.dp.toPx())
        for (r in 1 until n) if (r % br == 0) drawLine(ink, Offset(0f, r * cell), Offset(size.width, r * cell), strokeWidth = 3.dp.toPx())
        else drawLine(ink.copy(alpha = .18f), Offset(0f, r * cell), Offset(size.width, r * cell), strokeWidth = 1.dp.toPx())
    }
}

@Composable
private fun SumBadge(s: kotlinx.serialization.json.JsonElement?, total: Int) {
    val full = s.j("full").bool() == true
    val ok = s.j("ok").bool() == true
    val c = WL.colors
    Text(
        "${s.j("sum").int() ?: 0}${if (full) if (ok) "✓" else "✗" else ""}",
        Modifier.clip(RoundedCornerShape(8.dp)).background(if (!full) c.surface2 else if (ok) c.goodBg else c.badBg).padding(horizontal = 4.dp, vertical = 1.dp)
            .semantics { contentDescription = "${s.j("sum").int() ?: 0} of $total" },
        style = MaterialTheme.typography.labelSmall, color = if (!full) c.muted else if (ok) c.good else c.bad,
    )
    @Suppress("UNUSED_EXPRESSION") Color.Unspecified
}
