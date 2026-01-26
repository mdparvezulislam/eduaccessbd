"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IProduct } from "@/types"; 
import { motion, AnimatePresence } from "framer-motion";
import { useCart, PlanType } from "@/lib/CartContext"; 
import { 
  ShoppingCart, Heart, CheckCircle2, ShieldCheck, Flame, CreditCard,
  ChevronRight, Minus, Plus, PlayCircle, Crown, Clock, Star, Share2, 
  X, User, Box 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// ✅ Import Related Products Component (Create this file next)
import RelatedProducts from "@/components/RelatedProducts"; 

// ⚡ Helper: Extract YouTube ID safely
const getYouTubeEmbedId = (url: string | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ProductDetailsClient({ product }: { product: IProduct }) {
  const router = useRouter();
  const { addToCart, mapProductToCartItem } = useCart();

  // --- 1. Data Preparation ---
  const pricing = product.pricing || {};
  const accountAccess = (product as any).accountAccess;
  
  // Standard Price Logic
  const standardPrice = product.salePrice > 0 ? product.salePrice : product.defaultPrice;
  const isStandardValid = standardPrice !== 1; // Hidden if price is 1 (placeholder)

  // --- 2. State Management ---
  const [mainImage, setMainImage] = useState(product.thumbnail);
  const [qty, setQty] = useState(1);
  const [showVideo, setShowVideo] = useState(false); 

  // Auto-Select Plan Logic
  const availablePlans: string[] = [];
  if (pricing.monthly?.isEnabled) availablePlans.push("monthly");
  if (pricing.yearly?.isEnabled) availablePlans.push("yearly");
  if (pricing.lifetime?.isEnabled) availablePlans.push("lifetime");
  if (accountAccess?.isEnabled) availablePlans.push("account_access");

  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    isStandardValid ? "standard" : (availablePlans.length > 0 ? availablePlans[0] : null)
  );

  // --- 3. Derived Data ---
  const allImages = [product.thumbnail, ...(product.gallery || [])];
  const videoId = getYouTubeEmbedId(product.videoUrl);

  // Dynamic Price Calculation
  let currentPrice = 0;
  let referencePrice = 0; 
  let validityLabel = "Standard License"; 
  let currentDescription = product.description; 

  if (selectedPlan === "account_access" && accountAccess) {
    currentPrice = Number(accountAccess.price);
    validityLabel = "Full Account Access";
  } else if (selectedPlan && ["monthly", "yearly", "lifetime"].includes(selectedPlan)) {
    const plan = pricing[selectedPlan as keyof typeof pricing];
    if (plan) {
      currentPrice = Number(plan.price);
      referencePrice = Number(plan.regularPrice) || 0;
      validityLabel = plan.validityLabel;
      if (plan.description?.trim()) currentDescription = plan.description;
    }
  } else {
    currentPrice = standardPrice || 0;
    referencePrice = product.regularPrice;
    validityLabel = "Standard License";
  }

  const discount = referencePrice > currentPrice
    ? Math.round(((referencePrice - currentPrice) / referencePrice) * 100)
    : 0;

  const categoryName = typeof product.category === "object" && product.category 
    ? (product.category as any).name 
    : "Store";
  
  const categoryId = typeof product.category === "object" && product.category 
    ? (product.category as any)._id 
    : product.category;

  // --- 4. Handlers ---
  const handleAddToCart = () => {
    if (!selectedPlan) return toast.error("Please select a plan");

    let planArg: any = undefined;
    if (["monthly", "yearly", "lifetime"].includes(selectedPlan)) {
      planArg = selectedPlan;
    }

    const item = mapProductToCartItem(product, qty, planArg);

    if (selectedPlan === "account_access") {
      item.price = currentPrice;
      item.validity = "Account Access";
      item.cartId = `${product._id}-account_access`;
    } else if (selectedPlan === "standard") {
      item.price = currentPrice;
      item.validity = "Standard";
      item.cartId = `${product._id}-standard`;
    }

    addToCart(item);
    toast.success("Added to Cart");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    // ✅ FIX: "overflow-x-hidden" and "max-w-[100vw]" stops all horizontal scrolling
    <div className="bg-black text-white min-h-screen pb-10 font-sans w-full max-w-[100vw] overflow-x-hidden">
      
      {/* --- Breadcrumb (Sticky) --- */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-gray-400 flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <Link href="/" className="hover:text-white transition-colors shrink-0">Home</Link> 
          <ChevronRight className="w-3 h-3 shrink-0 text-gray-600" />
          <Link href={`/products/${(product.category as any)?.slug || 'all'}`} className="hover:text-white transition-colors shrink-0">{categoryName}</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-gray-600" />
          <span className="text-white font-medium truncate opacity-80">{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-6 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* =================================
              LEFT: GALLERY (Fully Contained Image)
          ================================= */}
          <div className="lg:col-span-7 flex flex-col gap-3 min-w-0"> 
            
            {/* Main Display Area */}
            <div className={`relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#080808] shadow-2xl group transition-all duration-300 ${showVideo ? 'aspect-video' : 'aspect-square md:aspect-[4/3]'}`}>
              
              <AnimatePresence mode="wait">
                {showVideo && videoId ? (
                  <motion.iframe
                    key="video"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title="Product Video"
                    className="w-full h-full absolute inset-0"
                    allowFullScreen
                  />
                ) : (
                  <motion.div 
                    key="image"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="relative w-full h-full p-2" 
                  >
                    <Image 
                      src={mainImage} 
                      alt={product.title} 
                      fill 
                      // ✅ FIX: object-contain ensures NO cropping
                      className="object-contain transition-transform duration-500 hover:scale-[1.02]"
                      priority
                    />
                    
                    {/* Play Button Overlay */}
                    {videoId && (
                      <button 
                        onClick={() => setShowVideo(true)}
                        className="absolute inset-0 flex items-center justify-center group/btn z-20"
                      >
                         <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-2xl transition-transform duration-300 group-hover/btn:scale-110">
                            <PlayCircle className="w-12 h-12 text-white fill-white/20" />
                         </div>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {showVideo && (
                <button 
                  onClick={() => setShowVideo(false)}
                  className="absolute top-3 right-3 bg-black/60 p-1.5 rounded-full text-white backdrop-blur-md border border-white/10 z-20"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {!showVideo && discount > 0 && selectedPlan === 'standard' && (
                <Badge className="absolute top-3 left-3 bg-yellow-500 text-black text-xs px-2 py-0.5 font-bold shadow-lg border-0 z-10">
                  -{discount}% OFF
                </Badge>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-full">
              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setMainImage(img); setShowVideo(false); }}
                  className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden border bg-[#111] transition-all ${
                    mainImage === img && !showVideo
                      ? "border-green-500 opacity-100 ring-1 ring-green-500" 
                      : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="thumb" fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          </div>

          {/* =================================
              RIGHT: INFO & ACTIONS
          ================================= */}
          <div className="lg:col-span-5 flex flex-col gap-5 min-w-0">
            
            {/* Header */}
            <div className="space-y-3 border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    {product.isFeatured && (
                      <Badge variant="outline" className="text-orange-400 border-orange-400/20 bg-orange-400/5 text-[10px] px-1.5 uppercase gap-1">
                        <Flame className="w-3 h-3 fill-orange-400" /> Hot
                      </Badge>
                    )}
                    <span className="text-[10px] text-gray-500 font-mono">ID: {product._id.toString().slice(-6)}</span>
                 </div>
                 <button className="text-gray-500 hover:text-white transition"><Share2 className="w-4 h-4" /></button>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight break-words">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                 <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" /> 
                    <span className="text-white font-bold">4.9</span>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-gray-600" />
                 <span className="text-green-400">{product.salesCount + 10} Sold</span>
              </div>
            </div>

            {/* Plan Selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Choose Plan</p>
                  <span className="text-[10px] text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                    {validityLabel}
                  </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(isStandardValid) && (
                  <PlanButton 
                    label="Standard" 
                    price={standardPrice} 
                    icon={<Box className="w-3 h-3"/>}
                    isActive={selectedPlan === "standard"}
                    onClick={() => setSelectedPlan("standard")}
                  />
                )}
                {pricing.monthly?.isEnabled && (
                  <PlanButton label="Monthly" price={pricing.monthly.price} isActive={selectedPlan === "monthly"} onClick={() => setSelectedPlan("monthly")} />
                )}
                {pricing.yearly?.isEnabled && (
                  <PlanButton label="Yearly" price={pricing.yearly.price} isActive={selectedPlan === "yearly"} onClick={() => setSelectedPlan("yearly")} />
                )}
                {pricing.lifetime?.isEnabled && (
                  <PlanButton 
                    label="Lifetime" 
                    price={pricing.lifetime.price} 
                    icon={<Crown className="w-3 h-3 text-amber-400"/>}
                    isActive={selectedPlan === "lifetime"}
                    onClick={() => setSelectedPlan("lifetime")}
                    special
                  />
                )}
                {accountAccess?.isEnabled && (
                  <PlanButton 
                    label="Account" 
                    price={accountAccess.price} 
                    icon={<User className="w-3 h-3"/>}
                    isActive={selectedPlan === "account_access"}
                    onClick={() => setSelectedPlan("account_access")}
                  />
                )}
              </div>
            </div>

            {/* Price & Cart Box */}
            <div className="bg-[#111] border border-white/10 p-4 rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-4">
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {currentPrice === 1 ? "" : `৳${currentPrice.toLocaleString()}`}
                  </span>
                  {referencePrice > currentPrice && selectedPlan !== 'account_access' && (
                    <span className="text-sm text-gray-500 line-through">
                      ৳{referencePrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 h-11">
                  <div className="flex items-center bg-black border border-white/10 rounded-lg w-24 shrink-0">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 flex items-center justify-center text-gray-400 hover:text-white" disabled={qty <= 1}><Minus className="w-3 h-3"/></button>
                    <span className="text-sm font-bold text-white">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="flex-1 flex items-center justify-center text-gray-400 hover:text-white"><Plus className="w-3 h-3"/></button>
                  </div>

                  <Button onClick={handleAddToCart} variant="outline" className="flex-1 h-full border-white/10 bg-white/5 hover:bg-white hover:text-black font-bold">
                    <ShoppingCart className="w-4 h-4 mr-2" /> Add
                  </Button>

                  <Button onClick={handleBuyNow} className="flex-[1.5] h-full bg-white text-black hover:bg-gray-200 font-bold">
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Features List */}
            {product.features && product.features.length > 0 && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400 pt-2">
                 {product.features.slice(0, 6).map((feature, i) => (
                   <div key={i} className="flex items-start gap-2">
                     <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                     <span className="break-words">{feature}</span>
                   </div>
                 ))}
               </div>
            )}

            <div className="flex flex-wrap gap-4 md:gap-6 pt-4 border-t border-white/5 opacity-60">
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Payment
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  <CreditCard className="w-4 h-4 text-blue-500" /> Instant Access
                </div>
            </div>

          </div>
        </div>

        {/* --- TABS SECTION --- */}
        <div className="mt-12 max-w-4xl mx-auto w-full">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="flex border-b border-white/10 bg-transparent p-0 mb-6 w-full justify-start gap-8 overflow-x-auto scrollbar-hide">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 font-bold px-0 pb-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 font-bold px-0 pb-3"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="animate-in fade-in-50">
              <div className="bg-[#111] border border-white/5 rounded-xl p-6 md:p-8 text-gray-300 leading-relaxed overflow-hidden break-words">
                <div 
                  className="prose prose-invert prose-sm max-w-none 
                    prose-headings:text-white prose-a:text-green-400 prose-img:rounded-xl prose-img:max-w-full"
                  dangerouslySetInnerHTML={{ __html: currentDescription }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="flex flex-col items-center justify-center py-12 text-center bg-[#111] border border-white/5 rounded-xl">
                <Heart className="w-8 h-8 text-gray-600 mb-3" />
                <h3 className="text-white font-bold">No Reviews Yet</h3>
                <p className="text-xs text-gray-500">Be the first to review this product.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ✅ RELATED PRODUCTS SECTION (Added Here) */}
        <RelatedProducts categoryId={categoryId} currentProductId={product._id} />

      </div>
    </div>
  );
}

// --- Sub Component: Plan Button ---
function PlanButton({ label, price, isActive, onClick, icon, special }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2.5 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
        isActive
          ? special 
            ? "bg-gradient-to-br from-amber-200 to-amber-500 text-black border-amber-400 shadow-lg"
            : "bg-white text-black border-white shadow-lg"
          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-1.5">
          {icon}
          <span className="font-bold text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-black">৳{price}</span>
      {isActive && !special && <CheckCircle2 className="absolute top-1 right-1 w-2.5 h-2.5 text-green-600" />}
    </button>
  );
}