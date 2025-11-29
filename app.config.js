export default {
  expo: {
    name: "Dress Book",
    slug: "dress-book",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/mipmap-xxxhdpi/ic_launcher.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "dressbook",
    owner: "rikirilis",
    splash: {
      image: "./assets/icons/mipmap-xxxhdpi/ic_launcher.png",
      resizeMode: "contain",
      backgroundColor: "#F1F1F1",
    },
    platforms: ["android", "ios"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rilisentertainment.dressbook",
      googleServicesFile: "./GoogleService-Info.plist",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icons/mipmap-xxxhdpi/ic_launcher.png",
        backgroundColor: "#F1F1F1",
      },
      icon: "./assets/icons/mipmap-xxxhdpi/ic_launcher.png",
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.rilisentertainment.dressbook",
      googleServicesFile: "./google-services.json",
      versionCode: 1,
      version: "1.0.0",
      minSdkVersion: 24,
      ndkVersion: "29.0.14206865",
      softwareKeyboardLayoutMode: "pan",
    },
    plugins: [
      "@react-native-firebase/app",
      "expo-router",
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
          image: "./assets/icons/mipmap-xxxhdpi/ic_launcher.png",
          backgroundColor: "#F1F1F1",
          dark: {
            image: "./assets/icons/mipmap-xxxhdpi/ic_launcher.png",
            backgroundColor: "#F1F1F1",
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
            compileSdk: 36,
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
