"use client";

import { ICategory } from "@/types";
import Image from "next/image";
import Link from "next/link";

// ----------------------------------------------------------------------
// 1. CONFIGURATION (Moved outside component for performance)
// ----------------------------------------------------------------------

// 🎨 Clean Gradient Themes
const THEMES = [
  {
    gradient: "bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400",
    text: "text-white", // Changed to white for better consistency
    badge: "bg-black/20 text-white", // Consistent badge
  },
  {
    gradient: "bg-gradient-to-br from-emerald-400 to-cyan-500",
    text: "text-white",
    badge: "bg-white/20 text-white",
  },
  {
    gradient: "bg-gradient-to-bl from-purple-500 via-indigo-500 to-blue-600",
    text: "text-white",
    badge: "bg-white/20 text-white",
  },
  {
    gradient: "bg-gradient-to-r from-blue-400 to-teal-400",
    text: "text-white",
    badge: "bg-white/20 text-white",
  },
  {
    gradient: "bg-gradient-to-tr from-pink-500 to-rose-500",
    text: "text-white",
    badge: "bg-white/20 text-white",
  },
  {
    gradient: "bg-gradient-to-r from-orange-400 to-pink-500",
    text: "text-white",
    badge: "bg-black/10 text-white",
  },
];

// ----------------------------------------------------------------------
// 2. SUB-COMPONENT: CATEGORY CARD
// ----------------------------------------------------------------------
function CategoryCard({ category, index }: { category: ICategory; index: number }) {
  // Select theme based on index
  const theme = THEMES[index % THEMES.length];
  
  // Safe truncation for subtitle
  const displaySubtitle = category.description 
    ? category.description.slice(0, 30) 
    : "Edu Access Bd";

  return (
    <Link 
      href={`/products/${category.slug}`} 
      className="block h-full group relative focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl"
      aria-label={`Browse ${category.name}`}
    >
      <div className="h-full overflow-hidden rounded-2xl bg-[#111] border border-white/5 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1.5 flex flex-col">
        
        {/* === TOP SECTION: GRADIENT + IMAGE === */}
        <div className={`relative h-[110px] sm:h-[130px] ${theme.gradient} p-4 flex justify-between items-center overflow-hidden shrink-0`}>
          
          {/* Left: Text Content */}
          <div className="relative z-10 flex flex-col justify-center h-full max-w-[60%]">
            <div>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-sm ${theme.badge}`}>
                {category.name}
              </span>
            </div>
            <p className={`mt-2 text-[10px] sm:text-xs font-bold leading-tight ${theme.text} opacity-90 line-clamp-2`}>
              {displaySubtitle}
            </p>
          </div>

          {/* Right: The Category Image (Optimized Size) */}
          <div className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 shrink-0 transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 drop-shadow-2xl">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                // ⚡ Priority loading for the first 4 items (Above the fold)
                priority={index < 4}
                className="object-contain drop-shadow-md"
                // ⚡ Optimized sizes for 2-col (mobile) and 4-col (desktop)
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              // Fallback if image is missing
              <div className="w-full h-full bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-3xl font-bold text-white/50">
                {category.name.charAt(0)}
              </div>
            )}
          </div>

        </div>

        {/* === BOTTOM SECTION: DARK BAR === */}
        <div className="bg-[#0a0a0a] py-3 px-4 flex items-center justify-between mt-auto group-hover:bg-[#151515] transition-colors border-t border-white/5">
          <div className="flex items-center gap-2">
            {/* Small dot matching the gradient */}
            <div className={`w-1.5 h-1.5 rounded-full ${theme.gradient}`}></div>
            <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
              Browse
            </span>
          </div>
          <svg className="w-3 h-3 text-gray-500 transform group-hover:translate-x-1 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

      </div>
    </Link>
  );
}

// ----------------------------------------------------------------------
// 3. MAIN COMPONENT
// ----------------------------------------------------------------------
export default function CategorySection({ categories }: { categories: ICategory[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-black py-2 md:py-12 font-sans">
      <div className="container mx-auto px-2 md:px-4">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
           <div className="flex items-center gap-3">
             <div className="h-8 w-1.5 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
             <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
               Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Categories</span>
             </h2>
           </div>
           
           <Link href="/products" className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors group">
             VIEW ALL
             <div className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center group-hover:border-white transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </div>
           </Link>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <CategoryCard 
              key={category._id} 
              category={category} 
              index={index}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
           <Link href="/products" className="inline-flex items-center justify-center w-full py-3.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 uppercase tracking-wider transition-all active:scale-[0.98]">
             View All Categories
           </Link>
        </div>
      </div>
    </section>
  );
}