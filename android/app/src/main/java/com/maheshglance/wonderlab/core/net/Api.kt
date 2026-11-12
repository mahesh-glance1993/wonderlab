package com.maheshglance.wonderlab.core.net

import android.content.Context
import com.maheshglance.wonderlab.BuildConfig
import com.maheshglance.wonderlab.core.engine.AppJson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.IOException
import java.util.concurrent.TimeUnit

/** Same error contract as the website's api(): status 0 = offline. */
class ApiError(val status: Int, val code: String, message: String, val fields: Map<String, String> = emptyMap(), val body: JsonObject? = null) : Exception(message)

/**
 * Keeps the session cookie (HttpOnly on the web) in app-private storage, so a "keep me signed in" session
 * survives restarts. Only cookies for our own API host are stored.
 */
class PersistentCookieJar(context: Context) : CookieJar {
    private val file = File(context.filesDir, "cookies.json")
    private val cookies = mutableListOf<Cookie>()

    init { load() }

    @Synchronized override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        for (c in cookies) {
            this.cookies.removeAll { it.name == c.name && it.domain == c.domain && it.path == c.path }
            if (c.expiresAt > System.currentTimeMillis()) this.cookies += c
        }
        persist()
    }

    @Synchronized override fun loadForRequest(url: HttpUrl): List<Cookie> {
        val now = System.currentTimeMillis()
        cookies.removeAll { it.expiresAt <= now }
        return cookies.filter { it.matches(url) }
    }

    @Synchronized fun clear() { cookies.clear(); persist() }

    private fun persist() {
        // session cookies (no max-age) are kept only for this process, like a browser tab
        val lines = cookies.filter { it.persistent }.joinToString("\n") { it.toString() }
        runCatching { file.writeText(lines) }
    }

    private fun load() {
        val base = okhttp3.HttpUrl.Builder().scheme("https").host(java.net.URI(BuildConfig.API_BASE).host).build()
        runCatching { file.readLines() }.getOrDefault(emptyList()).forEach { line ->
            Cookie.parse(base, line)?.let { if (it.expiresAt > System.currentTimeMillis()) cookies += it }
        }
    }
}

class Api(context: Context) {
    val cookieJar = PersistentCookieJar(context)
    val base: String = BuildConfig.API_BASE
    val http: OkHttpClient = OkHttpClient.Builder()
        .cookieJar(cookieJar)
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .callTimeout(45, TimeUnit.SECONDS)
        .build()
    private val jsonType = "application/json".toMediaType()

    /** JSON request to /api{path}. Throws ApiError (status 0 when the device is offline). */
    suspend fun request(path: String, method: String = "GET", body: JsonElement? = null): JsonObject = withContext(Dispatchers.IO) {
        val m = if (body != null && method == "GET") "POST" else method
        val rb = when {
            body != null -> body.toString().toRequestBody(jsonType)
            m == "GET" || m == "HEAD" -> null
            else -> "{}".toRequestBody(jsonType)
        }
        val req = Request.Builder()
            .url("$base/api$path")
            .header("X-WonderLab", "1")
            .header("Accept", "application/json")
            .method(m, rb)
            .build()
        val res = try { http.newCall(req).execute() } catch (e: IOException) { throw ApiError(0, "offline", "You seem to be offline.") }
        res.use { r ->
            val text = r.body?.string().orEmpty()
            val data = runCatching { AppJson.parseToJsonElement(text).jsonObject }.getOrElse { JsonObject(emptyMap()) }
            if (!r.isSuccessful) {
                val e = data["error"] as? JsonObject
                val fields = (e?.get("fields") as? JsonObject)?.mapValues { it.value.jsonPrimitive.contentOrNull.orEmpty() } ?: emptyMap()
                throw ApiError(r.code, e?.get("code")?.jsonPrimitive?.contentOrNull ?: "error", e?.get("message")?.jsonPrimitive?.contentOrNull ?: "Something went wrong.", fields, data)
            }
            data
        }
    }

    suspend fun get(path: String) = request(path, "GET")
    suspend fun post(path: String, body: JsonElement? = null) = request(path, "POST", body ?: JsonObject(emptyMap()))
    suspend fun put(path: String, body: JsonElement) = request(path, "PUT", body)
    suspend fun patch(path: String, body: JsonElement) = request(path, "PATCH", body)
    suspend fun delete(path: String) = request(path, "DELETE")

    /** Raw bytes (e.g. natural-voice audio from /api/tts). Null when offline or failing. */
    suspend fun bytes(path: String): ByteArray? = withContext(Dispatchers.IO) {
        runCatching {
            http.newCall(Request.Builder().url("$base/api$path").header("X-WonderLab", "1").build()).execute().use { r ->
                if (r.isSuccessful) r.body?.bytes() else null
            }
        }.getOrNull()
    }
}
