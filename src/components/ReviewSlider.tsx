"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Quote, CheckCircle2 } from "lucide-react";

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
          // Duplicate 6 times to ensure smooth loop on large 4k screens
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
  const splitIndex = Math.ceil(reviews.length / 2);
  const firstRow = reviews.slice(0, splitIndex);
  const secondRow = reviews.slice(splitIndex);

  return (
    <section className="py-12 md:py-20 bg-[#050505] border-t border-b border-white/5 relative w-full overflow-hidden">
      
      {/* 1. Header */}
      <div className="container mx-auto px-4 mb-8 md:mb-12 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CheckCircle2 className="w-3 h-3 text-green-400" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-green-400">Success Stories</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
          Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">The Community</span>
        </h2>
        <p className="text-xs md:text-sm text-gray-500 max-w-md mx-auto">Real feedback and results from verified purchasers.</p>
      </div>

      {/* 2. Slider Container */}
      <div className="flex flex-col gap-4 md:gap-8 relative max-w-[100vw]">
        
        {/* Gradient Masks (Fade Edges) */}
        <div className="absolute top-0 left-0 h-full w-8 md:w-32 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-8 md:w-32 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />

        {/* === ROW 1: Moves LEFT (Faster) === */}
        <div className="flex w-full overflow-hidden">
          <motion.div 
            className="flex gap-3 md:gap-5 pr-3 md:pr-5"
            animate={{ x: "-50%" }}
            transition={{ 
              duration: 30, // Faster Speed
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{ width: "fit-content" }}
          >
            {firstRow.map((review, index) => (
              <ReviewCard key={`row1-${index}`} review={review} />
            ))}
          </motion.div>
        </div>

        {/* === ROW 2: Moves RIGHT (Faster) === */}
        <div className="flex w-full overflow-hidden">
          <motion.div 
            className="flex gap-3 md:gap-5 pr-3 md:pr-5"
            initial={{ x: "-50%" }}
            animate={{ x: "0%" }}
            transition={{ 
              duration: 35, // Slightly different speed for dynamic effect
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{ width: "fit-content" }}
          >
            {secondRow.map((review, index) => (
               <ReviewCard key={`row2-${index}`} review={review} variant="purple" />
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}

// === Sub Component: The Card Design ===
function ReviewCard({ review, variant = "green" }: { review: IReview, variant?: "green" | "purple" }) {
  // Dynamic Styles
  const accentColor = variant === "green" 
    ? "group-hover:border-green-500/40 shadow-green-900/10" 
    : "group-hover:border-purple-500/40 shadow-purple-900/10";
  
  const iconColor = variant === "green" ? "text-green-500/50" : "text-purple-500/50";

  return (
    <div className={`relative w-[180px] md:w-[280px] shrink-0 bg-[#111] rounded-xl md:rounded-2xl border border-white/10 overflow-hidden group cursor-pointer ${accentColor} transition-all duration-300 hover:shadow-2xl`}>
      
      {/* Image Area */}
      <div className="relative h-[220px] md:h-[320px] w-full bg-gray-900 overflow-hidden">
        <Image 
          src={review.imageUrl} 
          alt="Review" 
          fill 
          sizes="(max-width: 768px) 180px, 280px"
          // object-top keeps the screenshot header visible
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105" 
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        
        {/* Content Card (Bottom) */}
        <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 right-2 md:right-3 p-2 md:p-3 rounded-lg md:rounded-xl bg-white/5 backdrop-blur-md border border-white/5 group-hover:bg-black/80 transition-colors">
          
          {/* Rating */}
          <div className="flex items-center justify-between mb-1 md:mb-2">
             <div className="flex gap-0.5">
               {[...Array(5)].map((_, i) => (
                 <Star 
                   key={i} 
                   className={`w-2.5 h-2.5 md:w-3 md:h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} 
                 />
               ))}
             </div>
             <Quote className={`w-3 h-3 ${iconColor}`} />
          </div>

          {/* Caption */}
          <p className="text-[10px] md:text-xs font-medium text-gray-300 leading-snug line-clamp-2">
            {review.name}
          </p>

        </div>
      </div>
    </div>
  );
}