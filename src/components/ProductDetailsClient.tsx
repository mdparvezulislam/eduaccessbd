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
  ChevronRight, Minus, Plus, PlayCircle, Crown, Clock, Star, Share2, 
  X, Video as VideoIcon, Tv
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// ⚡ Helper: Extract YouTube ID
const getYouTubeEmbedId = (url: string | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ProductDetailsClient({ product }: { product: IProduct }) {
  const router = useRouter();
  const { addToCart, mapProductToCartItem } = useCart();

  // --- States ---
  const [mainImage, setMainImage] = useState(product.thumbnail);
  const [qty, setQty] = useState(1);
  const [showVideo, setShowVideo] = useState(false); 
  
  // ⚡ VIP Plan Logic
  const pricing = product.pricing || {};
  const availablePlans: PlanType[] = [];
  
  if (pricing.monthly?.isEnabled) availablePlans.push("monthly");
  if (pricing.yearly?.isEnabled) availablePlans.push("yearly");
  if (pricing.lifetime?.isEnabled) availablePlans.push("lifetime");

  // Default to first plan if available, else null
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(
    availablePlans.length > 0 ? availablePlans[0] : null
  );

  // --- Derived Data ---
  const allImages = [product.thumbnail, ...(product.gallery || [])];
  const videoId = getYouTubeEmbedId(product.videoUrl);

  // ⚡ Calculate Active Price & Description
  let currentPrice = 0;
  let referencePrice = 0;
  let validityLabel = "Lifetime Access"; 
  let currentDescription = product.description; 

  if (selectedPlan && pricing[selectedPlan]) {
    const plan = pricing[selectedPlan];
    currentPrice = plan.price;
    referencePrice = plan.regularPrice || 0;
    validityLabel = plan.validityLabel;

    if (plan.description && plan.description.trim().length > 0) {
      currentDescription = plan.description;
    }
  } else {
    currentPrice = product.salePrice ;
    referencePrice = product.regularPrice;
    validityLabel = "Standard License";
  }

  const discount = referencePrice > currentPrice
    ? Math.round(((referencePrice - currentPrice) / referencePrice) * 100)
    : 0;

  const categoryName = typeof product.category === "object" && product.category 
    ? (product.category as any).name 
    : "Store";

  // --- Handlers ---
  const handleAddToCart = () => {
    const item = mapProductToCartItem(product, qty, selectedPlan || undefined);
    addToCart(item);
    toast.success(
      <div className="flex flex-col gap-1">
        <span className="font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500"/> Added to Cart
        </span>
        <span className="text-xs text-muted-foreground line-clamp-1">
          {product.title}
        </span>
      </div>
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="bg-black text-white min-h-screen pb-4 font-sans selection:bg-green-500/30 selection:text-green-200">
      
      {/* === BREADCRUMB === */}
      <div className="border-b border-white/10 bg-black/90 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto px-1 py-3 text-xs md:text-sm text-gray-400 flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <Link href="/" className="hover:text-white transition-colors shrink-0">Home</Link> 
          <ChevronRight className="w-3 h-3 shrink-0 text-gray-600" />
          <Link href={`/products/${product.category?.slug}`} className="hover:text-white transition-colors shrink-0">{categoryName}</Link>
          <ChevronRight className="w-3 h-3 shrink-0 text-gray-600" />
          <span className="text-white font-medium truncate opacity-80">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-1 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* =================================
              LEFT COLUMN: GALLERY (7 Cols) 
          ================================= */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Main Media Area */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl group">
              <AnimatePresence mode="wait">
                {showVideo && videoId ? (
                  <motion.iframe
                    key="video"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title="Product Video"
                    className="w-full h-full absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <motion.div 
                    key="image"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="relative w-full h-full"
                  >
                    <Image 
                      src={mainImage} 
                      alt={product.title} 
                      fill 
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                    
                    {videoId && (
                      <button 
                        onClick={() => setShowVideo(true)}
                        className="absolute inset-0 flex items-center justify-center group/btn"
                      >
                         <div className="bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-full border border-white/20 shadow-2xl transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:bg-red-600/90 group-hover/btn:border-red-500">
                            <PlayCircle className="w-10 h-10 md:w-12 md:h-12 text-white fill-white/20" />
                         </div>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {showVideo && (
                <button 
                  onClick={() => setShowVideo(false)}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black p-1.5 rounded-full text-white backdrop-blur-md border border-white/10 transition-all z-20"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {!showVideo && discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-yellow-500 hover:bg-yellow-500 text-black text-[10px] md:text-xs px-2 py-0.5 font-bold shadow-lg border-0 rounded-md z-10">
                  -{discount}% OFF
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {videoId && (
                <button 
                  onClick={() => setShowVideo(true)}
                  className={`relative w-20 h-14 md:w-24 md:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all bg-gray-900 flex items-center justify-center ${showVideo ? "border-red-500 ring-2 ring-red-500/20" : "border-white/10 hover:border-white/30"}`}
                >
                  <div className="absolute inset-0 opacity-50"><Image src={`https://img.youtube.com/vi/${videoId}/default.jpg`} alt="yt" fill className="object-cover"/></div>
                  <PlayCircle className="w-5 h-5 md:w-6 md:h-6 text-white relative z-10" />
                </button>
              )}

              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setMainImage(img); setShowVideo(false); }}
                  className={`relative w-20 h-14 md:w-24 md:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    mainImage === img && !showVideo
                      ? "border-green-500 opacity-100 ring-2 ring-green-500/20" 
                      : "border-transparent opacity-60 hover:opacity-100 hover:border-white/20"
                  }`}
                >
                  <Image src={img} alt="thumb" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* =================================
              RIGHT COLUMN: INFO (5 Cols) 
          ================================= */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            
            {/* Header Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    {product.isFeatured && (
                      <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-400/10 text-[10px] px-1.5 uppercase tracking-wide gap-1">
                        <Flame className="w-3 h-3 fill-orange-400" /> Hot
                      </Badge>
                    )}
                    <span className="text-[10px] text-gray-500 font-mono uppercase bg-white/5 px-1.5 py-0.5 rounded">ID: {product._id.toString().slice(-4)}</span>
                 </div>
                 <button className="text-gray-500 hover:text-white transition p-1.5 hover:bg-white/5 rounded-full"><Share2 className="w-4 h-4" /></button>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight mb-1.5">
                  {product.title}
                </h1>
                
                {product.shortDescription && (
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed border-l-2 border-green-500/50 pl-3 line-clamp-3">
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-3 text-xs font-medium border-b border-white/5 pb-3">
                 <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">
                    <Star className="w-3 h-3 fill-yellow-400" /> 
                    <span className="text-white font-bold">4.9</span>
                 </div>
                 <span className="text-gray-600">|</span>
                 <span className="text-green-400 font-mono">{product.salesCount + 10} Sold</span>
              </div>
            </div>

            {/* ⚡ 2. VIP PLAN SELECTOR */}
            {availablePlans.length > 0 && (
              <div className="space-y-2 bg-[#111] p-3 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-1">
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Access Plan</p>
                   <span className="text-[10px] text-green-400 font-bold flex items-center gap-1 bg-green-900/20 px-1.5 py-0.5 rounded">
                     <Clock className="w-3 h-3" /> {validityLabel}
                   </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {pricing.monthly?.isEnabled && (
                    <button
                      onClick={() => setSelectedPlan("monthly")}
                      className={`relative p-2 rounded-md border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                        selectedPlan === "monthly"
                          ? "bg-white text-black border-white shadow-lg shadow-white/10"
                          : "bg-black/40 border-white/10 hover:border-white/30 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="font-bold text-[10px] uppercase">Monthly</span>
                      <span className="text-xs font-black">৳{pricing.monthly.price}</span>
                      {selectedPlan === "monthly" && <CheckCircle2 className="absolute top-1 right-1 w-2.5 h-2.5 text-green-600" />}
                    </button>
                  )}

                  {pricing.yearly?.isEnabled && (
                    <button
                      onClick={() => setSelectedPlan("yearly")}
                      className={`relative p-2 rounded-md border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                        selectedPlan === "yearly"
                          ? "bg-white text-black border-white shadow-lg shadow-white/10"
                          : "bg-black/40 border-white/10 hover:border-white/30 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="font-bold text-[10px] uppercase">Yearly</span>
                      <span className="text-xs font-black">৳{pricing.yearly.price}</span>
                      <span className="absolute -top-2 bg-green-600 text-white text-[7px] px-1 py-0 rounded font-bold uppercase tracking-wide border border-black">
                        Popular
                      </span>
                    </button>
                  )}

                  {pricing.lifetime?.isEnabled && (
                    <button
                      onClick={() => setSelectedPlan("lifetime")}
                      className={`relative p-2 rounded-md border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                        selectedPlan === "lifetime"
                          ? "bg-gradient-to-br from-amber-200 to-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20"
                          : "bg-black/40 border-white/10 hover:border-white/30 text-gray-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                         <span className="font-bold text-[10px] uppercase">Lifetime</span>
                         <Crown className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-xs font-black">৳{pricing.lifetime.price}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. Pricing & Actions */}
            <div className="bg-[#161616] border border-white/10 p-3 md:p-5 rounded-xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-green-500/10 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-4">
                
                {/* Price Display */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Total Price</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-white tracking-tighter">
                      ৳{currentPrice.toLocaleString()}
                    </span>
                    {referencePrice > currentPrice && (
                      <div className="flex flex-col mb-1">
                        <span className="text-xs text-gray-500 line-through font-medium">
                          ৳{referencePrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons Row */}
                <div className="grid grid-cols-[80px_1fr] gap-2 h-10 md:h-11">
                  <div className="flex items-center bg-black border border-white/10 rounded-lg overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition" disabled={qty <= 1}>
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center font-bold text-sm text-white">{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddToCart}
                      variant="outline" 
                      className="flex-1 h-full border-white/10 bg-white/5 hover:bg-white hover:text-black font-bold text-xs md:text-sm rounded-lg transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Add
                    </Button>

                    <Button 
                      onClick={handleBuyNow}
                      className="flex-[1.5] h-full bg-white text-black hover:bg-gray-200 font-bold text-xs md:text-sm rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="pt-2">
               {product.features && product.features.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-3">
                   {product.features.slice(0, 6).map((feature, i) => (
                     <div key={i} className="flex items-start gap-2 text-[11px] md:text-xs text-gray-400">
                       <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                       <span className="leading-snug">{feature}</span>
                     </div>
                   ))}
                 </div>
               )}
               
               <div className="flex items-center justify-start gap-4 pt-4 mt-4 border-t border-white/5 opacity-70">
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-400 uppercase font-bold tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Secure
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-400 uppercase font-bold tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-blue-500" /> Instant
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* =================================
            BOTTOM SECTION: TABS & DESC
        ================================= */}
        <div className="mt-10 md:mt-16 max-w-5xl mx-auto">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="flex w-full md:w-auto border-b border-white/10 bg-transparent p-0 mb-6 gap-6 overflow-x-auto scrollbar-hide">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 text-sm font-bold px-0 pb-3 transition-colors shrink-0"
              >
                Description {selectedPlan && <span className="ml-1.5 text-[9px] text-green-400 bg-green-900/20 px-1 py-0.5 rounded border border-green-500/20 uppercase tracking-wide hidden sm:inline-block">for {validityLabel}</span>}
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:text-white text-gray-500 text-sm font-bold px-0 pb-3 transition-colors shrink-0"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="animate-in fade-in-50 slide-in-from-bottom-2">
              <div className="bg-[#111] border text-gray-300 border-white/5 rounded-2xl p-5 md:p-8 leading-relaxed shadow-lg">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={validityLabel} // ⚡ Animation trigger
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="prose prose-invert prose-sm md:prose-base max-w-full overflow-hidden
                      prose-p:text-gray-400 prose-p:leading-7 
                      prose-headings:text-white prose-headings:font-bold
                      prose-a:text-green-400 hover:prose-a:text-green-300
                      prose-strong:text-white prose-strong:font-semibold
                      prose-ul:list-disc prose-li:marker:text-green-500 
                      prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-img:shadow-lg prose-img:max-w-full"
                    dangerouslySetInnerHTML={{ __html: currentDescription }}
                  />
                </AnimatePresence>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-[#111] border border-white/5 rounded-2xl">
                <div className="bg-white/5 p-3 rounded-full">
                   <Heart className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No Reviews Yet</h3>
                  <p className="text-xs text-gray-500 mt-1">Be the first to share your thoughts!</p>
                </div>
                <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:bg-white hover:text-black">
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