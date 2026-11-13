package com.maheshglance.wonderlab.core.platform

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import com.maheshglance.wonderlab.core.data.Files
import platform.Foundation.NSDate
import platform.Foundation.NSDateFormatter
import platform.Foundation.NSDateFormatterMediumStyle
import platform.Foundation.NSDateFormatterNoStyle
import platform.Foundation.NSDateFormatterShortStyle
import platform.Foundation.NSLocale
import platform.Foundation.NSTemporaryDirectory
import platform.Foundation.NSURL
import platform.Foundation.dateWithTimeIntervalSince1970

/** iOS: screens' back handlers are honoured by the edge-swipe back gesture (EdgeSwipeBack). */
@Composable
actual fun BackHandler(enabled: Boolean, onBack: () -> Unit) {
    val owner = remember { Any() }
    val current = androidx.compose.runtime.rememberUpdatedState(onBack)
    val on = androidx.compose.runtime.rememberUpdatedState(enabled)
    androidx.compose.runtime.DisposableEffect(owner) {
        BackStack.callbacks[owner] = { current.value() }
        BackStack.push(owner) { on.value }
        onDispose { BackStack.remove(owner); BackStack.callbacks.remove(owner) }
    }
}

/** Saves through the share sheet ("Save to Files", AirDrop, Mail …). */
@Composable
actual fun rememberFileSaver(): FileSaver = remember {
    FileSaver { name, _, bytes, onResult ->
        val dir = NSTemporaryDirectory().trimEnd('/')
        val path = "$dir/${name.replace('/', '_')}"
        val ok = runCatching { Files.writeBytes(path, bytes) }.isSuccess
        if (!ok) onResult(false)
        else onMain { presentShare(listOf(NSURL.fileURLWithPath(path))) { done -> onResult(done) } }
    }
}

private fun date(ms: Long) = NSDate.dateWithTimeIntervalSince1970(ms / 1000.0)

actual fun formatDate(epochMillis: Long): String =
    NSDateFormatter().apply { dateStyle = NSDateFormatterMediumStyle; timeStyle = NSDateFormatterNoStyle }.stringFromDate(date(epochMillis))

actual fun formatDateTime(epochMillis: Long): String =
    NSDateFormatter().apply { dateStyle = NSDateFormatterMediumStyle; timeStyle = NSDateFormatterShortStyle }.stringFromDate(date(epochMillis))

actual fun isoLocalDate(epochMillis: Long): String =
    NSDateFormatter().apply { dateFormat = "yyyy-MM-dd"; locale = NSLocale(localeIdentifier = "en_US_POSIX") }.stringFromDate(date(epochMillis))
