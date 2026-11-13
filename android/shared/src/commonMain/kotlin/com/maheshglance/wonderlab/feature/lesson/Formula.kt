package com.maheshglance.wonderlab.feature.lesson

import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.ln
import kotlin.math.log10
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.sin
import kotlin.math.sqrt
import kotlin.math.tan

/**
 * Safe formula evaluator + "what changed and why" explainer for the lesson "what if?" explorer.
 * Same algorithm as src/shared/formula.ts (website) — keep them in step.
 */
object Formula {
    private sealed interface Tok { data class Num(val v: Double) : Tok; data class Id(val v: String) : Tok; data class Op(val v: Char) : Tok }

    private fun tokenize(src: String): List<Tok> {
        val out = ArrayList<Tok>()
        var i = 0
        while (i < src.length) {
            val c = src[i]
            when {
                c == ' ' || c == '\t' -> i++
                c.isDigit() || c == '.' -> {
                    var j = i
                    while (j < src.length && (src[j].isDigit() || src[j] == '.')) j++
                    if (j < src.length && (src[j] == 'e' || src[j] == 'E') && j + 1 < src.length && (src[j + 1].isDigit() || src[j + 1] == '-' || src[j + 1] == '+')) {
                        j += 2; while (j < src.length && src[j].isDigit()) j++
                    }
                    out += Tok.Num(src.substring(i, j).toDouble()); i = j
                }
                c.isLetter() || c == '_' -> {
                    var j = i
                    while (j < src.length && (src[j].isLetterOrDigit() || src[j] == '_')) j++
                    out += Tok.Id(src.substring(i, j)); i = j
                }
                c in "+-*/^()," -> { out += Tok.Op(c); i++ }
                else -> error("Unexpected \"$c\" in formula")
            }
        }
        return out
    }

    private fun rad(d: Double) = d * PI / 180.0

    private fun call(name: String, a: List<Double>): Double = when (name) {
        "sqrt" -> sqrt(a[0]); "abs" -> abs(a[0]); "log" -> log10(a[0]); "ln" -> ln(a[0]); "exp" -> exp(a[0])
        "min" -> a.reduce { x, y -> min(x, y) }; "max" -> a.reduce { x, y -> max(x, y) }
        "sin" -> sin(rad(a[0])); "cos" -> cos(rad(a[0])); "tan" -> tan(rad(a[0]))
        else -> error("Unknown function $name")
    }

    fun evaluate(expr: String, vars: Map<String, Double>): Double {
        val t = tokenize(expr)
        var p = 0
        fun peekOp(c: Char) = (t.getOrNull(p) as? Tok.Op)?.v == c
        fun eat(c: Char) { if (!peekOp(c)) error("Expected $c"); p++ }
        lateinit var sum: () -> Double
        lateinit var power: () -> Double
        val primary: () -> Double = primary@{
            when (val x = t.getOrNull(p) ?: error("Unexpected end")) {
                is Tok.Num -> { p++; x.v }
                is Tok.Op -> when (x.v) {
                    '(' -> { p++; val v = sum(); eat(')'); v }
                    '-' -> { p++; -power() }
                    '+' -> { p++; power() }
                    else -> error("Unexpected ${x.v}")
                }
                is Tok.Id -> {
                    p++
                    if (peekOp('(')) {
                        p++
                        val args = arrayListOf(sum())
                        while (peekOp(',')) { p++; args += sum() }
                        eat(')'); call(x.v, args)
                    } else if (x.v == "pi") PI
                    else vars[x.v] ?: error("Unknown name ${x.v}")
                }
            }
        }
        power = { val b = primary(); if (peekOp('^')) { p++; b.pow(power()) } else b }
        val product: () -> Double = {
            var v = power()
            while (true) { if (peekOp('*')) { p++; v *= power() } else if (peekOp('/')) { p++; v /= power() } else break }
            v
        }
        sum = {
            var v = product()
            while (true) { if (peekOp('+')) { p++; v += product() } else if (peekOp('-')) { p++; v -= product() } else break }
            v
        }
        val v = sum()
        if (p != t.size) error("Extra input in formula")
        return v
    }

    fun safeEval(expr: String, vars: Map<String, Double>): Double = runCatching { evaluate(expr, vars) }.getOrDefault(Double.NaN)

    enum class Relation { Direct, Inverse, Square, InverseSquare, Sqrt, Increases, Decreases, None }

    fun relation(expr: String, sym: String, values: Map<String, Double>, maxOf: Double): Relation {
        val v0 = values[sym] ?: return Relation.None
        val base = if (v0 != 0.0) v0 else (maxOf / 2).takeIf { it != 0.0 } ?: 1.0
        val r1 = safeEval(expr, values + (sym to base)); val r2 = safeEval(expr, values + (sym to base * 2))
        if (!r1.isFinite() || !r2.isFinite()) return Relation.None
        fun close(a: Double, b: Double) = abs(a - b) <= 1e-6 * maxOf(1.0, abs(a), abs(b))
        if (close(r1, r2)) return Relation.None
        if (r1 != 0.0) {
            val k = r2 / r1
            when {
                close(k, 2.0) -> return Relation.Direct
                close(k, 0.5) -> return Relation.Inverse
                close(k, 4.0) -> return Relation.Square
                close(k, 0.25) -> return Relation.InverseSquare
                close(k, sqrt(2.0)) -> return Relation.Sqrt
            }
        }
        return if (r2 > r1) Relation.Increases else Relation.Decreases
    }

    fun fmt(x: Double, decimals: Int = 2): String {
        if (!x.isFinite()) return "—"
        if (abs(x) >= 1e5 || (abs(x) < 1e-3 && x != 0.0)) {
            val e = kotlin.math.floor(log10(abs(x))).toInt()
            val m = x / 10.0.pow(e)
            return "${com.maheshglance.wonderlab.core.platform.fmtFixed(m, 2)}×10^$e"
        }
        val s = com.maheshglance.wonderlab.core.platform.fmtFixed(x, decimals)
        return if (s.contains('.')) s.trimEnd('0').trimEnd('.') else s
    }

    fun why(rel: Relation, res: String, v: String): String = when (rel) {
        Relation.Direct -> "$res is directly proportional to $v: double $v and $res doubles."
        Relation.Inverse -> "$res is inversely proportional to $v: double $v and $res halves."
        Relation.Square -> "$res depends on $v²: double $v and $res becomes 4 times bigger."
        Relation.InverseSquare -> "$res depends on 1/$v²: double $v and $res becomes a quarter."
        Relation.Sqrt -> "$res depends on √$v: $v must become 4 times bigger to double $res."
        Relation.Increases -> "When $v increases, $res increases too (but not in simple proportion)."
        Relation.Decreases -> "When $v increases, $res decreases."
        Relation.None -> "$res does not depend on $v here."
    }
}
