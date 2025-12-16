import { getDb } from '@/db';
import { orders, orderItems, menuItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function OrderConfirmationPage({ params }: PageProps) {
    const { id } = await params;

    const db = getDb();
    const orderResult = await db.select()
        .from(orders)
        .where(eq(orders.id, id));

    if (!orderResult || orderResult.length === 0) return notFound();

    const orderData = orderResult[0];

    // Get order items with menu items
    const orderItemsWithMenu = await db.select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderData.id))
        .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id));

    const order = {
        ...orderData,
        items: orderItemsWithMenu.map(item => ({
            ...item.order_items,
            menuItem: item.menu_items
        }))
    };

    if (!order) return notFound();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl text-green-700 dark:text-green-400">Pesanan Berhasil!</CardTitle>
                    <p className="text-muted-foreground">
                        Nomor Pesanan: <span className="font-bold font-mono text-foreground">{order.orderNumber}</span>
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pemesan</span>
                            <span className="font-medium">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Meja</span>
                            <span className="font-medium">{order.tableNumber}</span>
                        </div>
                        <div className="border-t border-border my-2 pt-2">
                             {order.items.map((item) => {
                                if (!item.menuItem) return null;
                                return (
                                <div key={item.id} className="flex justify-between text-sm py-1">
                                    <span>{item.quantity}x {item.menuItem.name}</span>
                                    <span>Rp {parseFloat(item.price).toLocaleString('id-ID')}</span>
                                </div>
                             )})}
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-border">
                            <span>Total</span>
                            <span>Rp {parseFloat(order.totalAmount).toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Silakan tunggu, pesanan Anda sedang disiapkan di dapur.
                        Mohon tunjukkan halaman ini ke kasir saat pembayaran.
                    </p>

                    <Button asChild className="w-full">
                        <Link href="/menu">
                            <Home className="mr-2 h-4 w-4" /> Kembali ke Menu
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
