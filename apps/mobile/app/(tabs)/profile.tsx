// Profile tab (Stitch Profile Screen). Avatar header with level badge, a stats bento
// grid, a recent-discoveries horizontal scroller, and PlantDex progress with per-region
// bars. Presentational (mockData); sign-out still calls the real auth hook.
import { ScrollView, View, Text, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon, type IconName } from "@/components/Icon";
import { AppHeader, RarityBadge, SectionTitle } from "@/components/ui";
import { profile, recentDiscoveryIds, plantById } from "@/lib/mockData";

const STATS: { key: string; value: number; label: string; icon: IconName; color: string }[] = [
  { key: "points", value: profile.stats.points, label: "Points", icon: "eco", color: colors.rarity.RARE },
  { key: "species", value: profile.stats.species, label: "Species", icon: "local-florist", color: colors.rarity.COMMON },
  { key: "posts", value: profile.stats.posts, label: "Posts", icon: "photo-library", color: colors.secondary },
  { key: "friends", value: profile.stats.friends, label: "Friends", icon: "group", color: colors.gold },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader
        title="SproutGo"
        right={<Icon name="settings" size={24} color={colors.textMuted} />}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            <View style={styles.levelBadge}>
              <Icon name="star" size={14} color={colors.onPrimaryContainer} />
            </View>
          </View>
          <Text style={[typography.sectionTitle, { marginTop: spacing.md }]}>{profile.username}</Text>
          <Text style={[typography.body, styles.bio]}>{profile.bio}</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </Pressable>
            <Pressable style={styles.shareBtn}>
              <Icon name="share" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.bento}>
          {STATS.map((s) => (
            <View key={s.key} style={styles.statCard}>
              <Icon name={s.icon} size={22} color={s.color} />
              <Text style={styles.statValue}>{s.value.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <SectionTitle action={<Text style={styles.viewAll}>View All</Text>}>Recent Discoveries</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveryRow}>
          {recentDiscoveryIds.map((id) => {
            const p = plantById(id)!;
            return (
              <Pressable key={id} style={styles.discoveryCard} onPress={() => router.push(`/plant/${id}`)}>
                <View style={styles.discoveryImgWrap}>
                  {p.imageUrl ? <Image source={{ uri: p.imageUrl }} style={styles.discoveryImg} /> : null}
                  <View style={styles.discoveryBadge}>
                    <RarityBadge rarity={p.rarity} />
                  </View>
                </View>
                <Text style={[typography.body, { fontWeight: "600" }]} numberOfLines={1}>
                  {p.commonName}
                </Text>
                <Text style={typography.scientificName} numberOfLines={1}>
                  {p.scientificName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionTitle>PlantDex Progress</SectionTitle>
        <View style={styles.progressCard}>
          <View style={styles.progressHead}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
              <Text style={styles.bigPct}>{profile.completionPct}%</Text>
              <Text style={[typography.caption, { marginBottom: 4 }]}>Overall Completion</Text>
            </View>
            <Text style={typography.badge}>
              {profile.dexCount.discovered} / {profile.dexCount.total}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${profile.completionPct}%`, backgroundColor: colors.primary }]} />
          </View>
          {profile.regions.map((r) => {
            const pct = Math.round((r.discovered / r.total) * 100);
            return (
              <View key={r.name} style={{ marginTop: spacing.md }}>
                <View style={styles.regionHead}>
                  <Text style={typography.body}>{r.name}</Text>
                  <Text style={typography.caption}>
                    {r.discovered} / {r.total}
                  </Text>
                </View>
                <View style={styles.trackThin}>
                  <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.rarity[r.rarity] }]} />
                </View>
              </View>
            );
          })}
        </View>

        <Pressable style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  header: { alignItems: "center", marginTop: spacing.lg, marginBottom: spacing.xl },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: colors.surfaceLowest, backgroundColor: colors.surfaceVariant },
  levelBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.gold,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surfaceLowest,
  },
  bio: { color: colors.textMuted, textAlign: "center", marginTop: spacing.sm, maxWidth: 320 },
  headerActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  editBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 24, paddingVertical: 10 },
  editBtnText: { ...typography.body, color: colors.onPrimary, fontWeight: "600" },
  shareBtn: {
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.pill,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  bento: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    flexGrow: 1,
    flexBasis: "45%",
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.cardLarge,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: 2,
  },
  statValue: { ...typography.largeTitle, fontSize: 26, color: colors.text },
  statLabel: { ...typography.badge, color: colors.textMuted, textTransform: "uppercase" },
  viewAll: { ...typography.caption, color: colors.primary },
  discoveryRow: { gap: spacing.md, paddingBottom: spacing.xl },
  discoveryCard: {
    width: 180,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.card,
    padding: spacing.sm,
  },
  discoveryImgWrap: { width: "100%", height: 130, borderRadius: radius.image, overflow: "hidden", marginBottom: spacing.sm, backgroundColor: colors.surfaceVariant },
  discoveryImg: { width: "100%", height: "100%" },
  discoveryBadge: { position: "absolute", top: spacing.sm, left: spacing.sm },
  progressCard: {
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  progressHead: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: spacing.sm },
  bigPct: { ...typography.largeTitle, fontSize: 28, color: colors.primary },
  track: { height: 12, backgroundColor: colors.surfaceVariant, borderRadius: radius.pill, overflow: "hidden" },
  trackThin: { height: 6, backgroundColor: colors.surfaceVariant, borderRadius: radius.pill, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.pill },
  regionHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  signOut: {
    marginTop: spacing.xl,
    borderColor: colors.sage,
    borderWidth: 1,
    borderRadius: radius.button,
    padding: spacing.md,
    alignItems: "center",
  },
  signOutText: { color: colors.danger, fontSize: 16, fontWeight: "600" },
});
