"use client";

import * as React from "react"; // Added for useRef (optional but good practice)
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay"; // 1. Import Autoplay
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/types";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function FeaturedCourses({ products }: { products: IProduct[] }) {
  
  // 2. Configure Autoplay Plugin
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  if (!products || products.length === 0) return null;

  return (
    <section className="py-8 bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-1 md:px-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-white" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-wide">
            Trending Courses
          </h2>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={plugin.current.stop} // Optional: Stop on hover
          onMouseLeave={plugin.current.reset} // Optional: Resume on leave
        >
          <Carousel
            plugins={[plugin.current]} // 3. Add Plugin Here
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem key={product._id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <Link href={`/product/${product.slug}`} className="group block h-full">
                    <div className="h-full bg-[#111] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors duration-300 flex flex-col">
                      
                      {/* Image Area */}
                      <div className="relative aspect-video w-full overflow-hidden">
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Status Badge (Top Right) */}
                        <Badge className="absolute top-3 right-3 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-md">
                          RUNNING
                        </Badge>

                        {/* Optional: Discount Badge (Top Left) */}
                        {product.regularPrice > product.salePrice && (
                           <Badge className="absolute top-3 left-3 bg-yellow-500 text-black hover:bg-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded shadow-md">
                             {Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}% OFF
                           </Badge>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-5 flex flex-col flex-1">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-100 line-clamp-2 leading-snug min-h-[3.5rem] mb-3 group-hover:text-green-400 transition-colors">
                          {product.title}
                        </h3>
                        
                        {/* Price Section (Push to bottom) */}
                        <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
                          <div className="flex flex-col">
                            {product.regularPrice > product.salePrice && (
                              <span className="text-xs text-gray-500 line-through">
                                ৳{product.regularPrice}
                              </span>
                            )}
                            <span className="text-2xl font-extrabold text-white tracking-tight">
                              ৳{product.salePrice}
                            </span>
                          </div>
                          
                          {/* Arrow Icon on Hover */}
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                             <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Minimalist Navigation Buttons (Top Right) */}
            <div className="hidden md:flex absolute -top-14 right-0 gap-2">
               <CarouselPrevious className="static translate-y-0 bg-[#1a1a1a] border-gray-700 text-white hover:bg-white hover:text-black w-9 h-9" />
               <CarouselNext className="static translate-y-0 bg-[#1a1a1a] border-gray-700 text-white hover:bg-white hover:text-black w-9 h-9" />
            </div>
          </Carousel>
        </div>

        {/* View All Button */}
        <div className="mt-12 flex justify-center">
          <Link href="/shop">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-base font-bold rounded-full transition-transform hover:scale-105"
            >
              View All Courses <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}