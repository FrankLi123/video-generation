"use client"

import { useState } from "react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  // Fetch real projects from database
  const { data: projects = [], isLoading, error } = api.project.getProjects.useQuery()

  // REMOVE THE DUPLICATE HARDCODED STATS ARRAY (lines 67-76)
  // Delete this entire block:
  // const stats = [
  //   { label: "Total Projects", value: "12", icon: <Video className="w-5 h-5" />, change: "+3 this month" },
  //   { label: "Total Views", value: "24.5K", icon: <Eye className="w-5 h-5" />, change: "+12% this week" },
  //   {
  //     label: "Avg. Engagement",
  //     value: "8.2%",
  //     icon: <TrendingUp className="w-5 h-5" />,
  //     change: "+2.1% vs last month",
  //   },
  //   { label: "Credits Used", value: "45/100", icon: <Zap className="w-5 h-5" />, change: "55 remaining" },
  // ]

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

  const handlePlayVideo = (videoUrl: string, projectId: string) => {
    if (videoUrl) {
      setPlayingVideo(projectId)
      // Open video in new tab or modal
      window.open(videoUrl, '_blank')
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

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || project.video_status === filterStatus
    return matchesSearch && matchesFilter
  })

  // KEEP ONLY THIS CALCULATED STATS ARRAY
  const completedProjects = projects.filter(p => p.video_status === 'completed')
  const stats = [
    { 
      label: "Total Projects", 
      value: projects.length.toString(), 
      icon: <Video className="w-5 h-5" />, 
      change: "+" + projects.filter(p => {
        const createdDate = new Date(p.created_at)
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return createdDate > monthAgo
      }).length + " this month" 
    },
    { 
      label: "Completed Videos", 
      value: completedProjects.length.toString(), 
      icon: <Eye className="w-5 h-5" />, 
      change: completedProjects.length > 0 ? "Ready to share" : "None yet" 
    },
    {
      label: "Success Rate",
      value: projects.length > 0 ? Math.round((completedProjects.length / projects.length) * 100) + "%" : "0%",
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

  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Header */}
      <header className="border-b border-background-secondary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold">TrailerAI</span>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>55 credits remaining</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/pricing">Upgrade Plan</Link>
              </Button>
              
              {/* User Dropdown Menu */}
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

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <AnimatedSection>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!</h1>
            <p className="text-text-secondary text-lg">Ready to create your next amazing trailer?</p>
          </div>
        </AnimatedSection>

        {/* Stats Cards */}
        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-background-secondary/50 border-background-tertiary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
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
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-background-secondary/50 border-background-tertiary hover:border-primary/30 transition-all duration-300 group">
                  <div className="relative overflow-hidden">
                    {/* Video thumbnail or placeholder */}
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      {project.video_url ? (
                        <video 
                          className="w-full h-full object-cover"
                          poster={project.video_url}
                          preload="metadata"
                        >
                          <source src={project.video_url} type="video/mp4" />
                        </video>
                      ) : (
                        <div className="text-center">
                          <Video className="w-12 h-12 text-text-muted mx-auto mb-2" />
                          <p className="text-sm text-text-muted">Video generating...</p>
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
                              onClick={() => handlePlayVideo(project.video_url!, project.id)}
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
        {filteredProjects.length === 0 && (
          <AnimatedSection delay={0.5}>
            <div className="text-center py-16">
              <Video className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">No projects found</h3>
              <p className="text-text-secondary mb-6">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first AI-powered trailer to get started"}
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Link href="/generate">
                  <Button className="bg-primary hover:bg-primary/90 text-background-primary font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Trailer
                  </Button>
                </Link>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* Recent Activity - Updated to show real project activity */}
        <AnimatedSection delay={0.6}>
          <Card className="bg-background-secondary/50 border-background-tertiary mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 3).map((project, index) => {
                  const isCompleted = project.video_status === 'completed'
                  const isProcessing = project.video_status === 'processing'
                  return (
                    <div key={project.id} className="flex items-center space-x-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        isCompleted ? 'bg-green-400' : 
                        isProcessing ? 'bg-yellow-400' : 
                        'bg-blue-400'
                      }`}></div>
                      <span className="text-text-secondary">
                        {isCompleted ? `${project.title} trailer completed` :
                         isProcessing ? `Processing ${project.title}` :
                         `Started ${project.title} project`}
                      </span>
                      <span className="text-text-muted">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )
                })}
                {projects.length === 0 && (
                  <div className="text-center text-text-muted py-4">
                    No recent activity. Create your first project to get started!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  )
}
