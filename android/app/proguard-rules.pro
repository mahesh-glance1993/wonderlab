# kotlinx.serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keep,includedescriptorclasses class com.maheshglance.wonderlab.**$$serializer { *; }
-keepclassmembers class com.maheshglance.wonderlab.** { *** Companion; kotlinx.serialization.KSerializer serializer(...); }
# QuickJS JNI bridge
-keep class com.dokar.quickjs.** { *; }
-dontwarn okhttp3.internal.platform.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
