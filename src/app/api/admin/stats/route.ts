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

    // Run parallel queries for speed
    const [
      totalUsers,
      totalProducts,
      orderStats
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments({}),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0] }
            },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
            },
            completedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    // Extract stats safely (aggregate returns an array)
    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        ...stats
      }
    });

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}