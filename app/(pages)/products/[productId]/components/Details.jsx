// app/components/product/Details.jsx (rewritten completely)
import AddToCartButton from "@/app/components/AddToCartButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import MyRating from "@/app/components/MyRating";
import { AuthContextProvider } from "@/context/AuthContext";
import { getProductReviewCounts } from "@/lib/firestore/products/count/read";
import { ShoppingCart } from "lucide-react";
import { Suspense } from "react";
import OffersSection from "./OffersSection"; // New component for offers
import DeliveryChecker from "./DeliveryChecker";
import { addDays, format } from "date-fns";
import ColorSelector from "./ColorSelector";
import QualitySelector from "./QualitySelector";
import ActionButtons from "./ActionButtons";

async function Details({ product, selectedColor, selectedQuality }) {
  // For variable products, find selected variation
  const selectedVariation = product?.isVariable
    ? product.variations?.find(v => 
        v.attributes.Color === selectedColor && v.attributes.Quality === selectedQuality
      )
    : null;

  const effectivePrice = product?.isVariable ? (selectedVariation?.salePrice || selectedVariation?.price) : (product?.salePrice || product?.price);
  const effectiveOriginalPrice = product?.isVariable ? selectedVariation?.price : product?.price;
  const discount = effectiveOriginalPrice && effectivePrice && effectiveOriginalPrice > effectivePrice
    ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
    : 0;

  const effectiveStock = product?.isVariable ? parseInt(selectedVariation?.stock || 0) : (product?.stock || 0);
  const isOutOfStock = product?.isVariable ? (!selectedVariation || effectiveStock <= 0) : (product.stock <= (product.orders ?? 0));

  const whyBuyUs = [
    {
      id: 1,
      title: "Pay 10% on Order",
      description: "Pay remaining on delivery",
      icon: "/icon/pay-icon.svg",
    },
    {
      id: 2,
      title: "Phoner Guarantee",
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

  // Compute colors and qualities from attributes
  const colors = product?.attributes?.find(a => a.name === "Color")?.values || [];
  const qualities = product?.attributes?.find(a => a.name === "Quality")?.values || [];
  const hasQualityOptions = qualities.length > 0;

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
          ₹{effectivePrice || "N/A"}
        </h2>
        {effectiveOriginalPrice && effectivePrice && effectiveOriginalPrice > effectivePrice && (
          <>
            <span className="text-gray-500 line-through text-md">
              ₹{effectiveOriginalPrice}
            </span>
            <div className="flex flex-col items-start">
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                {discount}% OFF
              </span>
            </div>
          </>
        )}
      </div>

      {/* Special Offers Section - New */}
      <OffersSection product={product} />

      {/* Key Features */}
      <div className="w-full mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Features</h3>
        <div
          className="text-gray-700 space-y-2 jodit-wysiwyg"
          dangerouslySetInnerHTML={{ __html: product?.keyFeatures || "<p>No key features available</p>" }}
        />
      </div>

      {/* Color Selection */}
      {product?.isVariable && colors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Select Color</h3>
          <ColorSelector
            colors={colors}
            selectedColor={selectedColor}
            productId={product.id}
            currentQuality={selectedQuality}
          />
        </div>
      )}

      {/* Quality Selection */}
      {product?.isVariable && hasQualityOptions && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Select Quality</h3>
          <QualitySelector
            qualities={qualities}
            selectedQuality={selectedQuality}
            productId={product.id}
            currentColor={selectedColor}
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
          isDisabled={isOutOfStock}
        />
      </AuthContextProvider>

      {/* Stock Info */}
      {isOutOfStock && (
        <div className="mt-3">
          <h3 className="text-red-500 bg-red-50 py-1 px-2 rounded-lg text-sm">
            Out of Stock
          </h3>
        </div>
      )}

      {/* Estimated Delivery */}
      <div className="mt-5 text-sm text-gray-700">
        Estimated delivery: <strong>{estimatedDate}</strong>
      </div>

      {/* Why Buy Us */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 mt-8">
        {whyBuyUs.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 p-4 rounded-xl">
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