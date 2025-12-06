# iOS Application Setup Guide

This guide will help you build and deploy the SealMaster iOS application.

## Prerequisites

1. **macOS** - iOS development requires macOS (cannot be done on Windows)
2. **Xcode** - Install from Mac App Store (latest version recommended)
3. **CocoaPods** - Install via: `sudo gem install cocoapods`
4. **Node.js** - Already installed (v14+ required)
5. **Apple Developer Account** - Required for device testing and App Store distribution

## Project Structure

The iOS app is located in the `ios/` directory. This is a Capacitor-based iOS project that wraps your React web application.

## Development Workflow

### 1. Build the Web App

First, build your React application:

```bash
npm run build
```

This creates the `dist/` folder with your compiled web assets.

### 2. Sync with iOS

After building, sync the web assets to the iOS project:

```bash
npm run cap:ios
# or
npx cap sync ios
```

This copies your web build to the iOS app and updates native dependencies.

### 3. Open in Xcode

Open the project in Xcode:

```bash
npm run cap:open:ios
# or
npx cap open ios
```

This opens `ios/App/App.xcworkspace` in Xcode.

### 4. Configure Signing & Capabilities

In Xcode:

1. Select the **App** project in the navigator
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Select your **Team** (Apple Developer account)
5. Xcode will automatically create/update provisioning profiles

### 5. Run on Simulator

1. Select a simulator from the device dropdown (top toolbar)
2. Click the **Play** button or press `Cmd + R`
3. The app will build and launch in the simulator

### 6. Run on Physical Device

1. Connect your iPhone/iPad via USB
2. Trust the computer on your device if prompted
3. Select your device from the device dropdown
4. Click the **Play** button
5. On first run, you may need to:
   - Go to **Settings > General > VPN & Device Management**
   - Trust your developer certificate

## Build Scripts

The following npm scripts are available:

- `npm run build` - Build the web app
- `npm run cap:ios` - Sync web assets to iOS
- `npm run cap:open:ios` - Open project in Xcode
- `npm run ios:build` - Build web app and sync to iOS
- `npm run ios:dev` - Build, sync, and open in Xcode

## Configuration

### App ID

The app ID is configured in `capacitor.config.ts`:
- Current: `com.sealmaster.billing`

To change it:
1. Update `appId` in `capacitor.config.ts`
2. Update `PRODUCT_BUNDLE_IDENTIFIER` in Xcode project settings

### App Name

The display name is set in:
- `capacitor.config.ts` - `appName: 'SealMaster'`
- `ios/App/App/Info.plist` - `CFBundleDisplayName`

### App Icons

App icons are located in:
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

To update icons:
1. Generate icons in various sizes (use online tools or Xcode)
2. Replace files in the AppIcon.appiconset folder
3. Update `Contents.json` if needed

### Splash Screen

Splash screen assets are in:
- `ios/App/App/Assets.xcassets/Splash.imageset/`

Configuration is in `capacitor.config.ts` under `plugins.SplashScreen`.

## Environment Variables

For the Gemini AI API key:

1. Create a `.env.local` file in the project root:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. The key is injected during build via `vite.config.ts`

3. For iOS, the API key is bundled into the JavaScript at build time

## Testing

### Simulator Testing

- Use iOS Simulator for quick testing
- Supports all iOS versions available in Xcode
- No device registration needed

### Device Testing

- Requires Apple Developer account (free tier works)
- Register device UDID in Apple Developer portal
- Install via Xcode or TestFlight

## Building for Distribution

### Archive Build

1. In Xcode, select **Any iOS Device** or **Generic iOS Device**
2. Go to **Product > Archive**
3. Wait for archive to complete
4. Xcode Organizer will open

### App Store Distribution

1. In Xcode Organizer, click **Distribute App**
2. Select **App Store Connect**
3. Follow the wizard to upload
4. Complete app information in App Store Connect
5. Submit for review

### Ad Hoc Distribution

1. In Xcode Organizer, click **Distribute App**
2. Select **Ad Hoc**
3. Select provisioning profile
4. Export IPA file
5. Distribute to registered devices

### Enterprise Distribution

Requires Apple Enterprise Developer Program ($299/year)

## Troubleshooting

### Build Errors

- **"No such module 'Capacitor'"**: Run `pod install` in `ios/App/` directory
- **Signing errors**: Check Team selection in Xcode Signing & Capabilities
- **"Command PhaseScriptExecution failed"**: Clean build folder (Product > Clean Build Folder)

### Sync Issues

- If web changes don't appear: Run `npm run build` then `npx cap sync ios`
- Clear iOS build: Delete `ios/App/App/public/` and sync again

### Runtime Issues

- **White screen**: Check browser console in Xcode (View > Debug Area > Activate Console)
- **localStorage not working**: Should work automatically in Capacitor
- **API calls failing**: Check network permissions in Info.plist

### CocoaPods Issues

```bash
cd ios/App
pod deintegrate
pod install
```

## Capacitor Plugins

Currently installed plugins:
- `@capacitor/app` - App lifecycle events
- `@capacitor/keyboard` - Keyboard handling
- `@capacitor/status-bar` - Status bar customization

To add more plugins:
```bash
npm install @capacitor/camera
npx cap sync ios
```

## Performance Optimization

The app is already optimized with:
- Code splitting in `vite.config.ts`
- Manual chunks for vendor libraries
- Production build optimizations

For further optimization:
- Enable Hermes JavaScript engine (if needed)
- Use native modules for heavy operations
- Optimize images and assets

## Security Considerations

1. **API Keys**: Currently bundled in JavaScript (visible in app bundle)
   - Consider using Capacitor Preferences plugin for sensitive data
   - Or use backend proxy for API calls

2. **Data Storage**: Uses localStorage (persists in app sandbox)
   - Data is private to the app
   - Consider encryption for sensitive business data

3. **Network**: Currently allows arbitrary loads (for development)
   - Restrict to specific domains for production

## Next Steps

1. Test on physical device
2. Configure app icons and splash screens
3. Set up App Store Connect listing
4. Configure push notifications (if needed)
5. Add analytics (if needed)
6. Set up crash reporting

## Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Portal](https://developer.apple.com)
- [Xcode Documentation](https://developer.apple.com/xcode/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

