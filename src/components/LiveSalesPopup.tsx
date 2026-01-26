"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Sparkles, User, ArrowRight, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NotificationItem {
  id: string;
  type: "order" | "custom";
  title: string;
  message: string;
  image: string;
  timestamp?: string;
  time?: string;
  link: string;
  customerName: string;
}

export default function LiveSalesPopup() {
  const [orders, setOrders] = useState<NotificationItem[]>([]);
  const [popupData, setPopupData] = useState<NotificationItem | null>(null);
  
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Helper: Time Ago ---
  const getTimeAgo = (isoDate?: string) => {
    if (!isoDate) return "Just now";
    const now = new Date();
    const past = new Date(isoDate);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr${diffInHours !== 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/public/live-notifications", { cache: "no-store" });
        const data = await res.json();
        
        if (data.success) {
          setOrders(data.orders);
          
          // Check session storage to see if user already closed popup this session
          const hasSeen = sessionStorage.getItem("hasSeenPopup");
          if (data.popup && !hasSeen) {
            setPopupData(data.popup);
            // Delay modal slightly for dramatic effect
            setTimeout(() => setShowModal(true), 1500); 
          }

          if (data.orders.length > 0) {
            setTimeout(() => setShowToast(true), 5000);
          }
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Popup Error", error);
      }
    };
    fetchData();
  }, []);

  // --- Toast Cycle Logic ---
  useEffect(() => {
    if (!isLoaded || orders.length === 0) return;
    const cycle = setInterval(() => {
      setShowToast(false);
      setTimeout(() => {
        setCurrentOrderIndex((prev) => (prev + 1) % orders.length);
        const randomDelay = Math.floor(Math.random() * 5000) + 8000;
        setTimeout(() => setShowToast(true), randomDelay);
      }, 500);
    }, 20000);
    return () => clearInterval(cycle);
  }, [isLoaded, orders]);

  // --- Handlers ---
  const handleCloseModal = () => {
    setShowModal(false);
    sessionStorage.setItem("hasSeenPopup", "true");
  };

  if (!isLoaded) return null;

  const currentItem = orders[currentOrderIndex];

  return (
    <>
      {/* =========================================================
          1. FULL SCREEN MODAL (Optimized Design)
         ========================================================= */}
      <AnimatePresence>
        {showModal && popupData && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          >
            {/* BACKDROP: Click here closes the modal */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* MODAL CONTENT: Click here DOES NOT close modal (stopPropagation) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()} // ✅ Prevents closing when clicking inside
              className="relative w-full max-w-[420px] bg-[#0a0a0a] rounded-3xl shadow-2xl overflow-hidden border border-white/10 group"
            >
              
              {/* --- Decorative Glows --- */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-green-500/20 blur-[60px] pointer-events-none" />
              
              {/* --- Hero Image Section --- */}
              <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
                <Image 
                  src={popupData.image} 
                  alt="Announcement" 
                  fill 
                  className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                
                {/* Close Button (Floating) */}
                <button 
                  onClick={handleCloseModal} 
                  className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all border border-white/10 z-20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* --- Content Section --- */}
              <div className="p-6 pt-2 relative z-10 text-center">
                
                {/* Icon Badge */}
                <div className="mx-auto -mt-10 mb-4 w-16 h-16 bg-[#111] rounded-2xl border border-white/10 flex items-center justify-center shadow-lg relative z-20">
                  <Bell className="w-8 h-8 text-green-400 fill-green-400/20 animate-wiggle" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 leading-tight tracking-tight">
                  {popupData.title}
                </h2>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-6 px-2">
                  {popupData.message}
                </p>

                <Link href={popupData.link} onClick={handleCloseModal} className="block w-full">
                  <Button className="w-full h-12 bg-white text-black hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-base rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2">
                    {popupData.time} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-600 uppercase tracking-widest font-mono">
                  <Sparkles className="w-3 h-3 text-green-500" /> 
                  Limited Time Offer
                  <Sparkles className="w-3 h-3 text-green-500" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          2. TOAST NOTIFICATION (Sales)
         ========================================================= */}
      <AnimatePresence>
        {showToast && currentItem && (
          <motion.div
            initial={{ opacity: 0, x: -50, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed bottom-5 left-5 z-[9990] w-full max-w-[340px]"
          >
            <div className="relative bg-[#111]/90 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center gap-4 group cursor-default overflow-hidden hover:border-white/20 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
              <button onClick={() => setShowToast(false)} className="absolute top-2 right-2 text-gray-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><X className="w-3.5 h-3.5" /></button>

              <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-white/5 bg-gray-900 shadow-inner">
                <Image src={currentItem.image} alt="Product" fill className="object-cover" />
              </div>

              <Link href={currentItem.link} className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-green-500/20 p-1 rounded-full"><CheckCircle2 className="w-3 h-3 text-green-400" /></div>
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Purchased</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    {currentItem.type === 'order' 
                      ? getTimeAgo(currentItem.timestamp) 
                      : currentItem.time || "Now"}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-white leading-tight line-clamp-1 mb-0.5 group-hover:text-green-300 transition-colors">
                  {currentItem.message.replace('bought', '')} 
                </h4>

                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-gray-500" />
                  <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{currentItem.customerName}</p>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}