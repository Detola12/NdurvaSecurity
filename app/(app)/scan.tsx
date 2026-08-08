import { useCallback, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, NdurvaMark } from "@/components/ui";
import { useSessionContext } from "@/data/SessionContext";
import { colors, radius, spacing } from "@/lib/theme";

/**
 * The screen a guard lives on. Camera fills it, and everything else is out of
 * the way, because the job is one action repeated all shift.
 */
export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useSessionContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);

  // A QR code fires the callback many times a second. Without this the guard
  // gets a stack of duplicate result screens from one scan.
  const handled = useRef(false);

  useFocusEffect(
    useCallback(() => {
      handled.current = false;
      return () => setTorch(false);
    }, []),
  );

  const onScanned = ({ data }: { data: string }) => {
    if (handled.current) return;
    handled.current = true;
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/(app)/result", params: { code: data } });
  };

  if (!permission) return <View style={s.flex} />;

  if (!permission.granted) {
    return (
      <View style={[s.flex, s.permission, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.lg }]}>
        <NdurvaMark size={48} />
        <Text style={s.permissionTitle}>Camera access needed</Text>
        <Text style={s.permissionBody}>
          Ndurva Security uses the camera to scan resident and visitor codes. It is only used while this screen is open.
        </Text>
        <View style={s.permissionActions}>
          <Button title="Allow camera" onPress={requestPermission} />
          <Button title="Enter a code by hand" variant="secondary" onPress={() => router.push("/(app)/manual")} />
          {/* Without this a guard who declined the camera prompt can still
              verify codes but has no route to the shift log or to signing out. */}
          <Button title="Shift log and account" variant="ghost" onPress={() => router.push("/(app)/activity")} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.flex}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onScanned}
      />

      <View style={[s.overlay, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}>
        <View style={s.header}>
          <View>
            <Text style={s.property}>{session?.property ?? "Gate"}</Text>
            <Text style={s.guard}>{session?.name ?? ""}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Shift log and account"
            onPress={() => router.push("/(app)/activity")}
            style={s.iconButton}
          >
            <Text style={s.iconGlyph}>☰</Text>
          </Pressable>
        </View>

        <View style={s.reticleWrap} pointerEvents="none">
          <View style={s.reticle}>
            <View style={[s.corner, s.cornerTL]} />
            <View style={[s.corner, s.cornerTR]} />
            <View style={[s.corner, s.cornerBL]} />
            <View style={[s.corner, s.cornerBR]} />
          </View>
          <Text style={s.hint}>Point at the resident or visitor QR code</Text>
        </View>

        <View style={s.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={torch ? "Turn torch off" : "Turn torch on"}
            accessibilityState={{ selected: torch }}
            onPress={() => setTorch((on) => !on)}
            style={[s.torch, torch && s.torchOn]}
          >
            <Text style={[s.torchText, torch && s.torchTextOn]}>{torch ? "Torch on" : "Torch"}</Text>
          </Pressable>
          <Button
            title="Enter code by hand"
            variant="secondary"
            style={s.manualButton}
            onPress={() => router.push("/(app)/manual")}
          />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  overlay: { flex: 1, justifyContent: "space-between", paddingHorizontal: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  property: { color: colors.text, fontSize: 18, fontWeight: "700" },
  guard: { color: colors.textMuted, fontSize: 13 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlyph: { color: colors.text, fontSize: 20 },

  reticleWrap: { alignItems: "center", gap: spacing.lg },
  reticle: { width: 250, height: 250 },
  corner: { position: "absolute", width: 40, height: 40, borderColor: colors.primary },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: radius.lg },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: radius.lg },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: radius.lg },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: radius.lg },
  hint: { color: colors.text, fontSize: 15, textAlign: "center", textShadowColor: "#000", textShadowRadius: 6 },

  actions: { gap: spacing.sm },
  torch: {
    alignSelf: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  torchOn: { backgroundColor: colors.primary },
  torchText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  torchTextOn: { color: "#FFFFFF" },
  manualButton: { backgroundColor: "rgba(31,31,31,0.92)" },

  permission: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg, gap: spacing.md },
  permissionTitle: { color: colors.text, fontSize: 22, fontWeight: "700", marginTop: spacing.sm },
  permissionBody: { color: colors.textMuted, fontSize: 15, textAlign: "center", lineHeight: 22 },
  permissionActions: { alignSelf: "stretch", gap: spacing.sm, marginTop: spacing.lg },
});
