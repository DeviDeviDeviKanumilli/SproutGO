// Friends screen (design §8.16). Segmented Friends / Requests, a search bar to find
// users, and per-row actions. Presentational (mockData); routes into friend profiles.
import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui";
import { friends, friendRequests, suggestedFriends, type Friend } from "@/lib/mockData";

const SEGMENTS = ["Friends", "Requests"] as const;

export default function Friends() {
  const router = useRouter();
  const [seg, setSeg] = useState<(typeof SEGMENTS)[number]>("Friends");
  const [query, setQuery] = useState("");

  const list = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.username.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.textMuted} />
        </Pressable>
        <Text style={typography.sectionTitle}>Friends</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchRow}>
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search explorers"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.segmentRow}>
        {SEGMENTS.map((s) => {
          const active = seg === s;
          const count = s === "Requests" ? friendRequests.length : friends.length;
          return (
            <Pressable
              key={s}
              onPress={() => setSeg(s)}
              style={[styles.segment, active && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {s} {count > 0 ? `(${count})` : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {seg === "Friends" ? (
          <>
            {list.map((f) => (
              <FriendRow key={f.id} friend={f} onPress={() => router.push(`/profile/${f.id}`)} />
            ))}
            {list.length === 0 ? (
              <Text style={styles.empty}>No friends found.</Text>
            ) : null}

            <Text style={styles.subhead}>Suggested for you</Text>
            {suggestedFriends.map((f) => (
              <FriendRow key={f.id} friend={f} action="add" />
            ))}
          </>
        ) : (
          <>
            {friendRequests.map((f) => (
              <FriendRow key={f.id} friend={f} action="respond" />
            ))}
            {friendRequests.length === 0 ? (
              <Text style={styles.empty}>No incoming requests.</Text>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FriendRow({
  friend,
  action,
  onPress,
}: {
  friend: Friend;
  action?: "add" | "respond";
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Avatar uri={friend.avatarUrl} size={48} />
      <View style={styles.rowBody}>
        <Text style={styles.rowName}>{friend.name}</Text>
        <Text style={styles.rowMeta}>
          {friend.species} species{friend.mutuals ? ` · ${friend.mutuals} mutual` : ""}
        </Text>
      </View>
      {action === "add" ? (
        <Pressable style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      ) : action === "respond" ? (
        <View style={styles.respondRow}>
          <Pressable style={styles.acceptBtn}>
            <Icon name="check" size={20} color={colors.onPrimary} />
          </Pressable>
          <Pressable style={styles.rejectBtn}>
            <Icon name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <Icon name="chevron-right" size={24} color={colors.textMuted} />
      )}
    </Pressable>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.sage,
    borderWidth: 1,
    borderRadius: radius.pill,
  },
  searchInput: { flex: 1, ...typography.body, paddingVertical: 0 },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.sage,
  },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentText: { ...typography.badge, color: colors.textMuted },
  segmentTextActive: { color: colors.onPrimary },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  subhead: { ...typography.caption, fontWeight: "600", marginTop: spacing.lg, marginBottom: spacing.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowBody: { flex: 1 },
  rowName: { ...typography.body, fontWeight: "600" },
  rowMeta: { ...typography.caption },
  addBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  addBtnText: { ...typography.badge, color: colors.onPrimary },
  respondRow: { flexDirection: "row", gap: spacing.sm },
  acceptBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { ...typography.caption, textAlign: "center", paddingVertical: spacing.xl },
});
