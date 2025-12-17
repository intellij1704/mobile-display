"use client";

import { useProducts } from "@/lib/firestore/products/read";
import { getAllProductsForAdmin } from "@/lib/firestore/products/read_server";
import { deleteProduct } from "@/lib/firestore/products/write";
import { Edit2, Trash2, Search, ChevronLeft, ChevronRight, Download, FileText, File, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CircularProgress } from "@mui/material";

export default function ProductListView() {
    const router = useRouter();
    const [pageLimit, setPageLimit] = useState(10);
    const [lastSnapDocList, setLastSnapDocList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [isLoadingAll, setIsLoadingAll] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [statusFilter, setStatusFilter] = useState("all");
    // Helper functions
    const getMinEffectivePrice = (product) => {
        if (!product.isVariable) {
            return product.salePrice || product.price || 0;
        }
        return Math.min(...(product.variations || []).map(v => v.salePrice || v.price || Infinity)) || 0;
    };

    const getMaxEffectivePrice = (product) => {
        if (!product.isVariable) {
            return product.salePrice || product.price || 0;
        }
        return Math.max(...(product.variations || []).map(v => v.salePrice || v.price || 0)) || 0;
    };

    const getTotalStock = (product) => {
        if (!product.isVariable) {
            return product.stock || 0;
        }
        return (product.variations || []).reduce((sum, v) => sum + (v.stock || 0), 0);
    };

    const getPriceDisplay = (product) => {
        if (!product.isVariable) {
            const price = product.price || 0;
            const sale = product.salePrice || 0;
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

    const getExportPrice = (product) => {
        if (!product.isVariable) {
            const price = product.price || 0;
            const sale = product.salePrice || 0;
            if (sale && sale < price) {
                return `₹${sale.toLocaleString()} (was ₹${price.toLocaleString()})`;
            }
            return `₹${price.toLocaleString()}`;
        } else {
            const min = getMinEffectivePrice(product);
            const max = getMaxEffectivePrice(product);
            if (min === max) {
                return `₹${min.toLocaleString()}`;
            } else {
                return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
            }
        }
    };

    // Internal fetch function that returns data
    const fetchAllProductsInternal = useCallback(async () => {
        setIsLoadingAll(true);
        try {
            // Use the new function to get all products, including drafts
            return await getAllProductsForAdmin();
        } catch (error) {
            console.error("Error fetching all products:", error);
            toast.error("Failed to load products");
            return [];
        } finally {
            setIsLoadingAll(false);
        }
    }, []);

    // Fetch all products for state (optional pre-load)
    const fetchAllProducts = useCallback(async () => {
        const products = await fetchAllProductsInternal();
        setAllProducts(products);
    }, [fetchAllProductsInternal]);

    // Fetch paginated products for display
    const {
        data: paginatedProducts = [],
        isLoading,
        lastSnapDoc,
    } = useProducts({
        pageLimit,
        lastSnapDoc: lastSnapDocList.length === 0 ? null : lastSnapDocList[lastSnapDocList.length - 1],
        status: statusFilter,
    });

    // Memoized filtered and sorted products
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...paginatedProducts];

        // Apply search filter
        if (searchQuery.trim()) {
            const queryLower = searchQuery.trim().toLowerCase();
            result = result.filter((product) => {
                const fieldsToSearch = [
                    product.title?.toLowerCase(),
                    product.shortDescription?.toLowerCase(),
                    product.brand?.toLowerCase(),
                    product.series?.toLowerCase(),
                    ...(product.attributes?.flatMap(att => att.values.map(v => v.toLowerCase())) || []),
                ];
                return fieldsToSearch.some(field => field?.includes(queryLower));
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
                    case 'orders':
                        aValue = a.orders || 0;
                        bValue = b.orders || 0;
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

    // Export to Excel function (all products)
    const exportToExcel = useCallback(async () => {
        setIsExporting(true);
        try {
            let products = allProducts;
            if (products.length === 0) {
                products = await fetchAllProductsInternal();
                setAllProducts(products);
            }

            const data = products.map((product, index) => ({
                "#": index + 1,
                "ID": product.id,
                "Title": product.title,
                "Short Description": product.shortDescription,
                "Brand ID": product.brandId,
                "Category ID": product.categoryId,
                "Series ID": product.seriesId,
                "Model ID": product.modelId,
                "Price": getExportPrice(product),
                "Stock": getTotalStock(product),
                "Orders": product.orders || 0,
                "Status": getTotalStock(product) - (product.orders || 0) > 0 ? "In Stock" : "Out of Stock",
                "Best Selling": product.bestSelling ? "Yes" : "No",
                "Big Deal": product.bigDeal ? "Yes" : "No",
                "Top Pick": product.topPick ? "Yes" : "No",
                "Live Sale": product.liveSale ? "Yes" : "No",
                "Is Variable": product.isVariable ? "Yes" : "No",
                "Attributes": product.attributes ? JSON.stringify(product.attributes) : "",
                "Variations": product.variations ? JSON.stringify(product.variations) : "",
                "SEO Slug": product.seoSlug,
                "SEO Description": product.seoDescription,
                "SEO Keywords": product.seoKeywords ? product.seoKeywords.join(", ") : "",
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
            XLSX.writeFile(workbook, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Exported all products to Excel");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Failed to export to Excel");
        } finally {
            setIsExporting(false);
        }
    }, [allProducts, fetchAllProductsInternal]);

    // Export to PDF function (all products)
    const exportToPDF = useCallback(async () => {
        setIsExporting(true);
        try {
            let products = allProducts;
            if (products.length === 0) {
                products = await fetchAllProductsInternal();
                setAllProducts(products);
            }

            const doc = new jsPDF({
                orientation: "landscape",
                unit: "mm"
            });

            doc.setFontSize(16);
            doc.text("Product List - All Products", 14, 10);

            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 16);

            const tableData = products.map((product, index) => [
                index + 1,
                product.id,
                product.title,
                product.shortDescription?.substring(0, 50) + (product.shortDescription?.length > 50 ? "..." : ""),
                product.brandId,
                getExportPrice(product),
                getTotalStock(product),
                product.orders || 0,
                getTotalStock(product) - (product.orders || 0) > 0 ? "In Stock" : "Out of Stock",
                product.bestSelling ? "Yes" : "No",
                product.isVariable ? "Yes" : "No",
                product.seoSlug
            ]);

            autoTable(doc, {
                head: [['#', 'ID', 'Title', 'Short Desc', 'Brand ID', 'Price', 'Stock', 'Orders', 'Status', 'Best Selling', 'Variable', 'SEO Slug']],
                body: tableData,
                startY: 20,
                styles: {
                    fontSize: 7,
                    cellPadding: 1.5,
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontSize: 8
                },
                columnStyles: {
                    0: { cellWidth: 8 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 20 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 10 },
                    7: { cellWidth: 10 },
                    8: { cellWidth: 15 },
                    9: { cellWidth: 12 },
                    10: { cellWidth: 12 },
                    11: { cellWidth: 25 }
                }
            });

            doc.save(`products_all_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Exported all products to PDF");
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            toast.error("Failed to export to PDF");
        } finally {
            setIsExporting(false);
        }
    }, [allProducts, fetchAllProductsInternal]);

    // Calculate display products
    const displayProducts = filteredAndSortedProducts;

    console.log(displayProducts)


    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>

                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

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

                    <div className="flex gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                disabled={isExporting || isLoadingAll}
                                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${isExporting || isLoadingAll ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    exportToExcel();
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                            >
                                                <File className="h-4 w-4" />
                                                Excel (All Data)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    exportToPDF();
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                            >
                                                <FileText className="h-4 w-4" />
                                                PDF (All Data)
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => router.push('/admin/products/form')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                        >
                            Add New Product
                        </button>
                    </div>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => handleSort('orders')} className="flex items-center gap-1">
                                        Total Orders
                                        {sortConfig.key === 'orders' && (
                                            sortConfig.direction === 'asc' ?
                                                <ArrowUp className="h-3 w-3" /> :
                                                <ArrowDown className="h-3 w-3" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center">
                                        <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-100">
                                            <CircularProgress size={50} thickness={4} color="primary" />
                                            <p className="mt-4 text-gray-600 font-medium">Please Wait...</p>
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
                                        getPriceDisplay={getPriceDisplay}
                                        getTotalStock={getTotalStock}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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

function ProductRow({ item, index, router, getPriceDisplay, getTotalStock }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Delete this product?")) return;
        setIsDeleting(true);
        try {
            await deleteProduct({ id: item.id });
            toast.success("Product deleted");
        } catch (error) {
            toast.error("Deletion failed");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {index + 1}
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
                        {/* <div className="text-xs text-gray-500">{item.brand || item.brandId}</div> */}
                        {item.bestSelling && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                Best Selling
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {item.status === 'draft' ? (
                    <span className="px-2 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">Draft</span>
                ) : (
                    <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Published</span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {getPriceDisplay(item)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                {item.orders?.toLocaleString() || 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => router.push(`/admin/products/form?id=${item.id}`)}
                        disabled={isDeleting}
                        className="p-1 text-blue-600 hover:text-blue-900 rounded hover:bg-blue-50"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1 text-red-600 hover:text-red-900 rounded hover:bg-red-50"
                    >
                        {isDeleting ? (
                            <span className="inline-block h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </td>
        </tr>
    );
}