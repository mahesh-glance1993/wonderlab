package com.maheshglance.wonderlab.core.net

import com.maheshglance.wonderlab.core.data.Files
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.platform.Platform
import com.maheshglance.wonderlab.core.platform.nowMillis
import io.ktor.client.HttpClient
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.cookies.CookiesStorage
import io.ktor.client.plugins.cookies.HttpCookies
import io.ktor.client.request.header
import io.ktor.client.request.request
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsBytes
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.Cookie
import io.ktor.http.HttpMethod
import io.ktor.http.Url
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import io.ktor.http.parseServerSetCookieHeader
import io.ktor.http.renderSetCookieHeader
import io.ktor.util.date.GMTDate
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

/** Same error contract as the website's api(): status 0 = offline. */
class ApiError(val status: Int, val code: String, message: String, val fields: Map<String, String> = emptyMap(), val body: JsonObject? = null) : Exception(message)

/**
 * Keeps the session cookie (HttpOnly on the web) in app-private storage, so a "keep me signed in" session
 * survives restarts. Session cookies (no expiry) are kept only while the app runs, like a browser tab.
 */
class PersistentCookies(private val file: String) : CookiesStorage {
    private val lock = Mutex()
    private val cookies = mutableListOf<Cookie>()

    init {
        Files.readText(file)?.lines()?.filter { it.isNotBlank() }?.forEach { line ->
            runCatching { parseServerSetCookieHeader(line) }.getOrNull()?.let { c ->
                if ((c.expires?.timestamp ?: 0) > nowMillis()) cookies += c
            }
        }
    }

    override suspend fun get(requestUrl: Url): List<Cookie> = lock.withLock {
        val now = nowMillis()
        cookies.removeAll { it.expires != null && it.expires!!.timestamp <= now }
        cookies.filter { c ->
            val host = requestUrl.host
            val domainOk = c.domain.isNullOrBlank() || host == c.domain!!.trimStart('.') || host.endsWith("." + c.domain!!.trimStart('.'))
            val pathOk = c.path.isNullOrBlank() || requestUrl.encodedPath.startsWith(c.path!!)
            domainOk && pathOk && (!c.secure || requestUrl.protocol.name == "https")
        }
    }

    override suspend fun addCookie(requestUrl: Url, cookie: Cookie) = lock.withLock {
        val c0 = if (cookie.domain.isNullOrBlank()) cookie.copy(domain = requestUrl.host) else cookie
        val c = if (c0.maxAge != null && c0.maxAge!! > 0) c0.copy(expires = GMTDate(nowMillis() + c0.maxAge!! * 1000L), maxAge = null) else if (c0.maxAge == 0) c0.copy(expires = GMTDate(0)) else c0
        cookies.removeAll { it.name == c.name && it.domain == c.domain && it.path == c.path }
        if (c.expires == null || c.expires!!.timestamp > nowMillis()) cookies += c
        persist()
    }

    suspend fun clear() = lock.withLock { cookies.clear(); persist() }

    private fun persist() {
        val lines = cookies.filter { it.expires != null }.joinToString("\n") { renderSetCookieHeader(it) }
        runCatching { Files.writeText(file, lines) }
    }

    override fun close() {}
}

class Api(platform: Platform) {
    val cookieJar = PersistentCookies("${platform.dataDir}/cookies.txt")
    val base: String = platform.apiBase
    val http: HttpClient = platform.httpClient {
        install(HttpCookies) { storage = cookieJar }
        install(HttpTimeout) { connectTimeoutMillis = 15_000; socketTimeoutMillis = 30_000; requestTimeoutMillis = 45_000 }
        expectSuccess = false
        followRedirects = true
    }

    /** JSON request to /api{path}. Throws ApiError (status 0 when the device is offline). */
    suspend fun request(path: String, method: String = "GET", body: JsonElement? = null): JsonObject {
        val m = if (body != null && method == "GET") "POST" else method
        val res = try {
            http.request("$base/api$path") {
                this.method = HttpMethod.parse(m)
                header("X-WonderLab", "1")
                header("Accept", "application/json")
                when {
                    body != null -> { contentType(ContentType.Application.Json); setBody(body.toString()) }
                    m != "GET" && m != "HEAD" -> { contentType(ContentType.Application.Json); setBody("{}") }
                }
            }
        } catch (e: CancellationException) { throw e } catch (e: Exception) { throw ApiError(0, "offline", "You seem to be offline.") }
        val text = runCatching { res.bodyAsText() }.getOrDefault("")
        val data = runCatching { AppJson.parseToJsonElement(text).jsonObject }.getOrElse { JsonObject(emptyMap()) }
        if (!res.status.isSuccess()) {
            val e = data["error"] as? JsonObject
            val fields = (e?.get("fields") as? JsonObject)?.mapValues { it.value.jsonPrimitive.contentOrNull.orEmpty() } ?: emptyMap()
            throw ApiError(res.status.value, e?.get("code")?.jsonPrimitive?.contentOrNull ?: "error", e?.get("message")?.jsonPrimitive?.contentOrNull ?: "Something went wrong.", fields, data)
        }
        return data
    }

    suspend fun get(path: String) = request(path, "GET")
    suspend fun post(path: String, body: JsonElement? = null) = request(path, "POST", body ?: JsonObject(emptyMap()))
    suspend fun put(path: String, body: JsonElement) = request(path, "PUT", body)
    suspend fun patch(path: String, body: JsonElement) = request(path, "PATCH", body)
    suspend fun delete(path: String) = request(path, "DELETE")

    /** Raw PUT with a JSON text body; returns (status, parsed body). Status 0 when offline. */
    suspend fun putRaw(path: String, jsonBody: String): Pair<Int, JsonObject> = try {
        val r = http.request("$base/api$path") {
            method = HttpMethod.Put
            header("X-WonderLab", "1"); header("Accept", "application/json")
            contentType(ContentType.Application.Json); setBody(jsonBody)
        }
        r.status.value to (runCatching { AppJson.parseToJsonElement(r.bodyAsText()).jsonObject }.getOrNull() ?: JsonObject(emptyMap()))
    } catch (e: CancellationException) { throw e } catch (e: Exception) { 0 to JsonObject(emptyMap()) }

    /** Raw bytes (e.g. natural-voice audio from /api/tts). Null when offline or failing. */
    suspend fun bytes(path: String): ByteArray? = try {
        val r = http.request("$base/api$path") { header("X-WonderLab", "1") }
        if (r.status.isSuccess()) r.bodyAsBytes() else null
    } catch (e: CancellationException) { throw e } catch (e: Exception) { null }
}
