import { getMenuData } from "./actions"
import { MenuList } from "./menu-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const { categories, items } = await getMenuData()

  return (
    <div className="bg-background min-h-screen overflow-x-hidden">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-parkinsans text-foreground">Restoran Rz</h1>
              <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">Silakan pesan menu favorit Anda</p>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-5xl mx-auto px-0 sm:px-4 lg:px-8 overflow-hidden">
        <MenuList categories={categories} items={items} />
      </div>
    </div>
  )
}
