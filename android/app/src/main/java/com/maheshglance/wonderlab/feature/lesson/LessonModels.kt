package com.maheshglance.wonderlab.feature.lesson

import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.engine.Engine
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.serializer

/**
 * JSON for lesson data. `explicitNulls = true` so saved lesson state keeps the website's exact shape
 * (`"q": null`, `"test": null`, `"draft": null`) and web and app can resume each other.
 */
val LessonJson = Json {
    ignoreUnknownKeys = true
    explicitNulls = true
    encodeDefaults = true
    isLenient = true
    coerceInputValues = true
}

// ---------------------------------------------------------------- questions (engine: lesson.view / lesson.check)

@Serializable data class LChoice(val id: String, val label: Localized = Localized(), val visual: JsonObject? = null)
@Serializable data class LStep(val prompt: Localized = Localized(), val answer: JsonObject = JsonObject(emptyMap()))
@Serializable data class LLine(val from: Double = 0.0, val to: Double = 10.0, val step: Double = 1.0)

@Serializable
data class LQuestion(
    val id: String,
    val version: Int = 1,
    val objectiveId: String = "",
    val type: String = "typed",
    val prompt: Localized = Localized(),
    val say: Localized? = null,
    val visual: JsonObject? = null,
    val choices: List<LChoice> = emptyList(),
    val left: List<LChoice> = emptyList(),
    val right: List<LChoice> = emptyList(),
    val line: LLine? = null,
    val keypad: String? = null,
    val unitHint: String? = null,
    val answer: JsonObject = JsonObject(emptyMap()),
    val hints: List<Localized> = emptyList(),
    val solution: List<Localized> = emptyList(),
    val steps: List<LStep> = emptyList(),
    val difficulty: Int = 1,
)

/** A question plus everything the website's logic derives from it (input kind, keypad rows, unit chips, marks…). */
@Serializable
data class QView(
    val q: LQuestion,
    val kind: String,
    val initialOrder: List<String> = emptyList(),
    val units: List<String> = emptyList(),
    val keypadRows: List<List<String>> = emptyList(),
    val stepUnits: List<List<String>> = emptyList(),
    val stepAnswers: List<String> = emptyList(),
    val answerText: String = "",
    val answerKind: String = "",
    val choiceResponses: Map<String, JsonObject> = emptyMap(),
    val choiceCorrect: Map<String, Boolean> = emptyMap(),
    val multiCorrect: List<String> = emptyList(),
    val orderCorrect: List<String> = emptyList(),
    val matchPairs: Map<String, String> = emptyMap(),
    val lineLabels: List<String> = emptyList(),
    val lineCorrect: Int? = null,
)

@Serializable
data class CheckResult(
    val correct: Boolean = false,
    val reason: String? = null,
    val understood: String? = null,
    val showUnderstood: Boolean = false,
    val mistake: Localized? = null,
    val response: JsonObject? = null,
    val empty: Boolean = true,
    val yourAnswer: String = "",
    val correctAnswer: String = "",
)

// ---------------------------------------------------------------- objective (engine: lesson.load)

@Serializable data class LExample(val id: String = "", val problem: Localized = Localized(), val visual: JsonObject? = null, val steps: List<Localized> = emptyList(), val answer: Localized = Localized())
@Serializable data class LObjective(val id: String, val title: Localized = Localized(), val intro: List<JsonObject> = emptyList(), val examples: List<LExample> = emptyList(), val templates: List<String> = emptyList(), val activities: List<String> = emptyList())
@Serializable data class LStage(val kind: String, val index: Int = 0)
@Serializable data class LActivity(val id: String, val path: String, val label: Localized = Localized(), val kind: String = "game")
@Serializable data class LUnitRef(val id: String, val title: Localized = Localized(), val subject: String = "math")

@Serializable
data class LessonInfo(
    val unit: LUnitRef,
    val objective: LObjective,
    val firstObjectiveId: String? = null,
    val stages: List<LStage> = emptyList(),
    val activities: List<LActivity> = emptyList(),
    val recap: List<JsonObject> = emptyList(),
    val introSay: Localized = Localized(),
    val recapSay: Localized = Localized(),
    val masteryDistinct: Int = 5,
    val hasQuestions: Boolean = true,
)

// ---------------------------------------------------------------- saved lesson state (same JSON as the website's LessonState)

@Serializable data class StepState(val values: List<String> = emptyList(), val ok: List<Boolean> = emptyList())
@Serializable data class QState(val qid: String, val draft: JsonObject? = null, val hints: Int = 0, val checked: Boolean = false, val steps: StepState = StepState())
@Serializable data class LearnSt(val step: Int = 0, val revealed: Int = 0, val q: QState? = null)
@Serializable data class PracticeSt(val q: QState? = null, val count: Int = 0)
@Serializable data class TestSt(val seed: Long = 0, val ids: List<String> = emptyList(), val index: Int = 0, val answers: Map<String, JsonObject> = emptyMap(), val submitted: Boolean = false, val recorded: Boolean = false)
@Serializable data class LessonState(val v: Int = 1, val mode: String = "learn", val learn: LearnSt = LearnSt(), val practice: PracticeSt = PracticeSt(), val test: TestSt? = null)

// ---------------------------------------------------------------- diagnostic

@Serializable data class DiagItem(val qid: String, val objectiveId: String, val unitId: String)
@Serializable data class DiagState(val v: Int = 1, val items: List<DiagItem> = emptyList(), val index: Int = 0, val results: Map<String, Boolean> = emptyMap(), val draft: JsonObject? = null, val done: Boolean = false)
@Serializable data class DiagSummary(val objectiveId: String, val unitId: String, val correct: Int = 0, val total: Int = 0, val title: Localized = Localized())

// ---------------------------------------------------------------- curriculum browser & next

@Serializable data class CObjective(val id: String, val title: Localized = Localized())
@Serializable data class CUnit(val id: String, val subject: String = "math", val title: Localized = Localized(), val enrichment: Boolean = false, val source: String? = null, val objectives: List<CObjective> = emptyList())
@Serializable data class CurriculumData(val level: Int = 0, val label: String = "", val units: List<CUnit> = emptyList())
@Serializable data class NextRec(val unitId: String, val objectiveId: String, val kind: String = "start", val reason: Localized = Localized(), val unitTitle: Localized = Localized(), val objectiveTitle: Localized = Localized(), val mode: String = "learn")
@Serializable data class DueItem(val unitId: String, val objectiveId: String, val title: Localized = Localized())
@Serializable data class NextData(val rec: NextRec? = null, val due: List<DueItem> = emptyList())
@Serializable data class KeyResult(val value: String = "", val caret: Int = 0)

// ---------------------------------------------------------------- grading responses (the website's Response union, kept as JSON)

object Resp {
    fun text(v: String) = JsonObject(mapOf("kind" to JsonPrimitive("text"), "value" to JsonPrimitive(v)))
    fun multi(v: List<String>) = JsonObject(mapOf("kind" to JsonPrimitive("multi"), "value" to JsonArray(v.map(::JsonPrimitive))))
    fun order(v: List<String>) = JsonObject(mapOf("kind" to JsonPrimitive("order"), "value" to JsonArray(v.map(::JsonPrimitive))))
    fun match(v: Map<String, String>) = JsonObject(mapOf("kind" to JsonPrimitive("match"), "value" to JsonObject(v.mapValues { JsonPrimitive(it.value) })))
}

val JsonObject?.respKind: String? get() = this?.get("kind")?.let { (it as? JsonPrimitive)?.contentOrNull }
val JsonObject?.respText: String get() = (this?.get("value") as? JsonPrimitive)?.contentOrNull ?: ""
val JsonObject?.respList: List<String> get() = (this?.get("value") as? JsonArray)?.mapNotNull { (it as? JsonPrimitive)?.contentOrNull } ?: emptyList()
val JsonObject?.respMap: Map<String, String> get() = (this?.get("value") as? JsonObject)?.mapNotNull { (k, v) -> (v as? JsonPrimitive)?.contentOrNull?.let { k to it } }?.toMap() ?: emptyMap()

/** Which choice a stored response refers to (the website's choiceIdOf). */
fun choiceIdOf(q: LQuestion, r: JsonObject?): String? = when (r.respKind) {
    "choice" -> r.respText
    "text" -> q.choices.firstOrNull { it.label.en == r.respText }?.id
    else -> null
}

/** The website's isEmptyResponse. */
fun isEmptyResponse(r: JsonObject?): Boolean = when (r.respKind) {
    "choice", "text" -> r.respText.isBlank()
    "multi", "order" -> r.respList.isEmpty()
    "match" -> r.respMap.isEmpty()
    else -> true
}

/** Response that will be graded: an untouched 'order' item counts as its starting order (website's effectiveResponse). */
fun effectiveResponse(v: QView, r: JsonObject?): JsonObject? = if (r == null && v.kind == "order") Resp.order(v.initialOrder) else r

// ---------------------------------------------------------------- JSON accessors for visual specs / blocks

fun JsonObject.str(k: String): String? = (this[k] as? JsonPrimitive)?.contentOrNull
fun JsonObject.num(k: String): Double? = (this[k] as? JsonPrimitive)?.doubleOrNull
fun JsonObject.int(k: String): Int? = (this[k] as? JsonPrimitive)?.let { it.intOrNull ?: it.doubleOrNull?.toInt() }
fun JsonObject.bool(k: String): Boolean? = (this[k] as? JsonPrimitive)?.booleanOrNull
fun JsonObject.obj(k: String): JsonObject? = this[k] as? JsonObject
fun JsonObject.arr(k: String): JsonArray? = this[k] as? JsonArray
fun JsonObject.strList(k: String): List<String> = arr(k)?.mapNotNull { (it as? JsonPrimitive)?.contentOrNull } ?: emptyList()
fun JsonObject.numList(k: String): List<Double> = arr(k)?.mapNotNull { (it as? JsonPrimitive)?.doubleOrNull } ?: emptyList()
fun JsonObject.loc(k: String): Localized? = obj(k)?.let { runCatching { LessonJson.decodeFromJsonElement<Localized>(it) }.getOrNull() }
fun JsonObject.locList(k: String): List<Localized> = arr(k)?.mapNotNull { e -> (e as? JsonObject)?.let { runCatching { LessonJson.decodeFromJsonElement<Localized>(it) }.getOrNull() } } ?: emptyList()
fun JsonArray.pairs(): List<Pair<Double, Double>> = mapNotNull { e -> (e as? JsonArray)?.let { a -> val x = (a.getOrNull(0) as? JsonPrimitive)?.doubleOrNull; val y = (a.getOrNull(1) as? JsonPrimitive)?.doubleOrNull; if (x != null && y != null) x to y else null } }

// ---------------------------------------------------------------- engine wrapper

/** Typed calls into android/engine/lesson.ts. Every function returns null (never throws) when content is missing. */
class LessonEngine(private val engine: Engine) {
    private suspend inline fun <reified T> get(name: String, vararg args: Any?): T? = runCatching {
        val e = engine.call(name, *args)
        if (e is JsonNull) null else LessonJson.decodeFromJsonElement(serializer<T>(), e)
    }.getOrNull()

    private suspend fun str(name: String, vararg args: Any?): String? = runCatching { (engine.call(name, *args) as? JsonPrimitive)?.contentOrNull }.getOrNull()

    suspend fun load(level: Int, unitId: String, objectiveId: String?) = get<LessonInfo>("lesson.load", level, unitId, objectiveId)
    suspend fun view(level: Int, objectiveId: String?, qid: String, tier: String) = get<QView>("lesson.view", level, objectiveId, qid, tier)
    suspend fun check(level: Int, objectiveId: String?, qid: String, tier: String, r: JsonObject?) = get<CheckResult>("lesson.check", level, objectiveId, qid, tier, r)
    suspend fun gradeStep(level: Int, objectiveId: String?, qid: String, tier: String, i: Int, value: String) = get<Boolean>("lesson.gradeStep", level, objectiveId, qid, tier, i, value) ?: false
    suspend fun fresh(level: Int, objectiveId: String, tier: String, target: Int, lastId: String?, solved: List<String>) = str("lesson.fresh", level, objectiveId, tier, target, lastId, solved)
    suspend fun nextPractice(level: Int, objectiveId: String, tier: String, mastery: JsonElement?, lastId: String?) = str("lesson.nextPractice", level, objectiveId, tier, mastery, lastId)
    suspend fun similar(level: Int, objectiveId: String, tier: String, currentId: String, mastery: JsonElement?) = str("lesson.similar", level, objectiveId, tier, currentId, mastery)
    suspend fun buildTest(level: Int, objectiveId: String, tier: String, seed: Long? = null) = get<TestSt>("lesson.buildTest", level, objectiveId, tier, seed)
    suspend fun restore(raw: JsonElement?) = get<LessonState>("lesson.restore", raw) ?: LessonState()
    suspend fun applyKey(value: String, caret: Int, key: String) = get<KeyResult>("lesson.applyKey", value, caret, key)
    suspend fun restoreDiag(raw: JsonElement?) = get<DiagState>("lesson.restoreDiag", raw)
    suspend fun diagnosticCount(level: Int) = get<Int>("lesson.diagnosticCount", level) ?: 0
    suspend fun diagnosticStart(level: Int, tier: String) = get<List<DiagItem>>("lesson.diagnosticStart", level, tier) ?: emptyList()
    suspend fun diagnosticSummary(level: Int, items: List<DiagItem>, results: Map<String, Boolean>) =
        get<List<DiagSummary>>("lesson.diagnosticSummary", level, LessonJson.encodeToJsonElement(items), LessonJson.encodeToJsonElement(results)) ?: emptyList()
    suspend fun levelOf(objectiveId: String) = get<Int>("core.levelOfObjective", objectiveId) ?: -1
    suspend fun curriculum(level: Int) = get<CurriculumData>("lesson.curriculum", level)
    suspend fun next(level: Int, mastery: JsonElement, lastObjectiveId: String?) = get<NextData>("lesson.next", level, mastery, lastObjectiveId)
}

fun LessonState.toJson(): JsonElement = LessonJson.encodeToJsonElement(this)
fun DiagState.toJson(): JsonElement = LessonJson.encodeToJsonElement(this)
