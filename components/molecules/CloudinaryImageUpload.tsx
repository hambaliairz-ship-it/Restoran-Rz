'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { uploadImageToCloudinary } from '@/lib/cloudinary-upload';

interface CloudinaryImageUploadProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  uploadPreset: string; // Your Cloudinary upload preset
  maxFileSize?: number; // in MB
  allowedFormats?: string[]; // e.g., ['jpeg', 'png', 'webp']
}

export function CloudinaryImageUpload({
  onUploadSuccess,
  uploadPreset,
  maxFileSize = 5,
  allowedFormats = ['jpeg', 'jpg', 'png', 'webp'],
}: CloudinaryImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && !allowedFormats.includes(fileExtension)) {
      setError(`Format file tidak didukung. Format yang diizinkan: ${allowedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxFileSize) {
      setError(`Ukuran file terlalu besar. Maksimal ${maxFileSize}MB.`);
      return;
    }

    setError(null);
    setPreviewUrl(URL.createObjectURL(file));

    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Cloudinary
      const result = await uploadImageToCloudinary(file, uploadPreset);
      
      clearInterval(progressInterval);
      setProgress(100);

      // Call the success callback with the secure URL and public ID
      onUploadSuccess(result.secure_url, result.public_id);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload gagal. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedFormats.map(fmt => `.${fmt}`).join(',')}
        className="hidden"
      />

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-contain rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md">
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Klik untuk upload gambar menu
              </p>
              <p className="text-xs text-gray-500">
                Maksimal {maxFileSize}MB • {allowedFormats.join(', ')}
              </p>
            </div>
          )}
        </CardContent>

        {isUploading && (
          <CardFooter className="p-4">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardFooter>
        )}
      </Card>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      {!previewUrl && !isUploading && (
        <Button
          type="button"
          onClick={triggerFileSelect}
          variant="outline"
          className="w-full"
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          Pilih Gambar
        </Button>
      )}
    </div>
  );
}