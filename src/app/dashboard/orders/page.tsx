"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ShoppingBag, Clock, CheckCircle2, XCircle, 
  ChevronRight, Key, Download, Copy, Loader2, Filter, Zap, Package
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IOrder } from "@/types";

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch Data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Failed to fetch orders");
        toast.error("Could not load orders");
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchOrders();
  }, [session]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    // ⚡ Safely get the main product title for search
    const firstItem = order.products?.[0];
    const productTitle = firstItem 
      ? (typeof firstItem.product === 'object' ? (firstItem.product as any).title : firstItem.title) 
      : "";
    
    const matchesSearch = 
      productTitle.toLowerCase().includes(search.toLowerCase()) || 
      order.transactionId.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white min-h-screen py-6 px-4 max-w-6xl mx-auto">
      
      {/* === HEADER === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">My Orders</h1>
          <p className="text-sm text-gray-400">Track purchase history and access your items</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search ID or Product..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#111] border-gray-800 text-white w-full sm:w-64 h-10 placeholder:text-gray-600 focus-visible:ring-green-500/20"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-800 bg-[#111] text-gray-300 hover:bg-gray-800 hover:text-white justify-between h-10">
                <span className="flex items-center"><Filter className="w-4 h-4 mr-2" /> {statusFilter === 'all' ? 'Status' : statusFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#111] border-gray-800 text-white w-40">
              <DropdownMenuItem onClick={() => setStatusFilter("all")} className="cursor-pointer hover:bg-white/10">All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")} className="cursor-pointer text-green-400 hover:bg-white/10">Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")} className="cursor-pointer text-yellow-400 hover:bg-white/10">Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")} className="cursor-pointer text-red-400 hover:bg-white/10">Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* === ORDERS LIST === */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-800 rounded-xl bg-[#0a0a0a]"
          >
            <div className="bg-gray-900 p-4 rounded-full mb-3">
              <ShoppingBag className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-white">No orders found</h3>
            <p className="text-gray-500 text-sm mt-1">Check back later or adjust filters.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <OrderListItem 
                key={order._id} 
                order={order} 
                index={index} 
                onCopy={copyToClipboard} 
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// === SUB-COMPONENT: Order Item ===
function OrderListItem({ order, index, onCopy }: { order: IOrder, index: number, onCopy: (t: string) => void }) {
  
  // ⚡ Updated: Correctly access the first item from the array
  const firstItem = order.products?.[0];
  const productData = firstItem && typeof firstItem.product === 'object' ? (firstItem.product as any) : null;
  
  const title = productData?.title || firstItem?.title || "Unknown Item";
  const thumbnail = productData?.thumbnail || "/placeholder.png"; // Make sure you have a placeholder image in public folder or use a URL
  const extraCount = (order.products?.length || 0) - 1;

  const statusConfig = {
    pending: { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
    processing: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Zap },
    completed: { color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle2 },
    declined: { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
    cancelled: { color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: XCircle },
  };

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#111] border border-gray-800 hover:border-gray-700 transition-all group shadow-sm">
        
        {/* Left: Thumbnail */}
        <div className="relative w-full sm:w-20 h-40 sm:h-20 bg-gray-900 rounded-lg overflow-hidden shrink-0 border border-gray-800">
          <Image src={thumbnail} alt={title} fill className="object-cover" />
          {extraCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white backdrop-blur-[1px]">
              +{extraCount} more
            </div>
          )}
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base truncate max-w-[200px] sm:max-w-md" title={title}>
              {title}
            </h3>
            {extraCount > 0 && <span className="text-[10px] text-gray-500 hidden sm:inline-block">and {extraCount} others</span>}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
            <span className="font-mono bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800 text-gray-400">
              #{order.transactionId?.slice(-6) || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3"/> {new Date(order.createdAt).toLocaleDateString()}
            </span>
            <Badge className={`${status.color} border px-1.5 py-0 text-[9px] uppercase font-bold sm:hidden`}>
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Right: Status, Price & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-gray-800 pt-3 sm:pt-0 mt-2 sm:mt-0">
          
          {/* Desktop Status */}
          <div className="hidden sm:flex flex-col items-end gap-1">
             <span className="text-xs text-gray-500">Status</span>
             <Badge className={`${status.color} border px-2 py-0.5 text-[10px] uppercase font-bold flex items-center gap-1`}>
               <StatusIcon className="w-3 h-3" /> {order.status}
             </Badge>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
            <p className="text-base font-bold text-white">৳{order.amount.toLocaleString()}</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-white text-black hover:bg-gray-200 font-bold transition-transform active:scale-95 h-9 px-4">
                Details
              </Button>
            </DialogTrigger>
            
            {/* --- MODAL --- */}
            <DialogContent className="bg-[#111] border-gray-800 text-white sm:max-w-md p-0 overflow-hidden">
              <DialogHeader className="p-5 border-b border-gray-800 bg-[#161616]">
                <DialogTitle className="flex justify-between items-center">
                  <span>Order Details</span>
                  <Badge className={`${status.color} border px-2 py-0.5 text-[10px]`}>{order.status}</Badge>
                </DialogTitle>
                <DialogDescription className="text-gray-500 text-xs font-mono pt-1">
                  ID: {order.transactionId}
                </DialogDescription>
              </DialogHeader>

              <div className="p-5 space-y-6">
                
                {/* ⚡ Product List in Modal (Show ALL items) */}
                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-1 scrollbar-hide">
                   {order.products?.map((item, i) => (
                     <div key={i} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                           <div className="bg-gray-800 p-2 rounded text-gray-400"><Package className="w-4 h-4"/></div>
                           <div>
                             <p className="text-gray-200 font-medium truncate max-w-[180px]">{item.title || "Item"}</p>
                             <p className="text-[10px] text-gray-500">{item.variant || "Standard"} x{item.quantity}</p>
                           </div>
                        </div>
                        <span className="font-mono text-gray-400">৳{item.price * item.quantity}</span>
                     </div>
                   ))}
                </div>

                {/* Delivered Content (Vault) */}
                {order.status === "completed" ? (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-4">
                    <h4 className="font-bold text-green-400 flex items-center gap-2 text-xs uppercase tracking-wider border-b border-green-500/10 pb-2">
                      <Key className="w-3 h-3" /> Access Credentials
                    </h4>
                    
                    <div className="space-y-3">
                      {/* Email */}
                      {order.deliveredContent?.accountEmail && (
                        <div className="bg-black/40 p-2.5 rounded border border-green-500/10 flex justify-between items-center">
                          <div className="overflow-hidden">
                            <p className="text-[9px] text-gray-500 uppercase font-bold">Email / Username</p>
                            <code className="text-xs text-white truncate block">{order.deliveredContent.accountEmail}</code>
                          </div>
                          <button onClick={() => onCopy(order.deliveredContent?.accountEmail || "")} className="text-gray-500 hover:text-white transition"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                      
                      {/* Password */}
                      {order.deliveredContent?.accountPassword && (
                        <div className="bg-black/40 p-2.5 rounded border border-green-500/10 flex justify-between items-center">
                          <div className="overflow-hidden">
                            <p className="text-[9px] text-gray-500 uppercase font-bold">Password</p>
                            <code className="text-xs text-white truncate block">{order.deliveredContent.accountPassword}</code>
                          </div>
                          <button onClick={() => onCopy(order.deliveredContent?.accountPassword || "")} className="text-gray-500 hover:text-white transition"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      )}

                      {/* Download Link */}
                      {order.deliveredContent?.downloadLink && (
                         <Button asChild className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-9 text-xs">
                            <a href={order.deliveredContent.downloadLink} target="_blank">
                               <Download className="w-3.5 h-3.5 mr-2"/> Download / Access Link
                            </a>
                         </Button>
                      )}

                      {/* Notes */}
                      {order.deliveredContent?.accessNotes && (
                        <div className="text-[11px] text-green-100/70 bg-green-500/10 p-3 rounded border border-green-500/10 italic leading-relaxed">
                          "{order.deliveredContent.accessNotes}"
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 text-center">
                    <Loader2 className="w-6 h-6 text-yellow-500/50 mx-auto mb-2 animate-spin" />
                    <p className="text-sm font-medium text-yellow-200">Processing Payment</p>
                    <p className="text-[11px] text-gray-500 mt-1">Please wait for admin verification.</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.div>
  );
}

// Simple Icon
function CalendarIcon({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
}