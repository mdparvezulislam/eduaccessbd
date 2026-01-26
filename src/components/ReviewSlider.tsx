"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Quote, CheckCircle2, ZoomIn } from "lucide-react";

interface IReview {
  _id: string;
  imageUrl: string;
  name: string; 
  rating: number;
}

export default function ReviewSlider() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();
        if (data.success) {
          const result = data.reviews;
          // Duplicate 6 times to ensure seamless infinite loop
          setReviews([...result, ...result, ...result, ...result, ...result, ...result]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (!loading && reviews.length === 0) return null;

  // Split reviews into two arrays
  const half = Math.ceil(reviews.length / 2);
  const firstRow = reviews.slice(0, half);
  const secondRow = reviews.slice(half);

  return (
    <section className="py-3 bg-[#050505] border-t border-b border-white/5 relative w-full overflow-hidden">
      
      {/* 1. Header */}
      <div className="container mx-auto px-4 mb-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[11px] uppercase font-bold tracking-widest text-green-400">Real Feedback</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
          Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Thousands</span>
        </h2>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          See what our community is saying. Genuine reviews from verified purchases.
        </p>
      </div>

      {/* 2. Slider Container */}
      <div className="flex flex-col gap-8 relative max-w-[100vw]">
        
        {/* Fade Masks */}
        <div className="absolute top-0 left-0 h-full w-12 md:w-40 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-12 md:w-40 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />

        {/* === ROW 1: FAST SPEED (Left) === */}
        <div className="w-full overflow-hidden group">
          <div 
            className="flex gap-4 md:gap-6 w-max animate-marquee group-hover:[animation-play-state:paused]"
            style={{ animationDuration: "15s" }} // ⚡ FAST SPEED
          >
            {firstRow.map((review, index) => (
              <ReviewCard key={`row1-${index}`} review={review} />
            ))}
          </div>
        </div>

        {/* === ROW 2: SLOW SPEED (Right - Reverse logic via CSS or just Left with different content) === */}
        {/* Note: To reverse direction simply, we usually animate from -100% to 0%, but keeping both left is smoother for reading. 
            Here we make it MUCH SLOWER for readability. */}
        <div className="w-full overflow-hidden group">
          <div 
            className="flex gap-4 md:gap-6 w-max animate-marquee group-hover:[animation-play-state:paused]"
            style={{ animationDuration: "40s" }} // 🐢 SLOW SPEED
          >
            {secondRow.map((review, index) => (
               <ReviewCard key={`row2-${index}`} review={review} variant="purple" />
            ))}
          </div>
        </div>

      </div>

      {/* Inject CSS for Marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </section>
  );
}

// === Sub Component: The Card Design ===
function ReviewCard({ review, variant = "green" }: { review: IReview, variant?: "green" | "purple" }) {
  const accentColor = variant === "green" 
    ? "group-hover:border-green-500/50 shadow-green-900/10" 
    : "group-hover:border-purple-500/50 shadow-purple-900/10";
  
  const iconColor = variant === "green" ? "text-green-500" : "text-purple-500";

  return (
    <div 
      className={`
        relative shrink-0 bg-[#111] rounded-2xl border border-white/10 overflow-hidden group cursor-zoom-in 
        transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:z-30
        ${accentColor}
        w-[85vw] md:w-[350px] /* 📱 Mobile: 85% width (1 slide focused) | 💻 Desktop: 350px */
      `}
    >
      
      {/* Image Area - Optimized for Reading */}
      <div className="relative h-[450px] md:h-[500px] w-full bg-[#080808] p-2">
        <Image 
          src={review.imageUrl} 
          alt="Review" 
          fill 
          // ✅ Shows FULL image without cropping
          className="object-contain transition-transform duration-700" 
          sizes="(max-width: 768px) 90vw, 350px"
        />
        
        {/* Subtle Gradient at bottom only */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
        
        {/* Hover Hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
           <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 text-white text-xs font-bold">
              <ZoomIn className="w-4 h-4" /> View Details
           </div>
        </div>

        {/* Content Card (Floating at Bottom) */}
        <div className="absolute bottom-3 left-3 right-3 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 group-hover:bg-black/80 transition-colors">
          
          {/* Header Row */}
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                 <Quote className={`w-3 h-3 ${iconColor} fill-current`} />
               </div>
               <span className="text-xs font-bold text-white uppercase tracking-wide">Verified</span>
             </div>
             
             {/* Stars */}
             <div className="flex gap-0.5">
               {[...Array(5)].map((_, i) => (
                 <Star 
                   key={i} 
                   className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} 
                 />
               ))}
             </div>
          </div>

          {/* Review Text */}
          <p className="text-xs md:text-sm font-medium text-gray-300 leading-snug line-clamp-2">
            {review.name}
          </p>

        </div>
      </div>
    </div>
  );
}