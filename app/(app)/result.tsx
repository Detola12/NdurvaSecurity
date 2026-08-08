import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, DetailRow } from "@/components/ui";
import { recordMovement, verifyCode, type Direction, type VerificationResult } from "@/data/verification";
import { colors, radius, spacing } from "@/lib/theme";

/**
 * The answer, and the only screen that matters.
 *
 * Allowed or denied has to be readable at a glance, in the dark, at arm's
 * length, which is why the verdict is a full-width colour band and not a small
 * status chip. A denial says why in plain words, because the guard reads it out.
 *
 * The movement is logged only after the guard says which way the person went.
 * Verifying a code is not the same as someone walking through a gate, and the
 * log should record what happened rather than what was checked.
 */
export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [logged, setLogged] = useState<Direction | null>(null);

  useEffect(() => {
    let live = true;
    void verifyCode(code ?? "").then((r) => {
      if (!live) return;
      setResult(r);
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(
          r.outcome === "allowed" ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
        );
      }
    });
    return () => {
      live = false;
    };
  }, [code]);

  const done = () => router.replace("/(app)/scan");

  const log = (direction: Direction) => {
    if (result?.outcome !== "allowed") return;
    recordMovement(result, direction);
    setLogged(direction);
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!result) {
    return (
      <View style={[s.flex, s.centre]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={s.checking}>Checking code…</Text>
      </View>
    );
  }

  const allowed = result.outcome === "allowed";

  return (
    <View style={s.flex}>
      <View
        style={[
          s.verdict,
          { paddingTop: insets.top + spacing.xl },
          allowed ? s.verdictAllow : s.verdictDeny,
        ]}
        accessibilityLiveRegion="assertive"
      >
        <Text style={s.verdictGlyph}>{allowed ? "✓" : "✕"}</Text>
        <Text style={s.verdictText}>{allowed ? "Allow entry" : "Do not allow"}</Text>
      </View>

      <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + spacing.lg }]}>
        {allowed ? (
          <>
            <View style={s.identity}>
              <Text style={s.name}>{result.name}</Text>
              <View style={[s.kindTag, result.kind === "Visitor" && s.kindTagVisitor]}>
                <Text style={s.kindText}>{result.kind}</Text>
              </View>
            </View>

            <View style={s.details}>
              <DetailRow label="Unit" value={result.unit} />
              {!!result.host && <DetailRow label="Visiting" value={result.host} />}
              {result.members !== undefined && (
                <DetailRow label="Registered people" value={String(result.members)} />
              )}
              {!!result.validUntil && <DetailRow label="Valid until" value={result.validUntil} />}
              <DetailRow label="Code" value={result.code} />
            </View>

            {logged ? (
              <View style={s.loggedBox}>
                <Text style={s.loggedText}>{logged} logged for {result.name}.</Text>
              </View>
            ) : (
              <Text style={s.prompt}>Which way are they going?</Text>
            )}

            <View style={s.actions}>
              {logged ? (
                <Button title="Scan next" onPress={done} />
              ) : (
                <>
                  <Button title="Log entry" onPress={() => log("Entry")} />
                  <Button title="Log exit" variant="secondary" onPress={() => log("Exit")} />
                  <Button title="Skip, just checking" variant="ghost" onPress={done} />
                </>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={s.denyBox}>
              <Text style={s.denyReason}>{result.reason}</Text>
              <Text style={s.denyCode}>Code checked: {result.code || "none"}</Text>
            </View>
            <Text style={s.denyHelp}>
              Nothing is logged for a code that does not pass. If the person insists they are expected, ask them to
              call the resident and have a new pass sent.
            </Text>
            <View style={s.actions}>
              <Button title="Scan again" onPress={done} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centre: { alignItems: "center", justifyContent: "center", gap: spacing.md },
  checking: { color: colors.textMuted, fontSize: 16 },

  verdict: { alignItems: "center", paddingBottom: spacing.xl, gap: spacing.sm },
  verdictAllow: { backgroundColor: colors.allow },
  verdictDeny: { backgroundColor: colors.deny },
  verdictGlyph: { color: "#FFFFFF", fontSize: 56, fontWeight: "700" },
  verdictText: { color: "#FFFFFF", fontSize: 28, fontWeight: "700" },

  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg },
  identity: { alignItems: "center", gap: spacing.sm },
  name: { color: colors.text, fontSize: 26, fontWeight: "700", textAlign: "center" },
  kindTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.allowSurface,
  },
  kindTagVisitor: { backgroundColor: colors.warnSurface },
  kindText: { color: colors.text, fontSize: 13, fontWeight: "700" },

  details: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },

  prompt: { color: colors.textMuted, fontSize: 15, textAlign: "center" },
  loggedBox: {
    backgroundColor: colors.allowSurface,
    borderColor: colors.allow,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  loggedText: { color: "#86EFAC", fontSize: 15, textAlign: "center", fontWeight: "600" },

  denyBox: {
    backgroundColor: colors.denySurface,
    borderColor: colors.deny,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  denyReason: { color: "#FCA5A5", fontSize: 17, lineHeight: 24, fontWeight: "600" },
  denyCode: { color: colors.textMuted, fontSize: 13 },
  denyHelp: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },

  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
