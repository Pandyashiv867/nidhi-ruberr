# GitHub Actions Setup - Step by Step Guide

This guide will help you set up GitHub Actions to build your APK automatically in the cloud.

## ✅ What's Already Done

- ✅ GitHub Actions workflow file created (`.github/workflows/build-apk.yml`)
- ✅ Workflow configured to build APK automatically
- ✅ APK will be available for download after build

## 🚀 Setup Steps

### Step 1: Initialize Git Repository

If you haven't already, initialize git:

```bash
git init
```

### Step 2: Create .gitignore (Already Done!)

Your `.gitignore` is already configured to exclude:
- `node_modules/`
- `dist/`
- Build artifacts
- Android/iOS build files

### Step 3: Add All Files

```bash
git add .
```

### Step 4: Make Initial Commit

```bash
git commit -m "Initial commit - SealMaster billing app with Android support"
```

### Step 5: Create GitHub Repository

1. **Go to GitHub**: https://github.com
2. **Click the "+" icon** (top right) → **New repository**
3. **Repository name**: `sealmaster-billing` (or any name you prefer)
4. **Visibility**: Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. **Click "Create repository"**

### Step 6: Push to GitHub

GitHub will show you commands. Use these:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/sealmaster-billing.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: You'll need to authenticate. GitHub may ask for:
- Username and Personal Access Token (recommended)
- Or use GitHub Desktop app

### Step 7: Build Your First APK!

1. **Go to your repository on GitHub**
2. **Click the "Actions" tab** (top menu)
3. **You'll see "Build Android APK" workflow**
4. **Click on it**, then click **"Run workflow"** button (right side)
5. **Select branch**: `main`
6. **Click "Run workflow"**

### Step 8: Download Your APK

1. **Wait 3-5 minutes** for the build to complete
2. **Click on the workflow run** (it will show "in progress" then "completed")
3. **Scroll down to "Artifacts"** section
4. **Click "SealMaster-APK"** to download
5. **Extract the ZIP file** to get your `app-debug.apk`

## 🎉 That's It!

Your APK is ready! You can:
- Install it on any Android device
- Share it with others
- Build a new APK anytime by clicking "Run workflow"

## 📱 Installing the APK

1. **Transfer APK to your Android device** (via USB, email, or cloud storage)
2. **Enable "Install from Unknown Sources"**:
   - Settings → Security → Unknown Sources (enable)
   - Or Settings → Apps → Special Access → Install Unknown Apps
3. **Tap the APK file** on your device
4. **Tap "Install"**

## 🔄 Building Again

Every time you:
- **Push code to GitHub** → APK builds automatically
- **Click "Run workflow"** → APK builds on demand

## 🔐 Optional: Add Gemini API Key (For AI Features)

If you want the Gemini AI features to work in the built APK:

1. **Go to your GitHub repository**
2. **Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Name**: `GEMINI_API_KEY`
5. **Value**: Your Gemini API key
6. **Click "Add secret"**

The workflow will automatically use this key when building.

## 🐛 Troubleshooting

### "Workflow not showing"
- Make sure you pushed the `.github/workflows/build-apk.yml` file
- Check that you're on the correct branch (main/master)

### "Build failed"
- Check the workflow logs by clicking on the failed run
- Common issues:
  - Missing dependencies (should be auto-installed)
  - Syntax errors in code
  - Missing files

### "Can't find Actions tab"
- Make sure you're logged into GitHub
- Check that you're viewing your repository (not someone else's)
- Actions tab is only visible on the repository page

### "Authentication failed when pushing"
- Use Personal Access Token instead of password
- Generate token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Or use GitHub Desktop app

## 📚 Next Steps

- **Test the APK** on your Android device
- **Share the repository** with your team
- **Set up automatic builds** on every push (already configured!)
- **Create releases** with versioned APKs

## 🎯 Quick Reference

**Build APK**: GitHub → Actions → Build Android APK → Run workflow  
**Download APK**: GitHub → Actions → [Latest run] → Artifacts → SealMaster-APK  
**Build Time**: ~3-5 minutes  
**APK Size**: ~5-10 MB

Enjoy your automated APK builds! 🚀

