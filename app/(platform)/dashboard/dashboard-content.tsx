"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Activity, AlertTriangle, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/components/providers/language-provider";
import type { getDashboardStats } from "./actions";

type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

interface DashboardContentProps {
  stats: DashboardStats;
}

export function DashboardContent({ stats }: DashboardContentProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboardTotalRevenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {parseFloat(stats.revenueToday).toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">{t("dashboardToday")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboardOrdersToday")}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersToday}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboardIncomingTransactions")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboardActiveOrders")}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboardInKitchen")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboardLowStock")}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboardNeedRestock")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("dashboardRecentOrders")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboardOrderId")}</TableHead>
                  <TableHead>{t("dashboardCustomer")}</TableHead>
                  <TableHead>{t("dashboardStatus")}</TableHead>
                  <TableHead className="text-right">
                    {t("dashboardTotal")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      {t("dashboardNoOrders")}
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {t("table")} {order.tableNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "outline"
                              : order.status === "pending"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        Rp {parseFloat(order.totalAmount).toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("dashboardQuickAccess")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <a
              href="/menu"
              target="_blank"
              className="group flex items-center gap-4 rounded-lg border p-4 hover:bg-slate-100 transition-all"
            >
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-200 transition-colors">
                <Utensils className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium group-hover:text-black transition-colors">
                  {t("dashboardOpenMenu")}
                </div>
                <div className="text-sm text-muted-foreground group-hover:text-slate-900 transition-colors">
                  {t("dashboardOpenMenuDesc")}
                </div>
              </div>
            </a>

            <a
              href="/admin/kitchen"
              className="group flex items-center gap-4 rounded-lg border p-4 hover:bg-slate-100 transition-all"
            >
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full group-hover:bg-orange-200 transition-colors">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium group-hover:text-black transition-colors">
                  {t("dashboardMonitorKitchen")}
                </div>
                <div className="text-sm text-muted-foreground group-hover:text-slate-900 transition-colors">
                  {t("dashboardMonitorKitchenDesc")}
                </div>
              </div>
            </a>

            <a
              href="/admin/cashier"
              className="group flex items-center gap-4 rounded-lg border p-4 hover:bg-slate-100 transition-all"
            >
              <div className="p-2 bg-green-100 text-green-600 rounded-full group-hover:bg-green-200 transition-colors">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium group-hover:text-black transition-colors">
                  {t("dashboardCashier")}
                </div>
                <div className="text-sm text-muted-foreground group-hover:text-slate-900 transition-colors">
                  {t("dashboardCashierDesc")}
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
