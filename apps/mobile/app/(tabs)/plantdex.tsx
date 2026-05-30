// PlantDex tab — collection progress + hexagon badge grid (Stitch "PlantDex Screen").
// "My PlantDex" fetches the user's discovered species from GET /plantdex/me (server
// returns only unlocked entries; rarity filters narrow them). "Library" (design §7.2)
// shows the full encyclopedia from local fixtures.
import { useCallback, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import type { PlantDexResponse, Rarity } from "@sproutgo/shared";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { AppHeader, Chip, RarityBadge } from "@/components/ui";
import { HexBadge } from "@/components/HexBadge";
import { api, ApiClientError } from "@/lib/api";
import { plants, rarityLabel } from "@/lib/mockData";

const MODES = ["My PlantDex", "Library"] as const;

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "COMMON", label: "Common" },
  { key: "UNCOMMON", label: "Uncommon" },
  { key: "RARE", label: "Rare" },
  { key: "LEGENDARY", label: "Legendary" },
];

export default function PlantDexScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<(typeof MODES)[number]>("My PlantDex");
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

      <View style={styles.toggle}>
        {MODES.map((m) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[styles.toggleTab, active && styles.toggleTabActive]}
            >
              <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{m}</Text>
            </Pressable>
          );
        })}
      </View>

      {mode === "Library" ? (
        <LibraryView router={router} />
      ) : (
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
      )}
    </SafeAreaView>
  );
}

// Library view (design §8.10) — the full encyclopedia: searchable list with type +
// native-status badges and a discovered indicator. Shares mockData with the PlantDex.
function LibraryView({ router }: { router: ReturnType<typeof useRouter> }) {
  const [query, setQuery] = useState("");
  const list = plants.filter(
    (p) =>
      p.commonName.toLowerCase().includes(query.toLowerCase()) ||
      p.scientificName.toLowerCase().includes(query.toLowerCase()),
  );

  const discovered = plants.filter((p) => p.discovered).length;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={[styles.searchRow, { marginTop: spacing.md }]}>
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search the PlantDex..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.libHeader}>
        <View>
          <Text style={typography.sectionTitle}>Full Collection</Text>
          <Text style={typography.caption}>
            {discovered} of {plants.length} Discovered
          </Text>
        </View>
        <View style={styles.sortBtn}>
          <Text style={styles.sortText}>Sort: A–Z</Text>
          <Icon name="expand-more" size={16} color={colors.primary} />
        </View>
      </View>

      <View style={styles.libGrid}>
        {list.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.libCard, !p.discovered && styles.libCardLocked]}
            onPress={() => router.push(`/plant/${p.id}`)}
          >
            <View style={styles.libCardImgWrap}>
              {p.discovered && p.imageUrl ? (
                <Image source={{ uri: p.imageUrl }} style={styles.libCardImg} />
              ) : (
                <View style={styles.libCardSilhouette}>
                  <Icon name="local-florist" size={56} color={colors.outlineVariant} />
                </View>
              )}
              <View style={[styles.libRarityPill, { backgroundColor: colors.rarity[p.rarity] }]}>
                <Text style={styles.libRarityText}>{rarityLabel[p.rarity]}</Text>
              </View>
              <View style={styles.libStatus}>
                <Icon
                  name={p.discovered ? "check-circle" : "lock"}
                  size={18}
                  color={p.discovered ? colors.primary : colors.outlineVariant}
                />
              </View>
            </View>
            <View style={styles.libCardBody}>
              <Text style={[typography.body, { fontWeight: "600" }]} numberOfLines={1}>
                {p.commonName}
              </Text>
              <Text style={typography.scientificName} numberOfLines={1}>
                {p.scientificName}
              </Text>
              <View style={styles.libCardFoot}>
                {p.discovered ? (
                  <>
                    <Icon name="location-on" size={13} color={colors.outline} />
                    <Text style={styles.libFootText} numberOfLines={1}>
                      {p.location ?? "Discovered"}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.libFootText}>Undiscovered</Text>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      {list.length === 0 ? (
        <Text style={styles.libEmpty}>No plants found. Try a common name or type.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  toggle: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: 4,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.pill,
  },
  toggleTab: { flex: 1, alignItems: "center", paddingVertical: spacing.sm, borderRadius: radius.pill },
  toggleTabActive: { backgroundColor: colors.surfaceLowest },
  toggleText: { ...typography.badge, color: colors.textMuted },
  toggleTextActive: { color: colors.primary },
  libHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  sortText: { ...typography.badge, color: colors.primary },
  libGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: spacing.md },
  libCard: {
    width: "47.5%",
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.sage,
    overflow: "hidden",
  },
  libCardLocked: { borderStyle: "dashed", borderColor: colors.outlineVariant, backgroundColor: colors.surfaceLow },
  libCardImgWrap: { aspectRatio: 1, backgroundColor: colors.surfaceVariant },
  libCardImg: { width: "100%", height: "100%" },
  libCardSilhouette: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceHigh },
  libRarityPill: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  libRarityText: { ...typography.badge, fontSize: 9, color: colors.onPrimary },
  libStatus: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  libCardBody: { padding: spacing.sm + 2, gap: 2 },
  libCardFoot: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  libFootText: { ...typography.badge, fontSize: 10, color: colors.outline, textTransform: "uppercase", flex: 1 },
  libEmpty: { ...typography.caption, textAlign: "center", paddingVertical: spacing.xl, width: "100%" },
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
