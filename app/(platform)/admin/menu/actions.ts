'use server';

import { getDb } from '@/db';
import { categories, menuItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { uploadImage } from '@/lib/cloudinary';

export async function getCategories() {
  try {
    const db = getDb();
    const result = await db.select().from(categories);
    return result;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error(`Gagal mengambil kategori: ${error instanceof Error ? error.message : 'Database error'}`);
  }
}

export async function getMenuItems() {
  try {
    const db = getDb();
    // Dapatkan semua menu items
    const menuItemsResult = await db.select().from(menuItems)
      .orderBy(desc(menuItems.createdAt));

    // Dapatkan semua kategori
    const categoriesResult = await db.select().from(categories);

    // Bangun hubungan antara menu items dan kategori secara manual
    const menuItemsWithCategories = menuItemsResult.map(item => ({
      ...item,
      category: categoriesResult.find(cat => cat.id === item.categoryId) || null
    }));

    return menuItemsWithCategories;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw new Error(`Gagal mengambil menu: ${error instanceof Error ? error.message : 'Database error'}`);
  }
}

export async function createCategory(data: { name: string; description?: string }) {
  try {
    const db = getDb();
    await db.insert(categories).values({
      name: data.name,
      description: data.description,
    });
    revalidatePath('/admin/menu');
    revalidatePath('/menu');
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error(`Gagal menambahkan kategori: ${error instanceof Error ? error.message : 'Database error'}`);
  }
}

export async function createMenuItem(data: {
  name: string;
  description?: string;
  price: string;
  categoryId?: string;
  imageUrl?: string;
  preparationTime?: number;
  isAvailable?: boolean;
}) {
  try {
    // Validasi input sebelum proses
    if (!data.name || !data.price) {
      throw new Error('Nama dan harga wajib diisi');
    }

    // Validasi dan konversi harga ke format desimal yang benar
    let validatedPrice: string;
    try {
      validatedPrice = validateAndConvertPrice(data.price);
    } catch (validationError) {
      throw validationError;
    }

    // Konversi preparationTime dengan validasi tambahan
    let prepTimeValue: number | null = null;
    if (data.preparationTime !== undefined && data.preparationTime !== null) {
      prepTimeValue = Number(data.preparationTime);
      if (isNaN(prepTimeValue)) {
        throw new Error('Waktu persiapan harus berupa angka');
      }
    }

    // Validasi categoryId
    let catIdValue: string | null = null;
    if (data.categoryId) {
      const db = getDb();
      // Lakukan pengecekan apakah kategori ada di database
      const categoryExists = await db.select().from(categories).where(eq(categories.id, data.categoryId));
      if (categoryExists.length === 0) {
        throw new Error('Kategori tidak ditemukan');
      }
      catIdValue = data.categoryId;
    }

    // Validasi isAvailable
    const availableValue = data.isAvailable ?? true;

    // Upload image to Cloudinary if provided
    let finalImageUrl: string | null = null;
    if (data.imageUrl) {
      // Check payload size hard limit (e.g. 100KB for text string)
      if (data.imageUrl.length > 102400) {
        throw new Error('Ukuran gambar terlalu besar. Mohon upload gambar yang lebih kecil.');
      }

      finalImageUrl = await uploadImage(data.imageUrl);
    }

    // Konstruksi objek insert dengan validasi tambahan
    const insertObject = {
      name: data.name.trim(), // Pastikan nama tidak ada spasi berlebih
      description: data.description ? data.description.trim() : null,
      price: validatedPrice,
      categoryId: catIdValue,
      imageUrl: finalImageUrl, // Use Cloudinary URL instead of base64
      preparationTime: prepTimeValue,
      isAvailable: availableValue,
    };

    const db = getDb();
    await db.insert(menuItems).values(insertObject);

    revalidatePath('/admin/menu');
    revalidatePath('/menu');
  } catch (error) {
    console.error('Error in createMenuItem:', error);

    // Cek apakah error terkait dengan struktur database
    if (error instanceof Error && error.message.includes('relation "menu_items" does not exist')) {
      throw new Error('Struktur database tidak lengkap. Silakan hubungi administrator untuk menjalankan migrasi database.');
    }

    // Re-throw dengan pesan yang lebih informatif
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Gagal menambahkan menu: ${errorMessage}`);
  }
}

// Fungsi helper untuk validasi dan konversi harga
function validateAndConvertPrice(price: string): string {
  if (!price) {
    throw new Error('Harga tidak boleh kosong');
  }

  // Menghapus karakter non-numerik kecuali titik desimal
  const cleanedPrice = price.replace(/[^\d.]/g, '');

  // Pastikan hanya satu titik desimal
  const parts = cleanedPrice.split('.');
  if (parts.length > 2) {
    throw new Error('Format harga tidak valid');
  }

  // Validasi bahwa nilai adalah angka positif
  const numericValue = parseFloat(cleanedPrice);
  if (isNaN(numericValue) || numericValue < 0) {
    throw new Error('Harga harus berupa angka positif');
  }

  // Format ulang ke dua digit desimal jika perlu - menggunakan format string yang konsisten
  const finalPrice = numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace(/,/g, ''); // Hapus koma jika ada

  return finalPrice;
}

export async function updateMenuItem(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: string;
    categoryId?: string;
    imageUrl?: string;
    preparationTime?: number;
    isAvailable?: boolean;
  }
) {
  try {
    // Jika price disertakan dalam data update, validasi dan konversi terlebih dahulu
    const updateData = { ...data };
    if (data.price !== undefined) {
      updateData.price = validateAndConvertPrice(data.price);
    }

    const db = getDb();
    await db.update(menuItems).set(updateData).where(eq(menuItems.id, id));
    revalidatePath('/admin/menu');
    revalidatePath('/menu');
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw new Error(`Gagal memperbarui menu: ${error instanceof Error ? error.message : 'Database error'}`);
  }
}

export async function deleteMenuItem(id: string) {
  try {
    const db = getDb();
    await db.delete(menuItems).where(eq(menuItems.id, id));

    revalidatePath('/admin/menu');
    revalidatePath('/menu');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw new Error(`Gagal menghapus menu: ${error instanceof Error ? error.message : 'Database error'}`);
  }
}

export async function deleteCategory(id: string) {
  try {
    const db = getDb();
    // Set menu items in this category to null first
    await db.update(menuItems).set({ categoryId: null }).where(eq(menuItems.categoryId, id));
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/admin/menu');
    revalidatePath('/menu');
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error(`Gagal menghapus kategori: ${error instanceof Error ? error.message : 'Database error'}`);
  }
}

