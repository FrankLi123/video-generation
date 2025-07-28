export const designTokens = {
  colors: {
    primary: "#00E6C3",
    secondary: "#8A5DFF",
    background: {
      primary: "#0A0A0B",
      secondary: "#1A1A1D",
      tertiary: "#2A2A2F",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B4B4B8",
      muted: "#8A8A8F",
    },
    accent: {
      success: "#00D9A5",
      warning: "#FFB800",
      error: "#FF4757",
    },
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
    "2xl": "4rem",
    "3xl": "6rem",
    "4xl": "8rem",
  },
  shadows: {
    sm: "0 2px 4px rgba(0, 0, 0, 0.1)",
    md: "0 4px 12px rgba(0, 0, 0, 0.15)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.2)",
    xl: "0 16px 48px rgba(0, 0, 0, 0.25)",
    glow: "0 0 20px rgba(0, 230, 195, 0.3)",
    "glow-secondary": "0 0 20px rgba(138, 93, 255, 0.3)",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
  },
} as const
