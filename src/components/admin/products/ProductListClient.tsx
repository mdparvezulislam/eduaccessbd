"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, 
  ShoppingCart, Package, ChevronLeft, ChevronRight, Filter,
  Zap, Loader2, Link as LinkIcon, FileText
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProductListClientProps {
  initialData: any[];
}

export default function ProductListClient({ initialData }: ProductListClientProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 27;

  // Quick Edit State
  const [quickEditProduct, setQuickEditProduct] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter Logic
  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted successfully");
        setData((prev) => prev.filter((p) => p._id !== id));
        router.refresh();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  // Quick Edit Save Handler
  const handleQuickSave = async () => {
    if (!quickEditProduct) return;
    setIsSaving(true);

    try {
      const payload = {
        ...quickEditProduct,
        salePrice: Number(quickEditProduct.salePrice) || 0,
        regularPrice: Number(quickEditProduct.regularPrice) || 0,
        defaultPrice: Number(quickEditProduct.defaultPrice) || 0,
        isAvailable: quickEditProduct.isAvailable,
        accessLink: quickEditProduct.accessLink,
        accessNote: quickEditProduct.accessNote,
      };

      const res = await fetch(`/api/products/${quickEditProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to quick update");

      toast.success("Product updated instantly!");
      
      setData((prev) => prev.map(p => p._id === quickEditProduct._id ? { ...p, ...payload } : p));
      setQuickEditProduct(null);
      router.refresh();

    } catch (error: any) {
      toast.error(error.message || "Quick update failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* --- HEADER & ACTIONS --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111] p-3 rounded-xl border border-gray-800 shadow-sm">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-[350px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by title or category..."
            className="pl-9 h-9 bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-green-500/50 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="hidden sm:flex border-gray-700 bg-[#0a0a0a] text-gray-300 hover:text-white hover:bg-gray-800 h-9">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Link href="/admin/products/new" className="w-full sm:w-auto">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-white font-medium h-9">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* --- DESKTOP VIEW (Table) --- */}
      <div className="hidden md:block rounded-xl border border-gray-800 bg-[#0a0a0a] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#111]">
            <TableRow className="border-gray-800 hover:bg-[#111]">
              <TableHead className="text-gray-400 font-medium w-[70px]">Image</TableHead>
              <TableHead className="text-gray-400 font-medium">Product Name</TableHead>
              <TableHead className="text-gray-400 font-medium">Category</TableHead>
              <TableHead className="text-gray-400 font-medium">Price</TableHead>
              <TableHead className="text-gray-400 font-medium">Status</TableHead>
              <TableHead className="text-gray-400 font-medium">Sales</TableHead>
              <TableHead className="text-right text-gray-400 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No products found matching &quot;{search}&quot;.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((product) => (
                <TableRow key={product._id} className="border-gray-800 hover:bg-[#111] transition-colors group py-2">
                  <TableCell className="py-2">
                    <div className="relative w-9 h-9 rounded-md overflow-hidden border border-gray-700 bg-gray-900">
                      <Image 
                        src={product.thumbnail} 
                        alt={product.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="font-medium text-gray-200 truncate max-w-[200px] text-sm" title={product.title}>
                     <Link href={`/admin/products/${product._id}`} className="hover:text-green-400 transition-colors">
                       {product.title}
                     </Link>
                    </div>
                    <div className="text-[10px] text-gray-500 hidden sm:block font-mono mt-0.5 truncate max-w-[150px]">
                      ID: {product.slug}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge   onClick={() => setQuickEditProduct({...product})} variant="outline" className="font-normal border-gray-700 text-gray-400 bg-gray-900/50 text-[10px]">
                      {product.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">৳{product.salePrice}</span>
                      {product.regularPrice > product.salePrice && (
                        <span className="text-[10px] text-gray-500 line-through">
                          ৳{product.regularPrice}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge 
                      variant="outline"
                      className={`border px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider ${
                        product.isAvailable 
                          ? "border-green-900/50 text-green-400 bg-green-900/10" 
                          : "border-red-900/50 text-red-400 bg-red-900/10"
                      }`}
                    >
                      {product.isAvailable ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <ShoppingCart className="w-3 h-3" />
                        <span className="font-mono">{product.salesCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white hover:bg-gray-800">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-gray-800 text-white w-40 shadow-xl">
                        <DropdownMenuLabel className="text-[10px] text-gray-500 uppercase tracking-wider">Manage</DropdownMenuLabel>
                        
                        <DropdownMenuItem 
                          className="cursor-pointer hover:bg-gray-800 text-xs text-green-400 focus:text-green-300 focus:bg-green-900/10 font-bold"
                          onClick={() => setQuickEditProduct({...product})}
                        >
                          <Zap className="mr-2 h-3.5 w-3.5" /> Quick Edit
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-gray-800" />

                        <Link href={`/product/${product.slug}`} target="_blank">
                           <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 text-xs">
                              <Eye className="mr-2 h-3.5 w-3.5 text-blue-400" /> View Live
                           </DropdownMenuItem>
                        </Link>
                        <Link href={`/admin/products/${product._id}`}>
                          <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 text-xs">
                            <Pencil className="mr-2 h-3.5 w-3.5 text-yellow-400" /> Edit Details
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-500 hover:text-red-400 hover:bg-red-900/20 text-xs"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW (Cards) --- */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {currentData.length === 0 ? (
          <div className="text-center p-8 text-gray-500 border border-dashed border-gray-800 rounded-xl">
            No products found.
          </div>
        ) : (
          currentData.map((product) => (
            <Card key={product._id} className="bg-[#0a0a0a] border-gray-800 overflow-hidden shadow-none">
              <CardContent className="p-0">
                <div className="flex p-3 gap-3">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-700 bg-gray-900 shrink-0">
                    <Image src={product.thumbnail} alt={product.title} fill className="object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight pr-2">{product.title}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1 text-gray-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-gray-800 text-white">
                            
                            <DropdownMenuItem className="cursor-pointer text-xs font-bold text-green-400" onClick={() => setQuickEditProduct({...product})}>
                              <Zap className="mr-2 h-3.5 w-3.5" /> Quick Edit
                            </DropdownMenuItem>

                            <Link href={`/admin/products/${product._id}`}>
                              <DropdownMenuItem className="cursor-pointer text-xs">Full Edit</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="text-red-500 cursor-pointer text-xs" onClick={() => handleDelete(product._id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p onClick={() => setQuickEditProduct({...product})} className="text-[10px] text-gray-500 mt-0.5">{product.category?.name}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-green-500 leading-none">৳{product.salePrice}</span>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`text-[9px] px-1.5 h-4 uppercase tracking-wide ${
                          product.isAvailable ? "border-green-900/50 text-green-400 bg-green-900/10" : "border-red-900/50 text-red-400 bg-red-900/10"
                        }`}
                      >
                        {product.isAvailable ? "Active" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {filteredData.length > itemsPerPage && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div className="text-xs text-gray-500 hidden sm:block">
            Showing <span className="text-white font-medium">{startIndex + 1}</span> to <span className="text-white font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-white font-medium">{filteredData.length}</span> entries
          </div>
          
          <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0 border-gray-700 bg-transparent text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && page - array[index - 1] > 1 && <span className="text-gray-600 text-[10px] px-1">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`h-7 w-7 rounded-md text-[11px] font-medium transition-all ${
                        currentPage === page ? "bg-white text-black font-bold" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0 border-gray-700 bg-transparent text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* ⚡ QUICK EDIT DIALOG MODAL                                        */}
      {/* ================================================================= */}
      <Dialog open={!!quickEditProduct} onOpenChange={(open) => !open && setQuickEditProduct(null)}>
        <DialogContent className="bg-[#111] border border-gray-800 text-white sm:max-w-[420px] w-[95vw] rounded-2xl p-5 gap-0">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg flex items-center gap-2 text-white leading-none">
              <Zap className="w-4 h-4 text-green-500 fill-current" /> Quick Edit
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-xs truncate pr-4 mt-1">
              {quickEditProduct?.title}
            </DialogDescription>
          </DialogHeader>

          {quickEditProduct && (
            <div className="space-y-4 py-2">
              
              {/* Pricing Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sale Price</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-gray-500 text-xs font-bold">৳</span>
                    <Input 
                      type="number" 
                      value={quickEditProduct.salePrice} 
                      onChange={(e) => setQuickEditProduct({ ...quickEditProduct, salePrice: e.target.value })}
                      className="pl-6 bg-[#0a0a0a] border-gray-700 text-green-400 font-bold h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Regular Price</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-gray-500 text-xs font-bold">৳</span>
                    <Input 
                      type="number" 
                      value={quickEditProduct.regularPrice} 
                      onChange={(e) => setQuickEditProduct({ ...quickEditProduct, regularPrice: e.target.value })}
                      className="pl-6 bg-[#0a0a0a] border-gray-700 text-white h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Display Price (Starts at)</Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-gray-500 text-xs font-bold">৳</span>
                  <Input 
                    type="number" 
                    value={quickEditProduct.defaultPrice} 
                    onChange={(e) => setQuickEditProduct({ ...quickEditProduct, defaultPrice: e.target.value })}
                    className="pl-6 bg-[#0a0a0a] border-gray-700 text-white h-8 text-xs"
                  />
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-blue-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3 h-3" /> Access Link
                  </Label>
                  <Input 
                    value={quickEditProduct.accessLink || ""} 
                    onChange={(e) => setQuickEditProduct({ ...quickEditProduct, accessLink: e.target.value })}
                    className="bg-[#0a0a0a] border-gray-700 text-white h-8 text-xs"
                    placeholder="https://mega.nz/..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-blue-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Access Note / Credentials
                  </Label>
                  <Textarea 
                    value={quickEditProduct.accessNote || ""} 
                    onChange={(e) => setQuickEditProduct({ ...quickEditProduct, accessNote: e.target.value })}
                    className="bg-[#0a0a0a] border-gray-700 text-white min-h-[60px] text-xs resize-none"
                    placeholder="Decryption Key / Password..."
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg">
                <div>
                  <Label className="text-xs font-bold text-white cursor-pointer" htmlFor="status-switch">
                    Availability
                  </Label>
                  <p className="text-[10px] text-gray-500 mt-0.5">Toggle to publish/hide.</p>
                </div>
                <Switch 
                  id="status-switch"
                  checked={quickEditProduct.isAvailable} 
                  onCheckedChange={(checked) => setQuickEditProduct({ ...quickEditProduct, isAvailable: checked })}
                  className="data-[state=checked]:bg-green-500 scale-90"
                />
              </div>

            </div>
          )}

          <DialogFooter className="mt-2 sm:justify-end gap-2 pt-4 border-t border-gray-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickEditProduct(null)} className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white h-8 text-xs">
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleQuickSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white min-w-[100px] h-8 text-xs font-bold">
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Zap className="w-3 h-3 mr-2 fill-current" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}