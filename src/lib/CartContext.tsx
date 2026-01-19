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

// ✅ 1. Updated Plan Types (Added "account_access")
export type PlanType = "monthly" | "yearly" | "lifetime" | "account_access";

// ✅ 2. Cart Item Interface
export interface CartItem {
  cartId: string;       // Unique ID: "prod123-monthly" or "prod123-account_access"
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
  
  mapProductToCartItem: (product: IProduct, qty?: number, planType?: PlanType) => CartItem;
  
  totalAmount: number;
  totalItems: number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = "eduaccess-cart-v3"; // Bumped version to v3 to ensure clean state

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
      // Check for existing item with SAME unique cartId (includes plan variant)
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

  // --- ⚡ MAPPING LOGIC (Updated for Account Access) ---
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
        // Safe access to new field using 'any' casting if type isn't globally updated yet
        const accInfo = (product as any).accountAccess;
        
        finalPrice = Number(accInfo?.price || 0);
        finalRegularPrice = 0; // Account access usually has no "regular" price
        validityLabel = "Full Account Access";
        selectedPlanType = "account_access";
        
        // ⚡ Unique ID for Account Access
        uniqueCartId = `${product._id}-account_access`;
      } 
      
      // 🟢 CASE B: VIP Subscription Plans (Monthly/Yearly/Lifetime)
      else if (planType && product.pricing && product.pricing[planType]?.isEnabled) {
        const selectedPlan = product.pricing[planType];
        
        finalPrice = selectedPlan.price;
        finalRegularPrice = selectedPlan.regularPrice || 0;
        validityLabel = selectedPlan.validityLabel || "VIP Access";
        selectedPlanType = planType;
        
        uniqueCartId = `${product._id}-${planType}`;
      } 
      
      // 🟢 CASE C: Standard Product (Fallback)
      else {
        if (product.salePrice > 0) {
          finalPrice = product.salePrice;
          finalRegularPrice = product.regularPrice;
        }
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};