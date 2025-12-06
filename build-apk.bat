@echo off
echo ========================================
echo SealMaster APK Builder
echo ========================================
echo.

echo [1/3] Building web app...
call npm run build
if errorlevel 1 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)
echo.

echo [2/3] Syncing to Android...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Android sync failed!
    pause
    exit /b 1
)
echo.

echo [3/3] Building Android APK...
cd android
if not exist "gradlew.bat" (
    echo ERROR: gradlew.bat not found! Make sure Android SDK is installed.
    echo Please install Android Studio or Android SDK command line tools.
    pause
    exit /b 1
)

call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo ERROR: APK build failed!
    echo.
    echo Common solutions:
    echo 1. Install Android Studio from https://developer.android.com/studio
    echo 2. Open android folder in Android Studio and let it sync Gradle
    echo 3. Make sure ANDROID_HOME environment variable is set
    echo.
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo SUCCESS! APK built successfully!
echo ========================================
echo.
echo APK Location:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install on device:
echo 1. Enable USB Debugging on your Android device
echo 2. Connect device via USB
echo 3. Run: adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause

