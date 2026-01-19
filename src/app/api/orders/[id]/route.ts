import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product"; 
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth";     
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

interface IdParams {
  params: Promise<{ id: string }>;
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

      // A. Fetch current order to see what products & variants were bought
      const currentOrder = await Order.findById(id);
      
      if (currentOrder && currentOrder.products && currentOrder.products.length > 0) {
        
        // Variables to accumulate data
        let combinedLinks = "";
        
        // We capture the FIRST valid data found for these fields
        // (We do NOT combine notes anymore, per request)
        let primaryEmail = "";
        let primaryPassword = "";
        let primaryNote = "";

        // B. Loop through ALL products in the order
        await Promise.all(currentOrder.products.map(async (item: any) => {
          
          // Fetch Product with SECURE fields
          const productData = await Product.findById(item.product)
            .select("+accessLink +accessNote +pricing.monthly.accessLink +pricing.monthly.accessNote +pricing.yearly.accessLink +pricing.yearly.accessNote +pricing.lifetime.accessLink +pricing.lifetime.accessNote +accountAccess.accountEmail +accountAccess.accountPassword")
            .lean() as any;

          if (!productData) return;

          let itemLink = "";
          let itemNote = "";
          let itemEmail = "";
          let itemPass = "";
          
          // Normalize variant string
          const variantKey = (item.variant || "standard").toLowerCase();

          // --- LOGIC: Determine Content based on Variant ---

          // 1. Account Access
          if (variantKey.includes("account")) {
             itemEmail = productData.accountAccess?.accountEmail || "";
             itemPass = productData.accountAccess?.accountPassword || "";
             itemLink = productData.accessLink || ""; 
             itemNote = productData.accessNote || "";
          }
          // 2. VIP Monthly
          else if (variantKey.includes("monthly") && productData.pricing?.monthly?.isEnabled) {
            itemLink = productData.pricing.monthly.accessLink || "";
            itemNote = productData.pricing.monthly.accessNote || "";
          } 
          // 3. VIP Yearly
          else if (variantKey.includes("yearly") && productData.pricing?.yearly?.isEnabled) {
            itemLink = productData.pricing.yearly.accessLink || "";
            itemNote = productData.pricing.yearly.accessNote || "";
          } 
          // 4. VIP Lifetime
          else if (variantKey.includes("lifetime") && productData.pricing?.lifetime?.isEnabled) {
            itemLink = productData.pricing.lifetime.accessLink || "";
            itemNote = productData.pricing.lifetime.accessNote || "";
          } 
          // 5. Standard / Fallback
          else {
            itemLink = productData.accessLink || "";
            itemNote = productData.accessNote || "";
          }

          // --- FORMATTING ---
          
          // 1. Combine Links (with Title for clarity)
          if (itemLink) {
            combinedLinks += `[${productData.title}]: ${itemLink}\n`;
          }

          // 2. Set Primary Credentials (only if not already set)
          if (!primaryEmail && itemEmail) {
            primaryEmail = itemEmail;
            primaryPassword = itemPass;
          }

          // 3. Set Primary Note (only if not already set)
          if (!primaryNote && itemNote) {
            primaryNote = itemNote;
          }
        }));

        // D. Inject into Order
        updateFields.deliveredContent = {
          // Dedicated Credentials (First found)
          accountEmail: primaryEmail || body.deliveredContent?.accountEmail || "",
          accountPassword: primaryPassword || body.deliveredContent?.accountPassword || "",
          
          // Combined Links (All products)
          downloadLink: combinedLinks.trim() || body.deliveredContent?.downloadLink || "",
          
          // Single Note (First found - Not combined)
          accessNotes: primaryNote || body.deliveredContent?.accessNotes || "",
        };
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
