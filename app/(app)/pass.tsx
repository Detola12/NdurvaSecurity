import { useSyncExternalStore } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card } from "@/components/ui";
import { checkIn, checkOut, formatCode, getPass, subscribeToPasses } from "@/data/verification";
import { colors, radius, spacing } from "@/lib/theme";

/**
 * The pass, once a code has been accepted.
 *
 * Check In and Check Out are separate deliberate actions rather than something
 * that happens on verification, because looking a code up is not the same as
 * someone walking through the gate. Each stays available until it is used, and
 * a one-way pass offers no check out at all.
 */
export default function PassScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code?: string }>();

  // Reads through the store so the two stat boxes update the moment either
  // action is taken, without this screen holding its own copy.
  const pass = useSyncExternalStore(
    subscribeToPasses,
    () => getPass(code ?? ""),
    () => getPass(code ?? ""),
  );

  if (!pass) {
    return (
      <View style={[s.flex, s.centre, { paddingTop: insets.top }]}>
        <Text style={s.missing}>That pass is no longer available.</Text>
        <Button title="Back to keypad" variant="outline" onPress={() => router.replace("/(app)")} />
      </View>
    );
  }

  const act = (fn: (c: string) => void) => {
    fn(pass.code);
    if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => router.replace("/(app)")}
        style={s.back}
        hitSlop={8}
      >
        <Text style={s.backGlyph}>‹</Text>
      </Pressable>

      <Card style={s.card}>
        <Text style={s.name}>{pass.name}</Text>
        <Text style={s.meta}>
          {pass.direction} · {pass.createdAt}
        </Text>

        <View style={s.codeBox}>
          <Text style={s.codeLabel}>Access Code</Text>
          <Text style={s.code}>{formatCode(pass.code)}</Text>
          <Text style={s.codeExpiry}>{pass.expiresAt}</Text>
        </View>

        <View style={s.stats}>
          <View style={[s.stat, s.statIn]}>
            <Text style={[s.statLabel, { color: colors.success }]}>Checked in</Text>
            <Text style={s.statValue}>{pass.checkedInAt ?? "–"}</Text>
          </View>
          <View style={[s.stat, s.statOut]}>
            <Text style={[s.statLabel, { color: colors.danger }]}>Checked out</Text>
            <Text style={s.statValue}>{pass.checkedOutAt ?? "–"}</Text>
          </View>
        </View>
      </Card>

      <View style={s.actions}>
        <Button
          title={pass.checkedInAt ? `Checked in at ${pass.checkedInAt}` : "Check In"}
          disabled={!!pass.checkedInAt}
          onPress={() => act(checkIn)}
        />
        {/* A one-way pass has no exit to record, so the action is not offered. */}
        {pass.direction === "Two-way" && (
          <Button
            title={pass.checkedOutAt ? `Checked out at ${pass.checkedOutAt}` : "Check Out"}
            variant="outline"
            disabled={!pass.checkedInAt || !!pass.checkedOutAt}
            onPress={() => act(checkOut)}
          />
        )}
        {pass.direction === "Two-way" && !pass.checkedInAt && (
          <Text style={s.hint}>Check out becomes available once they have been checked in.</Text>
        )}
        <Button title="Done" variant="ghost" onPress={() => router.replace("/(app)")} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centre: { alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  missing: { color: colors.textMuted, fontSize: 16, textAlign: "center" },
  content: { paddingHorizontal: spacing.md, gap: spacing.md },

  back: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  backGlyph: { color: colors.text, fontSize: 26, lineHeight: 28, marginTop: -4 },

  card: { gap: spacing.sm, padding: spacing.lg },
  name: { color: colors.text, fontSize: 20, fontWeight: "700" },
  meta: { color: colors.textMuted, fontSize: 14 },

  codeBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: 2,
    marginTop: spacing.sm,
  },
  codeLabel: { color: colors.textMuted, fontSize: 13 },
  code: { color: colors.primary, fontSize: 26, fontWeight: "700", letterSpacing: 1 },
  codeExpiry: { color: colors.textMuted, fontSize: 12 },

  stats: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  stat: { flex: 1, borderRadius: radius.md, borderWidth: 1, paddingVertical: spacing.md, alignItems: "center", gap: 2 },
  statIn: { backgroundColor: colors.successSoft, borderColor: "#BBF7D0" },
  statOut: { backgroundColor: colors.dangerSoft, borderColor: "#FECACA" },
  statLabel: { fontSize: 13, fontWeight: "700" },
  statValue: { color: colors.text, fontSize: 14 },

  actions: { gap: spacing.sm, marginTop: spacing.sm },
  hint: { color: colors.textMuted, fontSize: 13, textAlign: "center" },
});
