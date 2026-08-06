"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Sparkles } from "lucide-react";

export default function FloatingDisclaimerButton() {
  const pathname = usePathname();

  // Hide floating disclaimer button on admin, dashboard, and api routes
  const isHiddenRoute = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/api") ||
    pathname === "/disclaimer"; // Already on disclaimer page

  if (isHiddenRoute) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link
          href="/disclaimer"
          aria-label="View Official Disclaimer and Transparency Notice"
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 hover:border-amber-400/50 shadow-2xl backdrop-blur-md transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        >
          {/* Subtle Glow Aura */}
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10" />

          {/* Icon with subtle pulse */}
          <div className="relative flex items-center justify-center p-1.5 rounded-full bg-amber-500/20 text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors duration-300">
            <ShieldAlert className="w-4 h-4" />
          </div>

          {/* Button Text */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold tracking-wide group-hover:text-amber-300 transition-colors">
                Disclaimer
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.2 rounded-full hidden sm:inline-block">
                Notice
              </span>
            </div>
            <span className="text-[9px] text-gray-400 group-hover:text-gray-300 font-sans leading-none hidden md:inline-block">
              Transparency Policy
            </span>
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
