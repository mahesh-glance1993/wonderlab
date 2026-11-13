package com.maheshglance.wonderlab.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material.icons.rounded.VisibilityOff
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.autofill.ContentType
import androidx.compose.ui.semantics.contentType
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.EmojiImage
import com.maheshglance.wonderlab.core.design.LocalWindow
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.core.design.WLCard
import com.maheshglance.wonderlab.core.net.ApiError
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.Routes
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SignInScreen() {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var keep by remember { mutableStateOf(true) }
    val form = rememberForm()
    val win = LocalWindow.current

    fun submit() {
        if (username.isBlank() || password.isEmpty()) { form.fail("Enter your username and password."); return }
        scope.launch {
            form.run {
                app.repo.signIn(username.trim(), password, keep)
                val s = app.repo.state.value
                password = ""
                app.replace(if (s.profiles.isEmpty()) Routes.SETUP else Routes.WHO)
            }
        }
    }

    Box(Modifier.fillMaxSize().imePadding(), contentAlignment = Alignment.Center) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
            WLCard(Modifier.widthIn(max = 460.dp).fillMaxWidth().padding(16.dp), padding = if (win.isPhone) 20.dp else 26.dp) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    EmojiImage("🦉", if (win.isPhone) 72.dp else 96.dp)
                    Text("WonderLab", style = MaterialTheme.typography.displaySmall, color = WL.colors.text)
                    Text("Parent sign in", style = MaterialTheme.typography.titleMedium, color = WL.colors.muted)
                    Text("Sign in once on this device, then each child picks their profile.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, textAlign = TextAlign.Center)
                    FormError(form)
                    UsernameField(username, { username = it }, form.field("username"))
                    PasswordField("Password", password, { password = it }, form.field("password"), imeAction = ImeAction.Done, onDone = ::submit)
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top) {
                        Checkbox(keep, { keep = it })
                        Column(Modifier.padding(top = 12.dp)) {
                            Text("Keep me signed in on this device", style = MaterialTheme.typography.bodyMedium)
                            Text("Use on your family's own device. On a shared or school device, untick this — you'll be signed out after a period of inactivity.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted)
                        }
                    }
                    WLButton("Sign in", ::submit, kind = BtnKind.Primary, loading = form.busy, modifier = Modifier.fillMaxWidth())
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally)) {
                        WLButton("Forgot password?", { app.go(Routes.FORGOT) }, kind = BtnKind.Ghost, small = true)
                        WLButton("Forgot username?", { app.go("forgot/username") }, kind = BtnKind.Ghost, small = true)
                    }
                    WLButton("New here? Create a parent account", { app.go(Routes.SIGNUP) }, kind = BtnKind.Normal, small = true, modifier = Modifier.fillMaxWidth())
                    Text("Children use WonderLab with a parent's account. You stay signed in until you sign out, the session expires or you reset your password.", style = MaterialTheme.typography.bodySmall, color = WL.colors.muted, textAlign = TextAlign.Center)
                }
            }
        }
    }
}

@Composable
fun Field(
    label: String, value: String, onChange: (String) -> Unit, modifier: Modifier = Modifier,
    keyboard: KeyboardOptions = KeyboardOptions.Default, actions: KeyboardActions = KeyboardActions.Default,
    visual: VisualTransformation = VisualTransformation.None, error: String? = null, hint: String? = null,
    trailing: (@Composable () -> Unit)? = null, singleLine: Boolean = true,
) {
    OutlinedTextField(
        value, onChange, modifier.fillMaxWidth(),
        label = { Text(label) }, singleLine = singleLine, keyboardOptions = keyboard, keyboardActions = actions, visualTransformation = visual,
        isError = error != null, supportingText = (error ?: hint)?.let { { Text(it, color = if (error != null) WL.colors.bad else WL.colors.muted) } },
        trailingIcon = trailing, shape = MaterialTheme.shapes.large, textStyle = MaterialTheme.typography.bodyLarge,
        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = WL.colors.primary, unfocusedBorderColor = WL.colors.line, focusedContainerColor = WL.colors.paper, unfocusedContainerColor = WL.colors.paper, focusedTextColor = WL.colors.ink, unfocusedTextColor = WL.colors.ink),
    )
}
