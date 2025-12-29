"use client";

import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { updateCarts, updateFavorites } from "@/lib/firestore/user/write";
import { useProduct } from "@/lib/firestore/products/read";
import { CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { FaTrashAlt } from "react-icons/fa";
import ReturnTypeSelector from "@/app/components/ReturnTypeSelector";
import ProductVariantModal from "@/app/(pages)/product/components/ProductVariantModal";
import { getBrand } from "@/lib/firestore/brands/read_server";
import { getCategory } from "@/lib/firestore/categories/read_server";

const WishlistPage = () => {
    const { user } = useAuth();
    const { data, isLoading } = useUser({ uid: user?.uid });

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-50">
                <CircularProgress size={50} thickness={4} color="primary" />
                <p className="mt-4 text-gray-600 font-medium">Fetching Wishlist...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-20">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <h1 className="text-3xl font-semibold text-center text-gray-800 py-8 border-b border-gray-200">My Wishlist</h1>

                {data?.favorites?.length > 0 ? (
                    <>
                        {/* Header */}
                        <div className="hidden sm:grid grid-cols-12 font-semibold text-gray-600 py-4 px-6 bg-gray-50 border-b border-gray-200">
                            <div className="col-span-6">Product</div>
                            <div className="col-span-3 text-center">Price</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>

                        {/* Wishlist Items */}
                        {data.favorites.map((favoriteItem, index) => (
                            <WishlistItem
                                key={index}
                                favoriteItem={favoriteItem}
                                user={user}
                                userData={data}
                            />
                        ))}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <img
                            src="/svgs/Empty-pana.svg"
                            alt="Empty"
                            className="h-60 mb-6"
                        />
                        <h2 className="text-xl font-semibold text-gray-700">
                            Your wishlist is empty
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Explore and add some products you love!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const WishlistItem = ({ favoriteItem, user, userData }) => {
    const productId = typeof favoriteItem === "string" ? favoriteItem : favoriteItem?.id;
    const { data: product } = useProduct({ productId });
    const [isLoading, setIsLoading] = useState(false);
    const [showSelector, setShowSelector] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedQuality, setSelectedQuality] = useState(null);

    const isActuallyVariable = product?.isVariable && product?.variations?.length > 0;

    // Determine selected color/quality from favorite item
    useEffect(() => {
        if (typeof favoriteItem === "object") {
            setSelectedColor(favoriteItem.selectedColor || null);
            setSelectedQuality(favoriteItem.selectedQuality || null);
        }
    }, [favoriteItem]);

    // If old string favorite for variable product, set to lowest variation defaults
    useEffect(() => {
        if (product && isActuallyVariable && selectedColor === null && selectedQuality === null) {
            const lowestVariation = product.variations.reduce((lowest, current) => {
                const lp = parseFloat(current.salePrice || current.price);
                const cp = parseFloat(lowest.salePrice || lowest.price);
                return lp < cp ? current : lowest;
            }, product.variations[0]);
            setSelectedColor(lowestVariation?.attributes?.Color || null);
            setSelectedQuality(lowestVariation?.attributes?.Quality || null);
        }
    }, [product, isActuallyVariable, selectedColor, selectedQuality]);

    const selectedVariation = useMemo(() => {
        if (!isActuallyVariable) {
            return {
                price: product?.price,
                salePrice: product?.salePrice,
            };
        }
        if (selectedColor && selectedQuality) {
            return product.variations.find(v =>
                v.attributes.Color === selectedColor && v.attributes.Quality === selectedQuality
            );
        }
        // Fallback to lowest if not selected
        return product.variations.reduce((lowest, current) => {
            const lp = parseFloat(current.salePrice || current.price);
            const cp = parseFloat(lowest.salePrice || lowest.price);
            return lp < cp ? current : lowest;
        }, product.variations[0]);
    }, [product, isActuallyVariable, selectedColor, selectedQuality]);

    const currentPrice = parseFloat(selectedVariation?.salePrice || selectedVariation?.price) || 0;
    const originalPrice = selectedVariation?.salePrice ? parseFloat(selectedVariation.price) : null;
    const discountPercentage = originalPrice && currentPrice < originalPrice
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;

    const alreadyInCart = userData?.carts?.some(item =>
        item.id === productId &&
        (!isActuallyVariable || (item.selectedColor === selectedColor && item.selectedQuality === selectedQuality))
    );

    const handleAddToCart = () => {
        if (alreadyInCart) {
            toast("Product already in cart", { icon: "ℹ️" });
            return;
        }

        if (isActuallyVariable) {
            setShowVariantModal(true); // Open modal for variable products
        } else {
            setShowSelector(true); // Directly show return selector for non-variable
        }
    };

    const handleModalConfirm = async (choice, finalColor, finalQuality) => {
        setIsLoading(true);
        try {
            const updatedCart = [
                ...(userData?.carts || []),
                {
                    id: productId,
                    quantity: 1,
                    ...(isActuallyVariable && { selectedColor: finalColor }),
                    ...(isActuallyVariable && { selectedQuality: finalQuality }),
                    returnType: choice.id,
                    returnFee: choice.fee,
                },
            ];
            await updateCarts({ uid: user?.uid, list: updatedCart });
            toast.success("Added to cart");

            // GTM add_to_cart event
            if (product) {
                let categoryName = product?.categoryName || "Mobile Spare Parts";
                let brandName = product?.brand || "Mobile Display";

                try {
                    if (product.categoryId) {
                        const cat = await getCategory({ id: product.categoryId });
                        if (cat?.name) categoryName = cat.name;
                    }
                    if (product.brandId) {
                        const brand = await getBrand({ id: product.brandId });
                        if (brand?.name) brandName = brand.name;
                    }
                } catch (error) {
                    console.error("GTM add_to_cart data fetch error", error);
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
            }
        } catch (error) {
            toast.error(error?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
            setShowSelector(false);
            setShowVariantModal(false);
        }
    };

    const handleRemoveFromWishlist = async () => {
        if (!confirm("Remove this item from wishlist?")) return;
        setIsLoading(true);
        try {
            const updatedFavorites = userData?.favorites?.filter(item => {
                if (typeof item === "string") {
                    return item !== productId;
                } else {
                    return !(item.id === productId &&
                        (!isActuallyVariable || (item.selectedColor === selectedColor && item.selectedQuality === selectedQuality)));
                }
            });
            await updateFavorites({ uid: user?.uid, list: updatedFavorites });
            toast.success("Removed from wishlist");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    const formatPrice = (amount) => `₹${amount?.toLocaleString("en-IN")}`;

    return (
        <>
            <div className="grid sm:grid-cols-12 grid-cols-1 gap-4 items-center py-6 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors px-6">
                {/* Product info */}
                <div className="sm:col-span-6 flex items-start sm:items-center gap-4">
                    <img
                        src={product?.featureImageURL || "/cart-item.png"}
                        alt={product?.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shadow-sm"
                    />
                    <div>
                        <h3 className="text-base font-medium text-gray-800">
                            {product?.title || "Product Title"}
                        </h3>
                        {isActuallyVariable && selectedColor && (
                            <p className="text-sm text-gray-500">Color: {selectedColor}</p>
                        )}
                        {isActuallyVariable && selectedQuality && (
                            <p className="text-sm text-gray-500">Quality: {selectedQuality}</p>
                        )}
                    </div>
                </div>

                {/* Price */}
                <div className="sm:col-span-3 text-left sm:text-center">
                    <span className="text-lg font-medium text-gray-700">
                        {formatPrice(currentPrice)}
                    </span>
                    {originalPrice > currentPrice && (
                        <>
                            <span className="text-sm text-gray-500 line-through ml-2">
                                {formatPrice(originalPrice)}
                            </span>
                            <span className="text-xs text-red-500 font-bold ml-2">
                                {discountPercentage}% OFF
                            </span>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="sm:col-span-3 flex flex-wrap gap-3 justify-start sm:justify-end items-center">
                    <Button
                        size="sm"
                        isDisabled={isLoading || alreadyInCart}
                        onClick={handleAddToCart}
                        className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium ${alreadyInCart ? "bg-gray-300 text-gray-700" : "bg-black text-white hover:bg-gray-800"}`}
                    >
                        {alreadyInCart ? "Already in Cart" : "Add to Cart"}
                    </Button>
                    <button
                        disabled={isLoading}
                        onClick={handleRemoveFromWishlist}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        aria-label="Remove from wishlist"
                    >
                        <FaTrashAlt size={18} />
                    </button>
                </div>
            </div>

            {/* Return Selector for non-variable */}
            <ReturnTypeSelector
                open={showSelector}
                onClose={() => setShowSelector(false)}
                onConfirm={(choice) => handleModalConfirm(choice, null, null)}
                productPrice={currentPrice}
            />

            {/* Variant Modal for variable products */}
            {showVariantModal && product && (
                <ProductVariantModal
                    product={product}
                    isOpen={showVariantModal}
                    onClose={() => setShowVariantModal(false)}
                    onAddToCart={(finalColor, finalQuality, choice) => handleModalConfirm(choice, finalColor, finalQuality)}
                />
            )}
        </>
    );
};

export default WishlistPage;    