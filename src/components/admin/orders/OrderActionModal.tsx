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
import { Loader2, CheckCircle, XCircle, Eye, Link as LinkIcon, User, Lock, FileText } from "lucide-react";
import { toast } from "sonner";

export function OrderActionModal({ order }: { order: any }) {
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
          deliveredContent: {
            accountEmail,
            accountPassword,
            downloadLink,
            accessNotes: notes,
          },
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
      console.error("Failed to update order", error);
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
            ? "bg-green-600 hover:bg-green-700 text-white border-0" 
            : "border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 bg-transparent"
          }
        >
          {order.status === "pending" ? "Verify & Deliver" : <><Eye className="w-3 h-3 mr-2"/> Details</>}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px] bg-[#111] border-gray-800 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Order Management</DialogTitle>
          <DialogDescription className="text-gray-400">
            Verify payment details and provide digital access to the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* 1. Transaction Info (Read Only) */}
          <div className="p-4 bg-[#0a0a0a] rounded-xl border border-gray-800 space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono font-bold text-white tracking-wide">{order.transactionId}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
               <span className="text-gray-500">Customer</span>
               <span className="text-gray-300">{order.user?.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-green-500 text-lg">৳{order.amount}</span>
            </div>
          </div>

          {/* 2. Delivery Inputs */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="w-1 h-4 bg-green-500 rounded-full"></span> Digital Delivery Content
            </h4>
            
            {/* Account Credentials */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ac_email" className="text-xs text-gray-500 uppercase">Username / Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="ac_email"
                    placeholder="user@email.com"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    className="pl-9 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ac_pass" className="text-xs text-gray-500 uppercase">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="ac_pass"
                    placeholder="Secret123"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    className="pl-9 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Download Link */}
            <div className="space-y-2">
               <Label htmlFor="link" className="text-xs text-gray-500 uppercase">Resource / Download Link</Label>
               <div className="relative">
                 <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                 <Input
                   id="link"
                   placeholder="https://drive.google.com/..."
                   value={downloadLink}
                   onChange={(e) => setDownloadLink(e.target.value)}
                   className="pl-9 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50"
                 />
               </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs text-gray-500 uppercase">Access Instructions</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Textarea
                  id="notes"
                  placeholder="e.g. Please do not change the password..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="pl-9 bg-[#0a0a0a] border-gray-700 text-white focus-visible:ring-green-500/50 min-h-[80px]"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0 flex-col-reverse sm:flex-row">
          <Button 
             variant="outline" 
             onClick={() => handleUpdateStatus("declined")}
             disabled={loading}
             className="border-red-900/30 text-red-500 hover:bg-red-950 hover:text-red-400 hover:border-red-900"
          >
             <XCircle className="mr-2 h-4 w-4" /> Decline Order
          </Button>

          <Button 
             onClick={() => handleUpdateStatus("completed")} 
             disabled={loading}
             className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-900/20"
          >
             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
             Complete & Send Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}