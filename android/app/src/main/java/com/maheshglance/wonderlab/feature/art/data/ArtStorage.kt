package com.maheshglance.wonderlab.feature.art.data

import com.maheshglance.wonderlab.WonderLabApp
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.net.ApiError
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

/*
 * Artwork persistence for the private gallery (port of the website's art/storage.ts + the artwork part
 * of lib/sync.ts). Every save goes to a local draft first (app-private files: small meta + the project
 * JSON), then uploads with PUT /api/p/:pid/artworks/:id carrying baseVersion. When two devices changed the
 * same picture the server keeps both (409 + conflictCopyId); the learner then picks one (ArtConflictHost).
 */

@Serializable
data class DraftMeta(
    val id: String, val pid: String, val title: String, val thumb: String? = null,
    /** last server version this draft is based on (0 = never uploaded) */
    val baseVersion: Int = 0, val dirty: Boolean = true, val updatedAt: Long = System.currentTimeMillis(),
    val conflictOf: String? = null, val kind: String? = null,
)

@Serializable private data class Redirect(val copyId: String, val staleBase: Int)

data class ServerArt(val id: String, val title: String, val thumb: String?, val version: Int, val conflictOf: String?, val updatedAt: Long)
data class GalleryItem(val id: String, val title: String, val thumb: String?, val updatedAt: Long, val unsynced: Boolean, val conflictOf: String?, val kind: String?)
data class LoadedArt(val id: String, val title: String, val data: String, val baseVersion: Int, val thumb: String?)
data class ArtConflict(val pid: String, val originalId: String, val copyId: String)

enum class ArtSyncStatus { Idle, Saving, Saved, Offline, Error }

object ArtStorage {
    private val listSer = ListSerializer(String.serializer())

    private fun acct(app: WonderLabApp) = app.repo.state.value.account?.id
    private fun metaKey(a: String, pid: String, id: String) = "artm-$a-$pid-$id"
    private fun dataKey(a: String, pid: String, id: String) = "artd-$a-$pid-$id"
    private fun redirKey(a: String, pid: String, id: String) = "artr-$a-$pid-$id"
    private fun hiddenKey(a: String, pid: String) = "artdel-$a-$pid"

    // ---------- local drafts ----------
    fun meta(app: WonderLabApp, pid: String, id: String): DraftMeta? = acct(app)?.let { app.store.read(metaKey(it, pid, id), DraftMeta.serializer()) }
    private fun data(app: WonderLabApp, pid: String, id: String): String? = acct(app)?.let { app.store.readText(dataKey(it, pid, id)) }

    fun listDrafts(app: WonderLabApp, pid: String): List<DraftMeta> {
        val a = acct(app) ?: return emptyList()
        return app.store.keys("artm-$a-$pid-").mapNotNull { app.store.read(it, DraftMeta.serializer()) }.filter { it.pid == pid }
    }

    private fun writeDraft(app: WonderLabApp, m: DraftMeta, json: String?) {
        val a = acct(app) ?: return
        if (json != null) app.store.writeText(dataKey(a, m.pid, m.id), json)
        app.store.write(metaKey(a, m.pid, m.id), DraftMeta.serializer(), m)
    }

    fun deleteDraft(app: WonderLabApp, pid: String, id: String) {
        val a = acct(app) ?: return
        app.store.delete(metaKey(a, pid, id)); app.store.delete(dataKey(a, pid, id))
    }

    private fun hidden(app: WonderLabApp, pid: String): List<String> = acct(app)?.let { app.store.read(hiddenKey(it, pid), listSer) } ?: emptyList()
    private fun setHidden(app: WonderLabApp, pid: String, ids: List<String>) {
        val a = acct(app) ?: return
        if (ids.isEmpty()) app.store.delete(hiddenKey(a, pid)) else app.store.write(hiddenKey(a, pid), listSer, ids.takeLast(200))
    }

    // ---------- gallery ----------
    /**
     * Merge the server list with local drafts. A local draft wins when it has unsynced changes or is newer.
     * Clean local drafts missing from a fresh server list were deleted elsewhere → dropped.
     */
    fun mergeGallery(server: List<ServerArt>?, local: List<DraftMeta>, hidden: List<String>): Pair<List<GalleryItem>, List<String>> {
        val map = LinkedHashMap<String, GalleryItem>()
        val stale = ArrayList<String>()
        server?.forEach { s -> map[s.id] = GalleryItem(s.id, s.title, s.thumb, s.updatedAt * 1000, false, s.conflictOf, null) }
        for (d in local) {
            val s = map[d.id]
            if (s != null) {
                map[d.id] = if (d.dirty || d.updatedAt > s.updatedAt) s.copy(title = d.title, thumb = d.thumb ?: s.thumb, updatedAt = maxOf(d.updatedAt, s.updatedAt), unsynced = d.dirty, kind = d.kind)
                else s.copy(kind = d.kind)
            } else if (d.dirty || server == null) {
                map[d.id] = GalleryItem(d.id, d.title, d.thumb, d.updatedAt, d.dirty, d.conflictOf, d.kind)
            } else stale.add(d.id)
        }
        return map.values.filter { it.id !in hidden }.sortedByDescending { it.updatedAt } to stale
    }

    private fun parseServer(e: JsonElement): ServerArt? = runCatching {
        val o = e.jsonObject
        ServerArt(
            o["id"]!!.jsonPrimitive.content, o["title"]?.jsonPrimitive?.contentOrNull ?: "My artwork",
            (o["thumb"] as? JsonPrimitive)?.contentOrNull?.takeIf { it.isNotEmpty() }, o["version"]?.jsonPrimitive?.intOrNull ?: 1,
            (o["conflictOf"] as? JsonPrimitive)?.contentOrNull, o["updatedAt"]?.jsonPrimitive?.longOrNull ?: 0L,
        )
    }.getOrNull()

    suspend fun fetchGallery(app: WonderLabApp, pid: String): Pair<List<GalleryItem>, Boolean> = withContext(Dispatchers.IO) {
        retryDeletes(app, pid)
        var server: List<ServerArt>? = null
        var offline = false
        try {
            server = (app.api.get("/p/$pid/artworks")["artworks"] as? JsonArray)?.mapNotNull { parseServer(it) } ?: emptyList()
        } catch (e: ApiError) { offline = e.status == 0 }
        val (items, stale) = mergeGallery(server, listDrafts(app, pid), hidden(app, pid))
        stale.forEach { deleteDraft(app, pid, it) }
        items to offline
    }

    private suspend fun retryDeletes(app: WonderLabApp, pid: String) {
        val h = hidden(app, pid)
        if (h.isEmpty()) return
        val still = ArrayList<String>()
        for (id in h) try { app.api.delete("/p/$pid/artworks/$id") } catch (e: ApiError) { if (e.status != 404) still.add(id) }
        setHidden(app, pid, still)
    }

    /** Local unsynced draft first; otherwise the newest of server and local (and keeps a local copy for offline use). */
    suspend fun load(app: WonderLabApp, pid: String, id: String): LoadedArt? = withContext(Dispatchers.IO) {
        val m = meta(app, pid, id)
        val localData = m?.let { data(app, pid, id) }
        if (m != null && m.dirty && localData != null) return@withContext LoadedArt(id, m.title, localData, m.baseVersion, m.thumb)
        try {
            val r = app.api.get("/p/$pid/artworks/$id")["artwork"]?.jsonObject
            if (r != null) {
                val version = r["version"]?.jsonPrimitive?.intOrNull ?: 1
                if (m == null || localData == null || version >= m.baseVersion) {
                    val dataJson = (r["data"] ?: JsonNull).toString()
                    val title = r["title"]?.jsonPrimitive?.contentOrNull ?: "My picture"
                    val thumb = (r["thumb"] as? JsonPrimitive)?.contentOrNull?.takeIf { it.isNotEmpty() }
                    val kind = runCatching { r["data"]!!.jsonObject["meta"]!!.jsonObject["kind"]!!.jsonPrimitive.content }.getOrNull()
                    writeDraft(app, DraftMeta(id, pid, title, thumb, version, dirty = false, updatedAt = System.currentTimeMillis(), conflictOf = (r["conflictOf"] as? JsonPrimitive)?.contentOrNull, kind = kind), dataJson)
                    return@withContext LoadedArt(id, title, dataJson, version, thumb)
                }
            }
        } catch (_: ApiError) { /* offline or missing on server */ }
        if (m != null && localData != null) LoadedArt(id, m.title, localData, m.baseVersion, m.thumb) else null
    }

    /** Save via the offline-first draft store, then upload in the background. */
    suspend fun store(app: WonderLabApp, pid: String, id: String, title: String, dataJson: String, thumb: String?, kind: String?, fallbackBase: Int) = withContext(Dispatchers.IO) {
        val cur = meta(app, pid, id)
        writeDraft(app, DraftMeta(id, pid, title.take(60), thumb ?: cur?.thumb, cur?.baseVersion ?: fallbackBase, true, System.currentTimeMillis(), cur?.conflictOf, kind ?: cur?.kind), dataJson)
        ArtSync.schedule(app, 0)
    }

    suspend fun remove(app: WonderLabApp, pid: String, id: String) = withContext(Dispatchers.IO) {
        deleteDraft(app, pid, id)
        try { app.api.delete("/p/$pid/artworks/$id") } catch (e: ApiError) {
            if (e.status != 404) setHidden(app, pid, hidden(app, pid) + id) // retried next time the gallery opens
        }
    }

    suspend fun duplicate(app: WonderLabApp, pid: String, id: String): String? {
        val a = load(app, pid, id) ?: return null
        val nid = java.util.UUID.randomUUID().toString()
        store(app, pid, nid, "${a.title} (copy)".take(60), a.data, a.thumb, kindOf(a.data), 0)
        return nid
    }

    suspend fun rename(app: WonderLabApp, pid: String, id: String, title: String): Boolean {
        val a = load(app, pid, id) ?: return false
        store(app, pid, id, title.take(60), a.data, a.thumb, kindOf(a.data), a.baseVersion)
        return true
    }

    private fun kindOf(json: String) = runCatching { AppJson.parseToJsonElement(json).jsonObject["meta"]!!.jsonObject["kind"]!!.jsonPrimitive.content }.getOrNull()

    /** The learner picked a version after a two-device clash. */
    suspend fun resolve(app: WonderLabApp, c: ArtConflict, keep: String) = withContext(Dispatchers.IO) {
        app.api.post("/p/${c.pid}/artworks/${c.copyId}/resolve", buildJsonObject { put("keep", keep) })
        deleteDraft(app, c.pid, c.copyId)
        deleteDraft(app, c.pid, c.originalId)
    }

    // ---------- upload ----------
    internal suspend fun flushOnce(app: WonderLabApp) {
        val a = acct(app) ?: return
        val metas = app.store.keys("artm-$a-").mapNotNull { app.store.read(it, DraftMeta.serializer()) }.filter { it.dirty }
        for (d in metas) {
            val pid = d.pid
            // Continued edits of a draft that already conflicted belong to the preserved copy.
            val redir = app.store.read(redirKey(a, pid, d.id), Redirect.serializer())
            if (redir != null && d.baseVersion <= redir.staleBase) {
                val copy = meta(app, pid, redir.copyId)
                val json = data(app, pid, d.id)
                writeDraft(app, d.copy(id = redir.copyId, title = copy?.title ?: d.title, baseVersion = copy?.baseVersion ?: 1, dirty = true, conflictOf = d.id), json)
                deleteDraft(app, pid, d.id)
                ArtSync.redirected(ArtConflict(pid, d.id, redir.copyId))
                continue
            }
            val json = data(app, pid, d.id) ?: continue
            val body = buildString {
                append("{\"title\":").append(JsonPrimitive(d.title)).append(",\"data\":").append(json)
                append(",\"thumb\":").append(JsonPrimitive(d.thumb ?: "")).append(",\"baseVersion\":").append(d.baseVersion).append('}')
            }
            val (code, resp) = putRaw(app, "/p/$pid/artworks/${d.id}", body)
            when {
                code in 200..299 -> {
                    val version = resp["version"]?.jsonPrimitive?.intOrNull ?: (d.baseVersion + 1)
                    val cur = meta(app, pid, d.id)
                    if (cur != null) writeDraft(app, if (cur.updatedAt == d.updatedAt) cur.copy(dirty = false, baseVersion = version) else cur.copy(baseVersion = version), null)
                }
                code == 409 && resp["conflictCopyId"] != null -> {
                    // Server kept both. Our local copy now corresponds to the preserved copy.
                    val copyId = resp["conflictCopyId"]!!.jsonPrimitive.content
                    app.store.write(redirKey(a, pid, d.id), Redirect.serializer(), Redirect(copyId, d.baseVersion))
                    writeDraft(app, d.copy(id = copyId, baseVersion = 1, dirty = false, conflictOf = d.id), json)
                    deleteDraft(app, pid, d.id)
                    ArtSync.conflict(ArtConflict(pid, d.id, copyId))
                }
                code == 404 || code == 422 || code == 400 -> {
                    // rejected for good (e.g. too big): keep it on the device, stop retrying until edited again
                    val cur = meta(app, pid, d.id)
                    if (cur != null && cur.updatedAt == d.updatedAt) writeDraft(app, cur.copy(dirty = false), null)
                    val msg = (resp["error"] as? JsonObject)?.get("message")?.jsonPrimitive?.contentOrNull
                    throw ApiError(code, "rejected", msg ?: "This picture could not be uploaded.")
                }
                else -> throw ApiError(code, "error", (resp["error"] as? JsonObject)?.get("message")?.jsonPrimitive?.contentOrNull ?: "Could not upload.")
            }
        }
        // pending deletions
        app.repo.state.value.profiles.forEach { p -> if (hidden(app, p.id).isNotEmpty()) retryDeletes(app, p.id) }
    }

    fun pendingCount(app: WonderLabApp): Int {
        val a = acct(app) ?: return 0
        return app.store.keys("artm-$a-").count { app.store.read(it, DraftMeta.serializer())?.dirty == true }
    }

    private suspend fun putRaw(app: WonderLabApp, path: String, body: String): Pair<Int, JsonObject> = withContext(Dispatchers.IO) {
        val req = Request.Builder().url("${app.api.base}/api$path").header("X-WonderLab", "1").header("Accept", "application/json")
            .put(body.toRequestBody("application/json".toMediaType())).build()
        val res = try { app.api.http.newCall(req).execute() } catch (e: IOException) { throw ApiError(0, "offline", "You seem to be offline.") }
        res.use { r ->
            val text = r.body?.string().orEmpty()
            r.code to (runCatching { AppJson.parseToJsonElement(text).jsonObject }.getOrNull() ?: JsonObject(emptyMap()))
        }
    }
}

/** Background upload loop for artwork drafts, with status for the studio's save indicator. */
object ArtSync {
    private val _status = MutableStateFlow(ArtSyncStatus.Idle)
    val status: StateFlow<ArtSyncStatus> = _status.asStateFlow()
    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()
    /** A two-device clash waiting for the learner's choice (shown by ArtConflictHost). */
    private val _conflict = MutableStateFlow<ArtConflict?>(null)
    val conflict: StateFlow<ArtConflict?> = _conflict.asStateFlow()
    /** Last original → copy move, so an open studio keeps editing the preserved copy. */
    private val _moved = MutableStateFlow<ArtConflict?>(null)
    val moved: StateFlow<ArtConflict?> = _moved.asStateFlow()

    private val lock = Mutex()
    private var job: Job? = null
    private var backoff = 2000L

    internal fun conflict(c: ArtConflict) { _conflict.value = c; _moved.value = c }
    internal fun redirected(c: ArtConflict) { _moved.value = c }
    fun dismissConflict() { _conflict.value = null }

    fun schedule(app: WonderLabApp, delayMs: Long = 0) {
        if (job?.isActive == true && delayMs > 0) return
        job = app.scope.launch { delay(delayMs); flush(app) }
    }

    fun retry(app: WonderLabApp) { backoff = 2000; schedule(app, 0) }

    suspend fun flush(app: WonderLabApp): Unit = lock.withLock {
        if (app.repo.state.value.account == null) return@withLock
        if (ArtStorage.pendingCount(app) == 0) { if (_status.value == ArtSyncStatus.Saving) _status.value = ArtSyncStatus.Saved; return@withLock }
        _status.value = ArtSyncStatus.Saving
        try {
            ArtStorage.flushOnce(app)
            backoff = 2000
            _message.value = null
            _status.value = ArtSyncStatus.Saved
            if (ArtStorage.pendingCount(app) > 0) schedule(app, 500)
        } catch (e: ApiError) {
            when (e.status) {
                0 -> _status.value = ArtSyncStatus.Offline
                401 -> { _status.value = ArtSyncStatus.Error; _message.value = "Saved on this device. Sign in again to upload." }
                else -> {
                    _status.value = ArtSyncStatus.Error; _message.value = e.message
                    if (e.code != "rejected") { val d = backoff; backoff = (backoff * 2).coerceAtMost(60_000); app.scope.launch { delay(d); flush(app) } }
                }
            }
        } catch (e: Exception) {
            _status.value = ArtSyncStatus.Error; _message.value = e.message
        }
    }
}
