"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { ShoppingCart, CreditCard, Unlock, ArrowRight, MousePointerClick } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// --- Data ---
const steps = [
  {
    id: 1,
    title: "প্রোডাক্ট বেছে নিন",
    description: "শপ পেজ থেকে আপনার পছন্দের প্রোডাক্টটি বেছে নিন এবং 'Buy Now' বাটনে ক্লিক করুন।",
    icon: ShoppingCart,
    image: "https://ik.imagekit.io/pemifp53t/1769401816316-type_Q--tUWlA2.jpg", 
    color: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/20"
  },
  {
    id: 2,
    title: "চেকআউট ও রেজিস্টার",
    description: "চেকআউট ফর্মটি সঠিক তথ্য দিয়ে পূরণ করুন। এটি অটোমেটিক আপনার অ্যাকাউন্ট তৈরি করে দেবে।",
    icon: CreditCard,
    image: "https://ik.imagekit.io/pemifp53t/1769401795460-paymentType_JYi0vJRxx.jpg", 
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    border: "border-purple-500/20"
  },
  {
    id: 3,
    title: "ড্যাশবোর্ড অ্যাক্সেস",
    description: "অর্ডার সম্পন্ন হলে ইউজার ড্যাশবোর্ড থেকে আপনার কোর্স বা প্রোডাক্ট এক্সেস করুন।",
    icon: Unlock,
    image: "https://ik.imagekit.io/pemifp53t/1769401769622-access-Course_Dahboard_1MVvSU3G_.jpg", 
    color: "text-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500/20"
  }
];

const totalItems = steps.length + 1; 

export default function HowToBuySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(320); // Default, updates on mount
  const [dragConstraint, setDragConstraint] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const carousel = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Settings
  const GAP = 16; 
  const AUTO_SLIDE_INTERVAL = 5000;

  // 1. Dynamic Width Calculation (Responsiveness)
  useEffect(() => {
    const updateDimensions = () => {
      if (carousel.current) {
        // Desktop: Fixed 400px, Mobile: Full screen width minus padding (32px for px-4)
        const isMobile = window.innerWidth < 768;
        const newCardWidth = isMobile ? window.innerWidth - 32 : 400;
        
        setCardWidth(newCardWidth);
        
        // Calculate max drag area
        const totalWidth = (newCardWidth + GAP) * totalItems;
        setDragConstraint(totalWidth - carousel.current.offsetWidth);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 2. Auto Slide
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [isPaused, totalItems]);

  // 3. Animation Logic
  useEffect(() => {
    const scrollAmount = cardWidth + GAP;
    let newX = -(currentIndex * scrollAmount);
    
    // Prevent overscrolling
    if (Math.abs(newX) > dragConstraint && dragConstraint > 0) {
      newX = -dragConstraint;
    }

    controls.start({
      x: newX,
      transition: { type: "spring", stiffness: 200, damping: 25 }
    });
  }, [currentIndex, cardWidth, dragConstraint, controls]);

  // 4. Drag Handling
  const handleDragEnd = (event: any, info: PanInfo) => {
    const draggedDistance = info.offset.x;
    const threshold = 50;

    if (draggedDistance < -threshold) {
      // Drag Left -> Next
      setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1));
    } else if (draggedDistance > threshold) {
      // Drag Right -> Prev
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    } else {
      // Snap back
      const scrollAmount = cardWidth + GAP;
      controls.start({ x: -(currentIndex * scrollAmount) });
    }
    setIsPaused(false);
  };

  return (
    <section className="py-12 bg-[#050505] border-t border-b border-white/5 relative overflow-hidden">
      
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
              কেনার <span className="text-green-500">সহজ নিয়ম</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-md">
              মাত্র ৩টি সহজ ধাপে আপনার পছন্দের কোর্সটি কিনুন।
            </p>
          </div>
          
          <div className="hidden md:flex gap-2">
             <Button 
               variant="outline" size="icon" 
               onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
               className="rounded-full border-white/10 hover:bg-white/5"
             >
               <ArrowRight className="w-4 h-4 rotate-180" />
             </Button>
             <Button 
               variant="outline" size="icon"
               onClick={() => setCurrentIndex(prev => Math.min(totalItems - 1, prev + 1))}
               className="rounded-full border-white/10 hover:bg-white/5"
             >
               <ArrowRight className="w-4 h-4" />
             </Button>
          </div>
        </div>

        {/* === SLIDER AREA === */}
        <motion.div 
          ref={carousel} 
          className="cursor-grab active:cursor-grabbing overflow-hidden min-h-[610px] py-2"
          whileTap={{ cursor: "grabbing" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
        >
          <motion.div 
            drag="x"
            dragConstraints={{ right: 0, left: -dragConstraint }}
            animate={controls}
            onDragEnd={handleDragEnd}
            className="flex gap-4 w-max" // Fixed Gap
          >
            {steps.map((step, idx) => (
              <motion.div 
                key={step.id}
                animate={{ 
                  scale: currentIndex === idx ? 1 : 0.98,
                  opacity: currentIndex === idx ? 1 : 0.6 
                }}
                style={{ width: cardWidth }} // ⚡ Dynamic Width (Full mobile width)
                // ✅ INCREASED HEIGHT to 600px for Long Screenshots
                className={`relative h-[600px] bg-[#111] rounded-3xl border overflow-hidden group transition-all duration-300
                  ${currentIndex === idx ? 'border-green-500/40 shadow-2xl shadow-green-900/10' : 'border-white/10'}
                `}
              >
                {/* --- Full Image Display --- */}
                <Image 
                  src={step.image} 
                  alt={step.title}
                  fill
                  // ✅ object-top: Shows the start of the instructions/screenshot
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                  quality={100}
                />

                {/* Gradient: Only at the very bottom so Image is Clear */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-100 top-[60%]" />
                
                {/* Number Badge */}
                <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-lg z-10`}>
                   <div className={`w-5 h-5 flex items-center justify-center rounded-full bg-white/20 font-bold text-xs ${step.color}`}>
                     {step.id}
                   </div>
                   <span className="text-[10px] text-white font-bold">ধাপ</span>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                   <div className="flex items-center gap-3 mb-2">
                     <div className={`p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 ${step.color}`}>
                       <step.icon className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors shadow-black drop-shadow-md">
                       {step.title}
                     </h3>
                   </div>
                   
                   <p className="text-sm text-gray-200 leading-relaxed font-sans opacity-95 drop-shadow-sm">
                     {step.description}
                   </p>
                </div>
              </motion.div>
            ))}
            
            {/* 'Start Now' Card */}
             <motion.div 
                animate={{ 
                  scale: currentIndex === steps.length ? 1 : 0.98,
                  opacity: currentIndex === steps.length ? 1 : 0.6 
                }}
                style={{ width: cardWidth }}
                className="relative h-[600px] flex flex-col items-center justify-center bg-[#111] rounded-3xl border border-dashed border-white/20 hover:border-green-500/50 hover:bg-green-500/5 transition-all group cursor-pointer"
             >
                <Link href="/shop" className="text-center p-8 w-full h-full flex flex-col items-center justify-center">
                   <div className="w-24 h-24 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-xl">
                      <MousePointerClick className="w-10 h-10" />
                   </div>
                   <h3 className="text-3xl font-bold text-white mb-2">অর্ডার করুন</h3>
                   <span className="text-sm text-gray-400 group-hover:text-green-400 transition-colors">এখনই শুরু করুন</span>
                </Link>
             </motion.div>

          </motion.div>
        </motion.div>
        
        {/* Indicators (Dots) */}
        <div className="mt-4 flex items-center justify-center gap-2">
           {Array.from({ length: totalItems }).map((_, idx) => (
             <button
               key={idx}
               onClick={() => setCurrentIndex(idx)}
               className={`transition-all duration-300 rounded-full 
                 ${currentIndex === idx 
                   ? 'w-8 h-2 bg-green-500' 
                   : 'w-2 h-2 bg-white/20 hover:bg-white/40'}
               `}
             />
           ))}
        </div>

      </div>
    </section>
  );
}