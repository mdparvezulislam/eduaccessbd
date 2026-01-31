"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { IProduct } from "@/types";
import { toast } from "sonner";

// ==============================================================================
// 1. TYPES & INTERFACES
// ==============================================================================

// ✅ Updated Plan Types
export type PlanType = "monthly" | "yearly" | "lifetime" | "account_access";

// ✅ Cart Item Interface
export interface CartItem {
  cartId: string;       // Unique ID: "prod123-monthly"
  productId: string;    // DB ID
  name: string;
  image: string;
  
  price: number;        // Active price
  regularPrice?: number;
  
  quantity: number;
  category?: string;

  // Plan Details
  planType?: PlanType; 
  validity?: string;    
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Logic to convert DB Product -> Cart Item
  mapProductToCartItem: (product: IProduct, quantity?: number, planType?: PlanType) => CartItem;
  
  totalAmount: number;
  totalItems: number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = "eduaccess-cart-v3"; 

// ==============================================================================
// 2. PROVIDER
// ==============================================================================
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref to track if initial load has happened (prevents overwriting LS with empty array)
  const isLoaded = useRef(false);

  // --- Load Cart (Run Once on Mount) ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCart(parsed);
          }
        } catch (e) {
          console.error("Cart corrupted, resetting", e);
          localStorage.removeItem(CART_KEY);
        }
      }
      // Mark as loaded so future updates can save to LS
      isLoaded.current = true;
      setIsInitialized(true);
    }
  }, []);

  // --- Save Cart (Run on Update) ---
  useEffect(() => {
    // Only save if we have finished loading the initial state
    if (isLoaded.current) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  // ==============================================================================
  // 3. ACTIONS
  // ==============================================================================

  const addToCart = useCallback((newItem: CartItem) => {
    setCart((prev) => {
      // Check for existing item with SAME unique cartId (includes plan variant)
      const existingIndex = prev.findIndex((item) => item.cartId === newItem.cartId);
      
      if (existingIndex > -1) {
        const updatedCart = [...prev];
        updatedCart[existingIndex] = {
           ...updatedCart[existingIndex],
           quantity: updatedCart[existingIndex].quantity + newItem.quantity
        };
        toast.success("Quantity updated in cart");
        return updatedCart;
      }
      
      toast.success("Added to cart");
      return [...prev, newItem];
    });
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
    toast.info("Item removed");
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

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_KEY);
    }
  }, []);

  // ==============================================================================
  // 4. MAPPING LOGIC (Fixed Type Errors)
  // ==============================================================================
  const mapProductToCartItem = useCallback(
    (product: IProduct, quantity = 1, planType?: PlanType): CartItem => {
      
      let finalPrice = product.defaultPrice || 0;
      let finalRegularPrice = product.regularPrice || 0;
      let validityLabel = "Standard";
      let selectedPlanType: PlanType | undefined = undefined;
      
      // Default Unique ID
      let uniqueCartId = `${product._id}-default`;

      // 🟢 CASE A: Account Access
      if (planType === "account_access") {
        // Use Type Assertion if property exists on Mongoose model but not strict Interface yet
        const accInfo = (product as any).accountAccess;
        
        if (accInfo && accInfo.isEnabled) {
            finalPrice = Number(accInfo.price || 0);
            finalRegularPrice = 0; 
            validityLabel = "Full Account Access";
            selectedPlanType = "account_access";
            uniqueCartId = `${product._id}-account_access`;
        }
      } 
      
      // 🟢 CASE B: VIP Plans (Strict Type Check)
      else if (planType && ["monthly", "yearly", "lifetime"].includes(planType)) {
        // Cast planType to specific keys to satisfy TypeScript
        const vipKey = planType as "monthly" | "yearly" | "lifetime";
        const selectedPlan = product.pricing ? product.pricing[vipKey] : null;
        
        if (selectedPlan && selectedPlan.isEnabled) {
            finalPrice = selectedPlan.price;
            finalRegularPrice = selectedPlan.regularPrice || 0;
            validityLabel = selectedPlan.validityLabel || "VIP Access";
            selectedPlanType = planType;
            uniqueCartId = `${product._id}-${planType}`;
        }
      } 
      
      // 🟢 CASE C: Standard Product (Fallback)
      else {
        if (product.salePrice > 0) {
          finalPrice = product.salePrice;
          finalRegularPrice = product.regularPrice;
        }
      }

      // Handle Category Object safely
      const categoryName = typeof product.category === 'object' && product.category !== null 
        ? (product.category as any).name 
        : "Product";

      return {
        cartId: uniqueCartId,           
        productId: String(product._id), 
        name: product.title,
        image: product.thumbnail,
        price: finalPrice,
        regularPrice: finalRegularPrice,
        quantity,
        category: categoryName,
        planType: selectedPlanType, 
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

// --- Hook ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};