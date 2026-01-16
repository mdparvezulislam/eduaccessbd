"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  ShoppingBag, ChevronRight, CheckCircle2, Clock, XCircle, Zap, Key, Download, Copy 
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
        <p className="text-gray-400 text-sm">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-gray-400"/> Recent Orders
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
  const product = typeof order.product === 'object' && order.product ? order.product : { title: "Unknown", thumbnail: "" };
  
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#111] border border-gray-800 hover:border-gray-700 transition-colors">
        
        {/* Thumbnail */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-14 h-14 bg-gray-900 rounded-lg overflow-hidden shrink-0 border border-gray-800">
            {product.thumbnail && <Image src={product.thumbnail} alt="" fill className="object-cover" />}
          </div>
          <div className="flex-1 min-w-0 sm:hidden">
             <h4 className="font-semibold text-white truncate text-sm">{product.title}</h4>
             <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] uppercase border ${status.color}`}>
                {order.status}
             </span>
          </div>
        </div>

        {/* Info (Desktop) */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold text-white truncate pr-2">{product.title}</h4>
            <Badge className={`${status.color} border px-2 py-0.5 text-[10px] uppercase shrink-0`}>
              {order.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-mono">#{order.transactionId.slice(-6)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
            <span>৳{order.amount}</span>
            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* View Details Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="w-full sm:w-auto text-gray-400 hover:text-white hover:bg-gray-800">
              <span className="sm:hidden mr-2">View Details</span> 
              <ChevronRight className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          
          <DialogContent className="bg-[#111] border-gray-800 text-white sm:max-w-lg w-[95%] rounded-xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription className="text-gray-400 truncate">ID: <span className="font-mono text-white">{order.transactionId}</span></DialogDescription>
            </DialogHeader>

            {/* THE VAULT (Hidden Content) */}
            <div className="mt-4 space-y-4">
              {order.status === "completed" ? (
                <div className="bg-green-900/10 border border-green-500/20 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Key className="w-32 h-32 text-green-500" /></div>
                  <div className="relative z-10 space-y-4">
                    <h4 className="font-bold text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Access Granted
                    </h4>
                    
                    <div className="space-y-3">
                      {order.deliveredContent?.accountEmail && (
                        <div className="bg-black/40 p-3 rounded-lg border border-green-500/10 flex justify-between items-center group">
                          <div>
                            <p className="text-[10px] text-green-500/70 font-bold uppercase tracking-wider">Email / Username</p>
                            <code className="text-sm font-mono text-gray-200">{order.deliveredContent.accountEmail}</code>
                          </div>
                          <button onClick={() => handleCopy(order.deliveredContent?.accountEmail || "")} className="p-2 text-gray-500 hover:text-white"><Copy className="w-4 h-4" /></button>
                        </div>
                      )}
                      {order.deliveredContent?.accountPassword && (
                        <div className="bg-black/40 p-3 rounded-lg border border-green-500/10 flex justify-between items-center group">
                          <div>
                            <p className="text-[10px] text-green-500/70 font-bold uppercase tracking-wider">Password</p>
                            <code className="text-sm font-mono text-gray-200">{order.deliveredContent.accountPassword}</code>
                          </div>
                          <button onClick={() => handleCopy(order.deliveredContent?.accountPassword || "")} className="p-2 text-gray-500 hover:text-white"><Copy className="w-4 h-4" /></button>
                        </div>
                      )}
                      {order.deliveredContent?.downloadLink && (
                         <Button asChild className="w-full bg-green-600 hover:bg-green-500 text-white font-bold">
                            <a href={order.deliveredContent.downloadLink} target="_blank">
                               <Download className="w-4 h-4 mr-2"/> Download Content
                            </a>
                         </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-6 text-center">
                  <Clock className="w-12 h-12 text-yellow-500/50 mx-auto mb-3" />
                  <h4 className="font-semibold text-yellow-400 mb-1">Verifying Payment</h4>
                  <p className="text-sm text-gray-400">Your payment is being reviewed.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}