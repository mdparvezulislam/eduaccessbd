"use client";

import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-green-50 p-6 rounded-full mb-6">
          <ShoppingBag className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Looks like you haven't added anything yet. Explore our courses and digital products to get started!
        </p>
        <Link href="/">
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 text-sm font-medium text-gray-500 border-b pb-4">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Items */}
            {cart.map((item) => (
              <div
                key={item.productId}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:grid md:grid-cols-12 gap-4 items-center"
              >
                {/* Product Info */}
                <div className="col-span-6 w-full flex items-center gap-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm md:text-base">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{item.category || "Digital Product"}</p>
                    {/* Mobile Price */}
                    <p className="md:hidden font-bold text-green-600 mt-2">
                      ৳{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Price (Desktop) */}
                <div className="col-span-2 hidden md:block text-center font-medium text-gray-700">
                  ৳{item.price.toLocaleString()}
                </div>

                {/* Quantity Controls */}
                <div className="col-span-2 w-full md:w-auto flex justify-between md:justify-center items-center">
                  <div className="flex items-center border rounded-lg bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-1 hover:text-green-600 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-3 py-1 hover:text-green-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Mobile Delete */}
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="md:hidden p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Total & Desktop Delete */}
                <div className="col-span-2 w-full md:w-auto flex justify-between md:justify-end items-center gap-4">
                  <span className="font-bold text-gray-900 md:text-right">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="hidden md:block p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-700 hover:bg-red-50">
              Clear Cart
            </Button>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="text-green-600">- ৳0</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>৳0</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>৳{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon Input */}
              <div className="mt-6">
                <div className="flex gap-2">
                  <Input placeholder="Coupon code" className="bg-gray-50 border-gray-200" />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 h-12 text-base font-semibold shadow-lg shadow-green-600/20">
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}