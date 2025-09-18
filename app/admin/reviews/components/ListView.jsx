"use client";

import { useState, useMemo } from "react";
import { useAllReview } from "@/lib/firestore/reviews/read";
import { useProduct } from "@/lib/firestore/products/read";
import { deleteReview } from "@/lib/firestore/reviews/write";
import { Trash2, Search } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";

export default function ReviewsDashboard() {
  const { data: reviews, isLoading, error } = useAllReview();
  const [search, setSearch] = useState("");

  // Sort by latest
  const sortedReviews = useMemo(() => {
    return Array.isArray(reviews)
      ? [...reviews].sort(
        (a, b) =>
          (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0)
      )
      : [];
  }, [reviews]);

  // Filter by search
  const filteredReviews = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return sortedReviews;
    return sortedReviews.filter((item) => {
      const productRef =
        typeof item?.productId === "string"
          ? item.productId
          : item?.productId?.id || "";
      const text = `${item?.displayName || ""} ${item?.message || ""} ${productRef}`.toLowerCase();
      return text.includes(q);
    });
  }, [sortedReviews, search]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Customer Reviews</h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
          <CircularProgress size={50} color="primary" thickness={4} />
          <p className="mt-4 text-center text-gray-600">Please Wait...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-20 text-red-500">
          Failed to load reviews: {String(error)}
        </div>
      )}

      {/* List */}
      {!isLoading && !error && (
        <>
          {filteredReviews.length > 0 ? (
            <div className="grid gap-5">
              {filteredReviews.map((item, index) => (
                <ReviewCard key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              {search ? "No reviews match your search." : "No reviews yet."}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReviewCard({ item }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const productId =
    typeof item?.productId === "string" ? item.productId : item?.productId?.id;
  const { data: product } = useProduct({ productId: productId ?? null });

  const reviewDate = item?.timestamp?.toDate
    ? new Date(item.timestamp.toDate()).toLocaleDateString()
    : "";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setIsDeleting(true);
    try {
      await deleteReview({ uid: item?.uid, productId });
      toast.success("Review deleted successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition">
      <div className="flex gap-4">
        {/* Avatar */}
        <img
          src={item?.photoURL || "/default-avatar.png"}
          alt="avatar"
          className="w-12 h-12 rounded-full border object-cover"
        />

        <div className="flex-1 flex flex-col gap-2">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-lg text-gray-900">
                {item?.displayName || "Anonymous"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Stars count={item?.rating || 0} />
                <span className="text-sm text-gray-500">
                  {item?.rating ? `${item.rating}/5` : ""}
                </span>
              </div>
              {productId && (
                <Link
                  href={`/products/${productId}`}
                  className="text-sm text-blue-600 hover:underline mt-1 block"
                >
                  {product?.title || "Unknown Product"}
                </Link>
              )}
            </div>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 transition disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Date */}
          {reviewDate && (
            <span className="text-xs text-gray-400">{reviewDate}</span>
          )}

          {/* Message */}
          <p className="mt-2 text-gray-700 text-sm bg-gray-50 border rounded-lg px-4 py-3 leading-relaxed">
            {item?.message || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* Simple Tailwind stars (no external UI lib) */
function Stars({ count }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < count);
  return (
    <div className="flex gap-0.5">
      {stars.map((filled, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 ${filled ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.975a1 1 0 00.95.69h4.184c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.922-.755 1.688-1.54 1.118L10 13.347l-3.391 2.462c-.785.57-1.838-.196-1.539-1.118l1.287-3.974a1 1 0 00-.364-1.118L2.603 9.402c-.783-.57-.38-1.81.588-1.81h4.184a1 1 0 00.95-.69l1.286-3.975z" />
        </svg>
      ))}
    </div>
  );
}
