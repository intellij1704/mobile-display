import React from 'react'
import { useMemo } from 'react'

function ProductRow({ item, estimatedDelivery, getCategoryName }) {
    const qty = item?.quantity || 0

    // Find variation if product is variable
    const variation = useMemo(() => {
        const product = item?.product
        if (product?.isVariable && product?.variations && item?.selectedColor && item?.selectedQuality) {
            return product.variations.find(
                (v) =>
                    v.attributes?.Color?.toLowerCase() === item.selectedColor?.toLowerCase() &&
                    v.attributes?.Quality?.toLowerCase() === item.selectedQuality?.toLowerCase()
            )
        }
        return null
    }, [item])

    // Pricing - Prioritize variation, then product
    const listPrice = useMemo(() => {
        return parseFloat(variation?.price || item?.product?.price || 0)
    }, [variation, item])

    const salePrice = useMemo(() => {
        return parseFloat(variation?.salePrice || item?.product?.salePrice || 0)
    }, [variation, item])

    const hasSale = useMemo(() => {
        return salePrice > 0 && salePrice < listPrice
    }, [salePrice, listPrice])

    const effectivePrice = useMemo(() => hasSale ? salePrice : listPrice, [hasSale, salePrice, listPrice])

    const total = qty * effectivePrice

    // Image - Prioritize variation images, then variantImages by color, then featureImage, then fallback
    const imageSrc = useMemo(() => {
        if (variation?.imageURLs?.length > 0) {
            return variation.imageURLs[0]
        }
        if (item?.product?.variantImages && item?.selectedColor) {
            const colorKey = item.selectedColor.toLowerCase()
            if (item.product.variantImages[colorKey]?.length > 0) {
                return item.product.variantImages[colorKey][0]
            }
        }
        return item?.product?.featureImageURL || "/product-img.png"
    }, [variation, item])

    return (
        <div className="flex items-start justify-between">
            <div className="flex items-start">
                <div className="mr-3 rounded-lg bg-gray-100 overflow-hidden md:w-40 w-32 h-auto flex items-center justify-center">
                    <img
                        src={imageSrc}
                        alt={item?.product?.title || "Product"}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        {item?.product?.title}
                        {item?.selectedQuality ? ` - ${item.selectedQuality}` : ""}
                        {item?.selectedColor ? ` - ${item.selectedColor}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {qty}</p>
                    <p className="text-xs text-gray-500">Category: {getCategoryName(item?.product?.categoryId)}</p>
                    <p className="text-xs text-gray-500">Return Type: {item?.returnType}</p>
                </div>
            </div>
            <p className="text-sm font-medium text-gray-900">
                ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </div>
    )
}

export default ProductRow