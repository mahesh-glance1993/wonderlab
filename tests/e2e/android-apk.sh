#!/usr/bin/env bash
# Tests the installed WonderLab APK on an Android device/emulator via adb (no browser tabs involved).
# Usage: tests/e2e/android-apk.sh <adb-serial> <path/to/WonderLab.apk> <screenshot-dir>
set -u
export MSYS_NO_PATHCONV=1  # Git Bash on Windows must not rewrite /sdcard, /dev/tty, /data paths
SER="$1"; APK="$2"; OUT="$3"; mkdir -p "$OUT"
ADB="${ADB:-/c/Android/Sdk/platform-tools/adb.exe}"
A() { "$ADB" -s "$SER" "$@"; }
PKG=com.maheshglance.wonderlab
pass=0; fail=0
ok() { if [ "$1" = 0 ]; then pass=$((pass+1)); echo "PASS $2"; else fail=$((fail+1)); echo "FAIL $2"; fi; }
screen() { A shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1; A exec-out cat /sdcard/ui.xml; }
shot() { A exec-out screencap -p > "$OUT/$1.png"; }
# wait (up to $2 s) until the screen contains text $1, tapping away Android's one-time tips on the way
waitfor() {
  for _ in $(seq 1 "${2:-40}"); do
    X=$(screen)
    echo "$X" | grep -qE "$1" && return 0
    for tip in 'Got it' 'No thanks'; do
      B=$(echo "$X" | grep -o "text=\"$tip\"[^>]*bounds=\"\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]\"" | grep -o '\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]' | head -1)
      if [ -n "$B" ]; then set -- "$1" "${2:-40}" $(echo "$B" | tr '[],' '   '); A shell input tap $(( ($3+$5)/2 )) $(( ($4+$6)/2 )); fi
    done
    sleep 1
  done
  return 1
}

echo "Device: $(A shell getprop ro.product.model | tr -d '\r'), Android $(A shell getprop ro.build.version.release | tr -d '\r') (API $(A shell getprop ro.build.version.sdk | tr -d '\r')), $(A shell wm size | tr -d '\r' | sed 's/.*: //')"

# test-only: skip Chrome's first-run screens on this emulator (does not accept any terms)
A shell "echo '_ --disable-fre --no-default-browser-check --no-first-run' > /data/local/tmp/chrome-command-line"
A shell am set-debug-app --persistent com.android.chrome >/dev/null

A uninstall $PKG >/dev/null 2>&1
A install "$APK" | grep -q Success; ok $? "APK installs"
A shell pm list packages | grep -q "$PKG"; ok $? "Package $PKG present"
A shell cmd package resolve-activity --brief -c android.intent.category.LAUNCHER $PKG | grep -q LauncherActivity; ok $? "App icon in launcher (LAUNCHER activity)"

A shell am force-stop com.android.chrome
A shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1   # same as tapping the icon
READY='Parent sign in|Who is learning|text="(Hi|నమస్తే) '
waitfor "$READY" 60
shot 1-launch
A shell dumpsys activity activities | grep topResumedActivity | grep -q "customtabs"; ok $? "Opens in its own full-screen app window (Trusted Web Activity)"
echo "$X" | grep -q 'resource-id="com.android.chrome:id/url_bar"'; [ $? -ne 0 ]; ok $? "No browser address bar (domain verified via assetlinks.json)"
X=$(screen); echo "$X" | grep -qE "$READY"; ok $? "WonderLab loaded from https://learn.maheshglance.com (sign-in or, if already signed in, home)"
echo "$X" | grep -q 'WonderLab'; ok $? "WonderLab title shown"

# rotation
A shell settings put system accelerometer_rotation 0; A shell settings put system user_rotation 1
waitfor "$READY" 20; ok $? "Landscape: content still shown"
shot 2-landscape
A shell settings put system user_rotation 0; sleep 4

# back button leaves the app cleanly, relaunch resumes
A shell input keyevent KEYCODE_BACK; sleep 3
A shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
waitfor "$READY" 40; ok $? "Relaunch from icon"

# offline relaunch: the app's own cached page, not a browser error
A shell svc wifi disable; A shell svc data disable; sleep 3
A shell am force-stop com.android.chrome; A shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
waitfor 'WonderLab' 40; ok $? "Offline launch shows WonderLab (not a browser error page)"
shot 3-offline
A shell svc wifi enable; A shell svc data enable
A shell settings put system accelerometer_rotation 1
# leave the app open for the person testing
A shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1

echo "==== $pass passed, $fail failed ===="
