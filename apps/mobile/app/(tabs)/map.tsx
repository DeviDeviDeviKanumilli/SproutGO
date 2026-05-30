// Map tab (Stitch Map Screen). Ambient grid "map" with floating search + filter,
// Friends/Rare toggles, recenter FAB, rarity-colored pin markers, a pulsing user
// location dot, and a bottom-sheet preview for the selected marker. Mock-driven.
import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, TextInput, type DimensionValue } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { RarityBadge } from "@/components/ui";
import { mapMarkers, plantById } from "@/lib/mockData";

export default function MapScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(mapMarkers[3]!);
  const plant = plantById(selected.plantId)!;

  return (
    <View style={styles.root}>
      <View style={styles.mapBg}>
        {[...Array(10)].map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLine, { top: `${i * 11}%` }]} />
        ))}
        {[...Array(7)].map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: `${i * 16}%` }]} />
        ))}
      </View>

      {/* Markers */}
      {mapMarkers.map((m) => (
        <Pressable
          key={m.id}
          onPress={() => setSelected(m)}
          style={[styles.marker, { top: m.top as DimensionValue, left: m.left as DimensionValue }]}
        >
          <View style={[styles.pin, { borderColor: colors.rarity[m.rarity] }]}>
            <View style={[styles.pinDot, { backgroundColor: colors.rarity[m.rarity] }]} />
          </View>
        </Pressable>
      ))}

      {/* User location */}
      <View style={[styles.userDot, { top: "55%", left: "40%" }]}>
        <View style={styles.userPulse} />
        <View style={styles.userCore} />
      </View>

      {/* Floating search + filter */}
      <SafeAreaView edges={["top"]} style={styles.topBar}>
        <View style={styles.searchPill}>
          <Icon name="search" size={20} color={colors.textMuted} />
          <TextInput
            placeholder="Search parks, plants..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>
        <Pressable style={styles.iconPill}>
          <Icon name="tune" size={22} color={colors.textMuted} />
        </Pressable>
      </SafeAreaView>

      {/* Toggles */}
      <View style={styles.toggles}>
        <Pressable style={styles.toggle}>
          <Icon name="group" size={18} color={colors.primary} />
          <Text style={styles.toggleText}>Friends</Text>
        </Pressable>
        <Pressable style={[styles.toggle, { borderColor: colors.rarity.RARE }]}>
          <Icon name="star" size={18} color={colors.rarity.RARE} />
          <Text style={styles.toggleText}>Rare</Text>
        </Pressable>
      </View>

      {/* Recenter */}
      <Pressable style={styles.recenter}>
        <Icon name="my-location" size={24} color={colors.primary} />
      </Pressable>

      {/* Bottom preview sheet */}
      <Pressable style={styles.sheet} onPress={() => router.push(`/plant/${plant.id}`)}>
        <View style={styles.handle} />
        <View style={styles.sheetRow}>
          <View style={styles.thumbWrap}>
            {plant.imageUrl ? <Image source={{ uri: plant.imageUrl }} style={styles.thumb} /> : null}
            <View style={[styles.thumbDot, { backgroundColor: colors.rarity[plant.rarity] }]} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.sheetTop}>
              <RarityBadge rarity={plant.rarity} />
              <View style={styles.distance}>
                <Icon name="location-on" size={14} color={colors.textMuted} />
                <Text style={typography.caption}>12m</Text>
              </View>
            </View>
            <Text style={[typography.sectionTitle, { marginTop: 4 }]} numberOfLines={1}>
              {plant.commonName}
            </Text>
            <Text style={typography.scientificName} numberOfLines={1}>
              {plant.scientificName}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.textMuted} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceContainer },
  mapBg: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.surfaceContainer },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(178,194,178,0.25)" },
  gridLineV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(178,194,178,0.25)" },
  marker: { position: "absolute", transform: [{ translateX: -16 }, { translateY: -32 }] },
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    backgroundColor: colors.surfaceLowest,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.deep,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pinDot: { width: 12, height: 12, borderRadius: 6 },
  userDot: { position: "absolute", width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  userPulse: { position: "absolute", width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,108,12,0.2)" },
  userCore: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.surfaceLowest },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  searchPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  searchInput: { flex: 1, ...typography.body, paddingVertical: 0 },
  iconPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  toggles: { position: "absolute", top: 120, right: spacing.md, gap: spacing.sm, alignItems: "flex-end" },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.button,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleText: { ...typography.badge, color: colors.textMuted },
  recenter: {
    position: "absolute",
    bottom: 200,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    position: "absolute",
    bottom: 96,
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.sheet,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, marginBottom: spacing.sm },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  thumbWrap: { width: 72, height: 72, borderRadius: radius.button, overflow: "hidden", borderWidth: 1, borderColor: colors.sage, backgroundColor: colors.surfaceContainer },
  thumb: { width: "100%", height: "100%" },
  thumbDot: { position: "absolute", top: 4, right: 4, width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: colors.surfaceLowest },
  sheetTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  distance: { flexDirection: "row", alignItems: "center", gap: 2 },
});
