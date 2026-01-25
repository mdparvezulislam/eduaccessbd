"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Sparkles, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NotificationItem {
  id: string;
  type: "order" | "custom";
  title: string;
  message: string;
  image: string;
  timestamp?: string; // This is the ISO string from backend
  time?: string;      // Optional static text for custom popups
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

  // ✅ THE FIX: Client-Side Time Calculator
  // This converts the ISO string to a human readable "Time Ago"
  const getTimeAgo = (isoDate?: string) => {
    if (!isoDate) return "Just now";
    
    const now = new Date();
    const past = new Date(isoDate);
    
    // Get difference in seconds
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    // Logic
    if (diffInSeconds < 60) return "Just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/public/live-notifications", { cache: "no-store" });
        const data = await res.json();
        
        if (data.success) {
          setOrders(data.orders);
          
          const hasSeen = sessionStorage.getItem("hasSeenPopup");
          if (data.popup && !hasSeen) {
            setPopupData(data.popup);
            setTimeout(() => setShowModal(true), 2000); 
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

  const handleCloseModal = () => {
    setShowModal(false);
    sessionStorage.setItem("hasSeenPopup", "true");
  };

  if (!isLoaded) return null;

  const currentItem = orders[currentOrderIndex];

  return (
    <>
      {/* 1. FULL SCREEN MODAL */}
      <AnimatePresence>
        {showModal && popupData && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_50%)] pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />

              <div className="p-8 text-center relative z-10 flex flex-col items-center">
                <button onClick={handleCloseModal} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                <div className="w-20 h-20 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                  <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">{popupData.title}</h2>
                <div className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 max-w-[90%]">{popupData.message}</div>
                <Link href={popupData.link} onClick={handleCloseModal} className="w-full">
                  <Button className="w-full h-12 bg-white text-black hover:bg-gray-200 font-bold text-base rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all transform hover:scale-[1.02]">
                    {popupData.time} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. TOAST NOTIFICATION */}
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
                  
                  {/* ✅ HERE IS THE FIX: Using the calculator on the frontend */}
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