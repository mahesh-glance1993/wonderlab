package com.maheshglance.wonderlab.feature.early

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.engine.AppJson
import com.maheshglance.wonderlab.core.engine.Engine
import com.maheshglance.wonderlab.ui.LocalApp
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.serializer

/*
 * Play & Learn content — decoded from the website's own TypeScript data through the engine ("early.bundle"),
 * so pictures, stories, rhymes, builds and stickers are identical to the website.
 */

typealias L = Localized

@Serializable data class Pic(val id: String, val en: String, val te: String = "", val cat: String, val sub: String? = null, val sound: L? = null, val colour: String? = null, val emoji: String) {
    val name: L get() = L(en, te)
}
@Serializable data class PicSet(val id: String, val title: L, val cats: List<String>, val cover: String)
@Serializable data class ColourName(val en: String, val te: String? = null, val hex: String) { val name: L get() = L(en, te) }
@Serializable data class BabyName(val id: String, val en: String, val te: String? = null)
@Serializable data class MotherBaby(val mother: String, val baby: BabyName)
@Serializable data class ShapeDef(val id: String, val name: L, val path: String, val aspect: Float, val colour: String, val hint: L)
@Serializable data class Placed(val shape: String, val x: Float, val y: Float, val w: Float, val h: Float, val fill: String, val rot: Float? = null, val label: L? = null)
@Serializable data class ShapeScene(val id: String, val target: String, val title: L, val sky: String, val ground: String, val decor: List<Placed> = emptyList(), val items: List<Placed>)
@Serializable data class ShapeBuild(val id: String, val name: L, val slots: List<Placed>)
@Serializable data class MemorySize(val id: String, val pairs: Int, val cols: Int, val name: L)
@Serializable data class Cover(val id: String, val title: L, val cover: String)
@Serializable data class Recipe(val paints: List<String>, val makes: String)
@Serializable data class Rhyme(val id: String, val title: L, val art: String, val bpm: Int, val source: String, val credit: L, val lines: List<L>)
@Serializable data class OppSide(val key: String, val word: L, val art: String, val v: String? = null, val scale: Float? = null)
@Serializable data class OppPair(val id: String, val level: Int, val a: OppSide, val b: OppSide)
@Serializable data class SafariSource(val id: String, val sfx: String, val art: String, val name: L, val group: String, val clash: String? = null, val clue: L? = null)
@Serializable data class Sticker(val id: String, val art: String, val v: String? = null, val name: L, val source: String, val bg: String)
@Serializable data class StickerState(val earned: Map<String, Long> = emptyMap(), val days: List<String> = emptyList())
@Serializable data class ModelPart(
    val id: String, val kind: String, val x: Float, val y: Float, val w: Float, val h: Float, val c: String, val lv: Int,
    val angle: Float? = null, val mirror: Boolean = false, val turn: Int? = null, val n: String? = null, val role: String? = null,
)
@Serializable data class Model(val id: String, val name: L, val alive: String, val dir: Int? = null, val cues: List<JsonArray> = emptyList(), val scene: String, val parts: List<ModelPart>) {
    /** [(ms, sfx)] */
    val cueList: List<Pair<Long, String>> get() = cues.mapNotNull { a -> val t = a.getOrNull(0)?.jsonPrimitive?.doubleOrNull ?: return@mapNotNull null; val n = a.getOrNull(1)?.jsonPrimitive?.contentOrNull ?: return@mapNotNull null; t.toLong() to n }
}
@Serializable data class FreeBody(val id: String, val name: L, val sfx: String)
@Serializable data class FreeWheel(val id: String, val name: L, val r: Float)
@Serializable data class FreeDesign(val body: String = "car", val wheel: String = "small", val colour: String = "#4F86C6")
@Serializable data class Orient(val rot: Int = 0, val flip: Boolean = false)
@Serializable data class BuildState(val done: Map<String, Int> = emptyMap(), val level: Int = 1, val free: FreeDesign? = null)

// ---- stories ----
@Serializable data class Actor(val id: String, val art: String, val x: Float, val y: Float, val s: Float? = 1f, val v: String? = null, val hidden: Boolean = false, val flip: Boolean = false, val back: Boolean = false)
@Serializable data class Move(val actor: String, val dx: Float, val dy: Float)
@Serializable data class Interaction(
    val kind: String, val actor: String? = null, val actors: List<String> = emptyList(), val prompt: L, val say: L,
    val show: List<String>? = null, val hide: List<String>? = null, val set: Map<String, String>? = null, val move: Move? = null, val react: String? = null,
    val each: String? = null, val eachV: String? = null, val level: String? = null,
)
@Serializable data class StoryPage(val bg: String, val text: L, val actors: List<Actor>, val act: Interaction? = null)
@Serializable data class StoryQuestion(val q: L, val choices: List<String>, val answer: String, val labels: Map<String, L>? = null)
@Serializable data class Story(val id: String, val title: L, val cover: String, val pages: List<StoryPage>, val questions: List<StoryQuestion>)
@Serializable data class Key(val t: Float, val x: Float? = null, val y: Float? = null, val r: Float? = null, val s: Float? = null, val sx: Float? = null, val sy: Float? = null, val o: Float? = null)
@Serializable data class Track(val actor: String, val keys: List<Key>, val origin: String? = null)
@Serializable data class Cue(val t: Float, val sfx: String)
@Serializable data class VSet(val t: Float, val actor: String, val v: String)
@Serializable data class TapMotion(val tracks: List<Track> = emptyList(), val cues: List<Cue> = emptyList())
@Serializable data class PageMotion(
    val dur: Float, val what: L, val tracks: List<Track> = emptyList(), val cues: List<Cue> = emptyList(),
    val init: Map<String, String> = emptyMap(), val sets: List<VSet> = emptyList(), val extras: List<Actor> = emptyList(),
    val tap: Map<String, TapMotion> = emptyMap(), val bed: String? = null,
)
@Serializable data class Blink(val c: String, val e: List<List<Float>>)

@Serializable
data class EarlyBundle(
    val pictures: List<Pic>,
    val sets: List<PicSet>,
    val catNames: Map<String, L>,
    val colourNames: Map<String, ColourName>,
    val motherBaby: List<MotherBaby>,
    val shapes: List<ShapeDef>,
    val shapeScenes: List<ShapeScene>,
    val shapeBuilds: List<ShapeBuild>,
    val memorySizes: List<MemorySize>,
    val memoryThemes: List<Cover>,
    val mixColours: Map<String, ColourName>,
    val mixPaints: List<List<String>>,
    val mixTargets: List<List<String>>,
    val recipes: List<Recipe>,
    val maxBowl: Int,
    val rhymes: List<Rhyme>,
    val clapWindow: List<Int>,
    val opposites: List<OppPair>,
    val oppLevels: List<L>,
    val patLevels: List<L>,
    val patTokens: Map<String, List<String>>,
    val safari: List<SafariSource>,
    val safariGroups: List<Cover>,
    val dailySteps: Int,
    val stickers: List<Sticker>,
    val stickerSources: Map<String, L>,
    val models: List<Model>,
    val levelNames: Map<String, L>,
    val partNames: Map<String, L>,
    val palette: List<String>,
    val freeBodies: List<FreeBody>,
    val freeWheels: List<FreeWheel>,
    val freeInit: FreeDesign,
    val aliveMs: Long,
    val snap: Map<String, Float>,
    val magnet: Map<String, Float>,
    val stories: List<Story>,
    val motion: Map<String, List<PageMotion>>,
    val autoTurnMs: Long,
    val propNames: Map<String, L>,
    val blink: Map<String, Blink>,
    val actArtIds: List<String>,
    val artIds: List<String>,
) {
    val pic: Map<String, Pic> by lazy { pictures.associateBy { it.id } }
    val shape: Map<String, ShapeDef> by lazy { shapes.associateBy { it.id } }
    val sticker: Map<String, Sticker> by lazy { stickers.associateBy { it.id } }
    val safariById: Map<String, SafariSource> by lazy { safari.associateBy { it.id } }
    val model: Map<String, Model> by lazy { models.associateBy { it.id } }
    val story: Map<String, Story> by lazy { stories.associateBy { it.id } }

    /** Name of a picture / prop / colour / shape token (same lookup order as the website). */
    fun nameOf(id: String): L = pic[id]?.name ?: propNames[id] ?: if (id.startsWith("c-")) colourNames[id.removePrefix("c-")]?.name ?: L(id, id)
    else if (id.startsWith("shape-")) shape[id.removePrefix("shape-")]?.name ?: L(id, id) else L(id, id)
    /** Pattern token names (tokenName in activities.ts). */
    fun tokenName(token: String): L = nameOf(token)
    fun partName(p: ModelPart): L = partNames[p.n ?: p.kind] ?: partNames[p.kind] ?: L(p.kind, p.kind)
}

/** Loads Play & Learn content once per app run (engine call off the main thread). */
object EarlyContent {
    var bundle by mutableStateOf<EarlyBundle?>(null)
        private set
    var error by mutableStateOf<String?>(null)
        private set
    private val lock = Mutex()

    suspend fun load(engine: Engine): EarlyBundle? = lock.withLock {
        bundle ?: runCatching { engine.get<EarlyBundle>("early.bundle") }
            .onSuccess { bundle = it; error = null }
            .onFailure { error = it.message ?: "Could not load" }
            .getOrNull()
    }
}

/** The Play & Learn content (null while it loads for the first time). */
@Composable
fun rememberEarly(): EarlyBundle? {
    val app = LocalApp.current
    val b = EarlyContent.bundle
    LaunchedEffect(b == null) { if (b == null) EarlyContent.load(app.engine) }
    return b
}

// ---------------- engine call helpers ----------------
/** Calls an "early.*" engine function and decodes the result (null on any failure — screens never crash). */
suspend inline fun <reified T> Engine.early(fn: String, vararg args: Any?): T? =
    runCatching { AppJson.decodeFromJsonElement<T>(call("early.$fn", *args)) }.getOrNull()

/** Encodes a @Serializable value for an engine argument. */
inline fun <reified T> json(v: T): JsonElement = AppJson.encodeToJsonElement(serializer<T>(), v)
fun <T> json(ser: KSerializer<T>, v: T): JsonElement = AppJson.encodeToJsonElement(ser, v)

val JsonElement?.str: String? get() = (this as? JsonPrimitive)?.takeIf { it.isString }?.content
val JsonElement?.isNullish: Boolean get() = this == null || this is JsonNull
fun JsonObject.l(key: String): L? = this[key]?.let { runCatching { AppJson.decodeFromJsonElement<L>(it) }.getOrNull() }

// ---------------- rounds (shapes returned by the engine) ----------------
@Serializable data class Adapt(val choices: Int = 2, val streak: Int = 0, val misses: Int = 0)
@Serializable data class PicRound(val mode: String, val target: String, val choices: List<String>, val base: String? = null)
@Serializable data class SortItem(val key: String, val art: String, val basket: String, val big: Boolean? = null)
@Serializable data class SortBasket(val id: String, val label: L, val art: String? = null, val colour: String? = null)
@Serializable data class SortRound(val kind: String, val baskets: List<SortBasket>, val items: List<SortItem>)
@Serializable data class MatchCard(val key: String, val art: String, val label: L, val shadow: Boolean = false, val small: Boolean = false)
@Serializable data class MatchRound(val kind: String, val left: List<MatchCard>, val right: List<MatchCard>, val pairs: Map<String, String>)
@Serializable data class ShapePatternRound(val seq: List<String>, val answer: String, val choices: List<String>, val unit: List<String>)
@Serializable data class MemCard(val idx: Int, val pair: String, val art: String)
@Serializable data class MixRound(val target: String, val paints: List<String>)
@Serializable data class MixQuiz(val target: String, val options: List<List<String>>, val answer: Int)
@Serializable data class OppRound(val kind: String, val pair: String, val ask: OppSide, val choices: List<OppSide>, val shown: OppSide? = null)
@Serializable data class PatRound(val kind: String, val level: Int, val unit: List<String>, val seq: List<String>, val blank: Int, val answer: String, val choices: List<String>)
@Serializable data class SafariRound(val group: String, val target: String, val choices: List<String>)
@Serializable data class DailyStep(val kind: String, val round: JsonElement? = null, val quiz: MixQuiz? = null) {
    val pattern: PatRound? get() = if (kind == "pattern") round?.let { runCatching { AppJson.decodeFromJsonElement<PatRound>(it) }.getOrNull() } else null
    val opposite: OppRound? get() = if (kind == "opposite") round?.let { runCatching { AppJson.decodeFromJsonElement<OppRound>(it) }.getOrNull() } else null
    val safari: SafariRound? get() = if (kind == "safari") round?.let { runCatching { AppJson.decodeFromJsonElement<SafariRound>(it) }.getOrNull() } else null
}
@Serializable data class GiveResult(val sticker: Sticker? = null, val state: StickerState = StickerState(), val count: Int = 0)
@Serializable data class ClapResult(val hits: List<Boolean>, val count: Int, val extra: Int)
@Serializable data class DropResult(val slot: String? = null, val turn: String? = null)
@Serializable data class MagnetResult(val x: Float, val y: Float, val near: String? = null)
@Serializable data class StartOrient(val o: Orient, val turn: Boolean = false, val flip: Boolean = false)
