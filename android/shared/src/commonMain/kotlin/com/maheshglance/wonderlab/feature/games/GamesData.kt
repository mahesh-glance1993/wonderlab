package com.maheshglance.wonderlab.feature.games

import com.maheshglance.wonderlab.core.platform.*

import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.engine.Engine
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject

/** One game from the website's catalog (src/features/games/catalog.ts). */
@Serializable
data class GameInfo(
    val id: String,
    val title: String,
    val titleTe: String = "",
    val classRange: List<Int> = listOf(0, 12),
    val objectives: String = "",
    val objectivesTe: String? = null,
    val objectiveId: String = "",
    val variants: List<String> = listOf("guided", "regular", "challenge"),
    val icon: String = "star",
    val subject: String = "math",
    val emoji: String = "🧩",
    val rangeLabel: String = "",
    val rangeLabelTe: String = "",
) {
    fun title(lang: String) = if (lang == "te" && titleTe.isNotBlank()) titleTe else title
    fun objectives(lang: String) = if (lang == "te" && !objectivesTe.isNullOrBlank()) objectivesTe else objectives
    fun range(lang: String) = if (lang == "te" && rangeLabelTe.isNotBlank()) rangeLabelTe else rangeLabel
}

@Serializable
data class BadgeInfo(val id: String, val title: String, val titleTe: String = "", val icon: String = "star", val emoji: String = "⭐") {
    fun title(lang: String) = if (lang == "te" && titleTe.isNotBlank()) titleTe else title
}

@Serializable
data class DailySpec(val gameId: String, val seed: Long, val level: Int)

// ---- saved game state: exactly the website's Saved<P> shape, so progress follows the learner between devices ----
@Serializable
data class GStats(val rounds: Int = 0, val firstTry: Int = 0, val streak: Int = 0, val best: Int = 0, val challenge: Int = 0, val wrongRun: Int = 0)

@Serializable
data class GDaily(val date: String, val streak: Int = 0, val lastSolved: String? = null)

@Serializable
data class GSaved(
    val v: Int = 1,
    val game: String,
    val variant: String = "regular",
    val timerOn: Boolean = false,
    val adjust: Int = 0,
    val seed: Long,
    val level: Int,
    val progress: JsonElement = JsonObject(emptyMap()),
    val hints: Int = 0,
    val mistakes: Int = 0,
    val solved: Boolean = false,
    val elapsed: Int = 0,
    val replay: Boolean? = null,
    val stats: GStats = GStats(),
    val daily: GDaily? = null,
)

/** Reads a game's saved stats (for the library cards), like the website's readStats. */
fun readSaved(state: JsonElement?): GSaved? = state?.let { s ->
    if (s.j("v").int() != 1) null else runCatching { AppJson.decodeFromJsonElement(GSaved.serializer(), s) }.getOrNull()
}

/** Today as YYYY-MM-DD (local time), like the website's dateKey(). */
fun todayKey(): String = isoLocalDate(nowMillis())
fun prevDateKey(key: String): String = prevIsoDate(key)

/** Catalog, badges and UI strings — loaded once from the engine. */
object GamesStore {
    private val lock = Mutex()
    var games: List<GameInfo> = emptyList(); private set
    var badges: List<BadgeInfo> = emptyList(); private set
    var strings: JsonObject = JsonObject(emptyMap()); private set

    suspend fun load(engine: Engine) = lock.withLock {
        if (games.isEmpty()) {
            games = AppJson.decodeFromJsonElement(ListSerializer(GameInfo.serializer()), engine.call("games.catalog"))
            badges = AppJson.decodeFromJsonElement(ListSerializer(BadgeInfo.serializer()), engine.call("games.badges"))
            strings = engine.call("games.strings").obj()
        }
    }

    fun game(id: String?) = games.firstOrNull { it.id == id }
}

/** UI string from the games' S table in the learner's language. */
fun sx(key: String, lang: String): String = GamesStore.strings[key].loc(lang).ifEmpty { key }
