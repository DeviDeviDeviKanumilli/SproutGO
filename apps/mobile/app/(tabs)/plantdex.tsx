// PlantDex tab — collection progress + hexagon badge grid (Stitch "PlantDex Screen").
// Discovered badges show a rarity-ringed photo; locked ones show a question mark by
// biome. Tapping a discovered plant routes to its detail screen.
import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { AppHeader, Chip } from "@/components/ui";
import { HexBadge } from "@/components/HexBadge";
import { plants, plantTypeChips, dexProgress, profile, type Rarity } from "@/lib/mockData";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "COMMON", label: "Common" },
  { key: "RARE", label: "Rare" },
  { key: "LEGENDARY", label: "Legendary" },
  { key: "locked", label: "Locked" },
];

export default function PlantDexScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  const visible = plants.filter((p) => {
    if (filter === "all") return true;
    if (filter === "locked") return !p.discovered;
    return p.rarity === (filter as Rarity);
  });
  const pct = Math.round((dexProgress.discovered / dexProgress.total) * 100);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="SproutGo" avatarUri={profile.avatarUrl} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={typography.largeTitle}>PlantDex</Text>
          <Text style={[typography.body, { marginBottom: spacing.md }]}>
            {dexProgress.discovered} / {dexProgress.total} species discovered
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <View style={styles.statChips}>
            {plantTypeChips.map((c) => (
              <View key={c.key} style={styles.statChip}>
                <Icon name={c.icon} size={15} color={colors.secondary} />
                <Text style={styles.statChipText}>
                  {c.count} {c.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.searchRow}>
          <Icon name="search" size={20} color={colors.textMuted} />
          <TextInput
            placeholder="Search your collection..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {visible.map((p) => (
            <Pressable
              key={p.id}
              style={styles.cell}
              disabled={!p.discovered}
              onPress={() => router.push(`/plant/${p.id}`)}
            >
              <HexBadge
                imageUrl={p.imageUrl}
                rarity={p.rarity}
                locked={!p.discovered}
              />
              <Text
                style={[styles.cellName, !p.discovered && { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {p.discovered ? p.commonName : "Undiscovered"}
              </Text>
              <Text style={styles.cellSci} numberOfLines={1}>
                {p.discovered ? p.scientificName : (p.biome ?? "Locked")}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  hero: {
    backgroundColor: colors.mint,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  track: {
    height: 12,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.pill,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  fill: { height: "100%", backgroundColor: colors.primaryContainer, borderRadius: radius.pill },
  statChips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statChipText: { ...typography.badge, color: colors.text },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, ...typography.body, paddingVertical: 0 },
  filterRow: { gap: spacing.sm, paddingBottom: spacing.lg, paddingRight: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: spacing.lg },
  cell: { width: "47%", alignItems: "center" },
  cellName: { ...typography.caption, fontWeight: "600", color: colors.text, marginTop: spacing.sm },
  cellSci: { ...typography.scientificName, textAlign: "center" },
});
