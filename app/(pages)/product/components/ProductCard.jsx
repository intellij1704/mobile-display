"use client"

import { Button } from "@/components/ui/button"
import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import FavoriteButton from "@/app/components/FavoriteButton"
import { Tag, Clock, Star, ShoppingBag, Zap, Trash2, ShoppingCart } from "lucide-react"
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
    price,
    salePrice,
    featureImageURL,
    shortDescription,
    bigDeal,
    liveSale,
    topPick,
    stock,
    seoSlug,
    orders = 0,
  } = product

  const router = useRouter()
  const { user } = useAuth()
  const { data: userData } = useUser({ uid: user?.uid })
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [showReturnSelector, setShowReturnSelector] = useState(false)
  const [actionType, setActionType] = useState("") // "cart" or "buy"
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const isOutOfStock = stock <= orders
  const showLowStock = !isOutOfStock && stock && stock - orders < 10

  // Check if product is already in cart
  const isAdded = useMemo(() => {
    return userData?.carts?.find(
      (item) =>
        item?.id === id &&
        (!isVariable || item?.selectedColor === selectedColor) &&
        (!hasQualityOptions || item?.selectedQuality === selectedQuality)
    )
  }, [userData?.carts, id, isVariable, hasQualityOptions, selectedColor, selectedQuality])

  const formatPrice = (amount) => `₹${amount?.toLocaleString("en-IN")}`
  const discountPercentage = salePrice && price > salePrice ? Math.round(((price - salePrice) / price) * 100) : 0
  const hasDiscount = discountPercentage > 0

  const handleAddToCart = () => {
    if (!user?.uid) {
      router.push("/login")
      return
    }

    // If variable product, show modal
    if (product?.isVariable || product?.hasQualityOptions) {
      setShowVariantModal(true)
      return
    }

    // For non-variable products, show return selector directly
    setActionType("cart")
    setShowReturnSelector(true)
  }


  const handleBuyNow = () => {
    if (!user?.uid) {
      router.push("/login")
      return
    }

    // If variable product, show modal
    if (product?.isVariable || product?.hasQualityOptions) {
      setShowVariantModal(true)
      return
    }

    // For non-variable products, show return selector directly
    setActionType("buy")
    setShowReturnSelector(true)
  }


  const handleRemove = useCallback(async () => {
    if (!confirm("Remove this item from cart?")) return
    setIsRemoving(true)
    try {
      const newList = userData?.carts?.filter(
        (d) =>
          !(
            d?.id === id &&
            d?.selectedColor === selectedColor &&
            d?.selectedQuality === selectedQuality
          ),
      )
      await updateCarts({ list: newList, uid: user?.uid })
      toast.success("Item removed from cart")
    } catch (error) {
      toast.error(error?.message || "Failed to remove item")
    } finally {
      setIsRemoving(false)
    }
  }, [userData?.carts, id, selectedColor, selectedQuality, user?.uid])

  const handleReturnConfirm = async (choice) => {
    try {
      setIsLoading(true)

      if (actionType === "cart") {
        await updateCarts({
          list: [
            ...(userData?.carts ?? []),
            {
              id: product.id,
              quantity: 1,
              returnType: choice.id,
              returnFee: choice.fee,
              selectedColor,
              selectedQuality,
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
              product,
              quantity: 1,
              selectedColor,
              selectedQuality,
              returnType: choice.id,
            },
          ],
          address: userData?.address || {},
          deliveryType: "standard",
          appliedCoupons: [],
          appliedOffers: [],
        })
        router.push(`/checkout?type=buynow&productId=${product?.id}&checkoutId=${checkoutId}`)
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
      setShowReturnSelector(false)
    }
  }

  return (
    <>
      <div
        className={`group relative bg-white rounded-lg overflow-hidden transition-all duration-300 
        ${isOutOfStock ? "opacity-70 grayscale" : "hover:shadow-lg hover:translate-y-[-4px]"} 
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

        {/* Wishlist - Position differently for mobile */}
        {/* <div className="absolute top-2 right-2 z-10 md:block hidden">
          <FavoriteButton productId={id} />
        </div> */}

        {/* Image section - takes left side on mobile */}
        <Link href={`/products/${id}`} className="block relative md:w-full w-1/3">
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
                  <div className="flex items-center gap-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    <Tag size={10} />
                    <span>Big Deal</span>
                  </div>
                )}
                {liveSale && !bigDeal && (
                  <div className="flex items-center gap-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    <Clock size={10} />
                    <span>Live Sale</span>
                  </div>
                )}
                {topPick && !bigDeal && !liveSale && (
                  <div className="flex items-center gap-1 bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    <Star size={10} />
                    <span>Top Pick</span>
                  </div>
                )}
              </div>
              <FavoriteButton productId={id} size="sm" />
            </div>
          </div>

          {/* Price Section - Stacked for mobile */}
          <div className="mt-1 md:mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              {hasDiscount ? (
                <>
                  <span className="text-base md:text-lg font-bold text-gray-900">{formatPrice(salePrice)}</span>
                  <span className="text-xs md:text-sm text-gray-500 line-through">{formatPrice(price)}</span>
                  <span className="text-[10px] md:text-xs font-medium bg-green-100 text-green-600 px-1 py-0.5 rounded">
                    {discountPercentage}% OFF
                  </span>
                </>
              ) : (
                <span className="text-base md:text-lg font-bold text-gray-900">{formatPrice(price)}</span>
              )}
            </div>

            <div className="flex justify-between items-center">
              {product?.colors && (
                <div className="flex items-center">
                  {Object.values(product?.colors || {})
                    .slice(0, 2)
                    .map((color, index) => (
                      <span
                        key={index}
                        className={`h-4 w-4 rounded-full border border-gray-300 ${index > 0 ? "-ml-2" : ""}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}

                  {Object.values(product?.colors || {}).length > 2 && (
                    <span className="text-sm text-black">+{Object.values(product.colors).length - 2}</span>
                  )}
                </div>
              )}


              <div className="flex">
                <RatingReview product={product} />
              </div>
            </div>

            <div className="flex justify-between items-center">


              <div className="flex">
                <ReturnTypeSelector product={product} />
              </div>
            </div>

            {hasDiscount && (
              <span className="text-[10px] md:text-[14px] text-green-500 font-semibold">
                You save: ₹{(price - salePrice).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Stock information - Show only if stock is less than 10 */}
          {showLowStock && (
            <div className="mt-1 md:mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1 md:h-1.5">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, 100 - (orders / stock) * 100))}%` }}
                ></div>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">Only {stock - orders} left in stock</p>
            </div>
          )}

          {/* Out of Stock */}
          {isOutOfStock && (
            <div className="mt-1 md:mt-2 text-[10px] md:text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 md:py-1 rounded text-center">
              Out of Stock
            </div>
          )}

          {!isOutOfStock && (
            <div className="mt-1 pt-2 border-t-2 border-none md:border-dashed border-black/20 md:mt-3 md:pt-3" >
              <div className="flex gap-2 w-full">
                <Button
                  onClick={isAdded ? handleRemove : handleAddToCart}
                  disabled={isLoading || isRemoving}
                  size="sm"
                  className={` text-xs py-4 flex items-center justify-center ${isAdded
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
          )}
        </div>
      </div>

      {/* Product Variant Modal */}
      <ProductVariantModal product={product} isOpen={showVariantModal} onClose={() => setShowVariantModal(false)} />

      {/* Return Type Selector for non-variable products */}
      <ReturnTypeSelector
        open={showReturnSelector}
        onClose={() => setShowReturnSelector(false)}
        onConfirm={handleReturnConfirm}
        productPrice={product?.salePrice || product?.price}
      />
    </>
  )
}

export default ProductCard