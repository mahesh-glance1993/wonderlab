package com.maheshglance.wonderlab.feature.art.print

import androidx.compose.runtime.Composable
import com.maheshglance.wonderlab.ui.Placeholder

@Composable
fun PrintScreen(kind: String, id: String, index: Int?) = Placeholder("art/print/$kind/$id")
