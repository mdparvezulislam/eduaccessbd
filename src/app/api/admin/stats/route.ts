import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Product } from "@/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // Run all queries in parallel for speed
    const [totalUsers, totalProducts, orders] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments({}),
      Order.find({}).select("amount status"), // Fetch only needed fields
    ]);

    // Calculate details in memory (faster for small-medium apps)
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const completedOrders = orders.filter((o) => o.status === "completed").length;
    
    // Calculate Total Revenue
    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}