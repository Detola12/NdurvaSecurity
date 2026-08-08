import { useState } from "react";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { colors, radius, spacing } from "@/lib/theme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

/**
 * Typing the code, for when a phone is flat, a screen is cracked, or the sun is
 * on the glass. A guard cannot be left unable to do their job because a camera
 * would not focus, so this is a first-class route rather than a fallback buried
 * in a menu.
 *
 * The keypad is on screen rather than the system keyboard: it is six digits,
 * always, and the targets can be much larger this way.
 */
export default function ManualEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");

  const press = (key: string) => {
    if (key === "del") return setCode((c) => c.slice(0, -1));
    if (!key) return;
    setCode((c) => (c.length >= 6 ? c : c + key));
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[s.content, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={s.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to scanner" onPress={() => router.back()}>
            <Text style={s.back}>Back</Text>
          </Pressable>
          <Text style={s.title}>Enter code</Text>
          <View style={s.backSpacer} />
        </View>

        <View style={s.digits} accessibilityLabel={`Code ${code.split("").join(" ") || "empty"}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[s.digit, i < code.length && s.digitFilled]}>
              <Text style={s.digitText}>{code[i] ?? ""}</Text>
            </View>
          ))}
        </View>

        <View style={s.keypad}>
          {KEYS.map((key, i) => (
            <Pressable
              key={`${key}-${i}`}
              accessibilityRole="button"
              accessibilityLabel={key === "del" ? "Delete" : key || undefined}
              disabled={!key}
              onPress={() => press(key)}
              style={({ pressed }) => [s.key, !key && s.keyBlank, pressed && !!key && s.keyPressed]}
            >
              <Text style={s.keyText}>{key === "del" ? "⌫" : key}</Text>
            </Pressable>
          ))}
        </View>

        <Button
          title="Verify"
          disabled={code.length !== 6}
          onPress={() => router.replace({ pathname: "/(app)/result", params: { code } })}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { color: colors.primary, fontSize: 16, fontWeight: "600", minWidth: 56 },
  backSpacer: { minWidth: 56 },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },

  digits: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, marginTop: spacing.md },
  digit: {
    width: 46,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  digitFilled: { borderColor: colors.primary },
  digitText: { color: colors.text, fontSize: 26, fontWeight: "700" },

  keypad: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.sm, marginTop: "auto" },
  key: {
    width: "30%",
    minHeight: 66,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  keyBlank: { backgroundColor: "transparent", borderColor: "transparent" },
  keyPressed: { backgroundColor: colors.surfaceRaised },
  keyText: { color: colors.text, fontSize: 26, fontWeight: "600" },
});
