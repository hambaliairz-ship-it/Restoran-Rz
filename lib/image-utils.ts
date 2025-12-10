// Utility untuk kompresi gambar agar sesuai dengan card menu
// Ukuran optimal untuk card: 500x375 (4:3 aspect ratio)
const TARGET_WIDTH = 500;
const TARGET_HEIGHT = 375;
const QUALITY = 0.85;

export interface CompressOptions {
  cropToFit?: boolean;      // Crop ke aspect ratio 4:3
  addWhiteBg?: boolean;     // Tambah background putih
  maxSize?: number;         // Max ukuran dalam KB
}

export async function compressImage(
  file: File, 
  options: CompressOptions = {}
): Promise<string> {
  const { cropToFit = true, addWhiteBg = true } = options;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Gagal membuat canvas context'));
          return;
        }

        // Set ukuran canvas ke target (4:3)
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;

        // Tambah background putih jika diaktifkan
        if (addWhiteBg) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        }

        // Smoothing untuk kualitas lebih baik
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const imgAspect = img.width / img.height;
        const targetAspect = TARGET_WIDTH / TARGET_HEIGHT;

        let drawWidth: number;
        let drawHeight: number;
        let offsetX = 0;
        let offsetY = 0;

        if (cropToFit) {
          // Mode: Fit gambar ke dalam canvas dengan menjaga proporsi
          // Gambar akan di-center dan ada padding jika perlu
          if (imgAspect > targetAspect) {
            // Gambar lebih lebar - fit by width
            drawWidth = TARGET_WIDTH;
            drawHeight = TARGET_WIDTH / imgAspect;
            offsetY = (TARGET_HEIGHT - drawHeight) / 2;
          } else {
            // Gambar lebih tinggi - fit by height
            drawHeight = TARGET_HEIGHT;
            drawWidth = TARGET_HEIGHT * imgAspect;
            offsetX = (TARGET_WIDTH - drawWidth) / 2;
          }
        } else {
          // Mode: Cover - crop gambar untuk mengisi seluruh canvas
          if (imgAspect > targetAspect) {
            drawHeight = TARGET_HEIGHT;
            drawWidth = TARGET_HEIGHT * imgAspect;
            offsetX = -(drawWidth - TARGET_WIDTH) / 2;
          } else {
            drawWidth = TARGET_WIDTH;
            drawHeight = TARGET_WIDTH / imgAspect;
            offsetY = -(drawHeight - TARGET_HEIGHT) / 2;
          }
        }

        // Gambar ke canvas
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Convert ke base64 dengan kompresi
        const compressedBase64 = canvas.toDataURL('image/jpeg', QUALITY);
        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error('Gagal memuat gambar'));
    };

    reader.onerror = () => reject(new Error('Gagal membaca file'));
  });
}

// Kompresi gambar dengan crop ke tengah (untuk gambar yang perlu di-crop)
export async function compressImageCrop(file: File): Promise<string> {
  return compressImage(file, { cropToFit: false, addWhiteBg: false });
}

// Kompresi gambar dengan background putih (untuk gambar produk)
export async function compressImageWithBg(file: File): Promise<string> {
  return compressImage(file, { cropToFit: true, addWhiteBg: true });
}

export function getImageSizeFromBase64(base64: string): number {
  // Estimate ukuran file dalam KB
  const padding = (base64.match(/=+$/)?.[0]?.length) || 0;
  const sizeInBytes = (base64.length * 3) / 4 - padding;
  return Math.round(sizeInBytes / 1024);
}
