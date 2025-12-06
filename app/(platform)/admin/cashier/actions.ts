'use server';

import { db } from '@/db';
import { orders, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function processPayment(data: {
  orderId: string;
  amountPaid: number;
  paymentMethod: string;
  totalAmount: number;
}) {
  const { orderId, amountPaid, paymentMethod, totalAmount } = data;
  const changeAmount = amountPaid - totalAmount;

  if (changeAmount < 0) {
    throw new Error('Payment amount is less than total amount');
  }

  try {
    await db.transaction(async (tx) => {
      // 1. Create Payment Record
      await tx.insert(payments).values({
        orderId,
        amountPaid: amountPaid.toString(),
        paymentMethod,
        changeAmount: changeAmount.toString(),
      });

      // 2. Update Order Status to 'completed'
      await tx.update(orders)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    });

    revalidatePath('/admin/cashier');
    revalidatePath('/admin/kitchen'); // Update kitchen too as order is now completed
    return { success: true, changeAmount };
  } catch (error) {
    console.error('Payment processing failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to process payment' };
  }
}
