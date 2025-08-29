"use client";

import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { updateCarts } from "@/lib/firestore/user/write";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import toast from "react-hot-toast";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from "next/navigation";

function AddToCartButton({ productId, type, selectedColor, selectedQuality, isVariable, hasQualityOptions }) {
    const { user } = useAuth();
    const { data } = useUser({ uid: user?.uid });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Check if the product with the specific color and quality is already in the cart
    const isAdded = data?.carts?.find(
        (item) =>
            item?.id === productId &&
            (!isVariable || item?.selectedColor === selectedColor) &&
            (!hasQualityOptions || item?.selectedQuality === selectedQuality)
    );

    const handleClick = async () => {
        setIsLoading(true);
        try {
            if (!user?.uid) {
                router.push("/login");
                throw new Error("Please log in first!");
            }

            // Validate selectedColor for variable products
            if (isVariable && !selectedColor && !isAdded) {
                throw new Error("Please select a color!");
            }

            // Validate selectedQuality for products with quality options
            if (hasQualityOptions && !selectedQuality && !isAdded) {
                throw new Error("Please select a quality!");
            }

            if (isAdded) {
                // Remove item from cart if already added
                const newList = data?.carts?.filter(
                    (item) =>
                        !(
                            item?.id === productId &&
                            (!isVariable || item?.selectedColor === selectedColor) &&
                            (!hasQualityOptions || item?.selectedQuality === selectedQuality)
                        )
                );
                await updateCarts({ list: newList, uid: user?.uid });
                toast.success("Item removed from cart");
            } else {
                // Add item to cart (with selectedColor and selectedQuality if applicable)
                await updateCarts({
                    list: [
                        ...(data?.carts ?? []),
                        {
                            id: productId,
                            quantity: 1,
                            ...(isVariable && { selectedColor }),
                            ...(hasQualityOptions && { selectedQuality }),
                        },
                    ],
                    uid: user?.uid,
                });
                toast.success("Item added to cart");
            }
        } catch (error) {
            toast.error(error?.message);
        }
        setIsLoading(false);
    };

    if (type === "large") {
        return (
            <Button
                size="sm"
                variant="flat"
                onClick={handleClick}
                isLoading={isLoading}
                isDisabled={isLoading}
                className="bg-black w-1/2 hover:bg-gray-600 text-white px-5 md:py-5 py-6  rounded-md text-sm md:text-base transition-all duration-200"
            >
                {!isAdded && <AddShoppingCartIcon fontSize="small" />}
                {isAdded && <ShoppingCartIcon fontSize="small" />}
                {!isAdded && "Add To Cart"}
                {isAdded && "Click To Remove"}
            </Button>
        );
    }

    return (
        <Button
            className={`h-8 w-8 ${isAdded ? "text-gray-900" : "text-gray-600"} bg-gray-100 border border-gray-100 p-4 rounded shadow-md hover:bg-red-500 hover:text-white transition-all duration-200`}
            isIconOnly
            size="sm"
            variant="light"
            onClick={handleClick}
            isLoading={isLoading}
            isDisabled={isLoading}
        >
            {!isAdded && <AddShoppingCartIcon fontSize="small" />}
            {isAdded && <ShoppingCartIcon fontSize="small" />}
        </Button>
    );
}

export default AddToCartButton;