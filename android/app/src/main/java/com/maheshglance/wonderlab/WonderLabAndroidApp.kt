package com.maheshglance.wonderlab

import android.app.Application
import com.maheshglance.wonderlab.core.platform.AndroidPlatform

/** Android entry point: creates the shared WonderLab services once for the whole app. */
class WonderLabAndroidApp : Application() {
    lateinit var platform: AndroidPlatform; private set
    lateinit var core: WonderLabApp; private set

    override fun onCreate() {
        super.onCreate()
        platform = AndroidPlatform(this, BuildConfig.API_BASE)
        core = WonderLabApp(platform)
    }
}
