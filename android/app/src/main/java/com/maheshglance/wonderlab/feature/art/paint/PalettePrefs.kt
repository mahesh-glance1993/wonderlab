package com.maheshglance.wonderlab.feature.art.paint

import com.maheshglance.wonderlab.WonderLabApp
import com.maheshglance.wonderlab.feature.art.engine.Calibration
import com.maheshglance.wonderlab.feature.art.engine.Palette
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.floatOrNull
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

/** Learner prefs used by the studio: pen calibration and saved palettes (prefs.calibration / prefs.artPalettes). */
object PalettePrefs {
    fun calibration(app: WonderLabApp): Calibration? {
        val o = app.repo.state.value.prefs.calibration as? JsonObject ?: return null
        val mn = (o["min"] as? JsonPrimitive)?.floatOrNull ?: return null
        val mx = (o["max"] as? JsonPrimitive)?.floatOrNull ?: return null
        return Calibration(mn, mx)
    }

    fun saveCalibration(app: WonderLabApp, c: Calibration?) {
        app.repo.updatePrefs(mapOf("calibration" to (c?.let { buildJsonObject { put("min", it.min); put("max", it.max) } } ?: JsonNull)))
    }

    fun read(app: WonderLabApp): List<Palette> {
        val a = app.repo.state.value.prefs.artPalettes as? JsonArray ?: return emptyList()
        return a.mapNotNull { e ->
            val o = e as? JsonObject ?: return@mapNotNull null
            Palette(
                (o["id"] as? JsonPrimitive)?.contentOrNull ?: return@mapNotNull null,
                (o["name"] as? JsonPrimitive)?.contentOrNull ?: "Palette",
                (o["colors"] as? JsonArray)?.mapNotNull { (it as? JsonPrimitive)?.contentOrNull } ?: emptyList(),
            )
        }
    }

    fun write(app: WonderLabApp, list: List<Palette>) {
        app.repo.updatePrefs(mapOf("artPalettes" to JsonArray(list.map { p ->
            buildJsonObject { put("id", p.id); put("name", p.name); put("colors", JsonArray(p.colors.map { JsonPrimitive(it) })) }
        })))
    }

    @Suppress("unused") private fun s(e: kotlinx.serialization.json.JsonElement) = e.jsonPrimitive.contentOrNull
}
