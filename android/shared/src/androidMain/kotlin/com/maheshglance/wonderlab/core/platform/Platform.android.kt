package com.maheshglance.wonderlab.core.platform

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import java.text.DateFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
actual fun BackHandler(enabled: Boolean, onBack: () -> Unit) = androidx.activity.compose.BackHandler(enabled, onBack)

@Composable
actual fun rememberFileSaver(): FileSaver {
    val context = LocalContext.current
    val pending = remember { arrayOfNulls<Pair<ByteArray, (Boolean) -> Unit>>(1) }
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("*/*")) { uri ->
        val p = pending[0]; pending[0] = null
        if (p == null) return@rememberLauncherForActivityResult
        if (uri == null) { p.second(false); return@rememberLauncherForActivityResult }
        val ok = runCatching { context.contentResolver.openOutputStream(uri)?.use { it.write(p.first) } != null }.getOrDefault(false)
        p.second(ok)
    }
    return remember(launcher) {
        FileSaver { name, _, bytes, onResult -> pending[0] = bytes to onResult; launcher.launch(name) }
    }
}

actual fun formatDate(epochMillis: Long): String = DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(epochMillis))
actual fun formatDateTime(epochMillis: Long): String = DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(epochMillis))
actual fun isoLocalDate(epochMillis: Long): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(epochMillis))
