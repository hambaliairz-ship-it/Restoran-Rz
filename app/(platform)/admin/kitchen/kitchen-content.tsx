"use client";

import { OrderCard } from "./order-card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import type { getKitchenOrders } from "./actions";

type KitchenOrders = Awaited<ReturnType<typeof getKitchenOrders>>;

interface KitchenContentProps {
  orders: KitchenOrders;
}

export function KitchenContent({ orders }: KitchenContentProps) {
  const { t } = useLanguage();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("kitchenDashboardTitle")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("kitchenDashboardDesc")}
          </p>
        </div>
        <Button variant="outline" size="icon" className="self-end sm:self-auto">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            {t("kitchenNoOrders")}
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}
