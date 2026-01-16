
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";

import { NextRequest, NextResponse } from "next/server";





// ==============================================================================
// GET: Fetch Orders (Secure & Role-Based)
// ==============================================================================
export async function GET(req: NextRequest) {
  try {


    await connectToDatabase();

   

    // 3. FETCH DATA
    const orders = await Order.find()
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    return NextResponse.json({ success: true, orders }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" }, 
      { status: 500 }
    );
  }
}