'use server';

import { db } from '@/db';
import { categories, menuItems, orders, orderItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function getMenuData() {
  const allCategories = await db.select().from(categories);
  
  // Get all available menu items with their category
  const items = await db.query.menuItems.findMany({
    where: eq(menuItems.isAvailable, true),
    with: {
        category: true
    }
  });

  return { categories: allCategories, items };
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

    if (orderId) {
        redirect(`/order/${orderId}`);
    }
}
