// Forum thread (Stitch Forum Thread). Original post card with image + reactions,
// then a comment list including a nested author reply, and a fixed reply input bar.
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui";
import { forumThread as thread } from "@/lib/mockData";

export default function ForumThread() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color={colors.textMuted} />
        </Pressable>
        <Text style={typography.sectionTitle}>Forum</Text>
        <Icon name="more-vert" size={24} color={colors.textMuted} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.post}>
          <View style={styles.postHead}>
            <View style={styles.author}>
              <Avatar uri={thread.avatarUrl} size={40} />
              <View>
                <Text style={styles.authorName}>{thread.author}</Text>
                <Text style={typography.caption}>{thread.timeAgo}</Text>
              </View>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{thread.tag}</Text>
            </View>
          </View>
          <Text style={[typography.sectionTitle, { marginBottom: spacing.sm }]}>{thread.title}</Text>
          <Text style={[typography.body, { color: colors.textMuted, marginBottom: spacing.md }]}>
            {thread.body}
          </Text>
          <Image source={{ uri: thread.imageUrl }} style={styles.postImage} />
          <View style={styles.reactions}>
            <View style={styles.reaction}>
              <Icon name="thumb-up" size={20} color={colors.textMuted} />
              <Text style={typography.caption}>{thread.likes}</Text>
            </View>
            <View style={styles.reaction}>
              <Icon name="chat-bubble-outline" size={20} color={colors.textMuted} />
              <Text style={typography.caption}>{thread.replies} Replies</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Icon name="flag" size={20} color={colors.textMuted} />
          </View>
        </View>

        <Text style={[typography.body, styles.commentsLabel]}>Comments</Text>
        {thread.comments.map((c) => (
          <View
            key={c.id}
            style={[styles.comment, c.nested && styles.commentNested]}
          >
            <Avatar uri={c.avatarUrl} size={32} />
            <View style={{ flex: 1 }}>
              <View style={styles.commentHead}>
                <View style={styles.commentNameRow}>
                  <Text style={styles.commentName}>{c.author}</Text>
                  {c.isAuthor ? (
                    <View style={styles.authorChip}>
                      <Text style={styles.authorChipText}>Author</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={typography.caption}>{c.timeAgo}</Text>
              </View>
              <Text style={[typography.body, { color: colors.textMuted, marginVertical: spacing.xs }]}>
                {c.body}
              </Text>
              <View style={styles.commentActions}>
                <View style={styles.reaction}>
                  <Icon name="thumb-up" size={16} color={colors.textMuted} />
                  <Text style={typography.caption}>{c.likes}</Text>
                </View>
                <Text style={styles.replyLink}>Reply</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.inputBar}>
        <Icon name="image" size={24} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor={colors.textMuted}
        />
        <Pressable style={styles.postBtn}>
          <Text style={styles.postBtnText}>Post</Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    height: 56,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  post: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.cardLarge,
    borderWidth: 1,
    borderColor: colors.sage,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  postHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: spacing.sm },
  author: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  authorName: { ...typography.body, fontWeight: "600", color: colors.text },
  tag: {
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: { ...typography.badge, color: colors.primary },
  postImage: { width: "100%", height: 200, borderRadius: radius.image, marginBottom: spacing.md, backgroundColor: colors.surfaceVariant },
  reactions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    paddingTop: spacing.sm,
  },
  reaction: { flexDirection: "row", alignItems: "center", gap: 4 },
  commentsLabel: { fontWeight: "600", color: colors.text, marginBottom: spacing.md },
  comment: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  commentNested: { marginLeft: spacing.lg, backgroundColor: colors.surface },
  commentHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  commentNameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  commentName: { ...typography.caption, fontWeight: "600", color: colors.text },
  authorChip: { backgroundColor: colors.mint, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  authorChipText: { fontSize: 10, fontWeight: "700", color: colors.primary, textTransform: "uppercase", letterSpacing: 0.5 },
  commentActions: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  replyLink: { ...typography.caption, fontWeight: "600", color: colors.textMuted },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surfaceLowest,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  postBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  postBtnText: { ...typography.badge, color: colors.onPrimary },
});
