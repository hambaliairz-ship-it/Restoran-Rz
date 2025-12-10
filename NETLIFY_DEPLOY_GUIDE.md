# Panduan Deploy ke Netlify untuk Restoran-Rz

## Prasyarat
- Pastikan Anda memiliki akun Netlify
- Aplikasi harus berjalan dengan baik secara lokal sebelum deploy

## Langkah-langkah Deploy

### 1. Siapkan Repository
1. Pastikan kode Anda sudah di-commit ke repository Git (GitHub, GitLab, atau Bitbucket)
2. Repository harus berisi semua perubahan yang telah dibuat untuk konfigurasi Netlify

### 2. Deploy ke Netlify
1. Buka https://app.netlify.com/
2. Klik "New site from Git"
3. Pilih platform repository Anda dan autentikasi
4. Pilih repository yang berisi aplikasi Restoran-Rz Anda
5. Pada bagian "Build & deploy settings", pastikan konfigurasi berikut:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Environment variables**: Lihat bagian di bawah

### 3. Konfigurasi Environment Variables di Netlify

Di dashboard Netlify, pergi ke:
- Site Settings → Build & deploy → Environment → Environment variables

Tambahkan variabel-variabel berikut:

#### Variabel Wajib:
```
DATABASE_URL = "postgresql://username:password@host:port/database_name"
BETTER_AUTH_SECRET = "buat_secret_key_yang_sangat_panjang_dan_kuat_disini_min_32_karakter"
BETTER_AUTH_URL = "https://restoran-rz.netlify.app"
NEXT_PUBLIC_BETTER_AUTH_URL = "https://restoran-rz.netlify.app"
```

#### Catatan Penting:
- `BETTER_AUTH_SECRET` harus berupa string acak yang sangat panjang (minimal 32 karakter) dan tidak boleh dibagikan
- `DATABASE_URL` harus merupakan URL database PostgreSQL produksi Anda
- Gantilah `restoran-rz.netlify.app` dengan nama domain Netlify Anda yang sebenarnya

### 4. Build dan Deploy
Setelah semua konfigurasi selesai:
1. Kembali ke dashboard situs Anda
2. Klik "Deploy site" atau biarkan otomatis deploy jika repository terhubung

## Konfigurasi Tambahan untuk Keamanan

### 1. Plugin Netlify
File `netlify.toml` sudah mencakup plugin `@netlify/plugin-nextjs` untuk menangani build dan deploy Next.js dengan benar.

### 2. Security Headers
File `netlify.toml` juga mencakup beberapa security headers penting:
- `X-Frame-Options`: Mencegah clickjacking
- `X-Content-Type-Options`: Mencegah MIME type sniffing
- `Referrer-Policy`: Mengontrol informasi referrer

### 3. Trusted Origins
Dalam file `lib/auth.ts`, domain produksi (`https://restoran-rz.netlify.app`) telah ditambahkan ke daftar `trustedOrigins` untuk keamanan autentikasi.

## Solusi Masalah Umum

### 1. Autentikasi Tidak Bekerja
- Pastikan `BETTER_AUTH_URL` dan `NEXT_PUBLIC_BETTER_AUTH_URL` diatur dengan benar ke domain produksi
- Pastikan `BETTER_AUTH_SECRET` konsisten antara local development dan produksi

### 2. Database Tidak Dapat Diakses
- Pastikan `DATABASE_URL` valid dan dapat diakses dari server Netlify
- Pastikan schema database sudah dipush ke production database

### 3. API Routes 404
- Pastikan plugin Next.js diaktifkan
- Pastikan `.next` adalah direktori publish Anda

### 4. Gambar Tidak Muncul
- File `next.config.ts` sudah mengizinkan `images.unsplash.com`
- Untuk gambar lokal, pastikan path benar dan assets di-build dengan benar

## Setelah Deploy

1. Cek logs deploy di Netlify dashboard jika terjadi error
2. Uji semua fitur penting: login, registrasi, pembuatan pesanan, dsb.
3. Pastikan semua link dan API requests bekerja dengan benar
4. Cek apakah semua gambar dan assets dimuat dengan benar
5. Periksa apakah mode gelap/terang berfungsi dengan benar

## Domain Kustom (Opsional)

Jika Anda ingin menggunakan domain kustom:
1. Di dashboard Netlify, pergi ke "Domain settings"
2. Tambahkan domain kustom Anda
3. Update semua env var `BETTER_AUTH_URL` dan `NEXT_PUBLIC_BETTER_AUTH_URL` sesuai domain baru
4. Update juga `trustedOrigins` di `lib/auth.ts` jika diperlukan