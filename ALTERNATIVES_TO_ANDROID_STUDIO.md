# Alternatives to Android Studio - Quick Reference

## ✅ Easiest Option: GitHub Actions (Recommended)

**No installation needed!** Build APK in the cloud.

### How to Use:

1. **Push your code to GitHub** (if not already)
2. **Go to Actions tab** in your GitHub repository
3. **Click "Build Android APK"** workflow
4. **Click "Run workflow"** button
5. **Wait for build** (takes ~5 minutes)
6. **Download APK** from the artifacts section

**That's it!** No Android Studio, no SDK setup, nothing to install.

---

## 🛠️ Option 2: Command Line Tools Only

**Lighter than Android Studio** - Only installs what you need.

### Quick Setup:

1. **Run the setup script**:
   ```bash
   setup-android-sdk.bat
   ```

2. **Wait 10-15 minutes** for download and installation

3. **Restart your terminal**

4. **Build APK**:
   ```bash
   build-apk.bat
   ```

**Disk Space**: ~2 GB (vs ~8 GB for Android Studio)

---

## ☁️ Option 3: Online Build Services

### AppCircle (Free Tier)
- Sign up at https://appcircle.io/
- Connect GitHub repo
- Automatic builds
- Download APK

### Codemagic (Free Tier)
- Sign up at https://codemagic.io/
- Connect repository
- One-click builds
- Direct download

---

## 📊 Comparison

| Method | Setup Time | Disk Space | Best For |
|--------|-----------|------------|----------|
| **GitHub Actions** | 2 minutes | 0 GB | Everyone! |
| **Command Line Tools** | 15 minutes | 2 GB | Regular local builds |
| **Android Studio** | 30 minutes | 8 GB | Full development |
| **Online Services** | 5 minutes | 0 GB | No local setup |

---

## 🎯 My Recommendation

**Use GitHub Actions!** It's:
- ✅ Free
- ✅ No installation
- ✅ Works on any computer
- ✅ Automatic builds on code changes
- ✅ Download APK from anywhere

Just push to GitHub and click "Run workflow" - that's it!

---

## 📚 More Details

- **Full guide**: See [BUILD_APK_NO_STUDIO.md](./BUILD_APK_NO_STUDIO.md)
- **Quick start**: See [QUICK_START_APK.md](./QUICK_START_APK.md)
- **GitHub Actions workflow**: Already created at `.github/workflows/build-apk.yml`

