import CategorySection from "@/components/CategorySLider";
import HeroSection from "@/components/HeroSlider";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import ProductList from "@/components/home/ProductList";
import HowToBuySection from "@/components/HowToBuySection";
import ReviewSlider from "@/components/ReviewSlider";
import { IProduct, SITE_URL } from "@/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link"; // FIXED: Imported Next.js Link instead of Lucide icon

export default async function Home() {
  // Initialize default empty states to prevent undefined errors
  let products: IProduct[] = [];
  let categories: any[] = [];

  try {
    // Run fetches in parallel for better performance
    const [response, categoryResponse] = await Promise.all([
      fetch(`${SITE_URL}/api/products`, {
        next: { revalidate: 180 },
      }),
      fetch(`${SITE_URL}/api/categories`, {
        next: { revalidate: 180 },
      }),
    ]);

    if (response.ok) {
      const data = await response.json();
      products = data?.products || [];
    } else {
      console.error("Failed to fetch products. Status:", response.status);
    }

    if (categoryResponse.ok) {
      const categoriesData = await categoryResponse.json();
      categories = categoriesData?.categories || [];
    } else {
      console.error("Failed to fetch categories. Status:", categoryResponse.status);
    }
  } catch (error) {
    // This catches network errors (e.g., server offline during 'next build')
    // and allows the build to finish gracefully without crashing.
    console.error("Error fetching homepage data:", error);
  }

  // Safely filter data (even if products array is empty, this won't crash)
  const featuredProducts = products.filter(
    (product: IProduct) => product.isFeatured === true
  );

  // safe even if the array has fewer than 50 items
  const popularProducts = products.slice(32, 50); 

  return (
    <div>
      <HeroSection />
      
      {/* Only render categories if they exist */}
      {categories.length > 0 && <CategorySection categories={categories} />}

      {/* Featured Courses */}
      {featuredProducts.length > 0 && (
        <FeaturedCourses products={featuredProducts} />
      )}

      <HowToBuySection />

      {/* Popular Courses Header */}
      <div className="flex items-center justify-between mb-6 md:mb-10">
        <div className="flex sm:ml-28 ml-2 items-center gap-2">
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

      {/* Product Lists */}
      {products.length > 0 ? (
        <ProductList products={products} />
      ) : (
        <div className="text-center text-gray-400 py-10">
          No products found at the moment. Please check back later.
        </div>
      )}

      {popularProducts.length > 0 && (
        <FeaturedCourses products={popularProducts} />
      )}

      <ReviewSlider />
    </div>
  );
}