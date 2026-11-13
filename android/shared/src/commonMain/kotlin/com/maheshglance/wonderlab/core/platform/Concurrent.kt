package com.maheshglance.wonderlab.core.platform

import kotlinx.atomicfu.locks.SynchronizedObject
import kotlinx.atomicfu.locks.synchronized

/** Small thread-safe map (replaces java.util.concurrent.ConcurrentHashMap in shared code). */
class SyncMap<K, V> : SynchronizedObject() {
    private val m = HashMap<K, V>()
    operator fun get(k: K): V? = synchronized(this) { m[k] }
    operator fun set(k: K, v: V) { synchronized(this) { m[k] = v } }
    fun remove(k: K): V? = synchronized(this) { m.remove(k) }
    fun clear() = synchronized(this) { m.clear() }
    fun containsKey(k: K) = synchronized(this) { m.containsKey(k) }
    fun getOrPut(k: K, f: () -> V): V = synchronized(this) { m.getOrPut(k, f) }
    val size: Int get() = synchronized(this) { m.size }
    fun snapshot(): Map<K, V> = synchronized(this) { HashMap(m) }
}

/** Thread-safe list for listeners (replaces CopyOnWriteArrayList). */
class SyncList<T> : SynchronizedObject() {
    private var items: List<T> = emptyList()
    fun add(t: T) { synchronized(this) { items = items + t } }
    fun remove(t: T) { synchronized(this) { items = items - t } }
    fun clear() { synchronized(this) { items = emptyList() } }
    fun toList(): List<T> = items
}
