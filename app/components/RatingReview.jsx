"use client";

import React, { useEffect, useState } from "react";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import { Star } from "lucide-react";

function RatingReview({ product }) {
  const [average, setAverage] = useState(4.5);

  useEffect(() => {
    if (!product?.id) return;

    getProductReviewCounts({ productId: product.id })
      .then((data) => {
        if (data?.averageRating) setAverage(data.averageRating);
      })
      .catch((err) => console.error("Error fetching rating:", err));
  }, [product?.id]);

  return (
    <div className="flex items-center border border-[#00000099] rounded px-1 h-6 text-xs font-medium">
      <span>{average.toFixed(1)}</span>
      <Star className="w-3 h-3 text-yellow-500 ml-1 fill-yellow-500" />
    </div>
  );
}

export default RatingReview;
