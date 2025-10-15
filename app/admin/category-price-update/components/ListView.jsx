// Path: src/components/ListView.js
import React, { useState, useMemo, useEffect } from "react";
import { useCategories } from "@/lib/firestore/categories/read";
import { usePriceUpdateHistory } from "@/lib/firestore/products/read";
import { revisePriceUpdate } from "@/lib/firestore/products/write";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgress } from "@mui/material";

const ListView = () => {
  const { data: history, isLoading, error, refetch } = usePriceUpdateHistory();
  const { data: categories } = useCategories();

  const [loadingIds, setLoadingIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState(null); // { id, categoryId }
  const [modalLoading, setModalLoading] = useState(false); // for Okay button loader
  const perPage = 8;

  // Helper to get category name
  const getCategoryName = (categoryId) => {
    const cat = categories?.find((c) => c.id === categoryId);
    return cat ? (cat.name || cat.title || cat.id) : "Unknown";
  };

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!history) return [];
    const start = (currentPage - 1) * perPage;
    return history.slice(start, start + perPage);
  }, [history, currentPage]);

  const totalPages = Math.ceil((history?.length || 0) / perPage);

  // Revise handler
  const handleRevise = async (historyId, categoryId) => {
    if (loadingIds.includes(historyId)) return;
    setLoadingIds((prev) => [...prev, historyId]);
    try {
      await revisePriceUpdate({ historyId });
      toast.success(`Prices revised for ${getCategoryName(categoryId)} ✅`);
      await refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== historyId));
    }
  };

  // Modal close (Esc + outside)
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && !modalLoading && setConfirmModal(null);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalLoading]);

  // States
  if (isLoading)
    return <p className="text-center text-gray-600">Loading price update history...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!history || history.length === 0)
    return <p className="text-center text-gray-500">No price update history available.</p>;

  return (
    <div className="mt-10 max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Price Update History
      </h2>

      {/* Table */}
      <div className="overflow-x-auto shadow-lg rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-800 uppercase text-xs">
            <tr>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Percentage</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => {
              const isRevised = item.revised;
              const isLoadingRow = loadingIds.includes(item.id);
              return (
                <tr
                  key={item.id}
                  className="border-t hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {getCategoryName(item.categoryId)}
                  </td>
                  <td className="py-3 px-4">{item.percentage}%</td>
                  <td className="py-3 px-4">
                    {item.timestamp?.toDate
                      ? format(item.timestamp.toDate(), "dd MMM yyyy, hh:mm a")
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isRevised ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Revised
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          setConfirmModal({ id: item.id, categoryId: item.categoryId })
                        }
                        disabled={isLoadingRow}
                        className={`${isLoadingRow
                            ? "bg-gray-400"
                            : "bg-red-500 hover:bg-red-600"
                          } text-white py-1.5 px-4 rounded-full text-sm font-semibold transition duration-150`}
                      >
                        {isLoadingRow ? "Revising..." : "Revise"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-700 text-sm">
            Page <b>{currentPage}</b> of <b>{totalPages}</b>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !modalLoading && setConfirmModal(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Confirm Revision
              </h3>
              <p className="text-sm text-gray-600 mb-5">
                Are you sure you want to revise prices for{" "}
                <b>{getCategoryName(confirmModal.categoryId)}</b>?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  disabled={modalLoading}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setModalLoading(true);
                    await handleRevise(confirmModal.id, confirmModal.categoryId);
                    setModalLoading(false);
                    setConfirmModal(null);
                  }}
                  disabled={modalLoading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {modalLoading ? (
                    <>
                      <CircularProgress size={16} color="inherit" />
                      Revising...
                    </>
                  ) : (
                    "Revise"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListView;
