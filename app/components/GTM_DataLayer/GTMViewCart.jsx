"use client";

import { useEffect, useRef } from "react";
import { getBrand } from "@/lib/firestore/brands/read_server";
import { getCategory } from "@/lib/firestore/categories/read_server";

export default function GTMViewCart({ cartItems, cartTotal }) {
    const pushedDataRef = useRef(null);

    useEffect(() => {
        const handleGTM = async () => {
            if (!cartItems || cartItems.length === 0) return;

            const processedItems = await Promise.all(
                cartItems.map(async (item) => {
                    let categoryName = "Mobile Spare Parts";
                    let brandName = "Mobile Display";

                    try {
                        if (item.categoryId) {
                            const cat = await getCategory({ id: item.categoryId });
                            if (cat?.name) categoryName = cat.name;
                        }
                        if (item.brandId) {
                            const brand = await getBrand({ id: item.brandId });
                            if (brand?.name) brandName = brand.name;
                        }
                    } catch (error) {
                        console.error("GTM Data Fetch Error for cart item:", error);
                    }

                    return {
                        item_id: item.id,
                        item_name: item.title,
                        sku: item.sku || item.id,
                        price: item.price,
                        quantity: item.quantity,
                        item_category: categoryName,
                        item_brand: brandName,
                        product_type: item.isVariable ? "variable" : "simple",
                        stockstatus: "instock",
                    };
                })
            );

            const ecommerceData = {
                currency: "INR",
                value: cartTotal,
                items: processedItems,
            };

            const currentDataString = JSON.stringify(ecommerceData);
            if (pushedDataRef.current === currentDataString) {
                return;
            }

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "view_cart",
                ecommerce: ecommerceData,
            });
            pushedDataRef.current = currentDataString;
        };

        handleGTM();
    }, [cartItems, cartTotal]);

    return null;
}
