# Panduan Konfigurasi Database Neon untuk Produksi

## Mendapatkan Connection String dari Neon

1. Buka dashboard Neon di https://neon.tech/
2. Login ke akun Anda
3. Pilih project database yang ingin Anda gunakan untuk produksi
4. Di sidebar kiri, klik "Connection details"
5. Pilih aplikasi Anda (misalnya: "Your own application")
6. Copy connection string yang ditampilkan

Contoh connection string dari Neon:
```
postgresql://restoran_user:secure_password@ep-ancient-meadow-123456.us-east-1.aws.neon.tech/restoran_db?sslmode=require
```

## Konfigurasi di Environment Variables Netlify

Saat deploy ke Netlify, konfigurasi environment variables berikut:

```
DATABASE_URL = "postgresql://restoran_user:secure_password@ep-ancient-meadow-123456.us-east-1.aws.neon.tech/restoran_db?sslmode=require"
POSTGRES_DB = "restoran_db"
POSTGRES_USER = "restoran_user"
POSTGRES_PASSWORD = "secure_password"
BETTER_AUTH_SECRET = "buat_secret_key_yang_sangat_panjang_dan_kuat_disini_min_32_karakter"
BETTER_AUTH_URL = "https://restoran-rz.netlify.app"
NEXT_PUBLIC_BETTER_AUTH_URL = "https://restoran-rz.netlify.app"
```

## Penting: Membuat Secret Key untuk Better Auth

Untuk variabel `BETTER_AUTH_SECRET`, Anda dapat membuat secret yang kuat dengan perintah berikut di terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Hasilnya akan seperti ini:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

## Verifikasi Koneksi Database

Sebelum deploy, pastikan database Neon Anda dapat diakses dari luar:

1. Di dashboard Neon, pastikan project Anda aktif
2. Neon secara otomatis menghandle SSL, jadi parameter `?sslmode=require` di connection string harus disertakan
3. Neon juga secara otomatis membuat user dan database pertama saat Anda membuat project

## Migrasi Database untuk Produksi

Setelah pertama kali deploy dan aplikasi berhasil berjalan:

1. Anda perlu memastikan skema database telah di-migrate ke Neon
2. Anda bisa menjalankan migration lokal ke database Neon dengan mengatur `DATABASE_URL` ke connection string Neon
3. Jalankan: `npm run db:push` atau `npm run db:migrate` tergantung skema Anda

## Troubleshooting

### Error Koneksi Database
- Pastikan connection string lengkap dan benar
- Cek apakah Anda menggunakan `?sslmode=require` di akhir connection string
- Pastikan database Neon tidak dalam mode paused (Neon mungkin otomatis mem-pause jika tidak ada aktivitas)

### Error Better Auth
- Pastikan `BETTER_AUTH_SECRET` identik di semua lingkungan
- Pastikan `BETTER_AUTH_URL` dan `NEXT_PUBLIC_BETTER_AUTH_URL` konsisten dengan domain produksi

## Keamanan

- Jangan pernah commit connection string ke repository
- Gunakan environment variables di Netlify untuk menyimpan kredensial
- Ganti `BETTER_AUTH_SECRET` secara berkala untuk keamanan tambahan
- Monitor access logs di Neon dashboard untuk aktivitas mencurigakan