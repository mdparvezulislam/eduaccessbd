import ProductListClient from "@/components/admin/products/ProductListClient";
import { SITE_URL } from "@/types"; // Ensure this is defined in your types file

export default async function ProductListPage() {
  const baseUrl = SITE_URL || 'http://localhost:3000';
  let products = [];

  try {
    // 1. Fetch products
    const res = await fetch(`${baseUrl}/api/products`, {
      next: {
        revalidate: 100
      } 
    });

    if (!res.ok) {
      return (
        <div className="flex items-center justify-center h-full w-full p-8 text-red-500 bg-black">
          <p>Failed to load products. Check API connection.</p>
        </div>
      );
    }

    // 2. Parse JSON
    const data = await res.json();
    const fetchedProducts = data?.products || [];

    // 3. ✅ SORT PRODUCTS A-Z BY TITLE
    products = fetchedProducts.sort((a: any, b: any) => {
      const titleA = a.title?.toLowerCase() || "";
      const titleB = b.title?.toLowerCase() || "";
      return titleA.localeCompare(titleB);
    });

  } catch (error) {
    console.error("Failed to fetch products for admin list:", error);
    return (
      <div className="flex items-center justify-center h-full w-full p-8 text-red-500 bg-black">
        <p>Something went wrong while fetching products.</p>
      </div>
    );
  }

  return (
    // 'flex-1' fills available space in layout
    // 'w-full' ensures no horizontal overflow
    // 'bg-black' matches your theme
    <div className="flex flex-col flex-1 w-full max-w-full gap-4 p-4 md:p-6 bg-black text-white">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-gray-400">Manage your course catalog (A-Z Sorted)</p>
        </div>
      </div>

      {/* Table Client Component */}
      {/* We wrap it in flex-1 to let the table control its own internal scrolling if needed */}
      <div className="flex-1 w-full overflow-hidden">
        <ProductListClient initialData={products} />
      </div>
      
    </div>
  );
}