package com.maheshglance.wonderlab.feature.language

import com.maheshglance.wonderlab.core.engine.AppJson
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.random.Random

// Data shapes returned by android/engine/language.ts (the website's src/features/language types).

@Serializable data class LRef(val id: String, val title: String, val titleEn: String? = null)
@Serializable data class LBadge(val id: String, val title: String)

@Serializable
data class LUnit(
    val id: String, val level: Int, val title: String, val titleEn: String? = null,
    val objectives: List<LRef> = emptyList(), val trace: List<LRef> = emptyList(), val read: List<LRef> = emptyList(),
    val badge: LBadge? = null, val course: String = "",
)

@Serializable data class LCourseInfo(val id: String, val script: String, val title: String, val titleEn: String, val levels: List<Int> = emptyList())
@Serializable data class LCourseMap(val id: String, val script: String, val title: String, val titleEn: String, val levels: List<Int>, val units: List<LUnit>)

@Serializable data class LExample(val text: String, val en: String? = null, val note: String? = null, val noteEn: String? = null, val pic: String? = null)
@Serializable data class LCard(val letter: String, val word: String, val pic: String, val en: String)

@Serializable
data class LItem(
    val id: String,
    val type: String,
    val prompt: String,
    val en: String? = null,
    val say: String? = null,
    val pic: String? = null,
    val picLabel: String? = null,
    val picChoices: Boolean = false,
    val pics: Map<String, String> = emptyMap(),
    val choices: List<String> = emptyList(),
    val answer: List<String> = emptyList(),
    val gloss: Map<String, String> = emptyMap(),
    val hints: List<String>? = null,
    val explain: String? = null,
    val explainEn: String? = null,
) {
    val isTiles get() = type == "build" || type == "order"
}

@Serializable
data class LObjective(
    val id: String, val title: String, val titleEn: String? = null,
    val intro: String = "", val introEn: String? = null,
    val examples: List<LExample> = emptyList(),
    val items: List<JsonObject> = emptyList(),
    val cards: List<LCard>? = null,
    val builder: String? = null,
    val keyboard: Boolean = false,
)

@Serializable data class LUnitHead(val id: String, val level: Int, val title: String, val titleEn: String? = null)
@Serializable data class LObjectiveData(val course: String, val script: String, val courseTitleEn: String, val unit: LUnitHead, val objective: LObjective, val next: LRef? = null)

@Serializable data class LHint(val text: String, val en: String? = null, val eliminate: String? = null, val reveal: String? = null)

@Serializable
data class LRoundEntry(val item: JsonObject, val choices: List<String>, val hints: List<LHint> = emptyList(), val display: Map<String, String> = emptyMap(), val answerText: String = "") {
    @kotlinx.serialization.Transient val it: LItem = AppJson.decodeFromJsonElement(item)
}

@Serializable
data class LPassage(
    val id: String, val course: String, val level: Int, val kind: String, val title: String, val titleEn: String? = null,
    val lines: List<String>, val linesEn: List<String>? = null, val questions: List<JsonObject> = emptyList(),
    val script: String = "en", val className: String = "",
)

@Serializable data class LTraceCard(val word: String, val pic: String, val en: String)
@Serializable
data class LTraceSet(val id: String, val course: String, val script: String, val title: String, val titleEn: String? = null, val letters: List<String>, val cards: Map<String, LTraceCard> = emptyMap(), val grid: Int = 96)
@Serializable data class LTraceResult(val coverage: Double = 0.0, val outside: Double = 0.0, val score: Double = 0.0, val stars: Int = 0, val message: String = "")

@Serializable data class LKey(val key: String, val show: String)
@Serializable data class LCvc(val onsets: List<String>, val vowels: List<String>, val codas: List<String>, val real: List<String>)
@Serializable
data class LBuilders(
    val consonants: List<String>, val guninthamVowels: List<String>, val vowelSigns: Map<String, String>, val vowelSignShown: Map<String, String>,
    val signNames: Map<String, String>, val gunintham: Map<String, List<String>>, val ottuOptions: List<String>, val virama: String,
    val cvc: LCvc, val keyboard: List<List<LKey>>,
)

// ---------------- saved progress (same shapes and ids as the website) ----------------

/** Website: engine.ts Session. answers values are a string (choice/listen/type) or string[] (build/order). */
@Serializable
data class LSession(
    val mode: String,
    val seed: Long,
    val index: Int = 0,
    val answers: Map<String, JsonElement> = emptyMap(),
    val checked: Map<String, Boolean> = emptyMap(),
    val tries: Map<String, Int> = emptyMap(),
    val hints: Map<String, Int> = emptyMap(),
    val solved: Map<String, Boolean> = emptyMap(),
    val submitted: Boolean = false,
    val score: Double? = null,
)

/** Website: engine.ts ObjectiveState. */
@Serializable
data class LObjState(val learned: Boolean? = null, val practiceBest: Double? = null, val testBest: Double? = null, val session: LSession? = null)

/** Website: ReadAlong.tsx ReadState. */
@Serializable data class LReadState(val done: Boolean? = null, val score: Double? = null, val answers: Map<String, String>? = null)

/** Website: Trace.tsx TraceState. */
@Serializable data class LTraceState(val index: Int = 0, val stars: Map<String, Int> = emptyMap(), val tol: String? = null)

object LangKeys {
    const val PASS = 0.8
    fun objectiveKey(course: String, unitId: String, objectiveId: String) = "$course/$unitId/$objectiveId"
    fun activityId(key: String) = "lang:$key"
    fun questionId(key: String, itemId: String) = "lang:$key/$itemId"
    fun readKey(passageId: String) = "lang:read/$passageId"
    fun traceKey(course: String, setId: String) = "lang:$course/trace/$setId"
    fun passed(s: LObjState?) = s != null && maxOf(s.practiceBest ?: 0.0, s.testBest ?: 0.0) >= PASS
    /** Website: shared/grading newSeed (Math.floor(Math.random() * 2 ** 31)). */
    fun newSeed(): Long = Random.nextLong(0, 1L shl 31)
    fun freshSession(mode: String) = LSession(mode = mode, seed = newSeed())
}

inline fun <reified T> decodeOrNull(e: JsonElement?): T? = e?.let { runCatching { AppJson.decodeFromJsonElement<T>(it) }.getOrNull() }
inline fun <reified T> encode(v: T): JsonElement = AppJson.encodeToJsonElement(v)

/** Answer value helpers (string or list of tiles). */
fun JsonElement?.asText(): String? = (this as? JsonPrimitive)?.takeIf { it.isString }?.content
fun JsonElement?.asTiles(): List<String> = (this as? JsonArray)?.map { it.jsonPrimitive.content } ?: emptyList()
fun JsonElement?.isAnswered(): Boolean = when (this) {
    null -> false
    is JsonArray -> isNotEmpty()
    is JsonPrimitive -> isString && content.isNotEmpty()
    else -> false
}
fun tilesValue(t: List<String>): JsonElement = JsonArray(t.map { JsonPrimitive(it) })
fun JsonObject.str(k: String): String? = this[k]?.let { (it as? JsonPrimitive)?.content }
