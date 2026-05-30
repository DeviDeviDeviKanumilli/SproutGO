// Plant chat — converse with a plant's "persona guide" (Stitch Plant Chat). Header
// shows the species, messages alternate plant/user bubbles (plant can send images),
// and suggestion chips seed questions. Input is presentational only.
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius, typography } from "@/theme";
import { Icon } from "@/components/Icon";
import { plantById, chatMessages, chatSuggestions } from "@/lib/mockData";

export default function PlantChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const plant = plantById(String(id));
  const [draft, setDraft] = useState("");
  const name = plant?.commonName ?? "Plant";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.circleBtn} onPress={() => router.back()}>
          <Icon name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{name}</Text>
          {plant ? <Text style={typography.scientificName}>{plant.scientificName}</Text> : null}
        </View>
        <View style={styles.guideBadge}>
          <Icon name="water-drop" size={20} color={colors.primaryContainer} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
          <View style={styles.introBadge}>
            <Icon name="eco" size={15} color={colors.primaryContainer} />
            <Text style={styles.introText}>Chatting with a Calm Swamp Guide</Text>
          </View>

          {chatMessages.map((m) => {
            const mine = m.from === "user";
            return (
              <View key={m.id} style={[styles.row, mine ? styles.rowEnd : styles.rowStart]}>
                <View style={{ maxWidth: "85%", alignItems: mine ? "flex-end" : "flex-start" }}>
                  {m.imageUrl ? (
                    <View style={[styles.bubble, styles.bubblePlant, { padding: spacing.sm }]}>
                      <Image source={{ uri: m.imageUrl }} style={styles.bubbleImg} />
                    </View>
                  ) : (
                    <View style={[styles.bubble, mine ? styles.bubbleUser : styles.bubblePlant]}>
                      <Text style={[typography.body, mine && { color: colors.onPrimary }]}>{m.text}</Text>
                    </View>
                  )}
                  <Text style={[styles.time, mine ? styles.timeEnd : styles.timeStart]}>{m.time}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestRow}>
            {chatSuggestions.map((s) => (
              <Pressable key={s} style={styles.suggestChip} onPress={() => setDraft(s)}>
                <Text style={styles.suggestText}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={`Ask the ${name}...`}
              placeholderTextColor={colors.outline}
              value={draft}
              onChangeText={setDraft}
              multiline
            />
            <Pressable style={styles.sendBtn}>
              <Icon name="send" size={20} color={colors.onPrimary} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceLowest },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 64,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
  },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { ...typography.sectionTitle, color: colors.primary },
  guideBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  messages: { padding: spacing.md, gap: spacing.lg },
  introBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  introText: { ...typography.caption, color: colors.textMuted },
  row: { width: "100%", flexDirection: "row" },
  rowStart: { justifyContent: "flex-start" },
  rowEnd: { justifyContent: "flex-end" },
  bubble: { padding: spacing.md, borderRadius: 20 },
  bubblePlant: { backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.sage, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.primary, borderTopRightRadius: 4 },
  bubbleImg: { width: 220, height: 150, borderRadius: radius.image, backgroundColor: colors.surfaceVariant },
  time: { ...typography.scientificName, fontStyle: "normal" },
  timeStart: { marginLeft: spacing.sm },
  timeEnd: { marginRight: spacing.sm },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  suggestRow: { gap: spacing.sm, paddingBottom: spacing.xs },
  suggestChip: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestText: { ...typography.caption, color: colors.textMuted },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.sage,
    borderRadius: radius.sheet,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    maxHeight: 120,
  },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});
