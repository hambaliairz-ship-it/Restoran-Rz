"use client"

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
import { addStockTransaction, type Ingredient } from "./actions"
import { toast } from "sonner"
import { Loader2, Plus, Minus, ArrowRightLeft } from "lucide-react"

interface StockTransactionDialogProps {
  ingredients: Ingredient[];
}

export function StockTransactionDialog({ ingredients }: StockTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [selectedIngredient, setSelectedIngredient] = useState("")
  const [type, setType] = useState<"in" | "out" | "adjustment">("in")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = async () => {
    if (!selectedIngredient || !quantity || parseFloat(quantity) <= 0) {
        toast.error("Mohon lengkapi data dengan benar");
        return;
    }

    setIsLoading(true);
    try {
        await addStockTransaction({
            ingredientId: selectedIngredient,
            type,
            quantity: parseFloat(quantity),
            reason
        });
        toast.success("Stok berhasil diperbarui");
        setIsOpen(false);
        setQuantity("");
        setReason("");
    } catch (error) {
        toast.error("Gagal memperbarui stok");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Update Stok
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Stok Bahan</DialogTitle>
          <DialogDescription>
            Catat barang masuk, keluar, atau penyesuaian stok (opname).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Jenis Transaksi</Label>
            <div className="flex gap-2">
                <Button 
                    type="button"
                    variant={type === 'in' ? 'default' : 'outline'} 
                    className="flex-1 gap-2"
                    onClick={() => setType('in')}
                >
                    <Plus className="h-4 w-4" /> Masuk
                </Button>
                <Button 
                    type="button"
                    variant={type === 'out' ? 'destructive' : 'outline'} 
                    className="flex-1 gap-2"
                    onClick={() => setType('out')}
                >
                    <Minus className="h-4 w-4" /> Keluar
                </Button>
                <Button 
                    type="button"
                    variant={type === 'adjustment' ? 'secondary' : 'outline'} 
                    className="flex-1"
                    onClick={() => setType('adjustment')}
                >
                    Adjust
                </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ingredient">Pilih Bahan</Label>
            <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
              <SelectTrigger id="ingredient">
                <SelectValue placeholder="Pilih bahan baku" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.unit})
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Jumlah ({type === 'out' ? 'Keluar' : 'Masuk'})</Label>
            <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">Keterangan (Opsional)</Label>
            <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Pembelian pasar, Busuk, dll"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
