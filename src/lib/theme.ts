/**
 * The gate app is dark only, and deliberately so: guards work night shifts and
 * a white screen at 2am ruins their night vision and lights up the booth.
 */
export const colors = {
  background: "#0D0D0D",
  surface: "#161616",
  surfaceRaised: "#1F1F1F",
  border: "#2A2A2A",

  text: "#FFFFFF",
  textMuted: "#9B9B9B",
  textFaint: "#6B6B6B",

  primary: "#C94F2C",
  primaryDark: "#B03A1B",

  /** Verification outcomes. Sized and coloured to be read at arm's length. */
  allow: "#16A34A",
  allowSurface: "#13251A",
  deny: "#DC2626",
  denySurface: "#2A1615",
  warn: "#CA8A04",
  warnSurface: "#2A2312",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 40, fontWeight: "700" },
  title: { fontSize: 24, fontWeight: "700" },
  heading: { fontSize: 18, fontWeight: "700" },
  body: { fontSize: 16, fontWeight: "400" },
  label: { fontSize: 14, fontWeight: "500" },
  caption: { fontSize: 12, fontWeight: "400" },
} as const;
