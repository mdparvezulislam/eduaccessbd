"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { ShoppingCart, CreditCard, Unlock, MousePointerClick } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// --- Data ---
const steps = [
  {
    id: 1,
    title: "প্রোডাক্ট বেছে নিন",
    icon: ShoppingCart,
    image: "https://ik.imagekit.io/pemifp53t/1769401816316-type_Q--tUWlA2.jpg", 
    color: "text-blue-400",
  },
  {
    id: 2,
    title: "চেকআউট ও রেজিস্টার",
    icon: CreditCard,
    image: "https://ik.imagekit.io/pemifp53t/1769401795460-paymentType_JYi0vJRxx.jpg", 
    color: "text-purple-400",
  },
  {
    id: 3,
    title: "ড্যাশবোর্ড অ্যাক্সেস",
    icon: Unlock,
    image: "https://ik.imagekit.io/pemifp53t/1769401769622-access-Course_Dahboard_1MVvSU3G_.jpg", 
    color: "text-green-400",
  }
];

const totalItems = steps.length + 1; 

export default function HowToBuySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(260); 
  const [dragConstraint, setDragConstraint] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false); // Track device type
  
  const carousel = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const GAP = 10; 
  const AUTO_SLIDE_INTERVAL = 4000;

  // 1. Dynamic Width & Desktop Check
  useEffect(() => {
    const updateDimensions = () => {
      if (carousel.current) {
        const desktopCheck = window.innerWidth >= 768;
        setIsDesktop(desktopCheck);

        // Mobile: Full width minus margins, Desktop: Fixed compact size
        const newCardWidth = !desktopCheck ? window.innerWidth - 40 : 260; 
        setCardWidth(newCardWidth);
        const totalWidth = (newCardWidth + GAP) * totalItems;
        setDragConstraint(totalWidth - carousel.current.offsetWidth);
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 2. Auto Slide Logic (Only runs if NOT Desktop)
  useEffect(() => {
    if (isPaused || isDesktop) return; // 🛑 Stop slide on Desktop

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
    }, AUTO_SLIDE_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isPaused, totalItems, isDesktop]);

  // 3. Animation
  useEffect(() => {
    // If desktop, reset X to 0 (optional, keeps items aligned left)
    // Or allow manual drag on desktop too but start at 0
    if (isDesktop && currentIndex === 0) {
       controls.start({ x: 0 });
       return; 
    }

    const scrollAmount = cardWidth + GAP;
    let newX = -(currentIndex * scrollAmount);
    
    // Boundary check
    if (Math.abs(newX) > dragConstraint && dragConstraint > 0) newX = -dragConstraint;

    controls.start({
      x: newX,
      transition: { type: "spring", stiffness: 250, damping: 30 }
    });
  }, [currentIndex, cardWidth, dragConstraint, controls, isDesktop]);

  // 4. Drag
  const handleDragEnd = (event: any, info: PanInfo) => {
    const draggedDistance = info.offset.x;
    if (draggedDistance < -40) {
      setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1));
    } else if (draggedDistance > 40) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    } else {
      controls.start({ x: -(currentIndex * (cardWidth + GAP)) });
    }
    setIsPaused(false);
  };

  return (
    <section className="py-4 bg-[#050505] border-t border-b border-white/5 relative overflow-hidden">
      
      <div className="container mx-auto px-2">
        
        {/* Minimal Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              কেনার <span className="text-green-500">সহজ নিয়ম</span>
            </h2>
          </div>
          
          {/* Micro Indicators (Hide on Desktop if you want, or keep for manual nav feedback) */}
          <div className="flex gap-1 md:hidden"> 
             {Array.from({ length: totalItems }).map((_, idx) => (
               <div 
                 key={idx}
                 className={`h-1 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-4 bg-green-500' : 'w-1 bg-white/20'}`}
               />
             ))}
          </div>
        </div>

        {/* === SLIDER === */}
        <motion.div 
          ref={carousel} 
          className="cursor-grab active:cursor-grabbing overflow-hidden min-h-[390px]"
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
            className="flex gap-[10px] w-max"
          >
            {steps.map((step, idx) => (
              <motion.div 
                key={step.id}
                // On Desktop: Always full opacity. On Mobile: Dim inactive slides.
                animate={{ opacity: (isDesktop || currentIndex === idx) ? 1 : 0.6 }} 
                style={{ width: cardWidth }}
                className={`relative h-[380px] bg-[#111] rounded-2xl border border-white/10 overflow-hidden group transition-all duration-300`}
              >
                {/* Image */}
                <Image 
                  src={step.image} 
                  alt={step.title}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 300px, 350px"
                  quality={95}
                />

                {/* Badge */}
                <div className="absolute top-3 left-3 flex items-center justify-center w-6 h-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white shadow-sm z-10">
                   {step.id}
                </div>

                {/* Label */}
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center gap-2.5 shadow-lg">
                   <div className={`p-1.5 rounded-lg bg-white/10 ${step.color}`}>
                     <step.icon className="w-3.5 h-3.5" />
                   </div>
                   <h3 className="text-sm font-bold text-white leading-none">
                     {step.title}
                   </h3>
                </div>
              </motion.div>
            ))}
            
            {/* CTA Card */}
             <motion.div 
                animate={{ opacity: (isDesktop || currentIndex === steps.length) ? 1 : 0.6 }}
                style={{ width: cardWidth }}
                className="relative h-[380px] flex flex-col items-center justify-center bg-[#0a0a0a] rounded-2xl border border-dashed border-white/10 hover:border-green-500/40 hover:bg-green-500/5 transition-all group cursor-pointer"
             >
                <Link href="/shop" className="text-center p-6 w-full h-full flex flex-col items-center justify-center">
                   <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                      <MousePointerClick className="w-6 h-6" />
                   </div>
                   <h3 className="text-lg font-bold text-white mb-1">অর্ডার করুন</h3>
                   <span className="text-[10px] text-gray-500 group-hover:text-green-400 transition-colors uppercase tracking-widest">
                     Get Started
                   </span>
                </Link>
             </motion.div>

          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}