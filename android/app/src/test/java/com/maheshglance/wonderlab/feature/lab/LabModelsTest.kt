package com.maheshglance.wonderlab.feature.lab

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.double
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The native lab models must match the website's TypeScript exactly. Reference runs come from the TS models
 * (scripts/test-android-games.cjs writes src/test/resources/lab-golden.json).
 */
class LabModelsTest {
    private val golden: JsonObject = Json.parseToJsonElement(
        javaClass.classLoader!!.getResourceAsStream("lab-golden.json")!!.bufferedReader().readText(),
    ).jsonObject

    private fun JsonElement.d(k: String) = jsonObject[k]!!.jsonPrimitive.double
    private fun JsonElement.i(k: String) = jsonObject[k]!!.jsonPrimitive.int
    private fun JsonElement.b(k: String) = jsonObject[k]!!.jsonPrimitive.boolean
    private fun eq(msg: String, a: Double, b: Double) = assertEquals(msg, a, b, 1e-9)

    @Test fun motion() {
        for (g in golden["motion"]!!.jsonArray) {
            val p = g.jsonObject["p"]!!.let { MotionParams(it.d("u"), it.d("a"), it.d("t")) }
            val s = Motion.advance(Motion.init(p), p, 10000)
            eq("t $p", g.d("t"), s.t); eq("x $p", g.d("x"), s.x); eq("v $p", g.d("v"), s.v)
            assertEquals(g.b("stopped"), s.stopped); assertEquals(g.i("steps"), s.steps)
            val mid = g.jsonObject["mid"]!!
            val m = Motion.advance(Motion.init(p), p, 37)
            eq("mid x", mid.d("x"), m.x); eq("mid v", mid.d("v"), m.v); assertEquals(mid.jsonObject["samples"]!!.jsonArray.size, m.samples.size)
        }
    }

    @Test fun forces() {
        for (g in golden["forces"]!!.jsonArray) {
            val p = g.jsonObject["p"]!!.let { ForcesParams(it.d("mass"), it.d("force"), it.d("friction")) }
            for ((key, speed) in listOf("b" to 0.0, "bMoving" to 1.0)) {
                val b = Forces.breakdown(p, speed); val r = g.jsonObject[key]!!
                eq("weight", r.d("weight"), b.weight); eq("maxFriction", r.d("maxFriction"), b.maxFriction); eq("friction", r.d("friction"), b.friction)
                eq("net", r.d("net"), b.net); eq("acc", r.d("acceleration"), b.acceleration); assertEquals(r.b("sliding"), b.sliding)
            }
            val s = Forces.advance(ForcesState(), p, 1000)
            eq("t", g.d("t"), s.t); eq("x $p", g.d("x"), s.x); eq("v $p", g.d("v"), s.v)
            val m = Forces.advance(ForcesState(), p, 77); val mid = g.jsonObject["mid"]!!
            eq("mid x", mid.d("x"), m.x); eq("mid v", mid.d("v"), m.v)
        }
    }

    @Test fun circuit() {
        for (g in golden["circuit"]!!.jsonArray) {
            val p = g.jsonObject["p"]!!.let { CircuitParams(it.i("cells"), it.i("bulbs"), it.b("closed"), null) }
            val s = Circuit.solve(p); val r = g.jsonObject["s"]!!
            for ((k, v) in listOf("voltage" to s.voltage, "resistance" to s.resistance, "current" to s.current, "bulbVoltage" to s.bulbVoltage, "bulbPower" to s.bulbPower, "totalPower" to s.totalPower, "brightness" to s.brightness)) eq("$k $p", r.d(k), v)
            assertEquals(g.jsonObject["word"]!!.jsonPrimitive.content, Circuit.brightnessWord(s.bulbPower))
            eq("phase", g.d("phase"), Circuit.advance(CircuitState(), p, 123).phase)
        }
    }

    @Test fun light() {
        for (g in golden["light"]!!.jsonArray) {
            val p = g.jsonObject["p"]!!.let { LightParams(it.d("sx"), it.d("sy"), it.d("aim"), it.d("tilt")) }
            val t = g.jsonObject["target"]!!.let { Target(it.d("x"), it.d("y"), it.d("r")) }
            val tr = Light.trace(p, t); val r = g.jsonObject["tr"]!!
            fun near(a: Double, b: Double, m: String) = assertEquals(m, a, b, 1e-6)
            near(r.d("pathLength"), tr.pathLength, "path $p")
            assertEquals(r.b("hitsTarget"), tr.hitsTarget); assertEquals(r.b("backside"), tr.backside)
            val inc = r.jsonObject["incidence"]!!
            if (inc is JsonNull) assertTrue(tr.incidence == null) else { near(inc.jsonPrimitive.double, tr.incidence!!, "i"); near(r.d("reflection"), tr.reflection!!, "r") }
            near(r.jsonObject["incEnd"]!!.d("x"), tr.incEnd.x, "incEnd"); near(r.jsonObject["incEnd"]!!.d("y"), tr.incEnd.y, "incEnd")
            val s = Light.advance(LightState(), tr.pathLength, 9)
            near(g.d("dist9"), s.dist, "dist")
            val pt = Light.pointAlong(tr, s.dist); near(g.jsonObject["pt"]!!.d("x"), pt.x, "pt"); near(g.jsonObject["pt"]!!.d("y"), pt.y, "pt")
        }
        golden["light"]!!.jsonArray.forEachIndexed { i, g ->
            val tilt = g.jsonObject["p"]!!.d("tilt")
            val pl = Light.placeForIncidence(10.0 + i * 9, tilt); val r = g.jsonObject["place"]!!
            eq("sx", r.d("sx"), pl.sx); eq("sy", r.d("sy"), pl.sy); eq("aim", r.d("aim"), pl.aim)
        }
    }

    @Test fun snapAndFormat() {
        assertEquals(0.3, LabMath.snap(0.30000000000000004, LabRange(0.0, 1.0, 0.05)), 0.0)
        assertEquals(-10.0, LabMath.snap(-12.0, Motion.RANGES.getValue("a")), 0.0)
        assertEquals(25.0, LabMath.niceCeil(21.0), 0.0)
    }
}
