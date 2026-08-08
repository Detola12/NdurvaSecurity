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

const MARK_1 =
  "M2.58139 32.7193C2.58139 32.7193 2.25727 16.9641 2.58194 13.5532C2.9066 10.1423 3.74383 8.28258 6.15486 5.91923C8.54667 3.57474 10.0531 2.83285 13.3015 2.50794C16.55 2.18304 18.6616 2.99178 20.7731 4.13246C24.3464 6.24205 37.1779 26.87 37.1779 26.87";
const MARK_2 =
  "M16.3367 17.6305C16.3367 17.6305 26.7179 33.1527 29.5444 36.1235C32.3709 39.0943 33.3588 39.5037 37.0153 40.1854C40.6426 40.8617 43.5116 39.2105 45.4614 37.0994C47.4111 34.9882 48.5475 31.0904 48.5473 29.6281C48.5471 28.1658 48.0608 13.8731 48.0608 13.8731";
const WORDMARK =
  "M59.6505 34.1211V17.4891H63.1485L63.4455 20.2611C63.9515 19.2931 64.6775 18.5231 65.6235 17.9511C66.5695 17.3791 67.6915 17.0931 68.9895 17.0931C70.3315 17.0931 71.4755 17.3791 72.4215 17.9511C73.3675 18.5011 74.0935 19.3151 74.5995 20.3931C75.1275 21.4711 75.3915 22.8131 75.3915 24.4191V34.1211H71.4315V24.7821C71.4315 23.3961 71.1235 22.3291 70.5075 21.5811C69.8915 20.8331 68.9785 20.4591 67.7685 20.4591C66.9765 20.4591 66.2615 20.6461 65.6235 21.0201C65.0075 21.3941 64.5125 21.9441 64.1385 22.6701C63.7865 23.3741 63.6105 24.2321 63.6105 25.2441V34.1211H59.6505ZM86.2985 34.5171C84.7585 34.5171 83.3835 34.1431 82.1735 33.3951C80.9635 32.6471 80.0175 31.6131 79.3355 30.2931C78.6755 28.9731 78.3455 27.4771 78.3455 25.8051C78.3455 24.1331 78.6865 22.6481 79.3685 21.3501C80.0505 20.0301 80.9965 18.9961 82.2065 18.2481C83.4385 17.4781 84.8245 17.0931 86.3645 17.0931C87.6185 17.0931 88.7075 17.3351 89.6315 17.8191C90.5775 18.2811 91.3255 18.9411 91.8755 19.7991V10.3611H95.8355V34.1211H92.2715L91.8755 31.7121C91.5235 32.1961 91.0945 32.6581 90.5885 33.0981C90.0825 33.5161 89.4775 33.8571 88.7735 34.1211C88.0695 34.3851 87.2445 34.5171 86.2985 34.5171ZM87.1235 31.0851C88.0695 31.0851 88.9055 30.8651 89.6315 30.4251C90.3575 29.9631 90.9185 29.3361 91.3145 28.5441C91.7105 27.7521 91.9085 26.8391 91.9085 25.8051C91.9085 24.7711 91.7105 23.8581 91.3145 23.0661C90.9185 22.2741 90.3575 21.6581 89.6315 21.2181C88.9055 20.7781 88.0695 20.5581 87.1235 20.5581C86.2215 20.5581 85.4075 20.7781 84.6815 21.2181C83.9555 21.6581 83.3835 22.2741 82.9655 23.0661C82.5695 23.8581 82.3715 24.7711 82.3715 25.8051C82.3715 26.8391 82.5695 27.7521 82.9655 28.5441C83.3835 29.3361 83.9555 29.9631 84.6815 30.4251C85.4075 30.8651 86.2215 31.0851 87.1235 31.0851ZM105.751 34.5171C104.409 34.5171 103.254 34.2531 102.286 33.7251C101.34 33.1751 100.614 32.3611 100.108 31.2831C99.6025 30.1831 99.3495 28.8301 99.3495 27.2241V17.4891H103.309V26.8281C103.309 28.2581 103.606 29.3471 104.2 30.0951C104.816 30.8211 105.74 31.1841 106.972 31.1841C107.764 31.1841 108.468 30.9971 109.084 30.6231C109.722 30.2491 110.217 29.7101 110.569 29.0061C110.943 28.2801 111.13 27.4001 111.13 26.3661V17.4891H115.09V34.1211H111.592L111.295 31.3491C110.789 32.3171 110.052 33.0871 109.084 33.6591C108.138 34.2311 107.027 34.5171 105.751 34.5171ZM118.836 34.1211V17.4891H122.367L122.73 20.5911C123.126 19.8651 123.621 19.2491 124.215 18.7431C124.809 18.2151 125.502 17.8081 126.294 17.5221C127.108 17.2361 127.999 17.0931 128.967 17.0931V21.2841H127.581C126.921 21.2841 126.294 21.3721 125.7 21.5481C125.106 21.7021 124.589 21.9661 124.149 22.3401C123.731 22.6921 123.401 23.1871 123.159 23.8251C122.917 24.4411 122.796 25.2221 122.796 26.1681V34.1211H118.836ZM135.847 34.1211L129.709 17.4891H133.867L138.256 30.3591L142.645 17.4891H146.737L140.599 34.1211H135.847ZM153.482 34.5171C152.118 34.5171 150.985 34.2861 150.083 33.8241C149.181 33.3621 148.51 32.7461 148.07 31.9761C147.63 31.2061 147.41 30.3701 147.41 29.4681C147.41 28.4121 147.674 27.4991 148.202 26.7291C148.752 25.9591 149.555 25.3651 150.611 24.9471C151.667 24.5071 152.965 24.2871 154.505 24.2871H158.696C158.696 23.4071 158.575 22.6811 158.333 22.1091C158.091 21.5151 157.717 21.0751 157.211 20.7891C156.705 20.5031 156.056 20.3601 155.264 20.3601C154.362 20.3601 153.592 20.5691 152.954 20.9871C152.316 21.3831 151.92 21.9991 151.766 22.8351H147.872C148.004 21.6471 148.4 20.6351 149.06 19.7991C149.72 18.9411 150.589 18.2811 151.667 17.8191C152.767 17.3351 153.966 17.0931 155.264 17.0931C156.826 17.0931 158.157 17.3681 159.257 17.9181C160.357 18.4461 161.193 19.2161 161.765 20.2281C162.359 21.2181 162.656 22.4171 162.656 23.8251V34.1211H159.29L158.894 31.4481C158.674 31.8881 158.388 32.2951 158.036 32.6691C157.706 33.0431 157.321 33.3731 156.881 33.6591C156.441 33.9231 155.935 34.1321 155.363 34.2861C154.813 34.4401 154.186 34.5171 153.482 34.5171ZM154.373 31.3821C155.011 31.3821 155.572 31.2721 156.056 31.0521C156.562 30.8101 156.991 30.4801 157.343 30.0621C157.717 29.6221 158.003 29.1381 158.201 28.6101C158.399 28.0821 158.531 27.5211 158.597 26.9271V26.8611H154.934C154.164 26.8611 153.526 26.9601 153.02 27.1581C152.514 27.3341 152.151 27.5981 151.931 27.9501C151.711 28.3021 151.601 28.7091 151.601 29.1711C151.601 29.6331 151.711 30.0291 151.931 30.3591C152.151 30.6891 152.47 30.9421 152.888 31.1181C153.306 31.2941 153.801 31.3821 154.373 31.3821Z";

/** The full lockup. `tone` follows the surface it sits on. */
export function NdurvaLogo({ height = 34, tone = colors.text }: { height?: number; tone?: string }) {
  return (
    <Svg width={(height * 166) / 45} height={height} viewBox="0 0 166 45" fill="none">
      <Path d={MARK_1} stroke={colors.primary} strokeWidth={4.87274} strokeLinecap="round" />
      <Path d={MARK_2} stroke={colors.primary} strokeWidth={4.87274} strokeLinecap="round" />
      <Path d={WORDMARK} fill={tone} />
    </Svg>
  );
}

interface ButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ title, variant = "primary", loading, icon, disabled, style, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      // The state object is passed straight through rather than rebuilt, so this
      // does not have to track what fields Pressable reports per platform.
      style={(state) => [
        s.button,
        variant === "primary" && s.buttonPrimary,
        variant === "outline" && s.buttonOutline,
        variant === "ghost" && s.buttonGhost,
        state.pressed && !isDisabled && s.buttonPressed,
        isDisabled && s.buttonDisabled,
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.onDark : colors.primary} />
      ) : (
        <View style={s.buttonInner}>
          {icon}
          <Text
            style={[
              s.buttonText,
              variant === "outline" && s.buttonTextOutline,
              variant === "ghost" && s.buttonTextGhost,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
}

export const Field = forwardRef<TextInput, FieldProps>(({ label, style, ...rest }, ref) => (
  <View style={s.field}>
    <Text style={s.fieldLabel}>{label}</Text>
    <TextInput
      ref={ref}
      accessibilityLabel={label}
      placeholderTextColor={colors.textFaint}
      style={[s.input, style]}
      {...rest}
    />
  </View>
));
Field.displayName = "Field";

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[s.card, style]} {...rest} />;
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
  buttonInner: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonOutline: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  buttonGhost: { backgroundColor: "transparent" },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: colors.onDark, fontSize: 16, fontWeight: "700" },
  buttonTextOutline: { color: colors.primary },
  buttonTextGhost: { color: colors.textMuted, fontWeight: "500" },

  field: { gap: spacing.sm },
  fieldLabel: { color: colors.textMuted, fontSize: 14 },
  input: {
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
});
