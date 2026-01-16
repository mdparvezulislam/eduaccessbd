"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  ShoppingBag, ChevronRight, CheckCircle2, Clock, XCircle, Zap, Key, Download, Copy, Package
} from "lucide-react";
import { toast } from "sonner";
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
import { IOrder } from "@/types";
import { motion } from "framer-motion";

export default function RecentOrders({ orders }: { orders: IOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-800 rounded-xl bg-[#111]">
        <div className="bg-gray-800/50 p-4 rounded-full mb-3">
          <ShoppingBag className="w-6 h-6 text-gray-500" />
        </div>
        <p className="text-gray-400 text-sm">No recent orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 px-1">
        <ShoppingBag className="w-4 h-4 text-green-500"/> Recent Activity
      </h2>
      <div className="space-y-3">
        {orders.map((order, index) => (
          <OrderCard key={order._id} order={order} index={index} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, index }: { order: IOrder, index: number }) {
  // Safe Access to Product
  const firstItem = order.products?.[0];
  const productData = firstItem && typeof firstItem.product === 'object' ? (firstItem.product as any) : null;
  
  const title = productData?.title || firstItem?.title || "Unknown Item";
  const thumbnail = productData?.thumbnail || "/placeholder.png"; 
  const extraCount = (order.products?.length || 0) - 1;

  const statusConfig = {
    pending: { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
    processing: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Zap },
    completed: { color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle2 },
    declined: { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
    cancelled: { color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: XCircle },
  };

  const status = statusConfig[order.status] || statusConfig.pending;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <div className="flex items-center gap-4 p-3 rounded-xl bg-[#111] border border-gray-800 hover:border-gray-700 transition-colors group">
        
        {/* Thumbnail */}
        <div className="relative w-12 h-12 bg-gray-900 rounded-lg overflow-hidden shrink-0 border border-gray-800">
          <Image src={thumbnail} alt={title} fill className="object-cover" />
          {extraCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-bold text-white backdrop-blur-[1px]">
              +{extraCount}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <h4 className="font-semibold text-white truncate text-sm pr-2 max-w-[200px]">{title}</h4>
            <Badge className={`${status.color} border px-1.5 py-0 text-[9px] uppercase shrink-0`}>
              {order.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="font-mono bg-gray-900 px-1 rounded">#{order.transactionId.slice(-4)}</span>
            <span>•</span>
            <span className="text-white font-medium">৳{order.amount}</span>
            <span>•</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* View Details Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-white hover:bg-gray-800 rounded-full">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          
          <DialogContent className="bg-[#111] border-gray-800 text-white sm:max-w-md w-[95%] rounded-xl p-0 overflow-hidden">
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
              
              {/* Product List */}
              <div className="space-y-3">
                 {order.products?.map((item, i) => (
                   <div key={i} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0">
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

              {/* THE VAULT (Hidden Content) */}
              <div className="space-y-4">
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
                          <button onClick={() => handleCopy(order.deliveredContent?.accountEmail || "")} className="text-gray-500 hover:text-white transition"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                      
                      {/* Password */}
                      {order.deliveredContent?.accountPassword && (
                        <div className="bg-black/40 p-2.5 rounded border border-green-500/10 flex justify-between items-center">
                          <div className="overflow-hidden">
                            <p className="text-[9px] text-gray-500 uppercase font-bold">Password</p>
                            <code className="text-xs text-white truncate block">{order.deliveredContent.accountPassword}</code>
                          </div>
                          <button onClick={() => handleCopy(order.deliveredContent?.accountPassword || "")} className="text-gray-500 hover:text-white transition"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      )}

                      {/* Link */}
                      {order.deliveredContent?.downloadLink && (
                         <Button asChild className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-9 text-xs">
                            <a href={order.deliveredContent.downloadLink} target="_blank">
                               <Download className="w-3.5 h-3.5 mr-2"/> Download Resource
                            </a>
                         </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 text-center">
                    <Clock className="w-8 h-8 text-yellow-500/50 mx-auto mb-2" />
                    <p className="text-sm font-medium text-yellow-200">Verifying Payment</p>
                    <p className="text-[11px] text-gray-500 mt-1">Please wait for admin verification (10-30 mins).</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}