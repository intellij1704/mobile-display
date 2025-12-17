"use client";

import { useProducts } from "@/lib/firestore/products/read";
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { collection, getDocs, query, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Helper functions for price calculations
const getMinEffectivePrice = (product) => {
    if (!product.isVariable) {
        return product.salePrice ?? product.price ?? 0;
    }
    return Math.min(...(product.variations || []).map(v => v.salePrice ?? v.price ?? Infinity)) || 0;
};

const getMaxEffectivePrice = (product) => {
    if (!product.isVariable) {
        return product.salePrice ?? product.price ?? 0;
    }
    return Math.max(...(product.variations || []).map(v => v.salePrice ?? v.price ?? 0)) || 0;
};

const getPriceDisplay = (product) => {
    if (!product.isVariable) {
        const price = product.price ?? 0;
        const sale = product.salePrice ?? 0;
        if (sale && sale < price) {
            return (
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 line-through">
                        ₹{price.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                        ₹{sale.toLocaleString()}
                    </span>
                </div>
            );
        }
        return (
            <span className="text-sm font-medium text-gray-900">
                ₹{price.toLocaleString()}
            </span>
        );
    } else {
        const min = getMinEffectivePrice(product);
        const max = getMaxEffectivePrice(product);
        if (min === max) {
            return (
                <span className="text-sm font-medium text-gray-900">
                    ₹{min.toLocaleString()}
                </span>
            );
        } else {
            return (
                <span className="text-sm font-medium text-gray-900">
                    ₹{min.toLocaleString()} - ₹{max.toLocaleString()}
                </span>
            );
        }
    }
};

export default function ProductListView() {
    const router = useRouter();
    const [pageLimit, setPageLimit] = useState(10);
    const [lastSnapDocList, setLastSnapDocList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [isLoadingAll, setIsLoadingAll] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [selectedProductIds, setSelectedProductIds] = useState([]);

    // Fetch all products for big deal management
    const fetchAllProducts = useCallback(async () => {
        setIsLoadingAll(true);
        try {
            const ref = collection(db, "products");
            const q = query(ref);
            const snapshot = await getDocs(q);
            const products = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                variantImages: doc.data().variantImages || {},
                qualities: doc.data().qualities || [],
                colors: doc.data().colors || [],
                variations: doc.data().variations || [],
                bigDeal: doc.data().bigDeal || false,
            }));
            setAllProducts(products);
            setSelectedProductIds(products.filter(p => p.bigDeal).map(p => p.id));
        } catch (error) {
            console.error("Error fetching all products:", error);
            toast.error("Failed to load products");
        } finally {
            setIsLoadingAll(false);
        }
    }, []);

    // Load initial data
    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    // Fetch paginated products for display
    const {
        data: paginatedProducts = [],
        isLoading,
        lastSnapDoc,
    } = useProducts({
        pageLimit,
        lastSnapDoc: lastSnapDocList.length === 0 ? null : lastSnapDocList[lastSnapDocList.length - 1],
        status: "published",
    });

    // Memoized filtered and sorted products
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...paginatedProducts];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            result = result.filter((product) => {
                const fieldsToSearch = [
                    product.title?.toLowerCase(),
                    product.shortDescription?.toLowerCase(),
                    product.brand?.toLowerCase(),
                    product.series?.toLowerCase(),
                    ...(product.colors || []).map((color) => color.toLowerCase()),
                    ...(product.qualities || []).map((quality) => quality.toLowerCase()),
                    ...(product.variations || []).flatMap(v => [v.color?.toLowerCase(), v.quality?.toLowerCase()]).filter(Boolean),
                ];
                return fieldsToSearch.some(field => field?.includes(query));
            });
        }

        // Apply sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'price':
                        aValue = getMinEffectivePrice(a);
                        bValue = getMinEffectivePrice(b);
                        break;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [paginatedProducts, searchQuery, sortConfig]);

    // Sorting handler
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction:
                prev.key === key && prev.direction === 'asc'
                    ? 'desc'
                    : 'asc'
        }));
    };

    // Pagination handlers
    const handleNextPage = useCallback(() => {
        if (lastSnapDoc) {
            setLastSnapDocList(prev => [...prev, lastSnapDoc]);
        }
    }, [lastSnapDoc]);

    const handlePrevPage = useCallback(() => {
        setLastSnapDocList(prev => prev.slice(0, -1));
    }, []);

    // Toggle product selection
    const handleToggleSelect = (id) => {
        setSelectedProductIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    // Save big deal products
    const handleSaveBigDeal = async () => {
        if (selectedProductIds.length === 0 && allProducts.every(p => !p.bigDeal)) {
            toast.error("No changes to save!");
            return;
        }

        try {
            const batch = writeBatch(db);
            allProducts.forEach((product) => {
                const productRef = doc(db, "products", product.id);
                const bigDeal = selectedProductIds.includes(product.id);
                batch.update(productRef, { bigDeal });
            });

            await batch.commit();
            toast.success("Big deal products updated successfully!");
            await fetchAllProducts();
        } catch (error) {
            console.error("Error updating big deal products:", error);
            toast.error("Failed to update big deal products!");
        }
    };

    // Calculate display products
    const displayProducts = filteredAndSortedProducts;

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Big Deal Products</h1>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => handleSort('price')} className="flex items-center gap-1">
                                        Price
                                        {sortConfig.key === 'price' && (
                                            sortConfig.direction === 'asc' ?
                                                <ArrowUp className="h-3 w-3" /> :
                                                <ArrowDown className="h-3 w-3" />
                                        )}
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : displayProducts.length > 0 ? (
                                displayProducts.map((item, index) => (
                                    <ProductRow
                                        key={item.id}
                                        index={index + (searchQuery ? 0 : lastSnapDocList.length * pageLimit)}
                                        item={item}
                                        router={router}
                                        checked={selectedProductIds.includes(item.id)}
                                        onToggle={handleToggleSelect}
                                        getPriceDisplay={getPriceDisplay}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery ? "No matching products found" : "No products available"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!searchQuery && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Items per page:</span>
                        <select
                            value={pageLimit}
                            onChange={(e) => setPageLimit(Number(e.target.value))}
                            className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {[5, 10, 20, 50].map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="bg-black px-5 py-2 text-white rounded"
                            onClick={handleSaveBigDeal}
                            disabled={isLoadingAll}
                        >
                            Save Big Deal Products
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={isLoading || lastSnapDocList.length === 0}
                            onClick={handlePrevPage}
                            className={`flex items-center gap-1 px-3 py-1 border rounded-md ${isLoading || lastSnapDocList.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>
                        <button
                            disabled={isLoading || paginatedProducts.length < pageLimit}
                            onClick={handleNextPage}
                            className={`flex items-center gap-1 px-3 py-1 border rounded-md ${isLoading || paginatedProducts.length < pageLimit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProductRow({ item, index, router, checked, onToggle, getPriceDisplay }) {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <input
                    type="checkbox"
                    className="h-5 w-5 cursor-pointer"
                    checked={checked}
                    onChange={() => onToggle(item.id)}
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={item.featureImageURL || "/placeholder-product.jpg"}
                            alt={item.title}
                            loading="lazy"
                        />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.title}
                        </div>
                        <div className="text-xs text-gray-500">{item.brand}</div>
                        {item.isFeatured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                Featured
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {getPriceDisplay(item)}
            </td>
        </tr>
    );
}