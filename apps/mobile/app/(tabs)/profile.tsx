import { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ProfileWithStats } from "@sproutgo/shared";
import { useAuth } from "@/lib/auth";
import { api, ApiClientError } from "@/lib/api";
import { colors, spacing, radius, typography } from "@/theme";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileWithStats | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "no-profile" | "error">("loading");

  useEffect(() => {
    let active = true;
    api
      .get<ProfileWithStats>("/profile/me")
      .then((p) => active && (setProfile(p), setStatus("ready")))
      .catch((e) => {
        if (!active) return;
        if (e instanceof ApiClientError && e.status === 404) setStatus("no-profile");
        else setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.content}>
        <Text style={typography.largeTitle}>Profile</Text>

        {status === "loading" && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />}

        {status === "ready" && profile && (
          <View style={styles.card}>
            <Text style={typography.sectionTitle}>{profile.username}</Text>
            {profile.bio ? <Text style={typography.body}>{profile.bio}</Text> : null}
            <View style={styles.statsRow}>
              <Stat label="Species" value={profile.stats.speciesDiscovered} />
              <Stat label="Points" value={profile.stats.totalPoints} />
              <Stat label="Photos" value={profile.stats.photosSubmitted} />
            </View>
          </View>
        )}

        {status === "no-profile" && (
          <View style={styles.card}>
            <Text style={typography.body}>You're signed in, but haven't set up a profile yet.</Text>
            <Text style={[typography.caption, { marginTop: spacing.xs }]}>
              Profile creation lands with the onboarding flow.
            </Text>
          </View>
        )}

        {status === "error" && (
          <View style={styles.card}>
            <Text style={[typography.body, { color: colors.danger }]}>
              Couldn't load your profile. Check that the API is running.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={typography.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, flex: 1 },
  card: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.sage,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  statsRow: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.sm },
  stat: { alignItems: "center" },
  statValue: { ...typography.sectionTitle, color: colors.primary },
  signOut: {
    marginTop: "auto",
    borderColor: colors.sage,
    borderWidth: 1,
    borderRadius: radius.button,
    padding: spacing.md,
    alignItems: "center",
  },
  signOutText: { color: colors.danger, fontSize: 16, fontWeight: "600" },
});
