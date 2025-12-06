"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, CheckCircle2, ChefHat, AlertCircle, Loader2 } from "lucide-react"
import { updateOrderStatus, type KitchenOrder } from "./actions"
import { useState } from "react"
import { toast } from "sonner"

interface OrderCardProps {
  order: KitchenOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
    preparing: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900",
    ready: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900",
  }

  const statusIcon = {
    pending: <AlertCircle className="h-4 w-4" />,
    confirmed: <CheckCircle2 className="h-4 w-4" />,
    preparing: <ChefHat className="h-4 w-4" />,
    ready: <CheckCircle2 className="h-4 w-4" />,
  }

  const handleStatusUpdate = async (newStatus: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled") => {
    console.log(`Updating order ${order.id} to ${newStatus}`);
    setIsLoading(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm border shadow-sm flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {order.orderNumber}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Meja {order.tableNumber}
            </span>
          </div>
          <Badge 
            variant="secondary" 
            className={cn("capitalize gap-1", statusColors[order.status as keyof typeof statusColors])}
          >
            {statusIcon[order.status as keyof typeof statusIcon]}
            {order.status}
          </Badge>
        </div>
        <CardTitle className="text-lg font-medium mt-2">
          {order.customerName || "Guest"}
        </CardTitle>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <Separator className="mb-3" />
        <div className="space-y-3">
          {order.items.map((item) => {
            if (!item.menuItem) return null;
            return (
            <div key={item.id} className="flex justify-between items-start text-sm">
              <div className="flex gap-2">
                <span className="font-bold bg-muted px-1.5 rounded text-foreground">
                  {item.quantity}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium">{item.menuItem.name}</span>
                  {item.notes && (
                    <span className="text-sm text-amber-600 dark:text-amber-400 italic">
                      Note: {item.notes}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t bg-muted/30 flex justify-end gap-2 p-6">
        {order.status === 'pending' && (
          <Button size="sm" disabled={isLoading} onClick={() => handleStatusUpdate('preparing')}>
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mulai Masak"}
          </Button>
        )}
        {order.status === 'preparing' && (
          <Button size="sm" variant="default" disabled={isLoading} className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('ready')}>
             {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Siap Disajikan"}
          </Button>
        )}
        {order.status === 'ready' && (
          <Button size="sm" variant="outline" disabled={isLoading} onClick={() => handleStatusUpdate('completed')}>
             {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Selesai"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
