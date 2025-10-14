"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

export default function EditAddressModal({
    isEditingAddress,
    setIsEditingAddress,
    editedAddress,
    handleAddressChange,
    handleUpdateAddress,
    updateError,
    isUpdating,
}) {
    const modalRef = useRef(null);

    // Close on ESC key press
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                setIsEditingAddress(false);
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [setIsEditingAddress]);



    // Close on outside click
    const handleOutsideClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            setIsEditingAddress(false);
        }
    };

    return (
        <AnimatePresence>
            {isEditingAddress && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleOutsideClick}
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()} // Prevent click bubbling
                    >
                        {/* Header */}
                        <div className="sticky top-0 flex items-center justify-between p-5 border-b bg-white/90 backdrop-blur-sm z-10">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                                Edit Shipping Address
                            </h2>
                            <button
                                onClick={() => setIsEditingAddress(false)}
                                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
                            {updateError && (
                                <p className="text-red-600 text-sm font-medium">
                                    {updateError}
                                </p>
                            )}

                            {[
                                ["Full Name", "fullName", "text"],
                                ["Email", "email", "email"],
                                ["Mobile", "mobile", "text"],
                                ["Address Line 1", "addressLine1", "text"],
                                ["Address Line 2 (Optional)", "addressLine2", "text"],
                                ["City", "city", "text"],
                                ["State", "state", "text"],
                                ["Pincode", "pincode", "text"],
                                ["Landmark (Optional)", "landmark", "text"],
                                ["Country", "country", "text"],
                            ].map(([label, name, type]) => (
                                <div key={name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        name={name}
                                        value={editedAddress[name] || ""}
                                        onChange={handleAddressChange}
                                        className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Notes (Optional)
                                </label>
                                <textarea
                                    name="note"
                                    value={editedAddress.note || ""}
                                    onChange={handleAddressChange}
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 flex justify-end gap-3 p-5 border-t bg-white/90 backdrop-blur-sm">
                            <button
                                onClick={() => setIsEditingAddress(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdateAddress}
                                disabled={isUpdating}
                                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Address"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
