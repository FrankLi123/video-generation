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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Project {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  createdAt: string
  status: "completed" | "processing" | "draft"
  views: number
  style: string
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Mock data - in real app, this would come from API
  const projects: Project[] = [
    {
      id: "1",
      title: "Tech Startup Launch",
      description: "Dynamic trailer for our SaaS platform launch",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "1:30",
      createdAt: "2024-01-15",
      status: "completed",
      views: 2340,
      style: "Modern",
    },
    {
      id: "2",
      title: "Product Demo Showcase",
      description: "Engaging product demonstration video",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "0:45",
      createdAt: "2024-01-12",
      status: "completed",
      views: 1850,
      style: "Cinematic",
    },
    {
      id: "3",
      title: "Brand Story Trailer",
      description: "Emotional brand storytelling piece",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "2:00",
      createdAt: "2024-01-10",
      status: "processing",
      views: 0,
      style: "Minimal",
    },
    {
      id: "4",
      title: "Event Promotion",
      description: "High-energy event promotional trailer",
      thumbnail: "/placeholder.svg?height=200&width=300",
      duration: "1:15",
      createdAt: "2024-01-08",
      status: "completed",
      views: 3200,
      style: "Energetic",
    },
  ]

  const stats = [
    { label: "Total Projects", value: "12", icon: <Video className="w-5 h-5" />, change: "+3 this month" },
    { label: "Total Views", value: "24.5K", icon: <Eye className="w-5 h-5" />, change: "+12% this week" },
    {
      label: "Avg. Engagement",
      value: "8.2%",
      icon: <TrendingUp className="w-5 h-5" />,
      change: "+2.1% vs last month",
    },
    { label: "Credits Used", value: "45/100", icon: <Zap className="w-5 h-5" />, change: "55 remaining" },
  ]

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
      case "processing":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Processing</Badge>
      case "draft":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Draft</Badge>
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

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
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Welcome back, Alex!</h1>
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
                    <Image
                      src={project.thumbnail || "/placeholder.svg"}
                      alt={project.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">{getStatusBadge(project.status)}</div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black/50 text-white border-white/20">{project.duration}</Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-heading font-semibold text-lg truncate">{project.title}</h3>
                      <Button variant="ghost" size="sm" className="p-1 h-auto">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-text-secondary text-sm mb-3 line-clamp-2">{project.description}</p>

                    <div className="flex items-center justify-between text-xs text-text-muted mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{project.views.toLocaleString()} views</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {project.style}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" className="p-1 h-auto">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="p-1 h-auto">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
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

        {/* Recent Activity */}
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
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-text-secondary">Tech Startup Launch trailer completed</span>
                  <span className="text-text-muted">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-text-secondary">Started processing Brand Story Trailer</span>
                  <span className="text-text-muted">1 day ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-text-secondary">Product Demo Showcase gained 150 new views</span>
                  <span className="text-text-muted">2 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  )
}
