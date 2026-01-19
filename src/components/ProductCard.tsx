"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/types";
import { ShoppingCart, Star, Zap, Clock } from "lucide-react";
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

// ✅ Helper Type: Only allow keys that actually exist inside product.pricing
type VipPlanKey = "monthly" | "yearly" | "lifetime";

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, mapProductToCartItem } = useCart();
  
  // ⚡ 1. PREPARE AVAILABLE PLANS
  const pricing = product.pricing || {};
  
  // We explicitly type this array as VipPlanKey[] to prevent "account_access" from getting in here
  // because "account_access" doesn't exist inside the 'pricing' object.
  const availablePlans: VipPlanKey[] = [];
  
  if (pricing.monthly?.isEnabled) availablePlans.push("monthly");
  if (pricing.yearly?.isEnabled) availablePlans.push("yearly");
  if (pricing.lifetime?.isEnabled) availablePlans.push("lifetime");

  // Default to first available plan, or "default"
  const [selectedPlan, setSelectedPlan] = useState<VipPlanKey | "default">(
    availablePlans.length > 0 ? availablePlans[0] : "default"
  );

  // ⚡ 2. CALCULATE DISPLAY PRICE
  let displayPrice = product.defaultPrice || product.salePrice || 0;
  let regularPrice = product.regularPrice || 0;
  let validityLabel = "Standard";

  // ✅ LOGIC FIX: TypeScript now knows selectedPlan is strictly a valid key of pricing (or "default")
  if (selectedPlan !== "default" && pricing[selectedPlan]) {
    const plan = pricing[selectedPlan];
    if (plan) {
      displayPrice = plan.price;
      regularPrice = plan.regularPrice || 0;
      validityLabel = plan.validityLabel || "VIP";
    }
  } else {
    // Fallback logic
    displayPrice = product.salePrice || product.defaultPrice || 0;
  }
  
  // Discount Calculation
  const discount = regularPrice > displayPrice
    ? Math.round(((regularPrice - displayPrice) / regularPrice) * 100)
    : 0;

  // Format Currency
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);

  // Handler: Add To Cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    // Map cart item using the selected Plan logic
    // We cast to PlanType here because CartContext accepts the wider type
    const planArg = selectedPlan !== "default" ? (selectedPlan as PlanType) : undefined;

    const cartItem = mapProductToCartItem(product, 1, planArg);
    
    addToCart(cartItem);
    toast.success(`Added ${product.title} to cart`);
  };

  return (
    <div className="group relative flex flex-col h-full bg-[#0f0f11] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/5">
      
      {/* Link to Product Details */}
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
            <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold bg-[#151515]">
              NO IMAGE
            </div>
          )}

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
             {discount > 0 && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-[10px] px-2 shadow-lg backdrop-blur-md border-0">
                -{discount}% OFF
              </Badge>
            )}
            
            {/* Show Plan Badge if VIP Selected */}
            {selectedPlan !== "default" && (
               <Badge variant="outline" className="bg-black/60 text-white border-white/20 text-[10px] backdrop-blur-md">
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
          {availablePlans.length > 0 ? (
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
          ) : (
             // Fallback Info for Simple Products
             <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
               <div className="flex text-yellow-500">
                 <Star className="w-3 h-3 fill-current" />
                 <Star className="w-3 h-3 fill-current" />
                 <Star className="w-3 h-3 fill-current" />
                 <Star className="w-3 h-3 fill-current" />
                 <Star className="w-3 h-3 fill-current" />
               </div>
               <span className="pt-0.5">(5.0)</span>
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