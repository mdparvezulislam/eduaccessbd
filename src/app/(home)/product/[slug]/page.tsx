import { Metadata } from "next";
import { notFound } from "next/navigation";
import {  SITE_URL } from "@/types"; // Import your type
import ProductDetailsClient from "@/components/ProductDetailsClient";

// Helper to fetch data
async function getProduct(slug: string) {
  try {
    // Replace with your actual API URL
    const res = await fetch(`${SITE_URL}/api/products/slug/${slug}`, {
      cache:"force-cache", next: { revalidate: 180 }, // Ensure fresh data, or use 'force-cache' for SSG
    });

    if (!res.ok) return null;
    const data = await res.json();
   
    return data.success ? data.product : null;
  } catch (error) {
    return null;
  }
}

// 1. Dynamic SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.title} | ProAccess Shop`,
    description: product.shortDescription || product.description.substring(0, 160),
    openGraph: {
      images: [product.thumbnail],
      title: product.title,
      description: product.shortDescription || product.description.substring(0, 160),
      url: `${SITE_URL}/product/${slug}`,
      siteName: "Edu Access Bd",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.shortDescription || product.description.substring(0, 160),
      images: [product.thumbnail],
    },
  };
}

// 2. The Server Page
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return notFound();
  }

  return <ProductDetailsClient product={product} />;
}