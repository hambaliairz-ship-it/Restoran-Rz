import { SiteHeader } from "@/components/site-header"

import "@/app/(platform)/theme.css"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="flex flex-1 flex-col max-w-7xl mx-auto w-full">{children}</main>
    </div>
  )
}