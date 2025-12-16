'use server';

import { getDb } from '@/db';
import { ingredients, stockTransactions, menuItems, orders, orderItems, payments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getIngredients() {
  const db = getDb();
  return await db.select().from(ingredients).orderBy(ingredients.name);
}

export type Ingredient = Awaited<ReturnType<typeof getIngredients>>[number];

export async function getStockTransactions() {
  const db = getDb();
  // Force explicit typing if needed or ensure logic handles potential nulls
  const transactions = await db.query.stockTransactions.findMany({
      orderBy: [desc(stockTransactions.createdAt)],
      with: {
          ingredient: true
      },
      limit: 20
  });
  return transactions as Array<{
      id: string;
      ingredientId: string | null;
      transactionType: "in" | "out" | "adjustment" | null;
      quantity: string;
      reason: string | null;
      createdAt: Date | null;
      ingredient: {
          id: string;
          name: string;
          unit: string;
          currentStock: string | null;
          minStock: string | null;
          costPerUnit: string;
      } | null;
  }>;
}

export async function addIngredient(data: { name: string; unit: string; costPerUnit: number; minStock: number }) {
  const db = getDb();
  await db.insert(ingredients).values({
      name: data.name,
      unit: data.unit,
      costPerUnit: data.costPerUnit.toString(),
      minStock: data.minStock.toString(),
      currentStock: "0"
  });
  revalidatePath('/admin/stock');
}

export async function addStockTransaction(data: {
  ingredientId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
}) {
  const { ingredientId, type, quantity, reason } = data;
  const db = getDb();

  await db.transaction(async (tx) => {
    // 1. Record transaction
    await tx.insert(stockTransactions).values({
      ingredientId,
      transactionType: type,
      quantity: quantity.toString(),
      reason,
    });

    // 2. Update current stock
    const ingredient = await tx.query.ingredients.findFirst({
        where: eq(ingredients.id, ingredientId)
    });

    if (!ingredient) throw new Error("Ingredient not found");

    const currentStock = parseFloat(ingredient.currentStock || '0');
    let newStock = currentStock;

    if (type === 'in') {
        newStock += quantity;
    } else {
        newStock -= quantity;
    }

    await tx.update(ingredients)
        .set({ currentStock: newStock.toString() })
        .where(eq(ingredients.id, ingredientId));
  });

  revalidatePath('/admin/stock');
  return { success: true };
}
