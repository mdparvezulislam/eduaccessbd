"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/types";
import { ShoppingCart, Star, Check, Zap, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/CartContext"; 
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// ----------------------------------------------------------------------
// 1. SUB-COMPONENT: Individual Product Card (Handles its own state)
// ----------------------------------------------------------------------
const ProductCard = ({ product }: { product: IProduct }) => {
  const { addToCart, mapProductToCartItem } = useCart();
  
  // ⚡ State: Default to the first variant if available
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);

  // ⚡ Derived Data: Current Price & Details
  const currentVariant = hasVariants ? product.variants![selectedVariantIdx] : null;
  
  const displayPrice = currentVariant ? currentVariant.price : product.salePrice;
  const regularPrice = product.regularPrice; // Base regular price (or you could add regular price to variants too)
  
  // Discount Calculation
  const discount = regularPrice > displayPrice
    ? Math.round(((regularPrice - displayPrice) / regularPrice) * 100)
    : 0;

  // Handler: Add To Cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop navigation to detail page
    e.stopPropagation();

    // ⚡ Map with specific variant
    const cartItem = mapProductToCartItem(
      product, 
      1, 
      currentVariant || undefined // Pass the variant object if it exists
    );
    
    addToCart(cartItem);
    toast.success(`Added ${currentVariant ? currentVariant.name : product.title} to cart`);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="group relative flex flex-col h-full bg-[#0f0f11] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10">
      
      {/* Link to Details */}
      <Link href={`/product/${product.slug}`} className="flex-1 flex flex-col">
        
        {/* === IMAGE AREA === */}
        <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-transparent to-transparent opacity-80" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
             {discount > 0 && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-[10px] px-2 shadow-lg backdrop-blur-md border-0">
                -{discount}% OFF
              </Badge>
            )}
            {/* If Variant Selected, show Validity Badge */}
            {hasVariants && (
               <Badge variant="outline" className="bg-black/50 text-white border-white/20 text-[10px] backdrop-blur-md">
                 <Check className="w-3 h-3 mr-1 text-green-400" /> 
                 {currentVariant?.validity} Access
               </Badge>
            )}
          </div>

          {product.isFeatured && (
            <div className="absolute top-2 right-2">
               <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                 <Zap className="w-3 h-3 fill-white" /> HOT
               </span>
            </div>
          )}
        </div>

        {/* === CONTENT AREA === */}
        <div className="flex flex-1 flex-col p-4 space-y-3">
          
          {/* Title */}
          <h3
            className="text-sm md:text-[15px] font-semibold text-gray-100 line-clamp-2 leading-relaxed group-hover:text-blue-400 transition-colors min-h-[2.5rem]"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* ⚡ Variant Selector (Click blocker to prevent navigation) */}
          {hasVariants && (
            <div 
              className="mt-1" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <Select 
                value={String(selectedVariantIdx)} 
                onValueChange={(v) => setSelectedVariantIdx(Number(v))}
              >
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-gray-300 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1d] border-white/10 text-gray-300">
                  {product.variants!.map((v, idx) => (
                    <SelectItem key={idx} value={String(idx)} className="text-xs focus:bg-white/10 focus:text-white">
                      {v.name} - {v.validity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Rating (Static/Dynamic placeholder) */}
          {!hasVariants && (
             <div className="flex items-center gap-1.5">
               <div className="flex text-yellow-500">
                 <Star className="w-3 h-3 fill-current" />
               </div>
               <span className="text-xs text-gray-500 font-medium pt-0.5">4.9 (120 Reviews)</span>
             </div>
          )}

          {/* Price + Action Row */}
          <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between gap-2">
            
            <div className="flex flex-col">
              {regularPrice > displayPrice && (
                <span className="text-[10px] text-gray-500 line-through font-medium">
                  {formatPrice(regularPrice)}
                </span>
              )}
              <span className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-1">
                {formatPrice(displayPrice)}
                {/* Small indicator if price is for a specific variant */}
                {hasVariants && <span className="text-[10px] font-normal text-gray-400 relative top-[1px]">/ {currentVariant?.name}</span>}
              </span>
            </div>

            {/* Cart Button */}
            <Button
              size="icon"
              className="h-9 w-9 rounded-full bg-white text-black hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg shadow-white/5"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. MAIN COMPONENT: Grid Wrapper
// ----------------------------------------------------------------------
const ProductList = ({ products }: { products: IProduct[] }) => {
  return (
    <section className="bg-black py-8 md:py-20 text-white min-h-[50vh]">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header (Optional) */}
        <div className="flex items-end justify-between mb-8">
           <div>
             <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
               Featured Courses
             </h2>
             <p className="text-gray-400 text-sm mt-1">Unlock premium skills instantly</p>
           </div>
           <Link href="/shop" className="hidden md:flex text-sm text-blue-400 hover:text-blue-300 items-center gap-1 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link href="/shop" className="w-full">
            <Button
              variant="outline"
              className="w-full border-white/10 text-gray-300 hover:bg-white/5 bg-transparent h-12 text-sm font-medium rounded-xl"
            >
              Browse All Courses <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductList;