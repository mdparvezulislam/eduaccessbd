"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock, 
  Package, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_URL } from "@/types";

// Types matching your API response
interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${SITE_URL}/api/admin/stats`,{
          cache:"force-cache", next: {
            revalidate: 60
          }
          
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
    <div className="flex-1 space-y-8 p-8 pt-6 bg-black min-h-screen text-white">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {/* 1. Total Revenue */}
        <StatsCard 
           title="Total Revenue" 
           value={`৳${stats?.totalRevenue.toLocaleString()}`} 
           icon={DollarSign} 
           desc="Lifetime earnings"
           color="text-green-500"
           bgColor="bg-green-500/10"
           borderColor="border-green-500/20"
           variants={item}
        />

        {/* 2. Pending Orders (Action Required) */}
        <StatsCard 
           title="Pending Orders" 
           value={stats?.pendingOrders.toString() || "0"} 
           icon={Clock} 
           desc="Requires Verification"
           color="text-yellow-500"
           bgColor="bg-yellow-500/10"
           borderColor="border-yellow-500/20"
           variants={item}
        />

        {/* 3. Completed Orders */}
        <StatsCard 
           title="Completed Orders" 
           value={stats?.completedOrders.toString() || "0"} 
           icon={CheckCircle2} 
           desc="Successfully delivered"
           color="text-blue-500"
           bgColor="bg-blue-500/10"
           borderColor="border-blue-500/20"
           variants={item}
        />

        {/* 4. Total Products */}
        <StatsCard 
           title="Total Products" 
           value={stats?.totalProducts.toString() || "0"} 
           icon={Package} 
           desc="Active courses/items"
           color="text-purple-500"
           bgColor="bg-purple-500/10"
           borderColor="border-purple-500/20"
           variants={item}
        />

        {/* 5. Total Users */}
        <StatsCard 
           title="Total Users" 
           value={stats?.totalUsers.toString() || "0"} 
           icon={Users} 
           desc="Registered accounts"
           color="text-pink-500"
           bgColor="bg-pink-500/10"
           borderColor="border-pink-500/20"
           variants={item}
        />
        
        {/* 6. Total Orders */}
        <StatsCard 
           title="Total Orders" 
           value={stats?.totalOrders.toString() || "0"} 
           icon={ShoppingCart} 
           desc="All time transactions"
           color="text-orange-500"
           bgColor="bg-orange-500/10"
           borderColor="border-orange-500/20"
           variants={item}
        />
      </motion.div>
    </div>
  );
}

// Reusable Dark Stats Card Component
function StatsCard({ title, value, icon: Icon, desc, color, bgColor, borderColor, variants }: any) {
  return (
    <motion.div variants={variants}>
      <Card className={`bg-[#111] border ${borderColor} shadow-lg hover:bg-[#161616] transition-colors`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-full ${bgColor}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{value}</div>
          <p className="text-xs text-gray-500 mt-1">{desc}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}