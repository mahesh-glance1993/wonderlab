package com.maheshglance.wonderlab.feature.parent

import com.maheshglance.wonderlab.WonderLabApp
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.feature.progress.clearOutlineCache
import com.maheshglance.wonderlab.ui.AppContext
import kotlinx.coroutines.CancellationException
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement

private const val OVERRIDES_KEY = "content-overrides"

/**
 * Loads educator-published content corrections (`/api/content/overrides`) into the curriculum engine.
 * The list is cached on the device so corrections also apply offline. Safe to call at start-up and after a
 * publish; never throws. Returns the number of overrides applied (or -1 when none could be loaded).
 */
suspend fun loadContentOverrides(app: AppContext): Int = loadContentOverrides(app.application)

suspend fun loadContentOverrides(application: WonderLabApp): Int {
    val store = application.store
    val list: JsonElement? = try {
        val fresh = application.api.get("/content/overrides")["overrides"] as? JsonArray ?: JsonArray(emptyList())
        store.writeText(OVERRIDES_KEY, fresh.toString())
        fresh
    } catch (e: CancellationException) {
        throw e
    } catch (_: Exception) {
        store.readText(OVERRIDES_KEY)?.let { runCatching { AppJson.parseToJsonElement(it) }.getOrNull() }
    }
    val arr = list as? JsonArray ?: return -1
    return try { application.engine.call("core.setOverrides", arr); clearOutlineCache(); arr.size } catch (e: CancellationException) { throw e } catch (_: Exception) { -1 }
}
