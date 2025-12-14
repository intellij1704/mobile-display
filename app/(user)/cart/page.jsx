/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useAuth } from "@/context/AuthContext"
import { useUser } from "@/lib/firestore/user/read"
import { useProduct } from "@/lib/firestore/products/read"
import { updateCarts } from "@/lib/firestore/user/write"
import { useShippingSettings } from "@/lib/firestore/shipping/read"
import { CircularProgress } from "@mui/material"
import { DeleteForever } from "@mui/icons-material"
import { Button } from "@nextui-org/react"
import { Minus, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useMemo, useCallback } from "react"
import toast from "react-hot-toast"

const getUniqueId = (item) => {
  return `${item.id}-${item.selectedColor || ""}-${item.selectedQuality || ""}`
}

const CartPage = () => {
  const { user } = useAuth()
  const { data, isLoading } = useUser({ uid: user?.uid })
  const { data: shippingData, isLoading: isFetching } = useShippingSettings()

  // Track per-line (originalSubtotal, discounted subtotal, quantity, returnFee)
  const [cartSubtotals, setCartSubtotals] = useState({})

  // Keep parent-subtotal map updated by children
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

  // Compute total return/replacement fees from children's computed values (accurate on initial render and updates)
  const totalReturnReplacementFees = useMemo(() => {
    return Object.values(cartSubtotals).reduce((sum, row) => sum + (row?.returnFee || 0), 0)
  }, [cartSubtotals])

  // Summaries (subtotal, savings, final total)
  const calculateSummary = useCallback(() => {
    if (!data?.carts || !Array.isArray(data.carts)) {
      return {
        subtotal: 0,
        savings: 0,
        savingsPercent: 0,
        total: 0,
      }
    }

    const originalTotal = Object.values(cartSubtotals).reduce((sum, { originalSubtotal }) => sum + (originalSubtotal || 0), 0)
    const subtotal = Object.values(cartSubtotals).reduce((sum, { subtotal }) => sum + (subtotal || 0), 0)
    const savings = originalTotal - subtotal
    const savingsPercent = originalTotal > 0 ? ((savings / originalTotal) * 100).toFixed(0) : 0
    const total = subtotal + totalReturnReplacementFees

    return { subtotal, savings, savingsPercent, total }
  }, [cartSubtotals, totalReturnReplacementFees, data?.carts])

  const summary = useMemo(() => calculateSummary(), [calculateSummary])
  const freeShippingThreshold = shippingData?.minFreeDeliveryAmount || 0
  const freeShippingVal = Math.max(0, freeShippingThreshold - summary.subtotal)

  if (isLoading || isFetching) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100">
        <CircularProgress size={50} thickness={4} color="primary" />
        <p className="mt-4 text-gray-600 font-medium">Loading Cart...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {!data?.carts || data.carts.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-sm">
            <img className="mb-8 h-60 w-auto" src="/svgs/Empty-pana.svg" alt="Empty cart" />
            <h2 className="mb-2 text-2xl font-semibold text-gray-700">Your Cart is Empty</h2>
            <p className="mb-6 max-w-md text-gray-500">
              Looks like you haven't added any products yet. Start shopping now!
            </p>
              <Link href="/product" className="bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700">Continue Shopping</Link>
         
          </div>
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Cart Items */}
            <div className="w-full lg:w-2/3">
              <div className="border-dashed border-2 border-[#0000001b] rounded-md p-3 mb-10">
                <p className="text-sm text-gray-700 mb-1">
                  {freeShippingVal === 0
                    ? "Your order qualifies for free shipping!"
                    : `Add ₹${freeShippingVal} to cart and get free shipping!`}
                </p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (summary.subtotal / freeShippingThreshold) * 100)}%`,
                      background: "repeating-linear-gradient(45deg, #4b5563, #4b5563 10px, #6b7280 10px, #6b7280 20px)",
                    }}
                  />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">YOUR CART</h1>

              <div className="space-y-4 bg-white shadow-lg py-4">
                {data.carts.map((item) => (
                  <CartItem
                    key={getUniqueId(item)}
                    item={item}
                    user={user}
                    data={data}
                    onSubtotalUpdate={onSubtotalUpdate}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3 lg:ml-8 mt-14">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Order Summary</h2>
                <div className="space-y-3 text-sm border-b border-gray-200 pb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Savings</span>
                    <span className="font-medium text-green-600">
                      ₹{summary.savings.toFixed(2)} ({summary.savingsPercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return & Replacement Fees</span>
                    <span className="font-medium">₹{totalReturnReplacementFees.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-red-600">₹{summary.total.toFixed(2)}</span>
                </div>
                <Link href="/checkout?type=cart" className="mt-6 block w-full">
                  <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                    Proceed to Checkout
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const CartItem = ({ item, user, data, onSubtotalUpdate, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { data: product } = useProduct({ productId: item?.id })

  // Find variation if product is variable
  const variation = useMemo(() => {
    if (product?.isVariable && product?.variations && item?.selectedColor) {
      return product.variations.find(
        (v) =>
          v.attributes?.Color?.toLowerCase() === item.selectedColor?.toLowerCase() &&
          (!item.selectedQuality || v.attributes?.Quality?.toLowerCase() === item.selectedQuality?.toLowerCase())
      )
    }
    return null
  }, [product, item.selectedColor, item.selectedQuality])

  // Pricing - Prioritize variation, then product, then stored item values
  const listPrice = useMemo(() => {
    return parseFloat(variation?.price || product?.price || item?.price || 0)
  }, [variation, product, item])

  const salePrice = useMemo(() => {
    return parseFloat(variation?.salePrice || product?.salePrice || item?.salePrice || 0)
  }, [variation, product, item])

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

  // Report subtotals and returnFee to parent
  useEffect(() => {
    onSubtotalUpdate(uniqueId, subtotal, quantity, originalSubtotal, computedReturnFee)
  }, [uniqueId, subtotal, quantity, originalSubtotal, computedReturnFee, onSubtotalUpdate])

  const handleRemove = useCallback(async () => {
    if (!confirm("Remove this item from cart?")) return
    setIsRemoving(true)
    try {
      const newList = data?.carts?.filter(
        (d) =>
          !(
            d?.id === item?.id &&
            d?.selectedColor === item?.selectedColor &&
            d?.selectedQuality === item?.selectedQuality
          ),
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
            d?.selectedQuality === item?.selectedQuality
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
    [data?.carts, item, user?.uid, effectivePrice],
  )

  return (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white rounded-lg">
  
  {/* Left Section */}
  <div className="flex gap-4">
    
    {/* Image + Quantity */}
    <div className="flex items-center flex-col gap-2">
      <img
        src={imageSrc}
        alt={product?.title || "Product"}
        className="w-24 sm:w-28 h-auto object-cover rounded"
      />

      <div className="flex items-center space-x-5 border border-[#929292]">
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
    </div>

    {/* Product Info */}
    <div className="flex-1">
      <h3 className="text-sm font-medium text-gray-800">
        {product?.title || "Product"}
      </h3>

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

      {/* Price */}
      {hasSale ? (
        <p className="text-xs text-gray-500">
          <span className="line-through mr-2">
            ₹{listPrice.toFixed(2)}
          </span>
          <span className="text-black font-semibold text-lg">
            ₹{effectivePrice.toFixed(2)}
          </span>
          <span className="ml-2 text-green-600 text-sm font-medium">
            ({Math.round(((listPrice - effectivePrice) / listPrice) * 100)}% OFF)
          </span>
        </p>
      ) : (
        <p className="font-semibold text-lg text-black">
          ₹{listPrice.toFixed(2)}
        </p>
      )}

      {/* Return Fee */}
      {item?.returnType && (
        <p className="text-xs text-gray-500">
          + ₹{computedReturnFee}{" "}
          {item.returnType === "easy-return"
            ? "Easy Return Fee"
            : item.returnType === "easy-replacement"
            ? "Easy Replacement Fee"
            : "Self Shipping Fee"}
        </p>
      )}
    </div>
  </div>

  {/* Delete Button */}
  <div className="flex justify-end sm:justify-center">
    <button
      onClick={handleRemove}
      disabled={isRemoving}
      className="text-gray-400 hover:text-red-500"
    >
      {isRemoving ? <CircularProgress size={16} /> : <DeleteForever />}
    </button>
  </div>
</div>

  )
}

export default CartPage