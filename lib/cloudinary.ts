import { v2 as cloudinary } from 'cloudinary';

// Log Cloudinary configuration values (only the first 4 characters of API secret for security)
console.log('Cloudinary Config Check:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Present' : 'Missing',
    api_key: process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.substring(0, 4) + '...' : 'Missing'
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a base64 image to Cloudinary
 * @param base64Image - Base64 encoded image string (with data:image prefix)
 * @param folder - Optional folder name in Cloudinary (default: 'menu-items')
 * @returns Promise<string> - Public URL of the uploaded image
 */
export async function uploadImage(
    base64Image: string,
    folder: string = 'menu-items'
): Promise<string> {
    try {
        console.log('Uploading image to Cloudinary...');
        console.log('Cloudinary configuration status:', {
            cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
            api_key: !!process.env.CLOUDINARY_API_KEY,
            api_secret: !!process.env.CLOUDINARY_API_SECRET
        });

        // Validate that environment variables are properly set
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            throw new Error('Kredensial Cloudinary tidak ditemukan. Harap cek environment variables.');
        }

        // Validate that the base64 image string is properly formatted
        if (!base64Image || typeof base64Image !== 'string' || !base64Image.startsWith('data:')) {
            throw new Error('Format gambar tidak valid. Harap pastikan gambar dalam format base64 yang benar.');
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { width: 800, height: 600, crop: 'limit' }, // Limit max dimensions
                { quality: 'auto:good' }, // Auto quality optimization
                { fetch_format: 'auto' }, // Auto format (WebP for modern browsers)
            ],
        });

        console.log('Image uploaded successfully:', result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error details:', error);

        // Provide more specific error messages
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
            errorMessage = error.message;

            // Specific error handling for common Cloudinary issues
            if (errorMessage.toLowerCase().includes('cloud_name mismatch')) {
                console.error('CLOUDINARY CONFIG ERROR: Cloud name mismatch detected');
                errorMessage = 'Kesalahan konfigurasi Cloudinary: Cloud Name tidak cocok dengan API Key dan API Secret. Pastikan ketiganya berasal dari akun Cloudinary yang sama. Harap periksa kembali kredensial Anda.';
            } else if (errorMessage.toLowerCase().includes('unauthorized') || errorMessage.includes('401')) {
                console.error('CLOUDINARY AUTH ERROR: Unauthorized access');
                errorMessage = 'Kesalahan autentikasi Cloudinary: API Key atau API Secret tidak valid.';
            } else if (errorMessage.toLowerCase().includes('timeout')) {
                console.error('CLOUDINARY NETWORK ERROR: Request timeout');
                errorMessage = 'Koneksi ke Cloudinary timeout. Harap cek koneksi internet Anda.';
            } else if (errorMessage.toLowerCase().includes('access denied') || errorMessage.includes('403')) {
                console.error('CLOUDINARY PERMISSION ERROR: Access denied');
                errorMessage = 'Akses ditolak oleh Cloudinary. Harap cek izin kredensial Anda.';
            } else if (errorMessage.toLowerCase().includes('bad request') || errorMessage.includes('400')) {
                console.error('CLOUDINARY REQUEST ERROR: Bad request');
                errorMessage = 'Permintaan upload tidak valid. Harap cek format gambar.';
            }
        } else {
            console.error('CLOUDINARY UNKNOWN ERROR: Non-Error object received');
        }

        console.error('Formatted error message:', errorMessage);
        // Jangan tambahkan prefiks "Gagal upload gambar:" karena nanti akan ditangani di createMenuItem
        throw new Error(errorMessage);
    }
}

/**
 * Delete an image from Cloudinary
 * @param imageUrl - Public URL of the image to delete
 * @returns Promise<void>
 */
export async function deleteImage(imageUrl: string): Promise<void> {
    try {
        // Extract public_id from URL
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/menu-items/abc123.jpg
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        if (uploadIndex === -1) {
            throw new Error('Invalid Cloudinary URL');
        }

        // Get everything after 'upload/v{version}/' and remove file extension
        const publicIdWithFolder = urlParts.slice(uploadIndex + 2).join('/');
        const publicId = publicIdWithFolder.replace(/\.[^/.]+$/, ''); // Remove extension

        console.log('Deleting image from Cloudinary:', publicId);
        await cloudinary.uploader.destroy(publicId);
        console.log('Image deleted successfully');
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        // Don't throw error for delete failures (non-critical)
    }
}
