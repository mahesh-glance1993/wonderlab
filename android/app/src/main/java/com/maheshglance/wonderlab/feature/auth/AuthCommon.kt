package com.maheshglance.wonderlab.feature.auth

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowDropDown
import androidx.compose.material.icons.rounded.ContentCopy
import androidx.compose.material.icons.rounded.Save
import androidx.compose.material.icons.rounded.Share
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material.icons.rounded.VisibilityOff
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.autofill.ContentType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentType
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.TopBar
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.net.ApiError
import kotlinx.coroutines.CancellationException

const val OFFLINE_AUTH = "You are offline. Signing in, account changes and recovery need an internet connection."

/** Busy flag, form error and per-field errors (from ApiError.fields) for one form — like the website's useSubmit. */
class FormState {
    var busy by mutableStateOf(false)
    var error by mutableStateOf<String?>(null)
    var fields by mutableStateOf<Map<String, String>>(emptyMap())

    fun field(name: String): String? = fields[name]

    fun fail(message: String, fields: Map<String, String> = emptyMap()) { error = message; this.fields = fields }

    fun clear() { error = null; fields = emptyMap() }

    suspend fun run(block: suspend () -> Unit) {
        if (busy) return
        busy = true; clear()
        try {
            block()
        } catch (e: CancellationException) {
            throw e
        } catch (e: ApiError) {
            fields = e.fields
            error = if (e.status == 0) OFFLINE_AUTH else e.message
        } catch (e: FormProblem) {
            fields = e.fields
            error = e.message
        } catch (e: Exception) {
            error = "Something went wrong. Please try again."
        } finally {
            busy = false
        }
    }
}

/** A client-side validation problem raised inside FormState.run. */
class FormProblem(message: String, val fields: Map<String, String> = emptyMap()) : Exception(message)

@Composable
fun rememberForm(): FormState = remember { FormState() }

/** Same rules as the server's passwordProblem(). */
fun passwordProblem(p: String): String? = when {
    p.length < 8 -> "Use at least 8 characters."
    !p.any { it.isLetter() } || !p.any { it.isDigit() } -> "Use letters and at least one number."
    p.length > 200 -> "That password is too long."
    else -> null
}

val USERNAME_RE = Regex("^[A-Za-z0-9_.-]{3,32}$")
val EMAIL_RE = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$")

fun deviceLabel(): String = "WonderLab Android app · ${Build.MANUFACTURER} ${Build.MODEL}".take(80)

/** Accepts a whole emailed link (…/reset?token=XYZ) or just the token. */
fun tokenFrom(input: String): String {
    val s = input.trim()
    val m = Regex("[?&]token=([^&#\\s]+)").find(s)
    return (m?.groupValues?.get(1) ?: s).let { runCatching { java.net.URLDecoder.decode(it, "UTF-8") }.getOrDefault(it) }.trim()
}

/** Security questions — identical to the website's SECURITY_QUESTIONS (order = server index). */
val SECURITY_QUESTIONS_FALLBACK = listOf(
    "What was the name of your first pet?",
    "What is your favourite book from your own childhood?",
    "What was your first phone model?",
    "What is the name of a teacher you liked (parent's own schooling)?",
    "What is your favourite fruit?",
    "What was your childhood nickname?",
)

fun toast(context: Context, text: String) = Toast.makeText(context, text, Toast.LENGTH_LONG).show()

fun copyText(context: Context, label: String, text: String) {
    context.getSystemService(ClipboardManager::class.java)?.setPrimaryClip(ClipData.newPlainText(label, text))
    if (Build.VERSION.SDK_INT < 33) toast(context, "Copied")
}

fun shareText(context: Context, subject: String, text: String) {
    val i = Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_SUBJECT, subject); putExtra(Intent.EXTRA_TEXT, text) }
    runCatching { context.startActivity(Intent.createChooser(i, subject).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
}

/**
 * Frame for the account screens: a top bar (with back) and a centred card that scrolls only when the keyboard
 * or a small phone needs it. `wide` gives tablets room for a two-column form.
 */
@Composable
fun AuthShell(
    title: String,
    sub: String? = null,
    onBack: (() -> Unit)? = null,
    wide: Boolean = false,
    emoji: String = "🦉",
    content: @Composable ColumnScope.() -> Unit,
) {
    val win = LocalWindow.current
    Column(Modifier.fillMaxSize().background(WL.colors.bg)) {
        if (onBack != null) TopBar("WonderLab", onBack = onBack)
        Box(Modifier.weight(1f).fillMaxWidth().imePadding(), contentAlignment = Alignment.Center) {
            Column(
                Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(if (win.isPhone) 12.dp else 24.dp),
                verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                WLCard(Modifier.widthIn(max = if (wide && !win.isPhone) 860.dp else 500.dp).fillMaxWidth(), padding = if (win.isPhone) 18.dp else 26.dp) {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            EmojiImage(emoji, if (win.isPhone) 48.dp else 60.dp)
                            Column(Modifier.weight(1f)) {
                                Text(title, style = MaterialTheme.typography.headlineSmall, color = WL.colors.text)
                                if (sub != null) Text(sub, style = MaterialTheme.typography.bodyMedium, color = WL.colors.muted)
                            }
                        }
                        content()
                    }
                }
            }
        }
    }
}

@Composable
fun FormError(form: FormState) { form.error?.let { AlertBox(it, AlertKind.Bad) } }

@Composable
fun PasswordField(
    label: String, value: String, onChange: (String) -> Unit,
    error: String? = null, hint: String? = null, newPassword: Boolean = false,
    imeAction: ImeAction = ImeAction.Next, onDone: (() -> Unit)? = null,
) {
    var show by remember { mutableStateOf(false) }
    Field(
        label, value, onChange,
        Modifier.semantics { contentType = if (newPassword) ContentType.NewPassword else ContentType.Password },
        KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = imeAction, autoCorrectEnabled = false),
        KeyboardActions(onDone = { onDone?.invoke() }, onGo = { onDone?.invoke() }),
        if (show) VisualTransformation.None else PasswordVisualTransformation(),
        error = error, hint = hint,
        trailing = { IconButton({ show = !show }) { Icon(if (show) Icons.Rounded.VisibilityOff else Icons.Rounded.Visibility, if (show) "Hide password" else "Show password") } },
    )
}

@Composable
fun UsernameField(value: String, onChange: (String) -> Unit, error: String? = null, hint: String? = null, label: String = "Username") =
    Field(label, value, onChange, Modifier.semantics { contentType = ContentType.Username },
        KeyboardOptions(keyboardType = KeyboardType.Ascii, imeAction = ImeAction.Next, autoCorrectEnabled = false), error = error, hint = hint)

@Composable
fun EmailField(value: String, onChange: (String) -> Unit, label: String, error: String? = null, hint: String? = null, imeAction: ImeAction = ImeAction.Next, onDone: (() -> Unit)? = null) =
    Field(label, value, onChange, Modifier.semantics { contentType = ContentType.EmailAddress },
        KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = imeAction, autoCorrectEnabled = false), KeyboardActions(onDone = { onDone?.invoke() }), error = error, hint = hint)

/** Read-only field that opens a menu of options (security questions, voices…). */
@Composable
fun DropdownField(label: String, options: List<String>, selected: Int, onSelect: (Int) -> Unit, error: String? = null, hint: String? = null, placeholder: String = "Choose…") {
    var open by remember { mutableStateOf(false) }
    Box(Modifier.fillMaxWidth()) {
        Field(label, options.getOrNull(selected) ?: placeholder, {}, error = error, hint = hint, singleLine = false,
            trailing = { Icon(Icons.Rounded.ArrowDropDown, null) })
        Box(Modifier.matchParentSize().clickable(remember { MutableInteractionSource() }, indication = null) { open = true })
        DropdownMenu(open, { open = false }, Modifier.widthIn(min = 260.dp, max = 560.dp)) {
            options.forEachIndexed { i, o ->
                DropdownMenuItem(text = { Text(o, fontWeight = if (i == selected) FontWeight.Bold else FontWeight.Normal) }, onClick = { onSelect(i); open = false })
            }
        }
    }
}

/** Row of choice buttons (segmented control) that wraps on narrow screens. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun <T> Segmented(options: List<Pair<T, String>>, value: T, onChange: (T) -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true) {
    FlowRow(modifier, horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { (v, l) -> WLButton(l, { onChange(v) }, kind = if (v == value) BtnKind.Primary else BtnKind.Normal, small = true, enabled = enabled) }
    }
}

/** One-time recovery codes with Copy / Share / Save — shown after sign-up and after making new codes. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun RecoveryCodes(codes: List<String>, username: String, cellWidth: Dp = 150.dp) {
    val context = LocalContext.current
    val text = "WonderLab recovery codes for $username\n\n${codes.joinToString("\n")}\n"
    val save = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/plain")) { uri ->
        if (uri != null) runCatching {
            context.contentResolver.openOutputStream(uri)?.use { it.write(text.toByteArray()) }
            toast(context, "Saved")
        }.onFailure { toast(context, "Could not save the file.") }
    }
    FlowRow(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        codes.forEachIndexed { i, c ->
            Text(
                "${i + 1}. $c",
                Modifier.widthIn(min = cellWidth).background(WL.colors.surface2, RoundedCornerShape(10.dp)).padding(horizontal = 10.dp, vertical = 6.dp),
                fontFamily = FontFamily.Monospace, style = MaterialTheme.typography.bodyLarge, color = WL.colors.text, textAlign = TextAlign.Start,
            )
        }
    }
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        WLButton("Copy", { copyText(context, "Recovery codes", codes.joinToString("\n")) }, icon = Icons.Rounded.ContentCopy, small = true)
        WLButton("Share or print", { shareText(context, "WonderLab recovery codes", text) }, icon = Icons.Rounded.Share, small = true)
        WLButton("Save as file", { save.launch("wonderlab-recovery-codes.txt") }, icon = Icons.Rounded.Save, small = true)
    }
}

/** Small inline link-style button. */
@Composable
fun LinkButton(text: String, onClick: () -> Unit) = WLButton(text, onClick, kind = BtnKind.Ghost, small = true)
