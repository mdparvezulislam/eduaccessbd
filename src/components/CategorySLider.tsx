"use client";

import { ICategory } from "@/types";
import Image from "next/image";
import Link from "next/link";

// Predefined gradients to cycle through for visual variety
const GRADIENTS = [
  "from-yellow-400 to-white",
  "from-green-400 to-white",
  "from-purple-400 to-white",
  "from-blue-400 to-white",
  "from-orange-400 to-white",
  "from-pink-400 to-white",
];

function CategoryCard({ category, index }: { category: ICategory; index: number }) {
  // Cycle through gradients
  const gradientClass = GRADIENTS[index % GRADIENTS.length];
  
  // Truncate description for tighter cards
  const displaySubtitle = category.description 
    ? category.description.slice(0, 20) // Shorter slice for mobile
    : "ACADEMIC REVISION";

  return (
    // Link points to shop page with filter
    <Link href={`/products/${category.slug}`} className="block h-full group">
      <div className="h-full overflow-hidden rounded-lg bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        
        {/* Top Section with Gradient */}
        <div
          className={`relative flex items-center justify-between bg-gradient-to-r ${gradientClass} p-3 h-[90px] sm:h-[110px]`}
        >
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M10 0l10 10-10 10L0 10z\" fill=\"black\"/%3E%3C/svg%3E')",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Text Content */}
          <div className="relative z-10 flex flex-col justify-center h-full max-w-[65%]">
            <div>
              <span className="inline-block rounded bg-black/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-black backdrop-blur-sm">
                {category.name}
              </span>
            </div>

            <p className="mt-1 text-[10px] sm:text-xs font-extrabold uppercase leading-tight text-black line-clamp-2">
              {displaySubtitle}
            </p>
          </div>

          {/* Logo / Image */}
          <div className="relative z-10 h-10 w-12 sm:h-14 sm:w-16 flex-shrink-0 drop-shadow-md transform transition-transform group-hover:scale-110 duration-300">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-contain"
              />
            ) : (
              // Fallback placeholder
              <div className="w-full h-full bg-white/50 rounded-lg flex items-center justify-center text-xs font-bold text-black/50">
                {category.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Black Bar */}
        <div className="bg-[#111] py-2 px-2 border-t border-gray-800">
          <p className="text-center text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider truncate">
            {category.name}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function CategorySection({ categories }: { categories: ICategory[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-black py-8">
      <div className="container mx-auto px-3 md:px-6">

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-5">
           <div className="h-6 w-1 bg-yellow-400 rounded-full"></div>
           <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
             Browse Categories
           </h2>
        </div>

        {/* Responsive Grid: 2 Cols on Mobile, 4 on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((category, index) => (
            <CategoryCard 
              key={category._id} 
              category={category} 
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}