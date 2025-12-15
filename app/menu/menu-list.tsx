"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2, ChevronLeft, ChevronRight, Clock } from "lucide-react"
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
import useEmblaCarousel from "embla-carousel-react"

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
        <div className="flex flex-col min-h-screen pb-24 bg-background overflow-x-hidden">
            {/* Category Filter */}
            <div
                className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-3 sm:px-4 py-2.5 sm:py-3 overflow-x-auto flex gap-1.5 sm:gap-2 justify-start lg:justify-center"
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <Button
                    variant={activeCategory === "all" ? "default" : "outline"}
                    onClick={() => setActiveCategory("all")}
                    className="rounded-full whitespace-nowrap text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 shrink-0"
                >
                    Semua
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat.id}
                        variant={activeCategory === cat.id ? "default" : "outline"}
                        onClick={() => setActiveCategory(cat.id)}
                        className="rounded-full whitespace-nowrap text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 shrink-0"
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            {/* Menu Grid dengan Carousel */}
            <div className="px-3 sm:px-4 py-4 overflow-hidden">
                <MenuCarousel items={filteredItems} onAddToCart={addToCart} />
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-20">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="lg" className="rounded-full shadow-lg h-12 sm:h-14 px-4 sm:px-6 gap-2 sm:gap-3">
                                <div className="relative">
                                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {cart.reduce((a, b) => a + b.quantity, 0)}
                                    </span>
                                </div>
                                <span className="font-bold text-sm sm:text-base">
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

// Komponen Carousel Menu Modern
function MenuCarousel({ items, onAddToCart }: { items: MenuItemWithCategory[]; onAddToCart: (item: MenuItem) => void }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        containScroll: "trimSnaps",
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 3 },
        }
    });

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
                Tidak ada menu dalam kategori ini
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 gap-2">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{items.length} menu</p>
                {/* Navigation Buttons */}
                <div className="flex gap-1 shrink-0">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollPrev}
                        disabled={!canScrollPrev}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollNext}
                        disabled={!canScrollNext}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                </div>
            </div>

            {/* Carousel - Both Mobile & Desktop */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-3 sm:gap-4 lg:justify-center">
                    {items.map((item) => (
                        <div key={item.id} className="flex-none w-[75vw] sm:w-[260px] md:w-[280px] lg:w-[300px] max-w-[280px] sm:max-w-none">
                            <Card
                                className="group overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-background to-muted/30 active:scale-[0.98]"
                                onClick={() => onAddToCart(item)}
                            >
                                {/* Image */}
                                <div className="relative h-36 sm:h-44 overflow-hidden rounded-t-2xl bg-background">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                // Jika gambar tidak bisa dimuat, ganti dengan placeholder
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null; // Hindari loop error
                                                target.src = `https://placehold.co/300x200?text=${encodeURIComponent(item.name)}`;
                                                target.alt = `No image available for ${item.name}`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                                            <span className="text-muted-foreground text-sm">No Image</span>
                                        </div>
                                    )}
                                    {/* Add button overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                            <Plus className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <CardContent className="p-3 sm:p-4">
                                    <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1 mb-1.5 sm:mb-2">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-lg sm:text-xl text-emerald-600 dark:text-emerald-400">
                                            Rp {parseFloat(item.price).toLocaleString('id-ID')}
                                        </span>
                                        {item.preparationTime && (
                                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 gap-1 text-xs">
                                                <Clock className="h-3 w-3" />
                                                {item.preparationTime}m
                                            </Badge>
                                        )}
                                    </div>
                                    {item.description && (
                                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1.5 sm:mt-2">
                                            {item.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
