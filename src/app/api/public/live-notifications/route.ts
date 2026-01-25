import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Announcement } from "@/models/Announcement";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Force dynamic behavior in Next.js App Router

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Fetch Real Orders (Limit 10 for loop)
    const recentOrders = await Order.find({ status: "completed" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate({ path: "products.product", select: "title thumbnail slug", model: Product })
      .populate({ path: "user", select: "name", model: User })
      .lean();

    // 2. Fetch Active Admin Popup (Latest one marked as 'popup')
    const activePopup = await Announcement.findOne({ 
      type: "popup", 
      isActive: true 
    }).sort({ createdAt: -1 }).lean();

    // 3. Format Orders Logic
    const orderNotifications = recentOrders.map((order: any) => {
      // Handle potential missing product references gracefully
      const firstItem = order.products?.[0];
      const productTitle = firstItem?.product?.title || firstItem?.title || "Premium Course";
      const productImg = firstItem?.product?.thumbnail || "/placeholder.jpg";
      const productSlug = firstItem?.product?.slug || "#";
      
// ✅ CRITICAL FIX: Robust Date Handling
      // 1. Prefer updatedAt, fallback to createdAt, fallback to Now
      const rawDate = order.updatedAt || order.createdAt || new Date();
      // 2. Ensure it is a Date object
      const dateObj = new Date(rawDate);
      // 3. Convert to ISO String (Safe for JSON transfer)
      const isoDate = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : new Date().toISOString();
      return {
        id: order._id.toString(), // Convert Object ID to string
        type: "order",
        title: "New Purchase",
        message: `bought ${productTitle}`,
        image: productImg,
        timestamp: isoDate, // Raw ISO string for frontend calculation
        link: productSlug !== "#" ? `/product/${productSlug}` : "#",
        customerName: order.user?.name || "Verified Customer"
      };
    });

    // 4. Format Custom Popup Logic (Fully Dynamic)
    const customNotification = activePopup ? {
      id: activePopup._id.toString(),
      type: "custom",
      title: activePopup.title,
      message: activePopup.description,
      
      // ✅ Use Admin-defined image if available, else fallback
      image: activePopup.imageUrl || "/logo-square.png", 
      
      // ✅ Use Admin-defined button text or default
      time: activePopup.buttonText || "Special Offer", 
      
      // ✅ Use Admin-defined link or default shop
      link: activePopup.link || "/shop", 
      
      customerName: "Admin Announcement"
    } : null;

    // 5. Return Response with strict No-Cache headers
    return new NextResponse(JSON.stringify({ 
      success: true, 
      orders: orderNotifications, 
      popup: customNotification 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error("Live Notification API Error:", error);
    // Return empty success state so frontend doesn't crash
    return NextResponse.json({ success: false, orders: [], popup: null }, { status: 500 });
  }
}