"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingBag, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

  if (!product) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left">{product.title}</DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                {displayImages.length > 0 && (
                  <>
                    <Image
                      src={displayImages[currentImageIndex] || "/placeholder.svg"}
                      alt={product.title}
                      fill
                      className="object-contain p-4"
                    />
                    {displayImages.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {displayImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {displayImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        currentImageIndex === index ? "border-blue-500" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.title} ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-contain w-full h-full p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(product.salePrice || product.price)}
                  </span>
                  {product.salePrice && product.price > product.salePrice && (
                    <>
                      <span className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</span>
                      <Badge variant="destructive" className="text-xs">
                        {discountPercentage}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                {product.salePrice && (
                  <p className="text-sm text-green-600">You save: {formatPrice(product.price - product.salePrice)}</p>
                )}
              </div>

              {/* Key Features */}
              {product.keyFeatures && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                  <div
                    className="text-sm text-gray-600 prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: product.keyFeatures }}
                  />
                </div>
              )}

              {/* Color Selection */}
              {product?.isVariable && product?.colors?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Select Color</h4>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === color ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 capitalize">Selected: {selectedColor}</p>
                </div>
              )}

              {/* Quality Selection */}
              {product?.hasQualityOptions && product?.qualities?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Select Quality</h4>
                  <div className="flex gap-2">
                    {product.qualities.map((quality) => (
                      <Button
                        key={quality}
                        variant={selectedQuality === quality ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedQuality(quality)}
                        className="uppercase"
                      >
                        {quality}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Info */}
              {product.stock && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Stock:</span> {product.stock - (product.orders || 0)} available
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="flex-1 bg-black hover:bg-gray-800 text-white"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add To Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReturnTypeSelector
        open={showReturnSelector}
        onClose={() => setShowReturnSelector(false)}
        onConfirm={handleReturnConfirm}
        productPrice={product?.salePrice || product?.price}
      />
    </>
  )
}
