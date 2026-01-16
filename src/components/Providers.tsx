"use client";

import { useEffect, useState } from "react";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/CartContext";


/**
 * Wraps all client-only contexts (Session, Cart, Push Notification)
 * Ensures they only mount on client to prevent hydration mismatch
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // Prevent server-side rendering mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Prevent hydration mismatch by not rendering children on the server
    return null;
  }

  return (
    <SessionProvider>

<CartProvider>

          {children}
 

</CartProvider>
    </SessionProvider>
  );
}
