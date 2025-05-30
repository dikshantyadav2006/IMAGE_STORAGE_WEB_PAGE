# APK Installation Guide

## 📱 APK Files Generated

Your Android app has been successfully built! Two APK files are available:

### 1. Debug APK (Recommended for Testing)
**Location**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Size**: Larger file size
- **Performance**: Slower (includes debugging info)
- **Use Case**: Development and testing
- **Installation**: Can be installed directly

### 2. Release APK (Optimized)
**Location**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`
- **Size**: Smaller file size
- **Performance**: Faster (optimized)
- **Use Case**: Production use
- **Note**: Unsigned (for testing only)

## 🔧 Installation Instructions

### Method 1: Direct Installation (Easiest)

1. **Copy APK to Device**
   - Transfer `app-debug.apk` to your Android device
   - Use USB cable, email, cloud storage, or ADB

2. **Enable Unknown Sources**
   - Go to **Settings** > **Security** > **Unknown Sources**
   - Or **Settings** > **Apps** > **Special Access** > **Install Unknown Apps**
   - Enable for your file manager or browser

3. **Install APK**
   - Open file manager on your device
   - Navigate to the APK file
   - Tap the APK file
   - Follow installation prompts
   - Tap **Install**

### Method 2: ADB Installation (Developer)

```bash
# Connect device via USB with USB Debugging enabled
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## ⚙️ Pre-Installation Setup

### 1. Backend Server
Before using the app, ensure your backend server is running:

```bash
# In your backend directory
npm start
# Server should be running on http://localhost:5000
```

### 2. Network Configuration
Update the server URL in the app if needed:
- **For Emulator**: `http://10.0.2.2:5000/`
- **For Physical Device**: `http://YOUR_COMPUTER_IP:5000/`

To find your computer's IP:
```bash
# Windows
ipconfig
# Look for IPv4 Address

# Mac/Linux
ifconfig
# Look for inet address
```

## 📋 App Features

### 🔐 Authentication
- **Login**: Use existing account credentials
- **Sign Up**: Create new account with username, mobile, password
- **Anonymous**: Upload images without account

### 📸 Image Upload
- **Camera**: Take new photos
- **Gallery**: Select existing images
- **Captions**: Add descriptions to your images
- **Tags**: Organize with hashtags

### 🏠 Main Features
- **Home**: Browse all public images in Pinterest-like grid
- **Upload**: Add new images with camera or gallery
- **Profile**: View your profile and uploaded images
- **Settings**: Manage account and app preferences

## 🔍 Troubleshooting

### Installation Issues
- **"App not installed"**: Enable Unknown Sources
- **"Parse error"**: Download APK again, file may be corrupted
- **"Insufficient storage"**: Free up device storage

### App Issues
- **Login fails**: Check backend server is running
- **Images don't load**: Verify network connection and server URL
- **Camera not working**: Grant camera permissions in app settings
- **Upload fails**: Check internet connection and file size

### Network Issues
- **Can't connect to server**: 
  - Ensure backend is running
  - Check firewall settings
  - Verify IP address in app configuration
  - For physical device, ensure same WiFi network

## 📱 Device Requirements

### Minimum Requirements
- **Android Version**: 7.0 (API level 24) or higher
- **RAM**: 2GB minimum
- **Storage**: 100MB free space
- **Permissions**: Camera, Storage, Internet

### Recommended
- **Android Version**: 10.0 or higher
- **RAM**: 4GB or more
- **Storage**: 500MB free space

## 🔒 Permissions

The app requires these permissions:
- **Camera**: Take photos
- **Storage**: Access gallery and save images
- **Internet**: Connect to backend server
- **Network State**: Check connectivity

## 🚀 First Launch

1. **Open App**: Tap the "Image Gallery" icon
2. **Authentication**: 
   - Sign up for new account, or
   - Login with existing credentials, or
   - Use anonymous upload
3. **Permissions**: Grant camera and storage permissions when prompted
4. **Start Using**: Browse images, upload photos, manage profile

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify backend server is running
3. Check device compatibility
4. Ensure proper network configuration

## 🔄 Updates

To update the app:
1. Build new APK with latest changes
2. Uninstall old version (optional)
3. Install new APK following same steps
4. App data will be preserved if same signing key used

---

**Note**: This is a debug/development APK. For production deployment, you would need to:
- Sign the APK with a release keystore
- Upload to Google Play Store
- Implement proper security measures
- Add crash reporting and analytics
