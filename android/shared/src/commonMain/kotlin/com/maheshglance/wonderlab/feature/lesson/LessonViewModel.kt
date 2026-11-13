package com.maheshglance.wonderlab.feature.lesson

import com.maheshglance.wonderlab.core.platform.*

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.data.AppRepository
import com.maheshglance.wonderlab.core.data.MasteryState
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject

/**
 * The lesson workspace for one objective (website Workspace.tsx): Learn / Practice / Test with the same saved
 * LessonState (lessonId "unitId/objectiveId"), the same attempt recording and the same mastery celebration.
 * Lives as long as the navigation entry, so rotation and window changes keep everything.
 */
class LessonViewModel(
    private val repo: AppRepository,
    private val eng: LessonEngine,
    initialLevel: Int,
    val tier: String,
    val unitId: String,
    private val objectiveArg: String?,
    private val urlMode: String?,
) : ViewModel() {
    /** The class whose content holds this objective (the learner's own, or a revisited / explored class). */
    var level: Int = initialLevel
        private set
    var status by mutableStateOf("loading") // loading | ready | notfound
        private set
    var info by mutableStateOf<LessonInfo?>(null)
        private set
    var ls by mutableStateOf(LessonState())
        private set
    val views = mutableStateMapOf<String, QView>()
    private val missing = mutableSetOf<String>()
    var noPractice by mutableStateOf(false)
        private set
    var noTry by mutableStateOf(false)
        private set
    var masteredNow by mutableStateOf(false)
    var celebrate by mutableIntStateOf(0)
        private set
    var message by mutableStateOf<String?>(null)
    var testSize by mutableStateOf<Int?>(null)
        private set

    private var dirty = false
    private var saveJob: Job? = null
    private var fired = false
    private val shownAt = mutableMapOf<String, Long>()
    private val ensureLock = Mutex()
    private var lastAct = ""

    val objectiveId: String get() = info?.objective?.id ?: objectiveArg ?: ""
    val lessonId: String get() = "$unitId/$objectiveId"
    val stages: List<LStage> get() = info?.stages ?: emptyList()
    fun stageOf(s: LessonState = ls): LStage = stages.getOrNull(s.learn.step.coerceIn(0, (stages.size - 1).coerceAtLeast(0))) ?: LStage("intro")
    val mastery: MasteryState? get() = repo.state.value.learner.mastery[objectiveId]
    private fun masteryJson(): JsonElement? = mastery?.let { LessonJson.encodeToJsonElement(MasteryState.serializer(), it) }

    init {
        viewModelScope.launch {
            var i = eng.load(level, unitId, objectiveArg)
            if (i == null && objectiveArg != null) {
                val other = eng.levelOf(objectiveArg)
                if (other >= 0 && other != level) { level = other; i = eng.load(other, unitId, objectiveArg) }
            }
            if (i == null) { status = "notfound"; return@launch }
            info = i
            ls = fromSaved(repo.state.value.learner.lessons[lessonId]?.state)
            status = "ready"
            // saved state that arrives later (server sync) wins until the learner interacts, like the website
            repo.state.map { it.learner.lessons[lessonId]?.updatedAt }.distinctUntilChanged().drop(1).collect {
                if (!dirty) repo.state.value.learner.lessons[lessonId]?.let { s -> ls = fromSaved(s.state) }
            }
        }
    }

    private suspend fun fromSaved(raw: JsonElement?): LessonState {
        val st = if (raw != null) eng.restore(raw) else LessonState()
        return if (urlMode != null) st.copy(mode = urlMode) else st
    }

    fun update(user: Boolean = true, fn: (LessonState) -> LessonState) {
        ls = fn(ls)
        if (user) dirty = true
        if (dirty) {
            saveJob?.cancel()
            saveJob = viewModelScope.launch { delay(250); repo.saveLessonState(lessonId, ls.toJson()) }
        }
    }

    override fun onCleared() {
        if (dirty && status == "ready") repo.saveLessonState(lessonId, ls.toJson())
    }

    /** "Continue learning" pointer, same path as the website (/lesson/unit/objective?mode=…). */
    fun lastActivity(label: String) {
        if (status != "ready") return
        val path = "/lesson/${encodePathSegment(unitId)}/${encodePathSegment(objectiveId)}?mode=${ls.mode}"
        if (path == lastAct) return
        lastAct = path
        repo.setLastActivity(path, label)
    }

    // ---------- questions ----------
    suspend fun view(qid: String): QView? {
        views[qid]?.let { return it }
        if (qid in missing) return null
        val v = eng.view(level, objectiveId, qid, tier)
        if (v == null) missing += qid else views[qid] = v
        return v
    }

    fun request(qid: String) { if (views[qid] == null && qid !in missing) viewModelScope.launch { view(qid) } }

    /** Makes sure a question exists where one is needed (an automatic change: not saved until the learner acts). */
    fun ensure() {
        if (status != "ready") return
        viewModelScope.launch {
            ensureLock.withLock {
                val s = ls
                if (s.mode == "practice") {
                    val cur = s.practice.q
                    if (cur == null || view(cur.qid) == null) {
                        val id = eng.nextPractice(level, objectiveId, tier, masteryJson(), null)
                        if (id != null && view(id) != null) {
                            noPractice = false
                            if (ls.practice.q?.qid == cur?.qid) update(false) { it.copy(practice = it.practice.copy(q = QState(id))) }
                        } else noPractice = true
                    }
                }
                if (s.mode == "learn" && stageOf(s).kind == "try") {
                    val cur = s.learn.q
                    if (cur == null || view(cur.qid) == null) {
                        val id = eng.fresh(level, objectiveId, tier, 1, null, mastery?.distinctCorrect ?: emptyList())
                        if (id != null && view(id) != null) {
                            noTry = false
                            if (ls.learn.q?.qid == cur?.qid) update(false) { it.copy(learn = it.learn.copy(q = QState(id))) }
                        } else noTry = true
                    }
                }
                if (s.mode == "test") {
                    s.test?.ids?.forEach { view(it) }
                    if (testSize == null) testSize = eng.buildTest(level, objectiveId, tier, 1)?.ids?.size ?: 0
                }
            }
        }
    }

    fun markShown(qid: String?) { if (qid != null && qid !in shownAt) shownAt[qid] = nowMillis() }

    // ---------- recording & mastery ----------
    suspend fun record(q: LQuestion, mode: String, correct: Boolean, response: JsonObject?, hints: Int, durationMs: Long? = null) {
        val before = repo.state.value.learner.mastery[objectiveId]?.masteredAt != null
        val dur = durationMs ?: shownAt[q.id]?.let { nowMillis() - it } ?: 0L
        try {
            val m = repo.recordAttempt(q.id, q.version, objectiveId, mode, correct, response, hints, dur.coerceAtMost(30L * 60 * 1000))
            if (m.masteredAt != null && !before && !fired) {
                fired = true
                celebrate++
                Tones.complete()
                repo.award("mastered:$objectiveId")
                masteredNow = true
            }
        } catch (_: Exception) {
            message = "notSaved"
        }
    }

    fun recordAsync(q: LQuestion, mode: String, correct: Boolean, response: JsonObject?, hints: Int) {
        viewModelScope.launch { record(q, mode, correct, response, hints) }
    }

    // ---------- modes ----------
    fun switchMode(m: String) = update { it.copy(mode = m) }

    fun setQ(which: String, fn: (QState) -> QState) = update { x ->
        if (which == "learn") x.learn.q?.let { x.copy(learn = x.learn.copy(q = fn(it))) } ?: x
        else x.practice.q?.let { x.copy(practice = x.practice.copy(q = fn(it))) } ?: x
    }

    private fun newPractice(id: String?) { if (id != null) update { x -> x.copy(practice = PracticeSt(QState(id), x.practice.count + 1)) } }

    fun trySimilar() {
        val cur = ls.practice.q ?: return
        viewModelScope.launch {
            val id = eng.similar(level, objectiveId, tier, cur.qid, masteryJson())
            if (id != null && view(id) != null) newPractice(id)
        }
    }

    fun nextQuestion() {
        val cur = ls.practice.q ?: return
        viewModelScope.launch {
            val id = eng.nextPractice(level, objectiveId, tier, masteryJson(), cur.qid)
            if (id != null && view(id) != null) newPractice(id)
        }
    }

    fun goStage(n: Int) = update { it.copy(learn = it.learn.copy(step = n.coerceIn(0, (stages.size - 1).coerceAtLeast(0)), revealed = 0)) }
    fun setRevealed(r: Int) = update { it.copy(learn = it.learn.copy(revealed = r)) }

    // ---------- test ----------
    private val times = mutableMapOf<String, Long>()
    private var entered: Pair<String, Long>? = null

    fun enterTestQuestion(id: String?) {
        val now = nowMillis()
        entered?.let { (p, at) -> times[p] = (times[p] ?: 0L) + (now - at) }
        entered = id?.let { it to now }
    }

    fun startTest() {
        viewModelScope.launch {
            val t = eng.buildTest(level, objectiveId, tier) ?: return@launch
            t.ids.forEach { view(it) }
            times.clear(); entered = null
            update { it.copy(test = TestSt(t.seed, t.ids, 0, emptyMap(), submitted = false, recorded = false)) }
        }
    }

    fun testGo(i: Int) = update { x -> x.test?.let { t -> x.copy(test = t.copy(index = i.coerceIn(0, t.ids.size - 1))) } ?: x }
    fun testAnswer(qid: String, r: JsonObject) = update { x -> x.test?.let { t -> x.copy(test = t.copy(answers = t.answers + (qid to r))) } ?: x }

    fun submitTest() {
        val t = ls.test ?: return
        enterTestQuestion(null)
        val already = t.recorded
        update { x -> x.copy(test = x.test?.copy(submitted = true, recorded = true)) }
        Tones.complete()
        if (already) return
        viewModelScope.launch {
            for (id in t.ids) {
                val v = view(id) ?: continue
                val r = effectiveResponse(v, t.answers[id])
                val res = eng.check(level, objectiveId, id, tier, r)
                record(v.q, "test", res?.correct == true, r, 0, times[id] ?: 0L)
            }
        }
    }
}
