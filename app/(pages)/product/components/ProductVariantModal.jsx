"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingBag, Zap, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { useUser } from "@/lib/firestore/user/read"
import { updateCarts } from "@/lib/firestore/user/write"
import { createCheckoutCODAndGetId } from "@/lib/firestore/checkout/write"
import ReturnTypeSelector from "@/app/components/ReturnTypeSelector"

export default function ProductVariantModal({ product, isOpen, onClose }) {
  const router = useRouter()
  const { user } = useAuth()
  const { data: userData } = useUser({ uid: user?.uid })

  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "")
  const [selectedQuality, setSelectedQuality] = useState(product?.qualities?.[0] || "")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showReturnSelector, setShowReturnSelector] = useState(false)
  const [actionType, setActionType] = useState("") // "cart" or "buy"
  const [isLoading, setIsLoading] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setAnimate(true)
    } else {
      setAnimate(false)
    }
  }, [isOpen])

  // Get images for selected color or fallback to main images
  const displayImages = useMemo(() => {
    if (selectedColor && product?.variantImages?.[selectedColor]?.length > 0) {
      return product.variantImages[selectedColor]
    }
    return product?.imageList || [product?.featureImageURL].filter(Boolean)
  }, [selectedColor, product])

  const formatPrice = (amount) => `₹${amount?.toLocaleString("en-IN")}`
  const discountPercentage =
    product?.salePrice && product?.price > product?.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0

  const validateSelections = () => {
    if (product?.isVariable && product?.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color!")
      return false
    }
    if (product?.hasQualityOptions && product?.qualities?.length > 0 && !selectedQuality) {
      toast.error("Please select a quality!")
      return false
    }
    return true
  }

  const handleAddToCart = () => {
    if (!validateSelections()) return
    setActionType("cart")
    setShowReturnSelector(true)
  }

  const handleBuyNow = () => {
    if (!validateSelections()) return
    if (!user?.uid) {
      router.push("/login")
      return
    }
    setActionType("buy")
    setShowReturnSelector(true)
  }

  const handleReturnConfirm = async (choice) => {
    try {
      setIsLoading(true)

      if (actionType === "cart") {
        // Add to cart
        await updateCarts({
          list: [
            ...(userData?.carts ?? []),
            {
              id: product.id,
              quantity: 1,
              ...(product?.isVariable && { selectedColor }),
              ...(product?.hasQualityOptions && { selectedQuality }),
              returnType: choice.id,
              returnFee: choice.fee,
            },
          ],
          uid: user?.uid,
        })
        toast.success("Item added to cart")
        onClose()
      } else if (actionType === "buy") {
        // Buy now
        const checkoutId = await createCheckoutCODAndGetId({
          uid: user?.uid,
          products: [
            {
              product,
              quantity: 1,
              selectedColor: selectedColor || null,
              selectedQuality: selectedQuality || null,
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
  }

  const handleClose = () => {
    setAnimate(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  if (!product || (!isOpen && !animate)) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" aria-hidden="true" onClick={handleClose} />

      <div
        role="dialog"
        aria-modal="true"
        className={`fixed left-1/2 top-1/2 z-[101] w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[70vw] max-w-4xl max-h-[95vh] sm:max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-gray-200/50 transition-all duration-300 ease-out overflow-hidden ${animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            Product Details
          </h2>          <button
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-4 lg:p-6">
            {/* Image Section */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl sm:rounded-2xl overflow-hidden group border border-gray-100">
                {displayImages.length > 0 && (
                  <>
                    <Image
                      src={displayImages[currentImageIndex] || "/placeholder.svg"}
                      alt={product.title}
                      fill
                      className="object-contain p-4 sm:p-6 lg:p-8 transition-all duration-500 group-hover:scale-105"
                      priority
                    />
                    {displayImages.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-xl border-0 backdrop-blur-md w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full transition-all duration-200 hover:scale-110"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-xl border-0 backdrop-blur-md w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full transition-all duration-200 hover:scale-110"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        </Button>
                        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
                          {currentImageIndex + 1} / {displayImages.length}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {displayImages.length > 1 && (
                <div className="space-y-2 sm:space-y-4">
                  <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {displayImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${currentImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-200 shadow-lg scale-105"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${product.title} ${index + 1}`}
                          width={64}
                          height={64}
                          className="object-contain w-full h-full p-0.5 sm:p-1"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="space-y-0">
              <div className="">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{product.title}</h2>

                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      {formatPrice(product.salePrice || product.price)}
                    </span>
                    {product.salePrice && product.price > product.salePrice && (
                      <>
                        <span className="text-lg sm:text-xl text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                        <Badge
                          variant="destructive"
                          className="text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 rounded-full"
                        >
                          {discountPercentage}% OFF
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                {product.salePrice && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs sm:text-sm text-green-700 font-semibold">
                      You save: {formatPrice(product.price - product.salePrice)}
                    </p>
                  </div>
                )}
              </div>

              {/* Key Features */}
              {product.keyFeatures && (
                <div className="pt-4 sm:pt-5">
                  <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    Key Features
                  </h4>
                  <div
                    className="text-xs sm:text-sm text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.keyFeatures }}
                  />
                </div>
              )}

              {/* Color Selection */}
              {product?.isVariable && product?.colors?.length > 0 && (
                <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-5">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                    Select Color
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${selectedColor === color
                          ? "border-gray-800 ring-2 ring-gray-300 scale-110"
                          : "border-gray-300 hover:border-gray-400"
                          }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium capitalize">
                    Selected: <span className="text-gray-900 font-semibold">{selectedColor}</span>
                  </p>
                </div>
              )}

              {/* Quality Selection */}
              {product?.hasQualityOptions && product?.qualities?.length > 0 && (
                <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-5">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                    Select Quality
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.qualities.map((quality) => (
                      <Button
                        key={quality}
                        variant={selectedQuality === quality ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedQuality(quality)}
                        className={`uppercase font-semibold text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all duration-200 hover:scale-105 ${selectedQuality === quality ? "bg-gray-900 hover:bg-gray-800 shadow-lg" : "hover:bg-gray-100"
                          }`}
                      >
                        {quality}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="w-full sm:flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 sm:h-12 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add To Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={isLoading}
                  className="w-full sm:flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white h-12 sm:h-12 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReturnTypeSelector
        open={showReturnSelector}
        onClose={() => setShowReturnSelector(false)}
        onConfirm={handleReturnConfirm}
        productPrice={product?.salePrice || product?.price}
      />
    </>
  )
}
