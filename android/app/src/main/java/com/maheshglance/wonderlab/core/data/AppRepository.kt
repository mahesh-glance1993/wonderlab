package com.maheshglance.wonderlab.core.data

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.os.Build
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.engine.Engine
import com.maheshglance.wonderlab.core.net.Api
import com.maheshglance.wonderlab.core.net.ApiError
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.longOrNull
import kotlinx.serialization.json.put
import java.util.UUID

enum class SyncStatus { Idle, Syncing, Offline, Paused, Error }

data class AppState(
    val ready: Boolean = false,
    val online: Boolean = true,
    val account: Account? = null,
    val session: SessionInfo? = null,
    val profiles: List<Profile> = emptyList(),
    val profileId: String? = null,
    val learner: LearnerState = LearnerState(),
    val learnerReady: Boolean = false,
    val pending: Int = 0,
    val sync: SyncStatus = SyncStatus.Idle,
    val syncMessage: String? = null,
) {
    val profile: Profile? get() = profiles.firstOrNull { it.id == profileId }
    val prefs: Prefs get() = profile?.let { runCatching { AppJson.decodeFromJsonElement<Prefs>(it.prefs) }.getOrNull() } ?: Prefs()
    val parentVerified: Boolean get() = (session?.verifiedUntil ?: 0) > System.currentTimeMillis() / 1000
}

/** One queued server write. Attempts are batched; state writes for the same key are coalesced (latest wins). */
@Serializable
data class OutboxOp(
    val id: String,
    val accountId: String,
    val pid: String,
    val kind: String, // attempt | lesson | activity | reward | prefs | request
    val method: String = "POST",
    val path: String = "",
    val body: JsonElement = JsonNull,
    val key: String? = null,
    val at: Long = System.currentTimeMillis() / 1000,
)

@Serializable
private data class Snapshot(val account: Account, val session: SessionInfo? = null, val profiles: List<Profile>, val profileId: String? = null)

/**
 * App-wide state: account, learner profiles, the active learner's progress, and offline sync.
 * Mirrors the website's AppProvider + sync: every change is saved on the device first, then uploaded;
 * uploads are idempotent (attempt ids are UUIDs) and never cross accounts.
 */
class AppRepository(private val context: Context, val api: Api, val engine: Engine, val store: LocalStore, private val scope: CoroutineScope) {
    private val _state = MutableStateFlow(AppState())
    val state: StateFlow<AppState> = _state.asStateFlow()
    private val outboxLock = Mutex()
    private var flushJob: Job? = null
    private var backoffMs = 2000L

    private val opsSer = ListSerializer(OutboxOp.serializer())
    private fun outboxKey(accountId: String) = "outbox-$accountId"
    private fun learnerKey(accountId: String, pid: String) = "learner-$accountId-$pid"

    // ---------- start-up ----------
    fun start() {
        watchConnectivity()
        scope.launch {
            runCatching { engine.warmUp() }
            store.read("snapshot", Snapshot.serializer())?.let { s ->
                _state.update { it.copy(account = s.account, session = s.session, profiles = s.profiles, profileId = s.profileId) }
                s.profileId?.let { loadCachedLearner(s.account.id, it) }
            }
            refresh()
            _state.update { it.copy(ready = true) }
            countPending()
            scheduleFlush(0)
        }
    }

    /** Re-reads the account from the server (keeps the cached copy when offline). */
    suspend fun refresh() {
        try {
            val me = api.get("/auth/me")
            val acct = me["account"]?.takeIf { it !is JsonNull }?.let { AppJson.decodeFromJsonElement<Account>(it) }
            if (acct == null) {
                // signed out on the server: keep unsynced work for this account but show sign-in
                _state.update { it.copy(account = null, session = null, profiles = emptyList(), profileId = null, learner = LearnerState(), learnerReady = false) }
                store.delete("snapshot")
                return
            }
            val session = me["session"]?.let { AppJson.decodeFromJsonElement<SessionInfo>(it) }
            val profiles = me["profiles"]?.let { AppJson.decodeFromJsonElement<List<Profile>>(it) } ?: emptyList()
            val prevAcct = _state.value.account
            val keepPid = _state.value.profileId?.takeIf { pid -> prevAcct?.id == acct.id && profiles.any { it.id == pid } }
            _state.update { it.copy(account = acct, session = session, profiles = profiles, profileId = keepPid, online = true) }
            saveSnapshot()
            keepPid?.let { loadServerLearner(it) }
        } catch (e: ApiError) {
            if (e.status == 0) _state.update { it.copy(online = false) }
        }
    }

    private fun saveSnapshot() {
        val s = _state.value
        val a = s.account ?: return
        store.write("snapshot", Snapshot.serializer(), Snapshot(a, s.session, s.profiles, s.profileId))
    }

    // ---------- auth ----------
    suspend fun signIn(username: String, password: String, keepSignedIn: Boolean) {
        val r = api.post("/auth/login", buildJsonObject {
            put("username", username); put("password", password); put("keepSignedIn", keepSignedIn); put("deviceLabel", deviceLabel())
        })
        r["account"]?.let { a -> _state.update { it.copy(account = AppJson.decodeFromJsonElement(a)) } }
        refresh()
    }

    /** Returns the one-time recovery codes to show the parent. */
    suspend fun register(username: String, password: String, email: String?, securityQuestion: Int, securityAnswer: String): List<String> {
        val r = api.post("/auth/register", buildJsonObject {
            put("username", username); put("password", password); email?.takeIf { it.isNotBlank() }?.let { put("email", it) }
            put("securityQuestion", securityQuestion); put("securityAnswer", securityAnswer); put("keepSignedIn", true); put("deviceLabel", deviceLabel())
        })
        refresh()
        return r["recoveryCodes"]?.jsonArray?.map { (it as JsonPrimitive).content } ?: emptyList()
    }

    suspend fun verifyParent(password: String) {
        val r = api.post("/auth/verify-parent", buildJsonObject { put("password", password) })
        val until = (r["verifiedUntil"] as? JsonPrimitive)?.longOrNull ?: 0
        _state.update { it.copy(session = (it.session ?: SessionInfo()).copy(verifiedUntil = until)) }
    }

    suspend fun endParentMode() {
        runCatching { api.post("/auth/end-parent-mode") }
        _state.update { it.copy(session = it.session?.copy(verifiedUntil = 0)) }
    }

    /** "unsynced" when work would be lost (unless forced). Clears this account's private data from the device. */
    suspend fun signOut(force: Boolean = false): String {
        val acct = _state.value.account ?: return "ok"
        flushNow()
        if (!force && countPending() > 0) return "unsynced"
        runCatching { api.post("/auth/logout") }
        api.cookieJar.clear()
        store.deletePrefix("learner-${acct.id}")
        store.delete(outboxKey(acct.id))
        store.delete("snapshot")
        _state.update { AppState(ready = true, online = it.online) }
        return "ok"
    }

    private fun deviceLabel() = "WonderLab Android app · ${Build.MANUFACTURER} ${Build.MODEL}".take(80)

    // ---------- profiles ----------
    fun selectProfile(id: String?) {
        _state.update { it.copy(profileId = id, learner = LearnerState(), learnerReady = false) }
        saveSnapshot()
        val acct = _state.value.account ?: return
        if (id != null) scope.launch { loadCachedLearner(acct.id, id); loadServerLearner(id) }
    }

    suspend fun createProfile(nickname: String, avatar: String, classLevel: Int, ageBand: String, prefs: JsonObject = JsonObject(emptyMap())): Profile {
        val r = api.post("/profiles", buildJsonObject {
            put("nickname", nickname); put("avatar", avatar); put("classLevel", classLevel); put("ageBand", ageBand); put("prefs", prefs)
        })
        val p = AppJson.decodeFromJsonElement<Profile>(r["profile"]!!)
        _state.update { it.copy(profiles = it.profiles + p) }
        saveSnapshot()
        return p
    }

    suspend fun updateProfile(pid: String, fields: JsonObject): Profile {
        val r = api.patch("/p/$pid/profile", fields)
        val p = AppJson.decodeFromJsonElement<Profile>(r["profile"]!!)
        _state.update { s -> s.copy(profiles = s.profiles.map { if (it.id == pid) p else it }) }
        saveSnapshot()
        return p
    }

    suspend fun deleteProfile(pid: String) {
        api.delete("/p/$pid/profile")
        _state.value.account?.let { store.delete(learnerKey(it.id, pid)) }
        _state.update { s -> s.copy(profiles = s.profiles.filter { it.id != pid }, profileId = s.profileId.takeIf { it != pid }) }
        saveSnapshot()
    }

    /** Saves preferences on the device immediately and uploads them (queued when offline). */
    fun updatePrefs(patch: Map<String, JsonElement>) {
        val s = _state.value
        val p = s.profile ?: return
        val merged = JsonObject(p.prefs + patch)
        _state.update { st -> st.copy(profiles = st.profiles.map { if (it.id == p.id) it.copy(prefs = merged) else it }) }
        saveSnapshot()
        enqueue(OutboxOp(UUID.randomUUID().toString(), s.account!!.id, p.id, "prefs", "PATCH", "/p/${p.id}/profile", buildJsonObject { put("prefs", JsonObject(patch)) }, key = "prefs:${p.id}"))
    }

    fun setLastActivity(path: String, label: String) = updatePrefs(mapOf("lastActivity" to buildJsonObject {
        put("path", path); put("label", label); put("at", System.currentTimeMillis())
    }))

    // ---------- learner progress ----------
    private fun loadCachedLearner(accountId: String, pid: String) {
        val cached = store.read(learnerKey(accountId, pid), LearnerState.serializer())
        if (cached != null) _state.update { if (it.profileId == pid) it.copy(learner = cached, learnerReady = true) else it }
    }

    private suspend fun loadServerLearner(pid: String) {
        val acct = _state.value.account ?: return
        try {
            val r = api.get("/p/$pid/state")
            val mastery = r["mastery"]?.jsonArray?.map { AppJson.decodeFromJsonElement<MasteryState>(it) }?.associateBy { it.objectiveId } ?: emptyMap()
            fun saved(name: String, idKey: String) = r[name]?.jsonArray?.associate { e ->
                val o = e.jsonObject
                (o[idKey] as JsonPrimitive).content to SavedState(o["state"], (o["updatedAt"] as? JsonPrimitive)?.longOrNull ?: 0)
            } ?: emptyMap()
            val rewards = r["rewards"]?.jsonArray?.associate { e -> val o = e.jsonObject; (o["rewardId"] as JsonPrimitive).content to ((o["earnedAt"] as? JsonPrimitive)?.longOrNull ?: 0) } ?: emptyMap()
            val downloads = r["downloads"]?.jsonArray?.associate { e -> val o = e.jsonObject; (o["packId"] as JsonPrimitive).content to DownloadInfo((o["version"] as? JsonPrimitive)?.content ?: "", (o["downloadedAt"] as? JsonPrimitive)?.longOrNull ?: 0) } ?: emptyMap()
            var server = LearnerState(mastery, saved("lessons", "lessonId"), saved("activities", "activityId"), rewards, downloads)
            // fold in work that is still waiting to upload, so the screen never goes backwards
            server = overlayPending(acct.id, pid, server)
            store.write(learnerKey(acct.id, pid), LearnerState.serializer(), server)
            _state.update { if (it.profileId == pid) it.copy(learner = server, learnerReady = true) else it }
        } catch (e: ApiError) {
            if (e.status == 0) _state.update { it.copy(online = false, learnerReady = true) }
            else _state.update { it.copy(learnerReady = true) }
        }
    }

    private suspend fun overlayPending(accountId: String, pid: String, base: LearnerState): LearnerState {
        val ops = readOutbox(accountId).filter { it.pid == pid }
        var s = base
        for (op in ops) when (op.kind) {
            "attempt" -> {
                val o = op.body.jsonObject
                val objective = (o["objectiveId"] as JsonPrimitive).content
                val cur = s.mastery[objective] ?: emptyMastery(objective, op.at)
                val next = applyAttemptLocal(cur, o, op.at)
                s = s.copy(mastery = s.mastery + (objective to next))
            }
            "lesson" -> s = s.copy(lessons = s.lessons + (op.key!!.substringAfter(':') to SavedState(op.body.jsonObject["state"], op.at)))
            "activity" -> s = s.copy(activities = s.activities + (op.key!!.substringAfter(':') to SavedState(op.body.jsonObject["state"], op.at)))
            "reward" -> s = s.copy(rewards = s.rewards + (op.key!!.substringAfter(':') to op.at))
        }
        return s
    }

    private suspend fun emptyMastery(objectiveId: String, at: Long): MasteryState =
        engine.get("core.emptyMastery", objectiveId, at)

    private suspend fun applyAttemptLocal(cur: MasteryState, attempt: JsonObject, at: Long): MasteryState =
        engine.get("core.applyAttempt", AppJson.encodeToJsonElement(cur), buildJsonObject {
            put("questionId", attempt["questionId"]!!); put("correct", attempt["correct"]!!)
            put("hintsUsed", attempt["hintsUsed"] ?: JsonPrimitive(0)); put("mode", attempt["mode"]!!); put("at", at)
        })

    /**
     * Records one answer: updates mastery on the device at once (same rules as the server) and queues the upload.
     * mode: learn | practice | test | game | diagnostic
     */
    suspend fun recordAttempt(questionId: String, questionVersion: Int, objectiveId: String, mode: String, correct: Boolean, response: JsonElement? = null, hintsUsed: Int = 0, durationMs: Long = 0): MasteryState {
        val s = _state.value
        val acct = s.account ?: error("not signed in")
        val pid = s.profileId ?: error("no learner")
        val at = System.currentTimeMillis() / 1000
        val body = buildJsonObject {
            put("id", UUID.randomUUID().toString()); put("questionId", questionId); put("questionVersion", questionVersion); put("objectiveId", objectiveId)
            put("mode", mode); put("correct", correct); put("response", response ?: JsonNull); put("hintsUsed", hintsUsed); put("durationMs", durationMs); put("at", at)
        }
        val cur = s.learner.mastery[objectiveId] ?: emptyMastery(objectiveId, at)
        val next = applyAttemptLocal(cur, body, at)
        updateLearner(acct.id, pid) { it.copy(mastery = it.mastery + (objectiveId to next)) }
        enqueue(OutboxOp((body["id"] as JsonPrimitive).content, acct.id, pid, "attempt", body = body, at = at))
        return next
    }

    fun saveLessonState(lessonId: String, state: JsonElement) = saveState("lesson", "lessons", lessonId, state)
    fun saveActivityState(activityId: String, state: JsonElement) = saveState("activity", "activities", activityId, state)

    private fun saveState(kind: String, route: String, id: String, state: JsonElement) {
        val s = _state.value
        val acct = s.account ?: return
        val pid = s.profileId ?: return
        val at = System.currentTimeMillis() / 1000
        updateLearner(acct.id, pid) {
            if (kind == "lesson") it.copy(lessons = it.lessons + (id to SavedState(state, at))) else it.copy(activities = it.activities + (id to SavedState(state, at)))
        }
        enqueue(OutboxOp(UUID.randomUUID().toString(), acct.id, pid, kind, "PUT", "/p/$pid/$route/${java.net.URLEncoder.encode(id, "UTF-8").replace("+", "%20")}",
            buildJsonObject { put("state", state); put("updatedAt", at) }, key = "$kind:$id", at = at))
    }

    /** Awards a sticker/badge once. Returns false when already earned. */
    fun award(rewardId: String): Boolean {
        val s = _state.value
        val acct = s.account ?: return false
        val pid = s.profileId ?: return false
        if (s.learner.rewards.containsKey(rewardId)) return false
        updateLearner(acct.id, pid) { it.copy(rewards = it.rewards + (rewardId to System.currentTimeMillis() / 1000)) }
        enqueue(OutboxOp(UUID.randomUUID().toString(), acct.id, pid, "reward", "POST", "/p/$pid/rewards", buildJsonObject { put("rewardIds", JsonArray(listOf(JsonPrimitive(rewardId)))) }, key = "reward:$rewardId"))
        return true
    }

    /** Generic queued write for features (e.g. artwork saves). Same `key` replaces an older queued write. */
    fun queueRequest(method: String, path: String, body: JsonElement, key: String? = null) {
        val s = _state.value
        val acct = s.account ?: return
        enqueue(OutboxOp(UUID.randomUUID().toString(), acct.id, s.profileId ?: "", "request", method, path, body, key = key))
    }

    private fun updateLearner(accountId: String, pid: String, f: (LearnerState) -> LearnerState) {
        _state.update { st -> if (st.profileId == pid) st.copy(learner = f(st.learner)) else st }
        val cur = _state.value.takeIf { it.profileId == pid }?.learner ?: store.read(learnerKey(accountId, pid), LearnerState.serializer()) ?: LearnerState()
        store.write(learnerKey(accountId, pid), LearnerState.serializer(), cur)
    }

    // ---------- outbox & sync ----------
    private fun readOutbox(accountId: String): List<OutboxOp> = store.read(outboxKey(accountId), opsSer) ?: emptyList()

    private fun enqueue(op: OutboxOp) {
        scope.launch {
            outboxLock.withLock {
                val ops = readOutbox(op.accountId).let { list -> if (op.key != null) list.filterNot { it.key == op.key && it.pid == op.pid } else list }
                store.write(outboxKey(op.accountId), opsSer, ops + op)
            }
            countPending()
            scheduleFlush(1500)
        }
    }

    suspend fun countPending(): Int {
        val acct = _state.value.account ?: return 0.also { _state.update { it.copy(pending = 0) } }
        val n = outboxLock.withLock { readOutbox(acct.id).size }
        _state.update { it.copy(pending = n) }
        return n
    }

    fun scheduleFlush(delayMs: Long = 0) {
        if (flushJob?.isActive == true && delayMs > 0) return
        flushJob = scope.launch { delay(delayMs); flushNow() }
    }

    fun retrySync() { backoffMs = 2000; scheduleFlush(0) }

    /** Uploads queued work for the signed-in account only. Stops (keeping the queue) on network or auth problems. */
    suspend fun flushNow() {
        val acct = _state.value.account ?: return
        if (!_state.value.online) { _state.update { it.copy(sync = SyncStatus.Offline) }; return }
        _state.update { it.copy(sync = SyncStatus.Syncing) }
        try {
            while (true) {
                val ops = outboxLock.withLock { readOutbox(acct.id) }
                if (ops.isEmpty()) break
                val first = ops.first()
                val batch: List<OutboxOp>
                if (first.kind == "attempt") {
                    batch = ops.filter { it.kind == "attempt" && it.pid == first.pid }.take(100)
                    val r = api.post("/p/${first.pid}/attempts", buildJsonObject { put("attempts", JsonArray(batch.map { it.body })) })
                    // server mastery is authoritative after upload
                    r["mastery"]?.jsonArray?.map { AppJson.decodeFromJsonElement<MasteryState>(it) }?.let { ms ->
                        if (ms.isNotEmpty()) updateLearner(acct.id, first.pid) { st -> st.copy(mastery = st.mastery + ms.associateBy { it.objectiveId }) }
                    }
                } else {
                    batch = listOf(first)
                    try { api.request(first.path, first.method, first.body) } catch (e: ApiError) {
                        // a rejected single write (validation/not found) must not block everything behind it
                        if (e.status == 0 || e.status == 401 || e.status == 429 || e.status >= 500) throw e
                    }
                }
                val done = batch.map { it.id }.toSet()
                outboxLock.withLock { store.write(outboxKey(acct.id), opsSer, readOutbox(acct.id).filterNot { it.id in done }) }
                countPending()
            }
            backoffMs = 2000
            _state.update { it.copy(sync = SyncStatus.Idle, syncMessage = null) }
        } catch (e: ApiError) {
            when {
                e.status == 0 -> _state.update { it.copy(online = false, sync = SyncStatus.Offline) }
                e.status == 401 -> _state.update { it.copy(sync = SyncStatus.Paused, syncMessage = "Sign in again to save your work to your account.") }
                else -> {
                    _state.update { it.copy(sync = SyncStatus.Error, syncMessage = e.message) }
                    scheduleFlushAfterBackoff()
                }
            }
        }
    }

    private fun scheduleFlushAfterBackoff() {
        val d = backoffMs
        backoffMs = (backoffMs * 2).coerceAtMost(5 * 60_000)
        flushJob = scope.launch { delay(d); flushNow() }
    }

    private fun watchConnectivity() {
        val cm = context.getSystemService(ConnectivityManager::class.java) ?: return
        val online = cm.getNetworkCapabilities(cm.activeNetwork)?.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED) == true
        _state.update { it.copy(online = online) }
        cm.registerDefaultNetworkCallback(object : ConnectivityManager.NetworkCallback() {
            override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) {
                val now = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                val was = _state.value.online
                _state.update { it.copy(online = now, sync = if (now && it.sync == SyncStatus.Offline) SyncStatus.Idle else it.sync) }
                if (now && !was) scope.launch { refresh(); retrySync() }
            }
            override fun onLost(network: Network) { _state.update { it.copy(online = false, sync = SyncStatus.Offline) } }
        })
    }

    /** Local data for every profile is always kept on the device (app storage is private to this app). */
    fun hasOfflineData(pid: String): Boolean = _state.value.account?.let { store.read(learnerKey(it.id, pid), LearnerState.serializer()) != null } ?: false

    @Suppress("unused") private val stringMapSer = MapSerializer(String.serializer(), String.serializer())
}
