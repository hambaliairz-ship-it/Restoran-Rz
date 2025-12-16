'use server';

import { getDb } from '@/db';
import { orders, orderItems, menuItems, orderStatusEnum } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export async function getKitchenOrders() {
  const db = getDb();
  // Get orders that are relevant for the kitchen (pending, confirmed, preparing, ready)
  // Exclude completed or cancelled unless needed for history
  const kitchenStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready'];

  const ordersData = await db.query.orders.findMany({
    where: inArray(orders.status, kitchenStatuses),
    orderBy: [desc(orders.createdAt)],
    with: {
      items: {
        with: {
          menuItem: true
        }
      }
    }
  });

  return ordersData;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const db = getDb();
  await db.update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath('/admin/kitchen');
}

export type KitchenOrder = Awaited<ReturnType<typeof getKitchenOrders>>[number];
