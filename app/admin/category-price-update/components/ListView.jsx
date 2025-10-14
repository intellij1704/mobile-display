// Path: src/components/ListView.js (New Component for History Table)
import { useCategories } from "@/lib/firestore/categories/read";
import { usePriceUpdateHistory } from "@/lib/firestore/products/read";
import { revisePriceUpdate } from "@/lib/firestore/products/write";
import React, { useState } from "react";
import toast from "react-hot-toast";



const ListView = () => {
  const { data: history, isLoading: historyLoading, error: historyError, refetch } = usePriceUpdateHistory();
  const { data: categories } = useCategories();
  const [loadingIds, setLoadingIds] = useState([]);

  const getCategoryName = (categoryId) => {
    const cat = categories?.find((c) => c.id === categoryId);
    return cat ? (cat.name || cat.title || cat.id) : "Unknown";
  };

  const handleRevise = async (historyId, categoryId) => {
    if (loadingIds.includes(historyId)) return;
    setLoadingIds((prev) => [...prev, historyId]);
    try {
      await revisePriceUpdate({ historyId });
      toast.success(`Prices revised for category ${getCategoryName(categoryId)}`);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== historyId));
    }
  };

  if (historyLoading) return <p className="text-center">Loading history...</p>;
  if (historyError) return <p className="text-red-500 text-center">{historyError}</p>;
  if (!history || history.length === 0) return <p className="text-center">No update history available.</p>;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-center">Price Update History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Percentage (%)</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td className="py-2 px-4 border-b">{getCategoryName(item.categoryId)}</td>
                <td className="py-2 px-4 border-b">{item.percentage}</td>
                <td className="py-2 px-4 border-b">
                  {item.timestamp?.toDate()?.toLocaleString() || "N/A"}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleRevise(item.id, item.categoryId)}
                    className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 
                    focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    disabled={item.revised || loadingIds.includes(item.id)}
                  >
                    {loadingIds.includes(item.id) ? "Revising..." : "Revise Price"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;