# Deployment Troubleshooting Guide

Dokumen ini menjelaskan langkah-langkah untuk menyelesaikan masalah yang sering terjadi saat deploy aplikasi Restoran RZ ke Netlify, terutama terkait fitur "Tambah Menu Baru".

## Masalah Umum dan Solusi

### 1. "Gagal menambahkan menu" saat menekan tombol "Simpan Menu"

#### Penyebab Umum:
- Konfigurasi database salah atau tidak lengkap
- Database production belum diinisialisasi atau migrasi belum dijalankan
- Kesalahan URL database di environment variables
- Konfigurasi Neon tidak sesuai

#### Solusi Langkah-demi-Langkah:

1. **Periksa Environment Variables di Netlify Dashboard**
   - Pastikan `DATABASE_URL` sudah diatur dengan benar
   - Format: `postgresql://username:password@host:port/database_name?sslmode=require`
   - Contoh: `postgresql://user123:pass456@ep-ancient-frog-123456.us-east-1.aws.neon.tech/neondb?sslmode=require`

2. **Verifikasi Database Connection**
   - Pastikan database Anda (misalnya Neon) bisa diakses
   - Pastikan nama database, username, dan password benar
   - Pastikan SSL mode diatur ke `require`

3. **Jalankan Migrasi Database ke Production**
   ```bash
   # Untuk menjalankan migrasi ke production database
   DATABASE_URL="your_production_database_url" npx drizzle-kit push
   ```
   
   Atau, jika menggunakan Neon:
   ```bash
   npx drizzle-kit push --config=drizzle.config.ts
   ```

4. **Pastikan Tabel Dibutuhkan Telah Dibuat**
   - Tabel yang harus ada: `menu_items`, `categories`, `ingredients`, `menu_ingredients`, `stock_transactions`, `orders`, `order_items`, `payments`, `user`, `session`, `account`, `verification`
   - Pastikan struktur tabel sesuai dengan skema di `db/schema/menu.ts`

5. **Periksa Logs Netlify**
   - Buka Netlify Dashboard
   - Lihat "Deploys" tab untuk mengecek log build
   - Lihat "Functions" tab untuk mengecek log server functions

6. **Test Lokal dengan Production Environment**
   - Buat `.env.local` dengan konfigurasi production
   - Jalankan `npm run dev` untuk test lokal

### 2. Build Error di Netlify

#### Jika ada error saat build:
1. Pastikan semua dependencies di `package.json` benar
2. Pastikan tidak ada secret keys di file yang di-commit
3. Pastikan `DATABASE_URL` tersedia saat build (jika diperlukan)

#### Solusi:
```bash
# Cek versi Node.js yang digunakan
node -v

# Pastikan versi Node.js di Netlify sesuai (lihat package.json)
```

### 3. Error Koneksi Database di Production

#### Indikasi:
- Error "Database connection failed" di logs
- Error "ECONNREFUSED" saat mencoba mengakses database
- Error saat mencoba "Tambah Menu Baru"

#### Solusi:
1. Pastikan `DATABASE_URL` di Netlify tidak mengandung karakter khusus yang perlu di-escape
2. Pastikan firewall database mengizinkan koneksi dari Netlify
3. Untuk Neon, pastikan Postgres setting diatur ke "Allow all connections"

### 4. Migrasi Database

#### Jalankan migrasi lokal ke production:
```bash
# Pastikan DATABASE_URL mengarah ke production database
npx drizzle-kit push
```

#### Buat migrasi baru:
```bash
npx drizzle-kit generate
```

#### Deploy migrasi ke production:
```bash
# Pastikan Anda menggunakan production DATABASE_URL
DATABASE_URL="your_production_url" npx drizzle-kit push
```

## Checklist Sebelum Deploy

- [ ] Environment variables sudah diatur di Netlify
- [ ] Database production sudah dibuat dan dapat diakses
- [ ] Migrasi database sudah dijalankan ke production
- [ ] Tabel-tabel yang dibutuhkan sudah ada di production database
- [ ] Secret keys tidak di-commit ke repository
- [ ] Cek kembali format `DATABASE_URL` di environment variables
- [ ] Test lokal dengan production database URL (opsional tapi direkomendasikan)

## Debugging di Production

Jika masih ada error, aktifkan logging lebih detail:

1. Tambahkan logging tambahan di server functions
2. Periksa Netlify Functions logs
3. Gunakan development tools untuk test API endpoints

## Contoh .env Production

```env
# Production Database - GANTI DENGAN PRODUCTION URL
DATABASE_URL="postgresql://username:password@host:port/database_name?sslmode=require"

# Auth Configuration
BETTER_AUTH_SECRET="generate_a_strong_secret_key"
BETTER_AUTH_URL="https://your-app.netlify.app"
NEXT_PUBLIC_BETTER_AUTH_URL="https://your-app.netlify.app"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://your-app.netlify.app"
NEXT_PUBLIC_API_URL="https://your-app.netlify.app/api"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="https://your-app.netlify.app/api/auth/callback/google"

# Optional: Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## Support dan Bantuan

Jika masih mengalami masalah:
1. Cek logs Netlify terlebih dahulu
2. Pastikan format `DATABASE_URL` benar dan bisa diakses
3. Pastikan migrasi sudah dijalankan ke production database
4. Hubungi dukungan database (Neon, Supabase, dsb.) jika perlu