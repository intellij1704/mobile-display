"use client";
import { useAuth } from "@/context/AuthContext";
import { useReviews } from "@/lib/firestore/reviews/read";
import { deleteReview } from "@/lib/firestore/reviews/write";
import { Avatar, CircularProgress, Rating } from "@mui/material";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import EmptyState from "./EmptyState";

export default function Reviews({ productId }) {
  const { data, isLoading: reviewsLoading } = useReviews({ productId });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const { user } = useAuth();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (!user) throw new Error("Please sign in to delete reviews");
      await deleteReview({ uid: user.uid, productId, reviewId: reviewToDelete });
      toast.success("Review deleted successfully");
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to delete review");
    }
    setIsDeleting(false);
  };

  const openDeleteModal = (reviewId) => {
    setReviewToDelete(reviewId);
    setDeleteModalOpen(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 border border-gray-100 rounded-md">
      <h2 className="text-2xl text-center font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {reviewsLoading ? (
        <div className="flex justify-center py-10">
          <CircularProgress />
        </div>
      ) : data?.length > 0 ? (
        <div className="space-y-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              aria-labelledby={`review-${item.id}-title`}
            >
              <div className="flex gap-4">
                <Avatar
                  src={item.photoURL}
                  alt={`${item.displayName}'s avatar`}
                  className="w-12 h-12 border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3
                      id={`review-${item.id}-title`}
                      className="font-semibold text-gray-800 truncate"
                    >
                      {item.displayName}
                    </h3>
                    {user?.uid === item.uid && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        isDisabled={isDeleting}
                        onPress={() => openDeleteModal(item.id)}
                        className="text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
                        aria-label="Delete review"
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>
                  <Rating
                    value={item.rating}
                    readOnly
                    size="small"
                    precision={0.5}
                    className="mt-2"
                  />
                  <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                    {item.message}
                  </p>
                  {item.createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No reviews yet"
          description="Be the first to share your thoughts about this product"
          className="py-8"
        />
      )}

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="bg-gray-100">
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this review? This azione cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              isDisabled={isDeleting}
              onPress={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}