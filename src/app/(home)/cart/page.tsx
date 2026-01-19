"use client";

import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-black text-white">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="bg-white/5 p-8 rounded-full mb-6 border border-white/10"
        >
          <ShoppingBag className="w-16 h-16 text-gray-500" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-3">Your cart is empty</h2>
        <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
          Looks like you haven't added anything yet. Explore our premium courses and digital assets to get started!
        </p>
        <Link href="/products">
          <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-8 rounded-full">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen py-8 md:py-16 text-white font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">Shopping Cart</h1>
          <span className="text-gray-400 text-sm">{cart.length} Items</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* === LEFT: CART ITEMS LIST === */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 text-xs font-bold text-gray-500 uppercase tracking-wider pb-2 px-4">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Items */}
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.cartId} // ⚡ Important: Use cartId for React Key
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#111] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all flex flex-col md:grid md:grid-cols-12 gap-4 items-center group relative overflow-hidden"
                >
                  
                  {/* Product Info */}
                  <div className="col-span-6 w-full flex items-center gap-4">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gray-900 rounded-lg overflow-hidden shrink-0 border border-white/5">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 font-bold">NO IMG</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white line-clamp-1 text-sm md:text-base mb-1">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                         <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-medium">
                           {item.category || "Product"}
                         </span>
                         {/* ⚡ Show Plan Type if VIP */}
                         {item.validity && item.validity !== "Standard" && (
                           <span className="text-[10px] bg-green-900/30 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                             {item.validity}
                           </span>
                         )}
                      </div>
                      
                      {/* Mobile Price */}
                      <p className="md:hidden font-mono text-sm text-gray-300 mt-2">
                        ৳{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Price (Desktop) */}
                  <div className="col-span-2 hidden md:block text-center font-mono text-sm text-gray-300">
                    ৳{item.price.toLocaleString()}
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-2 w-full md:w-auto flex justify-between md:justify-center items-center">
                    <div className="flex items-center border border-white/10 rounded-lg bg-black">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)} // ⚡ Use cartId
                        className="px-2.5 py-1 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)} // ⚡ Use cartId
                        className="px-2.5 py-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Mobile Delete */}
                    <button 
                      onClick={() => removeFromCart(item.cartId)}
                      className="md:hidden p-2 text-red-500/70 hover:text-red-500 bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Total & Desktop Delete */}
                  <div className="col-span-2 w-full md:w-auto flex justify-between md:justify-end items-center gap-4">
                    <span className="font-bold font-mono text-white md:text-right">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.cartId)} // ⚡ Use cartId
                      className="hidden md:block p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {cart.length > 0 && (
              <div className="flex justify-end pt-4">
                <Button 
                  variant="ghost" 
                  onClick={clearCart} 
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/10"
                >
                  Empty Cart
                </Button>
              </div>
            )}
          </div>

          {/* === RIGHT: ORDER SUMMARY === */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] p-6 rounded-2xl border border-white/10 sticky top-24 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wide">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-mono">৳{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Discount</span>
                  <span className="text-green-400 font-mono">- ৳0</span>
                </div>
                
                <Separator className="bg-white/10 my-4" />
                
                <div className="flex justify-between items-end">
                  <span className="text-white font-bold">Total Payable</span>
                  <span className="text-2xl font-bold text-white font-mono">৳{totalAmount.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-500 text-right">Including VAT & Taxes</p>
              </div>

              {/* Action Button */}
              <Link href="/checkout">
                <Button className="w-full mt-8 bg-white text-black hover:bg-gray-200 h-12 text-sm font-bold uppercase tracking-wider transition-transform active:scale-[0.98]">
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                100% Secure Payment
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}