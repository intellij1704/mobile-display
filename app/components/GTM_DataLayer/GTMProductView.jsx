"use client";

import { useEffect } from "react";
import { getBrand } from "@/lib/firestore/brands/read_server";
import { getCategory } from "@/lib/firestore/categories/read_server";

export default function GTMProductView({
  product,
  effectivePrice,
  isInStock,
}) {
  useEffect(() => {
    const handleGTM = async () => {
      // Ensure dataLayer exists
      window.dataLayer = window.dataLayer || [];

      let categoryName = product?.categoryName || "Mobile Spare Parts";
      let brandName = product?.brand || "Mobile Display";

      try {
        if (product?.categoryId) {
          const cat = await getCategory({ id: product.categoryId });
          if (cat?.name) categoryName = cat.name;
        }
        if (product?.brandId) {
          const brand = await getBrand({ id: product.brandId });
          if (brand?.name) brandName = brand.name;
        }
      } catch (error) {
        console.error("GTM Data Fetch Error", error);
      }

      /* ----------------------------------
         PAGE CONTEXT (WooCommerce style)
      ----------------------------------- */
      window.dataLayer.push({
        pagePostType: "product",
        pagePostType2: "single-product",
        productType: product?.isVariable ? "variable" : "simple",
        productIsVariable: product?.isVariable ? 1 : 0,
        productReviewCount: product?.reviewCount || 0,
        productAverageRating: product?.averageRating || 0,
        productRatingCounts: product?.ratingCounts || [],
        cartContent: {
          totals: {
            applied_coupons: [],
            discount_total: 0,
            subtotal: 0,
            total: 0,
          },
          items: [],
        },
      });

      /* ----------------------------------
         GA4 VIEW ITEM EVENT
      ----------------------------------- */
      window.dataLayer.push({
        event: "view_item",
        ecommerce: {
          currency: "INR",
          value: effectivePrice || 0,
          items: [
            {
              item_id: product?.id,
              item_name: product?.title,
              sku: product?.sku || product?.id,
              price: effectivePrice || 0,
              stocklevel: product?.stock ?? null,
              stockstatus: "instock",
              google_business_vertical: "retail",
              item_category: categoryName,
              item_brand: brandName,
              product_type: product?.isVariable ? "variable" : "simple",
            },
          ],
        },
      });
    };

    if (product) {
      handleGTM();
    }
  }, [product, effectivePrice, isInStock]);

  return null;
}
