import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Security Check
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();

    // 2. Parse Query Params
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10")));
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // 3. Build Query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    // 4. Parallel Execution (Faster)
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password") // Exclude password
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    // 5. Metadata
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        pageSize: limit,
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}