"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { 
  Menu, 
  LayoutDashboard, 
  UtensilsCrossed, 
  ChefHat, 
  Wallet, 
  Package 
} from "lucide-react"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/admin/menu": "Manajemen Menu",
  "/admin/kitchen": "Kitchen Dashboard",
  "/admin/cashier": "Cashier Point",
  "/admin/stock": "Manajemen Stok",
}

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Manajemen Menu", url: "/admin/menu", icon: UtensilsCrossed },
  { title: "Kitchen Dashboard", url: "/admin/kitchen", icon: ChefHat },
  { title: "Cashier Point", url: "/admin/cashier", icon: Wallet },
  { title: "Manajemen Stok", url: "/admin/stock", icon: Package },
]

export function SiteHeader() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Dashboard"

  return (
    <header className="h-14 shrink-0 border-b bg-background">
      <div className="flex h-full w-full max-w-7xl mx-auto items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Dropdown Menu Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.url} asChild>
                  <Link 
                    href={item.url} 
                    className={`flex items-center gap-2 ${pathname === item.url ? "bg-accent" : ""}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Kembali ke Beranda</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-base font-semibold">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
