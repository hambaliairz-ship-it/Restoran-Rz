import { getMenuData } from "./actions"
import { MenuList } from "./menu-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const { categories, items } = await getMenuData()

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-background/95 backdrop-blur border-b p-4 sticky top-0 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold font-parkinsans text-foreground">Restoran Rz</h1>
            <p className="text-muted-foreground text-sm hidden sm:block">Silakan pesan menu favorit Anda</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-5xl">
        <MenuList categories={categories} items={items} />
      </div>
    </div>
  )
}
