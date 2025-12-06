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
import { useState } from "react"
import { addIngredient } from "./actions"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

export function AddIngredientDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("")
  const [cost, setCost] = useState("")
  const [minStock, setMinStock] = useState("")

  const handleSubmit = async () => {
    if (!name || !unit || !cost) {
        toast.error("Mohon lengkapi data bahan");
        return;
    }

    setIsLoading(true);
    try {
        await addIngredient({
            name,
            unit,
            costPerUnit: parseFloat(cost),
            minStock: parseFloat(minStock) || 0
        });
        toast.success("Bahan baru berhasil ditambahkan");
        setIsOpen(false);
        setName("");
        setUnit("");
        setCost("");
        setMinStock("");
    } catch (error) {
        toast.error("Gagal menambahkan bahan");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Bahan Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Bahan Baku Baru</DialogTitle>
          <DialogDescription>
            Daftarkan bahan baku baru ke dalam inventaris.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Bahan</Label>
            <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Beras, Telur, Tepung"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="unit">Satuan</Label>
                <Input
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="kg, liter, butir"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="cost">Biaya per Satuan (Rp)</Label>
                <Input
                    id="cost"
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0"
                />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="minStock">Minimal Stok (Alert)</Label>
            <Input
                id="minStock"
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="0"
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
