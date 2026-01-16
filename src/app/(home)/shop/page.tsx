import ShopClient from "@/components/home/ShopClient"; // ✅ Correct component path
import { SITE_URL } from "@/types";

;

export default async function ProductsPage() {

  // 1. Fetch Data in Parallel (Faster)
  // We use Promise.all to fetch products and categories at the same time
  const [productsRes, categoriesRes] = await Promise.all([
    fetch(`${SITE_URL}/api/products`, { 
      cache: "force-cache", 
      next: { revalidate: 180 } 
    }),
    fetch(`${SITE_URL}/api/categories`, { 
      cache: "force-cache", 
      next: { revalidate: 580 } 
    })
  ]);

  // 2. Error Handling
  if (!productsRes.ok || !categoriesRes.ok) {
    // In a real app, you might want to render a specific error UI here
    console.error("Failed to fetch shop data");
    return <div className="text-white p-10">Failed to load shop data. Please refresh.</div>;
  }

  // 3. Parse JSON
  // Note: The API already returns serialized data (strings), 
  // so we don't need to manually map .toString() or .toISOString()
  const productsData = await productsRes.json();
  const categoriesData = await categoriesRes.json();

  const products = productsData.products || [];
  const categories = categoriesData.categories || [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Pass data directly to the Client Component */}
      <ShopClient products={products} categories={categories} />
    </div>
  );
}