"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, ShoppingCart, Users, Clock, Package, 
  CheckCircle2, Loader2, TrendingUp, RefreshCw, XCircle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/types";
import { toast } from "sonner";

// Types matching updated API response
interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      // Add timestamp to prevent aggressive caching
      const res = await fetch(`${SITE_URL}/api/admin/stats?t=${Date.now()}`, {
        cache: "no-store", 
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        if (isRefresh) toast.success("Dashboard updated");
      }
    } catch (error) {
      console.error("Failed to load stats");
      toast.error("Failed to update dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-6 md:p-8 bg-black min-h-screen text-white">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h2>
          <p className="text-gray-400 text-sm mt-1">Real-time insight into your store performance.</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => fetchStats(true)} 
          disabled={refreshing}
          className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {/* 1. Total Revenue (Primary) */}
        <StatsCard 
           title="Total Revenue" 
           value={`৳${stats?.totalRevenue.toLocaleString()}`} 
           icon={DollarSign} 
           desc="Lifetime earnings"
           color="text-green-400"
           bgColor="bg-green-500/10"
           borderColor="border-green-500/20"
           variants={item}
           trend="+12% from last month"
        />

        {/* 2. Pending Orders (Critical) */}
        <StatsCard 
           title="Pending Orders" 
           value={stats?.pendingOrders.toString() || "0"} 
           icon={Clock} 
           desc="Action Required"
           color="text-yellow-400"
           bgColor="bg-yellow-500/10"
           borderColor="border-yellow-500/20"
           variants={item}
           highlight={stats?.pendingOrders! > 0} // Glow effect if pending > 0
        />

        {/* 3. Completed Orders */}
        <StatsCard 
           title="Completed Orders" 
           value={stats?.completedOrders.toString() || "0"} 
           icon={CheckCircle2} 
           desc="Successfully delivered"
           color="text-blue-400"
           bgColor="bg-blue-500/10"
           borderColor="border-blue-500/20"
           variants={item}
        />

        {/* 4. Total Users */}
        <StatsCard 
           title="Active Users" 
           value={stats?.totalUsers.toString() || "0"} 
           icon={Users} 
           desc="Registered accounts"
           color="text-pink-400"
           bgColor="bg-pink-500/10"
           borderColor="border-pink-500/20"
           variants={item}
        />

        {/* 5. Total Products */}
        <StatsCard 
           title="Total Products" 
           value={stats?.totalProducts.toString() || "0"} 
           icon={Package} 
           desc="Active courses"
           color="text-purple-400"
           bgColor="bg-purple-500/10"
           borderColor="border-purple-500/20"
           variants={item}
        />
        
        {/* 6. Cancelled Orders */}
        <StatsCard 
           title="Cancelled" 
           value={stats?.cancelledOrders.toString() || "0"} 
           icon={XCircle} 
           desc="Failed / Rejected"
           color="text-red-400"
           bgColor="bg-red-500/10"
           borderColor="border-red-500/20"
           variants={item}
        />
      </motion.div>
    </div>
  );
}

// --- Reusable Stats Card ---
function StatsCard({ 
  title, value, icon: Icon, desc, color, bgColor, borderColor, variants, trend, highlight 
}: any) {
  return (
    <motion.div variants={variants}>
      <Card className={`bg-[#111] border ${borderColor} shadow-lg hover:bg-[#151515] transition-all duration-300 relative overflow-hidden group ${highlight ? "shadow-yellow-500/10 border-yellow-500/30" : ""}`}>
        
        {/* Highlight Pulse for Critical Items */}
        {highlight && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full m-3 animate-ping" />
        )}

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300 tracking-wide uppercase">
            {title}
          </CardTitle>
          <div className={`p-2.5 rounded-xl ${bgColor} transition-transform group-hover:scale-110 duration-300`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">{desc}</p>
            {trend && (
              <span className="text-[10px] text-green-400 flex items-center gap-0.5 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/10">
                <TrendingUp className="w-3 h-3" /> {trend}
              </span>
            )}
          </div>
        </CardContent>
        
        {/* Background Glow Effect */}
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${bgColor} blur-3xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity`} />
      </Card>
    </motion.div>
  );
}