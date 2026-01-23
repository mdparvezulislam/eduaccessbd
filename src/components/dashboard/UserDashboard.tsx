"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { IOrder } from "@/types";

// Import Sub-Components

import DashboardHeader from "@/components/dashboard/Header";
import DashboardStats from "@/components/dashboard/Stats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentOrders from "@/components/dashboard/RecentOrders";
import RecentPayments from "@/components/dashboard/RecentPayments";

export default function UserDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders.slice(0, 7)); // Get only recent 7 orders
        }
      } catch (error) {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchOrders();
  }, [session]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      
  
      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
          
          <DashboardHeader user={session?.user} />

          <DashboardStats orders={orders} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <QuickActions />
              <RecentOrders orders={orders} />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <RecentPayments />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}