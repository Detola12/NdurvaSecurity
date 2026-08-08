import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Field, NdurvaMark } from "@/components/ui";
import { useSessionContext } from "@/data/SessionContext";
import { colors, spacing } from "@/lib/theme";

export default function SignInScreen() {
  const { signIn } = useSessionContext();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign you in. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[s.content, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.brand}>
          <NdurvaMark size={52} />
          <Text style={s.title}>Ndurva Security</Text>
          <Text style={s.subtitle}>Sign in to start verifying at the gate.</Text>
        </View>

        <View style={s.form}>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="guard@ndurva.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            inputMode="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleSignIn}
          />

          {!!error && (
            <View accessibilityLiveRegion="polite" style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Button title="Sign In" onPress={handleSignIn} loading={busy} disabled={!email.trim() || !password} />
        </View>

        <Text style={s.footnote}>
          Your account works at one property only. Ask your facility manager if you cannot get in.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, gap: spacing.xl },
  brand: { alignItems: "center", gap: spacing.sm },
  title: { color: colors.text, fontSize: 26, fontWeight: "700", marginTop: spacing.sm },
  subtitle: { color: colors.textMuted, fontSize: 15, textAlign: "center" },
  form: { gap: spacing.lg },
  errorBox: {
    backgroundColor: colors.denySurface,
    borderColor: colors.deny,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  errorText: { color: "#F8B4B4", fontSize: 14 },
  footnote: { color: colors.textFaint, fontSize: 13, textAlign: "center", marginTop: "auto" },
});
