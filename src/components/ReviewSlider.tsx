"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Quote } from "lucide-react";

interface IReview {
  _id: string;
  imageUrl: string;
  name: string; // Treated as Title/Caption
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
          // If less than 6 reviews, repeat them more times to ensure smooth scrolling
          const result = data.reviews;
          setReviews(result.length < 6 ? [...result, ...result, ...result] : result);
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

  return (
   <motion.div 
            className="flex gap-3 md:gap-4 pr-3 md:pr-4 hover:pause" // Added hover:pause logic if using CSS, otherwise relies on slow speed
            animate={{ x: "-50%" }}
            transition={{ 
              duration: 40, // Smooth slow speed
              repeat: Infinity, 
              ease: "linear" 
            }}
            // Framer Motion native hover pause (Works in newer versions)
            onHoverStart={() => { /* Logic to pause would be complex here, relying on slow speed is better */ }}
            style={{ width: "fit-content" }}
          >
      {/* Header - Compact */}
      <div className="container mx-auto px-4 mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-3">
          <Star className="w-3 h-3 text-green-400 fill-green-400" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-green-400">Customer Feedback</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Trusted by <span className="text-green-500">Thousands</span>
        </h2>
      </div>

      {/* Marquee Wrapper with Fade Edges */}
      <div className="relative w-full overflow-hidden">
        
        {/* Left/Right Fade Masks */}
        <div className="absolute top-0 left-0 h-full w-12 md:w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-12 md:w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

        <div className="flex select-none">
          <motion.div 
            className="flex gap-3 md:gap-4 pr-3 md:pr-4"
            animate={{ x: "-50%" }}
            transition={{ 
              duration: 40, // Slower for readability
              repeat: Infinity, 
              ease: "linear" 
            }}
            whileHover={{ animationPlayState: "paused" }} // Pause CSS if possible, but framer requires logic
            style={{ width: "fit-content" }}
          >
            {/* We map the array TWICE to create the seamless loop.
              The outer <div> moves -50% (halfway), then resets instantly to 0.
            */}
            {[...reviews, ...reviews].map((review, index) => (
              <div 
                key={`${review._id}-${index}`} 
                className="relative w-[200px] md:w-[260px] shrink-0 bg-[#111] rounded-xl border border-white/10 overflow-hidden group cursor-pointer hover:border-green-500/40 transition-all duration-300"
              >
                {/* Image Area - Optimized for Screenshots */}
                <div className="relative h-[280px] md:h-[340px] w-full bg-gray-900 overflow-hidden">
                  <Image 
                    src={review.imageUrl} 
                    alt="Review" 
                    fill 
                    // object-top ensures the top of the screenshot (usually the most important part) is seen
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                  />
                  
                  {/* Dark Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-3 md:p-4">
                    
                    {/* Rating Stars */}
                    <div className="flex items-center gap-0.5 mb-2 bg-black/40 w-fit px-1.5 py-0.5 rounded backdrop-blur-md border border-white/5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} 
                        />
                      ))}
                    </div>

                    {/* Review Title/Caption */}
                    <div className="relative">
                      <Quote className="absolute -top-1 -left-1 w-3 h-3 text-green-500/50 rotate-180" />
                      <p className="text-xs md:text-sm font-medium text-gray-200 leading-relaxed line-clamp-2 pl-3">
                        {review.name}
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
  </motion.div>
  );
}