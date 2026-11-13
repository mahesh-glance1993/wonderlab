package com.maheshglance.wonderlab.feature.art.engine

import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Typeface
import androidx.compose.ui.graphics.asAndroidPath
import androidx.compose.ui.graphics.vector.PathParser
import com.maheshglance.wonderlab.core.engine.Engine
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.serializer
import java.util.concurrent.ConcurrentHashMap
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
    private val lists = ConcurrentHashMap<String, DrawList>()
    @Volatile private var pageList: List<ColoringPage>? = null
    @Volatile private var catList: List<PageCategory>? = null

    suspend fun pages(engine: Engine): List<ColoringPage> = pageList ?: engine.get(ListSerializer(serializer<ColoringPage>()), "art.pages").also { pageList = it }
    suspend fun categories(engine: Engine): List<PageCategory> = catList ?: engine.get(ListSerializer(serializer<PageCategory>()), "art.categories").also { catList = it }

    suspend fun drawList(engine: Engine, id: String): DrawList? {
        lists[id]?.let { return it }
        val e = engine.call("art.pageDrawList", id)
        if (e !is JsonObject) return null
        return com.maheshglance.wonderlab.core.engine.AppJson.decodeFromJsonElement(DrawList.serializer(), e).also { lists[id] = it }
    }
    fun cached(id: String) = lists[id]

    private class Prepared(val path: Path, val m: Matrix, val sw: Float, val fill: Int?, val stroke: Int?, val clip: List<Float>?)
    private val prepared = ConcurrentHashMap<String, List<Prepared>>()

    private fun matrix(m: List<Float>) = Matrix().apply { setValues(floatArrayOf(m[0], m[2], m[4], m[1], m[3], m[5], 0f, 0f, 1f)) }

    private fun prepare(id: String, dl: DrawList): List<Prepared> = prepared.getOrPut(id) {
        dl.items.mapNotNull { it ->
            runCatching {
                val p = PathParser().parsePathString(it.d).toPath().asAndroidPath()
                Prepared(p, matrix(it.m), it.sw, it.fill?.let { f -> ArtColor.argb(f) }, it.stroke?.let { s -> ArtColor.argb(s) }, it.clip)
            }.getOrNull()
        }
    }

    /**
     * Draws a page into `canvas` fitted inside the rectangle (x, y, w, h), keeping aspect, like the website
     * drawing its SVG image into the template layer. `dotted` draws dashed grey outlines (print previews).
     */
    fun draw(canvas: Canvas, id: String, dl: DrawList, x: Float, y: Float, w: Float, h: Float, inkColor: Int? = null, lineScale: Float = 1f) {
        val s = min(w / dl.w, h / dl.h)
        val ox = x + (w - dl.w * s) / 2; val oy = y + (h - dl.h * s) / 2
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { strokeCap = Paint.Cap.ROUND; strokeJoin = Paint.Join.ROUND }
        for (it in prepare(id, dl)) {
            canvas.save()
            canvas.translate(ox, oy); canvas.scale(s, s)
            it.clip?.let { c -> canvas.clipRect(c[0], c[1], c[0] + c[2], c[1] + c[3]) }
            canvas.concat(it.m)
            if (it.fill != null) { paint.style = Paint.Style.FILL; paint.color = inkColor ?: it.fill; canvas.drawPath(it.path, paint) }
            if (it.stroke != null) {
                paint.style = Paint.Style.STROKE; paint.color = inkColor ?: it.stroke; paint.strokeWidth = it.sw * lineScale
                canvas.drawPath(it.path, paint)
            }
            canvas.restore()
        }
        val tp = Paint(Paint.ANTI_ALIAS_FLAG)
        for (t in dl.texts) {
            canvas.save()
            canvas.translate(ox, oy); canvas.scale(s, s); canvas.concat(matrix(t.m))
            tp.color = inkColor ?: ArtColor.argb(t.fill); tp.textSize = t.size
            tp.typeface = Typeface.create(Typeface.SANS_SERIF, if (t.bold) Typeface.BOLD else Typeface.NORMAL)
            tp.textAlign = when (t.anchor) { "middle" -> Paint.Align.CENTER; "end" -> Paint.Align.RIGHT; else -> Paint.Align.LEFT }
            canvas.drawText(t.text, t.x, t.y, tp)
            canvas.restore()
        }
    }
}
