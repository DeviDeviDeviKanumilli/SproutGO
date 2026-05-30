import type { ExpoConfig } from "expo/config";

// Expo config. @rnmapbox/maps ships its own native code that is NOT bundled into Expo
// Go, so this app requires a custom dev build to run at all (TECH_RISKS R1, build steps
// in currentPlans/DEV_BUILD.md). expo-camera/expo-location ARE in Expo Go — Mapbox is the
// sole forcing function. The rnmapbox download token is a build-time secret
// (MAPBOX_DOWNLOAD_TOKEN); the runtime map uses a separate public, URL-restricted token
// (EXPO_PUBLIC_MAPBOX_TOKEN).
const config: ExpoConfig = {
  name: "SproutGo",
  slug: "sproutgo",
  scheme: "sproutgo",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.sproutgo.app",
    infoPlist: {
      NSCameraUsageDescription:
        "SproutGo uses your camera to identify plants and add them to your PlantDex.",
      NSLocationWhenInUseUsageDescription:
        "SproutGo uses your location to place plant discoveries on your map.",
    },
  },
  android: {
    package: "com.sproutgo.app",
    permissions: ["CAMERA", "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
  },
  plugins: [
    "expo-router",
    [
      "@rnmapbox/maps",
      { RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN ?? "" },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "SproutGo uses your location to place plant discoveries on your map.",
      },
    ],
  ],
  extra: {
    // Wired in M2 with a real EAS project id.
    eas: { projectId: "" },
  },
};

export default config;
