"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, ImagePlus, Loader2, FolderPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { CloudinaryImageUpload } from "@/components/molecules/CloudinaryImageUpload";
import {
  createMenuItem,
  createCategory,
  updateMenuItem,
  deleteMenuItem,
  deleteCategory,
} from "./actions";
import type { categories as categoriesTable, menuItems as menuItemsTable } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

type Category = InferSelectModel<typeof categoriesTable>;
type MenuItem = InferSelectModel<typeof menuItemsTable> & {
  category: Category | null;
};

interface MenuManagementProps {
  categories: Category[];
  menuItems: MenuItem[];
}

export function MenuManagement({ categories, menuItems }: MenuManagementProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state untuk menu baru
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    preparationTime: "",
    imageUrl: "",
  });

  // Form state untuk kategori baru
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  // State untuk Cloudinary Public ID (diperlukan untuk delete jika perlu)
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);

  // Preview image
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(menuItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMenuItems = menuItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handler untuk ketika upload ke Cloudinary berhasil
  const handleCloudinaryUpload = (url: string, publicId: string) => {
    setMenuForm((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
    setImagePublicId(publicId);
    toast.success(`Gambar berhasil diupload ke Cloudinary`);
  };

  const handleCreateMenu = async () => {
    if (!menuForm.name || !menuForm.price) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }

    try {
      setIsLoading(true);
      await createMenuItem({
        name: menuForm.name,
        description: menuForm.description || undefined,
        price: menuForm.price,
        categoryId: menuForm.categoryId || undefined,
        imageUrl: menuForm.imageUrl || undefined,
        preparationTime: menuForm.preparationTime
          ? parseInt(menuForm.preparationTime)
          : undefined,
      });

      toast.success("Menu berhasil ditambahkan");
      setIsAddMenuOpen(false);
      resetMenuForm();
    } catch (error: any) {
      console.error("Error menambahkan menu:", error);
      const errorMessage = error.message || "Gagal menambahkan menu";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      toast.error("Nama kategori wajib diisi");
      return;
    }

    try {
      setIsLoading(true);
      await createCategory({
        name: categoryForm.name,
        description: categoryForm.description || undefined,
      });

      toast.success("Kategori berhasil ditambahkan");
      setIsAddCategoryOpen(false);
      setCategoryForm({ name: "", description: "" });
    } catch (error: any) {
      console.error("Error menambahkan kategori:", error);
      const errorMessage = error.message || "Gagal menambahkan kategori";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMenu = (item: MenuItem) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      categoryId: item.categoryId || "",
      preparationTime: item.preparationTime?.toString() || "",
      imageUrl: item.imageUrl || "",
    });
    setImagePreview(item.imageUrl);
    setImagePublicId(null); // Reset public ID karena bukan upload baru
    setIsEditMenuOpen(true);
  };

  const handleUpdateMenu = async () => {
    if (!editingItem) return;

    try {
      setIsLoading(true);
      await updateMenuItem(editingItem.id, {
        name: menuForm.name,
        description: menuForm.description || undefined,
        price: menuForm.price,
        categoryId: menuForm.categoryId || undefined,
        imageUrl: menuForm.imageUrl || undefined,
        preparationTime: menuForm.preparationTime
          ? parseInt(menuForm.preparationTime)
          : undefined,
      });

      toast.success("Menu berhasil diperbarui");
      setIsEditMenuOpen(false);
      setEditingItem(null);
      resetMenuForm();
    } catch (error: any) {
      console.error("Error memperbarui menu:", error);
      const errorMessage = error.message || "Gagal memperbarui menu";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;

    try {
      await deleteMenuItem(id);
      toast.success("Menu berhasil dihapus");
    } catch (error: any) {
      console.error("Error menghapus menu:", error);
      const errorMessage = error.message || "Gagal menghapus menu";
      toast.error(errorMessage);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini? Menu dalam kategori ini akan menjadi tanpa kategori.")) return;

    try {
      await deleteCategory(id);
      toast.success("Kategori berhasil dihapus");
    } catch (error: any) {
      console.error("Error menghapus kategori:", error);
      const errorMessage = error.message || "Gagal menghapus kategori";
      toast.error(errorMessage);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      toast.success(item.isAvailable ? "Menu dinonaktifkan" : "Menu diaktifkan");
    } catch (error: any) {
      console.error("Error mengubah status menu:", error);
      const errorMessage = error.message || "Gagal mengubah status menu";
      toast.error(errorMessage);
    }
  };

  const resetMenuForm = () => {
    setMenuForm({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      preparationTime: "",
      imageUrl: "",
    });
    setImagePreview(null);
    setImagePublicId(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Manajemen Menu</h1>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                Tambah Kategori
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kategori Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Nama Kategori *</Label>
                  <Input
                    id="cat-name"
                    placeholder="Contoh: Makanan Utama"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-desc">Deskripsi</Label>
                  <Textarea
                    id="cat-desc"
                    placeholder="Deskripsi kategori (opsional)"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateCategory}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddMenuOpen} onOpenChange={(open) => {
            setIsAddMenuOpen(open);
            if (!open) resetMenuForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Menu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Menu Baru</DialogTitle>
              </DialogHeader>
              <MenuForm
                form={menuForm}
                setForm={setMenuForm}
                categories={categories}
                imagePreview={imagePreview}
                onCloudinaryUpload={handleCloudinaryUpload}
                isLoading={isLoading}
              />
              <DialogFooter>
                <Button onClick={handleCreateMenu} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Menu
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kategori List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <p className="text-muted-foreground">Belum ada kategori</p>
            ) : (
              categories.map((cat) => (
                <Badge key={cat.id} variant="secondary" className="text-sm py-1 px-3 gap-2">
                  {cat.name}
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Menu List */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Daftar Menu ({menuItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {/* Mobile: Card View */}
          <div className="block md:hidden space-y-3">
            {paginatedMenuItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada menu</p>
            ) : (
              paginatedMenuItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-16 w-20 object-cover rounded shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-20 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground shrink-0">
                        No Img
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{item.category?.name || "-"}</Badge>
                        {item.preparationTime && (
                          <span className="text-xs text-muted-foreground">{item.preparationTime} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-green-600">
                        Rp {parseFloat(item.price).toLocaleString("id-ID")}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Tersedia:</span>
                        <Switch
                          checked={item.isAvailable ?? true}
                          onCheckedChange={() => handleToggleAvailability(item)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditMenu(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDeleteMenu(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                  <TableHead>Gambar</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMenuItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Belum ada menu
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMenuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-12 w-16 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            No Img
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {item.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category?.name || "-"}</Badge>
                      </TableCell>
                      <TableCell>
                        Rp {parseFloat(item.price).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      {item.preparationTime ? `${item.preparationTime} min` : "-"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isAvailable ?? true}
                        onCheckedChange={() => handleToggleAvailability(item)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditMenu(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => handleDeleteMenu(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {menuItems.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between pt-4 border-t mt-4 gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                <span className="hidden sm:inline">Menampilkan </span>
                {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, menuItems.length)}
                <span className="hidden sm:inline"> dari </span>
                <span className="sm:hidden"> / </span>
                {menuItems.length}
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

      {/* Edit Dialog */}
      <Dialog open={isEditMenuOpen} onOpenChange={(open) => {
        setIsEditMenuOpen(open);
        if (!open) {
          setEditingItem(null);
          resetMenuForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
          </DialogHeader>
          <MenuForm
            form={menuForm}
            setForm={setMenuForm}
            categories={categories}
            imagePreview={imagePreview}
            onCloudinaryUpload={handleCloudinaryUpload}
            isLoading={isLoading}
          />
          <DialogFooter>
            <Button onClick={handleUpdateMenu} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Komponen Form Menu
function MenuForm({
  form,
  setForm,
  categories,
  imagePreview,
  onCloudinaryUpload,
  isLoading,
}: {
  form: {
    name: string;
    description: string;
    price: string;
    categoryId: string;
    preparationTime: string;
    imageUrl: string;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  categories: Category[];
  imagePreview: string | null;
  onCloudinaryUpload: (url: string, publicId: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Menu *</Label>
          <Input
            id="name"
            placeholder="Contoh: Nasi Goreng Spesial"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Harga (Rp) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="25000"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          placeholder="Deskripsi menu (opsional)"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select
            value={form.categoryId}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, categoryId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="prepTime">Waktu Persiapan (menit)</Label>
          <Input
            id="prepTime"
            type="number"
            placeholder="15"
            value={form.preparationTime}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, preparationTime: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gambar Menu</Label>
        <div className="flex flex-col gap-4">
          {/* Cloudinary Image Upload Component */}
          <CloudinaryImageUpload
            onUploadSuccess={onCloudinaryUpload}
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "demo_upload_preset"}
            maxFileSize={5}
            allowedFormats={['jpeg', 'jpg', 'png', 'webp']}
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-2">
              <Label>Pratinjau Gambar</Label>
              <div className="mt-1 flex items-center gap-2">
                <img 
                  src={imagePreview} 
                  alt="Pratinjau" 
                  className="h-20 w-20 object-contain border rounded" 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}