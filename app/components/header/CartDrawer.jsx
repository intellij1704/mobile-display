"use client"

import { useAuth } from "@/context/AuthContext"
import { useUser } from "@/lib/firestore/user/read"
import { useProduct } from "@/lib/firestore/products/read"
import { updateCarts } from "@/lib/firestore/user/write"
import { CircularProgress } from "@mui/material"
import { DeleteForever } from "@mui/icons-material"
import { Button } from "@nextui-org/react"
import { Minus, Plus, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo, useCallback } from "react"
import toast from "react-hot-toast"

const getUniqueId = (item) =>
  `${item.id}-${item.selectedColor || ""}-${item.selectedQuality || ""}-${item.selectedBrand || ""}`

export default function CartDrawer({ isOpen, onClose }) {
  const { user } = useAuth()
  const { data, isLoading } = useUser({ uid: user?.uid })
  const [cartSubtotals, setCartSubtotals] = useState({})

  const onSubtotalUpdate = useCallback((uniqueId, subtotal, quantity, originalSubtotal, returnFee) => {
    setCartSubtotals((prev) => ({
      ...prev,
      [uniqueId]: { subtotal, quantity, originalSubtotal, returnFee },
    }))
  }, [])

  const onRemove = useCallback((uniqueId) => {
    setCartSubtotals((prev) => {
      const updated = { ...prev }
      delete updated[uniqueId]
      return updated
    })
  }, [])

  const totalReturnReplacementFees = useMemo(
    () => Object.values(cartSubtotals).reduce((sum, row) => sum + (row?.returnFee || 0), 0),
    [cartSubtotals]
  )

  const calculateSummary = useCallback(() => {
    if (!data?.carts || !Array.isArray(data.carts)) {
      return { subtotal: 0, savings: 0, savingsPercent: 0, total: 0 }
    }

    const originalTotal = Object.values(cartSubtotals).reduce((sum, { originalSubtotal }) => sum + (originalSubtotal || 0), 0)
    const subtotal = Object.values(cartSubtotals).reduce((sum, { subtotal }) => sum + (subtotal || 0), 0)
    const savings = originalTotal - subtotal
    const savingsPercent = originalTotal > 0 ? ((savings / originalTotal) * 100).toFixed(0) : 0
    const total = subtotal + totalReturnReplacementFees

    return { subtotal, savings, savingsPercent, total }
  }, [cartSubtotals, totalReturnReplacementFees, data?.carts])

  const summary = useMemo(() => calculateSummary(), [calculateSummary])

  // Handle ESC to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      return () => document.removeEventListener("keydown", handleEsc)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => (document.body.style.overflow = "")
  }, [isOpen])

  const handleClickOutside = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9999] bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClickOutside}
      >
        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-3/4 sm:w-1/2 md:w-[25rem] bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <CircularProgress size={30} />
              </div>
            ) : !data?.carts || data.carts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <img
                  className="mb-4 h-32 w-auto"
                  src="/svgs/Empty-pana.svg"
                  alt="Empty cart"
                />
                <h3 className="mb-2 text-lg font-medium text-gray-700">
                  Your Cart is Empty
                </h3>
                <p className="text-sm text-gray-500">Add some products to get started!</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {data.carts.map((item) => (
                  <CartDrawerItem
                    key={getUniqueId(item)}
                    item={item}
                    user={user}
                    data={data}
                    onSubtotalUpdate={onSubtotalUpdate}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {data?.carts && data.carts.length > 0 && (
            <div className="border-t p-4 space-y-4 sticky bottom-0 bg-white">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{summary.subtotal.toFixed(2)}</span>
                </div>
                {summary.savings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Savings</span>
                    <span className="font-medium text-green-600">
                      ₹{summary.savings.toFixed(2)} ({summary.savingsPercent}%)
                    </span>
                  </div>
                )}
                {totalReturnReplacementFees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Fees</span>
                    <span className="font-medium">
                      ₹{totalReturnReplacementFees.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-red-600">₹{summary.total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/cart" onClick={onClose} className="block w-full">
                <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                  View Cart
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const CartDrawerItem = ({ item, user, data, onSubtotalUpdate, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { data: product, isLoading: productLoading } = useProduct({ productId: item?.id })


  // Find variation if product is variable
  const variation = useMemo(() => {
    if (product?.isVariable && product?.variations) {
      return product.variations.find(
        (v) =>
          (!item.selectedColor || v.attributes?.Color?.toLowerCase() === item.selectedColor?.toLowerCase()) &&
          (!item.selectedQuality || v.attributes?.Quality?.toLowerCase() === item.selectedQuality?.toLowerCase()) &&
          (!item.selectedBrand || v.attributes?.Brand?.toLowerCase() === item.selectedBrand?.toLowerCase())
      )
    }
    return null
  }, [product, item.selectedColor, item.selectedQuality, item.selectedBrand])

  // Pricing - Prioritize stored item values, then variation, then product
  const listPrice = useMemo(() => {
    return parseFloat(item?.price || variation?.price || product?.price || 0)
  }, [item, variation, product])

  const salePrice = useMemo(() => {
    return parseFloat(item?.salePrice || variation?.salePrice || product?.salePrice || 0)
  }, [item, variation, product])

  const hasSale = useMemo(() => {
    return salePrice > 0 && salePrice < listPrice
  }, [salePrice, listPrice])

  const effectivePrice = useMemo(() => hasSale ? salePrice : listPrice, [hasSale, salePrice, listPrice])

  // Image - Prioritize variation images, then variantImages by color, then featureImage, then fallback
  const imageSrc = useMemo(() => {
    if (variation?.imageURLs?.length > 0) {
      return variation.imageURLs[0]
    }
    if (product?.variantImages && item?.selectedColor) {
      const colorKey = item.selectedColor.toLowerCase()
      if (product.variantImages[colorKey]?.length > 0) {
        return product.variantImages[colorKey][0]
      }
    }
    return product?.featureImageURL || "/cart-item.png"
  }, [variation, product, item.selectedColor])

  const quantity = useMemo(() => item.quantity || 1, [item.quantity])
  const subtotal = useMemo(() => effectivePrice * quantity, [effectivePrice, quantity])
  const originalSubtotal = useMemo(() => listPrice * quantity, [listPrice, quantity])
  const uniqueId = useMemo(() => getUniqueId(item), [item])

  const computedReturnFee = useMemo(() => {
    if (item?.returnType === "easy-return") {
      return Math.round(160 + 0.05 * effectivePrice * quantity)
    }
    if (item?.returnType === "easy-replacement" || item?.returnType === "self-shipping") {
      // Assuming returnFee is per unit, multiply by quantity for consistency
      const perUnit = item?.returnFee || 0
      return perUnit * quantity
    }
    return 0
  }, [item?.returnType, item?.returnFee, effectivePrice, quantity])

  useEffect(() => {
    if (!productLoading && product) {
      onSubtotalUpdate(uniqueId, subtotal, quantity, originalSubtotal, computedReturnFee)
    }
  }, [uniqueId, subtotal, quantity, originalSubtotal, computedReturnFee, onSubtotalUpdate, productLoading, product])

  const handleRemove = useCallback(async () => {
    if (!confirm("Remove this item from cart?")) return
    setIsRemoving(true)
    try {
      const newList = data?.carts?.filter(
        (d) =>
          !(
            d?.id === item?.id &&
            d?.selectedColor === item?.selectedColor &&
            d?.selectedQuality === item?.selectedQuality &&
            d?.selectedBrand === item?.selectedBrand
          )
      )
      await updateCarts({ list: newList, uid: user?.uid })
      toast.success("Item removed from cart")
      onRemove(uniqueId)
    } catch (error) {
      toast.error(error?.message || "Failed to remove item")
    } finally {
      setIsRemoving(false)
    }
  }, [data?.carts, item, user?.uid, uniqueId, onRemove])

  const handleUpdate = useCallback(
    async (newQuantity) => {
      if (newQuantity < 1) return
      setIsUpdating(true)
      try {
        const qty = Number.parseInt(newQuantity, 10)
        const newList = data?.carts?.map((d) => {
          if (
            d?.id === item?.id &&
            d?.selectedColor === item?.selectedColor &&
            d?.selectedQuality === item?.selectedQuality &&
            d?.selectedBrand === item?.selectedBrand
          ) {
            const next = { ...d, quantity: qty }
            if (d.returnType === "easy-return") {
              next.returnFee = Math.round(160 + 0.05 * effectivePrice * qty)
            } else if (d.returnType === "easy-replacement" || d.returnType === "self-shipping") {
              // If returnFee is per unit, keep it as is (assuming stored as per unit)
              // Or adjust if needed; here assuming it's per unit and not updating total
            }
            return next
          }
          return d
        })

        await updateCarts({ list: newList, uid: user?.uid })
        toast.success("Cart updated")
      } catch (error) {
        toast.error(error?.message || "Failed to update quantity")
      } finally {
        setIsUpdating(false)
      }
    },
    [data?.carts, item, user?.uid, effectivePrice]
  )

  if (productLoading) {
    return (
      <div className="flex gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 w-3/4" />
          <div className="h-3 bg-gray-200 w-1/2" />
          <div className="h-3 bg-gray-200 w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={imageSrc}
          alt={product?.title || "Product"}
          className="w-16 h-16 object-cover rounded"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 truncate">
          {product?.title || "Product"}
        </h4>

        {item?.selectedColor && (
          <p className="text-xs text-gray-500 capitalize">
            Color: {item.selectedColor}
          </p>
        )}

        {item?.selectedQuality && (
          <p className="text-xs text-gray-500 capitalize">
            Quality: {item.selectedQuality}
          </p>
        )}

        {item?.selectedBrand && (
          <p className="text-xs text-gray-500 capitalize">
            Brand: {item.selectedBrand}
          </p>
        )}

        {item?.returnType && (
          <p className="text-xs text-gray-500 capitalize">
            Return: {item.returnType.replace("-", " ")}
          </p>
        )}

        {/* Price */}
        <div className="mt-1">
          {hasSale ? (
            <div className="flex items-center gap-2">
              <span className="text-xs line-through text-gray-400">
                ₹{listPrice.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-black">
                ₹{effectivePrice.toFixed(2)}
              </span>
              <span className="text-xs text-green-600 font-medium">
                ({Math.round(((listPrice - effectivePrice) / listPrice) * 100)}% OFF)
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-black">
              ₹{listPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => handleUpdate(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
            >
              <Minus size={12} />
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button
              onClick={() => handleUpdate(quantity + 1)}
              disabled={isUpdating}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-gray-400 hover:text-red-500 p-1"
          >
            {isRemoving ? <CircularProgress size={16} /> : <DeleteForever fontSize="small" />}
          </button>
        </div>
      </div>
    </div>
  )
}