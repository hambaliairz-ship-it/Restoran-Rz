import { pgTable, uuid, varchar, decimal, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { menuItems } from './menu';

export const transactionTypeEnum = pgEnum('transaction_type', ['in', 'out', 'adjustment']);

export const ingredients = pgTable('ingredients', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  currentStock: decimal('current_stock', { precision: 10, scale: 2 }).default('0'),
  minStock: decimal('min_stock', { precision: 10, scale: 2 }).default('0'),
  costPerUnit: decimal('cost_per_unit', { precision: 10, scale: 2 }).notNull(),
});

export const menuIngredients = pgTable('menu_ingredients', {
  id: uuid('id').defaultRandom().primaryKey(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id),
  ingredientId: uuid('ingredient_id').references(() => ingredients.id),
  quantityRequired: decimal('quantity_required', { precision: 10, scale: 2 }).notNull(),
});

export const stockTransactions = pgTable('stock_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  ingredientId: uuid('ingredient_id').references(() => ingredients.id),
  transactionType: transactionTypeEnum('transaction_type'),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const stockTransactionsRelations = relations(stockTransactions, ({ one }) => ({
  ingredient: one(ingredients, {
    fields: [stockTransactions.ingredientId],
    references: [ingredients.id],
  }),
}));

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  menuIngredients: many(menuIngredients),
  transactions: many(stockTransactions),
}));

export const menuIngredientsRelations = relations(menuIngredients, ({ one }) => ({
  menuItem: one(menuItems, {
    fields: [menuIngredients.menuItemId],
    references: [menuItems.id],
  }),
  ingredient: one(ingredients, {
    fields: [menuIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));
