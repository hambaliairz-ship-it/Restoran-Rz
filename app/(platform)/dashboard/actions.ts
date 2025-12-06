'use server';

import { db } from '@/db';
import { orders, payments, ingredients } from '@/db/schema';
import { count, eq, sum, and, gte, lte, desc, sql } from 'drizzle-orm';

export async function getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 1. Total Orders Today
    const ordersCount = await db.select({ count: count() })
        .from(orders)
        .where(gte(orders.createdAt, today));

    // 2. Total Revenue Today
    // Note: We need to join with payments to get actual revenue, or just sum completed orders totalAmount
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

    // 4. Low Stock Ingredients
    // We fetch all ingredients and filter in JS because comparing columns (current <= min) in drizzle simple query can be tricky depending on types
    const allIngredients = await db.select().from(ingredients);
    const lowStockCount = allIngredients.filter(i => 
        parseFloat(i.currentStock || '0') <= parseFloat(i.minStock || '0')
    ).length;

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
