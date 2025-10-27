"use client"

import { Button } from "@/components/ui/button"
import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import FavoriteButton from "@/app/components/FavoriteButton"
import { Tag, Clock, Star, ShoppingBag, Zap, Trash2, ShoppingCart } from 'lucide-react'
import ProductVariantModal from "./ProductVariantModal"
import { useAuth } from "@/context/AuthContext"
import { useUser } from "@/lib/firestore/user/read"
import { updateCarts } from "@/lib/firestore/user/write"
import { useRouter } from "next/navigation"
import { createCheckoutCODAndGetId } from "@/lib/firestore/checkout/write"
import ReturnTypeSelector from "@/app/components/ReturnTypeSelector"
import toast from "react-hot-toast"
import RatingReview from "@/app/components/RatingReview"

const ProductCard = ({ product, isVariable = false, hasQualityOptions = false, selectedColor = null, selectedQuality = null }) => {
  const {
    id,
    title,
    price: basePrice,
    salePrice: baseSalePrice,
    featureImageURL,
    shortDescription,
    bigDeal,
    liveSale,
    topPick,
    seoSlug,
    attributes = [],
    variations = [],
  } = product

  const router = useRouter()
  const { user } = useAuth()
  const { data: userData } = useUser({ uid: user?.uid })
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [showReturnSelector, setShowReturnSelector] = useState(false)
  const [actionType, setActionType] = useState("") // "cart" or "buy"
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [tempColor, setTempColor] = useState(selectedColor)
  const [tempQuality, setTempQuality] = useState(selectedQuality)

  // Compute effective isVariable and hasQualityOptions if not passed
  const effectiveIsVariable = isVariable || product?.isVariable || variations?.length > 0
  const effectiveHasQualityOptions = hasQualityOptions || product?.hasQualityOptions || attributes?.some(attr => attr.name?.toLowerCase().includes('quality'))

  // Extract colors from attributes if present, else from product.colors
  const colors = useMemo(() => {
    const colorAttr = attributes.find(attr => attr.name?.toLowerCase().includes('color'))
    if (colorAttr) return colorAttr.values
    if (product?.colors) {
      return Array.isArray(product.colors) ? product.colors : Object.values(product.colors)
    }
    return []
  }, [product?.colors, attributes])

  console.log("Newe",product)

  // Compute prices for display
  const { minEffective, displayOriginal, discountPercentage, maxSave } = useMemo(() => {
    let minEff = Number(baseSalePrice || basePrice || 0)
    let dispOrig = Number(basePrice || 0)
    let discPercent = 0
    let mSave = 0

    if (effectiveIsVariable && variations.length > 0) {
      const validVars = variations.filter(v => Number(v.price ?? 0) > 0)

      if (validVars.length > 0) {
        const varData = validVars.map(v => {
          const eff = Number(v.salePrice && Number(v.salePrice) > 0 ? v.salePrice : v.price)
          const orig = Number(v.price)
          const save = (v.salePrice && Number(v.salePrice) > 0 && Number(v.salePrice) < orig) ? (orig - Number(v.salePrice)) : 0
          const disc = save > 0 ? Math.round((save / orig) * 100) : 0
          return { v, effective: eff, original: orig, save, disc }
        })

        const minEffValue = Math.min(...varData.map(d => d.effective))
        const minVar = varData.find(d => d.effective === minEffValue) || varData[0]

        minEff = minVar.effective
        dispOrig = minVar.original
        discPercent = minVar.disc
        mSave = minVar.save
      }
    } else {
      minEff = Number(baseSalePrice || basePrice || 0)
      dispOrig = Number(basePrice || 0)
      if (baseSalePrice && Number(baseSalePrice) > 0 && Number(baseSalePrice) < dispOrig) {
        discPercent = Math.round(((dispOrig - Number(baseSalePrice)) / dispOrig) * 100)
        mSave = dispOrig - Number(baseSalePrice)
      }
    }

    return { minEffective: minEff, displayOriginal: dispOrig, discountPercentage: discPercent, maxSave: mSave }
  }, [effectiveIsVariable, variations, basePrice, baseSalePrice])

  // Fixed cart item detection for variable products
  const isAdded = useMemo(() => {
    if (!userData?.carts) return false

    return userData.carts.find((item) => {
      // For non-variable products, just match the ID
      if (!effectiveIsVariable && !effectiveHasQualityOptions) {
        return item?.id === id
      }

      // For variable products, match ID and selected options
      const matchesId = item?.id === id
      const matchesColor = !effectiveIsVariable || !selectedColor || item?.selectedColor === selectedColor
      const matchesQuality = !effectiveHasQualityOptions || !selectedQuality || item?.selectedQuality === selectedQuality

      return matchesId && matchesColor && matchesQuality
    })
  }, [userData?.carts, id, effectiveIsVariable, effectiveHasQualityOptions, selectedColor, selectedQuality])

  const formatPrice = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`
  const hasDiscount = discountPercentage > 0

  // Display only the smallest effective price for variable products (sale if available, else regular)
  // For non-variable, show the single price
  const effectivePriceDisplay = formatPrice(minEffective)

  // For original price display (struck through), show the corresponding original for the lowest effective
  const originalPriceDisplay = formatPrice(displayOriginal)

  const handleAddToCart = () => {
    if (!user?.uid) {
      router.push("/login")
      return
    }

    setActionType("cart")

    // If variable product, show modal
    if (effectiveIsVariable || effectiveHasQualityOptions) {
      setShowVariantModal(true)
      return
    }

    // For non-variable products, show return selector directly
    setShowReturnSelector(true)
  }

  const handleBuyNow = () => {
    if (!user?.uid) {
      router.push("/login")
      return
    }

    setActionType("buy")

    // If variable product, show modal
    if (effectiveIsVariable || effectiveHasQualityOptions) {
      setShowVariantModal(true)
      return
    }

    // For non-variable products, show return selector directly
    setShowReturnSelector(true)
  }

  // Completely rewritten cart removal logic for variable products
  const handleRemove = useCallback(async () => {
    if (!confirm("Remove this item from cart?")) return

    setIsRemoving(true)
    try {
      if (!userData?.carts) {
        toast.error("Cart is empty")
        return
      }

      // Filter out the matching item(s)
      const newList = userData.carts.filter((cartItem) => {
        // For non-variable products, remove all items with matching ID
        if (!effectiveIsVariable && !effectiveHasQualityOptions) {
          return cartItem?.id !== id
        }

        // For variable products, remove items that match ID and selected options
        const matchesId = cartItem?.id === id
        if (!matchesId) return true // Keep items with different IDs

        // If IDs match, check if this is the specific variant to remove
        const matchesColor = !effectiveIsVariable || !selectedColor || cartItem?.selectedColor === selectedColor
        const matchesQuality = !effectiveHasQualityOptions || !selectedQuality || cartItem?.selectedQuality === selectedQuality

        // Return false to remove this item (if all conditions match)
        return !(matchesColor && matchesQuality)
      })

      // Check if anything was actually removed
      if (newList.length === userData.carts.length) {
        toast.error("Item not found in cart")
        return
      }

      await updateCarts({ list: newList, uid: user?.uid })
      toast.success("Item removed from cart")
    } catch (error) {
      console.error("Error removing item from cart:", error)
      toast.error(error?.message || "Failed to remove item")
    } finally {
      setIsRemoving(false)
    }
  }, [userData?.carts, id, selectedColor, selectedQuality, user?.uid, effectiveIsVariable, effectiveHasQualityOptions])

  const handleVariantConfirm = (color, quality) => {
    setTempColor(color)
    setTempQuality(quality)
    setShowVariantModal(false)
    setShowReturnSelector(true)
  }

  const handleReturnConfirm = async (choice) => {
    try {
      setIsLoading(true)
      const effectiveColor = tempColor || selectedColor
      const effectiveQuality = tempQuality || selectedQuality

      if (actionType === "cart") {
        await updateCarts({
          list: [
            ...(userData?.carts ?? []),
            {
              id: product.id,
              quantity: 1,
              returnType: choice.id,
              returnFee: choice.fee,
              selectedColor: effectiveColor,
              selectedQuality: effectiveQuality,
            },
          ],
          uid: user?.uid,
        })
        toast.success("Item added to cart")
      } else if (actionType === "buy") {
        const checkoutId = await createCheckoutCODAndGetId({
          uid: user?.uid,
          products: [
            {
              product: { id: product.id, categoryId: product.categoryId, title: product.title, featureImageURL: product.featureImageURL, isVariable: product.isVariable, variations: product.variations, price: product.price, salePrice: product.salePrice },
              quantity: 1,
              selectedColor: effectiveColor,
              selectedQuality: effectiveQuality,
              returnType: choice.id,
            },
          ],
          address: userData?.addresses?.find(a => a.isDefault) || userData?.addresses?.[0] || {},
          deliveryType: "standard",
          appliedCoupons: [],
          appliedOffers: [],
        })
        router.push(
          `/checkout?${new URLSearchParams({
            type: "buynow",
            productId: product?.id,
            checkoutId,
            ...(effectiveColor ? { color: effectiveColor } : {}),
            ...(effectiveQuality ? { quality: effectiveQuality } : {}),
            ...(choice?.id ? { returnType: choice.id } : {})
          }).toString()}`
        );

      }
    } catch (err) {
      console.error("Error in handleReturnConfirm:", err)
      toast.error(err?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
      setShowReturnSelector(false)
      setTempColor(null)
      setTempQuality(null)
    }
  }

  return (
    <>
      <div
        className={`group relative bg-white rounded-lg overflow-hidden transition-all duration-300 
        border border-[#00000033]
        md:flex-col md:h-full
        flex flex-row h-auto w-full`}
      >
        {/* Badges - Position differently for mobile */}
        <div className="absolute top-2 right-2 z-10 md:flex flex-col gap-2 hidden">
          {bigDeal && (
            <div className="flex items-center gap-1 bg-black text-white text-xs px-2 py-1 shadow-sm">
              <Tag size={12} />
              <span>Big Deal</span>
            </div>
          )}
          {liveSale && !bigDeal && (
            <div className="flex items-center gap-1 bg-black text-white text-xs px-2 py-1 shadow-sm">
              <Clock size={12} />
              <span>Live Sale</span>
            </div>
          )}
          {topPick && !bigDeal && !liveSale && (
            <div className="flex items-center gap-1 bg-black text-white text-xs px-2 py-1 shadow-sm">
              <Star size={12} />
              <span>Top Pick</span>
            </div>
          )}
        </div>

        {/* Image section - takes left side on mobile */}
        <Link href={`/products/${seoSlug || id}`} className="block relative md:w-full w-1/2 ">
          <div className="relative h-full bg-gray-50 overflow-hidden">
            {featureImageURL ? (
              <>
                <Image
                  src={featureImageURL || "/placeholder.svg"}
                  alt={title}
                  width={200}
                  height={200}
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-105 w-full h-full"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">No image</div>
            )}
          </div>
        </Link>

        {/* Content section - takes right side on mobile */}
        <div className="p-3 flex flex-col justify-between md:w-full w-2/3">
          <div>
            <Link
              href={`/products/${seoSlug || id}`}
              className="group-hover:text-blue-600 transition-colors duration-200"
            >
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 md:h-10 group-hover:text-blue-600 transition-colors duration-200">
                {title}
              </h3>
            </Link>

            {/* Mobile-only badges and wishlist */}
            <div className="flex items-center justify-between mt-1 md:hidden">
              <div className="flex gap-1">
                {bigDeal && (
                  <div className="flex items-center gap-1 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    <Tag size={10} />
                    <span>Big Deal</span>
                  </div>
                )}
                {liveSale && !bigDeal && (
                  <div className="flex items-center gap-1 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    <Clock size={10} />
                    <span>Live Sale</span>
                  </div>
                )}
                {topPick && !bigDeal && !liveSale && (
                  <div className="flex items-center gap-1 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    <Star size={10} />
                    <span>Top Pick</span>
                  </div>
                )}
              </div>
              <FavoriteButton productId={id} size="sm" />
            </div>
          </div>

          {/* Price Section - Stacked for mobile, show smallest effective price for variables */}
          <div className="mt-1 md:mt-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-base md:text-lg font-bold text-gray-900">
                  {effectivePriceDisplay}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xs md:text-sm text-gray-500 line-through">
                      {originalPriceDisplay}
                    </span>
                    <span className="text-[10px] md:text-xs font-medium bg-green-100 text-green-600 px-1 py-0.5 rounded">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="flex">
                <RatingReview product={product} />
              </div>

            </div>

            <div className="flex items-center justify-between mt-1 md:mt-2">

              {hasDiscount && (
                <span className="text-[10px] md:text-[14px] text-green-500 font-semibold">
                  You save up to: ₹{maxSave.toLocaleString("en-IN")}
                </span>
              )}


              {colors.length > 0 && (
                <div className="flex items-center">
                  {colors
                    .slice(0, 2)
                    .map((color, index) => (
                      <span
                        key={index}
                        className={`h-4 w-4 rounded-full border border-gray-300 ${index > 0 ? "-ml-2" : ""}`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}

                  {colors.length > 2 && (
                    <span className="text-sm text-black">+{colors.length - 2}</span>
                  )}
                </div>
              )}

            </div>


            <div className="flex justify-between items-center">
              <div className="flex">
                <ReturnTypeSelector product={product} />
              </div>
            </div>


          </div>

          <div className="mt-1 pt-2 border-t-2 border-none md:border-dashed border-black/20 md:mt-3 md:pt-3">
            <div className="flex gap-2 w-full">
              <Button
                onClick={isAdded ? handleRemove : handleAddToCart}
                disabled={isLoading || isRemoving}
                size="sm"
                className={`text-xs py-4 flex items-center justify-center ${isAdded
                  ? "bg-black hover:bg-gray-800 text-white"
                  : "bg-black border text-white border-black"
                  }`}
              >
                {isAdded ? (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" />
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-1" />
                  </>
                )}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex-1 border-red-500 text-white hover:bg-red-500 hover:text-white text-xs py-4 bg-[#BB0300] flex items-center justify-center"
              >
                Buy Now
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Product Variant Modal */}
      <ProductVariantModal
        product={product}
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        onConfirm={handleVariantConfirm} // Added onConfirm to handle selection
      />

      {/* Return Type Selector for non-variable products */}
      <ReturnTypeSelector
        open={showReturnSelector}
        onClose={() => setShowReturnSelector(false)}
        onConfirm={handleReturnConfirm}
        productPrice={minEffective}
      />
    </>
  )
}

export default ProductCard