import { db } from '@/db';
import { orders, menuItems } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function TestDbPage() {
  let items: (typeof menuItems.$inferSelect)[] = [];
  let allOrders: (typeof orders.$inferSelect)[] = [];
  let error = null;

  try {
    items = await db.select().from(menuItems);
    allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="p-8 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-6">Database Diagnostic Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border p-4 rounded bg-slate-50">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Menu Items ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-muted-foreground">No menu items found.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="bg-white p-2 rounded border">
                  <div className="font-bold">{item.name}</div>
                  <div>Price: {item.price}</div>
                  <div>Category ID: {item.categoryId}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border p-4 rounded bg-slate-50">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Orders ({allOrders.length})</h2>
          {allOrders.length === 0 ? (
            <p className="text-muted-foreground">No orders found.</p>
          ) : (
            <ul className="space-y-2">
              {allOrders.map((order) => (
                <li key={order.id} className="bg-white p-2 rounded border">
                  <div className="flex justify-between">
                    <span className="font-bold">{order.orderNumber}</span>
                    <span className={`px-2 rounded text-xs ${
                      order.status === 'pending' ? 'bg-yellow-200' :
                      order.status === 'ready' ? 'bg-green-200' :
                      'bg-gray-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div>Customer: {order.customerName}</div>
                  <div>Total: {order.totalAmount}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
