package com.maheshglance.wonderlab

import android.app.Application
import com.maheshglance.wonderlab.core.audio.Speech
import com.maheshglance.wonderlab.core.data.AppRepository
import com.maheshglance.wonderlab.core.data.LocalStore
import com.maheshglance.wonderlab.core.engine.Engine
import com.maheshglance.wonderlab.core.net.Api
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/** Manual dependency container (one instance of each service for the whole app). */
class WonderLabApp : Application() {
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    lateinit var api: Api; private set
    lateinit var engine: Engine; private set
    lateinit var store: LocalStore; private set
    lateinit var repo: AppRepository; private set
    lateinit var speech: Speech; private set

    override fun onCreate() {
        super.onCreate()
        api = Api(this)
        engine = Engine(this)
        store = LocalStore(this)
        repo = AppRepository(this, api, engine, store, scope)
        speech = Speech(this, api, scope)
        repo.start()
        // educator-published content corrections (cached for offline use)
        scope.launch { com.maheshglance.wonderlab.feature.parent.loadContentOverrides(this@WonderLabApp) }
    }

    /** Links opened while the app is running (singleTask): the root NavHost consumes them. */
    val pendingLinks = kotlinx.coroutines.flow.MutableStateFlow<android.content.Intent?>(null)
}
