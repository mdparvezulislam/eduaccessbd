import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
// ✅ Make sure this path matches where you actually saved the file
// If you saved it in 'lib/payment/rupantor.ts', import from "@/lib/payment/rupantor"
import { initiatePayment } from "@/lib/rupantor"; 
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    
    await connectToDatabase();
    
    // 1. Fetch Order
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("🔹 Initiating Payment for Order:", order.transactionId);

    // 2. Call RupantorPay Helper
    const paymentResponse = await initiatePayment({
      amount: order.amount,
      transactionId: order.transactionId,
      name: order.user?.name || "Guest Customer",
      phone: order.user?.phone || "01700000000",
    
    });

    // 🔍 DEBUG LOG: See exactly what the gateway returns
    console.log("🔸 RupantorPay Response:", JSON.stringify(paymentResponse, null, 2));

    // 3. Handle Gateway Response (Robust Check)
    // We check multiple possible fields just in case the API documentation varies
    const paymentUrl = paymentResponse.payment_url || paymentResponse.url || paymentResponse.data?.payment_url;
    
    // Check if we got a valid URL
    if (paymentUrl) {
      return NextResponse.json({ url: paymentUrl });
    } else {
      // If no URL, return the full error details for debugging
      console.error("❌ Gateway Error Details:", paymentResponse);
      return NextResponse.json({ 
        error: "Payment gateway failed to provide a URL", 
        details: paymentResponse 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}