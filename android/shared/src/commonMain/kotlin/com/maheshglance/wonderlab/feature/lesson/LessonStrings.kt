package com.maheshglance.wonderlab.feature.lesson

import androidx.compose.runtime.Composable
import com.maheshglance.wonderlab.core.data.Localized
import com.maheshglance.wonderlab.core.design.WL

/** Lesson-workspace UI strings — the website's src/features/lesson/strings.ts (Telugu where reviewed wording exists). */
private val S: Map<String, Localized> = mapOf(
    "lessonMode" to Localized("Lesson mode"),
    "intro" to Localized("Let’s learn", "నేర్చుకుందాం"),
    "example" to Localized("Worked example {n}", "ఉదాహరణ {n}"),
    "nextStep" to Localized("Show next step", "తరువాతి మెట్టు"),
    "replay" to Localized("Replay", "మళ్ళీ చూపించు"),
    "answerIs" to Localized("Answer", "జవాబు"),
    "yourTurn" to Localized("Your turn", "నీ వంతు"),
    "yourTurnBody" to Localized("Now try one on your own. You can ask for a hint.", "ఇప్పుడు నువ్వే ప్రయత్నించు. సూచన అడగవచ్చు."),
    "recap" to Localized("What you learned", "నువ్వు నేర్చుకున్నది"),
    "continue" to Localized("Continue", "కొనసాగించు"),
    "stepOf" to Localized("Part {i} of {n}", "{n} లో {i}"),
    "goPractice" to Localized("Practise more", "ఇంకా సాధన చెయ్యి"),
    "goTest" to Localized("Take a short test", "చిన్న పరీక్ష"),
    "goLearn" to Localized("See the lesson again"),
    "hintOf" to Localized("Show a hint ({i} of {n})", "సూచన ({n} లో {i})"),
    "hintN" to Localized("Hint {n}", "సూచన {n}"),
    "noHints" to Localized("No more hints — have a go!"),
    "howToSolve" to Localized("How to solve it", "ఎలా చేయాలి"),
    "similar" to Localized("Try a similar one", "ఇలాంటిది ఇంకొకటి"),
    "nextQ" to Localized("Next question", "తరువాతి ప్రశ్న"),
    "correctAnswer" to Localized("Correct answer", "సరైన జవాబు"),
    "yourAnswer" to Localized("Your answer", "నీ జవాబు"),
    "noAnswer" to Localized("(no answer)", "(జవాబు లేదు)"),
    "weRead" to Localized("We read your answer as {v}."),
    "steps" to Localized("Work it out step by step"),
    "stepN" to Localized("Step {n}"),
    "checkStep" to Localized("Check step"),
    "stepRight" to Localized("Right! On to the next step."),
    "stepWrong" to Localized("Not yet — look again, or tap “Show me”."),
    "showMe" to Localized("Show me"),
    "skipSteps" to Localized("Skip to the final answer"),
    "finalAnswer" to Localized("Final answer"),
    "stepAnswerWas" to Localized("This step: {v}"),
    "testIntro" to Localized("{n} questions. No hints during the test — you will see every answer and how to solve it at the end."),
    "startTest" to Localized("Start the test", "పరీక్ష మొదలుపెట్టు"),
    "qOf" to Localized("Question {i} of {n}", "{n} లో {i}వ ప్రశ్న"),
    "prev" to Localized("Previous", "వెనుకకు"),
    "submitTest" to Localized("Submit test", "పరీక్ష పంపు"),
    "unanswered" to Localized("{n} not answered yet. Submit anyway?"),
    "jumpTo" to Localized("Go to question"),
    "answered" to Localized("answered"),
    "score" to Localized("{c} out of {n} correct", "{n} లో {c} సరైనవి"),
    "retake" to Localized("Take a new test", "కొత్త పరీక్ష"),
    "right" to Localized("Right", "సరైనది"),
    "wrong" to Localized("Not right", "సరికాదు"),
    "scratch" to Localized("Scratchpad"),
    "scratchDraw" to Localized("Draw"),
    "scratchType" to Localized("Notes"),
    "scratchHint" to Localized("Rough work — not marked."),
    "clear" to Localized("Clear"),
    "keypad" to Localized("Keypad"),
    "deviceKeyboard" to Localized("Use device keyboard"),
    "units" to Localized("Units"),
    "typeAnswer" to Localized("Your answer"),
    "showTable" to Localized("Show data table"),
    "hideTable" to Localized("Hide data table"),
    "counted" to Localized("Counted: {n}", "లెక్కించినవి: {n}"),
    "tapToCount" to Localized("Tap each one to count it", "ఒక్కొక్కటి తాకి లెక్కపెట్టు"),
    "countAgain" to Localized("Count again", "మళ్ళీ లెక్కపెట్టు"),
    "moveUp" to Localized("Move {x} up"),
    "moveDown" to Localized("Move {x} down"),
    "orderHelp" to Localized("Put these in order using the arrows (or drag them)."),
    "matchHelp" to Localized("Tap an item on the left, then its partner on the right."),
    "dragHelp" to Localized("Tap an item, then tap where it goes (or drag it there)."),
    "matched" to Localized("goes with {x}"),
    "unmatch" to Localized("Remove pair for {x}"),
    "tapAll" to Localized("Tap all the right answers.", "సరైన వాటన్నిటినీ తాకు."),
    "lineHelp" to Localized("Tap the line, or use the arrow keys, to place your point."),
    "lineValue" to Localized("Your point: {v}"),
    "lineLeft" to Localized("Move point left"),
    "lineRight" to Localized("Move point right"),
    "linkedActivities" to Localized("Try it out", "ఆడి చూడు"),
    "masteredTitle" to Localized("You can now {x}!", "ఇప్పుడు నువ్వు {x} చేయగలవు!"),
    "masteryProgress" to Localized("Progress towards mastering this"),
    "notFound" to Localized("We could not find this lesson."),
    "backToLearn" to Localized("Back to lessons"),
    "loading" to Localized("Loading lesson…"),
    "noQuestions" to Localized("There are no questions for this topic yet."),
    "diagTitle" to Localized("Starting check", "ప్రారంభ పరీక్ష"),
    "diagIntro" to Localized("A few quick questions help us find the best place for you to start. It is fine not to know some — there are no marks.", "కొన్ని చిన్న ప్రశ్నలు. కొన్ని రాకపోయినా పరవాలేదు."),
    "diagStart" to Localized("Start", "మొదలుపెట్టు"),
    "notNow" to Localized("Not now"),
    "dontKnow" to Localized("I don’t know yet", "ఇంకా తెలియదు"),
    "saveAndNext" to Localized("Next", "తరువాత"),
    "diagDone" to Localized("All done — thank you!", "అయిపోయింది — ధన్యవాదాలు!"),
    "strong" to Localized("Looks strong", "బాగా వచ్చు"),
    "practiseThis" to Localized("Let’s practise this", "దీన్ని సాధన చేద్దాం"),
    "whatNext" to Localized("What should I learn next?", "తరువాత ఏమి నేర్చుకోవాలి?"),
    "diagAgain" to Localized("Do the check again"),
    "diagNone" to Localized("There is no starting check for your class yet."),
    "open" to Localized("Open"),
    "readAloud" to Localized("Read aloud"),
    // native-only helpers (same wording family as the website)
    "notSaved" to Localized("Your answer could not be saved. It will be kept on this device."),
    "reviewQ" to Localized("Review"),
    "reportSent" to Localized("Thank you! We will look at it."),
    "reportBody" to Localized("We will send the lesson and question number. You don't need to type your name."),
    "reportField" to Localized("What looks wrong? (optional)"),
    "send" to Localized("Send"),
    "home" to Localized("Home"),
    "notOffline" to Localized("This class is not available offline yet. Connect to the internet or download it in Downloads."),
)

fun fill(s: String, vars: Map<String, Any>): String = Regex("\\{(\\w+)\\}").replace(s) { m -> vars[m.groupValues[1]]?.toString() ?: "" }

/** Lesson string in the learner's language: `ls("hintOf", "i" to 1, "n" to 3)`. */
fun lessonString(lang: String, key: String, vararg vars: Pair<String, Any>): String {
    val e = S[key] ?: return key
    return fill(if (lang == "te" && !e.te.isNullOrBlank()) e.te else e.en, vars.toMap())
}

@Composable
fun ls(key: String, vararg vars: Pair<String, Any>): String = lessonString(WL.lang, key, *vars)

/** The website's L(): Telugu when the learner reads Telugu and a translation exists. */
@Composable
fun L(l: Localized?): String = l?.get(WL.lang) ?: ""
