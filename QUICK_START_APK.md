# Quick Start: Building Your First APK

## ✅ What's Already Done

Your project is fully configured for Android! The following is already set up:
- ✅ Android platform added
- ✅ Capacitor configured
- ✅ Build scripts created
- ✅ Web app synced to Android

## 🚀 Next Steps to Build APK

### Choose Your Method:

#### Method 1: Android Studio (Full IDE)
1. **Download Android Studio**: https://developer.android.com/studio
2. **Install** with default settings (includes Android SDK)
3. **Launch Android Studio** and complete the setup wizard

#### Method 2: Command Line Tools Only (Lighter)
1. **Run the setup script**: Double-click `setup-android-sdk.bat`
2. **Wait for download and installation** (takes 10-15 minutes)
3. **Restart your terminal** after setup completes

#### Method 3: GitHub Actions (Cloud Build - No Local Setup!)
1. **Push code to GitHub**
2. **Go to Actions tab** and run the workflow
3. **Download APK** from artifacts

See [BUILD_APK_NO_STUDIO.md](./BUILD_APK_NO_STUDIO.md) for all alternatives!

### Step 2: Build Your APK

#### Option A: Using the Build Script (Easiest)

Simply double-click or run:
```bash
build-apk.bat
```

#### Option B: Using Android Studio

1. Open Android Studio
2. Click **Open** and select the `android` folder in your project
3. Wait for Gradle sync to complete (first time may take a few minutes)
4. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
5. Wait for build to finish
6. Click **locate** in the notification to find your APK

#### Option C: Using Command Line

```bash
# 1. Build web app
npm run build

# 2. Sync to Android
npm run cap:android

# 3. Build APK
cd android
gradlew.bat assembleDebug
```

### Step 3: Find Your APK

After building, your APK will be at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### Step 4: Install on Your Device

1. **Enable Developer Options** on your Android phone:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. **Connect your phone** via USB

3. **Install the APK**:
   ```bash
   adb install android\app\build\outputs\apk\debug\app-debug.apk
   ```

   Or simply copy the APK file to your phone and tap it to install.

## 📱 What You Get

- **App Name**: SealMaster
- **Package ID**: com.sealmaster.billing
- **Version**: 1.0
- **All Features**: Dashboard, Invoices, POS, Inventory, Reports, etc.

## 🛠️ Troubleshooting

### "Gradle sync failed"
- Make sure Android Studio is fully installed
- Check your internet connection
- Try: **File > Invalidate Caches / Restart** in Android Studio

### "SDK location not found"
- In Android Studio: **File > Project Structure > SDK Location**
- Set the path to your Android SDK (usually `C:\Users\YourName\AppData\Local\Android\Sdk`)

### "Build failed"
- Open the project in Android Studio first and let it sync
- Make sure you have the latest Android SDK installed
- Check the error message in Android Studio's Build output

### APK won't install
- Uninstall any previous version: `adb uninstall com.sealmaster.billing`
- Make sure "Install from Unknown Sources" is enabled on your device
- Check that your device has enough storage space

## 📚 More Help

- **Detailed Guide**: See [BUILD_APK.md](./BUILD_APK.md)
- **Capacitor Docs**: https://capacitorjs.com/docs/android
- **Android Studio Help**: https://developer.android.com/studio/intro

## 🎉 You're Ready!

Once Android Studio is installed, you're just one command away from building your APK:
```bash
build-apk.bat
```

Good luck! 🚀

