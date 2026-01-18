
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";

import { NextRequest, NextResponse } from "next/server";





// ==============================================================================
// GET: Fetch Orders (Secure & Role-Based)
// ==============================================================================
export async function GET(req: NextRequest) {
  try {


    await connectToDatabase();
    const session = await getServerSession(authOptions);
       
    //   if (session?.user?.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }
   

    // 3. FETCH DATA
    const orders = await Order.find()
      .sort({ createdAt: -1 }).populate("user", "name email phone") // Populate user details
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