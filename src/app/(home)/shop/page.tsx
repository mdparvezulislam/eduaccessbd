import ShopClient from "@/components/home/ShopClient"; // ✅ Correct component path
import { SITE_URL } from "@/types";

export default async function ProductsPage() {
  // 1. Initialize default empty states to prevent undefined errors
  let products = [];
  let categories = [];

  try {
    // 2. Fetch Data in Parallel (Faster)
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${SITE_URL}/api/products`, {
        next: { revalidate: 360 },
      }),
      fetch(`${SITE_URL}/api/categories`, {
        next: { revalidate: 580 },
      }),
    ]);

    // 3. Safely parse Products
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      products = productsData?.products || [];
    } else {
      console.error("Failed to fetch products. Status:", productsRes.status);
    }

    // 4. Safely parse Categories
    if (categoriesRes.ok) {
      const categoriesData = await categoriesRes.json();
      categories = categoriesData?.categories || [];
    } else {
      console.error("Failed to fetch categories. Status:", categoriesRes.status);
    }
  } catch (error) {
    // This catches complete network failures (e.g., server offline during 'next build')
    // allowing the build to finish gracefully without crashing.
    console.error("Error fetching shop data:", error);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Pass data directly to the Client Component. 
        If the API fails, it safely passes empty arrays [], 
        allowing ShopClient to handle its own "No products found" UI. 
      */}
      <ShopClient products={products} categories={categories} />
    </div>
  );
}