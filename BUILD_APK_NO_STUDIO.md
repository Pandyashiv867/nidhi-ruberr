# Building APK Without Android Studio

You can build Android APKs without installing the full Android Studio. Here are several alternatives:

## Option 1: Android SDK Command Line Tools (Recommended)

This is the lightest option - only installs the SDK, not the full IDE.

### Step 1: Download Command Line Tools

1. **Download Android SDK Command Line Tools**:
   - Go to: https://developer.android.com/studio#command-tools
   - Download "Command line tools only" for Windows
   - Extract to a folder (e.g., `C:\Android\sdk`)

### Step 2: Install Required SDK Components

1. **Open PowerShell/CMD** as Administrator

2. **Set environment variables** (or do it via System Properties):
   ```powershell
   # Set ANDROID_HOME
   [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\sdk", "User")
   
   # Add to PATH
   $path = [System.Environment]::GetEnvironmentVariable("Path", "User")
   [System.Environment]::SetEnvironmentVariable("Path", "$path;C:\Android\sdk\platform-tools;C:\Android\sdk\tools\bin", "User")
   ```

3. **Install SDK components**:
   ```bash
   # Navigate to SDK tools
   cd C:\Android\sdk\cmdline-tools\latest\bin

   # Accept licenses
   sdkmanager --licenses

   # Install required components
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "cmdline-tools;latest"
   ```

### Step 3: Install Java JDK

1. **Download OpenJDK**: https://adoptium.net/
2. **Install** and set `JAVA_HOME` environment variable

### Step 4: Build APK

```bash
# Build web app
npm run build

# Sync to Android
npm run cap:android

# Build APK
cd android
gradlew.bat assembleDebug
```

## Option 2: Using GitHub Actions (Cloud Build - Free)

Build your APK automatically in the cloud using GitHub Actions - no local setup needed!

### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/build-apk.yml`:

```yaml
name: Build Android APK

on:
  workflow_dispatch:  # Manual trigger
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build web app
      run: npm run build
    
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'
    
    - name: Setup Android SDK
      uses: android-actions/setup-android@v2
    
    - name: Sync Capacitor
      run: npx cap sync android
    
    - name: Build APK
      working-directory: android
      run: ./gradlew assembleDebug
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug.apk
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 2: Push to GitHub and Build

1. Push your code to GitHub
2. Go to **Actions** tab
3. Click **Build Android APK** workflow
4. Click **Run workflow**
5. Download APK from artifacts

## Option 3: Using Docker (Isolated Build Environment)

Build in a Docker container with all dependencies pre-configured.

### Create Dockerfile

```dockerfile
FROM openjdk:17-jdk-slim

# Install Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools

RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools-linux-9477386_latest.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm commandlinetools-linux-9477386_latest.zip

RUN yes | ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager --licenses && \
    ${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0"

WORKDIR /app
```

### Build with Docker

```bash
# Build Docker image
docker build -t android-builder .

# Run build
docker run -v ${PWD}:/app android-builder bash -c "npm install && npm run build && npx cap sync android && cd android && ./gradlew assembleDebug"
```

## Option 4: Online Build Services

### AppCircle (Free Tier Available)
- https://appcircle.io/
- Connect GitHub repo
- Automatic builds on push
- Download APK directly

### Bitrise (Free Tier Available)
- https://www.bitrise.io/
- Connect repository
- Configure build steps
- Get APK via email/download

### Codemagic (Free Tier Available)
- https://codemagic.io/
- Connect GitHub/GitLab
- Automatic builds
- Direct APK download

## Option 5: Pre-built Script with Auto-Setup

I can create a script that automatically downloads and sets up the minimal Android SDK for you.

## Quick Comparison

| Method | Setup Time | Disk Space | Complexity | Best For |
|--------|-----------|------------|------------|----------|
| **Command Line Tools** | 15-30 min | ~2 GB | Medium | Regular builds |
| **GitHub Actions** | 5 min | 0 GB | Easy | CI/CD, Cloud builds |
| **Docker** | 10 min | ~3 GB | Medium | Isolated builds |
| **Online Services** | 5 min | 0 GB | Very Easy | No local setup |

## Recommended: GitHub Actions

For most users, **GitHub Actions is the easiest** - no local installation needed, free, and builds in the cloud!

Would you like me to:
1. Set up the GitHub Actions workflow file?
2. Create an automated SDK setup script?
3. Set up one of the online build services?

