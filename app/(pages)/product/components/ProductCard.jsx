import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { AuthContextProvider } from "@/context/AuthContext"
import { getProductReviewCounts } from "@/lib/firestore/products/count/read"
import FavoriteButton from "@/app/components/FavoriteButton"
import MyRating from "@/app/components/MyRating"
import { Tag, Clock, Star, ShoppingBag } from "lucide-react"
import AddToCartButton from "@/app/components/AddToCartButton"
import RatingReview from "@/app/components/RatingReview"

const ProductCard = ({ product }) => {
  console.log(product)
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

  const isOutOfStock = stock <= orders
  const showLowStock = !isOutOfStock && stock && (stock - orders) < 10

  const formatPrice = (amount) => `₹${amount?.toLocaleString("en-IN")}`
  const discountPercentage = salePrice && price > salePrice ? Math.round(((price - salePrice) / price) * 100) : 0
  const hasDiscount = discountPercentage > 0

  return (
    <div
      className={`group relative bg-white rounded-lg overflow-hidden transition-all duration-300 
      ${isOutOfStock ? "opacity-70 grayscale" : "hover:shadow-lg hover:translate-y-[-4px]"} 
      border border-gray-100
      md:flex-col md:h-full
      flex flex-row h-40 w-full`}
    >
      {/* Badges - Position differently for mobile */}
      <div className="absolute top-2 left-2 z-10 md:flex flex-col gap-2 hidden">
        {bigDeal && (
          <div className="flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
            <Tag size={12} />
            <span>Big Deal</span>
          </div>
        )}
        {liveSale && !bigDeal && (
          <div className="flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
            <Clock size={12} />
            <span>Live Sale</span>
          </div>
        )}
        {topPick && !bigDeal && !liveSale && (
          <div className="flex items-center gap-1 bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
            <Star size={12} />
            <span>Top Pick</span>
          </div>
        )}
      </div>

      {/* Wishlist - Position differently for mobile */}
      <div className="absolute top-2 right-2 z-10 md:block hidden">
        <AuthContextProvider>
          <FavoriteButton productId={id} />
        </AuthContextProvider>
      </div>

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
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%'
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
          <Link href={`/products/${seoSlug || id}`} className="group-hover:text-blue-600 transition-colors duration-200">
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
            <AuthContextProvider>
              <FavoriteButton productId={id} size="sm" />
            </AuthContextProvider>
          </div>

        </div>

        {/* Price Section - Stacked for mobile */}
        <div className="mt-1 md:mt-2">
          <div className="flex items-center gap-2 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="text-base md:text-lg font-bold text-gray-900">
                  {formatPrice(salePrice)}
                </span>
                <span className="text-xs md:text-sm text-gray-500 line-through">
                  {formatPrice(price)}
                </span>
                <span className="text-[10px] md:text-xs font-medium bg-red-100 text-red-600 px-1 py-0.5 rounded">
                  {discountPercentage}% OFF
                </span>
              </>
            ) : (
              <span className="text-base md:text-lg font-bold text-gray-900">
                {formatPrice(price)}
              </span>
            )}
          </div>



          <div className="flex justify-between items-center">
            {product.colors && <div className="flex items-center">
              {Object.values(product?.colors || {})
                .slice(0, 2)
                .map((color, index) => (
                  <span
                    key={index}
                    className={`h-4 w-4 rounded-full border border-gray-300 ${index > 0 ? "-ml-2" : ""
                      }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}

              {Object.values(product?.colors || {}).length > 2 && (
                <span className="text-sm text-black">
                  +{Object.values(product.colors).length - 2}
                </span>
              )}

            </div>}

            <div className="flex">
              <RatingReview product={product} />
            </div>
          </div>

          {hasDiscount && (
            <span className="text-[10px] md:text-xs text-gray-600">
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
            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
              Only {stock - orders} left in stock
            </p>
          </div>
        )}

        {/* Out of Stock */}
        {isOutOfStock && (
          <div className="mt-1 md:mt-2 text-[10px] md:text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 md:py-1 rounded text-center">
            Out of Stock
          </div>
        )}

      </div>


    </div>
  )
}

export default ProductCard