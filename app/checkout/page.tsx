"use client";

import { useCart } from "@/components/providers/cart-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { createOrder } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();
  const { t } = useLanguage();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  const handleCheckout = async () => {
    if (!customerName) {
        toast.error("Please enter your name");
        return;
    }
    
    setIsProcessing(true);

    try {
        const result = await createOrder({
            customerName,
            tableNumber,
            totalAmount,
            items: items.map(item => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.price,
                notes: item.notes
            }))
        });

        if (result.success) {
            toast.success(t('orderSuccess'));
            clearCart();
            // Optionally redirect to an order status page instead of home
            // router.push(`/order-status/${result.orderId}`);
            router.push("/"); 
        } else {
            toast.error(result.error || "Failed to place order");
        }
    } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
    } finally {
        setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container max-w-2xl py-20 text-center px-4">
        <h1 className="text-3xl font-bold mb-4">{t('cartEmpty')}</h1>
        <p className="text-muted-foreground mb-8">{t('cartEmptyDesc')}</p>
        <Button asChild>
          <Link href="/">{t('backToMenu')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold">{t('checkout')}</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.menuItemId}>
              <CardContent className="p-4 flex gap-4 items-center">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-muted-foreground">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(item.menuItemId)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nama Pelanggan</Label>
                <Input 
                    id="customerName" 
                    placeholder="Masukkan nama Anda" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Nomor Meja (Opsional)</Label>
                <Input 
                    id="tableNumber" 
                    placeholder="Contoh: 12" 
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground">{t('totalItems')}</span>
                <span>{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>{t('totalAmount')}</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isProcessing}>
                {isProcessing ? t('processing') : t('placeOrder')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
