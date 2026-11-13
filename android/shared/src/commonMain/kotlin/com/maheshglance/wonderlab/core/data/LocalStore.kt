package com.maheshglance.wonderlab.core.data

import com.maheshglance.wonderlab.core.engine.AppJson
import kotlinx.atomicfu.locks.SynchronizedObject
import kotlinx.atomicfu.locks.synchronized
import kotlinx.io.buffered
import kotlinx.io.files.Path
import kotlinx.io.files.SystemFileSystem
import kotlinx.io.readByteArray
import kotlinx.io.readString
import kotlinx.io.writeString
import kotlinx.serialization.KSerializer

/** Small file helpers on kotlinx-io (same code on Android and iOS). */
object Files {
    fun exists(path: String) = SystemFileSystem.exists(Path(path))
    fun mkdirs(path: String) { runCatching { SystemFileSystem.createDirectories(Path(path)) } }
    fun readText(path: String): String? = runCatching { SystemFileSystem.source(Path(path)).buffered().use { it.readString() } }.getOrNull()
    fun readBytes(path: String): ByteArray? = runCatching { SystemFileSystem.source(Path(path)).buffered().use { s -> s.readByteArray() } }.getOrNull()
    fun writeBytes(path: String, bytes: ByteArray) { SystemFileSystem.sink(Path(path)).buffered().use { it.write(bytes) } }
    /** Atomic replace (temp file + rename) so a crash never leaves half-written data. */
    fun writeText(path: String, text: String) {
        val tmp = Path("$path.tmp")
        SystemFileSystem.sink(tmp).buffered().use { it.writeString(text) }
        runCatching { SystemFileSystem.atomicMove(tmp, Path(path)) }.onFailure {
            runCatching { SystemFileSystem.delete(Path(path), mustExist = false) }
            SystemFileSystem.atomicMove(tmp, Path(path))
        }
    }
    fun delete(path: String) { runCatching { SystemFileSystem.delete(Path(path), mustExist = false) } }
    fun list(dir: String): List<String> = runCatching { SystemFileSystem.list(Path(dir)).map { it.name } }.getOrDefault(emptyList())
    fun size(path: String): Long = runCatching { SystemFileSystem.metadataOrNull(Path(path))?.size ?: 0L }.getOrDefault(0L)
    /** Total bytes in a folder (recursively). */
    fun dirSize(dir: String): Long = runCatching {
        SystemFileSystem.list(Path(dir)).sumOf { p ->
            val m = SystemFileSystem.metadataOrNull(p)
            if (m?.isDirectory == true) dirSize(p.toString()) else (m?.size ?: 0L)
        }
    }.getOrDefault(0L)
}

/**
 * Small JSON-file store in app-private storage (never readable by other apps).
 * Writes are atomic (temp file + rename) so a crash never leaves half-written progress.
 */
class LocalStore(dataDir: String) : SynchronizedObject() {
    private val dir = "$dataDir/store".also { Files.mkdirs(it) }

    private fun safe(key: String) = key.replace(Regex("[^A-Za-z0-9._-]"), "_")
    private fun file(key: String) = "$dir/${safe(key)}.json"

    fun <T> read(key: String, serializer: KSerializer<T>): T? = synchronized(this) {
        runCatching { Files.readText(file(key))?.let { AppJson.decodeFromString(serializer, it) } }.getOrNull()
    }

    fun <T> write(key: String, serializer: KSerializer<T>, value: T) = synchronized(this) {
        Files.writeText(file(key), AppJson.encodeToString(serializer, value))
    }

    fun readText(key: String): String? = synchronized(this) { Files.readText(file(key)) }
    fun writeText(key: String, text: String) = synchronized(this) { Files.writeText(file(key), text) }

    fun delete(key: String) = synchronized(this) { Files.delete(file(key)) }

    /** Deletes every key that starts with the prefix (e.g. one account's data on sign-out). */
    fun deletePrefix(prefix: String) = synchronized(this) {
        val p = safe(prefix)
        Files.list(dir).filter { it.startsWith(p) }.forEach { Files.delete("$dir/$it") }
    }

    fun keys(prefix: String): List<String> = synchronized(this) {
        val p = safe(prefix)
        Files.list(dir).filter { it.endsWith(".json") }.map { it.removeSuffix(".json") }.filter { it.startsWith(p) }
    }

    fun clearAll() = synchronized(this) { Files.list(dir).forEach { Files.delete("$dir/$it") } }
}
