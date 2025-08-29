// components/SpecialOfferListView.jsx
"use client"

import { useSpecialOffers } from "@/lib/firestore/specialOffers/read"
import { deleteSpecialOffer, toggleSpecialOfferStatus } from "@/lib/firestore/specialOffers/write"
import { Edit2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"  // Added useEffect import
import toast from "react-hot-toast"

export default function SpecialOfferListView() {
  const { data: specialOffers, error, isLoading } = useSpecialOffers()
  const router = useRouter()

  // New: Auto-deactivate expired offers
  useEffect(() => {
    if (!isLoading && specialOffers && specialOffers.length > 0) {
      const today = new Date().toISOString().split('T')[0];  // e.g., "2025-08-28"

      specialOffers.forEach(async (offer) => {
        if (offer.status === "Active" && offer.endDate) {
          if (offer.endDate < today) {  // String comparison works for YYYY-MM-DD
            try {
              await toggleSpecialOfferStatus({ id: offer.id, status: "Inactive" });
              toast.success(`Special offer "${offer.title}" auto-deactivated (expired)`);
              console.log(`Auto-deactivated expired offer: ${offer.id}`);
            } catch (error) {
              console.error("Failed to auto-deactivate offer:", error);
              toast.error(`Failed to auto-deactivate "${offer.title}": ${error.message}`);
            }
          }
        }
      });
    }
  }, [isLoading, specialOffers]);  // Re-runs on data changes (real-time updates)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading special offers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">Error loading special offers</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!specialOffers?.length) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No special offers found</h3>
        <p className="text-gray-600">Create a new special offer to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Special Offers</h1>
          <p className="text-gray-600 mt-1">Manage your promotional offers and discounts</p>
        </div>
        <div className="text-sm text-gray-500">
          {specialOffers.length} offer{specialOffers.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Offer Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Coupon Code
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {specialOffers.map((item, index) => (
                <Row key={item?.id} item={item} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Row and ToggleSwitch components remain unchanged...
function Row({ item, index }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this special offer?")) return

    setIsDeleting(true)
    try {
      await deleteSpecialOffer({ id: item?.id })
      toast.success("Special Offer deleted successfully")
    } catch (error) {
      toast.error(error?.message || "Failed to delete special offer")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (
      !confirm(`Are you sure you want to ${item?.status === "Active" ? "deactivate" : "activate"} this special offer?`)
    )
      return

    setIsToggling(true)
    try {
      const newStatus = item?.status === "Active" ? "Inactive" : "Active"
      await toggleSpecialOfferStatus({ id: item?.id, status: newStatus })
      toast.success(`Special Offer ${newStatus.toLowerCase()}d successfully`)
    } catch (error) {
      toast.error(error?.message || "Failed to toggle special offer status")
    } finally {
      setIsToggling(false)
    }
  }

  const handleUpdate = () => {
    router.push(`/admin/special-offers?id=${item?.id}`)
  }

  const isActive = item?.status === "Active"

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
          {index + 1}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <div className="text-sm font-semibold text-gray-900 mb-1 truncate max-w-[150px] sm:max-w-none">
            {item?.offerType}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-xl font-medium text-green-600">{item?.discountPercentage}%</div>
          <div className="ml-2 text-xs text-gray-500">OFF</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`text-sm px-2 py-1 rounded-xl font-medium ${item?.couponCode ? 'bg-green-100' : ""}  text-green-800`}>{item?.couponCode }</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          <div className="font-medium">{item?.startDate}</div>
          <div className="text-gray-500">to {item?.endDate}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
          >
            {item?.status}
          </span>
          <ToggleSwitch isActive={isActive} isLoading={isToggling} onToggle={handleToggleStatus} />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={handleUpdate}
            disabled={isDeleting || isToggling}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Edit offer"
          >
            <Edit2 size={14} />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting || isToggling}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete offer"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </td>
    </tr>
  )
}

function ToggleSwitch({ isActive, isLoading, onToggle }) {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? "bg-green-500" : "bg-gray-300"
        }`}
      title={`${isActive ? "Deactivate" : "Activate"} offer`}
    >
      <span className="sr-only">Toggle offer status</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${isActive ? "translate-x-6" : "translate-x-1"
          }`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-2 w-2 border-b border-gray-400"></div>
          </div>
        )}
      </span>
    </button>
  )
}