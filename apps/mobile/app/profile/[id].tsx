// Friend profile (design §8.16). Public view of another explorer: header, stats,
// recent discoveries, PlantDex progress. Presentational — looks the friend up in
// mockData; falls back gracefully if not found.
import { ScrollView, View, Text, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { RarityBadge, SectionTitle } from "@/components/ui";
import {
  friends,
  friendRequests,
  suggestedFriends,
  recentDiscoveryIds,
  plantById,
} from "@/lib/mockData";

const ALL = [...friends, ...friendRequests, ...suggestedFriends];

export default function FriendProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const friend = ALL.find((f) => f.id === String(id));

  if (!friend) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={colors.textMuted} />
          </Pressable>
          <Text style={typography.sectionTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={[typography.body, { padding: spacing.lg }]}>Explorer not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.textMuted} />
        </Pressable>
        <Text style={typography.sectionTitle}>Profile</Text>
        <Icon name="more-vert" size={24} color={colors.textMuted} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Image source={{ uri: friend.avatarUrl }} style={styles.avatar} />
          <Text style={[typography.sectionTitle, { marginTop: spacing.md }]}>{friend.name}</Text>
          <Text style={typography.caption}>{friend.username}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.primaryBtn}>
              <Icon name="person-add" size={18} color={colors.onPrimary} />
              <Text style={styles.primaryText}>Add Friend</Text>
            </Pressable>
            <Pressable style={styles.ghostBtn}>
              <Icon name="chat-bubble-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.statRow}>
          <Stat value={friend.species} label="Species" />
          <Stat value={friend.mutuals ?? 0} label="Mutual" />
          <Stat value={Math.round(friend.species * 14)} label="Points" />
        </View>

        <SectionTitle>Recent Discoveries</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveryRow}>
          {recentDiscoveryIds.map((pid) => {
            const p = plantById(pid)!;
            return (
              <Pressable key={pid} style={styles.discoveryCard} onPress={() => router.push(`/plant/${pid}`)}>
                <View style={styles.discoveryImgWrap}>
                  {p.imageUrl ? <Image source={{ uri: p.imageUrl }} style={styles.discoveryImg} /> : null}
                  <View style={styles.discoveryBadge}>
                    <RarityBadge rarity={p.rarity} />
                  </View>
                </View>
                <Text style={[typography.body, { fontWeight: "600" }]} numberOfLines={1}>
                  {p.commonName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: spacing.md,
  },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  top: { alignItems: "center", marginTop: spacing.md, marginBottom: spacing.xl },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 4, borderColor: colors.surfaceLowest, backgroundColor: colors.surfaceVariant },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  primaryText: { ...typography.body, color: colors.onPrimary, fontWeight: "600" },
  ghostBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.sage,
    backgroundColor: colors.surfaceLowest,
    alignItems: "center",
    justifyContent: "center",
  },
  statRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.sage,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  statValue: { ...typography.sectionTitle },
  statLabel: { ...typography.caption },
  discoveryRow: { gap: spacing.md, paddingBottom: spacing.sm },
  discoveryCard: { width: 150 },
  discoveryImgWrap: { borderRadius: radius.image, overflow: "hidden", marginBottom: spacing.sm },
  discoveryImg: { width: "100%", height: 110, backgroundColor: colors.surfaceVariant },
  discoveryBadge: { position: "absolute", top: spacing.sm, left: spacing.sm },
});
