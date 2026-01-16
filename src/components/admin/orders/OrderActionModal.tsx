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
import { 
  Loader2, CheckCircle, XCircle, Eye, Link as LinkIcon, User, Lock, FileText, Zap 
} from "lucide-react";
import { toast } from "sonner";
import { OrderColumn } from "./columns";

export function OrderActionModal({ order }: { order: OrderColumn }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [accountEmail, setAccountEmail] = useState(order.deliveredContent?.accountEmail || "");
  const [accountPassword, setAccountPassword] = useState(order.deliveredContent?.accountPassword || "");
  const [downloadLink, setDownloadLink] = useState(order.deliveredContent?.downloadLink || "");
  const [notes, setNotes] = useState(order.deliveredContent?.accessNotes || "");

  async function handleUpdateStatus(status: "completed" | "declined") {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          deliveredContent: status === "completed" ? {
            accountEmail,
            accountPassword,
            // ⚡ IF EMPTY, Send undefined so Backend uses Auto-Fill
            downloadLink: downloadLink || undefined, 
            accessNotes: notes || undefined,
          } : undefined,
        }),
      });

      if (res.ok) {
        toast.success(`Order marked as ${status}`);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={order.status === "pending" ? "default" : "outline"} 
          size="sm"
          className={order.status === "pending" 
            ? "bg-green-600 hover:bg-green-700 text-white border-0 h-8 text-xs font-bold" 
            : "border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent h-8 text-xs"
          }
        >
          {order.status === "pending" ? "Verify & Deliver" : <><Eye className="w-3 h-3 mr-2"/> Manage</>}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px] bg-[#111] border-gray-800 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
             Order #{order.transactionId}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs">
            Verify payment and confirm digital delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          
          {/* 1. Transaction Info */}
          <div className="p-3 bg-[#0a0a0a] rounded-lg border border-gray-800 grid grid-cols-2 gap-4">
             <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Customer</p>
                <p className="text-sm text-white truncate">{order.user?.email}</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                <p className="text-sm font-bold text-green-500">৳{order.amount}</p>
             </div>
          </div>

          {/* ⚡ 2. AUTO-DELIVERY NOTICE */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 items-start">
             <div className="mt-0.5 bg-blue-500/20 p-1 rounded-full">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
             </div>
             <div className="space-y-0.5">
               <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wide">System Auto-Fill Active</h4>
               <p className="text-[11px] text-blue-200/70 leading-relaxed">
                 Leave the <strong>Link</strong> & <strong>Notes</strong> fields EMPTY to use the default links from the Product settings (Monthly/Yearly). Fill them only to override.
               </p>
             </div>
          </div>

          {/* 3. Inputs */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-gray-500 uppercase font-bold">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <Input placeholder="Auto-filled" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="pl-8 bg-[#0a0a0a] border-gray-700 h-9 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-gray-500 uppercase font-bold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <Input placeholder="Auto-filled" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} className="pl-8 bg-[#0a0a0a] border-gray-700 h-9 text-xs" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
               <Label className="text-[10px] text-gray-500 uppercase font-bold">Override Link <span className="font-normal lowercase opacity-70">(optional)</span></Label>
               <div className="relative">
                 <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                 <Input placeholder="Leave empty for system default..." value={downloadLink} onChange={(e) => setDownloadLink(e.target.value)} className="pl-8 bg-[#0a0a0a] border-gray-700 h-9 text-xs focus:ring-yellow-500/30" />
               </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-gray-500 uppercase font-bold">Override Notes <span className="font-normal lowercase opacity-70">(optional)</span></Label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                <Textarea placeholder="Leave empty for system default..." value={notes} onChange={(e) => setNotes(e.target.value)} className="pl-8 bg-[#0a0a0a] border-gray-700 min-h-[50px] text-xs resize-none focus:ring-yellow-500/30" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex-col-reverse sm:flex-row border-t border-gray-800 pt-3">
          <Button variant="outline" onClick={() => handleUpdateStatus("declined")} disabled={loading} className="border-red-900/30 text-red-500 hover:bg-red-950/50 hover:border-red-800 h-9 text-xs">
             <XCircle className="mr-1.5 h-3.5 w-3.5" /> Decline
          </Button>
          <Button onClick={() => handleUpdateStatus("completed")} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold h-9 text-xs">
             {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="mr-1.5 h-3.5 w-3.5" />}
             Confirm & Deliver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}