/**
 * Client-side upload to Cloudinary using unsigned upload
 * This allows upload without exposing API Secret to client
 */

interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
}

/**
 * Upload image directly to Cloudinary from client
 * @param file - The image file to upload
 * @param uploadPreset - Your Cloudinary upload preset name
 * @returns Promise with upload result
 */
export async function uploadImageToCloudinary(
  file: File,
  uploadPreset: string
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset); // This should match your Cloudinary upload preset

  // Replace 'your_cloud_name' with your actual Cloudinary cloud name
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable.');
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  const result = await response.json();
  return result;
}

/**
 * Generate Cloudinary URL from public ID
 * @param publicId - The public ID of the uploaded image
 * @param options - Optional transformation options
 * @returns Cloudinary image URL
 */
export function generateCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  }
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }

  let transformation = '';
  if (options) {
    const params = [];
    if (options.width) params.push(`w_${options.width}`);
    if (options.height) params.push(`h_${options.height}`);
    if (options.crop) params.push(`c_${options.crop}`);
    if (options.quality) params.push(`q_${options.quality}`);
    if (options.format) params.push(`f_${options.format}`);
    
    if (params.length > 0) {
      transformation = `/${params.join(',')}`;
    }
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload${transformation}/${publicId}`;
}