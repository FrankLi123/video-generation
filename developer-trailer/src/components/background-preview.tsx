"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Sparkles } from "lucide-react"

interface BackgroundPreviewProps {
  title: string
  description: string
  colors: {
    primary: string
    secondary: string
    tertiary: string
  }
  accentColors: {
    primary: string
    secondary: string
  }
}

export function BackgroundPreview({ title, description, colors, accentColors }: BackgroundPreviewProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 p-6 relative" style={{ backgroundColor: colors.primary }}>
        {/* Simulated header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accentColors.primary}, ${accentColors.secondary})`,
              }}
            >
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">TrailerAI</span>
          </div>
          <Button
            size="sm"
            style={{
              backgroundColor: accentColors.primary,
              color: colors.primary,
            }}
          >
            Start Creating
          </Button>
        </div>

        {/* Simulated content */}
        <div className="space-y-3">
          <Badge
            className="border-0"
            style={{
              backgroundColor: `${accentColors.secondary}20`,
              color: accentColors.secondary,
            }}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
          <h3 className="text-white text-lg font-bold">AI Trailers that captivate</h3>
          <p className="text-white/70 text-sm">Transform your content with AI</p>
        </div>

        {/* Background layers */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundColor: colors.secondary }} />
        <div
          className="absolute bottom-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
          style={{ backgroundColor: accentColors.primary }}
        />
      </div>

      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex space-x-2">
          <div
            className="w-6 h-6 rounded border-2 border-white/20"
            style={{ backgroundColor: colors.primary }}
            title="Primary Background"
          />
          <div
            className="w-6 h-6 rounded border-2 border-white/20"
            style={{ backgroundColor: colors.secondary }}
            title="Secondary Background"
          />
          <div
            className="w-6 h-6 rounded border-2 border-white/20"
            style={{ backgroundColor: colors.tertiary }}
            title="Tertiary Background"
          />
          <div
            className="w-6 h-6 rounded border-2 border-white/20"
            style={{ backgroundColor: accentColors.primary }}
            title="Primary Accent"
          />
          <div
            className="w-6 h-6 rounded border-2 border-white/20"
            style={{ backgroundColor: accentColors.secondary }}
            title="Secondary Accent"
          />
        </div>
      </CardContent>
    </Card>
  )
}
