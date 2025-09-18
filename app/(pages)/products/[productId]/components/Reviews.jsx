"use client";
import { useAuth } from "@/context/AuthContext";
import { useReviews } from "@/lib/firestore/reviews/read";
import { deleteReview } from "@/lib/firestore/reviews/write";
import { CircularProgress, Rating } from "@mui/material";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import EmptyState from "./EmptyState";
import { CheckCircle } from "@mui/icons-material";

export default function Reviews({ productId }) {
  const { data: rawData, isLoading: reviewsLoading } = useReviews({ productId });
  const data = rawData || [];
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const { user } = useAuth();

  // Aggregates
  const totalReviews = data.length;
  const ratingSum = data.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;
  const getLabel = (rating) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Good choice";
    if (rating >= 3.0) return "Average";
    if (rating >= 2.0) return "Poor";
    return "Very poor";
  };
  const overallLabel = getLabel(averageRating);
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data.forEach((review) => {
    const rounded = Math.round(review.rating);
    if (rounded >= 1 && rounded <= 5) counts[rounded]++;
  });
  const maxCount = Math.max(...Object.values(counts), 1);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (!user) throw new Error("Please sign in to delete reviews");
      await deleteReview({ uid: user.uid, productId, reviewId: reviewToDelete });
      toast.success("Review deleted successfully");
      closeModal();
    } catch (error) {
      toast.error(error?.message || "Failed to delete review");
    }
    setIsDeleting(false);
  };

  const openDeleteModal = (reviewId) => {
    setReviewToDelete(reviewId);
    setDeleteModalOpen(true);
  };

  const closeModal = () => {
    setAnimate(false);
    setTimeout(() => {
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    }, 300);
  };

  // Close modal on ESC key
  const handleEscKey = (e) => {
    if (e.key === "Escape") closeModal();
  };

  useEffect(() => {
    if (deleteModalOpen) {
      setTimeout(() => setAnimate(true), 10);
      document.addEventListener("keydown", handleEscKey);
    } else {
      document.removeEventListener("keydown", handleEscKey);
    }
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [deleteModalOpen]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 border border-gray-100 rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Verified Reviews :</h2>
      </div>

      {reviewsLoading ? (
        <div className="flex justify-center py-10">
          <CircularProgress />
        </div>
      ) : totalReviews > 0 ? (
        <>
          <div className="mb-8">
            <div className="flex md:flex-row flex-col md:items-center items-start gap-2">
              <span className="text-xl font-semibold">{overallLabel}</span>
              <Rating
                value={averageRating}
                readOnly
                precision={0.1}
                sx={{
                  "& .MuiRating-iconFilled": { color: "green" },
                  "& .MuiRating-iconEmpty": { color: "lightgray" },
                }}
              />
              <span className="text-gray-600">
                {totalReviews.toLocaleString()} rating {totalReviews.toLocaleString()} reviews
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {[5, 4, 3, 2, 1].map((star, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-10 text-sm">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 mx-2">
                    <div
                      className="h-2 bg-green-500"
                      style={{ width: `${(counts[star] / maxCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-20 text-right text-sm">{counts[star]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {data.map((item,index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Rating
                        value={item.rating}
                        readOnly
                        precision={0.5}
                        sx={{
                          "& .MuiRating-iconFilled": { color: "green" },
                          "& .MuiRating-iconEmpty": { color: "lightgreen" },
                        }}
                      />
                      <span className="font-medium text-gray-800">
                        {item.rating.toFixed(1)} • {getLabel(item.rating)}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{item.message}</p>
                    <p className="mt-1 flex items-center text-sm text-green-600">
                      <CheckCircle fontSize="small" className="mr-1" />
                      <span className="text-black"> Verified Buyer</span>
                    </p>
                  </div>
                  {user?.uid === item.uid && (
                    <button
                      disabled={isDeleting}
                      onClick={() => openDeleteModal(item.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                      aria-label="Delete review"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No reviews yet"
          description="Be the first to share your thoughts about this product"
          className="py-8"
        />
      )}

      {/* Animated Delete Modal */}
      {deleteModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[50]"
            onClick={closeModal}
          />
          <div
            className={`fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
              bg-white p-6 rounded-lg shadow-lg z-[9999] w-full max-w-md transition-all duration-300 ease-in-out
              ${animate ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-800">Confirm Deletion</h2>
            <p className="mt-3 text-sm text-gray-600">
              Are you sure you want to delete this review?{" "}
              <span className="font-medium text-red-600">This action cannot be undone.</span>
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition
                  ${isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
