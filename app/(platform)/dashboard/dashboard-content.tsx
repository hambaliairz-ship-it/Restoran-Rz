"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Activity, AlertTriangle, Utensils, Settings, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteOrder } from "./actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

const ITEMS_PER_PAGE = 5;

export function DashboardContent({ stats }: DashboardContentProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(stats.recentOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = stats.recentOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div className="grid auto-rows-min gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
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

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t("dashboardRecentOrders")}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {/* Mobile: Card View */}
            <div className="block md:hidden space-y-3">
              {paginatedOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t("dashboardNoOrders")}
                </p>
              ) : (
                paginatedOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{order.orderNumber}</span>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "outline"
                            : order.status === "pending"
                              ? "destructive"
                              : "secondary"
                        }
                        className="capitalize text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{t("table")} {order.tableNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          Rp {parseFloat(order.totalAmount).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-1 border-t">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                        onClick={async () => {
                          if (confirm("Yakin ingin menghapus pesanan ini?")) {
                            try {
                              await deleteOrder(order.id);
                              toast.success("Pesanan berhasil dihapus");
                            } catch {
                              toast.error("Gagal menghapus pesanan");
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("dashboardOrderId")}</TableHead>
                    <TableHead>{t("dashboardCustomer")}</TableHead>
                    <TableHead>{t("dashboardStatus")}</TableHead>
                    <TableHead className="text-right">
                      {t("dashboardTotal")}
                    </TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        {t("dashboardNoOrders")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order) => (
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
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={async () => {
                              if (confirm("Yakin ingin menghapus pesanan ini?")) {
                                try {
                                  await deleteOrder(order.id);
                                  toast.success("Pesanan berhasil dihapus");
                                } catch {
                                  toast.error("Gagal menghapus pesanan");
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {stats.recentOrders.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-4 border-t mt-4 gap-2">
                <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  <span className="hidden sm:inline">Menampilkan </span>
                  {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, stats.recentOrders.length)}
                  <span className="hidden sm:inline"> dari </span>
                  <span className="sm:hidden"> / </span>
                  {stats.recentOrders.length}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs sm:text-sm"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>{t("dashboardQuickAccess")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:gap-4 px-2 sm:px-6">
            <a
              href="/menu"
              target="_blank"
              className="group flex items-center gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 hover:bg-muted/50 transition-all"
            >
              <div className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-200 transition-colors shrink-0">
                <Utensils className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm sm:text-base truncate">
                  {t("dashboardOpenMenu")}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate">
                  {t("dashboardOpenMenuDesc")}
                </div>
              </div>
            </a>

            <a
              href="/admin/kitchen"
              className="group flex items-center gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 hover:bg-muted/50 transition-all"
            >
              <div className="p-1.5 sm:p-2 bg-orange-100 text-orange-600 rounded-full group-hover:bg-orange-200 transition-colors shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm sm:text-base truncate">
                  {t("dashboardMonitorKitchen")}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate">
                  {t("dashboardMonitorKitchenDesc")}
                </div>
              </div>
            </a>

            <a
              href="/admin/cashier"
              className="group flex items-center gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 hover:bg-muted/50 transition-all"
            >
              <div className="p-1.5 sm:p-2 bg-green-100 text-green-600 rounded-full group-hover:bg-green-200 transition-colors shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm sm:text-base truncate">
                  {t("dashboardCashier")}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate">
                  {t("dashboardCashierDesc")}
                </div>
              </div>
            </a>

            <a
              href="/admin/menu"
              className="group flex items-center gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 hover:bg-muted/50 transition-all"
            >
              <div className="p-1.5 sm:p-2 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-200 transition-colors shrink-0">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm sm:text-base truncate">
                  Manajemen Menu
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate">
                  Tambah, edit, dan hapus menu
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
