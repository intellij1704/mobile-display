"use client";

import { useAdmins } from "@/lib/firestore/admins/read";
import { deleteAdmin } from "@/lib/firestore/admins/write";
import { CircularProgress } from "@mui/material";
import { Button, Tooltip } from "@nextui-org/react";
import { Edit2, Trash2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ListView() {
  const { data: admins, error, isLoading } = useAdmins();

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-50">
        <CircularProgress size={48} thickness={4} color="primary" />
        <p className="mt-4 text-gray-600 font-medium">Loading admins...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-600 font-medium text-center mt-10">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-5 md:px-5 px-4 pb-10">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Management</h1>
        <span className="text-sm text-gray-500">
          {admins?.length || 0} total admin{admins?.length !== 1 && "s"}
        </span>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm transition-all">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {["SN", "Image", "Name & Email", "Actions"].map((head) => (
                <th
                  key={head}
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-700 border-b"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {admins?.map((item, index) => (
                <Row key={item?.id} item={item} index={index} total={admins?.length} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {admins?.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">
            No admins found.
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ item, index, total }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const isMainAdmin = index === 0;

  // Handle delete logic
  const handleDelete = async () => {
    if (isMainAdmin) {
      toast.error("Main admin cannot be deleted.");
      return;
    }

    if (total <= 1) {
      toast.error("At least one admin must remain.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${item?.name}?`)) return;

    setIsDeleting(true);
    try {
      await deleteAdmin({ id: item?.id });
      toast.success("Admin deleted successfully.");
    } catch (error) {
      toast.error(error?.message || "Failed to delete admin.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = () => router.push(`/admin/admins?id=${item?.id}`);

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="group hover:bg-gray-50 transition-colors"
    >
      {/* Index */}
      <td className="px-5 py-4 border-b text-center text-gray-700 font-medium">
        {index + 1}
      </td>

      {/* Image */}
      <td className="px-5 py-4 border-b">
        <div className="flex justify-center">
          <img
            src={item?.imageURL || "/default-avatar.png"}
            alt={item?.name || "Admin"}
            className="h-11 w-11 rounded-full object-cover border border-gray-200 shadow-sm"
          />
        </div>
      </td>

      {/* Name & Email */}
      <td className="px-5 py-4 border-b">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{item?.name}</span>
            {isMainAdmin && (
              <Tooltip
                color="primary"
                showArrow
                content="Main admin – cannot be deleted"
                placement="top"
              >
                <div className="flex items-center justify-center rounded-full bg-blue-100 p-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
              </Tooltip>
            )}
          </div>
          <span className="text-xs text-gray-500">{item?.email}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <Tooltip content="Edit admin" placement="top">
            <Button
              onClick={handleUpdate}
              isDisabled={isDeleting}
              isIconOnly
              radius="full"
              size="sm"
              variant="flat"
              className="text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <Edit2 size={16} />
            </Button>
          </Tooltip>

          {/* Delete Button */}
          <Tooltip
            color={isMainAdmin ? "default" : "danger"}
            content={
              isMainAdmin
                ? "Main admin cannot be deleted"
                : isDeleting
                ? "Deleting..."
                : "Delete admin"
            }
            placement="top"
            showArrow
          >
            <Button
              onClick={handleDelete}
              isDisabled={isMainAdmin || isDeleting}
              isLoading={isDeleting}
              isIconOnly
              radius="full"
              size="sm"
              color={isMainAdmin ? "default" : "danger"}
              variant={isMainAdmin ? "flat" : "shadow"}
              className={`transition-all duration-200 ${
                isMainAdmin ? "cursor-not-allowed opacity-60" : "hover:opacity-90"
              }`}
            >
              <Trash2 size={16} />
            </Button>
          </Tooltip>
        </div>
      </td>
    </motion.tr>
  );
}
