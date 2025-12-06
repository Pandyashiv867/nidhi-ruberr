# Building Android APK Guide

This guide will help you build an APK file for the SealMaster Android application.

## Prerequisites

### Option 1: Android Studio (Recommended)
1. **Download Android Studio**: https://developer.android.com/studio
2. **Install Android Studio** with:
   - Android SDK
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android Emulator (optional, for testing)

### Option 2: Command Line Tools Only
1. **Download Android SDK Command Line Tools**: https://developer.android.com/studio#command-tools
2. **Set up environment variables**:
   - `ANDROID_HOME` - Path to Android SDK
   - Add `$ANDROID_HOME/platform-tools` and `$ANDROID_HOME/tools` to PATH

## Quick Start (Using Android Studio)

### Method 1: Build APK via Android Studio

1. **Build the web app**:
   ```bash
   npm run build
   ```

2. **Sync to Android**:
   ```bash
   npm run cap:android
   ```

3. **Open in Android Studio**:
   ```bash
   npm run cap:open:android
   ```
   Or manually: Open `android` folder in Android Studio

4. **Wait for Gradle Sync**:
   - Android Studio will automatically sync Gradle dependencies
   - This may take a few minutes on first run

5. **Build APK**:
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - Wait for build to complete
   - APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk`

6. **For Release APK**:
   - Go to **Build > Generate Signed Bundle / APK**
   - Select **APK**
   - Create or select a keystore (for signing)
   - Choose **release** build variant
   - APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Method 2: Build APK via Command Line (Gradle)

### On Windows (PowerShell/CMD):

1. **Build the web app**:
   ```bash
   npm run build
   ```

2. **Sync to Android**:
   ```bash
   npm run cap:android
   ```

3. **Navigate to Android directory**:
   ```bash
   cd android
   ```

4. **Build Debug APK**:
   ```bash
   .\gradlew.bat assembleDebug
   ```

5. **Build Release APK** (requires signing):
   ```bash
   .\gradlew.bat assembleRelease
   ```

### On macOS/Linux:

1. **Build the web app**:
   ```bash
   npm run build
   ```

2. **Sync to Android**:
   ```bash
   npm run cap:android
   ```

3. **Navigate to Android directory**:
   ```bash
   cd android
   ```

4. **Make gradlew executable** (first time only):
   ```bash
   chmod +x gradlew
   ```

5. **Build Debug APK**:
   ```bash
   ./gradlew assembleDebug
   ```

6. **Build Release APK**:
   ```bash
   ./gradlew assembleRelease
   ```

## APK Location

After building, find your APK files at:

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

## Installing the APK

### On Android Device:

1. **Enable Developer Options**:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging" (for USB install)
   - Enable "Install via USB" or "Unknown Sources" (for direct install)

2. **Install via USB**:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. **Install via File Manager**:
   - Copy APK to device
   - Open file manager on device
   - Tap the APK file
   - Allow installation from unknown sources if prompted
   - Tap Install

## Signing the APK (For Release)

For production/release builds, you need to sign the APK:

1. **Generate a keystore** (first time only):
   ```bash
   keytool -genkey -v -keystore sealmaster-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sealmaster
   ```

2. **Create `android/keystore.properties`**:
   ```properties
   storePassword=your_store_password
   keyPassword=your_key_password
   keyAlias=sealmaster
   storeFile=../sealmaster-release-key.jks
   ```

3. **Update `android/app/build.gradle`** to use signing config (see below)

4. **Build signed release APK**:
   ```bash
   cd android
   .\gradlew.bat assembleRelease
   ```

## Troubleshooting

### "Gradle sync failed"
- Make sure Android Studio is fully installed
- Check internet connection (Gradle downloads dependencies)
- Try: **File > Invalidate Caches / Restart**

### "SDK location not found"
- Set `ANDROID_HOME` environment variable
- In Android Studio: **File > Project Structure > SDK Location**

### "Command not found: gradlew"
- On Windows, use `gradlew.bat` instead of `gradlew`
- Make sure you're in the `android` directory

### "Build failed: OutOfMemoryError"
- Increase Gradle memory in `android/gradle.properties`:
  ```
  org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
  ```

### "APK not installing"
- Uninstall previous version first: `adb uninstall com.sealmaster.billing`
- Check if device has enough storage
- Verify APK is not corrupted (try rebuilding)

## Build Scripts

You can also use these npm scripts:

```bash
# Build web app and sync to Android
npm run android:build

# Build, sync, and open Android Studio
npm run android:dev
```

## Automated Build Script

Create a simple build script for convenience:

**Windows (`build-apk.bat`)**:
```batch
@echo off
echo Building web app...
call npm run build
echo Syncing to Android...
call npx cap sync android
echo Building APK...
cd android
call gradlew.bat assembleDebug
echo APK built at: app\build\outputs\apk\debug\app-debug.apk
pause
```

**macOS/Linux (`build-apk.sh`)**:
```bash
#!/bin/bash
echo "Building web app..."
npm run build
echo "Syncing to Android..."
npx cap sync android
echo "Building APK..."
cd android
./gradlew assembleDebug
echo "APK built at: app/build/outputs/apk/debug/app-debug.apk"
```

## Next Steps

- Test the APK on a physical device or emulator
- For production, create a signed release APK
- Upload to Google Play Store (requires Google Play Developer account)
- Or distribute via direct download/enterprise distribution

## Additional Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Build Documentation](https://developer.android.com/studio/build)
- [APK Signing Guide](https://developer.android.com/studio/publish/app-signing)

