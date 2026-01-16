"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { 
  Loader2, ArrowRight, Lock, User, Phone, Mail, 
  Copy, AlertTriangle, Wallet, ShieldCheck
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ⚡ CONFIG: Correct Numbers
const PAYMENT_METHODS = {
  bkash: {
    id: "bkash",
    name: "Bkash Personal",
    number: "01858957312",
    color: "text-pink-500",
    border: "peer-data-[state=checked]:border-pink-600",
    bg: "peer-data-[state=checked]:bg-pink-500/10"
  },
  nagad: {
    id: "nagad",
    name: "Nagad Personal",
    number: "01857887025",
    color: "text-orange-500",
    border: "peer-data-[state=checked]:border-orange-600",
    bg: "peer-data-[state=checked]:bg-orange-500/10"
  }
};

type PaymentMethodKey = keyof typeof PAYMENT_METHODS;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  // ⚡ State for Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>("bkash");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    transactionId: "",
  });

  // Auto-Fill
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
    toast.success("Number copied!", { duration: 1500 });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email) return toast.error("Fill contact details");
    if (!formData.transactionId) return toast.error("Transaction ID is required");

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: { name: formData.name, phone: formData.phone, email: formData.email },
          payment: {
            method: PAYMENT_METHODS[paymentMethod].name,
            senderNumber: "N/A",
            transactionId: formData.transactionId,
            amount: totalAmount
          },
          items: cart,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (data.isNewUser) {
        await signIn("credentials", { redirect: false, email: formData.email, password: formData.email });
      }

      toast.success("Order Placed Successfully!");
      clearCart();
      router.push(`/dashboard/orders`); 

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return null; // Or loading spinner

  // ⚡ Active Payment Details
  const activePay = PAYMENT_METHODS[paymentMethod];

  return (
    <div className="bg-black min-h-screen py-6 md:py-10 text-white font-sans">
      <div className="container mx-auto px-3 max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Checkout</h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <Lock className="w-3 h-3" /> Secure Encrypted Payment
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">
          
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. Contact Info (Compact) */}
            <Card className="border border-white/10 bg-[#111]">
              <CardHeader className="py-3 px-4 md:px-5 border-b border-white/5">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
                  <User className="w-4 h-4 text-green-500" /> Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-5 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Full Name</Label>
                    <Input name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} className="h-9 bg-black/50 border-white/10 text-sm" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Phone</Label>
                      <Input name="phone" placeholder="017..." value={formData.phone} onChange={handleChange} className="h-9 bg-black/50 border-white/10 text-sm" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Email</Label>
                      <Input name="email" type="email" placeholder="mail@.." value={formData.email} onChange={handleChange} className="h-9 bg-black/50 border-white/10 text-sm" required readOnly={!!session?.user?.email} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Payment Method (Compact) */}
            <Card className="border border-white/10 bg-[#111] overflow-hidden">
              <CardHeader className="py-3 px-4 md:px-5 border-b border-white/5 bg-white/5">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
                  <Wallet className="w-4 h-4 text-green-500" /> Send Money Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-5 space-y-5">
                
                {/* Selector */}
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(val) => setPaymentMethod(val as PaymentMethodKey)} 
                  className="grid grid-cols-2 gap-3"
                >
                  {Object.values(PAYMENT_METHODS).map((method) => (
                    <div key={method.id}>
                      <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                      <Label htmlFor={method.id} className={`flex flex-col items-center justify-center gap-1 h-20 rounded-lg border border-white/10 bg-black/40 hover:bg-white/5 cursor-pointer transition-all ${method.border} ${method.bg}`}>
                        <span className={`font-bold text-sm ${method.id === paymentMethod ? method.color : "text-gray-300"}`}>{method.name}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Personal</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* ⚡ Auto-Updating Number Display */}
                <div className="bg-black/60 border border-white/10 p-3 rounded-lg flex items-center justify-between gap-3">
                   <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Send Money To</p>
                      <p className={`text-lg sm:text-xl font-mono font-bold tracking-wider truncate ${activePay.color}`}>
                        {activePay.number}
                      </p>
                   </div>
                   <Button type="button" size="sm" variant="secondary" onClick={() => copyNumber(activePay.number)} className="h-8 px-3 text-xs font-bold bg-white/10 hover:bg-white/20 text-white border-0">
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                   </Button>
                </div>

                {/* TrxID Input */}
                <div className="space-y-2">
                   <Label className="text-white text-xs font-bold flex justify-between">
                     <span>Transaction ID (TrxID)</span>
                     <span className="text-red-500 text-[10px] uppercase">* Required</span>
                   </Label>
                   <Input 
                     name="transactionId" 
                     placeholder="e.g. 9H7S6K2..." 
                     value={formData.transactionId} 
                     onChange={handleChange} 
                     className="bg-black/50 border-white/15 h-11 text-base focus-visible:ring-green-500 font-mono text-center tracking-wide" 
                     required 
                   />
                </div>

                {/* ⚡ Bengali Info Alert */}
                <div className="flex gap-3 text-yellow-500/90 bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/10 text-xs">
                   <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                   <div className="leading-relaxed">
                     <span className="font-bold block mb-0.5">গুরুত্বপূর্ণ নোটিশ:</span>
                     আপনার পেমেন্ট ভেরিফাই করার জন্য অনুগ্রহ করে অপেক্ষা করুন। 
                     <span className="text-yellow-400 font-medium"> ১২ ঘন্টার মধ্যে অর্ডার কনফার্ম হবে।</span>
                   </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-20">
              <Card className="border border-white/10 bg-[#111] shadow-2xl">
                <CardHeader className="py-4 px-5 border-b border-white/5 bg-white/5">
                  <CardTitle className="text-base font-bold text-white flex justify-between items-center">
                    Order Summary
                    <span className="text-[10px] font-medium text-gray-400 bg-black px-2 py-0.5 rounded border border-white/10">{cart.length} Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-hide">
                    {cart.map((item) => (
                      <div key={item.cartId} className="flex justify-between text-xs sm:text-sm group">
                        <div className="flex gap-2">
                           <span className="text-gray-500 text-xs mt-0.5">{item.quantity}x</span>
                           <div className="flex flex-col">
                             <span className="text-gray-300 line-clamp-1">{item.name}</span>
                             <span className="text-[10px] text-green-500">{item.validity || "Standard"}</span>
                           </div>
                        </div>
                        <span className="font-mono text-gray-400">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="my-4 border-t border-white/10"></div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-400"><span>Subtotal</span><span>৳{totalAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs text-gray-400"><span>Method</span><span className="text-gray-300">{activePay.name}</span></div>
                    <div className="flex justify-between items-end pt-3 border-t border-white/10 mt-3">
                       <span className="text-sm text-gray-200 font-bold">Total</span>
                       <span className="text-xl font-bold text-green-400 font-mono">৳{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full mt-6 h-11 text-sm font-bold bg-white text-black hover:bg-gray-200 transition-all active:scale-[0.98]">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Confirm Payment <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                  
                  <div className="flex justify-center items-center gap-2 mt-4 text-[10px] text-gray-600">
                    <ShieldCheck className="w-3 h-3" /> Secure 256-bit SSL Encrypted
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