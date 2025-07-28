import { backgroundOptions } from "./background-options"

// Option 1: Deep Dark - Most Premium Feel
export const deepDarkTokens = {
  colors: {
    primary: "#00F0D0",
    secondary: "#9A6DFF",
    background: backgroundOptions.deepDark,
    text: {
      primary: "#FFFFFF",
      secondary: "#C4C4C8",
      muted: "#9A9A9F",
    },
    accent: {
      success: "#00E9A5",
      warning: "#FFB800",
      error: "#FF4757",
    },
  },
  // Enhanced shadows for deeper backgrounds
  shadows: {
    sm: "0 2px 4px rgba(0, 0, 0, 0.2)",
    md: "0 4px 12px rgba(0, 0, 0, 0.25)",
    lg: "0 8px 24px rgba(0, 0, 0, 0.3)",
    xl: "0 16px 48px rgba(0, 0, 0, 0.4)",
    glow: "0 0 20px rgba(0, 240, 208, 0.4)",
    "glow-secondary": "0 0 20px rgba(154, 109, 255, 0.4)",
  },
}

// Option 2: Warm Dark - Cinematic Feel
export const warmDarkTokens = {
  colors: {
    primary: "#00E6C3",
    secondary: "#8A5DFF",
    background: backgroundOptions.warmDark,
    text: {
      primary: "#FEFEFE",
      secondary: "#B8B6BA",
      muted: "#8E8C90",
    },
  },
  // Warmer glow effects
  shadows: {
    glow: "0 0 20px rgba(0, 230, 195, 0.35)",
    "glow-secondary": "0 0 20px rgba(138, 93, 255, 0.35)",
  },
}

// Option 3: Cool Dark - Tech/AI Feel
export const coolDarkTokens = {
  colors: {
    primary: "#00D4E6",
    secondary: "#7A5DFF",
    background: backgroundOptions.coolDark,
    text: {
      primary: "#F8FAFB",
      secondary: "#B4B8BC",
      muted: "#8A8E92",
    },
  },
  // Cooler, more tech-focused glows
  shadows: {
    glow: "0 0 20px rgba(0, 212, 230, 0.4)",
    "glow-secondary": "0 0 20px rgba(122, 93, 255, 0.4)",
  },
}

// Option 4: Purple-tinted - Brand Aligned
export const purpleTintedTokens = {
  colors: {
    primary: "#00E6C3",
    secondary: "#9A6DFF",
    background: backgroundOptions.purpleTinted,
    text: {
      primary: "#FFFFFF",
      secondary: "#B8B4C8",
      muted: "#8E8A9F",
    },
  },
}

// Option 5: Gradient Backgrounds - Dynamic
export const gradientTokens = {
  colors: {
    primary: "#00E6C3",
    secondary: "#8A5DFF",
    background: {
      primary: "linear-gradient(135deg, #0A0A0B 0%, #0F0A0F 100%)",
      secondary: "linear-gradient(135deg, #1A1A1D 0%, #1F1A22 100%)",
      tertiary: "linear-gradient(135deg, #2A2A2F 0%, #2F2A35 100%)",
    },
  },
}
