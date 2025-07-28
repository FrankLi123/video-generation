"use client"

import { BackgroundPreview } from "@/components/background-preview"
import { backgroundOptions, complementaryColors } from "@/lib/background-options"

export default function BackgroundOptionsPage() {
  const options = [
    {
      title: "Deep Dark (Recommended)",
      description: "Premium, sophisticated feel with enhanced contrast. Perfect for high-end AI tools.",
      colors: backgroundOptions.deepDark,
      accentColors: complementaryColors.deepDark,
    },
    {
      title: "Current (Baseline)",
      description: "Your current color scheme - clean and professional.",
      colors: backgroundOptions.current,
      accentColors: { accent: "#00E6C3", secondary: "#8A5DFF" },
    },
    {
      title: "Warm Dark",
      description: "Cinematic feel with subtle warm undertones. Great for creative applications.",
      colors: backgroundOptions.warmDark,
      accentColors: complementaryColors.warmDark,
    },
    {
      title: "Cool Dark",
      description: "Tech-focused with cool blue undertones. Emphasizes the AI/technology aspect.",
      colors: backgroundOptions.coolDark,
      accentColors: complementaryColors.coolDark,
    },
    {
      title: "Purple-tinted",
      description: "Subtle purple influence that aligns with your secondary brand color.",
      colors: backgroundOptions.purpleTinted,
      accentColors: complementaryColors.purpleTinted,
    },
    {
      title: "Teal-tinted",
      description: "Subtle teal influence that aligns with your primary brand color.",
      colors: backgroundOptions.tealTinted,
      accentColors: complementaryColors.tealTinted,
    },
  ]

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-white mb-4">Background Color Options</h1>
          <p className="text-text-secondary text-lg">
            Choose the perfect background palette for your AI trailer generator
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((option, index) => (
            <BackgroundPreview
              key={index}
              title={option.title}
              description={option.description}
              colors={option.colors}
              accentColors={option.accentColors}
            />
          ))}
        </div>

        <div className="mt-12 p-6 bg-background-secondary/50 rounded-lg border border-background-tertiary">
          <h2 className="text-xl font-heading font-semibold text-white mb-4">Implementation Notes</h2>
          <ul className="space-y-2 text-text-secondary">
            <li>
              • <strong>Deep Dark</strong> - Most premium feel, works best for high-end products
            </li>
            <li>
              • <strong>Warm Dark</strong> - Great for creative/entertainment focused applications
            </li>
            <li>
              • <strong>Cool Dark</strong> - Perfect for emphasizing AI/tech capabilities
            </li>
            <li>
              • <strong>Purple-tinted</strong> - Subtle brand alignment with secondary color
            </li>
            <li>
              • <strong>Teal-tinted</strong> - Subtle brand alignment with primary color
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
