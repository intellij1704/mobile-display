"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { useSpecialOffers } from "@/lib/firestore/specialOffers/read"
import { AuthContextProvider, useAuth } from "@/context/AuthContext"
import { createCheckoutCODAndGetId } from "@/lib/firestore/checkout/write"
import AddToCartButton from "@/app/components/AddToCartButton"
import ReturnTypeSelector from "@/app/components/ReturnTypeSelector"
import { useUser } from "@/lib/firestore/user/read"

export default function ActionButtons({ product, selectedColor, selectedQuality, selectedVariation }) {
  const { data, error, isLoading } = useSpecialOffers()
  const { user } = useAuth()
  const { data: userData, isLoading: isLoadingUser } = useUser({ uid: user?.uid })
  const router = useRouter()

  const [isLoadingBuyNow, setIsLoadingBuyNow] = useState(false)
  const [showSelector, setShowSelector] = useState(false)
  const [pendingBuy, setPendingBuy] = useState(false)

  // Compute colors and qualities from attributes
  const colors = product?.attributes?.find(a => a.name === "Color")?.values || [];
  const qualities = product?.attributes?.find(a => a.name === "Quality")?.values || [];
  const hasColorOptions = colors.length > 0;
  const hasQualityOptions = qualities.length > 0;
  const isActuallyVariable = product?.isVariable && product.variations?.length > 0;

  const mrp = parseFloat(selectedVariation?.price) || 0
  const salePrice = selectedVariation?.salePrice ? parseFloat(selectedVariation.salePrice) : null
  const hasSale = !!salePrice
  const basePrice = salePrice || mrp

  const activeOffers = useMemo(() => {
    return data?.filter((offer) => offer.status === "Active" && offer.categories?.includes(product.categoryId)) || []
  }, [data, product?.categoryId])

  const maxDiscountPerc = activeOffers.reduce((max, offer) => Math.max(max, offer.discountPercentage || 0), 0)

  const highestOffer = activeOffers.reduce(
    (prev, current) => ((prev?.discountPercentage || 0) > (current?.discountPercentage || 0) ? prev : current),
    { discountPercentage: 0, offerType: "", couponCode: "" },
  )

  const additionalDiscount = basePrice * (maxDiscountPerc / 100)
  const effectivePrice = basePrice - additionalDiscount
  const totalSavings = mrp - effectivePrice
  const hasAdditionalOffers = activeOffers.length > 0
  const hasOffers = hasSale || hasAdditionalOffers

  const discount = mrp && salePrice && mrp > salePrice
    ? Math.round(((mrp - salePrice) / mrp) * 100)
    : 0

  const validateSelection = () => {
    if (isActuallyVariable && hasColorOptions && !selectedColor) {
      toast.error("Please select a color")
      return false
    }
    if (isActuallyVariable && hasQualityOptions && !selectedQuality) {
      toast.error("Please select a quality")
      return false
    }
    if (isActuallyVariable) {
      const selectedVar = product.variations.find(v => {
        const colorMatch = !hasColorOptions || v.attributes.Color === selectedColor
        const qualityMatch = !hasQualityOptions || v.attributes.Quality === selectedQuality
        return colorMatch && qualityMatch
      })
      if (!selectedVar) {
        toast.error("This combination is not available.")
        return false
      }
    }
    return true
  }

  const beginBuyNow = async () => {
    setPendingBuy(true)
    setShowSelector(true)
  }

  const onConfirmReturnForBuy = async (choice) => {
    try {
      setIsLoadingBuyNow(true)
      if (isLoadingUser || !userData) {
        throw new Error("User data not loaded. Please try again.")
      }
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
        appliedOffers: activeOffers,
      })

      router.push(
        `/checkout?${new URLSearchParams({
          type: "buynow",
          productId: product?.id,
          checkoutId,
          ...(selectedColor ? { color: selectedColor } : {}),
          ...(selectedQuality ? { quality: selectedQuality } : {}),
          ...(choice?.id ? { returnType: choice.id } : {})
        })}`
      );

    } catch (err) {
      toast.error(err?.message || "Something went wrong")
    } finally {
      setIsLoadingBuyNow(false)
      setPendingBuy(false)
      setShowSelector(false)
    }
  }

  const handleBuyNowClick = async (e) => {
    e.preventDefault()
    if (!validateSelection()) return

    if (!user?.uid) {
      router.push("/login")
      return
    }

    await beginBuyNow()
  }

  if (isLoading) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Offers</h3>
        <p className="text-sm text-gray-500">Loading offers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Offers</h3>
        <p className="text-sm text-red-500">Failed to load offers: {String(error)}</p>
      </div>
    )
  }

  return (
    <div className="md:static md:bg-transparent fixed bottom-0 left-0 w-full bg-white p-4 md:p-0 md:mt-5 rounded-xl shadow-md md:shadow-none z-[999]">
      {hasAdditionalOffers && (
        <div className="bg-red-500 absolute -top-5 left-0 -z-[999] text-white text-center text-sm rounded-t-3xl p-1 w-full">
          Get {maxDiscountPerc}% off on {highestOffer.offerType}  {highestOffer?.couponCode}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Price (mobile only) */}
        <div className="flex items-center gap-3 md:hidden">
          <h2 className="text-2xl font-bold text-gray-900">₹{salePrice || mrp}</h2>
          {mrp && salePrice && mrp > salePrice && (
            <>
              <span className="text-gray-500 line-through text-md">₹{mrp}</span>
              <span className="text-green-600 text-sm font-semibold">{discount}% Off</span>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex w-full md:w-auto gap-3">
          <AuthContextProvider>
            <AddToCartButton
              product={product}
              productId={product?.id}
              type="large"
              selectedColor={selectedColor}
              selectedQuality={selectedQuality}
              isVariable={isActuallyVariable && hasColorOptions}
              hasQualityOptions={hasQualityOptions}
              className="flex-1 bg-black text-white py-5 rounded-lg text-center"
              productPrice={salePrice || mrp}
            />
          </AuthContextProvider>

          <Button
            onClick={handleBuyNowClick}
            disabled={isLoadingBuyNow || isLoadingUser}
            className="flex-1 w-full text-sm sm:text-base md:py-5 py-5 px-3 sm:px-6 text-red-500 font-normal border border-red-500 rounded-lg shadow hover:bg-red-500 hover:text-white transition duration-300 disabled:opacity-60 bg-white"
            variant="outline"
          >
            {isLoadingBuyNow ? "Processing..." : "Buy Now"}
          </Button>
        </div>
      </div>

      {/* Shared Return Selector for Buy Now */}
      <ReturnTypeSelector
        open={showSelector && pendingBuy}
        onClose={() => {
          setShowSelector(false)
          setPendingBuy(false)
        }}
        onConfirm={onConfirmReturnForBuy}
        productPrice={salePrice || mrp}
      />
    </div>
  )
}