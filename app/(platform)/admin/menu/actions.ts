'use server';

import { db } from '@/db';
import { categories, menuItems, orderItems, orders, payments } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  return await db.select().from(categories);
}

export async function getMenuItems() {
  return await db.query.menuItems.findMany({
    with: { category: true },
    orderBy: (menuItems, { desc }) => [desc(menuItems.createdAt)],
  });
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
  try {
    await db.insert(menuItems).values({
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId || null,
      imageUrl: data.imageUrl || null,
      preparationTime: data.preparationTime || null,
      isAvailable: data.isAvailable ?? true,
    });
    revalidatePath('/admin/menu');
    revalidatePath('/menu');
  } catch (error) {
    console.error('Error creating menu item:', error);
    throw new Error(`Gagal menambahkan menu: ${error instanceof Error ? error.message : 'Database error'}`);
  }
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
    await db.update(menuItems).set(data).where(eq(menuItems.id, id));
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
