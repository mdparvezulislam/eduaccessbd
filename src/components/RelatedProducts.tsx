"use client";

import { useEffect, useState } from "react";
import { IProduct, SITE_URL } from "@/types";
import { ArrowRight, ShoppingCart, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function RelatedProducts({ categoryId, currentProductId }: { categoryId: string, currentProductId: string }) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        // ✅ Call the optimized API
        const res = await fetch(`${SITE_URL}/api/products/product-by-category?categoryId=${categoryId}&excludeId=${currentProductId}`);
        const data = await res.json();
     
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to load related products", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) fetchRelated();
  }, [categoryId, currentProductId]);

  if (!loading && products.length === 0) return null;

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    // ✅ FIX: "overflow-hidden" prevents scrollbars from hover animations/shadows
    // ✅ FIX: "max-w-full" ensures it never exceeds parent width
    <div className="mt-8 w-full max-w-full border-t border-white/5 pt-8 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex flex-col gap-1">
           <span className="text-[10px] uppercase font-bold tracking-widest text-green-500 flex items-center gap-1">
             <Sparkles className="w-3 h-3" /> Recommended
           </span>
           <h2 className="text-xl md:text-2xl font-bold text-white">You May Also Like</h2>
        </div>
        <Link href="/products" className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {products.map((product) => {
           // Calculate Price Logic
           const price = product.salePrice || product.defaultPrice || 0;
           const regular = product.regularPrice;
           const discount = regular > price ? Math.round(((regular - price) / regular) * 100) : 0;

           return (
            <motion.div variants={item} key={product._id}>
              <Link 
                href={`/product/${product.slug}`}
                className="group block bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 hover:shadow-2xl hover:shadow-black/60 transition-all duration-500 h-full flex flex-col"
              >
                {/* Image Area - Full Visibility */}
                <div className="relative aspect-square w-full bg-[#111] overflow-hidden p-3">
                  <Image 
                    src={product.thumbnail} 
                    alt={product.title} 
                    fill 
                    className="object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Subtle Glow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {discount > 0 && (
                      <Badge className="bg-red-600 hover:bg-red-600 text-white text-[9px] px-1.5 py-0 border-0 shadow-lg font-bold">
                        -{discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Quick Action Overlay (Desktop) */}
                  <div className="absolute bottom-3 right-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                     <div className="bg-white text-black p-2 rounded-full shadow-lg">
                        <ShoppingCart className="w-4 h-4" />
                     </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-200 line-clamp-2 leading-relaxed group-hover:text-white transition-colors min-h-[2.5rem]">
                    {product.title}
                  </h3>
                  
                  <div className="mt-auto flex items-end justify-between border-t border-white/5 pt-3">
                    <div className="flex flex-col">
                       {discount > 0 && (
                         <span className="text-[10px] text-gray-500 line-through">
                           ৳{regular.toLocaleString()}
                         </span>
                       )}
                       <span className="text-sm font-bold text-white">
                         ৳{price.toLocaleString()}
                       </span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium group-hover:text-green-400 transition-colors">
                       View Details
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
           );
        })}
      </motion.div>
    </div>
  );
}