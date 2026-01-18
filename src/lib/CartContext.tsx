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

// ✅ 1. Define allowed plan types (Matches API)
export type PlanType = "monthly" | "yearly" | "lifetime";

// ✅ 2. Cart Item Interface
export interface CartItem {
  cartId: string;       // Unique UI ID: "prod123-monthly" (Use this for React keys/updates)
  productId: string;    // Pure DB ID: "prod123" (Use this for API calls)
  name: string;
  image: string;
  
  price: number;        // Active price
  regularPrice?: number;// Crossed-out price
  
  quantity: number;
  category?: string;

  // ⚡ VIP Plan Details
  planType?: PlanType;  // "monthly" (The Key - Sent to API)
  validity?: string;    // "30 Days" (The Label - Shown in UI)
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Helper to create cart items safely
  mapProductToCartItem: (product: IProduct, qty?: number, planType?: PlanType) => CartItem;
  
  totalAmount: number;
  totalItems: number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = "eduaccess-cart-v2"; // Changed key to reset old/broken cart data

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- Load Cart ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch (e) {
          console.error("Cart corrupted, resetting", e);
          localStorage.removeItem(CART_KEY);
        }
      }
      setIsInitialized(true);
    }
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
      // Check if item with same ID AND same Plan exists
      const existing = prev.find((item) => item.cartId === newItem.cartId);
      
      if (existing) {
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

  // --- ⚡ MAPPING LOGIC (Fixed for API Compatibility) ---
  const mapProductToCartItem = useCallback(
    (product: IProduct, quantity = 1, planType?: PlanType): CartItem => {
      
      let finalPrice = product.defaultPrice || 0;
      let finalRegularPrice = product.regularPrice || 0;
      let validityLabel = "Standard";
      let selectedPlanType: PlanType | undefined = undefined;
      
      // Default Unique ID
      let uniqueCartId = `${product._id}-default`;

      // 🟢 Logic: If a VIP Plan is selected, override prices
      if (planType && product.pricing && product.pricing[planType]?.isEnabled) {
        const selectedPlan = product.pricing[planType];
        
        finalPrice = selectedPlan.price;
        finalRegularPrice = selectedPlan.regularPrice || 0;
        validityLabel = selectedPlan.validityLabel || "VIP Access";
        selectedPlanType = planType;
        
        // Unique ID includes plan type so users can add Monthly AND Yearly of same product separately
        uniqueCartId = `${product._id}-${planType}`;
      } else {
        // Fallback for Standard Products (Use Sale Price if active)
        if (product.salePrice > 0) {
          finalPrice = product.salePrice;
          finalRegularPrice = product.regularPrice;
        }
      }

      return {
        // ⚡ CRITICAL FIX: Split IDs correctly
        cartId: uniqueCartId,           // For React Keys (e.g. "69a...-monthly")
        productId: String(product._id), // For Database (e.g. "69a...")
        
        name: product.title,
        image: product.thumbnail,
        
        price: finalPrice,
        regularPrice: finalRegularPrice,
        
        quantity,
        category: typeof product.category === 'object' ? (product.category as any).name : "Product",
        
        // ⚡ Plan Data
        planType: selectedPlanType, // "monthly" (Matches API expectation)
        validity: validityLabel,    // "30 Days" (For UI Display)
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