package com.maheshglance.wonderlab.core.data

import android.content.Context
import com.maheshglance.wonderlab.core.engine.AppJson
import kotlinx.serialization.KSerializer
import java.io.File

/**
 * Small JSON-file store in app-private storage (never readable by other apps).
 * Writes are atomic (temp file + rename) so a crash never leaves half-written progress.
 */
class LocalStore(context: Context) {
    private val dir = File(context.filesDir, "store").apply { mkdirs() }

    private fun file(key: String) = File(dir, key.replace(Regex("[^A-Za-z0-9._-]"), "_") + ".json")

    @Synchronized fun <T> read(key: String, serializer: KSerializer<T>): T? =
        runCatching { file(key).takeIf { it.exists() }?.readText()?.let { AppJson.decodeFromString(serializer, it) } }.getOrNull()

    @Synchronized fun <T> write(key: String, serializer: KSerializer<T>, value: T) {
        val f = file(key)
        val tmp = File(f.parentFile, f.name + ".tmp")
        tmp.writeText(AppJson.encodeToString(serializer, value))
        if (!tmp.renameTo(f)) { f.delete(); tmp.renameTo(f) }
    }

    @Synchronized fun readText(key: String): String? = runCatching { file(key).takeIf { it.exists() }?.readText() }.getOrNull()
    @Synchronized fun writeText(key: String, text: String) { val f = file(key); val tmp = File(f.parentFile, f.name + ".tmp"); tmp.writeText(text); if (!tmp.renameTo(f)) { f.delete(); tmp.renameTo(f) } }

    @Synchronized fun delete(key: String) { file(key).delete() }

    /** Deletes every key that starts with the prefix (e.g. one account's data on sign-out). */
    @Synchronized fun deletePrefix(prefix: String) {
        val p = prefix.replace(Regex("[^A-Za-z0-9._-]"), "_")
        dir.listFiles()?.filter { it.name.startsWith(p) }?.forEach { it.delete() }
    }

    @Synchronized fun keys(prefix: String): List<String> {
        val p = prefix.replace(Regex("[^A-Za-z0-9._-]"), "_")
        return dir.listFiles()?.map { it.name.removeSuffix(".json") }?.filter { it.startsWith(p) && !it.endsWith(".tmp") } ?: emptyList()
    }

    @Synchronized fun clearAll() { dir.listFiles()?.forEach { it.delete() } }
}
