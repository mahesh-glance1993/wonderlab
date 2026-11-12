import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

// Release signing comes from android/keystore.properties (not committed):
//   storeFile=C:/Android/keys/wonderlab-upload.jks  storePassword=…  keyAlias=wonderlab  keyPassword=…
val keystoreProps = Properties().apply {
    val f = rootProject.file("keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

android {
    namespace = "com.maheshglance.wonderlab"
    compileSdk = 36

    defaultConfig {
        // Same id + key as the first WonderLab APK, so this native app installs as an update.
        applicationId = "com.maheshglance.wonderlab"
        minSdk = 26
        targetSdk = 36
        versionCode = 10
        versionName = "3.0.0"
        buildConfigField("String", "API_BASE", "\"https://learn.maheshglance.com\"")
        vectorDrawables { useSupportLibrary = true }
    }

    signingConfigs {
        if (keystoreProps.isNotEmpty()) {
            create("release") {
                storeFile = file(keystoreProps.getProperty("storeFile"))
                storePassword = keystoreProps.getProperty("storePassword")
                keyAlias = keystoreProps.getProperty("keyAlias")
                keyPassword = keystoreProps.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            // Test builds can point at a local server:  ./gradlew assembleDebug -PapiBase=http://10.0.2.2:8787
            (project.findProperty("apiBase") as String?)?.let { buildConfigField("String", "API_BASE", "\"$it\"") }
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            if (keystoreProps.isNotEmpty()) signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    androidResources {
        noCompress += listOf("webp", "js")
    }
    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

kotlin {
    compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) }
}

// The curriculum engine (shared TypeScript from ../src) is bundled into assets/engine.js before every build.
val buildEngine by tasks.registering(Exec::class) {
    group = "build"
    description = "Bundles the shared WonderLab TypeScript logic into assets/engine.js"
    workingDir = rootProject.projectDir.parentFile
    commandLine(if (System.getProperty("os.name").lowercase().contains("win")) listOf("cmd", "/c", "node", "scripts/build-android-engine.mjs") else listOf("node", "scripts/build-android-engine.mjs"))
    inputs.dir(rootProject.projectDir.parentFile.resolve("src"))
    inputs.dir(rootProject.projectDir.resolve("engine"))
    inputs.file(rootProject.projectDir.parentFile.resolve("scripts/build-android-engine.mjs"))
    outputs.file(project.file("src/main/assets/engine.js"))
}
tasks.named("preBuild") { dependsOn(buildEngine) }

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.core.splashscreen)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.process)
    implementation(libs.androidx.navigation.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.foundation)
    implementation(libs.androidx.compose.animation)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material3.window)
    implementation(libs.androidx.compose.material3.navsuite)
    implementation(libs.androidx.compose.material.icons)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.okhttp)
    implementation(libs.quickjs)
    debugImplementation(libs.androidx.compose.ui.tooling)
    testImplementation(libs.junit)
}
