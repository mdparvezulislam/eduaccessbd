"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Loader2, Plus, Tag, Trash2, Edit, Calendar, Hash, Percent, DollarSign, X
} from "lucide-react";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICoupon } from "@/models/Coupon"; // Ensure this path matches your model location

// Type adjustment for frontend usage
type CouponUI = Omit<ICoupon, "expirationDate"> & { _id: string, expirationDate?: string };

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<CouponUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "fixed",
    discountAmount: "",
    expirationDate: "",
    usageLimit: "",
    isActive: true
  });

  // --- Fetch Coupons ---
  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) setCoupons(data.coupons);
    } catch (e) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // --- Handlers ---
  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "fixed",
      discountAmount: "",
      expirationDate: "",
      usageLimit: "",
      isActive: true
    });
    setEditingId(null);
  };

  const handleEdit = (coupon: CouponUI) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: String(coupon.discountAmount),
      expirationDate: coupon.expirationDate ? new Date(coupon.expirationDate).toISOString().split('T')[0] : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      isActive: coupon.isActive
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if(res.ok) {
        setCoupons(prev => prev.filter(c => c._id !== id));
        toast.success("Coupon deleted");
      }
    } catch(e) {
      toast.error("Failed to delete");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        discountAmount: Number(formData.discountAmount),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      };

      const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editingId ? "Coupon Updated" : "Coupon Created");
        fetchCoupons();
        setIsOpen(false);
        resetForm();
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="text-green-500" /> Coupon Manager
          </h1>
          <p className="text-sm text-gray-400">Create and manage discount codes</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if(!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-gray-200 font-bold">
              <Plus className="w-4 h-4 mr-2" /> Create New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              
              {/* Code */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400 uppercase">Coupon Code</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <Input 
                    placeholder="e.g. SUMMER2025" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="pl-9 bg-black border-white/10 uppercase font-mono tracking-widest"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400 uppercase">Type</Label>
                  <Select 
                    value={formData.discountType} 
                    onValueChange={(v) => setFormData({...formData, discountType: v})}
                  >
                    <SelectTrigger className="bg-black border-white/10 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                      <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400 uppercase">Amount</Label>
                  <div className="relative">
                    {formData.discountType === "fixed" 
                      ? <span className="absolute left-3 top-2.5 text-gray-500 font-bold">৳</span>
                      : <Percent className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    }
                    <Input 
                      type="number"
                      placeholder="0" 
                      value={formData.discountAmount} 
                      onChange={e => setFormData({...formData, discountAmount: e.target.value})}
                      className="pl-9 bg-black border-white/10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expiry */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400 uppercase">Expiration (Optional)</Label>
                  <Input 
                    type="date"
                    value={formData.expirationDate} 
                    onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                    className="bg-black border-white/10 text-gray-400 block"
                  />
                </div>

                {/* Usage Limit */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400 uppercase">Usage Limit (Optional)</Label>
                  <Input 
                    type="number"
                    placeholder="Unlimited" 
                    value={formData.usageLimit} 
                    onChange={e => setFormData({...formData, usageLimit: e.target.value})}
                    className="bg-black border-white/10"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                <Label className="text-sm font-bold">Active Status</Label>
                <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={c => setFormData({...formData, isActive: c})} 
                />
              </div>

              <Button disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : (editingId ? "Update Coupon" : "Create Coupon")}
              </Button>

            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- List --- */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-500 w-8 h-8" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <motion.div 
              key={coupon._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-xl border relative overflow-hidden group ${coupon.isActive ? "bg-[#111] border-white/10" : "bg-red-950/10 border-red-900/30 opacity-70"}`}
            >
              
              {/* Background Decoration */}
              <div className="absolute -right-4 -top-4 bg-white/5 w-24 h-24 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />

              <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                  <h3 className="text-xl font-mono font-bold tracking-widest text-white">{coupon.code}</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">
                    {coupon.discountType === "percentage" ? `${coupon.discountAmount}% OFF` : `৳${coupon.discountAmount} OFF`}
                  </p>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${coupon.isActive ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"}`}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-400 relative z-10">
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span className="text-white font-mono">{coupon.usedCount} / {coupon.usageLimit || "∞"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className={coupon.expirationDate && new Date(coupon.expirationDate) < new Date() ? "text-red-400 font-bold" : "text-white"}>
                    {coupon.expirationDate ? new Date(coupon.expirationDate).toLocaleDateString() : "Never"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5 relative z-10">
                <Button onClick={() => handleEdit(coupon)} size="sm" variant="outline" className="flex-1 border-white/10 hover:bg-white hover:text-black h-8 text-xs">
                  <Edit className="w-3 h-3 mr-1.5" /> Edit
                </Button>
                <Button onClick={() => handleDelete(coupon._id)} size="sm" variant="destructive" className="h-8 w-8 p-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

            </motion.div>
          ))}
          
          {coupons.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
              <Tag className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No coupons found. Create one to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}