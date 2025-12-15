// Utility untuk kompresi gambar agar sesuai dengan card menu
// Ukuran optimal untuk card: 400x300 (4:3 aspect ratio) - dikurangi untuk base64 lebih kecil
const TARGET_WIDTH = 300;
const TARGET_HEIGHT = 225;
const MAX_SIZE_KB = 40; // Maksimum ukuran dalam KB

export interface CompressOptions {
  cropToFit?: boolean;      // Crop ke aspect ratio 4:3
  addWhiteBg?: boolean;     // Tambah background putih
  maxSizeKB?: number;       // Max ukuran dalam KB
}

function getBase64Size(base64: string): number {
  const padding = (base64.match(/=+$/)?.[0]?.length) || 0;
  const sizeInBytes = (base64.length * 3) / 4 - padding;
  return Math.round(sizeInBytes / 1024);
}

function compressToCanvas(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  cropToFit: boolean,
  addWhiteBg: boolean
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Gagal membuat canvas context');
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  if (addWhiteBg) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const imgAspect = img.width / img.height;
  const targetAspect = targetWidth / targetHeight;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX = 0;
  let offsetY = 0;

  if (cropToFit) {
    if (imgAspect > targetAspect) {
      drawWidth = targetWidth;
      drawHeight = targetWidth / imgAspect;
      offsetY = (targetHeight - drawHeight) / 2;
    } else {
      drawHeight = targetHeight;
      drawWidth = targetHeight * imgAspect;
      offsetX = (targetWidth - drawWidth) / 2;
    }
  } else {
    if (imgAspect > targetAspect) {
      drawHeight = targetHeight;
      drawWidth = targetHeight * imgAspect;
      offsetX = -(drawWidth - targetWidth) / 2;
    } else {
      drawWidth = targetWidth;
      drawHeight = targetWidth / imgAspect;
      offsetY = -(drawHeight - targetHeight) / 2;
    }
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  return canvas;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const { cropToFit = true, addWhiteBg = true, maxSizeKB = MAX_SIZE_KB } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        try {
          const canvas = compressToCanvas(img, TARGET_WIDTH, TARGET_HEIGHT, cropToFit, addWhiteBg);

          // Kompresi iteratif - mulai dari quality tinggi, turunkan sampai di bawah maxSize
          let quality = 0.7;
          let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          let size = getBase64Size(compressedBase64);

          // Turunkan quality secara bertahap sampai ukuran di bawah batas
          while (size > maxSizeKB && quality > 0.1) {
            quality -= 0.1;
            compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            size = getBase64Size(compressedBase64);
          }

          // Jika masih terlalu besar, kurangi dimensi
          if (size > maxSizeKB) {
            const smallerCanvas = compressToCanvas(
              img,
              Math.round(TARGET_WIDTH * 0.6),
              Math.round(TARGET_HEIGHT * 0.6),
              cropToFit,
              addWhiteBg
            );
            compressedBase64 = smallerCanvas.toDataURL('image/jpeg', 0.5);
          }

          resolve(compressedBase64);
        } catch (error) {
          reject(error);
        }
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
