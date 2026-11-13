package com.maheshglance.wonderlab.feature.auth

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.maheshglance.wonderlab.ui.Routes
import com.maheshglance.wonderlab.ui.arg

/**
 * Account routes (website paths): signin, signup, forgot, forgot/code, forgot/username, reset?token=, verify-email?token=.
 * The emailed links (https://<site>/reset?token=… and /verify-email?token=…) are also declared as deep links, so
 * they open here once the manifest has a matching intent filter; without it the parent can paste the link.
 */
fun NavGraphBuilder.authGraph() {
    composable(Routes.SIGNIN) { SignInScreen() }
    composable(Routes.SIGNUP) { SignUpScreen() }
    composable(Routes.FORGOT) { ForgotScreen() }
    composable("${Routes.FORGOT}/{step}") { e ->
        when (e.arg("step")) {
            "username" -> ForgotUsernameScreen()
            "code" -> ForgotScreen("code")
            else -> ForgotScreen()
        }
    }
    composable("reset?token={token}") { e -> ResetScreen(e.arg("token")) }
    composable("verify-email?token={token}") { e -> VerifyEmailScreen(e.arg("token")) }
}
