// All of WonderLab's screens, data and logic, written once in Compose Multiplatform:
// built for Android (used by :app) and for iPad/iPhone (the WonderLab framework used by ../ios).
plugins {
    alias(libs.plugins.kotlin.multiplatform)
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.compose.multiplatform)
    alias(libs.plugins.kotlin.serialization)
}

kotlin {
    androidTarget {
        compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) }
    }
    listOf(iosArm64(), iosSimulatorArm64()).forEach { t ->
        t.binaries.framework {
            baseName = "WonderLab"
            isStatic = true
        }
    }

    compilerOptions {
        freeCompilerArgs.addAll("-Xexpect-actual-classes")
        optIn.addAll(
            "androidx.compose.material3.ExperimentalMaterial3Api",
            "androidx.compose.foundation.layout.ExperimentalLayoutApi",
            "kotlin.uuid.ExperimentalUuidApi",
            "kotlin.io.encoding.ExperimentalEncodingApi",
            "kotlinx.cinterop.ExperimentalForeignApi",
            "kotlinx.cinterop.BetaInteropApi",
        )
    }

    sourceSets {
        commonMain.dependencies {
            implementation(libs.compose.runtime)
            implementation(libs.compose.foundation)
            implementation(libs.compose.ui)
            implementation(libs.compose.animation)
            implementation(libs.compose.material3)
            implementation(libs.compose.material.icons)
            implementation(libs.compose.resources)
            implementation(libs.jb.lifecycle.runtime.compose)
            implementation(libs.jb.lifecycle.viewmodel.compose)
            implementation(libs.jb.navigation.compose)
            implementation(libs.kotlinx.coroutines.core)
            implementation(libs.kotlinx.serialization.json)
            implementation(libs.kotlinx.io)
            implementation(libs.atomicfu)
            implementation(libs.ktor.client.core)
            implementation(libs.quickjs)
        }
        androidMain.dependencies {
            implementation(libs.androidx.core.ktx)
            implementation(libs.androidx.activity.compose)
            implementation(libs.kotlinx.coroutines.android)
            implementation(libs.ktor.client.okhttp)
        }
        iosMain.dependencies {
            implementation(libs.ktor.client.darwin)
        }
    }
}

android {
    namespace = "com.maheshglance.wonderlab.shared"
    compileSdk = 36
    defaultConfig { minSdk = 26 }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

compose.resources {
    packageOfResClass = "com.maheshglance.wonderlab.res"
    publicResClass = true
    generateResClass = always
}

// The curriculum engine (shared TypeScript from ../../src) is bundled into composeResources/files/engine.js
// before every build, for both Android and iOS.
val buildEngine by tasks.registering(Exec::class) {
    group = "build"
    description = "Bundles the shared WonderLab TypeScript logic into composeResources/files/engine.js"
    val repo = rootProject.projectDir.parentFile
    workingDir = repo
    commandLine(if (System.getProperty("os.name").lowercase().contains("win")) listOf("cmd", "/c", "node", "scripts/build-android-engine.mjs") else listOf("node", "scripts/build-android-engine.mjs"))
    inputs.dir(repo.resolve("src"))
    inputs.dir(rootProject.projectDir.resolve("engine"))
    inputs.file(repo.resolve("scripts/build-android-engine.mjs"))
    outputs.file(project.file("src/commonMain/composeResources/files/engine.js"))
}
tasks.matching { it.name == "preBuild" || it.name.contains("ComposeResources") || it.name.contains("ResourcesForCommonMain") }
    .configureEach { if (name != "buildEngine") dependsOn(buildEngine) }
