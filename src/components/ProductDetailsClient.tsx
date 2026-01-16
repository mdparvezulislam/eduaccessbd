"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IProduct } from "@/types"; 
import { motion, AnimatePresence } from "framer-motion";
import { useCart, PlanType } from "@/lib/CartContext"; 
import { 
  ShoppingCart, Heart, CheckCircle2, ShieldCheck, Flame, CreditCard,
  ChevronRight, Minus, Plus, PlayCircle, Crown, Clock, Star, Share2, Calendar
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ProductDetailsClient({ product }: { product: IProduct }) {
  const router = useRouter();
  const { addToCart, mapProductToCartItem } = useCart();

  // --- States ---
  const [mainImage, setMainImage] = useState(product.thumbnail);
  const [qty, setQty] = useState(1);
  
  // ⚡ VIP Plan Logic
  // 1. Identify which plans are enabled
  const pricing = product.pricing || {};
  const availablePlans: PlanType[] = [];
  
  if (pricing.monthly?.isEnabled) availablePlans.push("monthly");
  if (pricing.yearly?.isEnabled) availablePlans.push("yearly");
  if (pricing.lifetime?.isEnabled) availablePlans.push("lifetime");

  // 2. Default to the first available plan, or null if none
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(
    availablePlans.length > 0 ? availablePlans[0] : null
  );

  // --- Derived Data ---
  const allImages = [product.thumbnail, ...(product.gallery || [])];
  
  // ⚡ Calculate Active Price & Description based on Selection
  let currentPrice = product.defaultPrice || 0;
  let referencePrice = 0;
  let validityLabel = "Standard Access";
  
  // 🟢 Default to Main Description
  let currentDescription = product.description; 

  if (selectedPlan && pricing[selectedPlan]) {
    const plan = pricing[selectedPlan];
    currentPrice = plan.price;
    referencePrice = plan.regularPrice || 0;
    validityLabel = plan.validityLabel;

    // ⚡ SWITCH DESCRIPTION: If plan has specific description, use it.
    if (plan.description && plan.description.trim().length > 0) {
      currentDescription = plan.description;
    }
  } else if (!selectedPlan && product.salePrice) {
    // Fallback for simple products
    currentPrice = product.salePrice;
    referencePrice = product.regularPrice;
  }

  // Dynamic Discount Calculation
  const discount = referencePrice > currentPrice
    ? Math.round(((referencePrice - currentPrice) / referencePrice) * 100)
    : 0;

  const categoryName = typeof product.category === "object" && product.category 
    ? (product.category as any).name 
    : "Course";

  // --- Handlers ---

  const handleAddToCart = () => {
    const item = mapProductToCartItem(product, qty, selectedPlan || undefined);
    addToCart(item);
    
    toast.success(
      <div className="flex flex-col">
        <span className="font-bold">Added to Cart!</span>
        <span className="text-xs text-muted-foreground">
          {product.title} {selectedPlan ? `(${validityLabel})` : ""}
        </span>
      </div>
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push("/checkout"), 300);
  };

  return (
    <div className="bg-black text-white min-h-screen pb-6 font-sans selection:bg-green-500 selection:text-black">
      
      {/* === BREADCRUMB === */}
      <div className="border-b border-white/5 bg-black/90 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto px-2 py-3 text-xs md:text-sm text-gray-400 flex items-center gap-1.5 overflow-hidden">
          <Link href="/" className="hover:text-white transition-colors shrink-0">Home</Link> 
          <ChevronRight className="w-3 h-3 shrink-0 text-gray-600" />
          <Link href="/shop" className="hover:text-white transition-colors shrink-0">{categoryName}</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-gray-600" />
          <span className="text-white font-medium truncate">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-1 md:px-6 py-4 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* =================================
              LEFT COLUMN: GALLERY (7 Cols) 
          ================================= */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl group"
            >
              <Image 
                src={mainImage} 
                alt={product.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
              {/* Play Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-2xl">
                    <PlayCircle className="w-12 h-12 text-white fill-white/20" />
                 </div>
              </div>
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-yellow-500 text-black text-xs px-2.5 py-0.5 font-bold shadow-lg border-0 rounded-md">
                  SAVE {discount}%
                </Badge>
              )}
            </motion.div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative w-20 h-14 md:w-24 md:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img 
                        ? "border-green-500 opacity-100 ring-2 ring-green-500/20" 
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =================================
              RIGHT COLUMN: INFO (5 Cols) 
          ================================= */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            
            {/* Header Info */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    {product.isFeatured && (
                      <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-400/10 text-[10px] px-2 uppercase tracking-wide gap-1">
                        <Flame className="w-3 h-3 fill-orange-400" /> Hot
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 font-mono uppercase">ID: {product._id.toString().slice(-4)}</span>
                 </div>
                 <button className="text-gray-500 hover:text-white transition"><Share2 className="w-4 h-4" /></button>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-tight mb-2">
                {product.title}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-4 mt-3 text-xs md:text-sm font-medium border-b border-white/5 pb-4">
                 <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-yellow-500" /> 
                    <span className="text-white">4.9</span>
                 </div>
                 <span className="text-gray-600">|</span>
                 <span className="text-green-400">{product.salesCount + 12} Sold</span>
              </div>
            </motion.div>

            {/* ⚡ 2. VIP PLAN SELECTOR */}
            {availablePlans.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Select Duration</p>
                   <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                     <Clock className="w-3 h-3" /> {validityLabel}
                   </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {/* Monthly Button */}
                  {pricing.monthly?.isEnabled && (
                    <button
                      onClick={() => setSelectedPlan("monthly")}
                      className={`relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                        selectedPlan === "monthly"
                          ? "bg-white text-black border-white shadow-lg shadow-white/10 scale-[1.02]"
                          : "bg-[#161616] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="font-bold text-sm">Monthly</span>
                      <span className="text-[10px] opacity-80">
                         ৳{pricing.monthly.price}
                      </span>
                      {selectedPlan === "monthly" && (
                        <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-green-600" />
                      )}
                    </button>
                  )}

                  {/* Yearly Button */}
                  {pricing.yearly?.isEnabled && (
                    <button
                      onClick={() => setSelectedPlan("yearly")}
                      className={`relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                        selectedPlan === "yearly"
                          ? "bg-white text-black border-white shadow-lg shadow-white/10 scale-[1.02]"
                          : "bg-[#161616] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="font-bold text-sm">Yearly</span>
                      <span className="text-[10px] opacity-80">
                         ৳{pricing.yearly.price}
                      </span>
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[9px] px-1.5 rounded-full font-bold whitespace-nowrap">
                        BEST VALUE
                      </span>
                    </button>
                  )}

                  {/* Lifetime Button */}
                  {pricing.lifetime?.isEnabled && (
                    <button
                      onClick={() => setSelectedPlan("lifetime")}
                      className={`relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                        selectedPlan === "lifetime"
                          ? "bg-gradient-to-br from-yellow-200 to-yellow-500 text-black border-yellow-400 shadow-lg shadow-yellow-500/20 scale-[1.02]"
                          : "bg-[#161616] border-white/5 hover:border-white/20 text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                         <span className="font-bold text-sm">Lifetime</span>
                         <Crown className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] opacity-80 font-semibold">
                         ৳{pricing.lifetime.price}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. Pricing & Actions */}
            <motion.div 
              layout
              className="bg-[#111] border border-white/10 p-5 rounded-2xl relative overflow-hidden"
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-[40px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-4">
                
                {/* Price Row */}
                <div className="flex items-end gap-3">
                  <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    ৳{currentPrice.toLocaleString()}
                  </span>
                  {referencePrice > currentPrice && (
                    <div className="flex flex-col mb-1">
                      <span className="text-xs text-gray-500 line-through font-medium">
                        ৳{referencePrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-green-500 font-bold">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Buttons Row */}
                <div className="flex gap-2 h-12">
                  <div className="flex items-center bg-black border border-white/10 rounded-lg w-24 shrink-0">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white" disabled={qty <= 1}>
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center font-bold text-sm">{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <Button 
                    onClick={handleAddToCart}
                    variant="outline" 
                    className="flex-1 h-full border-white/10 bg-white/5 hover:bg-white hover:text-black font-bold text-sm rounded-lg transition-all"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" /> Cart
                  </Button>

                  <Button 
                    onClick={handleBuyNow}
                    className="flex-1 h-full bg-white text-black hover:bg-gray-200 font-bold text-sm rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Features */}
            <div className="space-y-3">
               {product.features && product.features.length > 0 && (
                 <div className="space-y-2">
                   {product.features.slice(0, 4).map((feature, i) => (
                     <div key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                       <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                       <span className="leading-snug">{feature}</span>
                     </div>
                   ))}
                 </div>
               )}
               
               <div className="flex items-center justify-start gap-6 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure Checkout
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                    <CreditCard className="w-3.5 h-3.5" /> Instant Access
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* =================================
            BOTTOM SECTION: TABS & DESC
        ================================= */}
        <div className="mt-6 md:mt-16 mx-auto">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="flex w-full md:w-auto border-b border-white/10 bg-transparent p-0 mb-6 gap-6">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 text-base font-medium px-0 pb-3 transition-colors"
              >
                Description {selectedPlan && <span className="ml-2 text-xs text-green-500 bg-green-500/10 px-1.5 rounded">for {validityLabel}</span>}
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 text-base font-medium px-0 pb-3 transition-colors"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="animate-in fade-in-50 slide-in-from-bottom-2">
              <div className="bg-[#111] border text-gray-300 border-white/5 rounded-2xl p-4 md:p-8 leading-relaxed">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={validityLabel} // ⚡ Triggers animation when plan changes
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="prose prose-invert prose-sm md:prose-base max-w-none prose-p:text-gray-400 prose-headings:text-white prose-a:text-green-400 prose-strong:text-white prose-ul:list-disc prose-li:marker:text-green-500 prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: currentDescription }}
                  />
                </AnimatePresence>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-[#111] border border-white/5 rounded-2xl">
                <Heart className="w-12 h-12 text-gray-700" />
                <div>
                  <h3 className="text-lg font-bold text-white">No Reviews Yet</h3>
                  <p className="text-sm text-gray-500">Be the first to rate this product!</p>
                </div>
                <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white hover:text-black">
                  Write a Review
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}