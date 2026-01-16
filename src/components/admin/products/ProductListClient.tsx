"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  ShoppingCart,
  Package
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card"; // Added for mobile view

interface ProductListClientProps {
  initialData: any[];
}

export default function ProductListClient({ initialData }: ProductListClientProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");

  // Search Filter
  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="space-y-4">
      
      {/* --- HEADER ACTIONS --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111] p-4 rounded-xl border border-gray-800">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search products..."
            className="pl-9 bg-[#0a0a0a] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-green-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/admin/products/new" className="w-full sm:w-auto">
          <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* --- DESKTOP TABLE VIEW --- */}
      <div className="hidden md:block rounded-xl border border-gray-800 bg-[#0a0a0a] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#111]">
            <TableRow className="border-gray-800 hover:bg-[#111]">
              <TableHead className="text-gray-400 w-[80px]">Image</TableHead>
              <TableHead className="text-gray-400">Title</TableHead>
              <TableHead className="text-gray-400">Category</TableHead>
              <TableHead className="text-gray-400">Price</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Sales</TableHead>
              <TableHead className="text-right text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((product) => (
                <TableRow key={product._id} className="border-gray-800 hover:bg-[#111] transition-colors group">
                  <TableCell>
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
                    <div className="font-medium text-gray-200 truncate max-w-[250px]" title={product.title}>
                      {product.title}
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block font-mono mt-0.5">
                      /{product.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-gray-700 text-gray-400 bg-gray-900">
                      {product.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-green-500">৳{product.salePrice}</span>
                      {product.regularPrice > product.salePrice && (
                        <span className="text-xs text-gray-600 line-through">
                          ৳{product.regularPrice}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`border px-2 py-0.5 text-[10px] uppercase ${
                        product.isAvailable 
                          ? "border-green-900 text-green-400 bg-green-900/10" 
                          : "border-red-900 text-red-400 bg-red-900/10"
                      }`}
                    >
                      {product.isAvailable ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {product.salesCount || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white hover:bg-gray-800">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-gray-800 text-white w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link href={`/product/${product.slug}`} target="_blank">
                           <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white">
                              <Eye className="mr-2 h-4 w-4 text-blue-400" /> View Live
                           </DropdownMenuItem>
                        </Link>
                        <Link href={`/admin/products/${product._id}`}>
                          <DropdownMenuItem className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white">
                            <Pencil className="mr-2 h-4 w-4 text-yellow-400" /> Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-500 focus:text-red-400 hover:bg-red-900/20 focus:bg-red-900/20"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      {/* --- MOBILE CARD VIEW --- */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {filteredData.length === 0 ? (
          <div className="text-center p-8 text-gray-500 border border-dashed border-gray-800 rounded-xl">
            No products found.
          </div>
        ) : (
          filteredData.map((product) => (
            <Card key={product._id} className="bg-[#111] border-gray-800">
              <CardContent className="p-4 space-y-4">
                {/* Header: Image + Title + Menu */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-700 bg-gray-900 shrink-0">
                      <Image 
                        src={product.thumbnail} 
                        alt={product.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm line-clamp-1">{product.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-gray-700 text-gray-400">
                          {product.category?.name}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={`text-[10px] px-1.5 h-5 uppercase ${
                            product.isAvailable 
                              ? "border-green-900 text-green-400 bg-green-900/10" 
                              : "border-red-900 text-red-400 bg-red-900/10"
                          }`}
                        >
                          {product.isAvailable ? "Active" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-gray-800 text-white">
                      <Link href={`/admin/products/${product._id}`}>
                        <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={() => handleDelete(product._id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Footer: Price + Sales */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Price</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-lg font-bold text-green-500">৳{product.salePrice}</span>
                       {product.regularPrice > product.salePrice && (
                         <span className="text-xs text-gray-600 line-through">৳{product.regularPrice}</span>
                       )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-sm bg-gray-900 px-2 py-1 rounded border border-gray-800">
                     <ShoppingCart className="w-3.5 h-3.5" />
                     <span>{product.salesCount || 0} sold</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}