package com.maheshglance.wonderlab

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.maheshglance.wonderlab.ui.WonderLabRoot
import java.lang.ref.WeakReference

class MainActivity : ComponentActivity() {
    private val host get() = application as WonderLabAndroidApp

    override fun onCreate(savedInstanceState: Bundle?) {
        val splash = installSplashScreen()
        super.onCreate(savedInstanceState)
        val app = host.core
        host.platform.activity = WeakReference(this)
        splash.setKeepOnScreenCondition { !app.repo.state.value.ready }
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.auto(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.auto(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT),
        )
        // an emailed link (reset password / verify email) that opened the app
        if (savedInstanceState == null) intent?.dataString?.let { app.pendingLinks.value = it }
        setContent { WonderLabRoot(app) }
    }

    override fun onResume() { super.onResume(); host.platform.activity = WeakReference(this) }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        intent.dataString?.let { host.core.pendingLinks.value = it }
    }

    override fun onStop() {
        super.onStop()
        host.core.repo.scheduleFlush(0)
    }
}
