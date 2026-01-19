"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Megaphone, Calendar, AlertTriangle, CheckCircle2, 
  Info, Tag, ArrowRight, Bell, Sparkles 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// --- Types (Matched with Mongoose Model) ---
interface Announcement {
  _id: string;
  title: string;
  description: string;
  type: "update" | "alert" | "offer" | "info";
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Add timestamp to prevent caching
        const res = await fetch(`/api/announcements?t=${new Date().getTime()}`);
        const data = await res.json();
        if (data.success) {
          setAnnouncements(data.data);
        }
      } catch (error) {
        toast.error("তথ্য লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // --- Helper: Get Style Config ---
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "offer":
        return {
          icon: <Tag className="w-4 h-4" />,
          color: "text-green-400",
          bg: "bg-green-500/10",
          border: "border-green-500/20",
          shadow: "group-hover:shadow-green-900/20",
          badge: "স্পেশাল অফার"
        };
      case "alert":
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          shadow: "group-hover:shadow-red-900/20",
          badge: "জরুরী নোটিশ"
        };
      case "update":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          shadow: "group-hover:shadow-blue-900/20",
          badge: "সিস্টেম আপডেট"
        };
      default:
        return {
          icon: <Info className="w-4 h-4" />,
          color: "text-gray-400",
          bg: "bg-gray-500/10",
          border: "border-gray-500/20",
          shadow: "group-hover:shadow-gray-900/20",
          badge: "তথ্য"
        };
    }
  };

  // --- Helper: Check if New (within 48 hours) ---
  const isRecent = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours <= 48;
  };

  // --- Helper: Bangla Date ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30 overflow-x-hidden">
      
      {/* === HERO HEADER === */}
      <div className="relative border-b border-white/5 bg-[#0a0a0a]">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />

        <div className="container mx-auto px-4 py-16 md:py-20 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-6 border border-white/10 backdrop-blur-sm shadow-xl"
          >
            <Megaphone className="w-6 h-6 text-green-400" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-white"
          >
            নোটিশ বোর্ড <span className="text-green-500">ও আপডেট</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
          >
            আমাদের সর্বশেষ অফার, সিস্টেম মেইনটেনেন্স এবং গুরুত্বপূর্ণ ঘোষণাগুলো এখানে নিয়মিত আপডেট করা হয়।
          </motion.p>
        </div>
      </div>

      {/* === CONTENT AREA === */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          // ✨ Enhanced Skeleton Loader
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[280px] rounded-2xl bg-[#111] border border-white/5 p-5 flex flex-col gap-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="w-10 h-10 rounded-lg bg-white/5" />
                  <div className="w-20 h-6 rounded-full bg-white/5" />
                </div>
                <div className="w-3/4 h-6 rounded bg-white/5 mt-2" />
                <div className="w-full h-20 rounded bg-white/5" />
                <div className="w-1/3 h-4 rounded bg-white/5 mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((item, index) => {
              const style = getTypeStyles(item.type);
              const isNew = isRecent(item.createdAt);
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`h-full bg-[#0f0f0f] border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-2xl ${style.shadow} group flex flex-col relative overflow-hidden`}>
                    
                    {/* Top Glow Line */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${style.bg} opacity-50`} />

                    <CardHeader className="pb-3 pt-5 px-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className={`p-2.5 rounded-xl ${style.bg} ${style.color} border ${style.border}`}>
                          {style.icon}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className={`${style.color} ${style.border} bg-transparent capitalize font-medium tracking-wide`}>
                            {style.badge}
                          </Badge>
                          {isNew && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full shadow-lg shadow-red-900/20 animate-pulse">
                              <Sparkles className="w-2.5 h-2.5" /> NEW
                            </span>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-100 mt-4 leading-snug group-hover:text-white transition-colors line-clamp-2">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-white/5 pl-3">
                        {item.description}
                      </p>
                      
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 mt-auto">
                        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        {item.type === 'offer' && (
                          <div className="flex items-center gap-1 text-green-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                            বিস্তারিত <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && announcements.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]"
          >
            <div className="bg-white/5 p-5 rounded-full mb-5">
              <Bell className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">কোনো নোটিশ নেই</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              এই মুহূর্তে কোনো নতুন ঘোষণা নেই। দয়া করে কিছুক্ষণ পর আবার চেক করুন।
            </p>
          </motion.div>
        )}
      </div>

    </div>
  );
}