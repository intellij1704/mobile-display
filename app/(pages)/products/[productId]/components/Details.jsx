// app/components/product/Details.jsx (rewritten completely)
import AddToCartButton from "@/app/components/AddToCartButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import MyRating from "@/app/components/MyRating";
import { AuthContextProvider } from "@/context/AuthContext";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import { ShoppingCart } from "lucide-react";
import { Suspense, useMemo } from "react";
import OffersSection from "./OffersSection"; // New component for offers
import DeliveryChecker from "./DeliveryChecker";
import { addDays, format } from "date-fns";
import ColorSelector from "./ColorSelector";
import QualitySelector from "./QualitySelector";
import ActionButtons from "./ActionButtons";
import BrandsSelector from "./BrandsSelector";

async function Details({ product, selectedColor, selectedQuality, selectedBrand }) {
  // Compute colors and qualities from attributes
  const colors = product?.attributes?.find(a => a.name === "Color")?.values || [];
  const qualities = product?.attributes?.find(a => a.name === "Quality")?.values || [];
  const brands = product?.attributes?.find(a => a.name === "Brand")?.values || [];
  const hasColorOptions = colors.length > 0;
  const hasQualityOptions = qualities.length > 0;
  const hasBrandOptions = brands.length > 0;
  const isActuallyVariable = product?.isVariable && product.variations?.length > 0;

  const selectedVariation = useMemo(() => {
    // For non-variable products, create a mock variation from the base product
    if (!isActuallyVariable) {
      return {
        price: product.price,
        salePrice: product.salePrice,
        attributes: {},
        imageURLs: [],
        stock: product.stock,
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
        stock: product.stock,
      }
    }
    return product.variations.reduce((lowest, current) => {
      const lowestP = parseFloat(lowest.salePrice || lowest.price)
      const currentP = parseFloat(current.salePrice || current.price)
      return currentP < lowestP ? current : lowest
    }, product.variations[0])
  }, [product, isActuallyVariable])

  const displayVariation = selectedVariation || lowestVariation;

  const currentPrice = parseFloat(displayVariation?.salePrice || displayVariation?.price) || 0
  const originalPrice = displayVariation?.salePrice ? parseFloat(displayVariation.price) : null
  const discountPercentage = originalPrice && currentPrice < originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0

  const whyBuyUs = [
    {
      id: 1,
      title: "Pay 10% on Order",
      description: "Pay remaining on delivery",
      icon: "/icon/pay-icon.svg",
    },
    {
      id: 2,
      title: "Mobile Display Guarantee",
      description: "Assured quality parts",
      icon: "/icon/guarantee-icon.svg",
    },
    {
      id: 3,
      title: "Payment Protection",
      description: "100% secure payments",
      icon: "/icon/protection.svg",
    },
  ];

  function getEstimatedDelivery(days) {
    const today = new Date();
    const startDate = format(today, "dd MMMM, yyyy"); // Today
    const endDate = format(addDays(today, days), "dd MMMM, yyyy"); // +3 days
    return ` ${endDate}`;
  }

  const estimatedDate = getEstimatedDelivery(3);

  return (
    <div className="w-full ">
      {/* Product Title */}
      <h1 className="text-xl font-bold mb-2 text-gray-900">
        {product?.title || "Product Title"}
      </h1>

      {/* Short Description */}
      {product?.shortDescription && (
        <p className="text-gray-700 text-sm mb-4">
          {product.shortDescription}
        </p>
      )}

      {/* Rating & Review */}
      <Suspense fallback={<p>Loading ratings...</p>}>
        <RatingReview product={product} />
      </Suspense>

      {/* Price Section with Enhanced Discount Display */}
      <div className="flex items-center gap-3 mt-4">
        <h2 className="text-2xl font-bold text-gray-900">
          ₹{currentPrice || "N/A"}
        </h2>
        {originalPrice && currentPrice < originalPrice && (
          <>
            <span className="text-gray-500 line-through text-md">
              ₹{originalPrice}
            </span>
            <div className="flex flex-col items-start">
              <span className="bg-[#BB0300] text-white text-sm font-bold px-3 py-1 rounded-lg">
                {discountPercentage}% OFF
              </span>
            </div>
          </>
        )}
      </div>

      {/* Special Offers Section - New */}
      <OffersSection product={product} selectedVariation={displayVariation} />

      {/* Key Features */}
      <div className="w-full mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Features</h3>
        <div
          className="text-gray-700 space-y-2 jodit-wysiwyg"
          dangerouslySetInnerHTML={{ __html: product?.keyFeatures || "<p>No key features available</p>" }}
        />
      </div>


      {/* Brand Selection */}
      {isActuallyVariable && hasBrandOptions && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Select Brand</h3>
          <BrandsSelector
            brands={brands}
            selectedBrand={selectedBrand}
            productId={product.id}
            currentColor={selectedColor}
            currentQuality={selectedQuality}
          />
        </div>
      )}

      {/* Color Selection */}
      {isActuallyVariable && hasColorOptions && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Select Color</h3>
          <ColorSelector
            colors={colors}
            selectedColor={selectedColor}
            productId={product.id}
            currentQuality={selectedQuality}
            currentBrand={selectedBrand}
          />
        </div>
      )}

      {/* Quality Selection */}
      {isActuallyVariable && hasQualityOptions && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Select Quality</h3>
          <QualitySelector
            qualities={qualities}
            selectedQuality={selectedQuality}
            productId={product.id}
            currentColor={selectedColor}
            currentBrand={selectedBrand}
          />
        </div>
      )}

      <div className="mt-6">
        <DeliveryChecker />
      </div>

      {/* Action Buttons */}
      <AuthContextProvider>
        <ActionButtons
          product={product}
          selectedColor={selectedColor}
          selectedQuality={selectedQuality}
          selectedBrand={selectedBrand}
          selectedVariation={displayVariation}
        />
      </AuthContextProvider>

      {/* Estimated Delivery */}
      <div className="mt-5 text-sm text-gray-700">
        Estimated delivery: <strong>{estimatedDate}</strong>
      </div>

      {/* Why Buy Us */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-6 gap-3 p-4 md:mt-4 mt-2">
        {whyBuyUs.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 py-2 rounded-xl">
            <div className="w-12 h-12">
              <img src={item.icon} alt={item.title} className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Rating & Review Component
async function RatingReview({ product }) {
  const counts = await getProductReviewCounts({ productId: product?.id });

  return (
    <div className="flex flex-col gap-1">
      <MyRating value={counts?.averageRating ?? 4} />
      <p className="text-sm text-gray-800">
        {counts?.averageRating?.toFixed(2)} • {counts?.totalReviews || 0} reviews
      </p>
    </div>
  );
}

export default Details;