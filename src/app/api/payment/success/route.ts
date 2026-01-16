import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { verifyPayment } from "@/lib/rupantor"; // Import verify function
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // 1. Get Params
  // 'order_id' comes from the success_url we sent in initiatePayment
  // Rupantor might append its own 'payment_id' or 'txn_id' to the URL
  const myOrderId = searchParams.get("order_id");
  const gatewayTxnId = searchParams.get("txn_id") || searchParams.get("payment_id"); 

  if (!myOrderId || !gatewayTxnId) {
     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/checkout?status=invalid_callback`);
  }

  await connectToDatabase();

  // 2. Verify Payment with Gateway (Security Step)
  const verifyRes = await verifyPayment(gatewayTxnId);

  // Check if verification passed (Adjust 'status' check based on actual API response)
  if (verifyRes.status !== "COMPLETED" && verifyRes.success !== true) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/checkout?status=verification_failed`);
  }

  // 3. Find Order in DB
  const order = await Order.findOne({ transactionId: myOrderId });
  if (!order) return NextResponse.json({ error: "Order not found" });

  // 4. Find Product (For Auto-Delivery)
  const product = await Product.findById(order.product).select("+accessLink +accessNote");

  // 5. Update Order Status
  order.paymentStatus = "paid";
  
  if (product && product.accessLink) {
    // Auto-Deliver Content
    order.status = "completed";
    order.deliveredContent = {
      downloadLink: product.accessLink,
      accessNotes: product.accessNote || "Thank you for your purchase!"
    };
  } else {
    // Manual Admin Verification Required (e.g. for accounts)
    order.status = "processing"; 
  }

  await order.save();

  // 6. Redirect to Dashboard
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
}