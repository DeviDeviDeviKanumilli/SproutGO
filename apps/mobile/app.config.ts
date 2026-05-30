import type { ExpoConfig } from "expo/config";

// Expo config. NOTE: @rnmapbox/maps does NOT run in Expo Go (TECH_RISKS R1) — a custom
// EAS dev build is required. The rnmapbox config plugin is added here ahead of M2 so the
// first dev build is map-ready; the package itself is installed when map work begins.
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
  plugins: ["expo-router"],
  extra: {
    // Wired in M2 with a real EAS project id.
    eas: { projectId: "" },
  },
};

export default config;
