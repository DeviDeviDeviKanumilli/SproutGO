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
          <View style={styles.heroBadge}>
            <RarityBadge rarity={plant.rarity} solid />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>{plant.commonName}</Text>
            <Text style={styles.heroSci}>{plant.scientificName}</Text>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.chipRow}>
            <View style={styles.metaChip}>
              <Icon name="grass" size={15} color={colors.secondary} />
              <Text style={styles.metaChipText}>{plant.type}</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="public" size={15} color={colors.secondary} />
              <Text style={styles.metaChipText}>{plant.nativeStatus}</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="verified" size={15} color={colors.primary} />
              <Text style={styles.metaChipText}>94% Confidence</Text>
            </View>
          </View>

          <Pressable style={styles.chatCta} onPress={() => router.push(`/chat/${plant.id}`)}>
            <Icon name="chat-bubble" size={20} color={colors.onPrimary} />
            <Text style={styles.chatCtaText}>Chat with this Plant</Text>
          </Pressable>

          <Card style={styles.section}>
            <Text style={styles.sectionHead}>
              <Icon name="info" size={18} color={colors.primary} /> Overview
            </Text>
            <Text style={[typography.body, styles.para]}>{plant.description}</Text>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionHead}>
              <Icon name="forest" size={18} color={colors.primary} /> Habitat
            </Text>
            <Text style={[typography.body, styles.para]}>{plant.habitat}</Text>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionHead}>
              <Icon name="map" size={18} color={colors.primary} /> Map Sightings
            </Text>
            <View style={styles.mapMini}>
              {[...Array(6)].map((_, i) => (
                <View key={`h${i}`} style={[styles.mapGrid, { top: `${i * 18}%` }]} />
              ))}
              {[...Array(5)].map((_, i) => (
                <View key={`v${i}`} style={[styles.mapGridV, { left: `${i * 22}%` }]} />
              ))}
              <View style={[styles.mapMarker, { backgroundColor: colors.rarity[plant.rarity] }]}>
                <Icon name="eco" size={16} color={colors.onPrimary} />
              </View>
            </View>
            <Text style={[typography.caption, { textAlign: "center", marginTop: spacing.sm }]}>
              Most commonly sighted near its native {(plant.habitat.split(",")[0] ?? plant.habitat).toLowerCase()}.
            </Text>
          </Card>
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
  heroBadge: { position: "absolute", top: 56, right: spacing.md },
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
  sectionHead: { ...typography.sectionTitle, color: colors.primary },
  para: { color: colors.textMuted },
  mapMini: {
    height: 160,
    borderRadius: radius.image,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  mapGrid: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: colors.sage, opacity: 0.4 },
  mapGridV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: colors.sage, opacity: 0.4 },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surfaceLowest,
  },
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
