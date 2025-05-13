"use client";

import { useAuth } from "@/context/AuthContext";
import { useProduct } from "@/lib/firestore/products/read";
import { useUser } from "@/lib/firestore/user/read";
import { updateCarts } from "@/lib/firestore/user/write";
import { CircularProgress } from "@mui/material";
import { Button } from "@nextui-org/react";
import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

const CartPage = () => {
  const { user } = useAuth();
  const { data, isLoading } = useUser({ uid: user?.uid });
  const [cartSubtotals, setCartSubtotals] = useState({});

  // Memoize the onSubtotalUpdate and onRemove callbacks to prevent unnecessary re-renders
  const onSubtotalUpdate = useCallback((itemId, subtotal, quantity) => {
    setCartSubtotals((prev) => ({
      ...prev,
      [itemId]: { subtotal, quantity },
    }));
  }, []);

  const onRemove = useCallback((itemId) => {
    setCartSubtotals((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100">
        <CircularProgress size={50} thickness={4} color="primary" />
        <p className="mt-4 text-gray-600 font-medium">Loading Cart...</p>
      </div>
    );
  }

  const calculateSummary = () => {
    if (!data?.carts || !Array.isArray(data.carts)) {
      return {
        productTotal: 0,
        totalItems: 0,
        discount: 0,
        deliveryFee: 0,
        total: 0,
      };
    }

    let productTotal = 0;
    let totalItems = 0;

    // Sum up the subtotals from cartSubtotals
    Object.values(cartSubtotals).forEach(({ subtotal, quantity }) => {
      productTotal += subtotal || 0;
      totalItems += quantity || 0;
    });

    const discount = 0; // Can be dynamic
    const deliveryFee = 100; // Can be dynamic
    const total = productTotal - discount + deliveryFee;

    return {
      productTotal,
      totalItems,
      discount,
      deliveryFee,
      total,
    };
  };

  const summary = calculateSummary();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 xl:px-20">
      <div className="mx-auto max-w-7xl">
        {!data?.carts || data.carts.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-sm">
            <img
              className="mb-8 h-60 w-auto"
              src="/svgs/Empty-pana.svg"
              alt="Empty cart"
            />
            <h2 className="mb-2 text-2xl font-semibold text-gray-700">
              Your Cart is Empty
            </h2>
            <p className="mb-6 max-w-md text-gray-500">
              Looks like you haven't added any products yet. Start shopping now!
            </p>
            <Link href="/">
              <Button className="bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700">
                Continue Shopping
              </Button>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              Need help?{" "}
              <Link href="#" className="text-indigo-500 hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        ) : (
          <>
            <h1 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
              Your Cart
            </h1>
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Cart Items */}
              <div className="lg:w-2/3">
                <div className="hidden rounded-t-lg bg-white p-4 shadow-sm md:block">
                  <div className="grid grid-cols-12 gap-4 font-medium text-gray-600">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-center">Subtotal</div>
                    <div className="col-span-1"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  {data.carts.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      user={user}
                      data={data}
                      onSubtotalUpdate={onSubtotalUpdate}
                      onRemove={onRemove}
                    />
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:w-1/3">
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
                  <div className="space-y-3 border-b border-gray-200 pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items ({summary.totalItems})</span>
                      <span className="font-medium">
                        ₹{summary.productTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium">
                        -₹{summary.discount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">
                        ₹{summary.deliveryFee.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="text-lg font-bold">
                      ₹{summary.total.toFixed(2)}
                    </span>
                  </div>
                  <Link href="/checkout?type=cart" className="mt-6 block">
                    <Button className="w-full bg-red-600 py-3 text-white hover:bg-red-700">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartItem = ({ item, user, data, onSubtotalUpdate, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: product } = useProduct({ productId: item?.id });

  // Memoize price and quantity to prevent unnecessary recalculations
  const price = useMemo(
    () => product?.salePrice || product?.price || item?.salePrice || item?.price || 0,
    [product, item]
  );
  const quantity = useMemo(() => item.quantity || 1, [item.quantity]);
  const subtotal = useMemo(() => price * quantity, [price, quantity]);

  const isOutOfStock = product?.stock === 0;

  // Update parent with the subtotal and quantity
  useEffect(() => {
    onSubtotalUpdate(item.id, subtotal, quantity);
  }, [item.id, subtotal, quantity, onSubtotalUpdate]); // Dependencies are stable now

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this item?")) return;
    setIsRemoving(true);
    try {
      const newList = data?.carts?.filter((d) => d?.id !== item?.id);
      await updateCarts({ list: newList, uid: user?.uid });
      toast.success("Item removed from cart");
      onRemove(item.id); // Notify parent to remove this item's subtotal
    } catch (error) {
      toast.error(error?.message || "Failed to remove item");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUpdate = async (newQuantity) => {
    if (newQuantity < 1 || isOutOfStock) return;
    setIsUpdating(true);
    try {
      const newList = data?.carts?.map((d) =>
        d?.id === item?.id ? { ...d, quantity: parseInt(newQuantity) } : d
      );
      await updateCarts({ list: newList, uid: user?.uid });
      toast.success("Cart updated");
    } catch (error) {
      toast.error(error?.message || "Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`rounded-lg bg-white p-4 shadow-sm ${
        isOutOfStock ? "opacity-60" : ""
      }`}
    >
      {/* Mobile View */}
      <div className="flex flex-col gap-4 md:hidden">
        {isOutOfStock && (
          <span className="rounded bg-red-100 px-2 py-1 text-sm text-red-600">
            Out of Stock
          </span>
        )}
        <div className="flex gap-4">
          <img
            src={product?.featureImageURL || "/cart-item.png"}
            alt={product?.title || "Product"}
            className="h-24 w-24 rounded object-cover"
          />
          <div>
            <h3 className="text-base font-medium text-gray-800">
              {product?.title || "Product"}
            </h3>
            {item?.selectedColor && (
              <p className="text-sm text-gray-500">
                Color: {item.selectedColor}
              </p>
            )}
            {item?.selectedQuality && (
              <p className="text-sm text-gray-500">
                Quality: {item.selectedQuality}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">₹{price.toFixed(2)}</span>
          {isOutOfStock ? (
            <span className="text-sm text-red-600">Unavailable</span>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleUpdate(quantity - 1)}
                disabled={isUpdating || quantity <= 1}
                className="rounded-l border bg-gray-100 p-1 hover:bg-gray-200 disabled:opacity-50"
              >
                <Minus size={16} />
              </button>
              <span className="border-y px-3 py-1 text-sm">{quantity}</span>
              <button
                onClick={() => handleUpdate(quantity + 1)}
                disabled={isUpdating}
                className="rounded-r border bg-gray-100 p-1 hover:bg-gray-200 disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="self-end text-gray-400 hover:text-red-500"
        >
          {isRemoving ? (
            <CircularProgress size={16} />
          ) : (
            <img src="/icon/tursh.svg" alt="Remove" className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid grid-cols-12 gap-4">
        {isOutOfStock && (
          <span className="col-span-12 rounded bg-red-100 px-2 py-1 text-sm text-red-600">
            Out of Stock
          </span>
        )}
        <div className="col-span-5 flex gap-4">
          <img
            src={product?.featureImageURL || "/cart-item.png"}
            alt={product?.title || "Product"}
            className="h-20 w-20 rounded object-cover"
          />
          <div>
            <h3 className="text-base font-medium text-gray-800">
              {product?.title || "Product"}
            </h3>
            {item?.selectedColor && (
              <p className="text-sm text-gray-500">
                Color: {item.selectedColor}
              </p>
            )}
            {item?.selectedQuality && (
              <p className="text-sm text-gray-500">
                Quality: {item.selectedQuality}
              </p>
            )}
          </div>
        </div>
        <div className="col-span-2 text-center font-medium">
          ₹{price.toFixed(2)}
        </div>
        <div className="col-span-2 text-center">
          {isOutOfStock ? (
            <span className="text-sm text-red-600">Unavailable</span>
          ) : (
            <div className="inline-flex items-center gap-1">
              <button
                onClick={() => handleUpdate(quantity - 1)}
                disabled={isUpdating || quantity <= 1}
                className="rounded-l border bg-gray-100 p-1 hover:bg-gray-200 disabled:opacity-50"
              >
                <Minus size={16} />
              </button>
              <span className="border-y px-3 py-1 text-sm">{quantity}</span>
              <button
                onClick={() => handleUpdate(quantity + 1)}
                disabled={isUpdating}
                className="rounded-r border bg-gray-100 p-1 hover:bg-gray-200 disabled:opacity-50"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="col-span-2 text-center font-medium">
          ₹{subtotal.toFixed(2)}
        </div>
        <div className="col-span-1 text-right">
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-gray-400 hover:text-red-500"
          >
            {isRemoving ? (
              <CircularProgress size={16} />
            ) : (
              <img src="/icon/tursh.svg" alt="Remove" className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;