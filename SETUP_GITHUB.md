# Quick GitHub Setup Commands

Copy and paste these commands one by one:

## 1. Initialize Git (if not done)
```bash
git init
```

## 2. Add all files
```bash
git add .
```

## 3. Make first commit
```bash
git commit -m "Initial commit - SealMaster with Android APK build"
```

## 4. Create repository on GitHub
- Go to: https://github.com/new
- Name it: `sealmaster-billing` (or any name)
- **Don't** check "Initialize with README"
- Click "Create repository"

## 5. Connect and push (replace YOUR_USERNAME)
```bash
git remote add origin https://github.com/YOUR_USERNAME/sealmaster-billing.git
git branch -M main
git push -u origin main
```

## 6. Build APK
- Go to: https://github.com/YOUR_USERNAME/sealmaster-billing/actions
- Click "Build Android APK"
- Click "Run workflow"
- Wait 3-5 minutes
- Download APK from Artifacts!

Done! 🎉

