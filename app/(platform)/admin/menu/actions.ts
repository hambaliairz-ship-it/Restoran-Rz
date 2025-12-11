'use server';

import { db } from '@/db';
import { categories, menuItems, orderItems, orders, payments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  console.log('getCategories called');
  try {
    const result = await db.select().from(categories);
    console.log('getCategories success, count:', result.length);
    return result;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error(`Gagal mengambil kategori: ${error instanceof Error ? error.message : 'Database error'}`);
  }
}

export async function getMenuItems() {
  console.log('getMenuItems called');
  try {
    // Dapatkan semua menu items
    const menuItemsResult = await db.select().from(menuItems)
      .orderBy(desc(menuItems.createdAt));
    console.log('Fetched menu items count:', menuItemsResult.length);

    // Dapatkan semua kategori
    const categoriesResult = await db.select().from(categories);
    console.log('Fetched categories count:', categoriesResult.length);

    // Bangun hubungan antara menu items dan kategori secara manual
    const menuItemsWithCategories = menuItemsResult.map(item => ({
      ...item,
      category: categoriesResult.find(cat => cat.id === item.categoryId) || null
    }));

    console.log('Final menu items with categories count:', menuItemsWithCategories.length);
    return menuItemsWithCategories;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw new Error(`Gagal mengambil menu: ${error instanceof Error ? error.message : 'Database error'}`);
  }
}

export async function createCategory(data: { name: string; description?: string }) {
  try {
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
  console.log('createMenuItem called with data:', {
    name: data.name,
    price: data.price,
    categoryId: data.categoryId,
    imageUrl: data.imageUrl ? 'exists' : 'null',
    preparationTime: data.preparationTime,
    isAvailable: data.isAvailable
  });

  try {
    // Validasi dan konversi harga ke format desimal yang benar
    const validatedPrice = validateAndConvertPrice(data.price);
    console.log('Validated price:', validatedPrice);

    await db.insert(menuItems).values({
      name: data.name,
      description: data.description,
      price: validatedPrice,
      categoryId: data.categoryId || null,
      imageUrl: data.imageUrl || null,
      preparationTime: data.preparationTime || null,
      isAvailable: data.isAvailable ?? true,
    });
    console.log('Menu item inserted successfully');

    revalidatePath('/admin/menu');
    revalidatePath('/menu');
    console.log('Paths revalidated');
  } catch (error) {
    console.error('Error creating menu item:', error);
    throw new Error(`Gagal menambahkan menu: ${error instanceof Error ? error.message : 'Database error'}`);
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

  // Format ulang ke dua digit desimal jika perlu
  return numericValue.toFixed(2);
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
