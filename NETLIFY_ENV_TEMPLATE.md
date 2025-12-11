# Environment Variables untuk Deploy ke Netlify
# Simpan file ini sebagai referensi saat mengatur environment variables di Netlify

# === DATABASE CONFIGURATION ===
# Ganti dengan connection string dari dashboard database Anda (Neon, Supabase, atau PostgreSQL lainnya)
DATABASE_URL="postgresql://your_username:your_password@ep-xxxxxxx.region.provider.neon.tech/your_database?sslmode=require"

# === AUTHENTICATION CONFIGURATION ===
# Secret key untuk Better Auth - buat yang baru dan kuat!
BETTER_AUTH_SECRET="ganti_dengan_secret_key_yang_sangat_panjang_dan_kuat_min_32_karakter_dan_tidak_dibagikan_ke_mana_pun"

# URL untuk production - gunakan domain Netlify Anda
BETTER_AUTH_URL="https://restoran-rz.netlify.app"
NEXT_PUBLIC_BETTER_AUTH_URL="https://restoran-rz.netlify.app"

# === NEXT.JS CONFIGURATION ===
# Konfigurasi yang dibutuhkan untuk lingkungan produksi
NEXT_PUBLIC_SITE_URL="https://restoran-rz.netlify.app"
NEXT_PUBLIC_API_URL="https://restoran-rz.netlify.app/api"

# === OPTIONAL CONFIGURATIONS ===
# Google OAuth - opsional jika Anda ingin fitur login Google
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="https://restoran-rz.netlify.app/api/auth/callback/google"

# Cloudinary - opsional jika Anda ingin menyimpan gambar di cloud
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# === CATATAN PENTING ===
# 1. Untuk mendapatkan BETTER_AUTH_SECRET yang aman, jalankan perintah ini di terminal:
#    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
#
# 2. Untuk DATABASE_URL, gantilah bagian berikut sesuai dengan connection string dari database Anda:
#    - "your_username" dengan username dari database
#    - "your_password" dengan password dari database
#    - "your_database" dengan nama database
#    - "ep-xxxxxxx.region.provider.neon.tech" dengan host dari database
#
# 3. Gantilah "https://restoran-rz.netlify.app" dengan URL produksi Anda yang sebenarnya
#    saat Netlify membuatkan subdomain untuk Anda
#
# 4. Penting: Simpan semua environment variables ini dengan aman dan jangan pernah commit ke repository
#
# 5. Jika Anda menggunakan Neon, pastikan:
#    - Anda telah membuat project di Neon
#    - Connection string diambil dari dashboard Neon bagian "Connection Details"
#    - Anda telah menjalankan migrasi database ke production database
#
# 6. Setelah deployment pertama, pastikan untuk:
#    - Menjalankan migrasi database production jika belum otomatis
#    - Menguji fitur manajemen menu untuk memastikan database connection berfungsi