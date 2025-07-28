export const backgroundOptions = {
  // Current colors (for reference)
  current: {
    primary: "#0A0A0B",
    secondary: "#1A1A1D",
    tertiary: "#2A2A2F",
  },

  // Option 1: Deeper Dark (More Premium Feel)
  deepDark: {
    primary: "#050507",
    secondary: "#0F0F12",
    tertiary: "#1A1A1F",
  },

  // Option 2: Warmer Dark (Cinematic Feel)
  warmDark: {
    primary: "#0B0A0C",
    secondary: "#1C1A1E",
    tertiary: "#2D2A30",
  },

  // Option 3: Cool Dark (Tech/AI Feel)
  coolDark: {
    primary: "#080A0C",
    secondary: "#151A1E",
    tertiary: "#252A30",
  },

  // Option 4: Purple-tinted (Brand Aligned)
  purpleTinted: {
    primary: "#0A0A0F",
    secondary: "#1A1A22",
    tertiary: "#2A2A35",
  },

  // Option 5: Teal-tinted (Primary Color Aligned)
  tealTinted: {
    primary: "#080B0B",
    secondary: "#16201F",
    tertiary: "#263332",
  },

  // Option 6: Gradient Backgrounds (Dynamic)
  gradients: {
    primary: "linear-gradient(135deg, #0A0A0B 0%, #0F0A0F 100%)",
    secondary: "linear-gradient(135deg, #1A1A1D 0%, #1F1A22 100%)",
    tertiary: "linear-gradient(135deg, #2A2A2F 0%, #2F2A35 100%)",
  },

  // Option 7: Subtle Pattern Overlays
  withPatterns: {
    primary: "#0A0A0B", // with noise pattern
    secondary: "#1A1A1D", // with subtle grid
    tertiary: "#2A2A2F", // with dot pattern
  },
}

// Complementary colors that work well with each option
export const complementaryColors = {
  deepDark: {
    accent: "#00F0D0", // Brighter teal
    secondary: "#9A6DFF", // Brighter purple
  },
  warmDark: {
    accent: "#00E6C3", // Current primary
    secondary: "#8A5DFF", // Current secondary
  },
  coolDark: {
    accent: "#00D4E6", // Cooler teal
    secondary: "#7A5DFF", // Cooler purple
  },
  purpleTinted: {
    accent: "#00E6C3", // Current primary (contrast)
    secondary: "#9A6DFF", // Enhanced purple
  },
  tealTinted: {
    accent: "#00F0C3", // Enhanced teal
    secondary: "#8A5DFF", // Current secondary (contrast)
  },
}
