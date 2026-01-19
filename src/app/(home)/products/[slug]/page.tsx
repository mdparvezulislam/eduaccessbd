
import { notFound } from "next/navigation";
import { IProduct, SITE_URL } from "@/types";
import ProductList from "@/components/home/ProductList";
import CategorySection from "@/components/CategorySLider";


//  Generate Static  Metadata With Slug Get Category Name
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; 
    const res = await fetch(`${SITE_URL}/api/products`, {
          cache: "no-store", // Ensure fresh data, essential for dynamic pricing/availability
        });
        const products = await res.json();  
// filter product by category slug
  const product = products?.products.filter((prod: IProduct) => prod.category.slug === slug);
  if (!product) {
    return {
      title: 'Category Not Found',
      description: 'The requested category does not exist.',
    };
  }
  const categoryName = product[0]?.category.name || 'Products';

  return {
    title: `${categoryName} `,
    description: `Explore our exclusive collection of ${categoryName.toLowerCase()} at My E-commerce Store. Find the best deals and latest trends in ${categoryName.toLowerCase()}.`,
    openGraph: {
      title: `${categoryName} `,
      description: `Explore our exclusive collection of ${categoryName.toLowerCase()} at My E-commerce Store. Find the best deals and latest trends in ${categoryName.toLowerCase()}.`,
      url: `${SITE_URL}/products/${slug}`,
      siteName: 'My E-commerce Store',
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'My E-commerce Store',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} - My E-commerce Store`,
      description: `Explore our exclusive collection of ${categoryName.toLowerCase()} at My E-commerce Store. Find the best deals and latest trends in ${categoryName.toLowerCase()}.`,
      images: [`${SITE_URL}/og-image.png`],
    },
  };
}

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