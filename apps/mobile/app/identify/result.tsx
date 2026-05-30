// Discovery reward screen — the celebratory moment after identification. A hexagon
// badge holds the plant photo, a gold points pill animates in, and CTAs route to the
// PlantDex entry or sharing. Presentational; data from mockData.identifyResult.
import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { HexBadge } from "@/components/HexBadge";
import { RarityBadge } from "@/components/ui";
import { plantById, identifyResult } from "@/lib/mockData";

export default function IdentifyResult() {
  const router = useRouter();
  const plant = plantById(identifyResult.plantId)!;
  const pop = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [pop, slide]);

  return (
    <View style={styles.root}>
      <ImageBackground
        source={plant.imageUrl ? { uri: plant.imageUrl } : undefined}
        style={StyleSheet.absoluteFill}
        blurRadius={2}
      >
        <View style={styles.scrim} />
      </ImageBackground>

      <SafeAreaView edges={["top"]} style={styles.closeWrap}>
        <Pressable style={styles.closeBtn} onPress={() => router.replace("/(tabs)/plantdex")}>
          <Icon name="close" size={22} color={colors.text} />
        </Pressable>
      </SafeAreaView>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
        <View style={styles.handle} />
        <Animated.View style={{ transform: [{ scale: pop }], marginBottom: spacing.lg }}>
          <HexBadge imageUrl={plant.imageUrl} rarity={plant.rarity} size={140} />
        </Animated.View>

        <View style={styles.pointsPill}>
          <Icon name="stars" size={16} color={colors.onPrimary} />
          <Text style={styles.pointsText}>+{identifyResult.points} Points</Text>
        </View>

        <Text style={styles.kicker}>
          {identifyResult.isFirstDiscovery ? "New species!" : "Congrats! You discovered"}
        </Text>
        <Text style={styles.title}>{plant.commonName}</Text>
        <Text style={[typography.scientificName, { fontSize: 15, color: colors.secondary }]}>
          {plant.scientificName}
        </Text>

        <View style={styles.metaRow}>
          <RarityBadge rarity={plant.rarity} />
          <View style={styles.metaChip}>
            <Icon name="verified" size={15} color={colors.primary} />
            <Text style={styles.metaChipText}>
              {Math.round(identifyResult.confidence * 100)}% Confidence
            </Text>
          </View>
        </View>

        <View style={styles.about}>
          <Text style={typography.sectionTitle}>About This Plant</Text>
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
            {plant.description}
          </Text>
        </View>

        <Pressable style={styles.primaryBtn} onPress={() => router.replace(`/plant/${plant.id}`)}>
          <Icon name="menu-book" size={20} color={colors.onPrimary} />
          <Text style={styles.primaryText}>View PlantDex Entry</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn}>
          <Icon name="ios-share" size={20} color={colors.primary} />
          <Text style={styles.secondaryText}>Share Discovery</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  closeWrap: { position: "absolute", top: 0, right: 0, left: 0, zIndex: 20, alignItems: "flex-end", padding: spacing.lg },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    marginTop: "auto",
    backgroundColor: colors.surfaceLowest,
    borderTopLeftRadius: radius.modal,
    borderTopRightRadius: radius.modal,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: "center",
  },
  handle: {
    position: "absolute",
    top: spacing.md,
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant,
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  pointsText: { ...typography.badge, color: colors.onPrimary },
  kicker: { ...typography.badge, color: colors.gold, textTransform: "uppercase", marginBottom: spacing.xs },
  title: { ...typography.largeTitle, fontSize: 30 },
  metaRow: { flexDirection: "row", gap: spacing.sm, marginVertical: spacing.lg },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaChipText: { ...typography.caption, color: colors.text },
  about: {
    width: "100%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.button,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    width: "100%",
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    marginBottom: spacing.sm,
  },
  primaryText: { ...typography.body, color: colors.onPrimary, fontWeight: "600" },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    width: "100%",
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.sage,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  secondaryText: { ...typography.body, color: colors.primary, fontWeight: "600" },
});
