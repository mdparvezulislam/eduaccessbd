"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { 
  Loader2, ArrowRight, Lock, User, Wallet, ShieldCheck, 
  Tag, Gift, AlertTriangle, CheckCircle2,
  Copy
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ⚡ Payment Configuration
const PAYMENT_METHODS = {
  bkash: {
    id: "bkash",
    name: "Bkash Personal",
    number: "01858957312",
    color: "text-pink-500",
    border: "peer-data-[state=checked]:border-pink-500",
    bg: "peer-data-[state=checked]:bg-pink-950/30"
  },
  nagad: {
    id: "nagad",
    name: "Nagad Personal",
    number: "01857887025",
    color: "text-orange-500",
    border: "peer-data-[state=checked]:border-orange-500",
    bg: "peer-data-[state=checked]:bg-orange-950/30"
  }
};

type PaymentMethodKey = keyof typeof PAYMENT_METHODS;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, totalAmount, clearCart } = useCart();
  
  // States
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>("bkash");
  
  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    transactionId: "",
  });

  // Derived Totals
  const finalTotal = Math.max(0, totalAmount - discount);
  const isFree = finalTotal === 0;

  // Auto-Fill User Info
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
        phone: (session.user as any).phone || "",
      }));
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    toast.success("Number copied!", { position: "top-center", duration: 2000 });
  };

  // ⚡ COUPON HANDLER
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidating(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error (Invalid JSON)");
      }

      const data = await res.json();
      
      if (data.valid) {
        let discAmt = 0;
        if (data.coupon.discountType === "percentage") {
          discAmt = Math.round((totalAmount * data.coupon.discountAmount) / 100);
        } else {
          discAmt = data.coupon.discountAmount;
        }
        setDiscount(discAmt);
        setAppliedCoupon(data.coupon.code);
        toast.success(`Coupon Applied! Saved ৳${discAmt}`);
      } else {
        setDiscount(0);
        setAppliedCoupon(null);
        toast.error(data.message || "Invalid Coupon");
      }
    } catch (e) {
      toast.error("Failed to apply coupon");
    } finally {
      setIsValidating(false);
    }
  };

  // ⚡ ORDER SUBMISSION
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone || !formData.email) return toast.error("Please fill all contact details");
    
    // If NOT free, require TrxID (Sender number removed as requested)
    if (!isFree) {
      if (!formData.transactionId) return toast.error("Transaction ID is required");
    }

    setLoading(true);

    try {
      const payload = {
        contact: { name: formData.name, phone: formData.phone, email: formData.email },
        payment: {
          method: isFree ? "Free Checkout" : PAYMENT_METHODS[paymentMethod].name,
          senderNumber: "N/A", // Default value since field is removed
          transactionId: isFree ? "FREE" : formData.transactionId,
          amount: finalTotal
        },
        items: cart.map(item => ({
          productId: item.cartId || item.productId, // Fallback for ID
          quantity: item.quantity,
          validity: item.validity, 
          price: item.price
        })),
        couponCode: appliedCoupon
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server Error. Please try again.");
      }

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order failed");
      }

      // Auto login new users
      if (data.isNewUser) {
        await signIn("credentials", { redirect: false, email: formData.email, password: formData.email });
      }

      toast.success(isFree ? "Access Granted Successfully!" : "Order Placed Successfully!");
      clearCart();
      router.push(`/dashboard/orders`); 

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col bg-black text-white gap-2">
         <h2 className="text-xl font-bold">Your cart is empty</h2>
         <Button onClick={() => router.push("/")} className="bg-white text-black hover:bg-gray-200 mt-2">Go Shopping</Button>
      </div>
    );
  }

  const activePay = PAYMENT_METHODS[paymentMethod];

  return (
    <div className="bg-black min-h-screen py-4 text-white font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Compact Header */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">Secure Checkout</h1>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1 uppercase tracking-wider">
            <Lock className="w-3 h-3" /> Encrypted Transaction
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* === LEFT COLUMN: User & Payment Inputs === */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* 1. Contact Info */}
            <Card className="border border-white/10 bg-[#0a0a0a]">
              <CardHeader className="py-3 px-4 border-b border-white/5">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wide">
                  <User className="w-4 h-4 text-white/70" /> Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-gray-400 font-bold uppercase">Full Name</Label>
                  <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="h-9 bg-[#111] border-white/10 text-white text-sm focus:border-white/30" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-gray-400 font-bold uppercase">Phone</Label>
                    <Input name="phone" placeholder="017..." value={formData.phone} onChange={handleChange} className="h-9 bg-[#111] border-white/10 text-white text-sm focus:border-white/30" required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-gray-400 font-bold uppercase">Email</Label>
                    <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className="h-9 bg-[#111] border-white/10 text-white text-sm focus:border-white/30" required readOnly={!!session?.user?.email} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Payment Method (Conditional) */}
            {isFree ? (
              <div className="bg-green-900/10 border border-green-500/30 p-4 rounded-xl flex items-start gap-4 animate-in fade-in">
                 <div className="bg-green-500/20 p-2 rounded-full mt-1"><Gift className="w-5 h-5 text-green-400"/></div>
                 <div>
                    <h3 className="text-sm font-bold text-green-400 uppercase tracking-wide">Free Order</h3>
                    <p className="text-xs text-green-200/70 mt-1">No payment required. You will receive instant access.</p>
                 </div>
              </div>
            ) : (
              <Card className="border border-white/10 bg-[#0a0a0a]">
                <CardHeader className="py-3 px-2 border-b border-white/5 bg-white/5">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wide">
                    <Wallet className="w-4 h-4 text-white/70" /> Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  
                  {/* Method Selector */}
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(val) => setPaymentMethod(val as PaymentMethodKey)} 
                    className="grid grid-cols-2 gap-3"
                  >
                    {Object.values(PAYMENT_METHODS).map((method) => (
                      <div key={method.id}>
                        <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                        <Label htmlFor={method.id} className={`flex flex-col items-center justify-center gap-1 h-16 rounded-lg border border-white/10 bg-[#111] hover:bg-white/5 cursor-pointer transition-all ${method.border} ${method.bg}`}>
                          <span className={`font-bold text-sm ${method.id === paymentMethod ? method.color : "text-gray-300"}`}>{method.name}</span>
                          <span className="text-[9px] text-gray-500 uppercase tracking-wider">Send Money</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Number Display */}
                  <div className="bg-[#111] border border-white/10 p-3 rounded-lg flex items-center justify-between gap-2">
                     <div className="min-w-0">
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Send Money To (Personal)</p>
                        <p className={`text-lg sm:text-xl font-mono font-bold tracking-wider truncate ${activePay.color}`}>
                          {activePay.number}
                        </p>
                     </div>
                     <Button type="button" size="sm" variant="secondary" onClick={() => copyNumber(activePay.number)} className="h-8 px-3 text-[10px] font-bold bg-white text-black hover:bg-gray-200 border-0 uppercase tracking-wide">
                        <Copy className="w-3 h-3 mr-1.5" /> Copy
                     </Button>
                  </div>

                  {/* TrxID Input (Sender Number REMOVED) */}
                  <div className="space-y-1.5">
                     <Label className="text-white text-[11px] font-bold uppercase flex justify-between items-center">
                       Transaction ID (TrxID) <span className="text-red-500 text-[9px] lowercase">*required</span>
                     </Label>
                     <Input 
                       name="transactionId" 
                       placeholder="e.g. 9H7S6K2..." 
                       value={formData.transactionId} 
                       onChange={handleChange} 
                       className="bg-[#111] border-white/20 h-10 text-base focus-visible:ring-1 focus-visible:ring-green-500 font-mono text-center tracking-widest text-white placeholder:text-gray-600" 
                       required 
                     />
                  </div>

                  {/* Bangla Warning */}
                  <div className="flex gap-3 text-yellow-400/90 bg-yellow-900/10 p-3 rounded-lg border border-yellow-700/30 text-xs">
                     <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                     <div className="leading-relaxed">
                       <span className="font-bold block mb-0.5 text-yellow-200">গুরুত্বপূর্ণ নোটিশ (Notice):</span>
                       আপনার পেমেন্ট ভেরিফাই করার জন্য অনুগ্রহ করে অপেক্ষা করুন। 
                       <span className="text-white font-bold block mt-0.5"> ১২ ঘন্টার মধ্যে অর্ডার কনফার্ম হবে।</span>
                     </div>
                  </div>

                </CardContent>
              </Card>
            )}
          </div>

          {/* === RIGHT COLUMN: Order Summary === */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <Card className="border border-white/10 bg-[#0a0a0a] shadow-xl">
                <CardHeader className="py-3 px-4 border-b border-white/5 bg-white/5">
                  <CardTitle className="text-sm font-bold text-white flex justify-between items-center uppercase tracking-wide">
                    Order Summary
                    <span className="text-[10px] text-black bg-white px-1.5 py-0.5 rounded font-bold">{cart.length} Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  
                  {/* Items List */}
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-hide mb-4">
                    {cart.map((item) => (
                      <div key={item.cartId} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                        <div className="flex gap-2 items-start">
                           <span className="text-gray-500 font-mono">{item.quantity}x</span>
                           <div className="flex flex-col">
                             <span className="text-gray-200 line-clamp-1">{item.name}</span>
                             <span className="text-[9px] text-green-400 uppercase">{item.validity || "Standard"}</span>
                           </div>
                        </div>
                        <span className="font-mono text-gray-300">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Coupon Input */}
                  <div className="flex gap-2 mb-4 pt-2 border-t border-white/10">
                    <div className="relative flex-1">
                      <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                      <Input 
                        placeholder="Coupon Code" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value)} 
                        className="pl-8 h-9 bg-[#111] border-white/10 text-xs uppercase text-white placeholder:text-gray-600 focus:border-white/30"
                        disabled={!!appliedCoupon}
                      />
                    </div>
                    {appliedCoupon ? (
                      <Button type="button" onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(""); }} size="sm" variant="destructive" className="h-9 px-3 text-[10px] font-bold">REMOVE</Button>
                    ) : (
                      <Button type="button" onClick={handleApplyCoupon} disabled={isValidating || !couponCode} size="sm" variant="outline" className="h-9 px-3 border-white/10 hover:bg-white hover:text-black text-[10px] font-bold">
                        {isValidating ? <Loader2 className="w-3 h-3 animate-spin"/> : "APPLY"}
                      </Button>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>৳{totalAmount.toLocaleString()}</span></div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-400 font-bold"><span>Discount</span><span>- ৳{discount}</span></div>
                    )}
                    <div className="flex justify-between items-end pt-3 border-t border-white/10 mt-3">
                       <span className="text-sm text-white font-bold uppercase">Total Payable</span>
                       <span className="text-xl font-bold text-green-400 font-mono">৳{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button type="submit" disabled={loading} className={`w-full mt-5 h-10 text-sm font-bold transition-all active:scale-[0.98] uppercase tracking-wide ${isFree ? "bg-green-600 hover:bg-green-700 text-white" : "bg-white text-black hover:bg-gray-200"}`}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                      isFree ? <><CheckCircle2 className="w-4 h-4 mr-2"/> Activate Now</> : 
                      <>Confirm Order <ArrowRight className="ml-2 h-4 w-4" /></>
                    }
                  </Button>
                  
                  <div className="flex justify-center items-center gap-1.5 mt-3 text-[9px] text-gray-500">
                    <ShieldCheck className="w-3 h-3" /> 256-bit Secure Payment
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}