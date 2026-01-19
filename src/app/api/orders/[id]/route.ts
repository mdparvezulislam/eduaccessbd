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

      // A. Fetch current order to see what product & variant was bought
      const currentOrder = await Order.findById(id);
      
      if (currentOrder && currentOrder.products && currentOrder.products.length > 0) {
        
        // Assume we are delivering the first product
        const item = currentOrder.products[0]; 

        // B. Fetch the Product with ALL SECURE fields revealed
        // We use 'any' cast on the result to avoid TypeScript errors with dynamic select fields
        const productData = await Product.findById(item.product)
          .select("+accessLink +accessNote +pricing.monthly.accessLink +pricing.monthly.accessNote +pricing.yearly.accessLink +pricing.yearly.accessNote +pricing.lifetime.accessLink +pricing.lifetime.accessNote +accountAccess.accountEmail +accountAccess.accountPassword")
          .lean() as any; 

        if (productData) {
          let finalLink = "";
          let finalNote = "";
          let finalEmail = "";    // ✅ For Account Access
          let finalPassword = ""; // ✅ For Account Access
          
          // Normalize variant string (e.g., "Full Account Access" -> "account")
          const variantKey = (item.variant || "standard").toLowerCase();

          // C. Determine Delivery Data based on Variant
          
          // 🟢 CASE 1: Account Access
          // Matches "Account Access", "Full Account Access", etc.
          if (variantKey.includes("account")) {
             finalEmail = productData.accountAccess?.accountEmail || "";
             finalPassword = productData.accountAccess?.accountPassword || "";
             
             // Fallback link if admin set one in "Standard Delivery" as a backup
             finalLink = productData.accessLink || ""; 
             
             // Set a default note if none exists
             finalNote = productData.accessNote || "Your account credentials have been securely delivered.";
          }
          // 🟢 CASE 2: VIP Monthly
          else if (variantKey.includes("monthly") && productData.pricing?.monthly?.isEnabled) {
            finalLink = productData.pricing.monthly.accessLink || "";
            finalNote = productData.pricing.monthly.accessNote || "";
          } 
          // 🟢 CASE 3: VIP Yearly
          else if (variantKey.includes("yearly") && productData.pricing?.yearly?.isEnabled) {
            finalLink = productData.pricing.yearly.accessLink || "";
            finalNote = productData.pricing.yearly.accessNote || "";
          } 
          // 🟢 CASE 4: VIP Lifetime
          else if (variantKey.includes("lifetime") && productData.pricing?.lifetime?.isEnabled) {
            finalLink = productData.pricing.lifetime.accessLink || "";
            finalNote = productData.pricing.lifetime.accessNote || "";
          } 
          // 🟢 CASE 5: Standard / Fallback
          else {
            finalLink = productData.accessLink || "";
            finalNote = productData.accessNote || "";
          }

          // D. Inject into Order
          // We prioritize the Auto-Fetched data, but keep body values if Admin manually overrides them in the UI
          updateFields.deliveredContent = {
            // ✅ Auto-Fill Credentials
            accountEmail: finalEmail || body.deliveredContent?.accountEmail || "",
            accountPassword: finalPassword || body.deliveredContent?.accountPassword || "",
            
            // ✅ Auto-Fill Link/Notes
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

    // 5. Revalidate Paths to update UI immediately
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
