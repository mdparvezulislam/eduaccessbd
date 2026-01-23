"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CreditCard, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  return (
    <Card className="bg-[#111] border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
{/*  Here add Link to other pages */}
        <Link href="/dashboard/profile" className="w-full">
          <ActionButton
            icon={<User size={20} />}
            title="Edit Profile"
            desc="Update your personal information"
          />
        </Link>
        <Link href="/dashboard/orders" className="w-full">
          <ActionButton
            icon={<LayoutDashboard size={20} />}
            title="View Orders"
            desc="Check your recent orders"
          />
        </Link>
        <Link href="/dashboard/payments" className="w-full">
          <ActionButton
            icon={<CreditCard size={20} />}
            title="Manage Payments"
            desc="Update your payment methods"
          />
        </Link>
        <Link href="/products" className="w-full">
          <ActionButton
            icon={<BookOpen size={20} />}
            title="View More "
            desc="Access learning materials"
          />
        </Link>
      </CardContent>
    </Card>
  );
}

// Internal Helper Button
function ActionButton({ icon, title, desc }: any) {
  return (
    <button className="flex items-start gap-4 p-4 rounded-lg bg-[#1a1a1a] border border-gray-800 hover:bg-gray-800 hover:border-gray-700 transition-all text-left group w-full">
      <div className="p-2 bg-gray-800 rounded-md text-gray-300 group-hover:text-white group-hover:bg-gray-700 transition-colors shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-sm text-gray-200 group-hover:text-white truncate">{title}</h4>
        <p className="text-xs text-gray-500 group-hover:text-gray-400 truncate">{desc}</p>
      </div>
    </button>
  );
}