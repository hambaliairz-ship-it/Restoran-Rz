"use client";

import { MenuGrid, Category } from "@/components/organisms/MenuGrid";
import { FloatingCart } from "@/components/molecules/FloatingCart";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons } from "@/components/auth-buttons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/components/providers/language-provider";

interface ClientHomeContentProps {
  initialCategories: Category[];
}

export function ClientHomeContent({ initialCategories }: ClientHomeContentProps) {
  const { t } = useLanguage();
  
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
        <div className="container flex h-16 items-center justify-between px-4 max-w-7xl">
            <div className="flex items-center gap-2 font-bold text-xl">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
                <span>Restoran Rz</span>
            </div>
            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
                <AuthButtons />
            </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted/50 w-full flex justify-center">
        <div className="container px-4 text-center max-w-7xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                {t('heroTitle')}
            </h1>
            <p className="mt-4 mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {t('heroDesc')}
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href="#menu">{t('viewMenu')}</Link>
                </Button>
            </div>
        </div>
      </section>

      {/* Menu Section */}
      <main id="menu" className="container px-4 py-12 md:py-16 max-w-7xl flex flex-col items-center">
          <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('menuTitle')}</h2>
              <p className="text-muted-foreground mt-2">{t('menuDesc')}</p>
          </div>
          
          <MenuGrid categories={initialCategories} />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0 w-full flex justify-center">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 max-w-7xl">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © 2024 Restoran Rz. {t('footerRights')}
            </p>
          </div>
      </footer>

      <FloatingCart />
    </>
  );
}
