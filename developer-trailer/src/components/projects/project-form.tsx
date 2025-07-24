'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/upload/file-upload';
import { Loader2, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  personalPhotoUrl: z.string().url('Please provide a valid URL').optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  isModal?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectForm({ isModal = false, onSuccess, onCancel }: ProjectFormProps) {
  const router = useRouter();
  const [personalPhotoUrls, setPersonalPhotoUrls] = useState<string[]>([]);
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProject = api.project.createProject.useMutation({
    onSuccess: (data) => {
      toast.success('Project created successfully!');
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/projects/${data.id}`);
      }
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const handlePersonalPhotoUpload = (urls: string[]) => {
    setPersonalPhotoUrls(urls);
    if (urls.length > 0) {
      setValue('personalPhotoUrl', urls[0]);
    }
  };

  const handlePersonalPhotoRemove = () => {
    setPersonalPhotoUrls([]);
    setValue('personalPhotoUrl', '');
  };

  const handleProductImageUpload = (urls: string[]) => {
    setProductImageUrls(urls);
  };

  const handleProductImageRemove = (index: number) => {
    const newUrls = productImageUrls.filter((_, i) => i !== index);
    setProductImageUrls(newUrls);
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (productImageUrls.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject.mutateAsync({
        title: data.title,
        description: data.description,
        personalPhotoUrl: data.personalPhotoUrl || null,
        productImages: productImageUrls,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!isModal && (
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-6 space-y-6">
            {/* Project Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Project Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter your project title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Project Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your project, what it does, and what makes it special..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Personal Photo */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Personal Photo (Optional)
              </Label>
              {personalPhotoUrls.length > 0 ? (
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={personalPhotoUrls[0]}
                      alt="Personal photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handlePersonalPhotoRemove}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a professional photo of yourself to appear in the video
                  </p>
                  <FileUpload
                    onUpload={handlePersonalPhotoUpload}
                    maxFiles={1}
                    acceptedFileTypes={{
                      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                    }}
                    folder="personal-photos"
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            {/* Product Images */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Product Images *
              </Label>
              <p className="text-sm text-gray-600">
                Upload images of your product or project (at least 1 required)
              </p>
              
              {productImageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {productImageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={url}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleProductImageRemove(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Support for images up to 5 MB each
                </p>
                <FileUpload
                  onUpload={handleProductImageUpload}
                  maxFiles={10}
                  acceptedFileTypes={{
                    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                  }}
                  folder="product-images"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isModal && (
        <div className="space-y-6">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Project Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter your project title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Project Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your project, what it does, and what makes it special..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Personal Photo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Personal Photo (Optional)
            </Label>
            {personalPhotoUrls.length > 0 ? (
              <div className="relative">
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={personalPhotoUrls[0]}
                    alt="Personal photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePersonalPhotoRemove}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload a professional photo of yourself to appear in the video
                </p>
                <FileUpload
                  onUpload={handlePersonalPhotoUpload}
                  maxFiles={1}
                  acceptedFileTypes={{
                    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                  }}
                  folder="personal-photos"
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {/* Product Images */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Product Images *
            </Label>
            <p className="text-sm text-gray-600">
              Upload images of your product or project (at least 1 required)
            </p>
            
            {productImageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {productImageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleProductImageRemove(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Support for images up to 5 MB each
              </p>
              <FileUpload
                onUpload={handleProductImageUpload}
                maxFiles={10}
                acceptedFileTypes={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                }}
                folder="product-images"
                className="mt-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              router.back();
            }
          }}
          className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
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
  );
}
