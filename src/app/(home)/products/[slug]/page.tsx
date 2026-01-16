
import { notFound } from "next/navigation";
import { IProduct, SITE_URL } from "@/types";
import ProductList from "@/components/home/ProductList";
import CategorySection from "@/components/CategorySLider";



// 2. The Server Page Component
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; 
    const res = await fetch(`${SITE_URL}/api/products`, {
      cache: "no-store", // Ensure fresh data, essential for dynamic pricing/availability
    });
    const products = await res.json();
// filter product by category slug
  const product = products?.products.filter((prod: IProduct) => prod.category.slug === slug);
  console.log(product)
  if (!product) {
    return notFound();
  }

     const categoryResponse = await fetch(`${SITE_URL}/api/categories`, {
          cache: "force-cache", next: { revalidate: 180 }
        });

        const categoriesData = await categoryResponse.json();
        const categories = categoriesData.categories;

  return (
    <div className="min-h-screen bg-black text-white">
      <CategorySection categories={categories} />
      <ProductList products={product} />
    </div>
  );
}