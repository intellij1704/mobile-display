"use client";

import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { updateCarts, updateFavorites } from "@/lib/firestore/user/write";
import { useProduct } from "@/lib/firestore/products/read";
import { CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import { useState } from "react";
import { Button } from "@nextui-org/react";
import { FaTrashAlt } from "react-icons/fa";
import ReturnTypeSelector from "@/app/components/ReturnTypeSelector";

const WishlistPage = () => {
    const { user } = useAuth();
    const { data, isLoading } = useUser({ uid: user?.uid });

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-100">
                <CircularProgress size={50} thickness={4} color="primary" />
                <p className="mt-4 text-gray-600 font-medium">Fetching Wishlist...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-20">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-10">My Wishlist</h1>

                {data?.favorites?.length > 0 ? (
                    <>
                        {/* Header: Only shown when there are items in the wishlist */}
                        <div className="hidden sm:grid grid-cols-12 font-semibold text-gray-600 pb-2">
                            <div className="col-span-4">Product Name</div>
                            <div className="col-span-2 text-center">Unit Price</div>
                            <div className="col-span-2 text-center">Stock Status</div>
                            <div className="col-span-4 text-center">Actions</div>
                        </div>

                        {/* Wishlist Items */}
                        {data.favorites.map((productId) => (
                            <WishlistItem
                                key={productId}
                                productId={productId}
                                user={user}
                                data={data}
                            />
                        ))}
                    </>
                ) : (
                    <div className="text-center col-span-12 mt-20">
                        <img
                            src="/svgs/Empty-pana.svg"
                            alt="Empty"
                            className="h-60 mx-auto mb-6"
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

const WishlistItem = ({ productId, user, data }) => {
    const { data: product } = useProduct({ productId });
    const [isLoading, setIsLoading] = useState(false);
    const [showSelector, setShowSelector] = useState(false);
    const isOutOfStock = product?.stock === 0;
    const alreadyInCart = data?.carts?.some((item) => item.id === productId);
    const productPrice = product?.salePrice || product?.price || 0;

    const handleAddToCart = async () => {
        if (alreadyInCart) {
            toast("Product already in cart", { icon: "ℹ️" });
            return;
        }
        if (isOutOfStock) return;

        setShowSelector(true);
    };

    const handleConfirmReturn = async (choice) => {
        // choice = { id, title, fee, termsHtml }
        setIsLoading(true);
        try {
            const updatedCart = [
                ...(data?.carts || []),
                {
                    id: productId,
                    quantity: 1,
                    returnType: choice.id, // 'easy-return' | 'easy-replacement' | 'self-shipping'
                    returnFee: choice.fee,
                },
            ];
            await updateCarts({ uid: user?.uid, list: updatedCart });
            toast.success("Added to cart");
        } catch (error) {
            toast.error(error?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
            setShowSelector(false);
        }
    };

    const handleRemoveFromWishlist = async () => {
        if (!confirm("Remove this item from wishlist?")) return;
        setIsLoading(true);
        try {
            const updatedFavorites = data?.favorites?.filter((id) => id !== productId);
            await updateFavorites({ uid: user?.uid, list: updatedFavorites });
            toast.success("Removed from wishlist");
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="grid sm:grid-cols-12 grid-cols-1 gap-4 items-center py-6 border-t">
            {/* Product info */}
            <div className="sm:col-span-4 flex items-start sm:items-center gap-4">
                <img
                    src={product?.featureImageURL || "/cart-item.png"}
                    alt={product?.title}
                    className="w-16 h-16 rounded object-cover"
                />
                <div>
                    <h3 className="text-base font-medium text-gray-800">
                        {product?.title || "Product Title"}
                    </h3>
                    <p className="text-sm text-gray-500">Color: Black</p>
                    <p className="text-sm text-gray-500">Display Size: 6.40 inches</p>
                </div>
            </div>

            {/* Price */}
            <div className="sm:col-span-2 text-left sm:text-center text-lg font-medium text-gray-700">
                ₹{productPrice}
            </div>

            {/* Stock status */}
            <div className="sm:col-span-2 text-left sm:text-center">
                <span className={`font-medium ${isOutOfStock ? "text-red-500" : "text-green-600"}`}>
                    {isOutOfStock ? "Out of Stock" : "In Stock"}
                </span>
            </div>

            {/* Buttons */}
            <div className="sm:col-span-4 flex flex-wrap gap-2 justify-end">
                <Button
                    size="sm"
                    isDisabled={isOutOfStock || isLoading || alreadyInCart}
                    onClick={handleAddToCart}
                    className={`px-4 rounded-lg ${alreadyInCart ? "bg-gray-500 text-white" : "bg-black text-white"}`}
                >
                    {alreadyInCart ? "Already in Cart" : "Add to Cart"}
                </Button>
                <button
                    disabled={isLoading}
                    onClick={handleRemoveFromWishlist}
                    className="text-gray-600 hover:text-red-600 text-lg"
                >
                    <FaTrashAlt />
                </button>
            </div>

            <ReturnTypeSelector
                open={showSelector}
                onClose={() => setShowSelector(false)}
                onConfirm={handleConfirmReturn}
                productPrice={productPrice}
            />
        </div>
    );
};

export default WishlistPage;