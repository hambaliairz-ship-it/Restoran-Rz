"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { processPayment } from "./actions"
import type { CashierOrder } from "./types"
import { toast } from "sonner"
import { Loader2, Receipt } from "lucide-react"

interface PaymentDialogProps {
  order: CashierOrder;
}

export function PaymentDialog({ order }: PaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amountPaid, setAmountPaid] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isLoading, setIsLoading] = useState(false)

  const totalAmount = parseFloat(order.totalAmount)
  const change = amountPaid ? parseFloat(amountPaid) - totalAmount : 0

  const handlePayment = async () => {
    console.log("Processing payment for order:", order.id);
    if (!amountPaid || parseFloat(amountPaid) < totalAmount) {
      toast.error("Pembayaran kurang dari total tagihan")
      return
    }

    setIsLoading(true)
    try {
      const result = await processPayment({
        orderId: order.id,
        amountPaid: parseFloat(amountPaid),
        paymentMethod,
        totalAmount,
      })

      if (result.success) {
        toast.success(`Pembayaran berhasil! Kembalian: Rp ${result.changeAmount?.toLocaleString('id-ID')}`)
        setIsOpen(false)
      } else {
        console.error("Payment failed:", result.error);
        toast.error("Gagal memproses pembayaran")
      }
    } catch (error) {
      console.error("System error during payment:", error);
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" onClick={() => console.log("Opening dialog")}>
          <Receipt className="h-4 w-4" />
          Proses Pembayaran
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pembayaran - {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Meja {order.tableNumber} • {order.customerName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 text-black rounded-lg border font-bold">
            <span className="font-medium">Total Tagihan</span>
            <span className="text-xl font-bold text-black">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="method">Metode Pembayaran</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="method">
                <SelectValue placeholder="Pilih metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tunai (Cash)</SelectItem>
                <SelectItem value="qris">QRIS</SelectItem>
                <SelectItem value="debit">Debit Card</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Jumlah Diterima</Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground pointer-events-none z-10">Rp</span>
              <Input
                id="amount"
                type="number"
                className="pl-10 text-lg h-12"
                placeholder="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-sm text-muted-foreground">Kembalian</span>
            <span className={cn(
              "font-mono font-medium",
              change < 0 ? "text-red-500" : "text-green-600"
            )}>
              Rp {change > 0 ? change.toLocaleString('id-ID') : "0"}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handlePayment} disabled={isLoading || change < 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Konfirmasi Bayar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
