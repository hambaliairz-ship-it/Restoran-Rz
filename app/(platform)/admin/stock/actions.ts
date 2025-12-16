'use server';

import { getDb } from '@/db';
import { ingredients, stockTransactions, menuItems, orders, orderItems, payments } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getIngredients() {
  const db = getDb();
  return await db.select().from(ingredients).orderBy(ingredients.name);
}

export type Ingredient = Awaited<ReturnType<typeof getIngredients>>[number];

export async function getStockTransactions() {
  const db = getDb();

  // Get stock transactions with related ingredients
  const rawTransactions = await db.select()
      .from(stockTransactions)
      .orderBy(desc(stockTransactions.createdAt))
      .leftJoin(ingredients, eq(stockTransactions.ingredientId, ingredients.id))
      .limit(20);

  // Transform the results to match expected format
  const transactions = rawTransactions.map(transaction => ({
    id: transaction.stock_transactions.id,
    ingredientId: transaction.stock_transactions.ingredientId,
    transactionType: transaction.stock_transactions.transactionType,
    quantity: transaction.stock_transactions.quantity,
    reason: transaction.stock_transactions.reason,
    createdAt: transaction.stock_transactions.createdAt,
    ingredient: transaction.ingredients ? {
      id: transaction.ingredients.id,
      name: transaction.ingredients.name,
      unit: transaction.ingredients.unit,
      currentStock: transaction.ingredients.currentStock,
      minStock: transaction.ingredients.minStock,
      costPerUnit: transaction.ingredients.costPerUnit,
    } : null
  }));

  return transactions;
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
    const ingredientResult = await tx.select()
        .from(ingredients)
        .where(eq(ingredients.id, ingredientId));

    const ingredient = ingredientResult[0];

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
