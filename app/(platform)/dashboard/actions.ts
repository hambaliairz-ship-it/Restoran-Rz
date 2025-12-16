'use server';

import { getDb } from '@/db';
import { orders, payments, ingredients, orderItems, menuItems, stockTransactions, categories } from '@/db/schema';
import { count, eq, sum, and, gte, lte, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getDashboardStats() {
    const db = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Total Orders Today
    const ordersCount = await db.select({ count: count() })
        .from(orders)
        .where(gte(orders.createdAt, today));

    // 2. Total Revenue Today
    const revenueResult = await db.select({
            total: sum(orders.totalAmount)
        })
        .from(orders)
        .where(and(
            gte(orders.createdAt, today),
            eq(orders.status, 'completed')
        ));

    // 3. Active Orders (not completed, not cancelled)
    const activeOrdersCount = await db.select({ count: count() })
        .from(orders)
        .where(sql`${orders.status} NOT IN ('completed', 'cancelled')`);

    // 4. Low Stock Ingredients - optimized query
    const lowStockCount = await db.$count(ingredients,
        sql`${ingredients.currentStock} <= ${ingredients.minStock}`
    );

    // 5. Recent Orders
    const recentOrders = await db.query.orders.findMany({
        orderBy: [desc(orders.createdAt)],
        limit: 5,
        with: {
            items: {
                with: {
                    menuItem: true
                }
            }
        }
    });

    return {
        ordersToday: ordersCount[0].count,
        revenueToday: revenueResult[0].total || '0',
        activeOrders: activeOrdersCount[0].count,
        lowStockItems: lowStockCount,
        recentOrders
    };
}

export async function deleteOrder(orderId: string) {
    const db = getDb();

    // 1. Hapus payments yang terkait
    await db.delete(payments).where(eq(payments.orderId, orderId));

    // 2. Hapus order items yang terkait
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));

    // 3. Hapus order
    await db.delete(orders).where(eq(orders.id, orderId));

    revalidatePath('/dashboard');
    revalidatePath('/admin/cashier');
    revalidatePath('/admin/kitchen');
}
