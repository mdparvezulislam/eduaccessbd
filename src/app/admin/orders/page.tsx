import { OrdersClient } from "@/components/admin/orders/OrdersClient"; // Check import path
import { SITE_URL } from "@/types"; 


export default async function OrdersPage() {

  try {
    // 1. Fetch Orders from your API
    const res = await fetch(`${SITE_URL}/api/admin/orders`, {
       cache: "no-store",
        next: { revalidate: 100 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch");
    }

    const data = await res.json();
    const orders = data.orders || [];

    return (
      <div className="flex flex-col flex-1 w-full max-w-full gap-4 p-4 md:p-6 bg-black text-white min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Order Management</h2>
            <p className="text-sm text-gray-400">View transactions and verify payments</p>
          </div>
        </div>
        
        {/* Table Wrapper */}
        <div className="flex-1 w-full overflow-hidden">
          <OrdersClient data={orders} />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] w-full p-8 text-gray-500 bg-black">
        <p className="text-lg font-bold text-red-500 mb-2">Error Loading Orders</p>
        <p className="text-sm">Please refresh the page or check your connection.</p>
      </div>
    );
  }
}