<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SealMaster - Hydraulic Billing Application

A comprehensive billing and inventory management system for hydraulic seal businesses, built with React and TypeScript. Available as a web app, iOS native application, and Android APK.

View your app in AI Studio: https://ai.studio/apps/drive/1SnckJuwM0gkZQKcdbW4HjzfGMeHPK1QQ

## Features

- 📊 Dashboard with analytics
- 🛒 POS Terminal
- 📄 Invoice Management
- 📋 Estimates/Quotations
- 📦 Inventory Management
- 🚚 Purchase Orders
- 💰 Expense Tracking
- 👥 Client Management
- 📈 Reports & Analytics
- 🧾 GST Reports
- ⚙️ Settings & Configuration

## Run Locally (Web)

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## iOS Application

This app is configured as a native iOS application using Capacitor.

### Prerequisites for iOS Development

- **macOS** (required for iOS development)
- **Xcode** (latest version from Mac App Store)
- **CocoaPods**: `sudo gem install cocoapods`
- **Apple Developer Account** (for device testing and App Store)

### Quick Start (iOS)

1. Build the web app:
   ```bash
   npm run build
   ```

2. Sync to iOS:
   ```bash
   npm run cap:ios
   ```

3. Open in Xcode:
   ```bash
   npm run cap:open:ios
   ```

4. In Xcode:
   - Select your development team
   - Choose a simulator or connected device
   - Click Run (▶️)

### Available iOS Scripts

- `npm run cap:ios` - Sync web assets to iOS
- `npm run cap:open:ios` - Open project in Xcode
- `npm run ios:build` - Build web app and sync to iOS
- `npm run ios:dev` - Build, sync, and open in Xcode

### iOS Documentation

For detailed iOS setup, build, and deployment instructions, see [IOS_SETUP.md](./IOS_SETUP.md).

## Android Application

This app is configured as a native Android application using Capacitor. **You can build APK files on Windows!**

### Prerequisites for Android Development

**Choose one:**
- **Android Studio** (full IDE) - https://developer.android.com/studio
- **Android SDK Command Line Tools** (lighter) - Run `setup-android-sdk.bat`
- **GitHub Actions** (cloud build) - No local setup needed! See [BUILD_APK_NO_STUDIO.md](./BUILD_APK_NO_STUDIO.md)
- **Java JDK** (required for local builds) - https://adoptium.net/

### Quick Start (Android)

1. **Install Android Studio**: https://developer.android.com/studio

2. Build the web app:
   ```bash
   npm run build
   ```

3. Sync to Android:
   ```bash
   npm run cap:android
   ```

4. Open in Android Studio:
   ```bash
   npm run cap:open:android
   ```

5. In Android Studio:
   - Wait for Gradle sync to complete
   - Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Building APK

#### Method 1: Using Build Script (Windows)

Simply run:
```bash
build-apk.bat
```

This will:
1. Build the web app
2. Sync to Android
3. Build the APK automatically

#### Method 2: Using Android Studio

1. Open `android` folder in Android Studio
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Method 3: Using Command Line

```bash
# Build and sync
npm run android:build

# Navigate to android folder
cd android

# Build APK (Windows)
gradlew.bat assembleDebug

# Build APK (macOS/Linux)
./gradlew assembleDebug
```

### Available Android Scripts

- `npm run cap:android` - Sync web assets to Android
- `npm run cap:open:android` - Open project in Android Studio
- `npm run android:build` - Build web app and sync to Android
- `npm run android:dev` - Build, sync, and open Android Studio
- `npm run android:apk` - Build web app, sync, and build APK (requires Android SDK)

### Installing APK on Device

1. **Enable Developer Options** on your Android device
2. **Enable USB Debugging**
3. Connect device via USB
4. Install via ADB:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```
5. Or copy APK to device and install manually

### Android Documentation

For detailed Android setup and APK building instructions, see [BUILD_APK.md](./BUILD_APK.md).

## Project Structure

```
├── components/          # React components
├── services/            # Business logic and services
├── ios/                 # iOS native project (Capacitor)
├── android/             # Android native project (Capacitor)
├── dist/                # Production build output
└── types.ts             # TypeScript type definitions
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Capacitor** - Native iOS & Android wrapper
- **Google Gemini AI** - Natural language invoice parsing
- **LocalStorage** - Data persistence

## License

Private project
