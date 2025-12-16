'use server';

import { getDb } from '@/db';
import { categories, menuItems, orders, orderItems, payments, ingredients, stockTransactions, orderStatusEnum } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { setCache, getCache } from '@/lib/cache';

export async function getMenuData() {
  // Try to get from cache first
  const cachedData = getCache<{ categories: any[]; items: any[] }>('menu-data');
  if (cachedData) {
    return cachedData;
  }

  const db = getDb();
  const allCategories = await db.select().from(categories);

  // Get all available menu items with their category
  const rawItems = await db.select()
    .from(menuItems)
    .where(eq(menuItems.isAvailable, true))
    .leftJoin(categories, eq(menuItems.categoryId, categories.id));

  // Transform results to match expected format
  const items = rawItems.map(item => ({
    ...item.menu_items,
    category: item.categories
  }));

  const data = { categories: allCategories, items };

  // Cache for 5 minutes
  setCache('menu-data', data, 300000);

  return data;
}

export type MenuData = Awaited<ReturnType<typeof getMenuData>>;
export type MenuCategory = MenuData["categories"][number];
export type MenuItemWithCategory = MenuData["items"][number];

export async function createOrder(data: {
    customerName: string;
    tableNumber: string;
    items: { menuItemId: string; quantity: number; price: number; notes?: string }[];
    totalAmount: number;
}) {
    // Clear menu cache after creating order
    const db = getDb();
    let orderId = '';

    await db.transaction(async (tx) => {
        // Generate Order Number (simple random for now, ideally sequential)
        const orderNumber = `ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        // 1. Create Order
        const [newOrder] = await tx.insert(orders).values({
            orderNumber,
            customerName: data.customerName,
            tableNumber: data.tableNumber,
            totalAmount: data.totalAmount.toString(),
            status: 'pending'
        }).returning();

        orderId = newOrder.id;

        // 2. Create Order Items
        await tx.insert(orderItems).values(
            data.items.map(item => ({
                orderId: newOrder.id,
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.price.toString(),
                notes: item.notes
            }))
        );
    });

    // Clear menu cache after order is placed
    if (orderId) {
        // You might want to clear other relevant caches here
        // For example, dashboard stats cache if needed
        import('@/lib/cache').then(({ clearCache }) => {
            clearCache();
        }).catch(console.error);
        redirect(`/order/${orderId}`);
    }
}
