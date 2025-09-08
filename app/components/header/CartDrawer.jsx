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

const getUniqueId = (item) => {
    return `${item.id}-${item.selectedColor || ""}-${item.selectedQuality || ""}`
}

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

    const totalReturnReplacementFees = useMemo(() => {
        return Object.values(cartSubtotals).reduce((sum, row) => sum + (row?.returnFee || 0), 0)
    }, [cartSubtotals])

    const calculateSummary = useCallback(() => {
        if (!data?.carts || !Array.isArray(data.carts)) {
            return {
                productTotal: 0,
                discount: 0,
                discountPercent: 0,
                total: 0,
            }
        }

        let productTotal = 0
        let discount = 0

        Object.values(cartSubtotals).forEach(({ originalSubtotal, subtotal }) => {
            productTotal += originalSubtotal || 0
            discount += originalSubtotal - subtotal || 0
        })

        const discountPercent = productTotal > 0 ? ((discount / productTotal) * 100).toFixed(0) : 0
        const total = productTotal - discount + totalReturnReplacementFees

        return { productTotal, discount, discountPercent, total }
    }, [cartSubtotals, totalReturnReplacementFees, data?.carts])

    const summary = useMemo(() => calculateSummary(), [calculateSummary])

    // Disable body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop with slower transition */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-1000 ease-in-out h-screen ${isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* Drawer with slower slide-in transition from right */}
            <div
                className={`fixed right-0 top-0 h-screen w-96 bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-1000 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Shopping Cart</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
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
                            <img className="mb-4 h-32 w-auto" src="/svgs/Empty-pana.svg" alt="Empty cart" />
                            <h3 className="mb-2 text-lg font-medium text-gray-700">Your Cart is Empty</h3>
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

                {/* Footer with Total and View Cart Button */}
                {data?.carts && data.carts.length > 0 && (
                    <div className="border-t p-4 space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{summary.productTotal.toFixed(2)}</span>
                            </div>
                            {summary.discount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="font-medium text-green-600">-₹{summary.discount.toFixed(2)}</span>
                                </div>
                            )}
                            {totalReturnReplacementFees > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Return Fees</span>
                                    <span className="font-medium">₹{totalReturnReplacementFees.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Total</span>
                                <span className="text-red-600">₹{summary.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Link href="/cart" onClick={onClose} className="block w-full">
                            <Button className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700">View Cart</Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}

const CartDrawerItem = ({ item, user, data, onSubtotalUpdate, onRemove }) => {
    const [isRemoving, setIsRemoving] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const { data: product } = useProduct({ productId: item?.id })

    const hasSale = product?.salePrice && product?.salePrice < product?.price
    const listPrice = useMemo(() => product?.price || item?.price || 0, [product, item])
    const effectivePrice = useMemo(
        () => (hasSale ? product?.salePrice : listPrice) || item?.salePrice || item?.price || 0,
        [hasSale, product, listPrice, item],
    )

    const quantity = useMemo(() => item.quantity || 1, [item.quantity])
    const subtotal = useMemo(() => effectivePrice * quantity, [effectivePrice, quantity])
    const originalSubtotal = useMemo(() => listPrice * quantity, [listPrice, quantity])
    const uniqueId = useMemo(() => getUniqueId(item), [item])

    const computedReturnFee = useMemo(() => {
        if (item?.returnType === "easy-return") {
            return Math.round(160 + 0.05 * effectivePrice * quantity)
        }
        if (item?.returnType === "easy-replacement" || item?.returnType === "self-shipping") {
            const perUnit = item?.returnFee || 0
            return perUnit
        }
        return 0
    }, [item?.returnType, item?.returnFee, effectivePrice, quantity])

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
        <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            {/* Product Image */}
            <div className="flex-shrink-0">
                <img
                    src={product?.featureImageURL || "/cart-item.png"}
                    alt={product?.title || "Product"}
                    className="w-16 h-16 object-cover rounded"
                />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-800 truncate">{product?.title || "Product"}</h4>

                {item?.selectedColor && <p className="text-xs text-gray-500 capitalize">Color: {item.selectedColor}</p>}

                {item?.selectedQuality && <p className="text-xs text-gray-500 capitalize">Quality: {item.selectedQuality}</p>}

                {item?.returnType && (
                    <p className="text-xs text-gray-500 capitalize">Return: {item.returnType.replace("-", " ")}</p>
                )}

                {/* Price */}
                <div className="mt-1">
                    {hasSale ? (
                        <div className="flex items-center gap-2">
                            <span className="text-xs line-through text-gray-400">₹{listPrice.toFixed(2)}</span>
                            <span className="text-sm font-semibold text-black">₹{effectivePrice.toFixed(2)}</span>
                        </div>
                    ) : (
                        <span className="text-sm font-semibold text-black">₹{listPrice.toFixed(2)}</span>
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

                    <button onClick={handleRemove} disabled={isRemoving} className="text-gray-400 hover:text-red-500 p-1">
                        {isRemoving ? <CircularProgress size={16} /> : <DeleteForever fontSize="small" />}
                    </button>
                </div>
            </div>
        </div>
    )
}