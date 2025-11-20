# Dress Book

A React Native mobile application built with Expo for managing and organizing your dress collection. The app allows you to catalog your dresses with photos, organize them online and offline, and access your collection from anywhere.

## 📃 Description

Dress Book is a cross-platform mobile application built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev). It uses [Firebase](https://firebase.google.com) for authentication, data storage, and cloud synchronization, enabling you to manage your dress collection seamlessly across devices.

## 🤝 Getting Started

Follow these steps to set up and run the Dress Book project locally:

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) package manager
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For iOS development: macOS with Xcode
- For Android development: Android Studio with Android SDK

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Navigate into the project folder**
   ```bash
   cd dress-book
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Add your `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) files to the project root
   - Configure Google OAuth credentials in `consts/GoogleAuth.ts`

5. **Start the development server**
   ```bash
   pnpm start
   ```

6. **Run on your preferred platform**
   - Press `a` for Android emulator/device
   - Press `i` for iOS simulator (macOS only)
   - Press `w` for web browser
   - Scan the QR code with Expo Go app on your mobile device

## ⚙️ Main Features

- **Cross-platform:** Built with React Native + Expo, runs on Android, iOS, and web
- **Authentication:** Email/password and Google OAuth sign-in with email verification
- **Cloud Sync:** Firebase Firestore for online data synchronization
- **Offline Mode:** Access and manage your collection without internet connection
- **Image Management:** Pick and store dress photos using device camera or gallery
- **Persistent Storage:** AsyncStorage for local data persistence
- **Custom Themes:** Configurable color and font schemes
- **App Update Notifications:** In-app notifications for new app versions
- **Multi-lingual:** i18n support with English and Spanish translations
- **Google Mobile Ads:** Integrated ad support for monetization

## 🧞 Available Commands

All commands are run from the root of the project:

| Command                | Action                                    |
| :--------------------- | :---------------------------------------- |
| `pnpm install`         | Installs all dependencies                 |
| `pnpm start`           | Starts the Expo development server         |
| `pnpm android`         | Runs the app on Android emulator/device   |
| `pnpm ios`             | Runs the app on iOS simulator (macOS only)|
| `pnpm web`             | Runs the app in your web browser          |
| `pnpm lint`            | Lints project files                       |

## 💡 Configuration

### Firebase Setup

1. Create a Firebase project and enable:
   - Authentication (Email/Password and Google Sign-In)
   - Firestore Database
   - Firebase Storage
   - Firebase Analytics

2. Add your Firebase configuration files:
   - `google-services.json` for Android
   - `GoogleService-Info.plist` for iOS

3. Configure Google OAuth:
   - Set up OAuth 2.0 credentials in Google Cloud Console
   - Add client IDs to `consts/GoogleAuth.ts`

### Environment Variables

The app uses Firebase configuration from the service files. Make sure your Firebase project is properly configured with the correct package names:
- Android: `com.rilisentertainment.dressbook`
- iOS: `com.rilisentertainment.dressbook`

## 🌟 Contributing

Contributions are welcome! If you find bugs or want to add features, feel free to open an issue or submit a pull request.

## 📄 License

This project is private and proprietary.

## 📱 App Information

- **App Name:** Dress Book
- **Package Name:** com.rilisentertainment.dressbook
- **Version:** 1.0.0
- **Platforms:** Android, iOS, Web
