package com.maheshglance.wonderlab.feature.art.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.unit.dp
import com.maheshglance.wonderlab.core.design.AlertBox
import com.maheshglance.wonderlab.core.design.AlertKind
import com.maheshglance.wonderlab.core.design.BtnKind
import com.maheshglance.wonderlab.core.design.WL
import com.maheshglance.wonderlab.core.design.WLButton
import com.maheshglance.wonderlab.feature.art.data.ArtStorage
import com.maheshglance.wonderlab.feature.art.data.ArtSync
import com.maheshglance.wonderlab.ui.LocalApp
import com.maheshglance.wonderlab.ui.appState
import kotlinx.coroutines.launch

/**
 * Port of the website's ArtConflictWatcher: when two devices changed the same artwork offline, both are
 * kept and the learner picks one. Mounted by every art screen; the lead can also mount ArtSyncHost() in
 * the app root so uploads + this dialog work everywhere.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ArtConflictHost() {
    val app = LocalApp.current
    val s by appState()
    val c by ArtSync.conflict.collectAsState()
    val scope = rememberCoroutineScope()
    var error by remember { mutableStateOf<String?>(null) }
    val conflict = c ?: return
    if (s.profile?.id != conflict.pid) return
    val resolve = { keep: String ->
        scope.launch {
            try { ArtStorage.resolve(app.application, conflict, keep); ArtSync.dismissConflict(); error = null }
            catch (e: Exception) { error = "You need to be online to choose. Both versions are safe for now." }
        }
        Unit
    }
    ArtDialog("This picture changed on two devices", { ArtSync.dismissConflict() }, wide = true) {
        Text("Both versions are safe in your gallery. Which one do you want to keep?", style = MaterialTheme.typography.bodyLarge, color = WL.colors.text)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            WLButton("See the other device's version", { ArtSync.dismissConflict(); app.go("art/paint/${conflict.originalId}") }, small = true)
            WLButton("See this device's version", { ArtSync.dismissConflict(); app.go("art/paint/${conflict.copyId}") }, small = true)
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            WLButton("Keep this device's", { resolve("copy") }, kind = BtnKind.Primary)
            WLButton("Keep the other one", { resolve("original") })
            WLButton("Keep both for now", { ArtSync.dismissConflict() }, kind = BtnKind.Ghost)
        }
        error?.let { AlertBox(it, AlertKind.Warn) }
    }
}

/**
 * App-wide host (for the lead to mount once in WonderLabRoot): uploads artwork drafts at start-up and
 * whenever the device comes back online, and shows the two-device conflict dialog on any screen.
 */
@Composable
fun ArtSyncHost() {
    val app = LocalApp.current
    val s by appState()
    LaunchedEffect(s.account?.id, s.online) { if (s.account != null && s.online) ArtSync.retry(app.application) }
    ArtConflictHost()
}
