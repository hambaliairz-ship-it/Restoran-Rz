
import type { InferSelectModel } from 'drizzle-orm';
import type { orders, orderItems, menuItems } from '@/db/schema';

export type Order = InferSelectModel<typeof orders>;
export type OrderItem = InferSelectModel<typeof orderItems>;
export type MenuItem = InferSelectModel<typeof menuItems>;

export interface CashierOrderItem extends OrderItem {
  menuItem: MenuItem | null;
}

export interface CashierOrder extends Order {
  items: CashierOrderItem[];
}
