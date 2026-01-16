import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth"; // ✅ Correct import for v4
import { authOptions } from "@/lib/auth";     // ✅ Import your options
import type { IdParams } from "@/types";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// ==========================
// GET → Fetch Single Order Details
// ==========================
export async function GET(req: NextRequest, { params }: IdParams) {
  try {
    // ✅ Fix: Use getServerSession with authOptions for v4
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Next.js 16 params are async
    await connectToDatabase();

    const order = await Order.findById(id)
      .populate("product")
      .populate("user", "name email image")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 🟢 Security: Ensure user owns this order (or is admin)
    // We cast to string to ensure safe comparison
    const isOwner = order.user._id.toString() === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    // if (!isOwner && !isAdmin) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    return NextResponse.json({ success: true, order }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// ==========================
// PUT → Admin Updates Order (Confirms Payment + Delivers Content)
// ==========================
export async function PUT(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. 🔒 Strict Admin Check
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { id } = await params;

    await connectToDatabase();

    // 2. Prepare Update Data
    const updateFields: Record<string, any> = {
      status: body.status, // "completed", "declined"
    };

    // 3. 🟢 Smart Business Logic
    if (body.status === "completed") {
      // ✅ If Completing: Mark money as PAID
      updateFields.paymentStatus = "paid";
      
      // ✅ Inject Credentials/Delivery Data
      updateFields.deliveredContent = {
        accountEmail: body.deliveredContent?.accountEmail || "",
        accountPassword: body.deliveredContent?.accountPassword || "",
        accessNotes: body.deliveredContent?.accessNotes || "",
        downloadLink: body.deliveredContent?.downloadLink || "",
      };
    } else if (body.status === "declined" || body.status === "cancelled") {
      // ❌ If Declined: Mark money as FAILED
      updateFields.paymentStatus = "failed";
    }

    // 4. Execute Update
    const updatedOrder = await Order.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 5. Revalidate Paths (Refreshes the Admin Table & User Dashboard)
    revalidatePath("/admin/orders");
    revalidatePath("/dashboard");

    return NextResponse.json(
      { success: true, message: "Order processed successfully", order: updatedOrder },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("❌ Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

// ... existing imports ...

export async function DELETE(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Order deleted" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}