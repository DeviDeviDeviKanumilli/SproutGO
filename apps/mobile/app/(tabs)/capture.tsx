// Capture tab (Stitch Camera Screen). Simulated camera viewfinder: a framing reticle
// over a preview, top close/flash controls, an instruction bubble, and a shutter that
// kicks off the identification flow. Real camera wiring lands in M1.
import { View, Text, StyleSheet, Pressable, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";

const PREVIEW =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=70";

export default function CaptureScreen() {
  const router = useRouter();

  return (
    <ImageBackground source={{ uri: PREVIEW }} style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.topBar}>
        <Pressable style={styles.glassBtn} onPress={() => router.replace("/(tabs)/map")}>
          <Icon name="close" size={24} color={colors.onPrimary} />
        </Pressable>
        <Pressable style={styles.glassBtn}>
          <Icon name="flash-on" size={24} color={colors.onPrimary} />
        </Pressable>
      </SafeAreaView>

      <View style={styles.frameWrap}>
        <View style={styles.frame}>
          <View style={[styles.reticle, styles.tl]} />
          <View style={[styles.reticle, styles.tr]} />
          <View style={[styles.reticle, styles.bl]} />
          <View style={[styles.reticle, styles.br]} />
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.instruction}>
          <Text style={styles.instructionText}>Center your plant</Text>
        </View>
        <View style={styles.controlRow}>
          <Pressable style={styles.glassBtn}>
            <Icon name="photo-library" size={24} color={colors.onPrimary} />
          </Pressable>
          <Pressable style={styles.shutter} onPress={() => router.push("/identify/processing")}>
            <View style={styles.shutterInner}>
              <Icon name="local-florist" size={30} color={colors.onPrimary} />
            </View>
          </Pressable>
          <View style={styles.glassBtn} />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", justifyContent: "space-between" },
  topBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  glassBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  frameWrap: { alignItems: "center", justifyContent: "center" },
  frame: { width: 256, height: 256, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)", borderRadius: radius.button },
  reticle: { position: "absolute", width: 28, height: 28, borderColor: "#fff" },
  tl: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: radius.button },
  tr: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: radius.button },
  bl: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: radius.button },
  br: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: radius.button },
  controls: { alignItems: "center", paddingBottom: spacing.xxl, paddingTop: spacing.lg, backgroundColor: "rgba(0,0,0,0.35)" },
  instruction: { backgroundColor: "rgba(0,0,0,0.6)", borderRadius: radius.pill, paddingHorizontal: 24, paddingVertical: 8, marginBottom: spacing.xl },
  instructionText: { ...typography.caption, color: colors.onPrimary },
  controlRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xxl },
  shutter: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#fff", padding: 4 },
  shutterInner: { flex: 1, borderRadius: 36, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});
