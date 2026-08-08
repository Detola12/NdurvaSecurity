import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { useSessionContext } from "@/data/SessionContext";
import { lookupCode } from "@/data/verification";
import { colors, radius, spacing } from "@/lib/theme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"] as const;

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

/**
 * The home screen: type the code.
 *
 * Typing is primary and scanning is the secondary action, per the design. It is
 * also the right way round in practice, since a guest reading a code off a text
 * message is the common case and a printed QR is not.
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useSessionContext();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const press = (key: string) => {
    setError(null);
    if (key === "del") return setCode((c) => c.slice(0, -1));
    setCode((c) => (c.length >= 6 ? c : c + key));
  };

  const submit = async () => {
    if (code.length !== 6 || busy) return;
    setBusy(true);
    const result = await lookupCode(code);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCode("");
    router.push({ pathname: "/(app)/pass", params: { code: result.pass.code } });
  };

  return (
    <View style={s.flex}>
      <View style={[s.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={s.headerText}>
          <Text style={s.greeting}>{greeting()}</Text>
          <Text style={s.property}>{session?.property ?? "Gate"} Security 👋</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account"
          onPress={() => router.push("/(app)/account")}
          style={s.avatar}
          hitSlop={8}
        >
          <Text style={s.avatarText}>{(session?.name ?? "G").slice(0, 1).toUpperCase()}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={s.title}>Enter Access Code</Text>
        <Text style={s.subtitle}>Please enter your 6-digit residential or guest code</Text>

        <View style={s.digits} accessibilityLabel={`Code ${code.split("").join(" ") || "empty"}`}>
          {Array.from({ length: 6 }).map((_, i) => {
            const filled = i < code.length;
            const current = i === code.length;
            return (
              <View
                key={i}
                style={[
                  s.digit,
                  filled && s.digitFilled,
                  current && !error && s.digitCurrent,
                  !!error && s.digitError,
                ]}
              >
                <Text style={[s.digitText, !filled && s.digitPlaceholder]}>{code[i] ?? "–"}</Text>
              </View>
            );
          })}
        </View>

        {!!error && (
          <Text accessibilityLiveRegion="assertive" style={s.error}>
            {error}
          </Text>
        )}

        <View style={s.keypad}>
          {KEYS.map((key) => {
            const isOk = key === "ok";
            const disabled = isOk && (code.length !== 6 || busy);
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key === "del" ? "Delete" : isOk ? "Verify code" : key}
                accessibilityState={{ disabled }}
                disabled={disabled}
                onPress={() => (isOk ? void submit() : press(key))}
                style={({ pressed }) => [
                  s.key,
                  isOk && s.keyOk,
                  disabled && s.keyDisabled,
                  pressed && !disabled && s.keyPressed,
                ]}
              >
                <Text style={[s.keyText, isOk && s.keyTextOk]}>
                  {key === "del" ? "⌫" : isOk ? "✓" : key}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          title="Scan Resident QR Code"
          variant="outline"
          onPress={() => router.push("/(app)/scan")}
        />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.headerDark,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerText: { flexShrink: 1, gap: 2 },
  greeting: { color: colors.onDarkMuted, fontSize: 15 },
  property: { color: colors.onDark, fontSize: 26, fontWeight: "700" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.onDark, fontSize: 16, fontWeight: "700" },

  body: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, gap: spacing.md },
  title: { color: colors.text, fontSize: 20, fontWeight: "700", textAlign: "center" },
  subtitle: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: -spacing.sm },

  digits: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm, marginTop: spacing.sm },
  digit: {
    flex: 1,
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  digitFilled: { borderColor: colors.primary, backgroundColor: colors.card },
  digitCurrent: { borderColor: colors.primary, borderWidth: 2 },
  digitError: { borderColor: colors.danger },
  digitText: { color: colors.text, fontSize: 18, fontWeight: "600" },
  digitPlaceholder: { color: colors.textFaint, fontWeight: "400" },

  error: { color: colors.danger, fontSize: 14, textAlign: "center", fontWeight: "600" },

  keypad: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  key: {
    width: "31.5%",
    height: 66,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  keyPressed: { backgroundColor: colors.primarySoft },
  keyOk: { backgroundColor: colors.primary, borderColor: colors.primary },
  keyDisabled: { opacity: 0.45 },
  keyText: { color: colors.text, fontSize: 22, fontWeight: "600" },
  keyTextOk: { color: colors.onDark, fontSize: 24 },
});
