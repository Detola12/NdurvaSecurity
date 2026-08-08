import { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { lookupCode } from "@/data/verification";
import { colors, radius, spacing } from "@/lib/theme";

/**
 * Scanning, reached from the keypad. Secondary to typing, per the design.
 */
export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // onBarcodeScanned fires many times a second while a code is in frame, so
  // without this one scan pushes a stack of duplicate screens.
  const handled = useRef(false);

  useFocusEffect(
    useCallback(() => {
      handled.current = false;
      setError(null);
      return () => setTorch(false);
    }, []),
  );

  const onScanned = async ({ data }: { data: string }) => {
    if (handled.current) return;
    handled.current = true;
    const result = await lookupCode(data);
    if (!result.ok) {
      setError(result.message);
      if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Let them try again rather than stranding them on a dead screen.
      window.setTimeout(() => {
        handled.current = false;
      }, 1500);
      return;
    }
    if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: "/(app)/pass", params: { code: result.pass.code } });
  };

  if (!permission) return <View style={s.flex} />;

  if (!permission.granted) {
    return (
      <View style={[s.flex, s.permission, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={s.permissionTitle}>Camera access needed</Text>
        <Text style={s.permissionBody}>
          Ndurva Security uses the camera to scan resident and guest codes. It is only used while this screen is open.
        </Text>
        <View style={s.permissionActions}>
          <Button title="Allow camera" onPress={requestPermission} />
          <Button title="Type the code instead" variant="outline" onPress={() => router.replace("/(app)")} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.dark}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onScanned}
      />
      <View style={[s.overlay, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}>
        <View style={s.topRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.replace("/(app)")} style={s.round}>
            <Text style={s.roundGlyph}>‹</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={torch ? "Turn torch off" : "Turn torch on"}
            accessibilityState={{ selected: torch }}
            onPress={() => setTorch((on) => !on)}
            style={[s.round, torch && s.roundOn]}
          >
            <Text style={s.roundGlyph}>{torch ? "🔦" : "💡"}</Text>
          </Pressable>
        </View>

        <View style={s.reticleWrap} pointerEvents="none">
          <View style={s.reticle}>
            <View style={[s.corner, s.tl]} />
            <View style={[s.corner, s.tr]} />
            <View style={[s.corner, s.bl]} />
            <View style={[s.corner, s.br]} />
          </View>
          <Text style={s.hint}>Point at the resident or guest QR code</Text>
          {!!error && <Text style={s.scanError}>{error}</Text>}
        </View>

        <Button title="Type the code instead" variant="outline" onPress={() => router.replace("/(app)")} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  dark: { flex: 1, backgroundColor: "#000000" },
  overlay: { flex: 1, justifyContent: "space-between", paddingHorizontal: spacing.md },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  round: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  roundOn: { backgroundColor: colors.primary },
  roundGlyph: { color: colors.onDark, fontSize: 22 },

  reticleWrap: { alignItems: "center", gap: spacing.md },
  reticle: { width: 240, height: 240 },
  corner: { position: "absolute", width: 38, height: 38, borderColor: colors.primary },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: radius.lg },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: radius.lg },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: radius.lg },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: radius.lg },
  hint: { color: colors.onDark, fontSize: 15, textAlign: "center" },
  scanError: { color: "#FCA5A5", fontSize: 15, fontWeight: "700", textAlign: "center" },

  permission: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg, gap: spacing.sm },
  permissionTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  permissionBody: { color: colors.textMuted, fontSize: 15, textAlign: "center", lineHeight: 22 },
  permissionActions: { alignSelf: "stretch", gap: spacing.sm, marginTop: spacing.lg },
});
