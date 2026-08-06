"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, CheckCircle, XCircle, Eye, Link as LinkIcon, User, Lock, 
  FileText, Zap, FileImage, Maximize2, ExternalLink, Copy, AlertTriangle, ShieldCheck 
} from "lucide-react";
import { toast } from "sonner";
import { OrderColumn } from "./columns";
import { ImageLightboxModal } from "@/components/ui/ImageLightboxModal";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

export function OrderActionModal({ order }: { order: OrderColumn }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Form States
  const [accountEmail, setAccountEmail] = useState(order.deliveredContent?.accountEmail || "");
  const [accountPassword, setAccountPassword] = useState(order.deliveredContent?.accountPassword || "");
  const [downloadLink, setDownloadLink] = useState(order.deliveredContent?.downloadLink || "");
  const [notes, setNotes] = useState(order.deliveredContent?.accessNotes || "");
  const [rejectionReason, setRejectionReason] = useState(order.paymentProof?.rejectionReason || "");
  const [adminNotes, setAdminNotes] = useState(order.paymentProof?.adminNotes || "");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const proof = order.paymentProof;

  async function handleUpdateStatus(status: "completed" | "declined", verificationStatus?: "verified" | "rejected") {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          verificationStatus: verificationStatus || (status === "completed" ? "verified" : "rejected"),
          rejectionReason: status === "declined" ? (rejectionReason || "Payment screenshot or transaction details mismatch") : undefined,
          adminNotes: adminNotes || undefined,
          deliveredContent: status === "completed" ? {
            accountEmail,
            accountPassword,
            downloadLink: downloadLink || undefined, 
            accessNotes: notes || undefined,
          } : undefined,
        }),
      });

      if (res.ok) {
        toast.success(`Order updated & marked as ${status}`);
        setOpen(false);
        router.refresh(); 
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={order.status === "pending" ? "default" : "outline"} 
            size="sm"
            className={order.status === "pending" 
              ? "bg-emerald-600 hover:bg-emerald-500 text-white border-0 h-8 text-xs font-bold shadow-md shadow-emerald-900/20" 
              : "border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent h-8 text-xs"
            }
          >
            {order.status === "pending" ? "Verify & Deliver" : <><Eye className="w-3 h-3 mr-1.5"/> Manage</>}
          </Button>
        </DialogTrigger>
        
        {/* Fixed Flexbox layout: header pinned top, footer pinned bottom, scrollable body */}
        <DialogContent className="sm:max-w-2xl md:max-w-3xl w-[94vw] max-h-[88vh] bg-[#111] border-gray-800 text-white shadow-2xl p-0 flex flex-col overflow-hidden rounded-2xl">
          
          {/* PINNED HEADER */}
          <DialogHeader className="px-5 py-4 border-b border-gray-800 bg-[#161616] shrink-0">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <span>Order #{order.transactionId || order._id.slice(-6)}</span>
              </DialogTitle>
              <Badge className={`text-[10px] uppercase font-bold px-2 py-0.5 border ${
                order.status === "completed"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : order.status === "declined"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}>
                {order.status}
              </Badge>
            </div>
            <DialogDescription className="text-gray-400 text-xs font-mono pt-1 truncate">
              Customer: <span className="text-white font-semibold">{order.user?.name || "Guest"}</span> ({order.user?.email}) • Phone: <span className="text-blue-400">{order.user?.phone || "N/A"}</span>
            </DialogDescription>
          </DialogHeader>

          {/* SCROLLABLE BODY CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
            
            {/* 1. Transaction & Payment Summary Banner */}
            <div className="p-3.5 bg-[#0a0a0a] rounded-xl border border-gray-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-mono font-bold mb-0.5">Payment Method</p>
                <p className="font-semibold text-white truncate">{order.paymentMethod || "Bkash / Manual"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-mono font-bold mb-0.5">Transaction ID</p>
                <p className="font-mono font-bold text-pink-400 truncate select-all">{order.transactionId || "N/A"}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                <p className="text-[10px] text-gray-500 uppercase font-mono font-bold mb-0.5">Total Amount</p>
                <p className="font-bold text-emerald-400 font-mono text-sm">৳{order.amount}</p>
              </div>
            </div>

            {/* 2. PAYMENT PROOF SCREENSHOT SECTION */}
            <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-pink-400" />
                  Payment Proof Screenshot
                </h4>
                {proof?.verificationStatus && (
                  <Badge className={`text-[10px] uppercase font-bold border px-2 py-0.5 ${
                    proof.verificationStatus === "verified"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : proof.verificationStatus === "rejected"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    Proof: {proof.verificationStatus}
                  </Badge>
                )}
              </div>

              {proof?.url ? (
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Image Preview Box */}
                  <div 
                    onClick={() => setLightboxOpen(true)}
                    className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-700 bg-black cursor-pointer group shrink-0 shadow-md"
                  >
                    <img 
                      src={proof.thumbnailUrl || proof.url} 
                      alt="Payment Screenshot" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-1">
                      <Maximize2 className="w-5 h-5" />
                      <span className="text-[10px] font-bold">Preview</span>
                    </div>
                  </div>

                  {/* Metadata & Quick Actions */}
                  <div className="space-y-2 text-xs text-gray-400 min-w-0 flex-1">
                    <div>
                      <p className="text-white font-mono font-bold truncate">{proof.originalName || "screenshot.png"}</p>
                      {proof.uploadedAt && (
                        <p className="text-[10px] text-gray-500 font-mono">
                          Uploaded: {new Date(proof.uploadedAt).toLocaleString()}
                        </p>
                      )}
                      {proof.fileSize && (
                        <p className="text-[10px] text-gray-500 font-mono">
                          Size: {(proof.fileSize / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLightboxOpen(true)}
                        className="h-7 text-[10px] border-gray-700 bg-gray-900 text-gray-300 hover:text-white"
                      >
                        <Maximize2 className="w-3 h-3 mr-1" /> Lightbox Preview
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(proof.url)}
                        className="h-7 text-[10px] border-gray-700 bg-gray-900 text-gray-300 hover:text-white"
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copy Link
                      </Button>
                      <Button
                        type="button"
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] border-gray-700 bg-gray-900 text-gray-300 hover:text-white"
                      >
                        <a href={proof.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" /> Open Original
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-950 border border-dashed border-gray-800 rounded-xl text-center">
                  <p className="text-xs text-gray-400">No payment screenshot attached by customer.</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Verification can be performed directly using Transaction ID ({order.transactionId}).</p>
                </div>
              )}

              {/* Rejection Input Section */}
              {showRejectForm && (
                <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl space-y-2 animate-in fade-in">
                  <Label className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Rejection Reason (Visible to Customer)
                  </Label>
                  <Input 
                    placeholder="e.g. Invalid Transaction ID, Screenshot blurry, or amount mismatched..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="bg-[#0a0a0a] border-red-500/40 text-xs h-9 text-white placeholder:text-gray-600"
                  />
                </div>
              )}
            </div>

            {/* 3. ORDER TIMELINE */}
            <OrderTimeline order={order as any} />

            {/* 4. AUTO-DELIVERY NOTICE */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 flex gap-3 items-start">
               <div className="mt-0.5 bg-blue-500/20 p-1.5 rounded-full shrink-0">
                  <Zap className="w-4 h-4 text-blue-400" />
               </div>
               <div className="space-y-0.5 text-xs">
                 <h4 className="font-bold text-blue-400 uppercase tracking-wide">Digital Credentials Auto-Fill</h4>
                 <p className="text-[11px] text-blue-200/70 leading-relaxed">
                   Leaving the <strong>Link</strong> & <strong>Notes</strong> fields EMPTY automatically delivers default credentials configured in Product settings.
                 </p>
               </div>
            </div>

            {/* 5. DELIVERED CONTENT OVERRIDE INPUTS */}
            <div className="space-y-3 bg-[#0a0a0a] border border-gray-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Digital Delivery Credentials
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-gray-500 uppercase font-bold">Username / Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                    <Input placeholder="Auto-filled" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="pl-8 bg-[#111] border-gray-700 h-9 text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-gray-500 uppercase font-bold">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                    <Input placeholder="Auto-filled" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} className="pl-8 bg-[#111] border-gray-700 h-9 text-xs" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                 <Label className="text-[10px] text-gray-500 uppercase font-bold">Override Access Link <span className="font-normal lowercase opacity-70">(optional)</span></Label>
                 <div className="relative">
                   <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                   <Input placeholder="Leave empty for system default..." value={downloadLink} onChange={(e) => setDownloadLink(e.target.value)} className="pl-8 bg-[#111] border-gray-700 h-9 text-xs focus:ring-yellow-500/30" />
                 </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-gray-500 uppercase font-bold">Override Access Notes <span className="font-normal lowercase opacity-70">(optional)</span></Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <Textarea placeholder="Leave empty for system default..." value={notes} onChange={(e) => setNotes(e.target.value)} className="pl-8 bg-[#111] border-gray-700 min-h-[45px] text-xs resize-none focus:ring-yellow-500/30" />
                </div>
              </div>
            </div>

          </div>

          {/* PINNED FOOTER WITH ACTION BUTTONS */}
          <DialogFooter className="px-5 py-3 border-t border-gray-800 bg-[#161616] shrink-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            {!showRejectForm ? (
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowRejectForm(true)} 
                disabled={loading} 
                className="w-full sm:w-auto border-red-900/40 text-red-400 hover:bg-red-950/50 hover:border-red-800 h-9 text-xs font-bold"
              >
                 <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject Payment
              </Button>
            ) : (
              <Button 
                type="button"
                variant="destructive" 
                onClick={() => handleUpdateStatus("declined", "rejected")} 
                disabled={loading} 
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white h-9 text-xs font-bold"
              >
                 {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <XCircle className="mr-1.5 h-3.5 w-3.5" />} Confirm Rejection
              </Button>
            )}

            <Button 
              type="button"
              onClick={() => handleUpdateStatus("completed", "verified")} 
              disabled={loading} 
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9 text-xs shadow-lg shadow-emerald-900/30"
            >
               {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
               Approve Payment & Deliver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal */}
      {proof?.url && (
        <ImageLightboxModal
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          imageUrl={proof.url}
          title={`Order #${order.transactionId} - Payment Screenshot`}
          fileName={proof.originalName || "payment-proof.png"}
        />
      )}
    </>
  );
}