'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/trpc/client';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScriptEditor } from '@/components/script/script-editor';
import { FileUpload } from '@/components/upload/file-upload';
import { ArrowLeft, Calendar, User, Image as ImageIcon, Video, Upload, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  // State for Milestone 3 testing
  const [personalPhoto, setPersonalPhoto] = useState<string>('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [scriptParams, setScriptParams] = useState({
    targetAudience: 'developers and tech enthusiasts',
    keyFeatures: '',
    tone: 'professional' as const,
    duration: 30,
  });

  const { data: project, isLoading, error, refetch } = api.project.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  // Update project mutation for testing
  const updateProject = api.project.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Project updated successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to update project');
      console.error('Update error:', error);
    },
  });

  // Script generation mutation with detailed logging
  const generateScript = api.script.generateScript.useMutation({
    onSuccess: (data) => {
      console.log('🎉 Script generation response:', data);
      toast.success('Script generation started!');
    },
    onError: (error) => {
      console.error('❌ Script generation error:', error);
      toast.error(`Script generation failed: ${error.message}`);
    },
  });

  // Temporarily bypass auth for testing
  // if (!user) {
  //   router.push('/auth/signin');
  //   return null;
  // }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <Button asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'processing':
        return <Badge>Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handlers for Milestone 3 testing
  const handlePersonalPhotoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setPersonalPhoto(urls[0]);
      console.log('📸 Personal photo uploaded:', urls[0]);
      toast.success('Personal photo uploaded!');
    }
  };

  const handleProductImagesUpload = (urls: string[]) => {
    setProductImages(prev => [...prev, ...urls]);
    console.log('🖼️ Product images uploaded:', urls);
    toast.success(`Uploaded ${urls.length} product image(s)!`);
  };

  const handleGenerateScript = () => {
    if (!personalPhoto && productImages.length === 0) {
      toast.error('Please upload at least one image (personal photo or product images)');
      return;
    }

    const keyFeaturesArray = scriptParams.keyFeatures 
      ? scriptParams.keyFeatures.split(',').map(f => f.trim()).filter(Boolean)
      : [];

    console.log('🚀 Starting script generation with:', {
      projectId,
      personalPhotoUrl: personalPhoto,
      productImages,
      targetAudience: scriptParams.targetAudience,
      keyFeatures: keyFeaturesArray,
      tone: scriptParams.tone,
      duration: scriptParams.duration,
    });

    generateScript.mutate({
      projectId,
      targetAudience: scriptParams.targetAudience,
      keyFeatures: keyFeaturesArray,
      tone: scriptParams.tone,
      duration: scriptParams.duration,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(project.created_at!)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>By {user?.email || 'Test User'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {getStatusBadge(project.status)}
      </div>

      {/* Milestone 3 Testing Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-600" />
            Milestone 3 Testing: AI Script Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Photo Upload */}
            <div>
              <Label className="text-base font-medium">Personal Photo</Label>
              <p className="text-sm text-muted-foreground mb-3">Upload your personal photo for the video</p>
              <FileUpload
                onUploadComplete={handlePersonalPhotoUpload}
                maxFiles={1}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                folder="personal-photos"
              />
              {personalPhoto && (
                <div className="mt-3">
                  <div className="relative aspect-square w-24 h-24 rounded-lg overflow-hidden">
                    <Image src={personalPhoto} alt="Personal photo" fill className="object-cover" />
                  </div>
                </div>
              )}
            </div>

            {/* Product Images Upload */}
            <div>
              <Label className="text-base font-medium">Product Images</Label>
              <p className="text-sm text-muted-foreground mb-3">Upload images of your product/project</p>
              <FileUpload
                onUploadComplete={handleProductImagesUpload}
                maxFiles={5}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                folder="product-images"
              />
              {productImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {productImages.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Script Parameters */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Script Generation Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={scriptParams.targetAudience}
                  onChange={(e) => setScriptParams(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g., developers, entrepreneurs, students"
                />
              </div>
              <div>
                <Label htmlFor="tone">Tone</Label>
                <select 
                  id="tone"
                  value={scriptParams.tone}
                  onChange={(e) => setScriptParams(prev => ({ ...prev, tone: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="energetic">Energetic</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="60"
                  value={scriptParams.duration}
                  onChange={(e) => setScriptParams(prev => ({ ...prev, duration: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="keyFeatures">Key Features (comma-separated)</Label>
              <Textarea
                id="keyFeatures"
                value={scriptParams.keyFeatures}
                onChange={(e) => setScriptParams(prev => ({ ...prev, keyFeatures: e.target.value }))}
                placeholder="e.g., real-time collaboration, AI-powered, mobile-first, secure"
                rows={3}
              />
            </div>
          </div>

          {/* Generate Script Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerateScript}
              disabled={generateScript.isPending}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {generateScript.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Script...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate AI Script
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Project:</span>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Script:</span>
                    {getStatusBadge(project.script_status || 'pending')}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Video:</span>
                    {getStatusBadge(project.video_status || 'pending')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Photo */}
          {project.personal_photo_url && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={project.personal_photo_url}
                    alt="Personal photo"
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Images */}
          {project.product_images && Array.isArray(project.product_images) && project.product_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Product Images ({project.product_images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                                 <div className="grid grid-cols-2 gap-3">
                   {project.product_images.map((url: string, index: number) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={url as string}
                        alt={`Product ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Video */}
          {project.video_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Generated Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <video
                    src={project.video_url}
                    controls
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="mt-3">
                  <Button asChild className="w-full">
                    <a href={project.video_url} download>
                      Download Video
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Script Editor */}
        <div className="lg:col-span-2">
          <ScriptEditor projectId={projectId} />
        </div>
      </div>
    </div>
  );
} 