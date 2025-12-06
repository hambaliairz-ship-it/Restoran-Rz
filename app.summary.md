# Dokumentasi Proyek: Sistem Manajemen Restoran Modern

## Ringkasan Proyek
Aplikasi website manajemen restoran dengan fitur pemesanan online, manajemen stok, dan sistem notifikasi terintegrasi.

## Teknologi yang Digunakan
- **Frontend**: Next.js 14 dengan App Router
- **Styling**: Tailwind CSS
- **Design System**: Atomic Design
- **Database**: Neon (PostgreSQL)
- **Deployment**: Netlify
- **Authentication**: NextAuth.js
- **Notifications**: Web Notifications API + WhatsApp API

## Fitur Utama

### 1. Sistem Pemesanan Customer
- Menu makanan dengan gambar dan deskripsi
- Input jumlah pesanan
- Generate barcode untuk setiap pesanan
- Keranjang belanja dan checkout
- Notifikasi suara ketika makanan siap

### 2. Dashboard Koki
- Daftar pesanan yang masuk
- Tombol konfirmasi persiapan
- Timer untuk estimasi penyajian
- Status pesanan (menunggu, disiapkan, siap)

### 3. Sistem Kasir
- Pembuatan struk
- Perhitungan pembayaran
- Kembalian uang
- Laporan penjualan

### 4. Manajemen Stok
- Tracking bahan makanan
- Input pengeluaran bahan
- Alert stok menipis
- Laporan inventory

### 5. Integrasi WhatsApp
- Notifikasi ke customer
- Komunikasi langsung dengan koki/pemilik

## Database Schema (Neon PostgreSQL)

```sql
-- Tabel Users
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'chef', 'cashier', 'customer')),
    name VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Categories
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Menu Items
CREATE TABLE menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    category_id UUID REFERENCES categories(id),
    is_available BOOLEAN DEFAULT true,
    preparation_time INT, -- dalam menit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Orders
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    table_number VARCHAR(10),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    barcode_data VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Order Items
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    notes TEXT
);

-- Tabel Ingredients
CREATE TABLE ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0,
    min_stock DECIMAL(10,2) DEFAULT 0,
    cost_per_unit DECIMAL(10,2) NOT NULL
);

-- Tabel Menu Ingredients (BOM)
CREATE TABLE menu_ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_item_id UUID REFERENCES menu_items(id),
    ingredient_id UUID REFERENCES ingredients(id),
    quantity_required DECIMAL(10,2) NOT NULL
);

-- Tabel Stock Transactions
CREATE TABLE stock_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ingredient_id UUID REFERENCES ingredients(id),
    transaction_type VARCHAR(50) CHECK (transaction_type IN ('in', 'out', 'adjustment')),
    quantity DECIMAL(10,2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Payments
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    change_amount DECIMAL(10,2) DEFAULT 0,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Struktur Folder Atomic Design

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Badge/
│   │   └── Icon/
│   ├── molecules/
│   │   ├── SearchBar/
│   │   ├── ProductCard/
│   │   ├── OrderItem/
│   │   └── Notification/
│   ├── organisms/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── OrderList/
│   │   ├── MenuGrid/
│   │   └── PaymentForm/
│   ├── templates/
│   │   ├── DashboardLayout/
│   │   ├── CustomerLayout/
│   │   └── AuthLayout/
│   └── pages/
│       ├── LoginPage/
│       ├── MenuPage/
│       ├── KitchenPage/
│       └── StockPage/
├── lib/                    # Utilities
├── hooks/                  # Custom hooks
├── types/                  # TypeScript types
└── utils/                  # Helper functions
```

## Alur Aplikasi

### 1. Alur Customer
```
Customer membuka website → Melihat menu → Memilih makanan → 
Input jumlah → Keranjang → Checkout → Generate barcode → 
Tunggu notifikasi → Makanan siap
```

### 2. Alur Koki
```
Login → Lihat dashboard pesanan → Konfirmasi pesanan → 
Atur timer → Update status → Notifikasi ke customer
```

### 3. Alur Kasir
```
Login → Input pesanan → Hitung total → Terima pembayaran → 
Buat struk → Update stok
```

### 4. Alur Manajemen Stok
```
Login → Pantau stok → Input pengeluaran → Receive alert → 
Update inventory
```

## Halaman yang Dibutuhkan

### Public Pages
- `/` - Landing page dengan menu
- `/menu` - Halaman menu lengkap
- `/order/[id]` - Detail pesanan dengan barcode

### Auth Pages
- `/login` - Login semua user
- `/register` - Register customer

### Admin Pages
- `/admin/dashboard` - Dashboard utama
- `/admin/orders` - Manajemen pesanan
- `/admin/kitchen` - Dashboard koki
- `/admin/cashier` - Sistem kasir
- `/admin/stock` - Manajemen stok
- `/admin/reports` - Laporan penjualan

## Komponen Kunci

### Atoms
- `Button` - Tombol dengan berbagai variant
- `Input` - Input field dengan validation
- `Badge` - Status badge untuk order
- `Barcode` - Komponen generate barcode

### Molecules
- `ProductCard` - Card menu item
- `OrderCard` - Card pesanan untuk koki
- `CartItem` - Item dalam keranjang
- `StockAlert` - Notifikasi stok menipis

### Organisms
- `MenuGrid` - Grid menu items
- `OrderList` - Daftar pesanan
- `ShoppingCart` - Keranjang belanja
- `KitchenDashboard` - Dashboard koki

## Fitur Notifikasi

### Notifikasi Suara
```javascript
// Utils untuk notifikasi suara
const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play();
};
```

### Web Notifications
```javascript
// Request permission dan show notification
const showBrowserNotification = (title, message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
    }
};
```

### WhatsApp Integration
```javascript
// Fungsi untuk kirim WhatsApp
const sendWhatsAppNotification = (phone, message) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
};
```

## Konfigurasi Deployment

### Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables
```env
# .env.local
DATABASE_URL=your_neon_connection_string
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=your_app_url
WHATSAPP_API_KEY=your_whatsapp_key
```

## Timeline Pengembangan

### Phase 1 (Minggu 1-2)
- Setup project dan database
- Authentication system
- Basic menu display
- Shopping cart functionality

### Phase 2 (Minggu 3-4)
- Order management system
- Kitchen dashboard
- Barcode generation
- Basic notifications

### Phase 3 (Minggu 5-6)
- Payment system
- Stock management
- Reports and analytics
- WhatsApp integration

### Phase 4 (Minggu 7-8)
- Testing dan optimization
- Deployment
- Documentation

## Security Considerations
- Authentication dan authorization
- Input validation dan sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

## Performance Optimization
- Image optimization
- Code splitting
- Database indexing
- Caching strategies
- Lazy loading