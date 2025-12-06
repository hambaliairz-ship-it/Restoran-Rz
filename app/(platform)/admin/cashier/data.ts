import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, desc, not } from 'drizzle-orm';

export async function getUnpaidOrders() {
  // Get all active orders (not cancelled)
  const activeOrders = await db.query.orders.findMany({
    where: not(eq(orders.status, 'cancelled')),
    orderBy: [desc(orders.createdAt)],
    with: {
      items: {
        with: {
          menuItem: true
        }
      }
    }
  });

  // Get all payments
  const allPayments = await db.query.payments.findMany();
  const paidOrderIds = new Set(allPayments.map(p => p.orderId));

  // Filter out paid orders
  const unpaidOrders = activeOrders.filter(o => !paidOrderIds.has(o.id));

  return unpaidOrders;
}

export type CashierOrder = Awaited<ReturnType<typeof getUnpaidOrders>>[number];
