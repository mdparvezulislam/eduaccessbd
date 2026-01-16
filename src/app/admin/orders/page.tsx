import { OrdersClient } from "@/components/admin/orders/OrdersClient";
import { SITE_URL } from "@/types"; // Ensure this is defined, or use process.env



export default async function OrdersPage() {

  // 1. Fetch Orders
  // We use 'no-store' so the Admin always sees the latest orders immediately
  const res = await fetch(`${SITE_URL}/api/admin/orders`, {
    cache: "no-store", 
  });


  if (!res.ok) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8 text-red-500 bg-black">
        <p>Failed to load orders. Please check your connection.</p>
      </div>
    );
  }

  // 2. Parse Data
  // The API returns { success: true, orders: [...] }
  const data = await res.json();
  const orders = data.orders || [];
console.log(orders  )
  return (
    // Responsive Container: 
    // - flex-col flex-1: Fills height
    // - w-full max-w-full: Prevents horizontal scroll
    // - bg-black text-white: Dark theme
    <div className="flex flex-col flex-1 w-full max-w-full gap-4 p-4 md:p-6 bg-black text-white">
      
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
}