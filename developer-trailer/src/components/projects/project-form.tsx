'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/upload/file-upload';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  personalPhotoUrl: z.string().url('Please provide a valid URL').optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  onCancel?: () => void;
  isModal?: boolean;
}

export function ProjectForm({ onCancel, isModal = false }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [personalPhotoUrls, setPersonalPhotoUrls] = useState<string[]>([]);
  
  const router = useRouter();
  const createProject = api.project.create.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const handleProductImagesUpload = (urls: string[]) => {
    setProductImages(prev => [...prev, ...urls]);
  };

  const handlePersonalPhotoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setPersonalPhotoUrls(urls);
      setValue('personalPhotoUrl', urls[0]);
    }
  };

  const removeProductImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const removePersonalPhoto = () => {
    setPersonalPhotoUrls([]);
    setValue('personalPhotoUrl', '');
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (productImages.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createProject.mutateAsync({
        title: data.title,
        description: data.description,
        personalPhotoUrl: data.personalPhotoUrl || undefined,
        productImages,
      });

      toast.success('Project created successfully!');
      reset();
      setProductImages([]);
      setPersonalPhotoUrls([]);
      
      if (isModal && onCancel) {
        onCancel();
      } else {
        router.push(`/projects/${result.id}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={isModal ? 'border-0 shadow-none' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Project
          </span>
          {isModal && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="Enter your project title"
                {...register('title')}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project, what it does, and what makes it special..."
                rows={4}
                {...register('description')}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Personal Photo Upload */}
          <div className="space-y-2">
            <Label>Personal Photo (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              Upload a professional photo of yourself to appear in the video
            </p>
            
            {personalPhotoUrls.length > 0 ? (
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <img
                    src={personalPhotoUrls[0]}
                    alt="Personal photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Personal photo uploaded</p>
                  <p className="text-xs text-muted-foreground">This will appear in your video</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removePersonalPhoto}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <FileUpload
                onUploadComplete={handlePersonalPhotoUpload}
                maxFiles={1}
                folder="personal-photos"
                className="border rounded-lg"
              />
            )}
          </div>

          {/* Product Images Upload */}
          <div className="space-y-2">
            <Label>Product Images *</Label>
            <p className="text-sm text-muted-foreground">
              Upload images of your product or project (at least 1 required)
            </p>
            
            {productImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {productImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeProductImage(index)}
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <FileUpload
              onUploadComplete={handleProductImagesUpload}
              maxFiles={5}
              folder="product-images"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting || productImages.length === 0}
              className="flex-1"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
