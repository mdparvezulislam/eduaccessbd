"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { IProduct, ICategory } from "@/types";
import { useCart } from "@/lib/CartContext";
import { toast } from "sonner";
import { 
  Search, 
  ShoppingCart, 
  Filter, 
  ArrowUpDown, 
  X,
  ChevronDown
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ShopClientProps {
  products: IProduct[];
  categories: ICategory[];
}

export default function ShopClient({ products, categories }: ShopClientProps) {
  const { addToCart, mapProductToCartItem } = useCart();
  
  // --- States ---
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // --- Filtering Logic ---
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // 1. Search Filter
        const matchSearch = product.title.toLowerCase().includes(search.toLowerCase());
        
        // 2. Category Filter
        // Handle both populated object and string ID scenarios safely
        const productCatSlug = typeof product.category === 'object' && product.category 
            ? product.category.slug 
            : ''; 
        const matchCategory = selectedCategory === "all" || productCatSlug === selectedCategory;

        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (sortOption === "price-low") return a.salePrice - b.salePrice;
        if (sortOption === "price-high") return b.salePrice - a.salePrice;
        return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
      });
  }, [products, search, selectedCategory, sortOption]);

  // --- Handlers ---
  const handleAddToCart = (e: React.MouseEvent, product: IProduct) => {
    e.preventDefault();
    e.stopPropagation();
    const item = mapProductToCartItem(product, 1);
    addToCart(item);
    toast.success("Added to cart!");
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className=" mx-auto px-0 md:px-6 py-4 md:py-12">
      
      {/* === HEADER & CONTROLS === */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-1">All Courses</h1>
          <p className="text-gray-400 text-sm">
            Showing {filteredProducts.length} results
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search courses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#111] border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-green-500/50 h-10"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Filter Sheet (Categories) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none border-gray-800 bg-[#111] text-gray-300 hover:bg-gray-800 hover:text-white">
                  <Filter className="w-4 h-4 mr-2" /> 
                  <span className="hidden sm:inline">Filter</span>
                  <span className="sm:hidden">Cat</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#0a0a0a] border-gray-800 text-white">
                <SheetHeader>
                  <SheetTitle className="text-white">Categories</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  <Button 
                    variant={selectedCategory === "all" ? "default" : "ghost"} 
                    className={`justify-start ${selectedCategory === "all" ? "bg-green-600 hover:bg-green-700" : "hover:bg-gray-800"}`}
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Categories
                  </Button>
                  {categories.map(cat => (
                    <Button
                      key={cat._id}
                      variant={selectedCategory === cat.slug ? "default" : "ghost"}
                      className={`justify-start ${selectedCategory === cat.slug ? "bg-green-600 hover:bg-green-700" : "hover:bg-gray-800"}`}
                      onClick={() => setSelectedCategory(cat.slug)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none border-gray-800 bg-[#111] text-gray-300 hover:bg-gray-800 hover:text-white justify-between min-w-[130px]">
                  <span className="flex items-center gap-2">
                     <ArrowUpDown className="w-4 h-4" /> 
                     <span className="truncate">
                       {sortOption === "newest" ? "Newest" : sortOption === "price-low" ? "Low Price" : "High Price"}
                     </span>
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#111] border-gray-800 text-white">
                <DropdownMenuItem onClick={() => setSortOption("newest")} className="focus:bg-gray-800 cursor-pointer">Newest Arrivals</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("price-low")} className="focus:bg-gray-800 cursor-pointer">Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("price-high")} className="focus:bg-gray-800 cursor-pointer">Price: High to Low</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* === PRODUCT GRID === */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-800 rounded-xl bg-[#111]">
          <div className="bg-gray-800/50 p-4 rounded-full mb-3">
            <Search className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white">No courses found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
          <Button 
            variant="link" 
            onClick={() => {setSearch(""); setSelectedCategory("all");}}
            className="text-green-500 mt-2"
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        // 👉 THE GRID: 2 Cols on Mobile, 3 on MD, 4 on XL
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {filteredProducts.map((product) => {
            const discount = product.regularPrice > product.salePrice
              ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
              : 0;

            return (
              <div
                key={product._id}
                className="group relative flex flex-col h-full bg-[#111] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/10"
              >
                <Link href={`/product/${product.slug}`} className="flex h-full flex-col">
                  
                  {/* Image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-black text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded shadow-sm">
                        {discount}% OFF
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                        HOT
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-3 md:p-4">
                    <h3
                      className="text-xs sm:text-sm md:text-base font-bold text-gray-100 line-clamp-2 leading-snug mb-2 group-hover:text-green-400 transition-colors min-h-[2.5rem]"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    <div className="mt-auto pt-3 border-t border-gray-800 flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.regularPrice > product.salePrice && (
                          <span className="text-[10px] md:text-xs text-gray-500 line-through">
                            {formatPrice(product.regularPrice)}
                          </span>
                        )}
                        <span className="text-sm md:text-lg font-extrabold text-white tracking-tight">
                          {formatPrice(product.salePrice)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-white hover:text-black transition-all active:scale-95 group/btn"
                      >
                        <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:fill-black" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}