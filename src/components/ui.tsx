import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type ViewProps,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, radius, spacing } from "@/lib/theme";

/** The Ndurva mark. The wordmark is left out: it does not read at this size. */
export function NdurvaMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={(size * 51) / 45} height={size} viewBox="0 0 51 45" fill="none">
      <Path
        d="M2.58139 32.7193C2.58139 32.7193 2.25727 16.9641 2.58194 13.5532C2.9066 10.1423 3.74383 8.28258 6.15486 5.91923C8.54667 3.57474 10.0531 2.83285 13.3015 2.50794C16.55 2.18304 18.6616 2.99178 20.7731 4.13246C24.3464 6.24205 37.1779 26.87 37.1779 26.87"
        stroke={colors.primary}
        strokeWidth={4.87274}
        strokeLinecap="round"
      />
      <Path
        d="M16.3367 17.6305C16.3367 17.6305 26.7179 33.1527 29.5444 36.1235C32.3709 39.0943 33.3588 39.5037 37.0153 40.1854C40.6426 40.8617 43.5116 39.2105 45.4614 37.0994C47.4111 34.9882 48.5475 31.0904 48.5473 29.6281C48.5471 28.1658 48.0608 13.8731 48.0608 13.8731"
        stroke={colors.primary}
        strokeWidth={4.87274}
        strokeLinecap="round"
      />
    </Svg>
  );
}

interface ButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
}

export function Button({ title, variant = "primary", loading, disabled, style, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      // The state object is passed straight through rather than rebuilt, so
      // this does not have to track what fields Pressable reports per platform.
      style={(state) => [
        s.button,
        variant === "primary" && s.buttonPrimary,
        variant === "secondary" && s.buttonSecondary,
        variant === "ghost" && s.buttonGhost,
        variant === "danger" && s.buttonDanger,
        state.pressed && !isDisabled && s.buttonPressed,
        isDisabled && s.buttonDisabled,
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? colors.text : "#FFFFFF"} />
      ) : (
        <Text style={[s.buttonText, variant === "ghost" && s.buttonTextGhost]}>{title}</Text>
      )}
    </Pressable>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Field = forwardRef<TextInput, FieldProps>(({ label, error, style, ...rest }, ref) => (
  <View style={s.field}>
    <Text style={s.fieldLabel}>{label}</Text>
    <TextInput
      ref={ref}
      accessibilityLabel={label}
      placeholderTextColor={colors.textFaint}
      style={[s.input, !!error && s.inputError, style]}
      {...rest}
    />
    {!!error && <Text style={s.fieldError}>{error}</Text>}
  </View>
));
Field.displayName = "Field";

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[s.card, style]} {...rest} />;
}

/** A label and value on one line, as used on the verification result. */
export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
  buttonGhost: { backgroundColor: "transparent" },
  buttonDanger: { backgroundColor: colors.deny },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  buttonTextGhost: { color: colors.textMuted, fontWeight: "500" },

  field: { gap: spacing.sm },
  fieldLabel: { color: colors.textMuted, fontSize: 14, fontWeight: "500" },
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 17,
  },
  inputError: { borderColor: colors.deny },
  fieldError: { color: colors.deny, fontSize: 13 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  detailLabel: { color: colors.textMuted, fontSize: 15 },
  detailValue: { color: colors.text, fontSize: 15, fontWeight: "600", flexShrink: 1, textAlign: "right" },
});
