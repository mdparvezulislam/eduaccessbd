"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/types";
import { ShoppingCart, Zap, ArrowRight, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useCart, PlanType } from "@/lib/CartContext"; 
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

// ✅ Helper Type
type VipPlanKey = "monthly" | "yearly" | "lifetime";

// ----------------------------------------------------------------------
// 1. SUB-COMPONENT: Compact Product Card (Optimized)
// ----------------------------------------------------------------------
const ProductCard = ({ product }: { product: IProduct }) => {
  const { addToCart, mapProductToCartItem } = useCart();
  
  // ⚡ VIP Plan Logic
  const pricing = product.pricing || {};
  const availablePlans: VipPlanKey[] = [];
  
  if (pricing.monthly?.isEnabled) availablePlans.push("monthly");
  if (pricing.yearly?.isEnabled) availablePlans.push("yearly");
  if (pricing.lifetime?.isEnabled) availablePlans.push("lifetime");

  const [selectedPlan, setSelectedPlan] = useState<VipPlanKey | "default">(
    availablePlans.length > 0 ? availablePlans[0] : "default"
  );

  // ⚡ Price Calculation
  let displayPrice = product.defaultPrice || product.salePrice || 0;
  let regularPrice = product.regularPrice || 0;
  let validityLabel = "Standard";

  if (selectedPlan !== "default" && pricing[selectedPlan]) {
    const plan = pricing[selectedPlan];
    if (plan) {
      displayPrice = plan.price;
      regularPrice = plan.regularPrice || 0;
      validityLabel = plan.validityLabel;
    }
  } else {
    displayPrice = product.salePrice || product.defaultPrice || 0;
    regularPrice = product.regularPrice;
  }
  
  const discount = regularPrice > displayPrice
    ? Math.round(((regularPrice - displayPrice) / regularPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    const planArg = selectedPlan !== "default" ? (selectedPlan as PlanType) : undefined;
    const cartItem = mapProductToCartItem(product, 1, planArg);
    addToCart(cartItem);
    toast.success(`Added ${product.title}`);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="group relative flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-1">
      
      {/* Link Wrapper */}
      <Link href={`/product/${product.slug}`} className="flex-1 flex flex-col">
        
        {/* === IMAGE AREA (Optimized for Full Visibility) === */}
        <div className="relative aspect-square w-full bg-[#050505] p-1 overflow-hidden">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              // ✅ object-contain: Shows 100% of image (No crop)
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-800 text-[10px] font-bold tracking-widest">
              NO IMAGE
            </div>
          )}

          {/* Badges (Top Left) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
             {discount > 0 && (
              <Badge className="bg-red-600 hover:bg-red-600 text-white border-0 font-bold text-[9px] px-1.5 py-0 shadow-sm">
                -{discount}%
              </Badge>
            )}
             {product.isFeatured && (
              <Badge className="bg-yellow-500 hover:bg-yellow-500 text-black border-0 font-bold text-[9px] px-1.5 py-0 shadow-sm flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 fill-black" /> HOT
              </Badge>
            )}
          </div>
          
          {/* Validity Badge (Bottom Right) */}
          {selectedPlan !== "default" && (
             <div className="absolute bottom-2 right-2 z-10">
               <span className="flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/10 text-gray-200 text-[9px] font-bold px-2 py-0.5 rounded-full">
                 <Clock className="w-2.5 h-2.5 text-blue-400" /> {validityLabel}
               </span>
             </div>
          )}
        </div>

        {/* === CONTENT AREA (Zero Extra Space) === */}
        <div className="flex flex-1 flex-col p-0 space-y-1.5">
          
          {/* Title */}
          <h3
            className="text-[11px] sm:text-[13px] font-semibold text-gray-200 leading-snug line-clamp-2 min-h-[2.2rem] group-hover:text-white transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* ⚡ Selector or Spacer (Fixed Height for Alignment) */}
          {availablePlans.length > 0 ? (
            <div 
              className="mt-0.5" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <Select 
                value={selectedPlan} 
                onValueChange={(v) => setSelectedPlan(v as VipPlanKey)}
              >
                <SelectTrigger className="h-7 text-[10px] bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20 focus:ring-0 rounded-md px-2">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1d] border-white/10 text-gray-300 min-w-[140px]">
                  {availablePlans.map((planKey) => {
                    const label = planKey.charAt(0).toUpperCase() + planKey.slice(1);
                    return (
                      <SelectItem key={planKey} value={planKey} className="text-[10px] py-1 focus:bg-white/10 focus:text-white">
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ) : (
          
             <div className="h-3 flex items-center">
                <div className="flex items-center gap-1 text-[10px] text-gray-600 font-medium">
                   <Check className="w-3 h-3 text-green-500" /> Instant Access
                </div>
             </div>
          )}

          {/* Price + Action Row (Pushed to bottom) */}
          <div className="flex items-end justify-between gap-2 mt-auto pt-1 border-t border-white/5">
            
            <div className="flex flex-col leading-none">
              {regularPrice > displayPrice && (
                <span className="text-[9px] text-gray-500 line-through mb-0.5">
                  {formatPrice(regularPrice)}
                </span>
              )}
              <span className="text-sm font-bold text-white tracking-tight">
                {formatPrice(displayPrice)}
              </span>
            </div>

            {/* Cart Button */}
            <Button
              size="icon"
              className="h-7 w-7 rounded-md bg-white text-black hover:bg-blue-500 hover:text-white transition-all shadow-md active:scale-95"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. MAIN COMPONENT: Optimized Grid
// ----------------------------------------------------------------------
const ProductList = ({ products }: { products: IProduct[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; 

  if (!products || products.length === 0) return null;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const section = document.getElementById("product-list-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="product-list-section" className="bg-[#050505] py-4 md:py-8 text-white min-h-[50vh]">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header - Minimal */}
        <div className="flex items-center justify-between mb-2">
         
           <Link href="/shop" className="hidden md:flex text-xs font-medium text-gray-500 hover:text-white items-center gap-1 transition-colors group">
              View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>

        {/* ⚡ THE GRID: Tighter Gap, Optimized Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 mb-2">
          {currentProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* ⚡ Compact Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 border-white/10 bg-[#111] text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1 bg-[#111] border border-white/5 rounded-lg p-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`h-6 w-6 rounded flex items-center justify-center text-xs font-medium transition-all ${
                    currentPage === page
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 border-white/10 bg-[#111] text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-6 flex justify-center md:hidden">
          <Link href="/shop" className="w-full">
            <Button
              variant="outline"
              className="w-full border-white/10 text-gray-400 hover:text-white hover:bg-white/5 bg-[#111] h-10 text-xs font-medium rounded-lg uppercase tracking-wider"
            >
              Explore All Items
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductList;