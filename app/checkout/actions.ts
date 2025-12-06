'use server';

import { db } from '@/db';
import { orders, orderItems, menuItems, orderStatusEnum } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

// Define a specific type for the order input
export type CreateOrderInput = {
  customerName?: string;
  tableNumber?: string;
  items: {
    menuItemId: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  totalAmount: number;
};

export async function createOrder(data: CreateOrderInput) {
  try {
    // Generate a simple order number (you might want a more robust system in prod)
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      customerName: data.customerName || 'Guest',
      tableNumber: data.tableNumber || 'Takeaway',
      totalAmount: data.totalAmount.toString(),
      status: 'pending', // Initial status: Pending (Kitchen/Cashier will see this)
    }).returning();

    if (!newOrder) throw new Error('Failed to create order');

    // Insert order items
    if (data.items.length > 0) {
        await db.insert(orderItems).values(
            data.items.map(item => ({
                orderId: newOrder.id,
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.price.toString(),
                notes: item.notes,
            }))
        );
    }

    revalidatePath('/admin/kitchen');
    revalidatePath('/admin/cashier');
    
    return { success: true, orderId: newOrder.id, orderNumber: newOrder.orderNumber };
  } catch (error) {
    console.error('Error creating order detailed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to place order' };
  }
}
