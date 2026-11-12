#!/usr/bin/env bash
# Helpers for driving the native WonderLab app on an emulator via adb (used for manual/automated screen checks).
# Usage: source tests/e2e/android-native.sh <serial> <shot-dir>
export MSYS_NO_PATHCONV=1
SER="${1:-emulator-5554}"; OUT="${2:-/d/tmp/out/native}"; mkdir -p "$OUT"
ADB="${ADB:-/c/Android/Sdk/platform-tools/adb.exe}"
PKG="${PKG:-com.maheshglance.wonderlab.debug}"
A() { "$ADB" -s "$SER" "$@"; }
ui() { A shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1; A exec-out cat /sdcard/ui.xml; }
shot() { A exec-out screencap -p > "$OUT/$1.png"; echo "$OUT/$1.png"; }
# centre of the first node whose text or content-desc matches $1 (regex)
pos() { ui | tr '>' '\n' | grep -E "(text|content-desc)=\"$1\"" | head -1 | grep -oE 'bounds="\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]"' | grep -oE '[0-9]+' | tr '\n' ' ' | awk '{ if (NF==4) print int(($1+$3)/2), int(($2+$4)/2) }'; }
tap() { local p; p=$(pos "$1"); if [ -z "$p" ]; then echo "NOT FOUND: $1"; return 1; fi; A shell input tap $p; sleep "${2:-1.5}"; }
typ() { A shell input text "$(echo "$1" | sed 's/ /%s/g')"; }
launch() { A shell am force-stop "$PKG"; A shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep "${1:-6}"; }
go() { A shell am start -W -a android.intent.action.VIEW -d "wonderlab-test://$1" "$PKG" >/dev/null 2>&1; }
rotate() { A shell settings put system accelerometer_rotation 0; A shell settings put system user_rotation "$1"; sleep 2; }
crash() { A logcat -d -b crash | tail -30; }
