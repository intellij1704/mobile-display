import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import { AuthContextProvider } from "@/context/AuthContext"
import { getProductReviewCounts } from "@/lib/firestore/products/count/read"
import FavoriteButton from "@/app/components/FavoriteButton"
import MyRating from "@/app/components/MyRating"
import { Tag, Clock, ShoppingBag } from "lucide-react"

const ProductCard = ({ product }) => {
  const {
    id,
    title,
    price,
    salePrice,
    featureImageURL,
    shortDescription,
    bestSelling,
    isNewArrival,
    stock,
    orders = 0,
  } = product

  const isOutOfStock = stock <= orders

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
        {bestSelling && (
          <div className="flex items-center gap-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
            <Tag size={12} />
            <span>Bestseller</span>
          </div>
        )}
        {isNewArrival && !bestSelling && (
          <div className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
            <Clock size={12} />
            <span>New</span>
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
                width={200}  // Added explicit width for desktop
                height={200} // Added explicit height for desktop
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
          <Link href={`/products/${id}`} className="group-hover:text-blue-600 transition-colors duration-200">
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 md:h-10 group-hover:text-blue-600 transition-colors duration-200">
              {title}
            </h3>
          </Link>

          {/* Mobile-only badges and wishlist */}
          <div className="flex items-center justify-between mt-1 md:hidden">
            <div className="flex gap-1">
              {bestSelling && (
                <div className="flex items-center gap-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  <Tag size={10} />
                  <span>Bestseller</span>
                </div>
              )}
              {isNewArrival && !bestSelling && (
                <div className="flex items-center gap-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  <Clock size={10} />
                  <span>New</span>
                </div>
              )}
            </div>
            <AuthContextProvider>
              <FavoriteButton productId={id} size="sm" />
            </AuthContextProvider>
          </div>

          <p className="text-xs text-gray-500 line-clamp-2 md:h-8 mt-1">{shortDescription}</p>
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

          {hasDiscount && (
            <span className="text-[10px] md:text-xs text-gray-600">
              You save: ₹{(price - salePrice).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Stock information */}
        {!isOutOfStock && stock && (
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

        {/* Quick shop button - mobile version */}
        {!isOutOfStock && (
          <Link
            href={`/products/${id}`}
            className="mt-2 md:hidden bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center justify-center gap-1 shadow-sm"
          >
            <ShoppingBag size={12} />
            <span>View</span>
          </Link>
        )}
      </div>

      {/* Desktop-only quick shop button */}
      {!isOutOfStock && (
        <div className="absolute bottom-[6.5rem] left-0 right-0 md:flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 hidden">
          <Link
            href={`/products/${id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-md"
          >
            <ShoppingBag size={16} />
            <span>Quick View</span>
          </Link>
        </div>
      )}
    </div>
  )
}

export default ProductCard