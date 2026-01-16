"use client";

import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, BookOpen, CreditCard, User, LogOut, Menu 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

const NavItems = () => (
  <nav className="flex-1 p-4 space-y-2">
    <Button variant="ghost" className="w-full justify-start text-green-400 bg-green-900/10 hover:bg-green-900/20">
      <LayoutDashboard className="mr-3 h-4 w-4" /> <Link href="/dashboard">Dashboard</Link>
    </Button>
    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white">
      <BookOpen className="mr-3 h-4 w-4" /> <Link href="/dashboard/orders">My Orders</Link>
    </Button>
    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white">
      <CreditCard className="mr-3 h-4 w-4" /> Payment History
    </Button>
    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white">
      <User className="mr-3 h-4 w-4" /> <Link href="/dashboard/profile">Profile Settings</Link>
    </Button>
  </nav>
);

const SignOutButton = () => (
  <div className="p-4 border-t border-gray-800">
    <Button variant="ghost" onClick={() => signOut()} className="w-full justify-start text-red-500 hover:bg-red-900/20">
      <LogOut className="mr-3 h-4 w-4" /> Sign Out
    </Button>
  </div>
);

export default function DashboardSidebar() {
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <span className="font-bold text-lg">Student Portal</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6 text-gray-300" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#0a0a0a] border-r-gray-800 text-white w-64 p-0">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold tracking-tight">Menu</h2>
            </div>
            <NavItems />
            <SignOutButton />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-gray-800 bg-[#0a0a0a] fixed h-full inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold tracking-tight text-white">Student Portal</h2>
        </div>
        <NavItems />
        <SignOutButton />
      </aside>
    </>
  );
}