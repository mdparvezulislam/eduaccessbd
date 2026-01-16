"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ShoppingBag,
  Menu,
  LogOut,
  LayoutDashboard,
  BookOpen,
  User,
  Bell,
  Users,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  {
    href: "/",
    label: "Home",
    icon: <LayoutDashboard className="w-4 h-4 mr-3" />,
  },
  {
    href: "/shop",
    label: "Courses",
    icon: <BookOpen className="w-4 h-4 mr-3" />,
  },
  {
    href: "/announcements",
    label: "Announcements",
    icon: <Bell className="w-4 h-4 mr-3" />,
  },
  {
    href: "/community",
    label: "Community",
    icon: <Users className="w-4 h-4 mr-3" />,
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { data: session } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b border-gray-800 ${
        scrolled ? "bg-black/95 backdrop-blur-md shadow-lg" : "bg-black"
      }`}
    >
      <div className="container mx-auto px-3 md:px-4 h-14 md:h-20 flex items-center gap-3">
        {/* === LEFT (mobile: menu + logo) / (desktop: logo only) === */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Menu Trigger on LEFT */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300 hover:text-white hover:bg-white/10 rounded-full"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-[#0f0f0f] border-r-gray-800 text-white w-[280px] p-0"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="p-4 border-b border-gray-800 flex items-center gap-2">
                  <span className="text-lg font-bold">Edu  </span>
                  <span className="text-lg font-bold text-gray-400">
                    Access BD
                  </span>
                </div>

                {/* Mobile Search */}
                <div className="p-4 pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search courses..."
                      className="pl-9 bg-[#1f1f1f] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-gray-600 h-9 rounded-lg"
                    />
                  </div>
                </div>

                {/* Mobile Links */}
                <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1f1f1f] text-gray-300 hover:text-white transition-colors text-sm"
                      >
                        <span className="text-gray-500">{link.icon}</span>
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                {/* Mobile Auth Footer */}
                {!session && (
                  <div className="p-4 border-t border-gray-800 grid grid-cols-2 gap-3">
                    <SheetClose asChild>
                      <Link href="/auth/login" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent text-sm"
                        >
                          Log in
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/auth/register" className="w-full">
                        <Button className="w-full bg-white text-black hover:bg-gray-200 text-sm">
                          Sign up
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                )}

                {/* Mobile User Footer */}
                {session && (
                  <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-9 w-9 border border-gray-600">
                        <AvatarImage src={session.user?.image || ""} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          U
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm">{session.user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50 text-sm"
                      onClick={() => signOut()}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
            <span className="text-lg md:text-xl font-bold text-white tracking-tight leading-none">
              Edu 
            </span>
            <span className="text-lg md:text-xl font-bold text-gray-400 tracking-tight leading-none">
              Access BD
            </span>
          </Link>
        </div>

        {/* === CENTER: NAV (desktop only) === */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 mx-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-gray-500 mr-1.5 hidden lg:inline-block">
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* === RIGHT: ACTIONS === */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Search (desktop icon) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Cart */}
          <Link href="/cart" className="relative group">
            <div className="p-1.5 md:p-2 text-gray-300 group-hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-black">
                  {totalItems}
                </span>
              )}
            </div>
          </Link>

          {/* User Profile / Login (desktop & tablet) */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden sm:inline-flex relative h-9 w-9 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-gray-700 hover:border-gray-500 p-0 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage
                      src={session.user?.image || ""}
                      alt={session.user?.name || "User"}
                    />
                    <AvatarFallback className="bg-gray-800 text-gray-300">
                      {session.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-64 bg-[#1a1a1a] border-gray-800 text-gray-200 p-2"
                align="end"
              >
                <div className="flex items-center gap-3 p-2 mb-2">
                  <Avatar className="h-10 w-10 border border-gray-600">
                    <AvatarImage src={session.user?.image || ""} />
                    <AvatarFallback className="bg-gray-700">
                      {session.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-sm truncate text-white">
                      {session.user?.name}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </span>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-gray-700" />

                <DropdownMenuItem
                  asChild
                  className="focus:bg-gray-800 focus:text-white cursor-pointer rounded-md my-1"
                >
                  <Link href="/dashboard" className="flex items-center w-full py-2">
                    <LayoutDashboard className="mr-3 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="focus:bg-gray-800 focus:text-white cursor-pointer rounded-md my-1"
                >
                  <Link href="/profile" className="flex items-center w-full py-2">
                    <User className="mr-3 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-700" />

                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="focus:bg-red-900/20 focus:text-red-500 text-red-500 cursor-pointer rounded-md my-1 py-2 font-medium"
                >
                  <LogOut className="mr-3 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex gap-2 md:gap-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-white/10 font-medium text-sm"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-white text-black hover:bg-gray-200 font-semibold px-4 md:px-6 text-sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
