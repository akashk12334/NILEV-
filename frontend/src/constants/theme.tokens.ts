/**
 * NILEV Design System Theme Tokens
 */

export const THEME_TOKENS = {
  colors: {
    background: "#070913",
    surface: "#0c1022",
    surfaceElevated: "#11172e",
    card: "rgba(13, 17, 34, 0.72)",
    cardHover: "rgba(20, 26, 52, 0.82)",
    border: "rgba(147, 130, 255, 0.12)",
    borderHover: "rgba(168, 85, 247, 0.28)",
    borderGlow: "rgba(168, 85, 247, 0.38)",
    accent: {
      violet: "#8b5cf6",
      indigo: "#6366f1",
      fuchsia: "#d946ef",
      emerald: "#10b981",
      amber: "#f59e0b",
      rose: "#f43f5e",
      cyan: "#06b6d4",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
      muted: "#64748b",
      accent: "#a78bfa",
    },
  },
  radii: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
  shadows: {
    subtle: "0 4px 20px -2px rgba(0, 0, 0, 0.4)",
    glowSm: "0 0 15px -3px rgba(139, 92, 246, 0.2)",
    glowMd: "0 0 25px -4px rgba(139, 92, 246, 0.28)",
    glowLg: "0 0 40px -5px rgba(139, 92, 246, 0.35)",
  },
} as const;
