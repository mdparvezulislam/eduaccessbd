"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/CartContext";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { 
  Loader2, ArrowRight, Lock, User, Phone, Mail, 
  Copy, CheckCircle2, AlertTriangle, Wallet 
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ⚡ CONFIG: Payment Numbers
const PAYMENT_METHODS = {
  bkash: {
    id: "bkash",
    name: "Bkash Personal",
    number: "01858957312",
    theme: "pink",
    borderColor: "peer-data-[state=checked]:border-pink-500",
    textColor: "peer-data-[state=checked]:text-pink-500"
  },
  nagad: {
    id: "nagad",
    name: "Nagad Personal", 
    // The prompt said "Bkash/Nagad - 01857887025", implying this number might be used for both or specifically Nagad here.
    // I am assigning it to Nagad for clarity in UI selection.
    number: "01857887025", 
    theme: "orange",
    borderColor: "peer-data-[state=checked]:border-orange-500",
    textColor: "peer-data-[state=checked]:text-orange-500"
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  // Default to Bkash
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad">("bkash");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    transactionId: "",
  });

  // Auto-Fill User Data
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
    toast.success("Number copied!", { position: "top-center" });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone || !formData.email) {
      return toast.error("Please fill in contact details");
    }
    if (!formData.transactionId) {
      return toast.error("Please provide the Transaction ID");
    }

    setLoading(true);

    try {
      // 1. Create Order API Call
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
          },
          payment: {
            method: PAYMENT_METHODS[paymentMethod].name, // e.g. "Bkash Personal"
            senderNumber: "N/A", // ⚡ User doesn't provide this anymore, sending default
            transactionId: formData.transactionId,
            amount: totalAmount
          },
          items: cart,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Order creation failed");
      }

      // 2. Auto-Login (if new user)
      if (data.isNewUser) {
        await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.email, 
        });
      }

      // 3. Success State
      toast.success("Order Placed Successfully!");
      clearCart();
      // Redirect to success page or dashboard
      router.push(`/dashboard/orders`); 

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col bg-black text-white">
         <div className="text-center">
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <Button onClick={() => router.push("/")} className="mt-4 bg-white text-black hover:bg-gray-200">Go Shopping</Button>
         </div>
      </div>
    );
  }

  // Get current active payment details
  const activePayInfo = PAYMENT_METHODS[paymentMethod];

  return (
    <div className="bg-black min-h-screen py-10 text-white font-sans selection:bg-green-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex flex-col items-center mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Secure Checkout</h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Lock className="w-3 h-3" /> Encrypted Payment Gateway
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Contact Info */}
            <Card className="border border-gray-800 bg-[#111]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg font-bold text-white">
                  <div className="bg-white text-black w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-gray-400 text-xs uppercase font-bold">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} className="pl-9 bg-[#0a0a0a] border-gray-700 text-white" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-xs uppercase font-bold">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input name="phone" placeholder="017..." value={formData.phone} onChange={handleChange} className="pl-9 bg-[#0a0a0a] border-gray-700 text-white" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-xs uppercase font-bold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input name="email" type="email" placeholder="you@mail.com" value={formData.email} onChange={handleChange} className="pl-9 bg-[#0a0a0a] border-gray-700 text-white" required readOnly={!!session?.user?.email} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Payment Method */}
            <Card className="border border-green-900/30 bg-[#111] shadow-lg shadow-green-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg font-bold text-white">
                  <div className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  Payment Method
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Select a method and <b>Send Money</b> (Not Cashout).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Selector */}
                {/* @ts-ignore */}
                <RadioGroup defaultValue="bkash" onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                  {Object.values(PAYMENT_METHODS).map((method) => (
                    <div key={method.id}>
                      <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                      <Label htmlFor={method.id} className={`flex flex-col items-center justify-between rounded-xl border-2 border-gray-700 bg-[#1a1a1a] p-4 hover:bg-gray-800 hover:text-white cursor-pointer transition-all ${method.borderColor} ${method.textColor}`}>
                        <span className="font-bold text-lg">{method.name}</span>
                        <span className="text-xs opacity-70">Personal</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Number Display Box */}
                <div className="bg-black border border-gray-800 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="space-y-1 text-center sm:text-left">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Send Money To</p>
                      <p className={`text-2xl font-mono font-bold tracking-wider ${paymentMethod === 'bkash' ? 'text-pink-500' : 'text-orange-500'}`}>
                        {activePayInfo.number}
                      </p>
                   </div>
                   <Button type="button" variant="secondary" onClick={() => copyNumber(activePayInfo.number)} className="h-10 px-6 font-bold bg-white text-black hover:bg-gray-200">
                      <Copy className="w-4 h-4 mr-2" /> Copy Number
                   </Button>
                </div>

                {/* TrxID Input */}
                <div className="space-y-3 pt-2">
                   <Label className="text-white text-sm font-bold flex items-center gap-2">
                     Transaction ID (TrxID) <span className="text-red-500">*</span>
                   </Label>
                   <Input 
                     name="transactionId" 
                     placeholder="e.g. 9H7S6K2..." 
                     value={formData.transactionId} 
                     onChange={handleChange} 
                     className="bg-[#0a0a0a] border-gray-700 text-white h-12 text-lg focus-visible:ring-green-500 font-mono placeholder:font-sans" 
                     required 
                   />
                   <p className="text-xs text-gray-500">
                     Copy the Transaction ID from your {activePayInfo.name.split(" ")[0]} app message and paste it here.
                   </p>
                </div>

                {/* ⚡ Bengali Info Alert */}
                <div className="flex items-start gap-3 text-yellow-500 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                   <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                   <div className="space-y-1">
                     <p className="text-sm font-bold">গুরুত্বপূর্ণ নোটিশ (Important)</p>
                     <p className="text-xs opacity-90 leading-relaxed">
                       আপনার পেমেন্ট ভেরিফাই করার জন্য অনুগ্রহ করে অপেক্ষা করুন। 
                       <br/>
                       <span className="font-bold text-yellow-400">১২ ঘন্টার মধ্যে আপনার অর্ডারটি কনফার্ম করা হবে।</span>
                     </p>
                   </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <Card className="border border-gray-800 bg-[#111] shadow-2xl">
                <CardHeader className="bg-[#1a1a1a] border-b border-gray-800 py-5">
                  <CardTitle className="text-lg font-bold text-white flex justify-between items-center">
                    Order Summary
                    <span className="text-xs font-normal text-gray-400 bg-black px-2 py-1 rounded border border-gray-800">{cart.length} Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.cartId} className="flex justify-between text-sm">
                        <span className="text-gray-300 max-w-[70%]">
                          {item.quantity}x {item.name} 
                          {item.validity && <span className="block text-xs text-gray-500 mt-0.5">({item.validity})</span>}
                        </span>
                        <span className="font-medium text-white">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="my-6 border-t border-gray-800"></div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>৳{totalAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm text-gray-400"><span>Delivery Method</span><span className="text-green-400">Digital / Email</span></div>
                    <div className="flex justify-between items-end pt-4 border-t border-gray-800 mt-4">
                       <span className="text-gray-200 font-bold">Total Payable</span>
                       <span className="text-2xl font-bold text-white">৳{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full mt-8 h-14 text-base font-bold bg-white text-black hover:bg-gray-200 shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99]">
                    {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying Payment...</> : <>Confirm Order <ArrowRight className="ml-2 h-5 w-5" /></>}
                  </Button>
                   test 
                  <p className="text-[10px] text-center text-gray-500 mt-4">
                    By clicking Confirm, you acknowledge that you have sent the money to the correct number.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}