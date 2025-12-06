"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/providers/cart-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { formatCurrency } from "@/lib/utils";

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
    addItem({
      menuItemId: id,
      name,
      price,
      imageUrl: imageUrl || undefined,
    });
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full text-center">
      <div className="relative h-48 w-full bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover object-center"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t('noImage')}
          </div>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive">{t('outOfStock')}</Badge>
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col items-center gap-2">
          <CardTitle className="line-clamp-1 text-lg">{name}</CardTitle>
          <Badge variant="secondary" className="whitespace-nowrap">
            {formatCurrency(price)}
          </Badge>
        </div>
        {preparationTime && (
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <span>⏱ {preparationTime} {t('mins')}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || t('noDescription')}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={!isAvailable}
        >
          {t('addToCart')}
        </Button>
      </CardFooter>
    </Card>
  );
}
