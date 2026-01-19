"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/types"; // Ensure you have this type defined
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        setIsOpen(true);
        try {
          // Fetch all products and filter locally (or use a search API endpoint if you have one)
          const res = await fetch("/api/products");
          const data = await res.json();
          if (data.success) {
            const filtered = data.products.filter((p: IProduct) => 
              p.title.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered.slice(0, 5)); // Limit to 5 results
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/shop?search=${encodeURIComponent(query)}`); // Assuming shop page handles ?search= param
    }
  };

  return (
    <div ref={searchRef} className={`relative ${mobile ? "w-full" : "w-full max-w-md hidden sm:block"}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(query.length > 2) setIsOpen(true); }}
          placeholder="Search courses..."
          className={`pl-9 pr-8 bg-[#1f1f1f] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-green-500/50 h-9 md:h-10 rounded-lg transition-all ${isOpen ? 'rounded-b-none border-b-0' : ''}`}
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 animate-spin" />
        ) : query && (
          <button 
            type="button" 
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#1f1f1f] border border-gray-700 border-t-0 rounded-b-lg shadow-xl z-50 overflow-hidden">
          {results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((product) => (
                <Link 
                  key={product._id} 
                  href={`/product/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] transition-colors border-b border-gray-800/50 last:border-0"
                >
                  <div className="relative w-10 h-10 rounded bg-gray-800 overflow-hidden shrink-0">
                    <Image src={product.thumbnail} alt={product.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.title}</p>
                    <p className="text-xs text-gray-400">
                      {product.salePrice > 0 ? `৳${product.salePrice}` : "Free"}
                    </p>
                  </div>
                </Link>
              ))}
              <button 
                onClick={handleSubmit}
                className="w-full p-2.5 text-xs text-center text-green-400 hover:bg-green-900/20 font-bold border-t border-gray-800 transition-colors flex items-center justify-center gap-1"
              >
                View all results <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            !loading && (
              <div className="p-4 text-center text-sm text-gray-500">
                No courses found.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}