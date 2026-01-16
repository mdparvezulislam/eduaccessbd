import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product"; // ✅ Import Product to fetch links
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth";     
import type { IdParams } from "@/types";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// ==========================
// GET → Fetch Single Order Details
// ==========================
export async function GET(req: NextRequest, { params }: IdParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; 
    await connectToDatabase();

    const order = await Order.findById(id)
      .populate("user", "name email image")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// ==========================
// PUT → Admin Updates Order (Confirms Payment + Auto-Delivers Content)
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

    // 2. Prepare Basic Update Data
    const updateFields: Record<string, any> = {
      status: body.status, 
    };

    // =========================================================
    // 3. 🟢 AUTOMATION LOGIC: IF ORDER IS MARKED "COMPLETED"
    // =========================================================
    if (body.status === "completed") {
      updateFields.paymentStatus = "paid";

      // A. Fetch current order to see what product & variant was bought
      const currentOrder = await Order.findById(id);
      
      if (currentOrder && currentOrder.products && currentOrder.products.length > 0) {
        
        // Assume we are delivering the first product (standard for single-item digital stores)
        const item = currentOrder.products[0]; 

        // B. Fetch the Product with ALL SECURE fields revealed
        // We use .select() with '+' to unhide fields that are { select: false } in schema
        const productData = await Product.findById(item.product)
          .select("+accessLink +accessNote +pricing.monthly.accessLink +pricing.monthly.accessNote +pricing.yearly.accessLink +pricing.yearly.accessNote +pricing.lifetime.accessLink +pricing.lifetime.accessNote")
          .lean();

        if (productData) {
          let finalLink = "";
          let finalNote = "";
          
          // Normalize variant string (e.g., "Monthly" -> "monthly")
          const variantKey = (item.variant || "standard").toLowerCase();

          // C. Determine which Link/Note to use based on what user bought
          if (variantKey.includes("monthly") && productData.pricing?.monthly?.isEnabled) {
            // VIP Monthly
            finalLink = productData.pricing.monthly.accessLink || "";
            finalNote = productData.pricing.monthly.accessNote || "";
          } 
          else if (variantKey.includes("yearly") && productData.pricing?.yearly?.isEnabled) {
            // VIP Yearly
            finalLink = productData.pricing.yearly.accessLink || "";
            finalNote = productData.pricing.yearly.accessNote || "";
          } 
          else if (variantKey.includes("lifetime") && productData.pricing?.lifetime?.isEnabled) {
            // VIP Lifetime
            finalLink = productData.pricing.lifetime.accessLink || "";
            finalNote = productData.pricing.lifetime.accessNote || "";
          } 
          else {
            // ✅ FALLBACK: Normal Product (Standard)
            // If no variant matched (or it's a simple product), use the root fields
            finalLink = productData.accessLink || "";
            finalNote = productData.accessNote || "";
          }

          // D. Inject into Order
          // We prefer the auto-fetched link, but keep manual input if admin typed something specific
          updateFields.deliveredContent = {
            accountEmail: body.deliveredContent?.accountEmail || "",
            accountPassword: body.deliveredContent?.accountPassword || "",
            downloadLink: finalLink || body.deliveredContent?.downloadLink || "",
            accessNotes: finalNote || body.deliveredContent?.accessNotes || "",
          };
        }
      }
    } 
    else if (body.status === "declined" || body.status === "cancelled") {
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

    // 5. Revalidate Paths
    revalidatePath("/admin/orders");
    revalidatePath("/dashboard");

    return NextResponse.json(
      { success: true, message: "Order processed & delivered", order: updatedOrder },
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

// ==========================
// DELETE → Admin Deletes Order
// ==========================
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