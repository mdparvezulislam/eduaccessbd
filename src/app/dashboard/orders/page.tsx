"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Search, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Key, 
  Download, 
  Copy, 
  Loader2,
  Filter,
  Zap
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

  // Fetch Data (The API now handles filtering by User ID)
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
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchOrders();
  }, [session]);

  // Copy Helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Frontend Search/Status Filter Logic
  const filteredOrders = orders.filter((order) => {
    const product = typeof order.product === 'object' && order.product ? order.product : { title: "" };
    
    // Search by Title or Transaction ID
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase()) || 
                          order.transactionId.toLowerCase().includes(search.toLowerCase());
    
    // Filter by Status
    const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white min-h-screen">
      
      {/* === HEADER & CONTROLS === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Orders</h1>
          <p className="text-gray-400">Manage your purchases and access content</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search ID or Product..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#111] border-gray-800 text-white w-full sm:w-64 placeholder:text-gray-600 focus-visible:ring-green-500/20"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-800 bg-[#111] text-gray-300 hover:bg-gray-800 hover:text-white justify-between min-w-[140px]">
                <span className="flex items-center"><Filter className="w-4 h-4 mr-2" /> {statusFilter === 'all' ? 'All Status' : statusFilter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#111] border-gray-800 text-white w-48">
              <DropdownMenuItem onClick={() => setStatusFilter("all")} className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white">All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")} className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-green-400 focus:text-green-400">Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")} className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-yellow-400 focus:text-yellow-400">Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")} className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-red-400 focus:text-red-400">Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* === ORDERS LIST === */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-800 rounded-xl bg-[#0a0a0a]">
            <div className="bg-gray-900 p-4 rounded-full mb-3">
              <ShoppingBag className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-white">No orders found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <OrderListItem 
              key={order._id} 
              order={order} 
              index={index} 
              onCopy={copyToClipboard} 
            />
          ))
        )}
      </div>
    </div>
  );
}

// === SUB-COMPONENT: Order Item ===
function OrderListItem({ order, index, onCopy }: { order: IOrder, index: number, onCopy: (t: string) => void }) {
  const product = typeof order.product === 'object' && order.product ? order.product : { title: "Unknown", thumbnail: "" };
  
  const statusConfig = {
    pending: { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
    processing: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Zap },
    completed: { color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle2 },
    declined: { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
    cancelled: { color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: XCircle },
  };

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 rounded-xl bg-[#111] border border-gray-800 hover:border-gray-700 transition-all group">
        
        {/* Left: Thumbnail */}
        <div className="relative w-full sm:w-20 h-40 sm:h-20 bg-gray-900 rounded-lg overflow-hidden shrink-0 border border-gray-800">
          {product.thumbnail && <Image src={product.thumbnail} alt="" fill className="object-cover" />}
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className="font-bold text-white text-lg truncate">{product.title}</h3>
            <Badge className={`hidden sm:flex ${status.color} border px-2 py-0.5 text-[10px] uppercase font-bold`}>
              {order.status}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
            <span className="flex items-center font-mono bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
              #{order.transactionId.slice(-8)}
            </span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span className="sm:hidden font-bold text-white">৳{order.amount}</span>
          </div>
        </div>

        {/* Right: Price & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-gray-800 pt-4 sm:pt-0 mt-2 sm:mt-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500 mb-0.5">Total</p>
            <p className="text-lg font-bold text-white">৳{order.amount}</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 font-bold transition-transform active:scale-95">
                View Details <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogTrigger>
            
            {/* --- MODAL CONTENT (The Vault) --- */}
            <DialogContent className="bg-[#111] border-gray-800 text-white sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription className="text-gray-400 truncate flex items-center gap-2">
                  ID: <span className="font-mono text-white bg-gray-900 px-1 rounded">{order.transactionId}</span>
                </DialogDescription>
              </DialogHeader>

              {/* Status & Date */}
              <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Status:</span>
                  <Badge className={`${status.color} border px-2 py-0.5 text-[10px] uppercase`}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-sm font-bold text-white">৳{order.amount}</div>
              </div>

              {/* HIDDEN CONTENT LOGIC */}
              <div className="mt-2 space-y-4">
                {order.status === "completed" ? (
                  <div className="bg-green-900/10 border border-green-500/20 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Key className="w-32 h-32 text-green-500" /></div>
                    
                    <div className="relative z-10 space-y-4">
                      <h4 className="font-bold text-green-400 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <CheckCircle2 className="w-4 h-4" /> Delivered Content
                      </h4>
                      
                      <div className="space-y-3">
                        {order.deliveredContent?.accountEmail && (
                          <div className="bg-black/60 p-3 rounded-lg border border-green-500/20 flex justify-between items-center group">
                            <div>
                              <p className="text-[10px] text-green-500/70 font-bold uppercase tracking-wider mb-0.5">Email / Username</p>
                              <code className="text-sm font-mono text-white">{order.deliveredContent.accountEmail}</code>
                            </div>
                            <button onClick={() => onCopy(order.deliveredContent?.accountEmail || "")} className="p-2 text-gray-500 hover:text-white"><Copy className="w-4 h-4" /></button>
                          </div>
                        )}
                        {order.deliveredContent?.accountPassword && (
                          <div className="bg-black/60 p-3 rounded-lg border border-green-500/20 flex justify-between items-center group">
                            <div>
                              <p className="text-[10px] text-green-500/70 font-bold uppercase tracking-wider mb-0.5">Password</p>
                              <code className="text-sm font-mono text-white">{order.deliveredContent.accountPassword}</code>
                            </div>
                            <button onClick={() => onCopy(order.deliveredContent?.accountPassword || "")} className="p-2 text-gray-500 hover:text-white"><Copy className="w-4 h-4" /></button>
                          </div>
                        )}
                        {order.deliveredContent?.downloadLink && (
                           <Button asChild className="w-full bg-green-600 hover:bg-green-500 text-white font-bold border-0">
                              <a href={order.deliveredContent.downloadLink} target="_blank">
                                 <Download className="w-4 h-4 mr-2"/> Download Resource
                              </a>
                           </Button>
                        )}
                        {order.deliveredContent?.accessNotes && (
                          <div className="text-xs text-green-200/80 bg-green-500/10 p-3 rounded border border-green-500/20 leading-relaxed">
                            <strong>Note:</strong> {order.deliveredContent.accessNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-6 text-center">
                    <Clock className="w-10 h-10 text-yellow-500/50 mx-auto mb-3" />
                    <h4 className="font-semibold text-yellow-400 mb-1">Verifying Payment</h4>
                    <p className="text-sm text-gray-400">
                      Your payment is being reviewed. This usually takes 10-30 minutes.
                    </p>
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