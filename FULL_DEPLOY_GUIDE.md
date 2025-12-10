# Panduan Lengkap Deploy Restoran-Rz ke Netlify

## Persiapan Sebelum Deploy

### 1. Pastikan Repository Terbaru
- Commit semua perubahan ke repository
- Pastikan file-file telah diperbarui dengan konfigurasi Netlify yang benar

### 2. Siapkan Database Neon
- Pastikan project database di Neon telah dibuat
- Buat connection string yang siap digunakan untuk produksi
- Salin connection string tersebut (akan digunakan nanti)

### 3. Buat Secret Key untuk Better Auth
Jalankan perintah ini di terminal untuk membuat secret key yang kuat:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Langkah-langkah Deploy ke Netlify

### 1. Buka Dashboard Netlify
- Kunjungi https://app.netlify.com/
- Login ke akun Anda

### 2. Buat Situs Baru
- Klik "New site from Git"
- Pilih platform repository Anda (GitHub, GitLab, atau Bitbucket)
- Pilih repository yang berisi proyek Restoran-Rz

### 3. Konfigurasi Build Settings
Pastikan konfigurasi berikut:
- **Build command**: `npm run build`
- **Publish directory**: `.next`

### 4. Konfigurasi Environment Variables
Sebelum klik "Deploy", klik bagian "Advanced" dan tambahkan environment variables berikut:

#### Database Variables:
```
DATABASE_URL = "postgresql://username:password@ep-xxxxxxx.region.provider.neon.tech/database_name?sslmode=require"
POSTGRES_DB = "database_name"
POSTGRES_USER = "username"
POSTGRES_PASSWORD = "password"
```

#### Authentication Variables:
```
BETTER_AUTH_SECRET = "isi_dengan_secret_key_yang_sudah_dibuat_di_langkah_sebelumnya"
BETTER_AUTH_URL = "https://restoran-rz.netlify.app"
NEXT_PUBLIC_BETTER_AUTH_URL = "https://restoran-rz.netlify.app"
```

### 5. Mulai Deploy
- Klik "Deploy site"
- Tunggu proses selesai (mungkin beberapa menit)

## Setelah Deploy Selesai

### 1. Tunggu Migration Database
Proses deploy pertama kali akan membuat skema database secara otomatis melalui skrip predev.

### 2. Cek Logs
- Buka tab "Deploys" untuk melihat logs
- Pastikan tidak ada error fatal

### 3. Akses Situs
- Setelah selesai deploy, situs akan tersedia di URL seperti `https://restoran-rz.netlify.app`
- Jika nama subdomain sudah digunakan, Netlify akan memberikan nama acak

## Solusi Masalah Umum

### 1. Build Gagal
- Cek logs deploy di Netlify
- Pastikan semua dependencies sudah benar
- Pastikan environment variables diisi lengkap

### 2. Error Database
- Pastikan connection string dari Neon benar
- Pastikan parameter `?sslmode=require` ada di akhir connection string
- Pastikan database Neon tidak dalam mode paused

### 3. Error Autentikasi
- Pastikan `BETTER_AUTH_SECRET` benar dan konsisten
- Pastikan `BETTER_AUTH_URL` dan `NEXT_PUBLIC_BETTER_AUTH_URL` sesuai dengan domain produksi

### 4. API Routes Tidak Berfungsi
- Pastikan plugin Next.js diaktifkan di Netlify
- Pastikan file `netlify.toml` sudah benar

## Tips Tambahan

- Simpan secret key dan connection string di tempat aman
- Jangan pernah commit file .env ke repository publik
- Periksa logs secara berkala setelah deploy untuk memastikan semuanya berjalan lancar
- Gunakan custom domain jika ingin menggunakan nama domain sendiri

## Troubleshooting Tambahan

Jika Anda mengalami masalah dengan API routes, Anda mungkin perlu menambahkan fungsi edge ke Netlify. File `netlify.toml` yang kita buat sudah mencakup konfigurasi dasar untuk Next.js, termasuk API routes.