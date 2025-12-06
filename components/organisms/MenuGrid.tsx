import React from 'react';
import { ProductCard } from "@/components/molecules/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export function MenuGrid({ categories }: MenuGridProps) {
  if (!categories.length) {
    return <div className="text-center py-10">No menu items found.</div>;
  }

  return (
    <Tabs defaultValue={categories[0].id} className="w-full">
      <TabsList className="w-full flex flex-wrap h-auto justify-center gap-2 bg-transparent p-0 mb-6">
        {categories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-full"
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="mt-0">
           <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
              {category.description && <p className="text-muted-foreground">{category.description}</p>}
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {category.menuItems.map((item) => (
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
        </TabsContent>
      ))}
    </Tabs>
  );
}
