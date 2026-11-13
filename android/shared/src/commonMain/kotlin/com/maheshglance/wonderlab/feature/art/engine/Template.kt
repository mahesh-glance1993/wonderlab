package com.maheshglance.wonderlab.feature.art.engine

import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Canvas
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Matrix
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.PaintingStyle
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.rememberTextMeasurer
import com.maheshglance.wonderlab.core.engine.Engine
import kotlinx.atomicfu.locks.SynchronizedObject
import kotlinx.atomicfu.locks.synchronized
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.serializer
import kotlin.concurrent.Volatile
import kotlin.math.min

@Serializable data class DrawItem(val d: String, val m: List<Float>, val sw: Float, val fill: String? = null, val stroke: String? = null, val clip: List<Float>? = null)
@Serializable data class DrawText(val x: Float, val y: Float, val text: String, val size: Float, val anchor: String = "start", val bold: Boolean = false, val m: List<Float>, val fill: String = "#1d1d1d")
@Serializable data class DrawList(val w: Float, val h: Float, val items: List<DrawItem>, val texts: List<DrawText> = emptyList())

@Serializable data class ColoringPage(val id: String, val title: String, val titleTe: String, val category: String, val level: String)
@Serializable data class PageCategory(val id: String, val label: String, val labelTe: String)

/**
 * Colouring pages: the website's own SVG line art, converted by the engine (art.pageDrawList) into path
 * commands and drawn natively (crisp vector outlines at any size — screen, canvas layer or print).
 */
object Templates {
    private val lock = SynchronizedObject()
    private val lists = HashMap<String, DrawList>()
    @Volatile private var pageList: List<ColoringPage>? = null
    @Volatile private var catList: List<PageCategory>? = null

    suspend fun pages(engine: Engine): List<ColoringPage> = pageList ?: engine.get(ListSerializer(serializer<ColoringPage>()), "art.pages").also { pageList = it }
    suspend fun categories(engine: Engine): List<PageCategory> = catList ?: engine.get(ListSerializer(serializer<PageCategory>()), "art.categories").also { catList = it }

    suspend fun drawList(engine: Engine, id: String): DrawList? {
        cached(id)?.let { return it }
        val e = engine.call("art.pageDrawList", id)
        if (e !is JsonObject) return null
        return com.maheshglance.wonderlab.core.engine.AppJson.decodeFromJsonElement(DrawList.serializer(), e).also { synchronized(lock) { lists[id] = it } }
    }
    fun cached(id: String): DrawList? = synchronized(lock) { lists[id] }

    /**
     * Text in page artwork is laid out with a Compose TextMeasurer, which can only be made inside a composable.
     * Every art screen calls [rememberTextSupport] once so off-screen rendering (canvas layers, print, export)
     * can draw page text too.
     */
    @Volatile var textMeasurer: TextMeasurer? = null

    @Composable fun rememberTextSupport() {
        val tm = rememberTextMeasurer(cacheSize = 0)
        SideEffect { textMeasurer = tm }
    }

    private class Prepared(val path: Path, val m: Matrix, val sw: Float, val fill: Int?, val stroke: Int?, val clip: List<Float>?)
    private val prepared = HashMap<String, List<Prepared>>()

    /** 2-D affine [a, b, c, d, e, f] (SVG order) as a Compose 4×4 matrix. */
    private fun matrix(m: List<Float>) = Matrix().apply {
        values[Matrix.ScaleX] = m[0]; values[Matrix.SkewY] = m[1]
        values[Matrix.SkewX] = m[2]; values[Matrix.ScaleY] = m[3]
        values[Matrix.TranslateX] = m[4]; values[Matrix.TranslateY] = m[5]
    }

    private fun prepare(id: String, dl: DrawList): List<Prepared> {
        synchronized(lock) { prepared[id] }?.let { return it }
        val list = dl.items.mapNotNull { it ->
            runCatching {
                val p = PathParser().parsePathString(it.d).toPath()
                Prepared(p, matrix(it.m), it.sw, it.fill?.let { f -> ArtColor.argb(f) }, it.stroke?.let { s -> ArtColor.argb(s) }, it.clip)
            }.getOrNull()
        }
        return synchronized(lock) { prepared.getOrPut(id) { list } }
    }

    /**
     * Draws a page into `canvas` fitted inside the rectangle (x, y, w, h), keeping aspect, like the website
     * drawing its SVG image into the template layer. `dotted` draws dashed grey outlines (print previews).
     */
    fun draw(canvas: Canvas, id: String, dl: DrawList, x: Float, y: Float, w: Float, h: Float, inkColor: Int? = null, lineScale: Float = 1f, text: TextMeasurer? = textMeasurer) {
        val s = min(w / dl.w, h / dl.h)
        val ox = x + (w - dl.w * s) / 2; val oy = y + (h - dl.h * s) / 2
        val paint = Paint().apply { isAntiAlias = true; strokeCap = StrokeCap.Round; strokeJoin = StrokeJoin.Round }
        for (it in prepare(id, dl)) {
            canvas.save()
            canvas.translate(ox, oy); canvas.scale(s, s)
            it.clip?.let { c -> canvas.clipRect(c[0], c[1], c[0] + c[2], c[1] + c[3]) }
            canvas.concat(it.m)
            if (it.fill != null) { paint.style = PaintingStyle.Fill; paint.color = Color(inkColor ?: it.fill); canvas.drawPath(it.path, paint) }
            if (it.stroke != null) {
                paint.style = PaintingStyle.Stroke; paint.color = Color(inkColor ?: it.stroke); paint.strokeWidth = it.sw * lineScale
                canvas.drawPath(it.path, paint)
            }
            canvas.restore()
        }
        if (text == null || dl.texts.isEmpty()) return
        for (t in dl.texts) {
            canvas.save()
            canvas.translate(ox, oy); canvas.scale(s, s); canvas.concat(matrix(t.m))
            val anchor = when (t.anchor) { "middle" -> TextAnchor.Middle; "end" -> TextAnchor.End; else -> TextAnchor.Start }
            canvas.drawArtText(text, t.text, t.x, t.y, t.size, Color(inkColor ?: ArtColor.argb(t.fill)), anchor, t.bold)
            canvas.restore()
        }
    }
}
