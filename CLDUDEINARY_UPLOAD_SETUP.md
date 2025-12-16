# Cloudinary Direct Upload Setup

Untuk mengimplementasikan upload gambar langsung ke Cloudinary (mengurangi penggunaan Netlify Credits), ikuti langkah-langkah berikut:

## 1. Konfigurasi Cloudinary

### Buat Upload Preset
1. Login ke akun Cloudinary Anda
2. Buka menu **Settings** > **Upload**
3. Gulir ke bawah ke bagian **Upload presets**
4. Klik **Add upload preset**
5. Atur konfigurasi:
   - **Mode**: Unsigned (agar bisa upload dari client tanpa API Secret)
   - **Name**: Contoh: `menu_images` 
   - **Folder**: Opsional, bisa diisi nama folder untuk mengelompokkan gambar
   - **Restrictions**: Atur batasan ukuran file jika perlu
   - **Transformation**: Atur kompresi otomatis (misalnya: kualitas 80%)

## 2. Konfigurasi Environment Variables

Tambahkan ke environment variables di Netlify (dalam Settings > Environment Variables):

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

## 3. Implementasi di Kode

Kode yang telah disediakan:

- `lib/cloudinary-upload.ts`: Fungsi helper untuk upload langsung ke Cloudinary
- `components/molecules/CloudinaryImageUpload.tsx`: Komponen UI untuk upload gambar
- `app/(platform)/admin/menu/menu-management-updated.tsx`: Versi terbaru dari menu management dengan integrasi upload langsung

## 4. Perubahan pada Server Action

File `app/(platform)/admin/menu/actions.ts` telah dimodifikasi untuk:

- Tidak lagi melakukan proses upload gambar di sisi server
- Hanya menerima URL gambar yang sudah diupload ke Cloudinary
- Mengurangi waktu eksekusi server action secara signifikan

## 5. Keuntungan Implementasi Ini

1. **Mengurangi Penggunaan Netlify Credits**: Proses upload tidak lagi melalui Netlify Functions
2. **Waktu Respon Lebih Cepat**: Upload langsung dari client ke Cloudinary
3. **Skalabilitas Lebih Baik**: Tidak membebani server dengan proses upload dan kompresi
4. **Keamanan**: Menggunakan upload preset unsigned, tidak perlu menyimpan API Secret di client

## 6. Konfigurasi Opsional

Anda bisa menambahkan transformasi otomatis di upload preset Cloudinary untuk:

- Resize gambar ke ukuran optimal
- Kompresi otomatis
- Konversi format (misalnya ke WebP untuk browser yang mendukung)