"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Layers,
  ShieldCheck,
  Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Announcement", href: "/admin/announcement", icon: Megaphone },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Coupons", href: "/admin/coupons", icon: ShoppingBag },
  { label: "Categories", href: "/admin/categories", icon: Layers },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-screen flex-col bg-[#0a0a0a] border-r border-gray-800 text-white">
      
      {/* === HEADER / LOGO === */}
      <div className="flex h-16 items-center border-b border-gray-800 px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="p-1.5 bg-green-600 rounded-md">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span>ProAccess<span className="text-gray-400 font-normal">Admin</span></span>
        </Link>
      </div>

      {/* === NAVIGATION === */}
      <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar-dark">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* === BOTTOM STATUS === */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-[#111] rounded-xl border border-gray-800 p-4 flex flex-col gap-2">
           <div className="flex items-center gap-2 text-xs font-semibold text-green-500 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Secure System
           </div>
           <p className="text-xs text-gray-500 leading-relaxed">
             You are in the Admin Area. All actions are logged.
           </p>
        </div>
      </div>

    </div>
  );
}