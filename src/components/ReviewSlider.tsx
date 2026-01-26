"use client";

import { useEffect, useState } from "react";
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
          // Duplicate 6 times for seamless loop
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
    <section className="py-4 bg-[#050505] border-t border-b border-white/5 relative w-full overflow-hidden">
      
      {/* 1. Header (Minimal) */}
      <div className="container mx-auto px-4 mb-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-2">
          <CheckCircle2 className="w-3 h-3 text-green-400" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-green-400">Success Stories</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Thousands</span>
        </h2>
      </div>

      {/* 2. Slider Container */}
      <div className="flex flex-col gap-4 relative max-w-[100vw]">
        
        {/* Fade Masks */}
        <div className="absolute top-0 left-0 h-full w-8 md:w-32 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-8 md:w-32 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent z-20 pointer-events-none" />

        {/* === ROW 1: FAST (Left) === */}
        <div className="w-full overflow-hidden group">
          <div 
            className="flex gap-3 md:gap-4 w-max animate-marquee group-hover:[animation-play-state:paused]"
            style={{ animationDuration: "20s" }} // ⚡ FAST
          >
            {firstRow.map((review, index) => (
              <ReviewCard key={`row1-${index}`} review={review} />
            ))}
          </div>
        </div>

        {/* === ROW 2: SLOW (Right - Reversed Content) === */}
        <div className="w-full overflow-hidden group">
          <div 
            className="flex gap-3 md:gap-4 w-max animate-marquee group-hover:[animation-play-state:paused]"
            style={{ animationDuration: "40s" }} // 🐢 SLOW
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

// === Sub Component: Zero-Gap Review Card ===
function ReviewCard({ review, variant = "green" }: { review: IReview, variant?: "green" | "purple" }) {
  const accentColor = variant === "green" 
    ? "hover:border-green-500/40" 
    : "hover:border-purple-500/40";
  
  const iconColor = variant === "green" ? "text-green-500" : "text-purple-500";

  return (
    <div 
      className={`
        relative shrink-0 bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden group cursor-zoom-in 
        transition-all duration-300 hover:z-30 hover:shadow-2xl hover:scale-[1.02]
        ${accentColor}
        /* 📱 Mobile: 80% width (Shows part of next slide) */
        w-[80vw] 
        /* 💻 Desktop: ~45% width (Shows 2 slides) */
        md:w-[45vw] lg:w-[600px]
      `}
    >
      
      {/* Image Area - 100% Full Bleed, No Padding */}
      <div className="relative overflow-hidden sm-80 h-[180px] w-full bg-[#080808]">
        <Image 
          src={review.imageUrl} 
          alt="Review" 
          fill 
          // ✅ Shows FULL image from top-down
          className="object-contain object-top transition-transform duration-700" 
          sizes="(max-width: 768px) 80vw, 600px"
        />
        
        {/* Subtle Gradient Overlay (Bottom Only) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
        
        {/* Hover Hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/20 backdrop-blur-[2px]">
           <div className="bg-black/80 px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl">
              <ZoomIn className="w-3 h-3" /> Zoom
           </div>
        </div>

        {/* Content Card (Floating at Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent">
          
          <div className="flex items-center justify-between mb-1">
             <div className="flex items-center gap-2">
               <div className="bg-white/10 p-1 rounded-full">
                 <Quote className={`w-3 h-3 ${iconColor} fill-current`} />
               </div>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Purchase</span>
             </div>
             
             {/* Stars */}
             <div className="flex gap-0.5">
               {[...Array(5)].map((_, i) => (
                 <Star 
                   key={i} 
                   className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-800"}`} 
                 />
               ))}
             </div>
          </div>

          {/* Caption */}
          <p className="text-xs md:text-sm font-medium text-gray-200 leading-snug line-clamp-2 pl-1">
            {review.name}
          </p>

        </div>
      </div>
    </div>
  );
}