'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Upload, Loader2 } from 'lucide-react';
import { api } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { FileUpload } from '@/components/upload/file-upload';
import Link from 'next/link';
import Image from 'next/image';

export default function CreateProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    personalPhotoUrl: '',
    productImages: [] as string[],
  });

  const createProject = api.project.createProject.useMutation({
    onSuccess: (project) => {
      toast.success('Project created successfully!');
      router.push(`/projects/${project.id}`);
    },
    onError: (error) => {
      toast.error('Failed to create project');
      console.error('Create project error:', error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    console.log('Creating project with data:', formData);
    
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        personalPhotoUrl: formData.personalPhotoUrl || null,
        productImages: formData.productImages.length > 0 ? formData.productImages : ['https://via.placeholder.com/300x200'],
      };
      
      await createProject.mutateAsync(projectData);
    } catch (error) {
      console.error('Create project error:', error);
      setIsSubmitting(false);
    }
  };

  const handlePersonalPhotoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, personalPhotoUrl: urls[0] }));
      console.log('📸 Personal photo uploaded:', urls[0]);
      toast.success('Personal photo uploaded!');
    }
  };

  const handleProductImagesUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, productImages: [...prev.productImages, ...urls] }));
    console.log('🖼️ Product images uploaded:', urls);
    toast.success(`Uploaded ${urls.length} product image(s)!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">Create New Project</h1>
            <p className="text-muted-foreground">
              Start by creating your project. You can upload images and generate AI scripts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your project title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project, what it does, and its key features"
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Images (Optional)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload images now or add them later. These will be used for AI script generation.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Photo */}
              <div>
                <Label className="text-base font-medium">Personal Photo</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload your personal photo to personalize the video
                </p>
                <FileUpload
                  onUploadComplete={handlePersonalPhotoUpload}
                  maxFiles={1}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                  folder="personal-photos"
                />
                {formData.personalPhotoUrl && (
                  <div className="mt-3">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <Image 
                        src={formData.personalPhotoUrl} 
                        alt="Personal photo" 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Product Images */}
              <div>
                <Label className="text-base font-medium">Product Images</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload images of your product, app screenshots, or project visuals
                </p>
                <FileUpload
                  onUploadComplete={handleProductImagesUpload}
                  maxFiles={5}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                  folder="product-images"
                />
                {formData.productImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {formData.productImages.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image 
                          src={url} 
                          alt={`Product ${index + 1}`} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 