"use client";

import { PaymentDialog } from "./payment-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import type { CashierOrder } from "./types";

interface CashierContentProps {
  unpaidOrders: CashierOrder[];
}

export function CashierContent({ unpaidOrders }: CashierContentProps) {
  const { t } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("cashierTitle")}</h1>
          <p className="text-muted-foreground">{t("cashierDesc")}</p>
        </div>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {unpaidOrders.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/50">
            <Wallet className="h-12 w-12 mb-4 opacity-20" />
            <p>{t("cashierNoOrders")}</p>
          </div>
        ) : (
          unpaidOrders.map((order) => (
            <Card key={order.id} className="flex flex-col">
              <CardHeader className="pb-3 bg-muted/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="bg-background text-foreground">
                    {order.orderNumber}
                  </Badge>
                  <Badge variant={order.status === "ready" ? "default" : "secondary"}>
                    {order.status}
                  </Badge>
                </div>
                <CardTitle className="text-base">
                  Hambali • {t("table")} 12
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 py-4">
                <div className="space-y-2 mb-4">
                  {order.items.slice(0, 3).map((item) => {
                    if (!item.menuItem) return null;

                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="truncate pr-4 font-medium">
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="font-mono">
                          {parseFloat(item.price).toLocaleString("id-ID")}
                        </span>
                      </div>
                    );
                  })}
                  {order.items.length > 3 && (
                    <div className="text-sm text-muted-foreground italic pt-1">
                      + {order.items.length - 3} item lainnya...
                    </div>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{t("cashierTotal")}</span>
                  <span className="font-bold text-lg">
                    Rp {parseFloat(order.totalAmount).toLocaleString("id-ID")}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <PaymentDialog order={order} />
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
