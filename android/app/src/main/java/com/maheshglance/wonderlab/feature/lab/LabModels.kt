package com.maheshglance.wonderlab.feature.lab

import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/*
 * Kotlin port of the website's lab models (src/features/lab/{common,motion,forces,circuit,light}.ts) so the
 * simulations run natively at 60 fps. Formulas, constants and rounding are identical; LabModelsTest checks
 * them against reference runs produced by the TypeScript (scripts/test-android-games.cjs → lab-golden.json).
 * Pure Kotlin: no Android types.
 */

data class LabRange(val min: Double, val max: Double, val step: Double)

object LabMath {
    fun clamp(v: Double, lo: Double, hi: Double) = min(hi, max(lo, v))
    /** +v.toFixed(9): hides floating-point noise. */
    fun tidy(v: Double): Double = if (!v.isFinite()) v else BigDecimal(v).setScale(9, RoundingMode.HALF_UP).toDouble()
    private fun jsRound(x: Double) = floor(x + 0.5)
    fun snap(v: Double, r: LabRange): Double {
        val s = jsRound((clamp(v, r.min, r.max) - r.min) / r.step) * r.step + r.min
        return tidy(clamp(s, r.min, r.max))
    }
    fun deg(r: Double) = r * 180 / PI
    fun rad(d: Double) = d * PI / 180
    /** "Nice" axis maximum >= v (1, 2, 2.5, 5 × 10^n). */
    fun niceCeil(v: Double): Double {
        if (!(v > 0)) return 1.0
        val p = Math.pow(10.0, floor(kotlin.math.log10(v)))
        for (m in listOf(1.0, 2.0, 2.5, 5.0, 10.0)) if (m * p >= v - 1e-9) return tidy(m * p)
        return tidy(10 * p)
    }
}

private fun tidy(v: Double) = LabMath.tidy(v)

// ------------------------------------------------------------------ motion
data class MotionParams(val u: Double = 2.0, val a: Double = 1.0, val t: Double = 8.0)
data class MotionSample(val t: Double, val x: Double, val v: Double)
data class MotionState(val steps: Int, val t: Double, val x: Double, val v: Double, val stopped: Boolean, val done: Boolean, val samples: List<MotionSample>)

object Motion {
    const val DT = 0.05
    val RANGES = mapOf("u" to LabRange(0.0, 30.0, 0.5), "a" to LabRange(-10.0, 10.0, 0.5), "t" to LabRange(1.0, 20.0, 0.5))
    fun stopTime(u: Double, a: Double): Double? = if (a < 0) u / -a else null
    data class K(val x: Double, val v: Double, val stopped: Boolean)
    fun kinematics(u: Double, a: Double, t: Double): K {
        val ts = stopTime(u, a)
        if (ts != null && t >= ts) return K(tidy(u * ts + 0.5 * a * ts * ts), 0.0, true)
        return K(tidy(u * t + 0.5 * a * t * t), tidy(u + a * t), false)
    }
    fun init(p: MotionParams) = MotionState(0, 0.0, 0.0, p.u, false, false, listOf(MotionSample(0.0, 0.0, p.u)))
    fun step(s: MotionState, p: MotionParams): MotionState {
        if (s.done) return s
        val steps = s.steps + 1
        val ts = stopTime(p.u, p.a)
        var t = min(tidy(steps * DT), p.t)
        if (ts != null && t > ts) t = tidy(ts)
        val k = kinematics(p.u, p.a, t)
        val done = t >= p.t - 1e-9 || k.stopped
        return MotionState(steps, t, k.x, k.v, k.stopped, done, s.samples + MotionSample(t, k.x, k.v))
    }
    fun advance(s: MotionState, p: MotionParams, n: Int): MotionState { var c = s; var i = 0; while (i < n && !c.done) { c = step(c, p); i++ }; return c }
    data class Outcome(val tEnd: Double, val x: Double, val v: Double, val stopped: Boolean, val vMax: Double)
    fun outcome(p: MotionParams): Outcome {
        val ts = stopTime(p.u, p.a)
        val end = if (ts != null && ts < p.t) ts else p.t
        val k = kinematics(p.u, p.a, end)
        return Outcome(tidy(end), k.x, k.v, k.stopped, max(p.u, k.v))
    }
}

// ------------------------------------------------------------------ forces
data class ForcesParams(val mass: Double = 5.0, val force: Double = 30.0, val friction: Double = 0.3)
data class ForceBreakdown(val weight: Double, val normal: Double, val maxFriction: Double, val friction: Double, val net: Double, val acceleration: Double, val sliding: Boolean)
data class ForcesState(val steps: Int = 0, val t: Double = 0.0, val x: Double = 0.0, val v: Double = 0.0, val done: Boolean = false)

object Forces {
    const val G = 9.8
    const val DT = 0.05
    const val RUN = 10.0
    val RANGES = mapOf("mass" to LabRange(1.0, 50.0, 1.0), "force" to LabRange(0.0, 200.0, 0.1), "friction" to LabRange(0.0, 1.0, 0.05))
    fun breakdown(p: ForcesParams, speed: Double): ForceBreakdown {
        val weight = tidy(p.mass * G)
        val normal = weight
        val maxF = tidy(p.friction * normal)
        val friction: Double; val net: Double; val sliding: Boolean
        if (speed > 1e-9 || p.force > maxF + 1e-9) { friction = maxF; net = tidy(p.force - maxF); sliding = true }
        else { friction = p.force; net = 0.0; sliding = false }
        return ForceBreakdown(weight, normal, maxF, friction, net, tidy(net / p.mass), sliding)
    }
    fun step(s: ForcesState, p: ForcesParams): ForcesState {
        if (s.done) return s
        val a = breakdown(p, s.v).acceleration
        var nv = s.v + a * DT
        val dx: Double
        if (nv < 0) { val tStop = s.v / -a; dx = s.v * tStop + 0.5 * a * tStop * tStop; nv = 0.0 } else dx = s.v * DT + 0.5 * a * DT * DT
        val steps = s.steps + 1
        val t = tidy(steps * DT)
        return ForcesState(steps, t, tidy(s.x + dx), tidy(nv), t >= RUN - 1e-9)
    }
    fun advance(s: ForcesState, p: ForcesParams, n: Int): ForcesState { var c = s; var i = 0; while (i < n && !c.done) { c = step(c, p); i++ }; return c }
}

// ------------------------------------------------------------------ circuit
data class CircuitParams(val cells: Int = 2, val bulbs: Int = 1, val closed: Boolean = false, val gap: String? = null)
data class CircuitSolution(val voltage: Double, val resistance: Double, val current: Double, val complete: Boolean, val bulbVoltage: Double, val bulbPower: Double, val totalPower: Double, val brightness: Double)
data class CircuitState(val steps: Int = 0, val t: Double = 0.0, val phase: Double = 0.0)

object Circuit {
    const val CELL_V = 1.5
    const val BULB_R = 3.0
    const val MAX_CELLS = 4
    const val MAX_BULBS = 3
    const val DT = 0.05
    val P_MAX = Math.pow(MAX_CELLS * CELL_V / BULB_R, 2.0) * BULB_R
    fun solve(c: CircuitParams): CircuitSolution {
        val voltage = tidy(c.cells * CELL_V)
        val resistance = tidy(c.bulbs * BULB_R)
        val complete = c.closed && c.gap == null && c.cells > 0 && c.bulbs > 0
        val current = if (complete) tidy(voltage / resistance) else 0.0
        val bulbV = tidy(current * BULB_R)
        val bulbP = tidy(current * current * BULB_R)
        return CircuitSolution(voltage, resistance, current, complete, bulbV, bulbP, tidy(bulbP * c.bulbs), LabMath.clamp(bulbP / P_MAX, 0.0, 1.0))
    }
    fun brightnessWord(power: Double) = when { power <= 0 -> "off"; power < 0.5 -> "dim"; power < 2 -> "medium"; power < 6 -> "bright"; else -> "very bright" }
    fun step(s: CircuitState, c: CircuitParams): CircuitState {
        val i = solve(c).current
        val steps = s.steps + 1
        return CircuitState(steps, tidy(steps * DT), tidy((s.phase + i * 0.25 * DT) % 1))
    }
    fun advance(s: CircuitState, c: CircuitParams, n: Int): CircuitState { var x = s; repeat(n) { x = step(x, c) }; return x }
}

// ------------------------------------------------------------------ light
data class Vec(val x: Double, val y: Double) {
    operator fun plus(o: Vec) = Vec(x + o.x, y + o.y)
    operator fun minus(o: Vec) = Vec(x - o.x, y - o.y)
    operator fun times(k: Double) = Vec(x * k, y * k)
}
data class LightParams(val sx: Double = 14.0, val sy: Double = 52.0, val aim: Double = -60.0, val tilt: Double = 0.0)
data class Target(val x: Double, val y: Double, val r: Double)
data class Trace(val source: Vec, val incEnd: Vec, val hit: Vec?, val backside: Boolean, val normal: Vec, val incidence: Double?, val reflection: Double?, val reflEnd: Vec?, val reflDir: Vec?, val hitsTarget: Boolean, val pathLength: Double)
data class LightState(val steps: Int = 0, val t: Double = 0.0, val dist: Double = 0.0, val done: Boolean = false)

object Light {
    const val W = 100.0
    const val H = 70.0
    const val MCX = 50.0
    const val MCY = 10.0
    const val MLEN = 56.0
    const val DT = 0.05
    const val PULSE_SPEED = 80.0
    val RANGES = mapOf("sx" to LabRange(3.0, 97.0, 0.5), "sy" to LabRange(22.0, 67.0, 0.5), "aim" to LabRange(-180.0, 180.0, 1.0), "tilt" to LabRange(-30.0, 30.0, 1.0))

    fun dot(a: Vec, b: Vec) = a.x * b.x + a.y * b.y
    private fun cross(a: Vec, b: Vec) = a.x * b.y - a.y * b.x
    fun len(a: Vec) = hypot(a.x, a.y)
    fun norm(a: Vec): Vec { val l = len(a).let { if (it == 0.0) 1.0 else it }; return Vec(a.x / l, a.y / l) }
    fun dirFromAngle(d: Double) = Vec(cos(LabMath.rad(d)), sin(LabMath.rad(d)))
    fun mirrorEnds(tilt: Double): Pair<Vec, Vec> { val d = dirFromAngle(tilt) * (MLEN / 2); val c = Vec(MCX, MCY); return (c - d) to (c + d) }
    fun mirrorNormal(tilt: Double) = Vec(-sin(LabMath.rad(tilt)), cos(LabMath.rad(tilt)))
    private data class Hit(val t: Double, val u: Double, val point: Vec)
    private fun intersect(o: Vec, d: Vec, a: Vec, b: Vec): Hit? {
        val e = b - a
        val den = cross(d, e)
        if (abs(den) < 1e-12) return null
        val ao = a - o
        val t = cross(ao, e) / den; val u = cross(ao, d) / den
        if (t <= 1e-9 || u < 0 || u > 1) return null
        return Hit(t, u, o + d * t)
    }
    fun angleBetween(a: Vec, b: Vec) = tidy(LabMath.deg(atan2(abs(cross(a, b)), dot(a, b))))
    private fun reflect(d: Vec, n: Vec) = d - n * (2 * dot(d, n))
    fun rayExit(o: Vec, d: Vec): Vec {
        var best = Double.POSITIVE_INFINITY
        if (d.x > 1e-12) best = min(best, (W - o.x) / d.x)
        if (d.x < -1e-12) best = min(best, -o.x / d.x)
        if (d.y > 1e-12) best = min(best, (H - o.y) / d.y)
        if (d.y < -1e-12) best = min(best, -o.y / d.y)
        return o + d * (if (best.isFinite()) max(0.0, best) else 0.0)
    }
    private fun hitsCircle(o: Vec, d: Vec, c: Vec, r: Double, maxT: Double): Boolean {
        val t = LabMath.clamp(dot(c - o, d), 0.0, maxT)
        return len(o + d * t - c) <= r
    }
    fun trace(p: LightParams, target: Target? = null): Trace {
        val o = Vec(p.sx, p.sy); val d = norm(dirFromAngle(p.aim))
        val (a, b) = mirrorEnds(p.tilt); val n = mirrorNormal(p.tilt)
        val hit = intersect(o, d, a, b)
        if (hit == null) {
            val inc = rayExit(o, d)
            return Trace(o, inc, null, false, n, null, null, null, null, false, len(inc - o))
        }
        if (dot(d, n) > 0) return Trace(o, hit.point, hit.point, true, n, null, null, null, null, false, hit.t)
        val r = norm(reflect(d, n))
        val incidence = angleBetween(d * -1.0, n)
        val reflection = angleBetween(r, n)
        val reflEnd = rayExit(hit.point, r)
        val reflLen = len(reflEnd - hit.point)
        val hits = target != null && hitsCircle(hit.point, r, Vec(target.x, target.y), target.r, reflLen)
        return Trace(o, hit.point, hit.point, false, n, incidence, reflection, reflEnd, r, hits, hit.t + reflLen)
    }
    fun aimAt(sx: Double, sy: Double, q: Vec) = tidy(LabMath.deg(atan2(q.y - sy, q.x - sx)))
    fun placeForIncidence(angle: Double, tilt: Double, dist: Double = 42.0): LightParams {
        val i = LabMath.rad(LabMath.clamp(angle, 0.0, 85.0))
        val n = mirrorNormal(tilt)
        val toSource = Vec(n.x * cos(i) - n.y * sin(i), n.x * sin(i) + n.y * cos(i))
        val s = Vec(MCX, MCY) + toSource * dist
        val r = RANGES
        val sx = tidy(LabMath.clamp(s.x, r.getValue("sx").min, r.getValue("sx").max)); val sy = tidy(LabMath.clamp(s.y, r.getValue("sy").min, r.getValue("sy").max))
        return LightParams(sx, sy, aimAt(sx, sy, Vec(MCX, MCY)), tilt)
    }
    fun step(s: LightState, pathLength: Double): LightState {
        if (s.done) return s
        val steps = s.steps + 1
        val dist = min(pathLength, tidy(steps * DT * PULSE_SPEED))
        return LightState(steps, tidy(steps * DT), dist, dist >= pathLength - 1e-9)
    }
    fun advance(s: LightState, pathLength: Double, n: Int): LightState { var c = s; var i = 0; while (i < n && !c.done) { c = step(c, pathLength); i++ }; return c }
    fun pointAlong(tr: Trace, dist: Double): Vec {
        val l1 = len(tr.incEnd - tr.source)
        if (dist <= l1 || tr.hit == null || tr.reflEnd == null) return tr.source + norm(tr.incEnd - tr.source) * min(dist, l1)
        val l2 = len(tr.reflEnd - tr.hit)
        return tr.hit + norm(tr.reflEnd - tr.hit) * min(dist - l1, l2)
    }
}
