"use client";

import { IProduct } from "@/types";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

// ✅ 1. Define allowed plan types
export type PlanType = "monthly" | "yearly" | "lifetime";

// ✅ 2. Updated Cart Item Interface
export interface CartItem {
  cartId: string;       // Unique ID: "prod123-monthly"
  productId: string;
  name: string;
  image: string;
  
  price: number;        // The specific plan price
  regularPrice?: number;// The specific plan regular price (for discount display)
  
  quantity: number;
  category?: string;

  // ⚡ VIP Plan Details
  planType?: PlanType;  // "monthly", "yearly", etc.
  validity?: string;    // "30 Days", "Lifetime"
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  
  // ⚡ Updated Helper: Now accepts 'planType' instead of generic variant
  mapProductToCartItem: (product: IProduct, qty?: number, planType?: PlanType) => CartItem;
  
  totalAmount: number;
  totalItems: number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = "eduaccess-cart-vip"; // New key to prevent conflicts

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- Load Cart ---
  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error("Cart parse error", e);
        localStorage.removeItem(CART_KEY);
      }
    }
    setIsInitialized(true);
  }, []);

  // --- Save Cart ---
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // --- Actions ---
  const addToCart = useCallback((newItem: CartItem) => {
    setCart((prev) => {
      // Check if this exact product+plan exists
      const existing = prev.find((item) => item.cartId === newItem.cartId);
      
      if (existing) {
        // If it's a subscription, usually quantity stays 1, but we'll allow increment logic
        // If you want to force max quantity of 1 for subs, handle that here.
        return prev.map((item) =>
          item.cartId === newItem.cartId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // --- ⚡ CRITICAL: Mapping Logic for VIP Pricing ---
  const mapProductToCartItem = useCallback(
    (product: IProduct, quantity = 1, planType?: PlanType): CartItem => {
      
      let finalPrice = product.defaultPrice || 0; // Fallback
      let finalRegularPrice = 0;
      let validityLabel = "Standard";
      let uniqueCartId = `${product._id}-default`;

      // 🟢 Check if a specific VIP Plan is selected
      if (planType && product.pricing && product.pricing[planType]) {
        const selectedPlan = product.pricing[planType];
        
        // 1. Set Prices from the specific plan
        finalPrice = selectedPlan.price;
        finalRegularPrice = selectedPlan.regularPrice || 0;
        validityLabel = selectedPlan.validityLabel;
        
        // 2. Generate Unique ID (e.g., "prod123-monthly")
        uniqueCartId = `${product._id}-${planType}`;
      }

      return {
        cartId: uniqueCartId,
        productId: String(product._id),
        name: product.title,
        image: product.thumbnail,
        
        price: finalPrice,
        regularPrice: finalRegularPrice,
        
        quantity,
        category: typeof product.category === 'object' ? (product.category as any).name : "Product",
        
        // ⚡ Store Plan Details
        planType: planType,
        validity: validityLabel,
      };
    },
    []
  );

  // --- Calculations ---
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        mapProductToCartItem,
        totalAmount,
        totalItems,
        isInitialized,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};