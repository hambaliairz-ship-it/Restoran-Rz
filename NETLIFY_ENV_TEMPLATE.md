# Environment Variables untuk Deploy ke Netlify
# Simpan file ini sebagai referensi saat mengatur environment variables di Netlify

# === DATABASE CONFIGURATION ===
# Ganti dengan connection string dari dashboard Neon Anda
DATABASE_URL="postgresql://your_username:your_password@ep-xxxxxxx.region.provider.neon.tech/your_database?sslmode=require"

# Detail database (diambil dari connection string di atas)
POSTGRES_DB="your_database"
POSTGRES_USER="your_username"
POSTGRES_PASSWORD="your_password"

# === AUTHENTICATION CONFIGURATION ===
# Secret key untuk Better Auth - buat yang baru dan kuat!
BETTER_AUTH_SECRET="ganti_dengan_secret_key_yang_sangat_panjang_dan_kuat_min_32_karakter_dan_tidak_dibagikan_ke_mana_pun"

# URL untuk production - gunakan domain Netlify Anda
BETTER_AUTH_URL="https://restoran-rz.netlify.app"
NEXT_PUBLIC_BETTER_AUTH_URL="https://restoran-rz.netlify.app"

# === CATATAN PENTING ===
# 1. Untuk mendapatkan BETTER_AUTH_SECRET yang aman, jalankan perintah ini di terminal:
#    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
#
# 2. Untuk DATABASE_URL, gantilah bagian berikut sesuai dengan connection string dari Neon:
#    - "your_username" dengan username dari Neon
#    - "your_password" dengan password dari Neon  
#    - "your_database" dengan nama database dari Neon
#    - "ep-xxxxxxx.region.provider.neon.tech" dengan host dari Neon
#
# 3. Gantilah "https://restoran-rz.netlify.app" dengan URL produksi Anda yang sebenarnya
#    saat Netlify membuatkan subdomain untuk Anda