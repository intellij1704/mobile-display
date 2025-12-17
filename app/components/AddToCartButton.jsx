/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { useUser } from "@/lib/firestore/user/read"
import { updateCarts } from "@/lib/firestore/user/write"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import ReturnTypeSelector from "./ReturnTypeSelector"

export default function AddToCartButton({
  product,
  productId,
  type = "large",
  selectedColor,
  selectedQuality,
  selectedBrand,
  isVariable,
  hasQualityOptions,
  hasBrandOptions,
  className,
  productPrice, // new: used to compute Easy Return fee
}) {
  const router = useRouter()
  const { user } = useAuth()
  const { data } = useUser({ uid: user?.uid })
  const [isLoading, setIsLoading] = useState(false)
  const [showSelector, setShowSelector] = useState(false)

  const isAdded = useMemo(() => {
    return data?.carts?.find(
      (item) =>
        item?.id === productId &&
        (!isVariable || item?.selectedColor === selectedColor) &&
        (!hasQualityOptions || item?.selectedQuality === selectedQuality) &&
        (!hasBrandOptions || item?.selectedBrand === selectedBrand),
    )
  }, [data?.carts, productId, isVariable, hasQualityOptions, hasBrandOptions, selectedColor, selectedQuality, selectedBrand])

  const validateSelections = () => {
    if (isVariable && !selectedColor && !isAdded) {
      toast.error("Please select a color!")
      return false
    }
    if (hasQualityOptions && !selectedQuality && !isAdded) {
      toast.error("Please select a quality!")
      return false
    }
    if (hasBrandOptions && !selectedBrand && !isAdded) {
      toast.error("Please select a brand!")
      return false
    }
    if (product?.isVariable && !isAdded) {
      const selVar = product.variations.find(v => 
        ( !isVariable || v.attributes.Color === selectedColor ) &&
        ( !hasQualityOptions || v.attributes.Quality === selectedQuality ) &&
        ( !hasBrandOptions || v.attributes.Brand === selectedBrand )
      )
      if (!selVar) {
        toast.error("This combination is not available.")
        return false
      }
    }
    return true
  }

  const handleClick = async () => {
    try {
      if (!user?.uid) {
        router.push("/login")
        throw new Error("Please log in first!")
      }
      if (!validateSelections()) return

      // If already added, remove
      if (isAdded) {
        setIsLoading(true)
        const newList = data?.carts?.filter(
          (item) =>
            !(
              item?.id === productId &&
              (!isVariable || item?.selectedColor === selectedColor) &&
              (!hasQualityOptions || item?.selectedQuality === selectedQuality) &&
              (!hasBrandOptions || item?.selectedBrand === selectedBrand)
            ),
        )
        await updateCarts({ list: newList, uid: user?.uid })
        toast.success("Item removed from cart")
        setIsLoading(false)
        return
      }

      // Not added yet: show return type selector first
      setShowSelector(true)
    } catch (err) {
      toast.error(err?.message || "Something went wrong")
      setIsLoading(false)
    }
  }

  const handleConfirmReturn = async (choice) => {
    // choice = { id, title, fee, termsHtml }
    try {
      setIsLoading(true)
      await updateCarts({
        list: [
          ...(data?.carts ?? []),
          {
            id: productId,
            quantity: 1,
            ...(isVariable && { selectedColor }),
            ...(hasQualityOptions && { selectedQuality }),
            ...(hasBrandOptions && { selectedBrand }),
            // Store return meta
            returnType: choice.id, // 'easy-return' | 'easy-replacement' | 'self-shipping'
            returnFee: choice.fee,
          },
        ],
        uid: user?.uid,
      })
      toast.success("Item added to cart")
    } catch (err) {
      toast.error(err?.message || "Failed to add to cart")
    } finally {
      setIsLoading(false)
      setShowSelector(false)
    }
  }

  if (type === "large") {
    return (
      <>
        <Button
          size="sm"
          variant="default"
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            "bg-black hover:bg-gray-700 text-white px-5 md:py-5 py-6 rounded-md text-sm md:text-base transition-all duration-200",
            "flex-1",
            className,
          )}
        >
          {!isAdded ? "Add To Cart" : "Click To Remove"}
        </Button>

        <ReturnTypeSelector
          open={showSelector}
          onClose={() => setShowSelector(false)}
          onConfirm={handleConfirmReturn}
          productPrice={productPrice}
        />
      </>
    )
  }

  // icon-only variant
  return (
    <>
      <Button
        className={cn(
          "h-8 w-8 bg-gray-100 border border-gray-100 rounded shadow-md hover:bg-red-500 hover:text-white transition-all duration-200",
          isAdded ? "text-gray-900" : "text-gray-600",
          className,
        )}
        size="icon"
        variant="secondary"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={isAdded ? "Remove from cart" : "Add to cart"}
      >
        {isAdded ? "-" : "+"}
      </Button>

      <ReturnTypeSelector
        open={showSelector}
        onClose={() => setShowSelector(false)}
        onConfirm={handleConfirmReturn}
        productPrice={productPrice}
      />
    </>
  )
}