// AI processing screen — shown after capture while the species is identified.
// Animated scan line sweeps the captured photo; corner reticles + spinner give the
// "analyzing" feel. Auto-advances to the result reward screen after a beat.
import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Easing, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";

const CAPTURED =
  "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=70";

export default function Processing() {
  const router = useRouter();
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(scan, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    const t = setTimeout(() => router.replace("/identify/result"), 2600);
    return () => {
      loop.stop();
      clearTimeout(t);
    };
  }, [router, scan]);

  const translateY = scan.interpolate({ inputRange: [0, 1], outputRange: [0, 360] });

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={styles.closeBtn} onPress={() => router.back()}>
        <Icon name="close" size={22} color={colors.textMuted} />
      </Pressable>

      <View style={styles.center}>
        <View style={styles.photoCard}>
          <Image source={{ uri: CAPTURED }} style={styles.photo} />
          <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
          <View style={[styles.reticle, styles.tl]} />
          <View style={[styles.reticle, styles.tr]} />
          <View style={[styles.reticle, styles.bl]} />
          <View style={[styles.reticle, styles.br]} />
        </View>

        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        <Text style={[typography.sectionTitle, { marginTop: spacing.md }]}>Analyzing Specimen</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Cross-referencing PlantDex database...
        </Text>

        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Ensure the leaf structure is clearly visible for accurate identification.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceLowest },
  closeBtn: {
    position: "absolute",
    top: 48,
    left: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceLowest,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  photoCard: {
    width: 288,
    height: 360,
    borderRadius: radius.sheet,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.surfaceHigh,
    backgroundColor: colors.surfaceVariant,
  },
  photo: { width: "100%", height: "100%" },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  reticle: { position: "absolute", width: 24, height: 24, borderColor: colors.primary },
  tl: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  hint: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.surfaceHigh,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxWidth: 280,
  },
  hintText: { ...typography.caption, color: colors.secondary, textAlign: "center" },
});
