import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Field, NdurvaLogo } from "@/components/ui";
import { useSessionContext } from "@/data/SessionContext";
import { colors, radius, spacing } from "@/lib/theme";

export default function SignInScreen() {
  const { signIn } = useSessionContext();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
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
        contentContainerStyle={[
          s.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <NdurvaLogo height={34} />

        <View style={s.intro}>
          <Text style={s.title}>Welcome back.</Text>
          <Text style={s.subtitle}>Log in to your account</Text>
        </View>

        <Field
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="johndoe@email.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />

        <View>
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!reveal}
            autoCapitalize="none"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleSignIn}
            style={s.passwordInput}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={reveal ? "Hide password" : "Show password"}
            onPress={() => setReveal((r) => !r)}
            style={s.reveal}
            hitSlop={10}
          >
            <Text style={s.revealGlyph}>{reveal ? "🙈" : "👁"}</Text>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" style={s.forgotWrap} onPress={() => setError("Ask your facility manager to reset your password.")}>
          <Text style={s.forgot}>Forgot password?</Text>
        </Pressable>

        {!!error && (
          <View accessibilityLiveRegion="polite" style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <Button title="Log In" onPress={handleSignIn} loading={busy} disabled={!email.trim() || !password} />

        <View style={s.divider}>
          <View style={s.rule} />
          <Text style={s.dividerText}>Or</Text>
          <View style={s.rule} />
        </View>

        {/* Biometric sign in is in the design but needs a real token to unlock,
            so it is disabled until the API exists rather than pretending. */}
        <Button
          title="Use Face ID / Fingerprint"
          variant="outline"
          disabled
          onPress={() => {}}
        />
        <Text style={s.biometricNote}>Available once your account has been set up on this device.</Text>

        <Text style={s.signup}>
          Don&apos;t have an account? <Text style={s.signupLink}>Sign up</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: spacing.md, gap: spacing.md },
  intro: { gap: 2, marginTop: spacing.sm },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" },
  subtitle: { color: colors.textMuted, fontSize: 15 },

  passwordInput: { paddingRight: 48 },
  reveal: { position: "absolute", right: 14, bottom: 15 },
  revealGlyph: { fontSize: 18 },

  forgotWrap: { alignSelf: "flex-end" },
  forgot: { color: colors.primary, fontSize: 14, fontWeight: "600" },

  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: 14 },

  divider: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginVertical: spacing.xs },
  rule: { flex: 1, height: 1, backgroundColor: colors.borderStrong },
  dividerText: { color: colors.textMuted, fontSize: 14 },

  biometricNote: { color: colors.textFaint, fontSize: 12, textAlign: "center", marginTop: -spacing.sm },

  signup: { color: colors.textMuted, fontSize: 14, textAlign: "center", marginTop: "auto", paddingTop: spacing.lg },
  signupLink: { color: colors.primary, fontWeight: "600" },
});
