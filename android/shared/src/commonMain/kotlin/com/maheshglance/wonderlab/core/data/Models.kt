package com.maheshglance.wonderlab.core.data

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject

/** English text with optional Telugu (the website's Localized). */
@Serializable
data class Localized(val en: String = "", val te: String? = null) {
    fun get(lang: String): String = if (lang == "te" && !te.isNullOrBlank()) te else en
}

@Serializable
data class Account(
    val id: String,
    val username: String,
    val email: String? = null,
    val emailVerified: Boolean = false,
    val role: String = "parent",
    val securityQuestion: String? = null,
)

@Serializable
data class SessionInfo(val persistent: Boolean = false, val verifiedUntil: Long = 0, val idleLimitSec: Long = 0, val expiresAt: Long = 0)

@Serializable
data class LastActivity(val path: String, val label: String, val at: Long)

/** Learner preferences (same keys as the website's Prefs; unknown keys are kept in `extra`). */
@Serializable
data class Prefs(
    val language: String = "en",
    val theme: String = "system",
    val textSize: Float = 1f,
    val reduceMotion: Boolean = false,
    val mute: Boolean = false,
    val volume: Float = 0.8f,
    val narration: Boolean = true,
    val breakEnabled: Boolean = true,
    val breakMinutes: Int = 20,
    val pressureMode: String = "auto",
    val manualIntensity: Float = 0.6f,
    val timers: Boolean = false,
    val readingSpeed: String? = null,
    val naturalVoice: Boolean = true,
    val naturalSpeaker: String = "luna",
    val lastActivity: LastActivity? = null,
    val calibration: JsonElement? = null,
    val artPalettes: JsonElement? = null,
)

@Serializable
data class Profile(
    val id: String,
    val nickname: String,
    val avatar: String,
    val classLevel: Int,
    val ageBand: String,
    val prefs: JsonObject = JsonObject(emptyMap()),
)

@Serializable
data class MasteryState(
    val objectiveId: String,
    val attempts: Int = 0,
    val correct: Int = 0,
    val distinctCorrect: List<String> = emptyList(),
    val streak: Int = 0,
    val level: Double = 1.0,
    val masteredAt: Long? = null,
    val nextReviewAt: Long? = null,
    val updatedAt: Long = 0,
)

@Serializable
data class SavedState(val state: JsonElement? = null, val updatedAt: Long = 0)

@Serializable
data class DownloadInfo(val version: String = "", val downloadedAt: Long = 0)

/** Everything needed to resume a learner; cached on the device so the app works offline. */
@Serializable
data class LearnerState(
    val mastery: Map<String, MasteryState> = emptyMap(),
    val lessons: Map<String, SavedState> = emptyMap(),
    val activities: Map<String, SavedState> = emptyMap(),
    val rewards: Map<String, Long> = emptyMap(),
    val downloads: Map<String, DownloadInfo> = emptyMap(),
    val appliedAttempts: List<String> = emptyList(),
)

@Serializable
data class ClassInfo(val level: Int, val key: String, val label: String, val labelTe: String, val typicalAge: Int)

@Serializable
data class AgeBandInfo(val id: String, val label: String, val labelTe: String)

@Serializable
data class AvatarInfo(val id: String, val emoji: String)

@Serializable
data class Presentation(
    val tier: String = "primary",
    val readAloud: Boolean = false,
    val bigTargets: Boolean = false,
    val allowTyping: Boolean = true,
    val teluguAvailable: Boolean = false,
)

@Serializable
data class Recommendation(val unitId: String, val objectiveId: String, val kind: String, val reason: Localized)

@Serializable
data class SourceRef(val book: String = "", val edition: String = "", val chapterTitle: String = "", val url: String? = null)

/** Curriculum outline (blocks, examples and items stay as JSON; the lesson feature decodes them). */
@Serializable
data class Objective(
    val id: String,
    val title: Localized,
    val prereqs: List<String> = emptyList(),
    val intro: List<JsonElement> = emptyList(),
    val examples: List<JsonElement> = emptyList(),
    val templates: List<String> = emptyList(),
    val items: List<JsonElement> = emptyList(),
    val activities: List<String> = emptyList(),
    val enrichment: Boolean = false,
)

@Serializable
data class CurriculumUnit(
    val id: String,
    val board: String = "cbse",
    val classLevel: Int,
    val subject: String,
    val title: Localized,
    val source: SourceRef? = null,
    val objectives: List<Objective> = emptyList(),
    val coverageNote: String? = null,
)

@Serializable
data class TemplateMeta(val id: String, val objectiveId: String, val difficulty: Int, val version: Int)

@Serializable
data class Outline(val units: List<CurriculumUnit>, val templates: List<TemplateMeta>)

@Serializable
data class PackInfo(val id: String, val kind: String, val title: String, val titleTe: String? = null, val classLevels: List<Int> = emptyList())
