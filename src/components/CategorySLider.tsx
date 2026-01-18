"use client";

import { ICategory } from "@/types";
import Image from "next/image";
import Link from "next/link";

// 🎨 1. Define Unique Art Themes
// Each theme has a background gradient, a text color, and a specific decoration style.
const THEMES = [
  {
    id: "cyber",
    bg: "bg-yellow-400",
    gradient: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-200 via-yellow-400 to-yellow-600",
    text: "text-black",
    accentColor: "bg-black/10",
    decoration: "grid", // Diagonal lines pattern
  },
  {
    id: "emerald",
    bg: "bg-emerald-500",
    gradient: "bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-teal-200 via-emerald-500 to-green-800",
    text: "text-white",
    accentColor: "bg-white/20",
    decoration: "circle", // Big circle
  },
  {
    id: "royal",
    bg: "bg-purple-600",
    gradient: "bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-purple-200 via-purple-600 to-indigo-900",
    text: "text-white",
    accentColor: "bg-white/15",
    decoration: "glow", // Soft glow
  },
  {
    id: "ocean",
    bg: "bg-blue-500",
    gradient: "bg-gradient-to-br from-cyan-300 via-blue-500 to-blue-900",
    text: "text-white",
    accentColor: "bg-white/20",
    decoration: "wave", // Wavy svg
  },
  {
    id: "sunset",
    bg: "bg-orange-500",
    gradient: "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-200 via-orange-500 to-red-600",
    text: "text-white",
    accentColor: "bg-black/10",
    decoration: "dots", // Dotted pattern
  },
  {
    id: "candy",
    bg: "bg-pink-500",
    gradient: "bg-gradient-to-tl from-rose-300 via-pink-500 to-fuchsia-700",
    text: "text-white",
    accentColor: "bg-white/25",
    decoration: "ring", // Abstract rings
  },
];

// 🪄 2. Decoration Component (Renders abstract shapes based on theme)
const CardDecoration = ({ type }: { type: string }) => {
  switch (type) {
    case "grid":
      return (
        <div className="absolute inset-0 opacity-20" 
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} 
        />
      );
    case "circle":
      return (
        <div className="absolute -right-4 -top-8 w-24 h-24 rounded-full border-[6px] border-white/20 blur-[1px]" />
      );
    case "glow":
      return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/30 blur-2xl rounded-full" />
      );
    case "dots":
      return (
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "8px 8px" }}
        />
      );
    case "ring":
      return (
        <>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 border-4 border-white/20 rounded-full" />
          <div className="absolute top-2 right-10 w-4 h-4 bg-white/40 rounded-full" />
        </>
      );
    case "wave":
    default:
      return (
        <svg className="absolute bottom-0 left-0 w-full h-12 opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#fff" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      );
  }
};

function CategoryCard({ category, index }: { category: ICategory; index: number }) {
  // Select theme based on index
  const theme = THEMES[index % THEMES.length];
  
  const displaySubtitle = category.description 
    ? category.description.slice(0, 25) 
    : "Explore Collection";

  return (
    <Link href={`/products/${category.slug}`} className="block h-full group relative">
      <div className="h-full overflow-hidden rounded-2xl bg-[#111] border border-white/5 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1.5">
        
        {/* === TOP SECTION: DYNAMIC ART === */}
        <div className={`relative h-[120px] sm:h-[140px] overflow-hidden ${theme.gradient} p-4 flex flex-col justify-between`}>
          
          {/* 1. Grain Texture Overlay (Adds realism) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
             style={{ filter: 'contrast(120%) brightness(100%)', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
          />

          {/* 2. Abstract Decoration */}
          <CardDecoration type={theme.decoration} />

          {/* 3. Header Content (Name) */}
          <div className="relative z-10">
            <span className={`inline-flex items-center justify-center rounded-full ${theme.accentColor} backdrop-blur-md px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider ${theme.text} shadow-sm border border-white/10`}>
              {category.name}
            </span>
          </div>

          {/* 4. Bottom Content (Image + Subtitle) */}
          <div className="relative z-10 flex items-end justify-between mt-2">
            <p className={`text-[10px] sm:text-xs font-bold leading-tight ${theme.text} opacity-90 max-w-[60%]`}>
              {displaySubtitle}
            </p>

            {/* Floating Image with 3D Effect */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 drop-shadow-2xl">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className={`w-full h-full rounded-xl flex items-center justify-center text-xl font-bold ${theme.accentColor} ${theme.text} backdrop-blur-md`}>
                  {category.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === BOTTOM SECTION: MINIMALIST DARK === */}
        <div className="bg-[#0a0a0a] py-3 px-4 flex items-center justify-between group-hover:bg-[#151515] transition-colors">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${theme.bg}`}></div>
            <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
              Browse
            </span>
          </div>
          {/* Arrow Icon */}
          <svg className="w-3 h-3 text-gray-500 transform group-hover:translate-x-1 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

      </div>
    </Link>
  );
}

export default function CategorySection({ categories }: { categories: ICategory[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-black py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-6">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
           <div className="flex items-center gap-3">
             <div className="h-8 w-1.5 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
             <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
               Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Categories</span>
             </h2>
           </div>
           
           <Link href="/products" className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
             VIEW ALL
             <div className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center">
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
           <Link href="/products" className="inline-flex items-center justify-center w-full py-3 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 uppercase tracking-wider">
             View All Categories
           </Link>
        </div>
      </div>
    </section>
  );
}