@echo off
echo ========================================
echo Android SDK Command Line Tools Setup
echo ========================================
echo.
echo This script will download and set up Android SDK
echo without requiring Android Studio.
echo.
pause

powershell -ExecutionPolicy Bypass -File "%~dp0setup-android-sdk.ps1"

pause

