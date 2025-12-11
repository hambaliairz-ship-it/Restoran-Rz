import { MenuGrid, Category } from "@/components/organisms/MenuGrid";
import { FloatingCart } from "@/components/molecules/FloatingCart";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons } from "@/components/auth-buttons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getMenuData } from "@/app/menu/actions";
import { ClientHomeContent } from "./client-home";
import type { MenuCategory as DbCategory, MenuItemWithCategory } from "@/app/menu/actions";

// Helper to transform DB data to Frontend data structure
function transformData(dbCategories: DbCategory[], dbItems: MenuItemWithCategory[]): Category[] {
  return dbCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description || "",
    menuItems: dbItems
      .filter(item => item.categoryId === cat.id)
      .map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: parseFloat(item.price),
        imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", // Default image if null
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime || 15
      }))
  })).filter(cat => cat.menuItems.length > 0);
}

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch real data from DB
  const { categories: dbCategories, items: dbItems } = await getMenuData();
  const categories = transformData(dbCategories, dbItems);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
       <ClientHomeContent initialCategories={categories} />
    </div>
  );
}
