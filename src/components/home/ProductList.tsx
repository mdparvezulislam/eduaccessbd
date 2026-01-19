"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/types";
import { ShoppingCart, Star, Zap, ArrowRight, Clock, ChevronLeft, ChevronRight } from "lucide-react";
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

// ✅ Helper Type: Restrict plans to only those present in product.pricing
type VipPlanKey = "monthly" | "yearly" | "lifetime";

// ----------------------------------------------------------------------
// 1. SUB-COMPONENT: Individual Product Card (Handles its own state)
// ----------------------------------------------------------------------
const ProductCard = ({ product }: { product: IProduct }) => {
  const { addToCart, mapProductToCartItem } = useCart();
  
  // ⚡ VIP Plan Logic
  const pricing = product.pricing || {};
  
  // We explicitly type this to prevent "account_access" from being added here
  // since it doesn't exist inside the 'pricing' object structure.
  const availablePlans: VipPlanKey[] = [];
  
  if (pricing.monthly?.isEnabled) availablePlans.push("monthly");
  if (pricing.yearly?.isEnabled) availablePlans.push("yearly");
  if (pricing.lifetime?.isEnabled) availablePlans.push("lifetime");

  // Default to first plan found, or "default"
  const [selectedPlan, setSelectedPlan] = useState<VipPlanKey | "default">(
    availablePlans.length > 0 ? availablePlans[0] : "default"
  );

  // ⚡ Derived Data: Current Price
  let displayPrice = product.defaultPrice || product.salePrice || 0;
  let regularPrice = product.regularPrice || 0;
  let validityLabel = "Standard";

  // ✅ LOGIC FIX: TypeScript now knows selectedPlan is strictly a valid key of pricing
  if (selectedPlan !== "default" && pricing[selectedPlan]) {
    const plan = pricing[selectedPlan];
    if (plan) {
      displayPrice = plan.price;
      regularPrice = plan.regularPrice || 0;
      validityLabel = plan.validityLabel;
    }
  } else {
    // Fallback logic for simple products or "default" selection
    displayPrice = product.salePrice || product.defaultPrice || 0;
    regularPrice = product.regularPrice;
  }
  
  // Discount Calculation
  const discount = regularPrice > displayPrice
    ? Math.round(((regularPrice - displayPrice) / regularPrice) * 100)
    : 0;

  // Handler: Add To Cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    // Map cart item
    // We cast selectedPlan to PlanType because CartContext handles the wider type
    const planArg = selectedPlan !== "default" ? (selectedPlan as PlanType) : undefined;

    const cartItem = mapProductToCartItem(product, 1, planArg);
    
    addToCart(cartItem);
    toast.success(`Added ${product.title} to cart`);
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
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#151515] text-gray-700 font-bold">
              NO IMAGE
            </div>
          )}

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-transparent to-transparent opacity-80" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
             {discount > 0 && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-[10px] px-2 shadow-lg backdrop-blur-md border-0">
                -{discount}% OFF
              </Badge>
            )}
            
            {/* Show Plan Badge if VIP */}
            {selectedPlan !== "default" && (
               <Badge variant="outline" className="bg-black/50 text-white border-white/20 text-[10px] backdrop-blur-md">
                 <Clock className="w-3 h-3 mr-1 text-green-400" /> 
                 {validityLabel}
               </Badge>
            )}
          </div>

          {product.isFeatured && (
            <div className="absolute top-2 right-2 z-10">
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

          {/* ⚡ VIP Plan Selector (Click blocker to prevent navigation) */}
          {availablePlans.length > 0 && (
            <div 
              className="mt-1" 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <Select 
                value={selectedPlan} 
                onValueChange={(v) => setSelectedPlan(v as VipPlanKey)}
              >
                <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10 text-gray-300 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1d] border-white/10 text-gray-300">
                  {availablePlans.map((planKey) => {
                    const pInfo = pricing[planKey];
                    // Capitalize first letter
                    const label = planKey.charAt(0).toUpperCase() + planKey.slice(1);
                    return (
                      <SelectItem key={planKey} value={planKey} className="text-xs focus:bg-white/10 focus:text-white">
                        {label} - {pInfo?.validityLabel}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Fallback Info for Simple Products */}
          {availablePlans.length === 0 && (
             <div className="flex items-center gap-1.5">
               <div className="flex text-yellow-500">
                 <Star className="w-3 h-3 fill-current" />
               </div>
               <span className="text-xs text-gray-500 font-medium pt-0.5">4.9</span>
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
                {/* Small indicator */}
                {selectedPlan !== "default" && <span className="text-[10px] font-normal text-gray-400 relative top-[1px]">/ {validityLabel}</span>}
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
// 2. MAIN COMPONENT: Grid Wrapper with Pagination
// ----------------------------------------------------------------------
const ProductList = ({ products }: { products: IProduct[] }) => {
  // ⚡ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; 

  if (!products || products.length === 0) return null;

  // ⚡ Pagination Calculation
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  // Scroll to top of section on page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const section = document.getElementById("product-list-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="product-list-section" className="bg-black py-2 md:py-4 text-white min-h-[50vh]">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-4">
           <Link href="/shop" className="hidden md:flex text-sm text-blue-400 hover:text-blue-300 items-center gap-1 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

        {/* Grid (Showing only currentProducts) */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 mb-4">
          {currentProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* ⚡ Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`h-9 w-9 rounded-md text-sm font-medium transition-all ${
                    currentPage === page
                      ? "bg-white text-black font-bold"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
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
              className="h-9 w-9 border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-4 flex justify-center md:hidden">
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