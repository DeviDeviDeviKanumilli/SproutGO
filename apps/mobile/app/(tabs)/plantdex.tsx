// PlantDex tab — collection progress + hexagon badge grid (Stitch "PlantDex Screen").
// Fetches the user's discovered species from GET /plantdex/me. The server returns only
// discovered entries, so the grid shows unlocked species; rarity filters narrow them.
import { useCallback, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import type { PlantDexResponse, Rarity } from "@sproutgo/shared";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { AppHeader, Chip } from "@/components/ui";
import { HexBadge } from "@/components/HexBadge";
import { api, ApiClientError } from "@/lib/api";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "COMMON", label: "Common" },
  { key: "UNCOMMON", label: "Uncommon" },
  { key: "RARE", label: "Rare" },
  { key: "LEGENDARY", label: "Legendary" },
];

export default function PlantDexScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState<PlantDexResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<PlantDexResponse>("/plantdex/me")
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof ApiClientError ? e.message : "Could not load your PlantDex.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(load);

  const entries = data?.entries ?? [];
  const visible = entries.filter((e) => filter === "all" || e.plant.rarity === (filter as Rarity));
  const stats = data?.stats;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="SproutGo" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={typography.largeTitle}>PlantDex</Text>
          <Text style={[typography.body, { marginBottom: spacing.md }]}>
            {stats ? `${stats.speciesDiscovered} species discovered` : "Your collection"}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${stats?.completionPct ?? 0}%` }]} />
          </View>
          {stats ? (
            <View style={styles.statChips}>
              <View style={styles.statChip}>
                <Icon name="emoji-events" size={15} color={colors.secondary} />
                <Text style={styles.statChipText}>{stats.totalPoints} pts</Text>
              </View>
              <View style={styles.statChip}>
                <Icon name="auto-awesome" size={15} color={colors.secondary} />
                <Text style={styles.statChipText}>{stats.rareFound} rare</Text>
              </View>
              <View style={styles.statChip}>
                <Icon name="photo-camera" size={15} color={colors.secondary} />
                <Text style={styles.statChipText}>{stats.photosSubmitted} photos</Text>
              </View>
            </View>
          ) : null}
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

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : error ? (
          <View style={styles.notice}>
            <Icon name="cloud-off" size={32} color={colors.textMuted} />
            <Text style={styles.noticeText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : visible.length === 0 ? (
          <View style={styles.notice}>
            <Icon name="local-florist" size={32} color={colors.textMuted} />
            <Text style={styles.noticeText}>
              {entries.length === 0
                ? "No discoveries yet. Snap a plant to start your PlantDex!"
                : "No species match this filter."}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {visible.map((e) => (
              <Pressable
                key={e.id}
                style={styles.cell}
                onPress={() => router.push(`/plant/${e.plant.id}`)}
              >
                <HexBadge imageUrl={e.plant.imageUrl} rarity={e.plant.rarity} />
                <Text style={styles.cellName} numberOfLines={1}>
                  {e.plant.commonName ?? e.plant.scientificName}
                </Text>
                <Text style={styles.cellSci} numberOfLines={1}>
                  {e.plant.scientificName}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
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
  notice: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  noticeText: { ...typography.body, color: colors.textMuted, textAlign: "center" },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  retryText: { ...typography.body, color: colors.onPrimary, fontWeight: "600" },
});
