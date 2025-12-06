# Android SDK Setup Script for Windows
# This script downloads and sets up Android SDK Command Line Tools

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android SDK Command Line Tools Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sdkPath = "$env:USERPROFILE\Android\sdk"
$toolsPath = "$sdkPath\cmdline-tools"
$latestPath = "$toolsPath\latest"

# Check if SDK already exists
if (Test-Path $sdkPath) {
    Write-Host "Android SDK found at: $sdkPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to reinstall? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit
    }
    Remove-Item -Recurse -Force $sdkPath
}

# Create SDK directory
Write-Host "[1/5] Creating SDK directory..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path $sdkPath | Out-Null
New-Item -ItemType Directory -Force -Path $toolsPath | Out-Null

# Download Command Line Tools
Write-Host "[2/5] Downloading Android SDK Command Line Tools..." -ForegroundColor Green
$toolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$zipPath = "$env:TEMP\android-cmdline-tools.zip"

try {
    Invoke-WebRequest -Uri $toolsUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "Download complete!" -ForegroundColor Green
} catch {
    Write-Host "Error downloading SDK tools: $_" -ForegroundColor Red
    exit 1
}

# Extract
Write-Host "[3/5] Extracting tools..." -ForegroundColor Green
Expand-Archive -Path $zipPath -DestinationPath $toolsPath -Force
Move-Item "$toolsPath\cmdline-tools\*" "$latestPath" -Force
Remove-Item "$toolsPath\cmdline-tools" -Force
Remove-Item $zipPath -Force

# Set environment variables
Write-Host "[4/5] Setting environment variables..." -ForegroundColor Green
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "User")
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$sdkPath\platform-tools*") {
    $newPath = "$currentPath;$sdkPath\platform-tools;$sdkPath\tools\bin;$latestPath\bin"
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
}

# Install SDK components
Write-Host "[5/5] Installing SDK components (this may take a while)..." -ForegroundColor Green
Write-Host "This will install: platform-tools, Android 34 platform, and build-tools" -ForegroundColor Yellow

$sdkmanager = "$latestPath\bin\sdkmanager.bat"

# Accept licenses
Write-Host "Accepting licenses..." -ForegroundColor Yellow
& $sdkmanager --licenses --sdk_root=$sdkPath | ForEach-Object {
    if ($_ -match "\(y/N\)") {
        Write-Host "y" | & $sdkmanager --licenses --sdk_root=$sdkPath
    }
}

# Install components
Write-Host "Installing platform-tools..." -ForegroundColor Yellow
& $sdkmanager --sdk_root=$sdkPath "platform-tools"

Write-Host "Installing Android 34 platform..." -ForegroundColor Yellow
& $sdkmanager --sdk_root=$sdkPath "platforms;android-34"

Write-Host "Installing build-tools..." -ForegroundColor Yellow
& $sdkmanager --sdk_root=$sdkPath "build-tools;34.0.0"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Android SDK installed at: $sdkPath" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Please restart your terminal/PowerShell for environment variables to take effect." -ForegroundColor Yellow
Write-Host ""
Write-Host "After restarting, you can build APK with:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run cap:android" -ForegroundColor White
Write-Host "  cd android" -ForegroundColor White
Write-Host "  gradlew.bat assembleDebug" -ForegroundColor White
Write-Host ""
Write-Host "Or use the build script:" -ForegroundColor Cyan
Write-Host "  build-apk.bat" -ForegroundColor White
Write-Host ""

