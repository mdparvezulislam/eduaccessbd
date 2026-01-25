"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { ShoppingCart, CreditCard, Unlock, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// --- Data ---
const steps = [
  {
    id: 1,
    title: "কোর্স সিলেক্ট করুন",
    description: "পছন্দের প্রোডাক্ট বা কোর্স বেছে নিন এবং সরাসরি 'Buy Now' বাটনে ক্লিক করুন।",
    icon: ShoppingCart,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop", 
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  {
    id: 2,
    title: "ফর্ম পূরণ করুন",
    description: "চেকআউট পেজে নাম, ফোন নম্বর ও ইমেইল দিয়ে ফর্ম পূরণ করে পেমেন্ট সম্পন্ন করুন।",
    icon: CreditCard,
    image: "https://ik.imagekit.io/pemifp53t/1769355151503-Screenshot_2026-01-25_at_9.31.57_PM_5ptoOSATe.png", 
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
  },
  {
    id: 3,
    title: "অ্যাকাউন্ট ও অ্যাক্সেস",
    description: "অর্ডার কনফার্ম হলেই আপনার দেওয়া ফোন নম্বর ও পাসওয়ার্ড দিয়ে লগইন করে ক্লাস শুরু করুন।",
    icon: Unlock,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop", 
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20"
  }
];

// Combine steps + CTA card for total count
const totalItems = steps.length + 1; 

export default function HowToBuySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carousel = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Settings
  const CARD_WIDTH_MOBILE = 290; // Card width + gap
  const CARD_WIDTH_DESKTOP = 400; // Card width + gap
  const AUTO_SLIDE_INTERVAL = 3500;

  // 1. Calculate Constraints
  useEffect(() => {
    if (carousel.current) {
      setWidth(carousel.current.scrollWidth - carousel.current.offsetWidth);
    }
  }, []);

  // 2. Auto Slide Logic
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // Reset to 0 if at end, else next
        return prev === totalItems - 1 ? 0 : prev + 1;
      });
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused]);

  // 3. Animate when index changes
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const scrollAmount = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
    
    // Calculate new X position
    let newX = -(currentIndex * scrollAmount);
    
    // Boundary check (don't scroll past end content)
    if (-newX > width && width > 0) newX = -width;

    controls.start({
      x: newX,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    });
  }, [currentIndex, width, controls]);

  // 4. Handle Drag End (Snap to nearest)
  const handleDragEnd = (event: any, info: PanInfo) => {
    const isMobile = window.innerWidth < 768;
    const scrollAmount = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
    const draggedDistance = info.offset.x;
    
    // Determine direction
    if (draggedDistance < -50) {
      // Dragged Left -> Next
      setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1));
    } else if (draggedDistance > 50) {
      // Dragged Right -> Prev
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    } else {
      // Snap back if drag was small
      controls.start({ x: -(currentIndex * scrollAmount) });
    }
    
    setIsPaused(false); // Resume auto slide after drag
  };

  return (
    <section className="py-2 bg-[#050505] border-t border-b border-white/5 relative overflow-hidden">
      
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
              কেনার <span className="text-green-500">সহজ নিয়ম</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-md">
              মাত্র ৩টি সহজ ধাপে আপনার পছন্দের কোর্সটি কিনুন।
            </p>
          </div>
          
          <div className="hidden md:flex gap-2">
            {/* Desktop Arrows */}
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
          className="cursor-grab active:cursor-grabbing overflow-hidden min-h-[320px]"
          whileTap={{ cursor: "grabbing" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
        >
          <motion.div 
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            animate={controls}
            onDragEnd={handleDragEnd}
            className="flex gap-4 md:gap-6 w-max px-1"
          >
            {steps.map((step, idx) => (
              <motion.div 
                key={step.id}
                animate={{ 
                  scale: currentIndex === idx ? 1 : 0.95,
                  opacity: currentIndex === idx ? 1 : 0.6 
                }}
                className={`relative w-[280px] md:w-[380px] h-full bg-[#111] rounded-2xl border transition-colors overflow-hidden group
                  ${currentIndex === idx ? 'border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'border-white/10'}
                `}
              >
                {/* Image Section */}
                <div className="relative h-40 md:h-48 w-full overflow-hidden">
                   <Image 
                     src={step.image} 
                     alt={step.title}
                     fill
                     className="object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/20 to-transparent opacity-90" />
                   
                   {/* Step Number */}
                   <div className={`absolute top-3 left-3 w-8 h-8 rounded-full ${step.bg} ${step.color} flex items-center justify-center font-bold text-sm border border-white/5 backdrop-blur-md z-10 shadow-lg`}>
                     {step.id}
                   </div>
                </div>

                {/* Content Section */}
                <div className="p-5 relative -mt-4">
                   <div className="flex items-center gap-3 mb-2">
                     <div className={`p-1.5 rounded-lg ${step.bg} ${step.color}`}>
                       <step.icon className="w-4 h-4" />
                     </div>
                     <h3 className={`text-lg font-bold transition-colors ${currentIndex === idx ? 'text-white' : 'text-gray-300'}`}>
                       {step.title}
                     </h3>
                   </div>
                   
                   <p className="text-xs md:text-sm text-gray-400 leading-relaxed line-clamp-3">
                     {step.description}
                   </p>
                </div>
              </motion.div>
            ))}
            
            {/* 'Start Now' Card (CTA) */}
             <motion.div 
                animate={{ 
                  scale: currentIndex === steps.length ? 1 : 0.95,
                  opacity: currentIndex === steps.length ? 1 : 0.6 
                }}
                className="relative w-[150px] md:w-[200px] flex items-center justify-center bg-white/5 rounded-2xl border border-dashed border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
             >
                <Link href="/shop" className="text-center p-4 w-full h-full flex flex-col items-center justify-center">
                   <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-green-900/20">
                      <ArrowRight className="w-6 h-6" />
                   </div>
                   <span className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">এখনই শুরু করুন</span>
                </Link>
             </motion.div>

          </motion.div>
        </motion.div>
        
        {/* Indicators (Dots) */}
        <div className="mt-6 flex items-center justify-center gap-2">
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