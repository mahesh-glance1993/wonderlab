package com.maheshglance.wonderlab.feature.auth

import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.maheshglance.wonderlab.ui.Placeholder
import com.maheshglance.wonderlab.ui.Routes

fun NavGraphBuilder.authGraph() {
    composable(Routes.SIGNIN) { SignInScreen() }
    composable(Routes.SIGNUP) { Placeholder("Create account") }
    composable(Routes.FORGOT) { Placeholder("Forgot password") }
}
