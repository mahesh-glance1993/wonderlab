package com.maheshglance.wonderlab

import com.maheshglance.wonderlab.core.audio.Speech
import com.maheshglance.wonderlab.core.audio.Tones
import com.maheshglance.wonderlab.core.data.AppRepository
import com.maheshglance.wonderlab.core.data.LocalStore
import com.maheshglance.wonderlab.core.engine.Engine
import com.maheshglance.wonderlab.core.net.Api
import com.maheshglance.wonderlab.core.platform.Platform
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

/**
 * Manual dependency container (one instance of each service for the whole app), shared by Android and iOS.
 * Android creates it in its Application class; iOS creates it once when the app starts.
 */
class WonderLabApp(val platform: Platform) {
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    val api = Api(platform)
    val engine = Engine()
    val store = LocalStore(platform.dataDir)
    val repo = AppRepository(platform, api, engine, store, scope)
    val speech = Speech(platform, api, scope)

    /** Links opened while the app is running (reset-password / verify-email): the root NavHost consumes them. */
    val pendingLinks = MutableStateFlow<String?>(null)

    init {
        Tones.platform = platform
        com.maheshglance.wonderlab.core.design.EmojiAssets.platform = platform
        repo.start()
        // educator-published content corrections (cached for offline use)
        scope.launch { com.maheshglance.wonderlab.feature.parent.loadContentOverrides(this@WonderLabApp) }
    }
}
