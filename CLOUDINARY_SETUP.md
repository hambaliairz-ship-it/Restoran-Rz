# Environment Variables - Cloudinary Configuration

Untuk menggunakan fitur upload gambar, Anda perlu menambahkan kredensial Cloudinary ke environment variables.

## 1. Buat Akun Cloudinary (Gratis)

1. Kunjungi: https://cloudinary.com/users/register_free
2. Daftar dengan email Anda
3. Setelah login, buka Dashboard
4. Copy kredensial berikut:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## 2. Tambahkan ke `.env.local` (Development)

Buat atau edit file `.env.local` di root project:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Ganti** `your_cloud_name_here`, `your_api_key_here`, dan `your_api_secret_here` dengan kredensial Anda.

## 3. Tambahkan ke Netlify (Production)

1. Buka Netlify Dashboard: https://app.netlify.com
2. Pilih site Anda: `restoran-nzan`
3. Klik **Site configuration** → **Environment variables**
4. Tambahkan 3 variabel berikut:

| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | (cloud name Anda) |
| `CLOUDINARY_API_KEY` | (API key Anda) |
| `CLOUDINARY_API_SECRET` | (API secret Anda) |

5. Klik **Save**
6. **Deploy ulang** site Anda (Netlify akan otomatis redeploy)

## 4. Verifikasi

### Local:
```bash
npm run dev
```
- Buka http://localhost:3000/admin/menu
- Coba tambah menu dengan gambar
- Cek console log untuk "Image uploaded successfully"

### Production:
- Buka https://restoran-nzan.netlify.app/admin/menu
- Coba tambah menu dengan gambar
- Cek Netlify Functions logs untuk konfirmasi upload

## Troubleshooting

### Error: "Gagal upload gambar"
- Pastikan kredensial Cloudinary sudah benar
- Cek apakah environment variables sudah di-save di Netlify
- Redeploy site setelah menambah env vars
- **Verifikasi kredensial**: Jalankan `npx tsx test-cloudinary.ts` untuk memastikan semua kredensial valid
- Pastikan Cloud Name, API Key, dan API Secret dari akun Cloudinary yang SAMA

### Error: "cloud_name mismatch" atau HTTP 401
- Ini berarti Cloud Name tidak cocok dengan API Key dan API Secret
- **Pastikan ketiga kredensial berasal dari akun Cloudinary yang sama**
- Cek kembali Dashboard Cloudinary Anda untuk mendapatkan kredensial yang sesuai

### Error: "Unknown error"
- Jika muncul error "Unknown error" saat upload, kemungkinan ada masalah dengan kredensial
- Jalankan `npx tsx test-cloudinary.ts` untuk mendapatkan informasi detail
- Pastikan ketiga kredensial (Cloud Name, API Key, API Secret) diketik dengan benar dan berasal dari akun Cloudinary yang sama

### Gambar tidak muncul
- Cek apakah URL di database dimulai dengan `https://res.cloudinary.com/`
- Pastikan gambar berhasil di-upload ke Cloudinary Dashboard

## Keuntungan Cloudinary

✅ **Gratis**: 25GB storage, 25GB bandwidth/bulan
✅ **CDN**: Gambar di-deliver cepat dari server terdekat
✅ **Auto-optimization**: Format WebP otomatis untuk browser modern
✅ **Resize otomatis**: Gambar di-resize ke 800x600 max
✅ **Tidak ada limit database**: Hanya URL yang disimpan di database
