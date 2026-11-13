package com.maheshglance.wonderlab.core.design

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.unit.dp
import kotlin.random.Random

/**
 * Encouragement like a warm teacher, not a machine: varied praise for correct answers, streak shout-outs, wins,
 * and kind "let's look again" messages for mistakes — worded for the learner's age (early / primary / senior).
 */
object Cheer {
    /** Correct answers in a row in this session (reset on a miss). */
    var streak = 0; private set

    private val early = listOf("Yay! Well done!", "Super! You got it!", "Wow, clever you!", "Hooray! That's right!", "Great job, superstar!", "Yes! Clap clap!")
    private val primary = listOf("Well done!", "Excellent!", "Brilliant work!", "You got it!", "Keep it up!", "Spot on!", "Fantastic thinking!", "That's exactly right!")
    private val senior = listOf("Well done!", "Excellent work!", "Spot on!", "Nailed it!", "Keep it up!", "Sharp thinking!", "Exactly right — great reasoning!", "Perfect!")
    private val withHint = listOf("Well done — the hint helped and you got there!", "Nice! Next time try it without a hint.", "You figured it out — keep going!")
    private val tryEarly = listOf("Oops! Let's try again together.", "Almost! You can do it!", "Good try! Look again.")
    private val tryPrimary = listOf("Not quite — good try! Let's see why.", "Almost there! Check the steps below.", "Mistakes help us learn. Let's look again.")
    private val trySenior = listOf("Not quite — let's see where it went wrong.", "Close! Check the solution and spot the difference.", "Every mistake is practice. Look at the worked steps.")

    private fun pick(l: List<String>) = l[Random.nextInt(l.size)]

    /** Message for a correct answer (also updates the streak). */
    fun correct(tier: String, usedHints: Boolean): String {
        streak++
        val base = if (usedHints) pick(withHint) else pick(when (tier) { "early" -> early; "senior" -> senior; else -> primary })
        val bonus = when (streak) {
            3 -> " 3 in a row! 🔥"
            5 -> " 5 in a row — you're on fire! 🔥"
            10 -> " 10 in a row! You're a champion! 🏆"
            else -> if (streak > 10 && streak % 5 == 0) " $streak in a row — unstoppable! 🏆" else ""
        }
        return base + bonus
    }

    /** Message for a wrong answer (resets the streak). */
    fun tryAgain(tier: String): String {
        streak = 0
        return pick(when (tier) { "early" -> tryEarly; "senior" -> trySenior; else -> tryPrimary })
    }

    fun won(tier: String) = if (tier == "early") "You won! Hooray! 🎉" else pick(listOf("You won! 🏆", "Victory! Well played! 🏆", "You won — brilliant game! 🏆"))
    fun lessonDone() = pick(listOf("Lesson complete — well done! Keep it up!", "You finished the lesson! Brilliant!", "All done! Your hard work is paying off."))
}

/** A cheerful pop-up banner (e.g. on a streak or a win). */
@Composable
fun CheerBanner(text: String?, modifier: Modifier = Modifier) {
    AnimatedVisibility(text != null, modifier, enter = scaleIn(spring(dampingRatio = Spring.DampingRatioMediumBouncy)) + fadeIn(), exit = scaleOut() + fadeOut()) {
        Row(
            Modifier.shadow(8.dp, RoundedCornerShape(24.dp)).clip(RoundedCornerShape(24.dp)).background(WL.colors.goodBg).padding(horizontal = 18.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            EmojiImage("🏆", 36.dp)
            EmojiText(text.orEmpty(), style = MaterialTheme.typography.titleMedium, color = WL.colors.good)
        }
    }
}
