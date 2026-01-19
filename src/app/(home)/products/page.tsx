"use client";

import { useState, useEffect } from "react";
import { IProduct, ICategory } from "@/types";
import { useSearchParams } from "next/navigation";
import { 
  Search, Filter, X, SlidersHorizontal, 
  List, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button"; // Ensure you have this

export default function AllProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false); // Mobile drawer

  // ⚡ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // 9 items fits nicely in 3 columns (3x3)

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories")
        ]);
        
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        
        if (prodData.success) setProducts(prodData.products);
        if (catData.success) setCategories(catData.categories);
      } catch (error) {
        console.error("Failed to load shop data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || (typeof p.category === 'object' ? p.category.slug : p.category) === selectedCategory;
    
    // Price Logic
    const price = p.salePrice > 0 ? p.salePrice : p.defaultPrice;
    const matchesPrice = price ? price >= priceRange[0] && price <= priceRange[1] : true;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // ⚡ Reset Pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, priceRange]);

  // ⚡ Pagination Calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Scroll Handler
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Smooth scroll to top of product grid
    const grid = document.getElementById("product-grid-top");
    if (grid) grid.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      
      {/* === HERO HEADER === */}
      <div className="relative bg-[#0a0a0a] border-b border-white/5 py-12 md:py-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4"
          >
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Premium</span> Assets
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-xl mx-auto text-sm md:text-base"
          >
            Browse our curated collection of high-quality digital products, courses, and tools designed to elevate your workflow.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* === SIDEBAR FILTERS (Desktop) === */}
          <aside className="hidden lg:block w-64 space-y-8 shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <List className="w-3 h-3" /> Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedCategory === "All" ? "bg-white text-black font-bold" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedCategory === cat.slug ? "bg-white text-black font-bold" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter (Simple Range) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <TagIcon className="w-3 h-3" /> Price Range
              </h3>
              <div className="flex gap-2 items-center">
                 <div className="bg-[#111] border border-white/10 px-3 py-2 rounded text-xs text-gray-300">৳0</div>
                 <div className="h-[1px] bg-white/10 flex-1"></div>
                 <div className="bg-[#111] border border-white/10 px-3 py-2 rounded text-xs text-gray-300">৳10k+</div>
              </div>
              <p className="text-[10px] text-gray-600">Showing all price ranges by default.</p>
            </div>
          </aside>

          {/* === MOBILE FILTER BAR === */}
          <div className="lg:hidden flex gap-3 mb-4 sticky top-4 z-30">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-[#111]/90 backdrop-blur-md border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none"
               />
             </div>
             <button 
               onClick={() => setShowFilters(true)}
               className="bg-[#111]/90 backdrop-blur-md border border-white/10 px-4 rounded-lg flex items-center justify-center text-white"
             >
               <SlidersHorizontal className="w-4 h-4" />
             </button>
          </div>

          {/* === PRODUCT GRID === */}
          <div className="flex-1" id="product-grid-top">
            
            {/* Stats Bar */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
               <p className="text-sm text-gray-400">
                 Showing <strong className="text-white">{filteredProducts.length}</strong> results
               </p>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600 uppercase font-bold hidden sm:inline">Sort By:</span>
                  <select className="bg-transparent text-sm text-white border-none focus:ring-0 cursor-pointer">
                     <option>Newest</option>
                     <option>Price: Low to High</option>
                     <option>Price: High to Low</option>
                  </select>
               </div>
            </div>

            {loading ? (
              // Skeleton Loader
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-[#111] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              // Empty State
              <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#0a0a0a]">
                 <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-gray-600" />
                 </div>
                 <h3 className="text-lg font-bold text-white">No products found</h3>
                 <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
                 <button onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="mt-4 text-sm text-blue-400 hover:underline">
                    Clear all filters
                 </button>
              </div>
            ) : (
              // Grid with Pagination Support
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 min-h-[60vh] content-start">
                  <AnimatePresence mode="wait">
                    {currentProducts.map((product) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* ⚡ PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-9 w-9 border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        // Logic to show limited pages if there are too many (simple version here)
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`h-9 w-9 rounded-md text-sm font-bold transition-all ${
                            currentPage === page
                              ? "bg-white text-black scale-110"
                              : "text-gray-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* === MOBILE FILTER DRAWER === */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-[#111] border-l border-white/10 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-bold text-white">Filters</h2>
               <button onClick={() => setShowFilters(false)} className="p-2 bg-white/5 rounded-full text-gray-400">
                 <X className="w-5 h-5" />
               </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`px-3 py-1.5 rounded-full text-xs border ${selectedCategory === "All" ? "bg-white text-black border-white" : "border-white/20 text-gray-400"}`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-full text-xs border ${selectedCategory === cat.slug ? "bg-white text-black border-white" : "border-white/20 text-gray-400"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => { setShowFilters(false); }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-8"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

// Simple Icon
function TagIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l5 5a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-5-5z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>
    </svg>
  );
}