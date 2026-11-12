package com.maheshglance.wonderlab.core.engine

import android.content.Context
import com.dokar.quickjs.QuickJs
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.serializer

/** Lenient JSON shared by the whole app (engine results, API bodies, local files). */
val AppJson = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
    encodeDefaults = true
    isLenient = true
    coerceInputValues = true
}

/**
 * The shared WonderLab curriculum engine: the website's own TypeScript (content for every class, question
 * generators, grading, mastery, games, activities, language courses) bundled into assets/engine.js and run in
 * an embedded QuickJS interpreter. Screens are native Compose; this only supplies data and rules, so the app
 * teaches exactly what the website teaches.
 *
 * Call with `engine.call("core.outline", level)` → JsonElement, or `engine.get<T>(...)` to decode.
 */
class Engine(private val context: Context) {
    @OptIn(ExperimentalCoroutinesApi::class)
    private val thread: CoroutineDispatcher = Dispatchers.Default.limitedParallelism(1)
    private val lock = Mutex()
    private var js: QuickJs? = null

    private suspend fun instance(): QuickJs {
        js?.let { return it }
        val q = QuickJs.create(thread)
        q.memoryLimit = 256L * 1024 * 1024
        q.maxStackSize = 4L * 1024 * 1024
        val code = context.assets.open("engine.js").bufferedReader(Charsets.UTF_8).use { it.readText() }
        q.evaluate<Any?>(code, "engine.js")
        js = q
        return q
    }

    /** Loads the engine ahead of first use (called at app start, off the main thread). */
    suspend fun warmUp() = withContext(thread) { lock.withLock { instance() }; Unit }

    suspend fun callRaw(name: String, argsJson: String): String = withContext(thread) {
        lock.withLock {
            val q = instance()
            val src = "WL.call(${quote(name)}, ${quote(argsJson)})"
            q.evaluate<String>(src, "call.js")
        }
    }

    suspend fun call(name: String, vararg args: Any?): JsonElement {
        val argsJson = JsonArray(args.map { toJson(it) }).toString()
        return AppJson.parseToJsonElement(callRaw(name, argsJson))
    }

    suspend fun <T> get(serializer: KSerializer<T>, name: String, vararg args: Any?): T =
        AppJson.decodeFromJsonElement(serializer, call(name, *args))

    suspend inline fun <reified T> get(name: String, vararg args: Any?): T = get(serializer<T>(), name, *args)

    companion object {
        fun quote(s: String): String = JsonPrimitive(s).toString()

        /** Converts Kotlin values (primitives, maps, lists, JsonElements, @Serializable via JsonElement) to JSON. */
        fun toJson(v: Any?): JsonElement = when (v) {
            null -> JsonNull
            is JsonElement -> v
            is String -> JsonPrimitive(v)
            is Number -> JsonPrimitive(v)
            is Boolean -> JsonPrimitive(v)
            is Map<*, *> -> JsonObject(v.entries.associate { (k, x) -> k.toString() to toJson(x) })
            is Iterable<*> -> JsonArray(v.map { toJson(it) })
            is Array<*> -> JsonArray(v.map { toJson(it) })
            is IntArray -> JsonArray(v.map { JsonPrimitive(it) })
            else -> error("Engine cannot encode ${v::class.simpleName}; pass a JsonElement")
        }
    }
}
