package com.maheshglance.wonderlab

import androidx.compose.ui.window.ComposeUIViewController
import com.maheshglance.wonderlab.core.platform.IosPlatform
import com.maheshglance.wonderlab.ui.WonderLabRoot
import platform.UIKit.UIViewController

/** One set of shared services for the whole iOS app. */
private val app: WonderLabApp by lazy { WonderLabApp(IosPlatform()) }

/** Called from Swift: the whole app UI (same Compose screens as Android). */
fun MainViewController(): UIViewController = ComposeUIViewController { WonderLabRoot(app) }

/** Called from Swift when the app is opened with a link (reset password / verify email). */
fun handleOpenUrl(url: String) { app.pendingLinks.value = url }

/** Called from Swift when the app goes to the background: upload any queued progress now. */
fun onAppBackground() { app.repo.scheduleFlush(0) }
