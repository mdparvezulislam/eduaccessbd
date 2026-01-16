"use client";

import { IOrder } from "@/types";
import { BookOpen, Clock, CheckCircle2, Star } from "lucide-react";

interface StatsProps {
  orders: IOrder[];
}

export default function DashboardStats({ orders }: StatsProps) {
  // Logic
  const approvedOrders = orders.filter(o => o.status === "completed").length;
  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard 
        title="Courses Enrolled" 
        value={approvedOrders} 
        icon={<BookOpen className="h-5 w-5 text-blue-400" />} 
        color="border-blue-500/20 bg-blue-500/5"
      />
      <StatsCard 
        title="Pending Payments" 
        value={pendingOrders} 
        icon={<Clock className="h-5 w-5 text-yellow-400" />} 
        color="border-yellow-500/20 bg-yellow-500/5"
      />
      <StatsCard 
        title="Completed Orders" 
        value={approvedOrders} 
        icon={<CheckCircle2 className="h-5 w-5 text-green-400" />} 
        color="border-green-500/20 bg-green-500/5"
      />
      <StatsCard 
        title="Profile Score" 
        value="100%" 
        icon={<Star className="h-5 w-5 text-purple-400" />} 
        color="border-purple-500/20 bg-purple-500/5"
      />
    </div>
  );
}

// Internal Helper Card
function StatsCard({ title, value, icon, color }: any) {
  return (
    <div className={`p-5 rounded-xl border ${color} flex flex-col justify-between h-28 md:h-32 relative overflow-hidden group hover:bg-opacity-10 transition-all`}>
      <div className="flex justify-between items-start z-10">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <div className="z-10">
        <h3 className="text-2xl font-bold text-white">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{title}</p>
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150">
        {icon}
      </div>
    </div>
  );
}