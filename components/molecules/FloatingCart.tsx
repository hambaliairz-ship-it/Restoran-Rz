"use client"

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/providers/cart-provider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function FloatingCart() {
  const { totalItems } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(totalItems > 0);
  }, [totalItems]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
      <Link href="/checkout">
        <Button size="lg" className="rounded-full shadow-lg h-14 w-14 p-0 relative">
            <ShoppingCart className="h-6 w-6" />
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full p-0">
                {totalItems}
            </Badge>
        </Button>
      </Link>
    </div>
  );
}
