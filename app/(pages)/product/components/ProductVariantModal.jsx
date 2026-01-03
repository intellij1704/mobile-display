"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingBag, Zap, X, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import { useUser } from "@/lib/firestore/user/read"
import { updateCarts } from "@/lib/firestore/user/write"
import { createCheckoutCODAndGetId } from "@/lib/firestore/checkout/write"
import ReturnTypeSelector from "@/app/components/ReturnTypeSelector"
import { getBrand } from "@/lib/firestore/brands/read_server"
import { getCategory } from "@/lib/firestore/categories/read_server"

export default function ProductVariantModal({ product, isOpen, onClose }) {
  const router = useRouter()
  const { user } = useAuth()
  const { data: userData } = useUser({ uid: user?.uid })

  const colors = useMemo(() =>
    product?.attributes?.find(attr => attr.name === "Color")?.values || [],
    [product])

  const qualities = useMemo(() =>
    product?.attributes?.find(attr => attr.name === "Quality")?.values || [],
    [product])

  const brands = useMemo(() =>
    product?.attributes?.find(attr => attr.name === "Brand")?.values || [],
    [product])



  const hasColorOptions = colors.length > 0
  const hasQualityOptions = qualities.length > 0
  const hasBrandOptions = brands.length > 0

  const isActuallyVariable = product?.isVariable && product.variations?.length > 0

  const [selectedColor, setSelectedColor] = useState("")
  const [selectedQuality, setSelectedQuality] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showReturnSelector, setShowReturnSelector] = useState(false)
  const [actionType, setActionType] = useState("") // "cart" or "buy"
  const [isLoading, setIsLoading] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [error, setError] = useState("")

  // Effect to handle animations and set initial selections when the modal opens
  useEffect(() => {
    if (isOpen) {
      setAnimate(true)
      setCurrentImageIndex(0)

      let initialColor = ""
      let initialQuality = ""
      let initialBrand = ""

      // If there's only one option for an attribute, auto-select it.
      // This ensures single-color products are selected by default.
      if (colors.length === 1) {
        initialColor = colors[0]
      }
      if (qualities.length === 1) {
        initialQuality = qualities[0]
      }
      if (brands.length === 1) {
        initialBrand = brands[0]
      }

      setSelectedColor(initialColor)
      setSelectedQuality(initialQuality)
      setSelectedBrand(initialBrand)

    } else {
      setAnimate(false)
      // Reset selections when modal closes for a clean state on next open
      setSelectedColor("")
      setSelectedQuality("")
      setSelectedBrand("")
    }
  }, [isOpen, product, colors, qualities, brands])

  // Clear error when selections change
  useEffect(() => {
    setError("")
  }, [selectedColor, selectedQuality, selectedBrand])

  const selectedVariation = useMemo(() => {
    // For non-variable products, create a mock variation from the base product
    if (!isActuallyVariable) {
      return {
        price: product.price,
        salePrice: product.salePrice,
        attributes: {},
        imageURLs: [],
      }
    }

    // Find the variation that matches the selected attributes
    return product.variations.find(v => {
      const colorMatch = !hasColorOptions || v.attributes.Color === selectedColor
      const qualityMatch = !hasQualityOptions || v.attributes.Quality === selectedQuality
      const brandMatch = !hasBrandOptions || v.attributes.Brand === selectedBrand
      return colorMatch && qualityMatch && brandMatch
    })
  }, [selectedColor, selectedQuality, selectedBrand, product, hasColorOptions, hasQualityOptions, hasBrandOptions, isActuallyVariable])

  // Compute the lowest variation for initial display
  const lowestVariation = useMemo(() => {
    if (!isActuallyVariable) {
      return {
        price: product.price,
        salePrice: product.salePrice,
        attributes: {},
        imageURLs: [],
      }
    }
    return product.variations.reduce((lowest, current) => {
      const lowestP = parseFloat(lowest.salePrice || lowest.price)
      const currentP = parseFloat(current.salePrice || current.price)
      return currentP < lowestP ? current : lowest
    }, product.variations[0])
  }, [product, isActuallyVariable])

  const displayVariation = selectedVariation || lowestVariation

  // Get images: variation images first, then append product.imageList as additional slides
  const displayImages = useMemo(() => {
    let images = []

    // Priority 1: display variation's imageURLs
    if (displayVariation?.imageURLs?.length > 0) {
      images = [...displayVariation.imageURLs]
    }
    // Priority 2: variantImages by selected color or lowest color (if no variation images)
    else {
      const color = (selectedColor || displayVariation?.attributes?.Color || "").toLowerCase()
      if (color && product?.variantImages?.[color]?.length > 0) {
        images = [...product.variantImages[color]]
      }
    }

    // Always append product.imageList as additional slides (after variation images)
    if (product?.imageList?.length > 0) {
      // To avoid duplicates, filter out images already in the variation list
      const imageListSet = new Set(images)
      const additionalImages = product.imageList.filter(img => !imageListSet.has(img))
      images = [...images, ...additionalImages]
    }

    // Final fallback if no images yet
    if (images.length === 0) {
      images = [product?.featureImageURL].filter(Boolean)
    }

    return images
  }, [displayVariation, selectedColor, product])

  const currentPrice = parseFloat(displayVariation?.salePrice || displayVariation?.price) || 0
  const originalPrice = displayVariation?.salePrice ? parseFloat(displayVariation.price) : null
  const discountPercentage = originalPrice && currentPrice < originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0

  const formatPrice = (amount) => `₹${amount?.toLocaleString("en-IN")}`

  const isAdded = useMemo(() => {
    if (!userData?.carts) return false

    return userData.carts.some((item) => {
      if (item?.id !== product.id) return false

      if (hasColorOptions) {
        if (item?.selectedColor !== selectedColor) return false
      } else {
        if (item?.selectedColor) return false
      }

      if (hasQualityOptions) {
        if (item?.selectedQuality !== selectedQuality) return false
      } else {
        if (item?.selectedQuality) return false
      }

      if (hasBrandOptions) {
        if (item?.selectedBrand !== selectedBrand) return false
      } else {
        if (item?.selectedBrand) return false
      }

      return true
    })
  }, [userData?.carts, product.id, selectedColor, selectedQuality, selectedBrand, hasColorOptions, hasQualityOptions, hasBrandOptions])

  const validateSelections = () => {
    if (isActuallyVariable && hasColorOptions && !selectedColor) {
      setError("Please select a color!")
      return false
    }
    if (isActuallyVariable && hasQualityOptions && !selectedQuality) {
      setError("Please select a quality!")
      return false
    }
    if (isActuallyVariable && hasBrandOptions && !selectedBrand) {
      setError("Please select a brand!")
      return false
    }
    if (isActuallyVariable && !selectedVariation) {
      setError("Please select a variation. This combination is not available.")
      return false
    }
    setError("")
    return true
  }

  const handleAddToCart = () => {
    if (!validateSelections()) return
    setActionType("cart")
    setShowReturnSelector(true)
  }

  const handleRemoveFromCart = useCallback(async () => {
    if (!confirm("Remove this item from cart?")) return;

    setIsLoading(true);

    const itemToRemove = userData.carts.find(cartItem => {
      if (cartItem?.id !== product.id) return false;
      if (hasColorOptions && cartItem?.selectedColor !== selectedColor) return false;
      if (hasQualityOptions && cartItem?.selectedQuality !== selectedQuality) return false;
      if (hasBrandOptions && cartItem?.selectedBrand !== selectedBrand) return false;
      return true;
    });
    const quantityToRemove = itemToRemove?.quantity || 1;

    /* --------------------------------
       GA4 REMOVE FROM CART (IMMEDIATE)
    --------------------------------- */
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });

    let categoryName = product?.categoryName || "Mobile Spare Parts";
    let brandName = product?.brand || "Mobile Display";
    try {
      if (product?.categoryId) {
        const cat = await getCategory({ id: product.categoryId });
        if (cat?.name) categoryName = cat.name;
      }
      if (product?.brandId) {
        const brand = await getBrand({ id: product.brandId });
        if (brand?.name) brandName = brand.name;
      }
    } catch (error) {
      console.error("GTM remove_from_cart data fetch error", error);
    }

    window.dataLayer.push({
      event: "remove_from_cart",
      ecommerce: {
        currency: "INR",
        value: Number(currentPrice) * Number(quantityToRemove),
        items: [
          {
            item_id: product?.id,
            item_name: product?.title,
            sku: product?.sku || product?.id,
            price: Number(currentPrice),
            quantity: Number(quantityToRemove),
            item_category: categoryName,
            item_brand: brandName,
            product_type: product?.isVariable ? "variable" : "simple",
          },
        ],
      },
    });

    /* --------------------------------
       CART UPDATE (Firestore)
    --------------------------------- */
    try {
      if (!userData?.carts) {
        toast.error("Cart is empty");
        return;
      }

      const newList = userData.carts.filter((cartItem) => {
        if (cartItem?.id !== product.id) return true;

        if (hasColorOptions) {
          if (cartItem?.selectedColor !== selectedColor) return true;
        } else if (cartItem?.selectedColor) {
          return true;
        }

        if (hasQualityOptions) {
          if (cartItem?.selectedQuality !== selectedQuality) return true;
        } else if (cartItem?.selectedQuality) {
          return true;
        }

        if (hasBrandOptions) {
          if (cartItem?.selectedBrand !== selectedBrand) return true;
        } else if (cartItem?.selectedBrand) {
          return true;
        }

        return false;
      });

      if (newList.length === userData.carts.length) {
        toast.error("Item not found in cart");
        return;
      }

      await updateCarts({ list: newList, uid: user?.uid });
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast.error(error?.message || "Failed to remove item");
    } finally {
      setIsLoading(false);
    }
  }, [
    userData?.carts,
    product,
    selectedColor,
    selectedQuality,
    selectedBrand,
    hasColorOptions,
    hasQualityOptions,
    hasBrandOptions,
    user?.uid,
    currentPrice,
  ]);


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
              ...(hasColorOptions && { selectedColor }),
              ...(hasQualityOptions && { selectedQuality }),
              ...(hasBrandOptions && { selectedBrand }),
              returnType: choice.id,
              returnFee: choice.fee,
            },
          ],
          uid: user?.uid,
        })
        toast.success("Item added to cart")

        // GTM add_to_cart event
        let categoryName = product?.categoryName || "Mobile Spare Parts";
        let brandName = product?.brand || "Mobile Display";

        try {
          if (product?.categoryId) {
            const cat = await getCategory({ id: product.categoryId });
            if (cat?.name) categoryName = cat.name;
          }
          if (product?.brandId) {
            const brand = await getBrand({ id: product.brandId });
            if (brand?.name) brandName = brand.name;
          }
        } catch (error) {
          console.error("GTM Data Fetch Error for add_to_cart:", error);
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "add_to_cart",
          ecommerce: {
            currency: "INR",
            value: currentPrice,
            items: [{
              item_id: product.id,
              item_name: product.title,
              sku: product.sku || product.id,
              price: currentPrice,
              quantity: 1,
              item_category: categoryName,
              item_brand: brandName,
            }],
          },
        });

        onClose()
      } else if (actionType === "buy") {
        // Buy now
        const serializedProduct = {
          id: product.id,
          categoryId: product.categoryId,
          title: product.title,
          featureImageURL: product.featureImageURL,
          isVariable: product.isVariable,
          variations: product.variations,
          price: product.price,
          salePrice: product.salePrice,
        }
        // const checkoutId = await createCheckoutCODAndGetId({
        //   uid: user?.uid,
        //   products: [
        //     {
        //       product: serializedProduct,
        //       quantity: 1,
        //       selectedColor: selectedColor || null,
        //       selectedQuality: selectedQuality || null,
        //       returnType: choice.id,
        //     },
        //   ],
        //   address: userData?.address || {},
        //   deliveryType: "standard",
        //   appliedCoupons: [],
        //   appliedOffers: [],
        // })
        router.push(`/checkout?${new URLSearchParams({
          type: "buynow",
          productId: product?.id,
          ...(selectedColor ? { color: selectedColor } : {}),
          ...(selectedQuality ? { quality: selectedQuality } : {}),
          ...(selectedBrand ? { brand: selectedBrand } : {}),
          ...(choice?.id ? { returnType: choice.id } : {})
        }).toString()}`);

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

  const isDarkColor = (color) => {
    // Simple check for dark colors; can expand if needed
    const darkColors = ['black', 'red', 'blue', 'green', 'purple', 'brown'];
    return darkColors.includes(color.toLowerCase());
  }

  if (!product || (!isOpen && !animate)) return null

  const isActionDisabled = isLoading

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
                      unoptimized
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
                        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs backdrop-blur-sm">
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
                          unoptimized
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
                      {formatPrice(currentPrice)}
                    </span>
                    {displayVariation?.salePrice && originalPrice > currentPrice && (
                      <>
                        <span className="text-lg sm:text-xl text-gray-500 line-through">
                          {formatPrice(originalPrice)}
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
                {displayVariation?.salePrice && originalPrice > currentPrice && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs sm:text-sm text-green-700 font-semibold">
                      You save: {formatPrice(originalPrice - currentPrice)}
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
              {isActuallyVariable && hasColorOptions && (
                <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-5">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                    Select Color
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {colors.map((color) => {
                      const isSelected = selectedColor === color;
                      const colorStyle = color.toLowerCase();
                      const checkClass = isDarkColor(colorStyle) ? "text-white" : "text-black";
                      return (
                        <label
                          key={color}
                          className="relative cursor-pointer transform transition-transform duration-150 hover:scale-105 active:scale-95"
                          title={color}
                        >
                          <input
                            type="radio"
                            name="color"
                            value={color}
                            checked={isSelected}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="sr-only peer"
                            aria-label={`Select ${color} color`}
                          />

                          {/* Color circle */}
                          <span
                            className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ease-in-out ${isSelected
                              ? "border-black ring-2 ring-black/30 shadow-md scale-105"
                              : "border-gray-300 hover:border-gray-500"
                              }`}
                            style={{ backgroundColor: colorStyle }}
                          >
                            {isSelected && (
                              <Check
                                size={18}
                                strokeWidth={3}
                                className={`transition-opacity duration-200 ${checkClass} opacity-100`}
                              />
                            )}
                          </span>

                          <span
                            className={`block text-xs text-center mt-1 transition-colors duration-200 ${isSelected ? "font-semibold text-black" : "text-gray-600"
                              }`}
                          >
                            {color}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium capitalize">
                    Selected color: <span className="text-gray-900 font-semibold">{selectedColor || "None"}</span>
                  </p>
                </div>
              )}

              {/* Quality Selection */}
              {isActuallyVariable && hasQualityOptions && (
                <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-5">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                    Select Quality
                  </h4>
                  <div className="flex flex-wrap gap-3 items-start justify-start">
                    {qualities.map((quality) => {
                      const isSelected = selectedQuality === quality;
                      return (
                        <label
                          key={quality}
                          className={`relative border rounded-xl px-4 py-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 w-fit min-w-[120px] max-w-[180px]
                          ${isSelected
                              ? "border-[#BB0300] bg-red-50 shadow-sm"
                              : "border-gray-300 bg-white hover:border-gray-400"
                            }`}
                        >
                          <input
                            type="radio"
                            name="quality"
                            value={quality}
                            checked={isSelected}
                            onChange={(e) => setSelectedQuality(e.target.value)}
                            className="sr-only"
                          />

                          {/* Tick mark */}
                          {isSelected && (
                            <span className="absolute -top-2 -right-2 bg-[#BB0300] text-white rounded-full p-[2px]">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}

                          {/* Title */}
                          <span
                            className={`text-sm font-semibold text-center ${isSelected ? "text-black" : "text-gray-800"
                              }`}
                          >
                            {quality}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium capitalize">
                    Selected quality: <span className="text-gray-900 font-semibold">{selectedQuality || "None"}</span>
                  </p>
                </div>
              )}

              {/* Brand Selection */}
              {isActuallyVariable && hasBrandOptions && (
                <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-5">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                    Select Brand
                  </h4>
                  <div className="flex flex-wrap gap-3 items-start justify-start">
                    {brands.map((brand) => {
                      const isSelected = selectedBrand === brand;
                      return (
                        <label
                          key={brand}
                          className={`relative border rounded-xl px-4 py-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 w-fit min-w-[120px] max-w-[180px]
                          ${isSelected
                              ? "border-[#BB0300] bg-red-50 shadow-sm"
                              : "border-gray-300 bg-white hover:border-gray-400"
                            }`}
                        >
                          <input
                            type="radio"
                            name="brand"
                            value={brand}
                            checked={isSelected}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="sr-only"
                          />

                          {isSelected && (
                            <span className="absolute -top-2 -right-2 bg-[#BB0300] text-white rounded-full p-[2px]">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}

                          <span
                            className={`text-sm font-semibold text-center ${isSelected ? "text-black" : "text-gray-800"
                              }`}
                          >
                            {brand}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium capitalize">
                    Selected brand: <span className="text-gray-900 font-semibold">{selectedBrand || "None"}</span>
                  </p>
                </div>
              )}

              {error && <p className="text-red-500 text-sm pt-4">{error}</p>}

              <div className="flex flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <Button
                  onClick={isAdded ? handleRemoveFromCart : handleAddToCart}
                  disabled={isActionDisabled}
                  className="w-full sm:flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 sm:h-12 text-sm sm:text-base font-bold rounded-xl sm:rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  {isAdded ? (
                    <>
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Remove From Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Add To Cart
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={isActionDisabled}
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
        productPrice={currentPrice}
      />
    </>
  )
}