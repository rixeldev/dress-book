export default {
  expo: {
    name: "Dress Book",
    slug: "dress-book",
    version: "1.1.0",
    orientation: "portrait",
    icon: "./assets/brand/icon-1024.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "dressbook",
    owner: "rikirilis",
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/24f07065-562e-4552-be5a-2a6efe1c1226",
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD",
    },
    splash: {
      image: "./assets/brand/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#F7F2EA",
    },
    platforms: ["android", "ios", "web"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rilisentertainment.dressbook",
      googleServicesFile: "./GoogleService-Info.plist",
      icon: "./assets/brand/icon-1024.png",
    },
    web: {
      favicon: "./assets/brand/favicon.png",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/brand/adaptive-foreground.png",
        backgroundColor: "#F7F2EA",
        monochromeImage: "./assets/brand/adaptive-monochrome.png",
      },
      icon: "./assets/brand/icon-1024.png",
      predictiveBackGestureEnabled: false,
      package: "com.rilisentertainment.dressbook",
      googleServicesFile: "./google-services.json",
      versionCode: 2,
      version: "1.1.0",
      minSdkVersion: 24,
      ndkVersion: "29.0.14206865",
      softwareKeyboardLayoutMode: "pan",
    },
    plugins: [
      "./plugins/withGradleJdk17",
      [
        "./plugins/withWindowBackground",
        {
          light: "#F7F2EA",
          dark: "#0E0C0B",
        },
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics",
      "expo-router",
      "expo-updates",
      "expo-font",
      "@react-native-google-signin/google-signin",
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you pick an image for your dress book.",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/brand/splash-icon.png",
          backgroundColor: "#F7F2EA",
          dark: {
            image: "./assets/brand/splash-icon-dark.png",
            backgroundColor: "#0E0C0B",
          },
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
          android: {
            targetSdkVersion: 36,
            compileSdkVersion: 36,
            ndkVersion: "29.0.14206865",
          },
        },
      ],
      [
        "react-native-google-mobile-ads",
        {
          android_app_id: "ca-app-pub-5333671658707378~2671065839",
          androidAppId: "ca-app-pub-5333671658707378~2671065839",
          ios_app_id: "ca-app-pub-5333671658707378~4817334130",
          iosAppId: "ca-app-pub-5333671658707378~4817334130",
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: "24f07065-562e-4552-be5a-2a6efe1c1226",
      },
    },
  },
}
