package com.maheshglance.wonderlab.feature.art.tracing

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.PaintingStyle
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.text.TextMeasurer
import com.maheshglance.wonderlab.core.engine.Engine
import com.maheshglance.wonderlab.feature.art.engine.TextAnchor
import com.maheshglance.wonderlab.feature.art.engine.Templates
import com.maheshglance.wonderlab.feature.art.engine.drawArtText
import kotlinx.atomicfu.locks.SynchronizedObject
import kotlinx.atomicfu.locks.synchronized
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.serializer
import kotlin.concurrent.Volatile
import kotlin.math.max
import kotlin.math.min

@Serializable data class Arrow(val x: Float, val y: Float, val angle: Float)
@Serializable data class Guide(
    val id: String, val label: String, val say: String, val sayTe: String? = null, val strokes: List<String> = emptyList(),
    val box: List<Float>, val lines: List<Float>? = null, val polys: List<List<List<Float>>>, val arrows: List<List<Arrow>>, val lengths: List<Float>,
)
@Serializable data class SheetSummary(val id: String, val title: String, val titleTe: String, val icon: String, val minTier: String? = null, val count: Int, val preview: Guide)
@Serializable data class Sheet(val id: String, val title: String, val titleTe: String, val icon: String, val minTier: String? = null, val guides: List<Guide>)
@Serializable data class StrokeCheck(val coverage: Float, val accuracy: Float, val forward: Boolean)
@Serializable data class Guided(val ok: Boolean, val check: StrokeCheck, val message: String)
@Serializable data class TraceScore(
    val coverage: Float, val accuracy: Float, val score: Float, val stars: Int, val perStroke: List<Float>, val matched: List<Int>,
    val orderOk: Boolean, val directionOk: Boolean, val feedback: List<String>,
)

object TraceData {
    @Volatile private var list: List<SheetSummary>? = null
    private val lock = SynchronizedObject()
    private val sheets = HashMap<String, Sheet>()
    suspend fun sheets(engine: Engine): List<SheetSummary> = list ?: engine.get(ListSerializer(serializer<SheetSummary>()), "art.sheets").also { list = it }
    suspend fun sheet(engine: Engine, id: String): Sheet? {
        synchronized(lock) { sheets[id] }?.let { return it }
        val e = engine.call("art.sheet", id)
        if (e !is kotlinx.serialization.json.JsonObject) return null
        val s = com.maheshglance.wonderlab.core.engine.AppJson.decodeFromJsonElement(Sheet.serializer(), e)
        synchronized(lock) { sheets[id] = s }
        return s
    }
}

/** Colours from the website's trace-* styles. */
object TraceColors {
    const val RULE = 0xFF9CC3DD.toInt()
    const val BAND = 0xFFE6E1D4.toInt()
    const val BAND_DONE = 0xFFCFE6D6.toInt()
    const val CENTER = 0xFF9A9282.toInt()
    const val ARROW = 0xFF2F6F9A.toInt()
    const val START = 0xFF2F8A57.toInt()
    const val ANIM = 0xFFD0743C.toInt()
    const val INK = 0xFF2A5DB0.toInt()
    const val MODEL = 0xFFB9B2A2.toInt()
    const val DOTS = 0xFF8A8374.toInt()
    const val BOARD = 0xFFFFFDF7.toInt()
}

enum class GuideMode { Screen, PrintModel, PrintDotted }

/**
 * Draws a guide (native port of GuideSvg) into a Canvas whose coordinate space is already the
 * guide's box units: writing lines, tolerance band, dashed centre line, arrows, numbered green start dots,
 * and the "Show me" animated stroke (`anim` = seconds since start, or null).
 */
object GuideDraw {
    private fun path(pl: List<List<Float>>, upTo: Float = Float.MAX_VALUE): Path {
        val p = Path()
        if (pl.isEmpty()) return p
        p.moveTo(pl[0][0], pl[0][1])
        var acc = 0f
        for (i in 1 until pl.size) {
            val a = pl[i - 1]; val b = pl[i]
            val d = kotlin.math.hypot(b[0] - a[0], b[1] - a[1])
            if (acc + d >= upTo) { val k = if (d > 0) (upTo - acc) / d else 0f; p.lineTo(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k); return p }
            acc += d
            p.lineTo(b[0], b[1])
        }
        return p
    }

    private fun Paint.setColor(argb: Int, a255: Int = 255) { color = Color(argb); alpha = a255.coerceIn(0, 255) / 255f }

    fun draw(
        c: Canvas, g: Guide, tol: Float, guidance: Boolean, mode: GuideMode = GuideMode.Screen,
        current: Int = -1, done: List<Boolean> = emptyList(), anim: Float? = null, reduced: Boolean = false,
        text: TextMeasurer? = Templates.textMeasurer,
    ) {
        val bx = g.box[0]; val bw = g.box[2]; val bh = g.box[3]
        val u = bh / 100f
        val p = Paint().apply { isAntiAlias = true; style = PaintingStyle.Stroke; strokeCap = StrokeCap.Round; strokeJoin = StrokeJoin.Round }
        g.lines?.forEachIndexed { i, y ->
            p.setColor(TraceColors.RULE); p.strokeWidth = 0.5f; p.strokeCap = StrokeCap.Butt
            p.pathEffect = if (i == 1 && g.lines.size > 3) PathEffect.dashPathEffect(floatArrayOf(2f, 2f), 0f) else null
            c.drawLine(Offset(bx, y), Offset(bx + bw, y), p)
        }
        p.pathEffect = null; p.strokeCap = StrokeCap.Round
        val focus = { i: Int -> current < 0 || i == current }
        if (mode == GuideMode.Screen) g.polys.forEachIndexed { i, pl ->
            p.setColor(if (done.getOrNull(i) == true) TraceColors.BAND_DONE else TraceColors.BAND, if (focus(i)) 255 else 115)
            p.strokeWidth = tol * 2
            c.drawPath(path(pl), p)
        }
        g.polys.forEach { pl ->
            when (mode) {
                GuideMode.PrintDotted -> { p.setColor(TraceColors.DOTS); p.strokeWidth = 2.6f * u; p.pathEffect = PathEffect.dashPathEffect(floatArrayOf(0.01f, 5f), 0f) }
                GuideMode.PrintModel -> { p.setColor(TraceColors.MODEL); p.strokeWidth = 2f * u; p.pathEffect = null }
                GuideMode.Screen -> { p.setColor(TraceColors.CENTER); p.strokeWidth = 1.2f * u; p.pathEffect = PathEffect.dashPathEffect(floatArrayOf(2f, 2.5f), 0f) }
            }
            c.drawPath(path(pl), p)
        }
        p.pathEffect = null
        val print = mode != GuideMode.Screen
        if ((guidance || print) && mode != GuideMode.PrintDotted) {
            g.polys.forEachIndexed { i, pl ->
                if (pl.isEmpty()) return@forEachIndexed
                val a = if (focus(i) || print) 255 else 90
                p.setColor(TraceColors.ARROW, a); p.strokeWidth = 1.1f * u; p.style = PaintingStyle.Stroke
                g.arrows.getOrNull(i)?.forEach { ar ->
                    c.save(); c.translate(ar.x, ar.y); c.rotate(toDegrees(ar.angle.toDouble()).toFloat())
                    val ap = Path().apply { moveTo(-2.6f * u, -2.6f * u); lineTo(1.8f * u, 0f); lineTo(-2.6f * u, 2.6f * u) }
                    c.drawPath(ap, p)
                    if (reduced && anim != null && !print) {
                        c.drawArtText(text, "${i + 1}", 0f, -4.2f * u, 4.5f * u, Color(TraceColors.ARROW).copy(alpha = a / 255f), TextAnchor.Middle, bold = true)
                    }
                    c.restore()
                }
                val f = Paint().apply { isAntiAlias = true; setColor(TraceColors.START, a) }
                c.drawCircle(Offset(pl[0][0], pl[0][1]), 3.6f * u, f)
                f.style = PaintingStyle.Stroke; f.setColor(0xFFFFFFFF.toInt(), a); f.strokeWidth = 0.6f
                c.drawCircle(Offset(pl[0][0], pl[0][1]), 3.6f * u, f)
                c.drawArtText(text, "${i + 1}", pl[0][0], pl[0][1] + 1.6f * u, 4.4f * u, Color.White.copy(alpha = a / 255f), TextAnchor.Middle, bold = true)
            }
        }
        if (anim != null && !reduced && mode == GuideMode.Screen) {
            val total = max(1f, g.lengths.sum())
            var acc = 0f
            p.setColor(TraceColors.ANIM, 230); p.strokeWidth = 3f * u; p.style = PaintingStyle.Stroke
            g.polys.forEachIndexed { i, pl ->
                val l = g.lengths.getOrElse(i) { 0f }
                val dur = max(0.5f, (l / total) * min(6f, 1.2f + total / 60f))
                val t = ((anim - acc) / dur).coerceIn(0f, 1f)
                if (t > 0f) c.drawPath(path(pl, l * t), p)
                acc += dur + 0.25f
            }
        }
    }

    /** Total "Show me" animation length in seconds (same timing as the website). */
    fun animLength(g: Guide): Float {
        val total = max(1f, g.lengths.sum())
        return g.lengths.sumOf { l -> (max(0.5f, (l / total) * min(6f, 1.2f + total / 60f)) + 0.25f).toDouble() }.toFloat()
    }
}
