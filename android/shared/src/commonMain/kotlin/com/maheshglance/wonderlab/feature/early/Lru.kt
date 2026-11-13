package com.maheshglance.wonderlab.feature.early

import kotlinx.atomicfu.locks.SynchronizedObject
import kotlinx.atomicfu.locks.synchronized
import kotlin.concurrent.Volatile

/** A small thread-safe least-recently-used cache (common replacement for android.util.LruCache). */
class Lru<K : Any, V : Any>(private val maxSize: Int, private val sizeOf: (K, V) -> Int = { _, _ -> 1 }) {
    private val lock = SynchronizedObject()
    private val map = LinkedHashMap<K, V>()
    private var size = 0

    fun get(key: K): V? = synchronized(lock) {
        val v = map.remove(key) ?: return@synchronized null
        map[key] = v // move to most recent
        v
    }

    fun put(key: K, value: V) = synchronized(lock) {
        map.remove(key)?.let { size -= sizeOf(key, it) }
        map[key] = value
        size += sizeOf(key, value)
        while (size > maxSize && map.isNotEmpty()) {
            val k = map.keys.first()
            map.remove(k)?.let { size -= sizeOf(k, it) }
        }
    }
}

/** A thread-safe list that is copied on write, so iterating never sees concurrent changes (CopyOnWriteArrayList). */
class CowList<T> {
    private val lock = SynchronizedObject()
    @Volatile private var items: List<T> = emptyList()

    operator fun plusAssign(item: T) { synchronized(lock) { items = items + item } }
    fun add(item: T) { plusAssign(item) }
    fun remove(item: T): Boolean = synchronized(lock) { val before = items.size; items = items - item; items.size != before }
    fun clear() { synchronized(lock) { items = emptyList() } }
    fun snapshot(): List<T> = items
    inline fun forEach(action: (T) -> Unit) { snapshot().forEach(action) }
    val size: Int get() = items.size
}
