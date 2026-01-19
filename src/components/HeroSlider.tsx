"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Data
const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
    title: "Freelancing &",
    highlight: "Outsourcing",
    subtitle: "Build a successful career online. Master the skills needed to dominate global marketplaces.",
    ctaText: "Start Learning",
    ctaLink: "/shop",
    color: "from-blue-500 to-cyan-400"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop",
    title: "Master Digital",
    highlight: "Marketing",
    subtitle: "Unlock the secrets to growing businesses online with expert strategies and tools.",
    ctaText: "Get Started",
    ctaLink: "/products",
    color: "from-purple-500 to-pink-400"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop",
    title: "Web Development",
    highlight: "Pro",
    subtitle: "Become a full-stack developer. Build the next generation of modern web applications.",
    ctaText: "Explore Courses",
    ctaLink: "/products",
    color: "from-green-500 to-emerald-400"
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  // Auto-play with Progress Bar
  useEffect(() => {
    const duration = 5000; // 5 seconds per slide
    const interval = 50;   
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
          return 0;
        }
        return old + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [current]);

  // Reset progress when manually changing slide
  const changeSlide = (index: number) => {
    setCurrent(index);
    setProgress(0);
  };

  return (
    // ⚡ FIX: Reduced height from 800px to 600px/500px for a tighter look
    <section className="relative w-full h-[370px] md:h-[600px] overflow-hidden bg-black font-sans group">
      
      {/* === 1. BACKGROUND LAYER === */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }} 
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            className="object-cover opacity-50"
            priority
          />
          
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* === 2. CONTENT LAYER === */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 h-full flex flex-col justify-center">
        
        {/* ⚡ FIX: Tighter vertical spacing (space-y-4 instead of space-y-6) */}
        <div className="max-w-3xl space-y-4">
          
          {/* Badge */}
          <motion.div
            key={`badge-${current}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md w-fit"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-300">Premium Learning</span>
          </motion.div>

          {/* Main Title - ⚡ FIX: Adjusted sizes for better fit */}
          <motion.h1
            key={`title-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight"
          >
            {slides[current].title} <br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slides[current].color}`}>
              {slides[current].highlight}
            </span>
          </motion.h1>

          {/* Subtitle - ⚡ FIX: Smaller text size */}
          <motion.p
            key={`sub-${current}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm md:text-lg text-gray-300 max-w-xl leading-relaxed border-l-2 border-white/20 pl-4"
          >
            {slides[current].subtitle}
          </motion.p>

          {/* CTA Buttons - ⚡ FIX: Compact buttons */}
          <motion.div
            key={`btn-${current}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-row gap-3 pt-3"
          >
            <Link href={slides[current].ctaLink}>
              <Button className={`h-11 md:h-12 px-6 rounded-full text-sm md:text-base font-bold bg-gradient-to-r ${slides[current].color} hover:brightness-110 transition-all shadow-lg`}>
                {slides[current].ctaText} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            
            <Button variant="outline" className="hidden sm:flex h-11 md:h-12 px-6 rounded-full text-sm md:text-base font-bold bg-transparent border-white/20 text-white hover:bg-white/10">
              <PlayCircle className="mr-2 w-4 h-4" /> 
              {/*  add telegram link */}
              <Link href="https://t.me/ProAccessBD" target="_blank" rel="noopener noreferrer">Join Telegram</Link>
            </Button>
          </motion.div>

        </div>
      </div>

      {/* === 3. THUMBNAIL NAVIGATION === */}
      {/* ⚡ FIX: Positioned tighter to bottom right */}
      <div className="absolute bottom-6 right-4 md:right-8 z-20 flex gap-3 items-end">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            onClick={() => changeSlide(index)}
            className={`cursor-pointer group relative transition-all duration-500 ease-out ${
              current === index ? "w-24 md:w-32 opacity-100" : "w-10 md:w-14 opacity-40 hover:opacity-100"
            }`}
          >
            {/* Progress Bar */}
            {current === index && (
              <div className="absolute -top-3 left-0 w-full h-0.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r ${slide.color}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Thumbnail Image - ⚡ FIX: Reduced height */}
            <div className={`relative h-14 md:h-20 rounded-lg overflow-hidden border transition-all duration-300 ${
              current === index ? "border-white" : "border-transparent"
            }`}>
              <Image 
                src={slide.image} 
                alt={slide.title} 
                fill 
                className="object-cover" 
              />
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}