import React from 'react'

function ProductRow({ item, estimatedDelivery, getCategoryName }) {
    const qty = item?.quantity || 0
    const price = item?.product?.salePrice || 0
    const total = qty * price

    return (
        <div className="flex items-start justify-between">
            <div className="flex items-start">
                <div className="mr-3 rounded-lg bg-gray-100 overflow-hidden md:w-40 w-32 h-auto flex items-center justify-center">
                    <img
                        src={item?.product?.featureImageURL || "/product-img.png"}
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