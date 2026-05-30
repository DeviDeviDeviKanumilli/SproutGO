// Plant detail / PlantDex entry (routed from grid, feed, map). Hero image, rarity +
// confidence chips, overview & habitat, and a CTA into the plant chat persona.
import { ScrollView, View, Text, StyleSheet, Pressable, ImageBackground } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { RarityBadge, Card } from "@/components/ui";
import { plantById } from "@/lib/mockData";

export default function PlantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const plant = plantById(String(id));

  if (!plant) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={[typography.body, { padding: spacing.lg }]}>Plant not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={plant.imageUrl ? { uri: plant.imageUrl } : undefined}
          style={styles.hero}
        >
          <View style={styles.heroScrim} />
          <SafeAreaView edges={["top"]} style={styles.heroBar}>
            <Pressable style={styles.circleBtn} onPress={() => router.back()}>
              <Icon name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <Pressable style={styles.circleBtn}>
              <Icon name="share" size={20} color={colors.text} />
            </Pressable>
          </SafeAreaView>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{plant.commonName}</Text>
            <Text style={styles.heroSci}>{plant.scientificName}</Text>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.chipRow}>
            <RarityBadge rarity={plant.rarity} />
            <View style={styles.metaChip}>
              <Icon name="verified" size={15} color={colors.primary} />
              <Text style={styles.metaChipText}>94% Confidence</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="public" size={15} color={colors.secondary} />
              <Text style={styles.metaChipText}>{plant.nativeStatus}</Text>
            </View>
          </View>

          <Card style={styles.section}>
            <Text style={typography.sectionTitle}>Overview</Text>
            <Text style={[typography.body, styles.para]}>{plant.description}</Text>
          </Card>

          <Card style={styles.section}>
            <Text style={typography.sectionTitle}>Habitat</Text>
            <Text style={[typography.body, styles.para]}>{plant.habitat}</Text>
          </Card>

          <Pressable style={styles.chatCta} onPress={() => router.push(`/chat/${plant.id}`)}>
            <Icon name="chat-bubble" size={20} color={colors.onPrimary} />
            <Text style={styles.chatCtaText}>Chat with {plant.commonName}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hero: { height: 320, justifyContent: "space-between", backgroundColor: colors.surfaceVariant },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.15)" },
  heroBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { padding: spacing.lg },
  heroTitle: { ...typography.largeTitle, color: colors.onPrimary, textShadowColor: "rgba(0,0,0,0.4)", textShadowRadius: 6 },
  heroSci: { ...typography.scientificName, color: colors.onPrimary, fontSize: 15 },
  body: { padding: spacing.lg, gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaChipText: { ...typography.caption, color: colors.text },
  section: { padding: spacing.md, gap: spacing.xs, backgroundColor: colors.surfaceLowest },
  para: { color: colors.textMuted },
  chatCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  chatCtaText: { ...typography.body, color: colors.onPrimary, fontWeight: "600" },
});
