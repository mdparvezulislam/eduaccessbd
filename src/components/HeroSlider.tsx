"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Data for the Slider
const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop", // Replace with your image
    title: "Freelancing & Outsourcing",
    subtitle: "Learn how to build a successful career online and earn from global marketplaces.",
    ctaText: "Click Here",
    ctaLink: "/courses",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop",
    title: "Master Digital Marketing",
    subtitle: "Unlock the secrets to growing businesses online with expert strategies.",
    ctaText: "Get Started",
    ctaLink: "/courses",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
    title: "Web Development Pro",
    subtitle: "Become a full-stack developer and build the next generation of web apps.",
    ctaText: "Explore Now",
    ctaLink: "/courses",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play logic
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-black group">
      
      {/* === BACKGROUND IMAGE SLIDER === */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </motion.div>
      </AnimatePresence>

      {/* === CONTENT === */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
        
        {/* Title Animation */}
        <motion.h1
          key={`title-${currentSlide}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-lg"
        >
          {slides[currentSlide].title}
        </motion.h1>

        {/* Subtitle Animation */}
        <motion.p
          key={`sub-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl mb-8 font-medium drop-shadow-md flex items-center justify-center gap-2"
        >
          {slides[currentSlide].subtitle} 
          <span className="animate-pulse">🚀</span>
        </motion.p>

        {/* CTA Button Animation */}
        <motion.div
          key={`btn-${currentSlide}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Link href={slides[currentSlide].ctaLink}>
            <Button 
              size="lg" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black rounded-full px-8 py-6 text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]"
            >
              {slides[currentSlide].ctaText}
            </Button>
          </Link>
        </motion.div>

      </div>

      {/* === NAVIGATION CONTROLS === */}
      
      {/* Left Arrow */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0 duration-300"
      >
        <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
      </button>

      {/* Right Arrow */}
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 duration-300"
      >
        <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 border border-white/50 ${
              currentSlide === index 
                ? "bg-green-500 scale-125 border-none shadow-[0_0_10px_#22c55e]" 
                : "bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

    </section>
  );
}