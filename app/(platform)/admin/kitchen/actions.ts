'use server';

import { getDb } from '@/db';
import { orders, orderItems, menuItems, orderStatusEnum, payments } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export async function getKitchenOrders() {
  const db = getDb();
  // Get orders that are relevant for the kitchen (pending, confirmed, preparing, ready)
  // Exclude completed or cancelled unless needed for history
  const kitchenStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready'];

  const ordersData = await db.select()
    .from(orders)
    .where(inArray(orders.status, kitchenStatuses))
    .orderBy(desc(orders.createdAt));

  // Then, fetch the related items and menu items for each order
  const ordersWithItemsPromises = ordersData.map(async (order) => {
    const items = await db.select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id));

    return {
      ...order,
      items: items.map(item => ({
        ...item.order_items,
        menuItem: item.menu_items
      }))
    };
  });

  const ordersWithItems = await Promise.all(ordersWithItemsPromises);

  return ordersWithItems;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const db = getDb();
  await db.update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath('/admin/kitchen');
}

export type KitchenOrder = Awaited<ReturnType<typeof getKitchenOrders>>[number];
