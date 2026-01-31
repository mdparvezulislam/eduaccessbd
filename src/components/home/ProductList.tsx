"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/types";
import {
  ShoppingCart,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useCart, PlanType } from "@/lib/CartContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ✅ Helper Type
type VipPlanKey = "monthly" | "yearly" | "lifetime";

/* ========================================================================
   PRODUCT CARD (Ultra Clean + No Extra Space)
======================================================================== */

const ProductCard = ({ product }: { product: IProduct }) => {
  const { addToCart, mapProductToCartItem } = useCart();

  const pricing = product.pricing || {};
  const availablePlans: VipPlanKey[] = [];
  if (pricing.monthly?.isEnabled) availablePlans.push("monthly");
  if (pricing.yearly?.isEnabled) availablePlans.push("yearly");
  if (pricing.lifetime?.isEnabled) availablePlans.push("lifetime");

  const [selectedPlan, setSelectedPlan] = useState<
    VipPlanKey | "default"
  >(availablePlans.length ? availablePlans[0] : "default");

  let displayPrice = product.salePrice || product.defaultPrice || 0;
  let regularPrice = product.regularPrice || 0;
  let validityLabel = "Standard";

  if (selectedPlan !== "default" && pricing[selectedPlan]) {
    const plan = pricing[selectedPlan];
    displayPrice = plan.price;
    regularPrice = plan.regularPrice || 0;
    validityLabel = plan.validityLabel;
  }

  const discount =
    regularPrice > displayPrice
      ? Math.round(((regularPrice - displayPrice) / regularPrice) * 100)
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const planArg =
      selectedPlan !== "default"
        ? (selectedPlan as PlanType)
        : undefined;

    const cartItem = mapProductToCartItem(product, 1, planArg);
    addToCart(cartItem);
    toast.success(`Added ${product.title}`);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="group flex flex-col h-full bg-[#0b0b0b] border border-white/5 rounded-md overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-md hover:shadow-black/40">

      <Link
        href={`/product/${product.slug}`}
        className="flex flex-col h-full"
      >
        {/* IMAGE */}
        <div className="relative w-full aspect-square bg-[#060606] overflow-hidden">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700 text-[9px]">
              NO IMAGE
            </div>
          )}

          {discount > 0 && (
            <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] px-1 py-0.5 rounded font-bold">
              -{discount}%
            </span>
          )}

          {selectedPlan !== "default" && (
            <span className="absolute bottom-1 right-1 bg-black/80 border border-white/10 text-gray-200 text-[8px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-2 h-2 text-blue-400" />
              {validityLabel}
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex flex-col flex-1 px-2 py-1 gap-1">

          <h3
            className="text-[11px] sm:text-[12px] font-medium text-gray-200 line-clamp-2 min-h-[2.2em] group-hover:text-white"
            title={product.title}
          >
            {product.title}
          </h3>

          {availablePlans.length > 0 ? (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Select
                value={selectedPlan}
                onValueChange={(v) =>
                  setSelectedPlan(v as VipPlanKey)
                }
              >
                <SelectTrigger className="h-6 text-[9px] bg-white/5 border-white/10 text-gray-400 rounded px-1">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1d] border-white/10 text-gray-300">
                  {availablePlans.map((planKey) => (
                    <SelectItem
                      key={planKey}
                      value={planKey}
                      className="text-[9px]"
                    >
                      {planKey}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="h-4 flex items-center text-[9px] text-gray-500">
              <Check className="w-2.5 h-2.5 text-green-500 mr-1" />
              Instant Access
            </div>
          )}

          {/* PRICE */}
          <div className="flex items-center justify-between mt-auto pt-1 border-t border-white/5">
            <div className="flex items-baseline gap-1">
              {regularPrice > displayPrice && (
                <span className="text-[8px] text-gray-300 line-through">
                  {formatPrice(regularPrice)}
                </span>
              )}
              <span className="text-[13px] sm:text-[14px] font-bold text-white">
                {formatPrice(displayPrice)}
              </span>
            </div>

            <Button
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7 rounded bg-white text-black hover:bg-blue-500 hover:text-white active:scale-95"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

/* ========================================================================
   MAIN PRODUCT LIST PAGE
======================================================================== */

const ProductList = ({ products }: { products: IProduct[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  if (!products?.length) return null;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document
      .getElementById("product-list-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="product-list-section"
      className="bg-[#050505] py-4 text-white overflow-x-hidden"
    >
      <div className="max-w-[1320px] mx-auto px-0 sm:px-4">

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {currentProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center items-center gap-1.5">

            <Button
              size="icon"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-7 w-7 border-white/10 bg-[#111] text-gray-400"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            <div className="flex gap-1 bg-[#111] border border-white/5 rounded px-1 py-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-6 w-6 text-[11px] rounded ${
                      currentPage === page
                        ? "bg-white text-black"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <Button
              size="icon"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-7 w-7 border-white/10 bg-[#111] text-gray-400"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
