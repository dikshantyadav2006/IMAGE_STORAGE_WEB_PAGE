# Image Gallery Android App

A modern Android application built with Jetpack Compose that provides a Pinterest-like image gallery experience with authentication and backend integration.

## Features

### 🔐 Authentication
- User registration and login
- Secure token-based authentication
- Auto-login on app restart
- Logout functionality

### 📸 Image Management
- Take photos with camera
- Select images from gallery
- Upload images to backend server
- Anonymous uploads (for non-authenticated users)
- Pinterest-like grid layout for browsing

### 👤 User Profile
- View user profile information
- Display user statistics (posts, followers, following)
- Profile picture support
- Personal posts gallery

### ⚙️ Settings
- Account management
- Privacy settings
- Theme preferences
- App information
- Logout option

## Architecture

### 🏗️ Modern Android Architecture
- **MVVM Pattern**: Clean separation of concerns
- **Jetpack Compose**: Modern declarative UI
- **Repository Pattern**: Data layer abstraction
- **StateFlow**: Reactive state management
- **Navigation Component**: Type-safe navigation

### 📱 UI/UX Design
- **Material 3 Design**: Latest Material Design guidelines
- **Android-like Interface**: Native Android experience
- **Bottom Navigation**: Easy access to main features
- **Pull-to-refresh**: Intuitive content updates
- **Responsive Layout**: Adapts to different screen sizes

### 🌐 Backend Integration
- **Retrofit**: HTTP client for API calls
- **OkHttp**: Network layer with logging
- **DataStore**: Secure token storage
- **Gson**: JSON serialization/deserialization

## Project Structure

```
android/app/src/main/java/com/example/myfirstapp/
├── data/
│   ├── api/
│   │   ├── ApiClient.kt          # Network configuration
│   │   └── ApiService.kt         # API endpoints
│   ├── models/
│   │   ├── User.kt               # User data models
│   │   └── Post.kt               # Post data models
│   └── repository/
│       ├── AuthRepository.kt     # Authentication logic
│       └── PostRepository.kt     # Post management logic
├── navigation/
│   └── Screen.kt                 # Navigation routes
├── ui/
│   ├── screens/
│   │   ├── AuthScreen.kt         # Login/Signup screen
│   │   ├── HomeScreen.kt         # Main feed screen
│   │   ├── UploadScreen.kt       # Image upload screen
│   │   ├── ProfileScreen.kt      # User profile screen
│   │   └── SettingsScreen.kt     # Settings screen
│   ├── theme/
│   │   ├── Color.kt              # App colors
│   │   ├── Theme.kt              # Material theme
│   │   └── Type.kt               # Typography
│   └── viewmodel/
│       ├── AuthViewModel.kt      # Authentication state
│       └── PostViewModel.kt      # Post management state
└── MainActivity.kt               # Main activity
```

## Setup Instructions

### 1. Backend Configuration
The app is configured to use the deployed backend on Render:
```kotlin
private const val BASE_URL = "https://image-storage-web-page.onrender.com/"
```

✅ **Ready to use** - No configuration needed!
- Uses HTTPS for secure communication
- Works on both emulator and physical devices
- No need to update IP addresses

### 2. Dependencies
All required dependencies are already configured in `build.gradle.kts`:
- Jetpack Compose
- Navigation Component
- Retrofit & OkHttp
- DataStore
- Coil (Image loading)
- Material 3

### 3. Permissions
Required permissions are configured in `AndroidManifest.xml`:
- Camera access
- Storage access
- Internet access

## Usage

### Authentication Flow
1. **First Launch**: Shows login/signup screen
2. **Login**: Enter username/mobile and password
3. **Signup**: Fill registration form with validation
4. **Auto-login**: Remembers user session

### Main Features
1. **Home Screen**: Browse all public posts in Pinterest-like grid
2. **Upload Screen**: Take photo or select from gallery, add caption and tags
3. **Profile Screen**: View personal profile and posts
4. **Settings Screen**: Manage account and app preferences

### Anonymous Usage
- Users can upload images without authentication
- Anonymous posts are public by default
- Optional username can be provided

## API Integration

### Supported Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /auth/userdata` - Get current user
- `POST /auth/logout` - User logout
- `GET /posts` - Get all posts (paginated)
- `POST /posts/android-upload` - Create authenticated post
- `POST /posts/upload-anonymous` - Create anonymous post
- `GET /profile/{username}` - Get user profile

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage using DataStore

## Key Features

### Pinterest-like Grid
- Staggered grid layout for optimal image display
- Random heights for visual variety
- Smooth scrolling and loading
- Pull-to-refresh functionality

### Image Upload
- Camera integration with permissions
- Gallery selection
- Image compression and optimization
- Progress indicators
- Error handling

### State Management
- Reactive UI updates
- Loading states
- Error handling
- Offline support preparation

## Development Notes

### Customization
- Colors can be modified in `ui/theme/Color.kt`
- Typography in `ui/theme/Type.kt`
- API endpoints in `data/api/ApiService.kt`

### Testing
- ViewModels are testable with dependency injection
- Repository pattern enables easy mocking
- UI components are composable and testable

### Performance
- Lazy loading for large image lists
- Image caching with Coil
- Efficient state management
- Memory optimization

## Future Enhancements

- [ ] Dark theme support
- [ ] Offline mode with local database
- [ ] Push notifications
- [ ] Image editing features
- [ ] Social features (likes, comments)
- [ ] Search functionality
- [ ] Profile editing
- [ ] Settings persistence

## Troubleshooting

### Common Issues
1. **Network errors**: Check backend URL and server status
2. **Authentication issues**: Verify token storage and API endpoints
3. **Image upload failures**: Check permissions and file size limits
4. **UI issues**: Ensure proper Compose dependencies

### Debug Tips
- Enable network logging in `ApiClient.kt`
- Check Logcat for detailed error messages
- Verify backend API responses
- Test on both emulator and physical device
