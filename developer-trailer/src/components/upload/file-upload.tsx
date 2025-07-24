'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface FileUploadProps {
  onUpload?: (urls: string[]) => void;
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  folder?: string;
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  url?: string;
  progress: number;
  error?: string;
}

export function FileUpload({
  onUpload,
  onUploadComplete,
  maxFiles = 5,
  acceptedFileTypes,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  folder = 'uploads',
  className = '',
}: FileUploadProps) {
  // Use acceptedFileTypes if provided, otherwise fall back to accept
  const fileTypes = acceptedFileTypes || accept;
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // For testing purposes, we'll use a mock user ID if no user is authenticated
    const userId = user?.id || 'test-user-id';

    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    const uploadPromises = newFiles.map(async (fileObj) => {
      try {
        const fileExt = fileObj.file.name.split('.').pop();
        const fileName = `${userId}/${folder}/${fileObj.id}.${fileExt}`;

        // Update progress
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileObj.id ? { ...f, progress: 50 } : f)
        );

        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, fileObj.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);

        // Update with success
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileObj.id ? { 
            ...f, 
            progress: 100, 
            url: publicUrl 
          } : f)
        );

        return publicUrl;
      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileObj.id ? { 
            ...f, 
            error: error instanceof Error ? error.message : 'Upload failed' 
          } : f)
        );
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean) as string[];
    
    setIsUploading(false);
    
    if (successfulUploads.length > 0) {
      toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
      onUpload?.(successfulUploads);
      onUploadComplete?.(successfulUploads);
    }
  }, [user, uploadedFiles.length, maxFiles, folder, supabase, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes,
    maxSize,
    disabled: isUploading || uploadedFiles.length >= maxFiles,
  });

  const removeFile = async (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove?.url) {
      // Extract file path from URL
      const urlParts = fileToRemove.url.split('/uploads/')[1];
      if (urlParts) {
        await supabase.storage.from('uploads').remove([urlParts]);
      }
    }
    
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isUploading || uploadedFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            
            {isDragActive ? (
              <p className="text-lg font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Support for images up to {formatFileSize(maxSize)} each
                </p>
                <Button variant="outline" disabled={isUploading || uploadedFiles.length >= maxFiles}>
                  Select Files
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((fileObj) => (
            <Card key={fileObj.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* File Preview */}
                  <div className="flex-shrink-0">
                    {fileObj.url ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={fileObj.url}
                          alt={fileObj.file.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileObj.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(fileObj.file.size)}
                    </p>
                    
                    {/* Progress or Error */}
                    {fileObj.error ? (
                      <div className="flex items-center mt-2 text-destructive">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <span className="text-xs">{fileObj.error}</span>
                      </div>
                    ) : fileObj.progress < 100 ? (
                      <Progress value={fileObj.progress} className="mt-2" />
                    ) : (
                      <p className="text-xs text-green-600 mt-1">Upload complete</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileObj.id)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
