import { getDb } from '@/db';
import { orders, payments, orderItems, menuItems } from '@/db/schema';
import { eq, desc, not } from 'drizzle-orm';

export async function getUnpaidOrders() {
  const db = getDb();

  // First, get all active orders (not cancelled)
  const activeOrders = await db.select()
    .from(orders)
    .where(not(eq(orders.status, 'cancelled')))
    .orderBy(desc(orders.createdAt));

  // Then, fetch the related items and menu items for each order
  const ordersWithItemsPromises = activeOrders.map(async (order) => {
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

  // Get all payments to determine which orders are paid
  const allPayments = await db.select().from(payments);
  const paidOrderIds = new Set(allPayments.map(p => p.orderId));

  // Filter out paid orders
  const unpaidOrders = ordersWithItems.filter(order => !paidOrderIds.has(order.id));

  return unpaidOrders;
}

export type CashierOrder = Awaited<ReturnType<typeof getUnpaidOrders>>[number];