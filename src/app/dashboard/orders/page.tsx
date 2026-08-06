"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, ShoppingBag, Clock, CheckCircle2, XCircle, 
  Key, Copy, Loader2, Filter, Zap, Package, 
  Calendar as CalendarIcon, ExternalLink, ChevronLeft, ChevronRight,
  FileImage, Maximize2, UploadCloud, History, AlertTriangle
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
import { IOrder, IPaymentProof } from "@/types";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { PaymentProofUploader } from "@/components/ui/PaymentProofUploader";

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ⚡ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // ✅ Shows 10 orders per page

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

  // ⚡ FILTER LOGIC
  const filteredOrders = orders.filter((order) => {
    const firstItem = order.products?.[0];
    
    // Safely get title
    const productTitle = firstItem 
      ? (typeof firstItem.product === 'object' && firstItem.product 
          ? (firstItem.product as any).title 
          : firstItem.title || "Unknown Item")
      : "Unknown Item";
    
    const matchesSearch = 
      productTitle.toLowerCase().includes(search.toLowerCase()) || 
      (order.transactionId || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ⚡ PAGINATION LOGIC (The "Next 10" Magic)
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex); // ✅ This grabs exactly 10 items for the current view

  // Reset to page 1 if filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Handle Page Change (with Scroll to Top)
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white min-h-screen py-6 px-4 max-w-5xl mx-auto">
      
      {/* === HEADER === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111] p-6 rounded-2xl border border-white/5 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">My Orders</h1>
          <p className="text-sm text-gray-400 mt-1">Track purchase history and access your items</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search ID or Product..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#0a0a0a] border-white/10 text-white w-full h-10 placeholder:text-gray-600 focus:border-white/20 focus-visible:ring-1 focus-visible:ring-green-500/50 transition-all"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 bg-[#0a0a0a] text-gray-300 hover:bg-white/5 hover:text-white justify-between h-10 min-w-[110px]">
                <span className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> <span className="capitalize">{statusFilter}</span></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white w-40">
              <DropdownMenuItem onClick={() => setStatusFilter("all")} className="cursor-pointer hover:bg-white/10">All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")} className="cursor-pointer text-green-400 hover:bg-white/10">Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")} className="cursor-pointer text-yellow-400 hover:bg-white/10">Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")} className="cursor-pointer text-red-400 hover:bg-white/10">Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* === ORDERS LIST === */}
      <div className="space-y-4 min-h-[400px]"> 
        {filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-2xl bg-[#0a0a0a]"
          >
            <div className="bg-white/5 p-5 rounded-full mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">No orders found</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Try adjusting your search or filters to find what you are looking for.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {currentOrders.map((order, index) => (
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

      {/* === ⚡ PAGINATION CONTROLS === */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[200px] sm:max-w-none">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`h-9 w-9 rounded-lg text-sm transition-all font-mono border ${
                    currentPage === page
                      ? "bg-white text-black font-bold border-white shadow-lg shadow-white/10 scale-105"
                      : "bg-transparent text-gray-400 border-transparent hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-9 w-9 border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Page Info Text */}
          <div className="text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest">
            Showing {startIndex + 1} - {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length}
          </div>

        </div>
      )}

    </div>
  );
}

// === SUB-COMPONENT: Order Item ===
function OrderListItem({ order: initialOrder, index, onCopy }: { order: IOrder, index: number, onCopy: (t: string) => void }) {
  const [order, setOrder] = useState<IOrder>(initialOrder);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState("");
  const [showReupload, setShowReupload] = useState(false);
  const [reuploadProof, setReuploadProof] = useState<IPaymentProof | null>(null);
  const [submittingReupload, setSubmittingReupload] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const handleReuploadSubmit = async () => {
    if (!reuploadProof || !reuploadProof.url) {
      toast.error("Please upload a screenshot first");
      return;
    }
    setSubmittingReupload(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/payment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProof: reuploadProof }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("New payment screenshot submitted successfully!");
        setOrder(data.order);
        setShowReupload(false);
        setReuploadProof(null);
      } else {
        toast.error(data.error || "Failed to submit payment proof");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setSubmittingReupload(false);
    }
  };

  // Safe Product Access
  const firstItem = order.products?.[0];
  const productData = firstItem && typeof firstItem.product === 'object' && firstItem.product !== null 
    ? (firstItem.product as any) 
    : null;
  
  const title = productData?.title || firstItem?.title || "Unknown Item";
  
  // Safe Image Logic
  const thumbnail = productData?.thumbnail && productData.thumbnail.startsWith("http") 
    ? productData.thumbnail 
    : "https://placehold.co/100x100/111/333?text=No+Image"; 
    
  const extraCount = (order.products?.length || 0) - 1;

  // Status Config
  const statusConfig: any = {
    pending: { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: Clock },
    processing: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Zap },
    completed: { color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle2 },
    declined: { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
    cancelled: { color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: XCircle },
  };

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const proof = order.paymentProof;
  const history = order.paymentProofHistory || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#111] border border-white/5 hover:border-white/10 transition-all group shadow-sm hover:shadow-md">
        
        {/* Left: Thumbnail */}
        <div className="relative w-full sm:w-20 h-32 sm:h-20 bg-gray-900 rounded-lg overflow-hidden shrink-0 border border-white/5">
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          {extraCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white backdrop-blur-[1px]">
              +{extraCount} more
            </div>
          )}
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base truncate max-w-[200px] sm:max-w-md group-hover:text-green-400 transition-colors" title={title}>
              {title}
            </h3>
            {extraCount > 0 && <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded hidden sm:inline-block">+{extraCount} items</span>}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
            <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-gray-400 flex items-center gap-1">
              <span className="text-[10px] text-gray-600">ID:</span> #{order.transactionId?.slice(-6) || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3"/> {new Date(order.createdAt).toLocaleDateString()}
            </span>
            {/* Proof Status Pill */}
            {proof?.url && (
              <span className="flex items-center gap-1 text-[10px] text-pink-400 bg-pink-950/40 px-2 py-0.5 rounded-full border border-pink-500/20">
                <FileImage className="w-3 h-3" /> Proof Uploaded
              </span>
            )}
            {/* Mobile Status Badge */}
            <Badge className={`${status.color} border px-1.5 py-0 text-[9px] uppercase font-bold sm:hidden`}>
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Right: Status, Price & Action */}
        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 mt-2 sm:mt-0">
          
          {/* Desktop Status */}
          <div className="hidden sm:flex flex-col items-end gap-1">
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Status</span>
             <Badge className={`${status.color} border px-2 py-0.5 text-[10px] uppercase font-bold flex items-center gap-1`}>
               <StatusIcon className="w-3 h-3" /> {order.status}
             </Badge>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total</p>
            <p className="text-base font-bold text-white">৳{order.amount.toLocaleString()}</p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-white text-black hover:bg-gray-200 font-bold transition-transform active:scale-95 h-9 px-4">
                Details
              </Button>
            </DialogTrigger>
            
            {/* --- MODAL CONTENT --- */}
            <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-xl p-0 overflow-hidden shadow-2xl">
              <DialogHeader className="p-5 border-b border-white/10 bg-[#161616]">
                <DialogTitle className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-wider">Order Details & Proof</span>
                  <Badge className={`${status.color} border px-2 py-0.5 text-[10px]`}>{order.status}</Badge>
                </DialogTitle>
                <DialogDescription className="text-gray-500 text-xs font-mono pt-1">
                  TrxID: {order.transactionId} • Method: {order.paymentMethod}
                </DialogDescription>
              </DialogHeader>

              <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-hide">
                
                {/* 1. PAYMENT PROOF CARD */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-pink-400" />
                      Payment Screenshot Proof
                    </h4>
                    {proof?.verificationStatus && (
                      <Badge className={`text-[10px] uppercase font-bold border px-2 py-0.5 ${
                        proof.verificationStatus === "verified"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : proof.verificationStatus === "rejected"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {proof.verificationStatus}
                      </Badge>
                    )}
                  </div>

                  {proof?.url ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div 
                        onClick={() => {
                          setLightboxUrl(proof.url);
                          setLightboxOpen(true);
                        }}
                        className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20 bg-black cursor-pointer group shrink-0"
                      >
                        <img 
                          src={proof.thumbnailUrl || proof.url} 
                          alt="Payment screenshot" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-gray-400 min-w-0 flex-1">
                        <p className="text-white font-mono font-medium truncate">
                          {proof.originalName || "payment-proof.png"}
                        </p>
                        {proof.uploadedAt && (
                          <p className="text-[10px] text-gray-500 font-mono">
                            Uploaded: {new Date(proof.uploadedAt).toLocaleString()}
                          </p>
                        )}
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setLightboxUrl(proof.url);
                            setLightboxOpen(true);
                          }}
                          className="h-7 text-[10px] px-2.5 mt-1 border-white/10 bg-white/5 text-gray-300 hover:text-white"
                        >
                          <Maximize2 className="w-3 h-3 mr-1" /> View Screenshot
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-white/[0.02] border border-dashed border-white/10 rounded-lg">
                      <p className="text-xs text-gray-400 font-medium">No payment screenshot attached.</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Uploading proof speeds up manual verification.</p>
                    </div>
                  )}

                  {/* Rejection Notice Banner */}
                  {proof?.verificationStatus === "rejected" && (
                    <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3 text-xs text-red-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-red-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Payment Screenshot Rejected</span>
                      </div>
                      {proof.rejectionReason && (
                        <p className="text-[11px] text-red-200/90 leading-relaxed">
                          Reason: {proof.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Toggle Re-upload Button (if rejected or missing & order not completed) */}
                  {order.status !== "completed" && proof?.verificationStatus !== "verified" && (
                    <div className="pt-2 border-t border-white/5">
                      {!showReupload ? (
                        <Button 
                          type="button" 
                          onClick={() => setShowReupload(true)}
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold h-9 text-xs"
                        >
                          <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                          {proof?.url ? "Upload New Screenshot" : "Upload Payment Screenshot"}
                        </Button>
                      ) : (
                        <div className="space-y-3 pt-1 border-t border-white/10">
                          <PaymentProofUploader 
                            value={reuploadProof} 
                            onChange={setReuploadProof} 
                          />
                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowReupload(false)}
                              className="w-1/2 h-9 text-xs border-white/10 bg-transparent text-gray-400 hover:text-white"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="button" 
                              onClick={handleReuploadSubmit} 
                              disabled={submittingReupload || !reuploadProof}
                              className="w-1/2 h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              {submittingReupload ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Submit Proof"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Proof History Toggle */}
                  {history.length > 0 && (
                    <div className="pt-2">
                      <button 
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-[10px] text-gray-400 hover:text-white font-mono flex items-center gap-1 underline"
                      >
                        <History className="w-3 h-3" />
                        {showHistory ? "Hide Upload History" : `View Upload History (${history.length})`}
                      </button>

                      {showHistory && (
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
                          {history.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-black/40 p-2 rounded text-[11px] border border-white/5">
                              <span className="text-gray-300 font-mono truncate max-w-[150px]">{item.originalName || "proof.png"}</span>
                              <span className="text-[9px] text-gray-500">{new Date(item.uploadedAt).toLocaleDateString()}</span>
                              <Badge className="text-[9px] uppercase px-1.5 py-0 bg-gray-800 text-gray-400">{item.verificationStatus}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* 2. ORDER TIMELINE */}
                <OrderTimeline order={order} />

                {/* 3. PRODUCT LIST */}
                <div className="space-y-3">
                   <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Ordered Items</h4>
                   {order.products?.map((item, i) => (
                     <div key={i} className="flex justify-between items-center text-sm border border-white/5 bg-white/5 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                           <div className="bg-gray-800 p-2 rounded text-gray-400"><Package className="w-4 h-4"/></div>
                           <div>
                             <p className="text-gray-200 font-medium truncate max-w-[160px]">{item.title || "Item"}</p>
                             <p className="text-[10px] text-gray-500 uppercase font-bold">{item.variant || "Standard"} <span className="mx-1">•</span> Qty: {item.quantity}</p>
                           </div>
                        </div>
                        <span className="font-mono text-gray-400 text-xs">৳{(item.price * item.quantity).toLocaleString()}</span>
                     </div>
                   ))}
                </div>

                {/* 4. DELIVERED CONTENT */}
                {order.status === "completed" && order.deliveredContent ? (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <h4 className="font-bold text-green-400 flex items-center gap-2 text-xs uppercase tracking-wider border-b border-green-500/10 pb-2 mb-2">
                      <Key className="w-3.5 h-3.5" /> Access Credentials
                    </h4>
                    
                    <div className="space-y-3">
                      {order.deliveredContent.accountEmail && (
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Username / Email</p>
                          <div className="bg-black/40 p-2.5 rounded border border-green-500/10 flex justify-between items-center group">
                            <code className="text-xs text-white truncate block select-all">{order.deliveredContent.accountEmail}</code>
                            <button onClick={() => onCopy(order.deliveredContent?.accountEmail || "")} className="text-gray-500 hover:text-white transition opacity-50 group-hover:opacity-100"><Copy className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      )}
                      
                      {order.deliveredContent.accountPassword && (
                        <div>
                          <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Password</p>
                          <div className="bg-black/40 p-2.5 rounded border border-green-500/10 flex justify-between items-center group">
                            <code className="text-xs text-white truncate block select-all">{order.deliveredContent.accountPassword}</code>
                            <button onClick={() => onCopy(order.deliveredContent?.accountPassword || "")} className="text-gray-500 hover:text-white transition opacity-50 group-hover:opacity-100"><Copy className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      )}

                      {order.deliveredContent.downloadLink && (
                         <div className="pt-2">
                            <Button asChild className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-10 text-xs shadow-lg shadow-green-900/20">
                               <a href={order.deliveredContent.downloadLink.split('\n')[0].split(': ').pop()} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3.5 h-3.5 mr-2"/> Access Content Now
                               </a>
                            </Button>
                         </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-6 text-center">
                    <Loader2 className="w-8 h-8 text-yellow-500/50 mx-auto mb-3 animate-spin" />
                    <p className="text-sm font-bold text-yellow-200 uppercase tracking-wide">Processing Payment Verification</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Lightbox Modal */}
          <ImageLightboxModal 
            isOpen={lightboxOpen} 
            onClose={() => setLightboxOpen(false)} 
            imageUrl={lightboxUrl} 
            title={`Order #${order.transactionId} - Payment Screenshot`}
          />

        </div>
      </div>
    </motion.div>
  );
}