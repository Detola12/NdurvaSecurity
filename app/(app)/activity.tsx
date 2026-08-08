import { useSyncExternalStore } from "react";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { useSessionContext } from "@/data/SessionContext";
import { formatTime, getLog, subscribeToLog, todayTotals, type GateEvent } from "@/data/verification";
import { colors, radius, spacing } from "@/lib/theme";

/**
 * What has come through the gate on this shift, and the way out of the app.
 *
 * A guard needs to answer "did anyone come for 5A?" without calling the office,
 * so the log is here. It shows movements only: names, units and times. There is
 * nothing else about a tenant to find in this app.
 */
export default function ActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, signOut } = useSessionContext();
  const log = useSyncExternalStore(subscribeToLog, getLog, getLog);
  const totals = todayTotals(log);

  return (
    <View style={[s.flex, { paddingTop: insets.top + spacing.md }]}>
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to scanner" onPress={() => router.back()}>
          <Text style={s.back}>Back</Text>
        </Pressable>
        <Text style={s.title}>Gate activity</Text>
        <View style={s.backSpacer} />
      </View>

      <View style={s.totals}>
        <Stat label="Entries today" value={totals.entries} tone={colors.allow} />
        <Stat label="Exits today" value={totals.exits} tone={colors.deny} />
        <Stat label="Inside now" value={totals.inside} tone={colors.primary} />
      </View>

      <FlatList
        data={log}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[s.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        ListEmptyComponent={<Text style={s.empty}>Nothing logged yet on this shift.</Text>}
        renderItem={({ item }) => <Row event={item} />}
        ListFooterComponent={
          <View style={s.account}>
            <Text style={s.accountName}>{session?.name}</Text>
            <Text style={s.accountMeta}>{session?.property}</Text>
            <Text style={s.accountMeta}>{session?.email}</Text>
            <Button title="Sign out" variant="danger" style={s.signOut} onPress={() => void signOut()} />
          </View>
        }
      />
    </View>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statValue, { color: tone }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ event }: { event: GateEvent }) {
  const entering = event.direction === "Entry";
  return (
    <View style={s.row}>
      <View style={[s.arrow, { backgroundColor: entering ? colors.allowSurface : colors.denySurface }]}>
        <Text style={[s.arrowText, { color: entering ? colors.allow : colors.deny }]}>{entering ? "↓" : "↑"}</Text>
      </View>
      <View style={s.rowBody}>
        <Text style={s.rowName}>{event.name}</Text>
        <Text style={s.rowMeta}>
          {event.unit} · {event.kind}
        </Text>
      </View>
      <Text style={s.rowTime}>{formatTime(event.at)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  back: { color: colors.primary, fontSize: 16, fontWeight: "600", minWidth: 56 },
  backSpacer: { minWidth: 56 },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },

  totals: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
  },
  statValue: { fontSize: 24, fontWeight: "700" },
  statLabel: { color: colors.textMuted, fontSize: 12 },

  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  empty: { color: colors.textMuted, fontSize: 15, textAlign: "center", paddingVertical: spacing.xl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  arrow: { width: 36, height: 36, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  arrowText: { fontSize: 18, fontWeight: "700" },
  rowBody: { flex: 1, gap: 2 },
  rowName: { color: colors.text, fontSize: 16, fontWeight: "600" },
  rowMeta: { color: colors.textMuted, fontSize: 13 },
  rowTime: { color: colors.textMuted, fontSize: 13 },

  account: { marginTop: spacing.xl, gap: 2, alignItems: "center" },
  accountName: { color: colors.text, fontSize: 16, fontWeight: "600" },
  accountMeta: { color: colors.textMuted, fontSize: 13 },
  signOut: { alignSelf: "stretch", marginTop: spacing.lg },
});
