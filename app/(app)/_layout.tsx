import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="scan" />
      <Stack.Screen name="manual" options={{ presentation: "modal" }} />
      <Stack.Screen name="result" />
      <Stack.Screen name="activity" options={{ presentation: "modal" }} />
    </Stack>
  );
}
