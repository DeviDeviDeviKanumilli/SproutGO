// Bottom-tab navigation (design.md §7). Tabs: Map, PlantDex, Capture (centered/emphasized),
// Feed, Profile. Library lives inside PlantDex (§7.2); Forums inside Feed (§7.3) — not tabs.
// M0 = navigable shell; feature logic arrives in M1–M5.

import { Tabs } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { colors, spacing } from "@/theme";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? colors.primary : colors.textMuted, fontSize: 11, fontWeight: "600" }}>
      {label}
    </Text>
  );
}

// Capture is visually emphasized: a raised green circle in the center (§7).
function CaptureIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.captureButton, focused && styles.captureButtonActive]}>
      <Text style={styles.capturePlus}>+</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.sage, height: 64, paddingBottom: spacing.sm },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Map" focused={focused} /> }}
      />
      <Tabs.Screen
        name="plantdex"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="PlantDex" focused={focused} /> }}
      />
      <Tabs.Screen
        name="capture"
        options={{ tabBarIcon: ({ focused }) => <CaptureIcon focused={focused} /> }}
      />
      <Tabs.Screen
        name="feed"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Feed" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  captureButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: colors.deep,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  captureButtonActive: { backgroundColor: colors.deep },
  capturePlus: { color: colors.textInverse, fontSize: 30, fontWeight: "300", lineHeight: 34 },
});
