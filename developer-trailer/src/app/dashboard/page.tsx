"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection } from "@/components/animated-section"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth/auth-context"
import { motion } from "framer-motion"
import {
  Video,
  Plus,
  Search,
  Filter,
  Play,
  Download,
  Share2,
  MoreHorizontal,
  Calendar,
  Clock,
  Eye,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  LogOut,
  Settings,
  User,
  CreditCard,
  ExternalLink,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/trpc/client"
import { toast } from "sonner"

// Updated interface to match database schema
interface Project {
  id: string
  title: string
  description: string
  video_url: string | null
  video_status: string | null
  created_at: string
  updated_at: string
  status: string
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<{url: string, title: string} | null>(null)

  // Authentication protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  // Don't render dashboard if user is not authenticated
  if (!user) {
    return null
  }

  // Fetch real projects from database
  const { data: projects, isLoading, error } = api.project.getProjects.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchOnWindowFocus: true, // Refresh when window gains focus
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
      case "processing":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Processing</Badge>
      case "draft":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Draft</Badge>
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{status}</Badge>
    }
  }

  // Updated handlePlayVideo function for modal
  const handlePlayVideo = (videoUrl: string, projectTitle: string) => {
    if (videoUrl) {
      setCurrentVideo({ url: videoUrl, title: projectTitle })
      setVideoModalOpen(true)
    } else {
      toast.error('Video not available')
    }
  }

  const handleDownloadVideo = async (videoUrl: string, title: string) => {
    if (!videoUrl) {
      toast.error('Video not available for download')
      return
    }

    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Video download started')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download video')
    }
  }

  const handleShareVideo = async (videoUrl: string, title: string) => {
    if (!videoUrl) {
      toast.error('Video not available for sharing')
      return
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out my AI-generated trailer: ${title}`,
          url: videoUrl,
        })
      } catch (error) {
        console.error('Share error:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(videoUrl)
        toast.success('Video URL copied to clipboard')
      } catch (error) {
        console.error('Clipboard error:', error)
        toast.error('Failed to copy URL')
      }
    }
  }

  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || project.video_status === filterStatus
    return matchesSearch && matchesFilter
  })

  // KEEP ONLY THIS CALCULATED STATS ARRAY
  const completedProjects = projects?.filter(p => p.video_status === 'completed')
  const stats = [
    { 
      label: "Total Projects", 
      value: projects?.length.toString(), 
      icon: <Video className="w-5 h-5" />, 
      change: "+" + projects?.filter(p => {
        const createdDate = new Date(p.created_at)
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return createdDate > monthAgo
      }).length + " this month" 
    },
    { 
      label: "Completed Videos", 
      value: completedProjects?.length.toString(), 
      icon: <Eye className="w-5 h-5" />, 
      change: completedProjects?.length > 0 ? "Ready to share" : "None yet" 
    },
    {
      label: "Success Rate",
      value: projects?.length > 0 ? Math.round((completedProjects?.length / projects?.length) * 100) + "%" : "0%",  
      icon: <TrendingUp className="w-5 h-5" />,
      change: "Generation success",
    },
    { 
      label: "Credits Used", 
      value: "45/100", 
      icon: <Zap className="w-5 h-5" />, 
      change: "55 remaining" 
    },
  ]

  // Remove this duplicate line: const { user, signOut } = useAuth()
  
  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load projects</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="bg-background-secondary/50 border-b border-background-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-heading font-bold">TrailerAI</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block">{user?.email || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <AnimatedSection>
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Welcome back!</h1>
            <p className="text-text-secondary">Here's what's happening with your AI-generated trailers today.</p>
          </div>
        </AnimatedSection>

        {/* Stats Grid */}
        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-background-secondary/50 border-background-tertiary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-text-muted">{stat.icon}</div>
                    <div className="text-2xl font-heading font-bold text-primary">{stat.value}</div>
                  </div>
                  <div className="text-sm font-medium mb-1">{stat.label}</div>
                  <div className="text-xs text-text-muted">{stat.change}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AnimatedSection>

        {/* Quick Actions */}
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-heading font-bold mb-2">Your Projects</h2>
              <p className="text-text-secondary">Manage and track all your AI-generated trailers</p>
            </div>
            <Link href="/generate">
              <Button className="bg-primary hover:bg-primary/90 text-background-primary font-medium shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Create New Trailer
              </Button>
            </Link>
          </div>
        </AnimatedSection>

        {/* Search and Filter */}
        <AnimatedSection delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background-secondary border-background-tertiary focus:border-primary"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-background-secondary border border-background-tertiary rounded-md focus:border-primary focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </AnimatedSection>

        {/* Projects Grid */}
        <AnimatedSection delay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects?.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-background-secondary/50 border-background-tertiary hover:border-primary/30 transition-all duration-300 group">
                  <div className="relative overflow-hidden">
                    {/* Video thumbnail or placeholder */}
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                      {project.video_url ? (
                        <>
                          {/* Video thumbnail */}
                          <video 
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            onLoadedMetadata={(e) => {
                              // Set video to first frame for thumbnail
                              e.currentTarget.currentTime = 1;
                            }}
                          >
                            <source src={`${project.video_url}#t=1`} type="video/mp4" />
                          </video>
                          
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                              <Play className="w-8 h-8 text-gray-800 ml-1" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          {project.video_status === 'processing' ? (
                            <>
                              <Loader2 className="w-12 h-12 text-primary mx-auto mb-2 animate-spin" />
                              <p className="text-sm text-text-muted">Generating video...</p>
                            </>
                          ) : (
                            <>
                              <Video className="w-12 h-12 text-text-muted mx-auto mb-2" />
                              <p className="text-sm text-text-muted">Video pending...</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        {project.video_url ? (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => handlePlayVideo(project.video_url!, project.title)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Play
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                              onClick={() => handleDownloadVideo(project.video_url!, project.title)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                              onClick={() => handleShareVideo(project.video_url!, project.title)}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" disabled className="bg-gray-500">
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Processing
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="absolute top-3 left-3">{getStatusBadge(project.video_status || project.status)}</div>
                    {project.video_url && (
                      <div className="absolute top-3 right-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                          onClick={() => window.open(project.video_url!, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-heading font-semibold text-lg truncate">{project.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {project.video_url && (
                            <>
                              <DropdownMenuItem onClick={() => handleDownloadVideo(project.video_url!, project.title)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShareVideo(project.video_url!, project.title)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-text-secondary text-sm mb-3 line-clamp-2">{project.description}</p>

                    <div className="flex items-center justify-between text-xs text-text-muted mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {project.video_status || 'Processing'}
                      </Badge>
                      {project.video_url && (
                        <div className="flex items-center space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="p-1 h-auto"
                            onClick={() => handleDownloadVideo(project.video_url!, project.title)}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="p-1 h-auto"
                            onClick={() => handleShareVideo(project.video_url!, project.title)}
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Empty State */}
        {filteredProjects?.length === 0 && (
          <AnimatedSection delay={0.5}>
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">No projects found</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery || filterStatus !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "Get started by creating your first AI-generated trailer."}
              </p>
              <Link href="/generate">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Trailer
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        )}
      </main>

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{currentVideo?.title}</DialogTitle>
          </DialogHeader>
          {currentVideo && (
            <div className="aspect-video">
              <video 
                controls 
                autoPlay
                className="w-full h-full rounded-lg"
                src={currentVideo.url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
