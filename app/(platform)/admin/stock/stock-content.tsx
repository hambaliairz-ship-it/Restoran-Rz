"use client";

import { StockTransactionDialog } from "./transaction-dialog";
import { AddIngredientDialog } from "./add-ingredient-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, AlertTriangle, History } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import type { getIngredients, getStockTransactions } from "./actions";

type Ingredients = Awaited<ReturnType<typeof getIngredients>>;
type Transactions = Awaited<ReturnType<typeof getStockTransactions>>;

interface StockContentProps {
  ingredients: Ingredients;
  transactions: Transactions;
}

export function StockContent({ ingredients, transactions }: StockContentProps) {
  const { t } = useLanguage();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("stockTitle")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t("stockDesc")}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <AddIngredientDialog />
          <StockTransactionDialog ingredients={ingredients} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("stockTableTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {/* Mobile: Card View */}
            <div className="block md:hidden space-y-3">
              {ingredients.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">{t("stockNoIngredients")}</p>
              ) : (
                ingredients.map((item) => {
                  const current = parseFloat(item.currentStock || "0");
                  const min = parseFloat(item.minStock || "0");
                  const isLow = current <= min;

                  return (
                    <div key={item.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{item.name}</span>
                        {isLow ? (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <AlertTriangle className="h-3 w-3" /> {t("stockLow")}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-xs" variant="outline">
                            {t("stockSafe")}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">{t("stockCurrent")}: </span>
                          <span className="font-medium">{current} {item.unit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Harga: </span>
                          <span className="font-medium">Rp {parseFloat(item.costPerUnit).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("stockName")}</TableHead>
                    <TableHead className="text-right">{t("stockCurrent")}</TableHead>
                    <TableHead className="text-right">{t("stockCostPerUnit")}</TableHead>
                    <TableHead className="text-center">{t("stockStatus")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t("stockNoIngredients")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    ingredients.map((item) => {
                      const current = parseFloat(item.currentStock || "0");
                      const min = parseFloat(item.minStock || "0");
                      const isLow = current <= min;

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">
                            {current}{" "}
                            <span className="text-muted-foreground text-xs">
                              {item.unit}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            Rp {parseFloat(item.costPerUnit).toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell className="text-center">
                            {isLow ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" /> {t("stockLow")}
                              </Badge>
                            ) : (
                              <Badge className="bg-green-50 text-green-700 border-green-200" variant="outline">
                                {t("stockSafe")}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t("stockHistoryTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t("stockNoTransactions")}
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-start text-sm border-b last:border-0 pb-3 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">
                        {tx.ingredient?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={
                          tx.transactionType === "in"
                            ? "text-green-600 font-bold"
                            : "text-red-600 font-bold"
                        }
                      >
                        {tx.transactionType === "in" ? "+" : "-"}
                        {tx.quantity} {tx.ingredient?.unit || ""}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {tx.transactionType}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
