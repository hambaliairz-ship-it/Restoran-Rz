"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Locale = 'id' | 'en';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  id: {
    "addToCart": "Tambah ke Keranjang",
    "outOfStock": "Habis",
    "noImage": "Tidak ada gambar",
    "cartEmpty": "Keranjang Kosong",
    "cartEmptyDesc": "Anda belum memilih menu apapun.",
    "backToMenu": "Kembali ke Menu",
    "checkout": "Checkout",
    "summary": "Ringkasan Pesanan",
    "totalItems": "Total Item",
    "totalAmount": "Total Bayar",
    "placeOrder": "Buat Pesanan",
    "processing": "Memproses...",
    "orderSuccess": "Pesanan berhasil dibuat! Mohon tunggu panggilan.",
    "addedToCart": "ditambahkan ke keranjang",
    "itemRemoved": "Item dihapus dari keranjang",
    "cartCleared": "Keranjang dikosongkan",
    "kitchenDashboard": "Dashboard Dapur",
    "totalActive": "Total Aktif",
    "table": "Meja",
    "startCooking": "Mulai Masak",
    "markReady": "Tandai Siap",
    "markCompleted": "Selesai Disajikan",
    "statusPending": "Menunggu",
    "statusPreparing": "Disiapkan",
    "statusReady": "Siap Saji",
    "statusCompleted": "Selesai",
    "mins": "mnt",
    "viewMenu": "Lihat Menu",
    "menuTitle": "Menu Kami",
    "menuDesc": "Pilihan menu spesial untuk Anda hari ini",
    "heroTitle": "Nikmati Hidangan Terbaik",
    "heroDesc": "Pesan makanan favorit Anda dengan mudah dari meja Anda. Cepat, praktis, dan higienis.",
    "footerRights": "Hak Cipta Dilindungi.",
    "login": "Masuk",
    "register": "Daftar",
    "logout": "Keluar",
    "profile": "Profil",
    "theme": "Tema",
    "language": "Bahasa",
    "signInTitle": "Masuk",
    "signInDesc": "Masukkan email dan kata sandi untuk mengakses akun Anda",
    "signUpTitle": "Buat Akun",
    "signUpDesc": "Masukkan detail Anda untuk membuat akun baru",
    "email": "Email",
    "password": "Kata Sandi",
    "confirmPassword": "Konfirmasi Kata Sandi",
    "fullName": "Nama Lengkap",
    "enterEmail": "Masukkan email Anda",
    "enterPassword": "Masukkan kata sandi Anda",
    "enterFullName": "Masukkan nama lengkap Anda",
    "createStrongPassword": "Buat kata sandi yang kuat",
    "confirmYourPassword": "Konfirmasi kata sandi Anda",
    "signingIn": "Sedang masuk...",
    "creatingAccount": "Sedang membuat akun...",
    "dontHaveAccount": "Belum punya akun?",
    "alreadyHaveAccount": "Sudah punya akun?",
    "signUpLink": "Daftar",
    "signInLink": "Masuk",
    "passwordsDontMatch": "Kata sandi tidak cocok",
    "passwordRequirements": "Kata sandi harus mengandung setidaknya satu huruf besar, satu huruf kecil, dan satu angka",
    "dashboard": "Dashboard",
    "signingOut": "Sedang keluar...",
    "user": "Pengguna",
    "orderUpdated": "Status pesanan diperbarui",
    "toggleTheme": "Ganti tema",
    "light": "Terang",
    "dark": "Gelap",
    "system": "Sistem",
    "signUpFailed": "Gagal mendaftar",
    "signInFailed": "Gagal masuk",
    "unexpectedError": "Terjadi kesalahan yang tidak terduga",

    "dashboardTitle": "Dashboard",
    "dashboardTotalRevenue": "Total Pendapatan",
    "dashboardToday": "Hari ini",
    "dashboardOrdersToday": "Pesanan Hari Ini",
    "dashboardIncomingTransactions": "Transaksi masuk",
    "dashboardActiveOrders": "Pesanan Aktif",
    "dashboardInKitchen": "Sedang diproses di dapur",
    "dashboardLowStock": "Stok Menipis",
    "dashboardNeedRestock": "Bahan perlu restock segera",
    "dashboardRecentOrders": "Pesanan Terbaru",
    "dashboardOrderId": "Order ID",
    "dashboardCustomer": "Customer",
    "dashboardStatus": "Status",
    "dashboardTotal": "Total",
    "dashboardNoOrders": "Belum ada pesanan.",
    "dashboardQuickAccess": "Akses Cepat",
    "dashboardOpenMenu": "Buka Halaman Menu",
    "dashboardOpenMenuDesc": "Untuk Customer memesan makanan",
    "dashboardMonitorKitchen": "Monitor Dapur",
    "dashboardMonitorKitchenDesc": "Lihat antrian pesanan masak",
    "dashboardCashier": "Kasir",
    "dashboardCashierDesc": "Proses pembayaran pelanggan",

    "kitchenDashboardTitle": "Kitchen Dashboard",
    "kitchenDashboardDesc": "Kelola pesanan yang masuk dan status persiapan makanan.",
    "kitchenNoOrders": "Tidak ada pesanan aktif saat ini.",

    "cashierTitle": "Cashier Point",
    "cashierDesc": "Pembayaran dan penyelesaian pesanan.",
    "cashierNoOrders": "Tidak ada pesanan yang menunggu pembayaran.",
    "cashierMoreItems": "+ {count} item lainnya...",
    "cashierTotal": "Total",

    "stockTitle": "Manajemen Stok",
    "stockDesc": "Pantau ketersediaan bahan baku dan riwayat keluar-masuk barang.",
    "stockTableTitle": "Daftar Bahan Baku",
    "stockName": "Nama Bahan",
    "stockCurrent": "Stok Saat Ini",
    "stockCostPerUnit": "Biaya/Unit",
    "stockStatus": "Status",
    "stockNoIngredients": "Belum ada data bahan baku.",
    "stockSafe": "Aman",
    "stockLow": "Menipis",
    "stockHistoryTitle": "Riwayat Terakhir",
    "stockNoTransactions": "Belum ada transaksi.",
  },
  en: {
    "addToCart": "Add to Cart",
    "outOfStock": "Out of Stock",
    "noImage": "No Image",
    "cartEmpty": "Cart Empty",
    "cartEmptyDesc": "You haven't selected any items yet.",
    "backToMenu": "Back to Menu",
    "checkout": "Checkout",
    "summary": "Order Summary",
    "totalItems": "Total Items",
    "totalAmount": "Total Amount",
    "placeOrder": "Place Order",
    "processing": "Processing...",
    "orderSuccess": "Order placed successfully! Please wait for your name to be called.",
    "addedToCart": "added to cart",
    "itemRemoved": "Item removed from cart",
    "cartCleared": "Cart cleared",
    "kitchenDashboard": "Kitchen Dashboard",
    "totalActive": "Total Active",
    "table": "Table",
    "startCooking": "Start Cooking",
    "markReady": "Mark Ready",
    "markCompleted": "Mark Completed",
    "statusPending": "Pending",
    "statusPreparing": "Preparing",
    "statusReady": "Ready",
    "statusCompleted": "Completed",
    "mins": "mins",
    "viewMenu": "View Menu",
    "menuTitle": "Our Menu",
    "menuDesc": "Special menu selections for you today",
    "heroTitle": "Enjoy the Best Dishes",
    "heroDesc": "Order your favorite food easily from your table. Fast, practical, and hygienic.",
    "footerRights": "All rights reserved.",
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "profile": "Profile",
    "theme": "Theme",
    "language": "Language",
    "signInTitle": "Sign In",
    "signInDesc": "Enter your email and password to access your account",
    "signUpTitle": "Create Account",
    "signUpDesc": "Enter your details to create a new account",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "fullName": "Full Name",
    "enterEmail": "Enter your email",
    "enterPassword": "Enter your password",
    "enterFullName": "Enter your full name",
    "createStrongPassword": "Create a strong password",
    "confirmYourPassword": "Confirm your password",
    "signingIn": "Signing in...",
    "creatingAccount": "Creating account...",
    "dontHaveAccount": "Don't have an account?",
    "alreadyHaveAccount": "Already have an account?",
    "signUpLink": "Sign up",
    "signInLink": "Sign in",
    "passwordsDontMatch": "Passwords don't match",
    "passwordRequirements": "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    "dashboard": "Dashboard",
    "signingOut": "Signing out...",
    "user": "User",
    "orderUpdated": "Order status updated",
    "toggleTheme": "Toggle theme",
    "light": "Light",
    "dark": "Dark",
    "system": "System",
    "signUpFailed": "Sign up failed",
    "signInFailed": "Sign in failed",
    "unexpectedError": "An unexpected error occurred",

    "dashboardTitle": "Dashboard",
    "dashboardTotalRevenue": "Total Revenue",
    "dashboardToday": "Today",
    "dashboardOrdersToday": "Orders Today",
    "dashboardIncomingTransactions": "Incoming transactions",
    "dashboardActiveOrders": "Active Orders",
    "dashboardInKitchen": "Being prepared in the kitchen",
    "dashboardLowStock": "Low Stock",
    "dashboardNeedRestock": "Items need restocking soon",
    "dashboardRecentOrders": "Recent Orders",
    "dashboardOrderId": "Order ID",
    "dashboardCustomer": "Customer",
    "dashboardStatus": "Status",
    "dashboardTotal": "Total",
    "dashboardNoOrders": "No orders yet.",
    "dashboardQuickAccess": "Quick Access",
    "dashboardOpenMenu": "Open Menu Page",
    "dashboardOpenMenuDesc": "For customers to place orders",
    "dashboardMonitorKitchen": "Monitor Kitchen",
    "dashboardMonitorKitchenDesc": "View cooking order queue",
    "dashboardCashier": "Cashier",
    "dashboardCashierDesc": "Process customer payments",

    "kitchenDashboardTitle": "Kitchen Dashboard",
    "kitchenDashboardDesc": "Manage incoming orders and food preparation status.",
    "kitchenNoOrders": "There are no active orders right now.",

    "cashierTitle": "Cashier Point",
    "cashierDesc": "Payments and order completion.",
    "cashierNoOrders": "There are no orders waiting for payment.",
    "cashierMoreItems": "+ {count} more items...",
    "cashierTotal": "Total",

    "stockTitle": "Stock Management",
    "stockDesc": "Monitor ingredient availability and stock movement history.",
    "stockTableTitle": "Ingredient List",
    "stockName": "Ingredient Name",
    "stockCurrent": "Current Stock",
    "stockCostPerUnit": "Cost/Unit",
    "stockStatus": "Status",
    "stockNoIngredients": "No ingredient data yet.",
    "stockSafe": "Safe",
    "stockLow": "Low",
    "stockHistoryTitle": "Latest History",
    "stockNoTransactions": "No transactions yet.",
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('id');

  // Load locale from local storage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'id' || savedLocale === 'en')) {
      setLocale(savedLocale);
    }
  }, []);

  // Save locale to local storage
  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const t = (key: string): string => {
    const dict = translations[locale] as Record<string, string>;
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
