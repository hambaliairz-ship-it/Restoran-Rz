"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { ProductCard } from "@/components/molecules/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

export interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean | null;
    preparationTime: number | null;
}

export interface Category {
    id: string;
    name: string;
    description: string | null;
    menuItems: MenuItem[];
}

interface MenuGridProps {
    categories: Category[];
}

// Carousel Component
function MenuCarousel({ items }: { items: MenuItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
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

  return (
    <div className="relative">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{items.length} menu tersedia</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="h-8 w-8 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="h-8 w-8 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex-none w-[280px] md:w-[300px] lg:w-[320px]">
              <ProductCard
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                imageUrl={item.imageUrl}
                isAvailable={item.isAvailable}
                preparationTime={item.preparationTime}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MenuGrid({ categories }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  if (!categories.length) {
    return <div className="text-center py-10">No menu items found.</div>;
  }

  // Get all menu items or filtered by category
  const allItems = categories.flatMap(cat => cat.menuItems);
  const filteredItems = activeCategory === "all" 
    ? allItems 
    : categories.find(cat => cat.id === activeCategory)?.menuItems || [];

  const currentCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="w-full">
      {/* Category Filter - Same style as /menu */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <Button 
          variant={activeCategory === "all" ? "default" : "outline"} 
          onClick={() => setActiveCategory("all")}
          className="rounded-full whitespace-nowrap"
        >
          Semua
        </Button>
        {categories.map((category) => (
          <Button 
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            onClick={() => setActiveCategory(category.id)}
            className="rounded-full whitespace-nowrap"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Category Title */}
      {activeCategory !== "all" && currentCategory && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">{currentCategory.name}</h2>
          {currentCategory.description && (
            <p className="text-muted-foreground mt-1">{currentCategory.description}</p>
          )}
        </div>
      )}
      
      {/* Carousel for larger screens */}
      <div className="hidden md:block">
        <MenuCarousel items={filteredItems} />
      </div>
      
      {/* Grid for mobile */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            imageUrl={item.imageUrl}
            isAvailable={item.isAvailable}
            preparationTime={item.preparationTime}
          />
        ))}
      </div>
    </div>
  );
}
