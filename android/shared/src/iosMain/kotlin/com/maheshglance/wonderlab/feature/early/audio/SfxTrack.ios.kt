package com.maheshglance.wonderlab.feature.early.audio

/** iOS: plays through Platform.playPcm until a native AVAudioEngine track is added. */
internal actual fun openSfxTrack(pcm: ShortArray, rate: Int, channels: Int, loop: Boolean, playbackRate: Float): SfxTrack? =
    PcmFallbackTrack(pcm, rate, channels, playbackRate)
