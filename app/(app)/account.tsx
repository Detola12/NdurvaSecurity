import { useSyncExternalStore } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card } from "@/components/ui";
import { useSessionContext } from "@/data/SessionContext";
import { formatCode, subscribeToPasses, usedPasses } from "@/data/verification";
import { colors, radius, spacing } from "@/lib/theme";

/**
 * Account and this shift's activity.
 *
 * Not in the Figma, which has no route out of the app. Added because signing
 * out has to live somewhere, and a guard being asked "did anyone come for 5A?"
 * should not have to call the office. Movements only: names, units, times.
 */
export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useSessionContext();
  const used = useSyncExternalStore(subscribeToPasses, usedPasses, usedPasses);

  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={s.back} hitSlop={8}>
          <Text style={s.backGlyph}>‹</Text>
        </Pressable>
        <Text style={s.title}>Account</Text>
        <View style={s.backSpacer} />
      </View>

      <Card style={s.identity}>
        <Text style={s.name}>{session?.name}</Text>
        <Text style={s.meta}>{session?.property}</Text>
        <Text style={s.meta}>{session?.email}</Text>
        <Text style={s.scope}>This account works at {session?.property} only.</Text>
      </Card>

      <Text style={s.sectionTitle}>This shift</Text>
      {used.length === 0 ? (
        <Text style={s.empty}>No passes used yet.</Text>
      ) : (
        used.map((pass) => (
          <Card key={pass.code} style={s.row}>
            <View style={s.rowBody}>
              <Text style={s.rowName}>{pass.name}</Text>
              <Text style={s.rowMeta}>
                {pass.unit} · {formatCode(pass.code)}
              </Text>
            </View>
            <View style={s.rowTimes}>
              <Text style={[s.rowTime, { color: colors.success }]}>In {pass.checkedInAt ?? "–"}</Text>
              <Text style={[s.rowTime, { color: colors.danger }]}>Out {pass.checkedOutAt ?? "–"}</Text>
            </View>
          </Card>
        ))
      )}

      <Button title="Sign out" variant="outline" style={s.signOut} onPress={() => void signOut()} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, gap: spacing.sm },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  backSpacer: { width: 40 },
  backGlyph: { color: colors.text, fontSize: 26, lineHeight: 28, marginTop: -4 },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },

  identity: { gap: 2, marginTop: spacing.sm },
  name: { color: colors.text, fontSize: 18, fontWeight: "700" },
  meta: { color: colors.textMuted, fontSize: 14 },
  scope: { color: colors.textFaint, fontSize: 12, marginTop: spacing.sm },

  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: spacing.lg },
  empty: { color: colors.textMuted, fontSize: 14, paddingVertical: spacing.md },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  rowBody: { flexShrink: 1, gap: 2 },
  rowName: { color: colors.text, fontSize: 15, fontWeight: "600" },
  rowMeta: { color: colors.textMuted, fontSize: 13 },
  rowTimes: { alignItems: "flex-end", gap: 2 },
  rowTime: { fontSize: 12, fontWeight: "600" },

  signOut: { marginTop: spacing.lg },
});
