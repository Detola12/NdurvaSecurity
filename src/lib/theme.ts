/**
 * Tokens taken from the Figma security screens, and matching the web app's
 * palette so the two products read as one brand.
 */
export const colors = {
  /** The cream page behind everything. */
  background: "#FAF6F0",
  card: "#FFFFFF",
  /** The greeting band at the top of the home screen. */
  headerDark: "#1E1E1E",
  border: "#EFE7DF",
  borderStrong: "#E4D9CE",

  text: "#1E1E1E",
  textMuted: "#757575",
  textFaint: "#A79C92",
  onDark: "#FFFFFF",
  onDarkMuted: "#B5B0AA",

  primary: "#C94F2C",
  primaryDark: "#B03A1B",
  primarySoft: "#FDF1EE",

  success: "#16A34A",
  successSoft: "#F0FDF4",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;
