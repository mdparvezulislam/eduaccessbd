"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, 
  ShoppingCart, Package, ChevronLeft, ChevronRight, Filter
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProductListClientProps {
  initialData: any[];
}

export default function ProductListClient({ initialData }: ProductListClientProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  
  // ⚡ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 27;

  // ⚡ Filter Logic
  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ⚡ Pagination Logic
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

  return (
    <div className="space-y-6">
      
      {/* --- HEADER & ACTIONS --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111] p-4 rounded-xl border border-gray-800 shadow-sm">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-[350px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by title or category..."
            className="pl-9 h-10 bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-green-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="hidden sm:flex border-gray-700 bg-[#0a0a0a] text-gray-300 hover:text-white hover:bg-gray-800">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Link href="/admin/products/new" className="w-full sm:w-auto">
            <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-white font-medium">
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
              <TableHead className="text-gray-400 font-medium w-[80px]">Image</TableHead>
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
                <TableCell colSpan={7} className="h-40 text-center text-gray-500">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No products found matching &quot;{search}&quot;.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((product) => (
                <TableRow key={product._id} className="border-gray-800 hover:bg-[#111] transition-colors group">
                  <TableCell className="py-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                      <Image 
                        src={product.thumbnail} 
                        alt={product.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-200 truncate max-w-[220px]" title={product.title}>
                     <Link href={`/admin/products/${product._id}`} className="hover:text-green-400 transition-colors">
                       {product.title}
                     </Link>
                    </div>
                    <div className="text-[10px] text-gray-500 hidden sm:block font-mono mt-0.5 truncate max-w-[150px]">
                      ID: {product.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-gray-700 text-gray-400 bg-gray-900/50">
                      {product.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">৳{product.salePrice}</span>
                      {product.regularPrice > product.salePrice && (
                        <span className="text-[10px] text-gray-500 line-through">
                          ৳{product.regularPrice}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`border px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                        product.isAvailable 
                          ? "border-green-900/50 text-green-400 bg-green-900/10" 
                          : "border-red-900/50 text-red-400 bg-red-900/10"
                      }`}
                    >
                      {product.isAvailable ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span className="font-mono">{product.salesCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white hover:bg-gray-800">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-gray-800 text-white w-40 shadow-xl">
                        <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">Manage</DropdownMenuLabel>
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
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700 bg-gray-900 shrink-0">
                    <Image 
                      src={product.thumbnail} 
                      alt={product.title} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  
                  {/* Info */}
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
                            <Link href={`/admin/products/${product._id}`}>
                              <DropdownMenuItem className="cursor-pointer text-xs">Edit</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="text-red-500 cursor-pointer text-xs" onClick={() => handleDelete(product._id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{product.category?.name}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500">Price</span>
                        <span className="text-sm font-bold text-green-500">৳{product.salePrice}</span>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`text-[9px] px-1.5 h-5 uppercase tracking-wide ${
                          product.isAvailable 
                            ? "border-green-900/50 text-green-400 bg-green-900/10" 
                            : "border-red-900/50 text-red-400 bg-red-900/10"
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
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 hidden sm:block">
            Showing <span className="text-white font-medium">{startIndex + 1}</span> to <span className="text-white font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-white font-medium">{filteredData.length}</span> entries
          </div>
          
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-gray-700 bg-transparent text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Logic to show limited page numbers (start, end, current)
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && page - array[index - 1] > 1 && (
                      <span className="text-gray-600 text-xs px-1">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-md text-xs font-medium transition-all ${
                        currentPage === page
                          ? "bg-white text-black font-bold"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
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
              className="h-8 w-8 p-0 border-gray-700 bg-transparent text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}