// Create Post (design §15 "Create post"). Shares a discovery: photo + attached plant
// identity, caption, privacy selector. Reached from the Feed/discovery flow.
// Presentational — seeds from a recent discovery; Share routes back to the feed.
import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon, type IconName } from "@/components/Icon";
import { RarityBadge } from "@/components/ui";
import { plantById } from "@/lib/mockData";

const PRIVACY: { key: string; label: string; icon: IconName }[] = [
  { key: "public", label: "Public", icon: "public" },
  { key: "friends", label: "Friends", icon: "group" },
  { key: "private", label: "Private", icon: "lock" },
];

export default function CreatePost() {
  const router = useRouter();
  const plant = plantById("monstera")!;
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState("public");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.back()}>
          <Icon name="close" size={24} color={colors.textMuted} />
        </Pressable>
        <Text style={typography.sectionTitle}>New Discovery Post</Text>
        <Pressable
          hitSlop={8}
          onPress={() => router.replace("/(tabs)/feed")}
          disabled={caption.trim().length === 0}
        >
          <Text style={[styles.share, caption.trim().length === 0 && styles.shareDisabled]}>
            Share
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: plant.imageUrl ?? undefined }} style={styles.photo} />

        <View style={styles.plantRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.plantName}>{plant.commonName}</Text>
            <Text style={typography.scientificName}>{plant.scientificName}</Text>
          </View>
          <RarityBadge rarity={plant.rarity} />
        </View>

        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Share the story of your find…"
          placeholderTextColor={colors.textMuted}
          style={styles.caption}
          multiline
        />

        <Text style={styles.label}>Who can see this?</Text>
        <View style={styles.privacyRow}>
          {PRIVACY.map((p) => {
            const active = privacy === p.key;
            return (
              <Pressable
                key={p.key}
                onPress={() => setPrivacy(p.key)}
                style={[styles.privacyChip, active && styles.privacyChipActive]}
              >
                <Icon name={p.icon} size={18} color={active ? colors.onPrimary : colors.textMuted} />
                <Text style={[styles.privacyText, active && { color: colors.onPrimary }]}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.locationRow}>
          <Icon name="place" size={18} color={colors.primary} />
          <Text style={styles.locationText}>City Park · approximate location</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  share: { ...typography.body, fontWeight: "700", color: colors.primary },
  shareDisabled: { color: colors.textMuted, opacity: 0.5 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radius.image,
    backgroundColor: colors.surfaceVariant,
  },
  plantRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  plantName: { ...typography.sectionTitle },
  caption: {
    ...typography.body,
    minHeight: 96,
    textAlignVertical: "top",
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.sage,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  label: { ...typography.caption, fontWeight: "600", marginTop: spacing.sm },
  privacyRow: { flexDirection: "row", gap: spacing.sm },
  privacyChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.sage,
  },
  privacyChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  privacyText: { ...typography.badge, color: colors.textMuted },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  locationText: { ...typography.caption },
});
