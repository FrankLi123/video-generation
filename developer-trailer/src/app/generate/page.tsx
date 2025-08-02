"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth/auth-context"
import { motion } from "framer-motion"
import {
  Upload,
  Video,
  ImageIcon,
  Music,
  FileText,
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  Wand2,
  Users,
  LogOut,
  Settings,
  User,
  CreditCard,
} from "lucide-react"
import Link from "next/link"

interface Asset {
  id: string
  type: "video" | "image" | "audio" | "text"
  name: string
  url?: string
  selected: boolean
}

// FIXED: Clean imports for video generation
import { useVideoGeneration } from '@/lib/hooks/use-video-generation'
import { GenerationProgress } from '@/components/video-generation/generation-progress'
import { GenerateButton } from '@/components/video-generation/generate-button'

export default function GeneratePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  
  // FIXED: Use ONLY the custom hook for video generation
  const {
    isGenerating,
    currentStep,
    videoStatus,
    generateTrailer
  } = useVideoGeneration()
  
  // SIMPLIFIED: Only essential form fields
  const [description, setDescription] = useState("")
  const [trailerStyle, setTrailerStyle] = useState("")
  const [duration, setDuration] = useState("60")
  const [includeVoiceover, setIncludeVoiceover] = useState(false)
  const [includeMusic, setIncludeMusic] = useState(true)
  const [assets, setAssets] = useState<Asset[]>([])

  // UPDATED: Simplified handler with auto-generated project name
  const handleGenerateTrailer = async () => {
  if (!description.trim()) {
    toast.error('Please provide a content description')
    return
  }

  // Auto-generate project name from description
  const autoProjectName = description.slice(0, 50).trim() + (description.length > 50 ? '...' : '')
  
  await generateTrailer({
    title: autoProjectName,  // ✅ Changed from 'projectName' to 'title'
    description: description.trim(),
  })
  }

  // Asset management functions (simplified)
  const handleAddAsset = (type: Asset["type"]) => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      type,
      name: `${type}_${assets.length + 1}`,
      selected: true,
    }
    setAssets([...assets, newAsset])
  }

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter((asset) => asset.id !== id))
  }

  const toggleAssetSelection = (id: string) => {
    setAssets(assets.map((asset) => (asset.id === id ? { ...asset, selected: !asset.selected } : asset)))
  }

  const getAssetIcon = (type: Asset["type"]) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "image":
        return <ImageIcon className="w-4 h-4" />
      case "audio":
        return <Music className="w-4 h-4" />
      case "text":
        return <FileText className="w-4 h-4" />
    }
  }

  const trailerStyles = [
    { id: "cinematic", name: "Cinematic", description: "Epic, movie-like feel with dramatic pacing" },
    { id: "modern", name: "Modern", description: "Clean, contemporary style with smooth transitions" },
    { id: "energetic", name: "Energetic", description: "Fast-paced with dynamic cuts and effects" },
    { id: "minimal", name: "Minimal", description: "Simple, elegant approach focusing on content" },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Header - same as before */}
      <header className="border-b border-background-secondary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold">TrailerAI</span>
              <Badge className="ml-2 bg-secondary/20 text-secondary border-secondary/30">AI Trailer Generator</Badge>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>10 credits remaining</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/pricing">Upgrade</Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing" className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatedSection>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">Create your AI-powered trailer</h1>
            <p className="text-text-secondary text-lg">
              Describe your content and let our AI craft a compelling trailer in seconds
            </p>
          </div>
        </AnimatedSection>

        <div className="space-y-8">
          {/* SIMPLIFIED: Content Description Only */}
          <AnimatedSection delay={0.1}>
            <Card className="bg-background-secondary/50 border-background-tertiary">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-6 flex items-center">
                  <Wand2 className="w-5 h-5 mr-2 text-primary" />
                  Content Description
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="description">What's your content about? *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your content, key themes, story, or what makes it compelling. Be specific about the mood, style, and key elements you want highlighted in the trailer..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background-tertiary border-background-tertiary focus:border-primary min-h-[150px] resize-none"
                    maxLength={2000}
                  />
                  <div className="text-right text-sm text-text-muted">{description.length}/2000</div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Trailer Configuration */}
          <AnimatedSection delay={0.2}>
            <Card className="bg-background-secondary/50 border-background-tertiary">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-6 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Trailer Style & Settings
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-background-tertiary border border-background-tertiary rounded-md focus:border-primary focus:outline-none"
                    >
                      <option value="30">6 seconds (Quick)</option>
                      <option value="60">12 seconds (Standard)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Trailer Style</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {trailerStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setTrailerStyle(style.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            trailerStyle === style.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-background-tertiary bg-background-tertiary hover:border-primary/50"
                          }`}
                        >
                          <div className="font-medium text-sm">{style.name}</div>
                          <div className="text-xs text-text-muted mt-1">{style.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="voiceover">AI Voiceover</Label>
                      <p className="text-sm text-text-muted">Add AI-generated narration</p>
                    </div>
                    <Switch id="voiceover" checked={includeVoiceover} onCheckedChange={setIncludeVoiceover} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="music">Background Music</Label>
                      <p className="text-sm text-text-muted">Include AI-selected background music</p>
                    </div>
                    <Switch id="music" checked={includeMusic} onCheckedChange={setIncludeMusic} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Optional Assets */}
          <AnimatedSection delay={0.3}>
            <Card className="bg-background-secondary/50 border-background-tertiary">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-primary" />
                  Media Assets (Optional)
                </h2>

                <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-primary">
                      Upload images to enhance your trailer. The AI will incorporate them into the video generation.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <button
                    onClick={() => handleAddAsset("image")}
                    className="p-6 border-2 border-dashed border-background-tertiary hover:border-primary/50 rounded-lg transition-colors group"
                  >
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-text-muted group-hover:text-primary" />
                    <div className="text-sm font-medium">Add Images</div>
                    <div className="text-xs text-text-muted">JPG, PNG, GIF</div>
                  </button>
                </div>

                {assets.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {assets.map((asset) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
                          asset.selected
                            ? "border-primary bg-primary/10"
                            : "border-background-tertiary bg-background-tertiary hover:border-primary/50"
                        }`}
                        onClick={() => toggleAssetSelection(asset.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getAssetIcon(asset.type)}
                            <span className="text-sm font-medium truncate">{asset.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveAsset(asset.id)
                            }}
                            className="text-text-muted hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="w-full h-16 bg-background-primary/50 rounded border-2 border-dashed border-background-tertiary flex items-center justify-center">
                          {getAssetIcon(asset.type)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Generate Button */}
          <div className="flex items-center justify-between pt-8">
            <Link href="/">
              <Button variant="outline" className="bg-transparent border-background-tertiary hover:border-primary/50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>

            <div className="flex flex-col items-end space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>Generation time: 2-3 minutes</span>
                </div>
                <GenerateButton
                  isGenerating={isGenerating}
                  currentStep={currentStep}
                  disabled={!description.trim()}
                  onClick={handleGenerateTrailer}
                />
              </div>
              
              <GenerationProgress 
                currentStep={currentStep} 
                videoStatus={videoStatus ? { 
                  progress: videoStatus.progress || 0,
                  status: videoStatus.status || ''
                } : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
