"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOrder, type MenuCategory, type MenuItemWithCategory } from "./actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: string;
    imageUrl: string | null;
    categoryId: string | null;
}

interface CartItem extends MenuItem {
    cartId: string;
    quantity: number;
    notes: string;
}

interface MenuListProps {
  categories: MenuCategory[];
  items: MenuItemWithCategory[];
}

export function MenuList({ categories, items }: MenuListProps) {
    const [activeCategory, setActiveCategory] = useState("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    
    // Customer Info State
    const [customerName, setCustomerName] = useState("");
    const [tableNumber, setTableNumber] = useState("");

    const filteredItems = activeCategory === "all" 
        ? items 
        : items.filter(item => item.categoryId === activeCategory);

    const currentCategory = categories.find(c => c.id === activeCategory);
    const categoryDescription = activeCategory === "all" 
        ? "Semua menu pilihan terbaik kami" 
        : currentCategory?.description;

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, cartId: Math.random().toString(), quantity: 1, notes: "" }];
        });
        toast.success("Masuk keranjang!");
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.cartId === cartId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeItem = (cartId: string) => {
        setCart(prev => prev.filter(i => i.cartId !== cartId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    const handleCheckout = async () => {
        if (!customerName || !tableNumber) {
            toast.error("Isi nama dan nomor meja dulu ya!");
            return;
        }

        setIsCheckingOut(true);
        try {
            await createOrder({
                customerName,
                tableNumber,
                totalAmount,
                items: cart.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    notes: item.notes
                }))
            });
        } catch (error) {
            toast.error("Gagal membuat pesanan");
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-24 bg-background">
            {/* Category Filter */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4 overflow-x-auto flex gap-2 no-scrollbar">
                <Button 
                    variant={activeCategory === "all" ? "default" : "outline"} 
                    onClick={() => setActiveCategory("all")}
                    className="rounded-full whitespace-nowrap"
                >
                    Semua
                </Button>
                {categories.map(cat => (
                    <Button 
                        key={cat.id}
                        variant={activeCategory === cat.id ? "default" : "outline"}
                        onClick={() => setActiveCategory(cat.id)}
                        className="rounded-full whitespace-nowrap"
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            {/* Category Description */}
            <div className="py-6 px-4 text-center">
                <p className="text-muted-foreground text-lg italic font-medium">
                    {categoryDescription}
                </p>
            </div>

            {/* Menu Grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden flex flex-col">
                        <div className="h-40 bg-muted flex items-center justify-center text-muted-foreground">
                            {/* Placeholder for Image */}
                            <span className="text-sm">No Image</span>
                        </div>
                        <CardContent className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2 gap-2">
                                <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground">{item.name}</h3>
                                <Badge variant="secondary" className="whitespace-nowrap shrink-0">
                                    {item.preparationTime ? `${item.preparationTime} min` : '-'}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {item.description}
                            </p>
                            <div className="font-bold text-lg text-foreground">
                                Rp {parseFloat(item.price).toLocaleString('id-ID')}
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Button className="w-full gap-2" onClick={() => addToCart(item)}>
                                <Plus className="h-4 w-4" /> Tambah
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 right-6 z-20">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="lg" className="rounded-full shadow-lg h-14 px-6 gap-3">
                                <div className="relative">
                                    <ShoppingCart className="h-6 w-6" />
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {cart.reduce((a, b) => a + b.quantity, 0)}
                                    </span>
                                </div>
                                <span className="font-bold">
                                    Rp {totalAmount.toLocaleString('id-ID')}
                                </span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
                            <SheetHeader>
                                <SheetTitle>Keranjang Pesanan</SheetTitle>
                            </SheetHeader>
                            
                            <div className="flex-1 overflow-y-auto py-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="customer">Nama Pemesan</Label>
                                        <Input 
                                            id="customer" 
                                            placeholder="Budi Santoso"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="table">Nomor Meja</Label>
                                        <Input 
                                            id="table" 
                                            placeholder="5"
                                            value={tableNumber}
                                            onChange={(e) => setTableNumber(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div
                                          key={item.cartId}
                                          className="flex justify-between items-start text-sm bg-muted p-3 rounded-lg"
                                        >
                                          <div className="flex gap-3 w-full">
                                            <Badge variant="secondary" className="whitespace-nowrap shrink-0 h-fit px-2 py-1">
                                              {item.quantity}x
                                            </Badge>
                                            <div className="flex flex-col flex-1 min-w-0">
                                              <span className="font-medium text-foreground truncate">{item.name}</span>
                                              <span className="font-mono text-muted-foreground">
                                                Rp {parseFloat(item.price).toLocaleString('id-ID')}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 ml-2 shrink-0">
                                            <div className="flex items-center gap-1 bg-background border rounded-md shadow-sm">
                                              <button
                                                onClick={() => updateQuantity(item.cartId, -1)}
                                                className="p-1 hover:bg-muted h-6 w-6 flex items-center justify-center"
                                                disabled={item.quantity <= 1}
                                              >
                                                <Minus className="h-3 w-3" />
                                              </button>
                                              <button
                                                onClick={() => updateQuantity(item.cartId, 1)}
                                                className="p-1 hover:bg-muted h-6 w-6 flex items-center justify-center"
                                              >
                                                <Plus className="h-3 w-3" />
                                              </button>
                                            </div>
                                            <button
                                              onClick={() => removeItem(item.cartId)}
                                              className="text-red-500 p-1 hover:bg-red-50 rounded h-6 w-6 flex items-center justify-center"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <SheetFooter className="border-t pt-4 mt-auto">
                                <div className="w-full space-y-4">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total</span>
                                        <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                                    </div>
                                    <Button 
                                        className="w-full size-lg text-lg" 
                                        onClick={handleCheckout}
                                        disabled={isCheckingOut}
                                    >
                                        {isCheckingOut && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                        Pesan Sekarang
                                    </Button>
                                </div>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            )}
        </div>
    );
}
