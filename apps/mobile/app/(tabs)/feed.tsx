// Feed tab (Stitch Feed Screen). Segmented tabs (Discoveries / Friends / Forums).
// Discovery posts show a rarity-badged photo, caption, reactions and a "View Plant"
// CTA. The Forums segment lists categories that route into a thread.
import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { AppHeader, RarityBadge, Avatar } from "@/components/ui";
import { feedPosts, forumCategories, plantById, profile } from "@/lib/mockData";

const SEGMENTS = ["Discoveries", "Friends", "Forums"] as const;

export default function FeedScreen() {
  const router = useRouter();
  const [seg, setSeg] = useState<(typeof SEGMENTS)[number]>("Discoveries");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="SproutGo" avatarUri={profile.avatarUrl} />
      <View style={styles.segmentRow}>
        {SEGMENTS.map((s) => (
          <Pressable
            key={s}
            onPress={() => setSeg(s)}
            style={[styles.segment, seg === s ? styles.segmentActive : styles.segmentIdle]}
          >
            <Text style={[styles.segmentText, { color: seg === s ? colors.onPrimary : colors.textMuted }]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {seg === "Forums"
          ? forumCategories.map((c) => (
              <Pressable key={c.id} style={styles.forumCard} onPress={() => router.push(`/forums/${c.id}`)}>
                <View style={[styles.forumIcon, c.accent && { backgroundColor: colors.gold }]}>
                  <Icon name={c.icon} size={22} color={c.accent ? colors.onPrimary : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { fontWeight: "600", color: colors.text }]}>{c.title}</Text>
                  <Text style={typography.caption} numberOfLines={2}>
                    {c.blurb}
                  </Text>
                  <Text style={[typography.badge, { color: colors.primary, marginTop: 4 }]}>{c.posts}</Text>
                </View>
                <Icon name="chevron-right" size={22} color={colors.textMuted} />
              </Pressable>
            ))
          : feedPosts.map((post) => {
              const plant = plantById(post.plantId)!;
              return (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHead}>
                    <View style={styles.postAuthor}>
                      <Avatar uri={post.avatarUrl} size={40} />
                      <View>
                        <Text style={styles.authorName}>{post.author}</Text>
                        <Text style={typography.caption}>
                          {post.timeAgo} • {post.location}
                        </Text>
                      </View>
                    </View>
                    <Icon name="more-horiz" size={22} color={colors.textMuted} />
                  </View>

                  <View style={styles.imageWrap}>
                    {plant.imageUrl ? <Image source={{ uri: plant.imageUrl }} style={styles.postImage} /> : null}
                    <View style={styles.badgeOverlay}>
                      <RarityBadge rarity={plant.rarity} />
                    </View>
                  </View>

                  <View style={styles.postBody}>
                    <Text style={typography.sectionTitle}>{plant.commonName}</Text>
                    <Text style={typography.scientificName}>{plant.scientificName}</Text>
                    <Text style={[typography.body, { color: colors.textMuted, marginVertical: spacing.sm }]} numberOfLines={2}>
                      {post.caption}
                    </Text>
                    <View style={styles.actions}>
                      <View style={styles.action}>
                        <Icon name="favorite-border" size={22} color={colors.textMuted} />
                        <Text style={typography.caption}>{post.likes}</Text>
                      </View>
                      <View style={styles.action}>
                        <Icon name="chat-bubble-outline" size={20} color={colors.textMuted} />
                        <Text style={typography.caption}>{post.comments}</Text>
                      </View>
                      <View style={{ flex: 1 }} />
                      <Pressable style={styles.viewBtn} onPress={() => router.push(`/plant/${plant.id}`)}>
                        <Text style={styles.viewBtnText}>View Plant</Text>
                        <Icon name="arrow-forward" size={15} color={colors.primary} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
      </ScrollView>

      {seg !== "Forums" ? (
        <Pressable style={styles.fab} onPress={() => router.push("/post/new")}>
          <Icon name="add" size={28} color={colors.onPrimary} />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  segmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  segment: { flex: 1, alignItems: "center", paddingVertical: spacing.sm, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.primary },
  segmentIdle: { backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.sage },
  segmentText: { ...typography.badge },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: 96,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.deep,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  postCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.cardLarge,
    borderWidth: 1,
    borderColor: colors.sage,
    overflow: "hidden",
  },
  postHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  postAuthor: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  authorName: { ...typography.caption, fontWeight: "600", color: colors.text },
  imageWrap: { width: "100%", aspectRatio: 4 / 3, backgroundColor: colors.surfaceVariant },
  postImage: { width: "100%", height: "100%" },
  badgeOverlay: { position: "absolute", top: spacing.md, right: spacing.md },
  postBody: { padding: spacing.md },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    paddingTop: spacing.sm,
  },
  action: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewBtnText: { ...typography.badge, color: colors.primary },
  forumCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.sage,
    padding: spacing.md,
  },
  forumIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.button,
    backgroundColor: colors.mint,
    alignItems: "center",
    justifyContent: "center",
  },
});
