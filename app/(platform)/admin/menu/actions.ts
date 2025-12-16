'use server';

import { getDb } from '@/db';
import { categories, menuItems, orderItems, orders, payments, ingredients, stockTransactions } from '@/db/schema';
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
    // Log detail error untuk debugging di Netlify
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
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
    const saKeyLength = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY?.length;
    if (!saKeyLength || saKeyLength < 32) {
      console.error('Server Action key invalid or missing. Length:', saKeyLength);
      throw new Error('Konfigurasi server action tidak valid (encryption key).');
    }
    console.log('Server Action key length OK:', saKeyLength, 'NETLIFY:', process.env.NETLIFY, 'NODE_ENV:', process.env.NODE_ENV);

    console.log('Step 1: createMenuItem function entered');
    console.log('Raw data received:', {
      name: data.name ? 'present' : 'missing',
      price: data.price,
      categoryId: data.categoryId,
      imageUrlLength: data.imageUrl ? data.imageUrl.length : 0,
      preparationTime: data.preparationTime,
      isAvailable: data.isAvailable
    });

    // Check payload size hard limit (e.g. 100KB for text string approx)
    // Base64 encoding efficiency is ~75%, so 100KB string is ~75KB binary data
    if (data.imageUrl && data.imageUrl.length > 102400) {
      console.error('Image payload too large:', data.imageUrl.length, 'bytes');
      throw new Error('Ukuran gambar terlalu besar. Mohon upload gambar yang lebih kecil.');
    }

    // Validasi input sebelum proses
    if (!data.name || !data.price) {
      throw new Error('Nama dan harga wajib diisi');
    }

    // Validasi dan konversi harga ke format desimal yang benar
    console.log('Step 2: About to validate price');
    let validatedPrice: string;
    try {
      validatedPrice = validateAndConvertPrice(data.price);
    } catch (validationError) {
      console.error('Price validation failed:', validationError instanceof Error ? validationError.message : validationError);
      throw validationError;
    }
    console.log('Step 3: Price validated successfully:', validatedPrice);

    console.log('Step 4: About to construct insert object');

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
      console.log('Step 4.5: Uploading image to Cloudinary...');
      try {
        finalImageUrl = await uploadImage(data.imageUrl);
        console.log('Step 4.6: Image uploaded successfully:', finalImageUrl);
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError);
        // Menambahkan prefiks error untuk konsistensi pesan error
        throw new Error(`Gagal upload gambar: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
      }
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
    console.log('Step 5: Insert object constructed:', insertObject);

    console.log('Step 6: About to execute database insertion');

    const db = getDb();
    // Lakukan insert dengan error handling lebih rinci
    try {
      const result = await db.insert(menuItems).values(insertObject);
      console.log('Step 7: Database insertion successful', result);
    } catch (dbError) {
      console.error('Database insertion failed. Details:');
      console.error('Error message:', dbError instanceof Error ? dbError.message : dbError);

      // Deteksi error spesifik
      if (dbError instanceof Error) {
        if (dbError.message.includes('connect')) {
          console.error('POSSIBLE CAUSE: Database connection failed. Check DATABASE_URL.');
        } else if (dbError.message.includes('permission')) {
          console.error('POSSIBLE CAUSE: Database user does not have permission.');
        }
      }

      throw new Error('Gagal menyimpan data menu ke database: ' + (dbError instanceof Error ? dbError.message : String(dbError)));
    }

    console.log('Step 8: About to revalidate paths');
    revalidatePath('/admin/menu');
    revalidatePath('/menu');
    console.log('Step 9: Paths revalidated successfully');
  } catch (error) {
    console.error('ERROR at createMenuItem:');
    console.error('Error name:', error instanceof Error ? error.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    console.error('Error object:', error);

    // Cek apakah error terkait dengan struktur database
    if (error instanceof Error && error.message.includes('relation "menu_items" does not exist')) {
      console.error('ERROR: Table menu_items does not exist in database. Migrations may not have been run.');
      throw new Error('Struktur database tidak lengkap. Silakan hubungi administrator untuk menjalankan migrasi database.');
    }

    // Re-throw dengan pesan yang lebih informatif
    const errorMessage = error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error occurred';
    throw new Error(`Gagal menambahkan menu: ${errorMessage}`);
  }
}

// Fungsi helper untuk validasi dan konversi harga
function validateAndConvertPrice(price: string): string {
  console.log('Step 2a: Inside validateAndConvertPrice function');
  console.log('Original price value:', price, 'Type:', typeof price);

  if (!price) {
    console.log('Price validation failed: price is empty');
    throw new Error('Harga tidak boleh kosong');
  }

  // Menghapus karakter non-numerik kecuali titik desimal
  const cleanedPrice = price.replace(/[^\d.]/g, '');
  console.log('Cleaned price:', cleanedPrice);

  // Pastikan hanya satu titik desimal
  const parts = cleanedPrice.split('.');
  if (parts.length > 2) {
    console.log('Price validation failed: multiple decimal points');
    throw new Error('Format harga tidak valid');
  }

  // Validasi bahwa nilai adalah angka positif
  const numericValue = parseFloat(cleanedPrice);
  if (isNaN(numericValue) || numericValue < 0) {
    console.log('Price validation failed: not a positive number');
    throw new Error('Harga harus berupa angka positif');
  }

  // Format ulang ke dua digit desimal jika perlu - menggunakan format string yang konsisten
  const finalPrice = numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace(/,/g, ''); // Hapus koma jika ada

  console.log('Final validated price:', finalPrice);
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
    // 1. Cari semua order_items yang terkait dengan menu ini
    const relatedOrderItems = await db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .where(eq(orderItems.menuItemId, id));

    // 2. Hapus order_items yang terkait
    await db.delete(orderItems).where(eq(orderItems.menuItemId, id));

    // 3. Hapus orders yang terkait (jika ada)
    if (relatedOrderItems.length > 0) {
      const orderIds = [...new Set(relatedOrderItems.map(item => item.orderId).filter(Boolean))] as string[];

      for (const orderId of orderIds) {
        // Cek apakah order masih punya items lain
        const remainingItems = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, orderId));

        // Jika tidak ada items tersisa, hapus payments lalu order
        if (remainingItems.length === 0) {
          await db.delete(payments).where(eq(payments.orderId, orderId));
          await db.delete(orders).where(eq(orders.id, orderId));
        }
      }
    }

    // 4. Hapus menu item
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

