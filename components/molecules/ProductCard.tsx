"use client"

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/providers/cart-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { formatCurrency } from "@/lib/utils";
import { Plus, Clock } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable?: boolean | null;
  preparationTime?: number | null;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  isAvailable = true,
  preparationTime,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addItem({
      menuItemId: id,
      name,
      price,
      imageUrl: imageUrl || undefined,
    });
  };

  return (
    <Card 
      className="group overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-background to-muted/30 active:scale-[0.98]"
      onClick={handleAddToCart}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden rounded-t-2xl bg-background">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">{t('noImage')}</span>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        {/* Add button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Plus className="h-6 w-6" />
          </div>
        </div>
        {/* Out of stock overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive">{t('outOfStock')}</Badge>
          </div>
        )}
      </div>
      
      {/* Content - Horizontal Layout */}
      <CardContent className="p-4">
        {/* Row 1: Name */}
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1 mb-2">
          {name}
        </h3>
        
        {/* Row 2: Price and Time - Horizontal */}
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
            {formatCurrency(price)}
          </span>
          {preparationTime && (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 gap-1">
              <Clock className="h-3 w-3" />
              {preparationTime} {t('mins')}
            </Badge>
          )}
        </div>
        
        {/* Row 3: Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
