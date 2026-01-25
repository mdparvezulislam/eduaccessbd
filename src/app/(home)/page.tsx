import CategorySection from "@/components/CategorySLider";
import HeroSection from "@/components/HeroSlider";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import ProductList from "@/components/home/ProductList";
import HowToBuySection from "@/components/HowToBuySection";
import { IProduct, SITE_URL } from "@/types";
import { ArrowRight, Link } from "lucide-react";

export default async function Home() {
  const response = await fetch(`${SITE_URL}/api/products`, {
    cache: "force-cache",
    next: { revalidate: 180 },
  });

  const categoryResponse = await fetch(`${SITE_URL}/api/categories`, {
    cache: "force-cache",
    next: { revalidate: 180 },
  });

  const categoriesData = await categoryResponse.json();
  const categories = categoriesData.categories;

  if (!response.ok || !categoryResponse.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();
//  filter featured products
 const featuredProducts = data.products.filter((product: IProduct) => product.isFeatured === true);
 
//  filter popular products
  const popularProducts = data.products.slice(32, 50);
  return (
    <div>
      <HeroSection />
      <CategorySection categories={categories} />
 
      <FeaturedCourses products={featuredProducts} />
           <HowToBuySection />
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-10">
        <div className="flex sm:ml-28 ml-2  items-center gap-2">
          <div className="h-8 w-1 bg-green-500 rounded-full"></div>
          <h2 className="text-xl md:text-3xl font-bold tracking-wide text-white">
            Popular Courses
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:flex items-center text-sm font-medium text-gray-400 hover:text-green-400 transition-colors"
        >
          View All <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      <ProductList products={data?.products} />
       <FeaturedCourses products={popularProducts} />
    </div>
  );
}
