"use client";

import { useProducts } from "@/lib/firestore/products/read";
import { getAllProductsForAdmin } from "@/lib/firestore/products/read_server";
import { deleteProduct } from "@/lib/firestore/products/write";
import { Edit2, Trash2, Search, ChevronLeft, ChevronRight, Download, FileText, File, ArrowUp, ArrowDown, RefreshCcw, Loader2, X } from "lucide-react";
import { useBrands } from "@/lib/firestore/brands/read";
import { useCategories } from "@/lib/firestore/categories/read";
import { useModels } from "@/lib/firestore/models/read";
import { useSeries } from "@/lib/firestore/series/read";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ProductListView() {
    const router = useRouter();
    const [pageLimit, setPageLimit] = useState(10);
    const [lastSnapDocList, setLastSnapDocList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    
    // Client-side Search State
    const [allProducts, setAllProducts] = useState([]);
    const [isLoadingAll, setIsLoadingAll] = useState(false);
    const [clientPage, setClientPage] = useState(1);

    const [isExporting, setIsExporting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [statusFilter, setStatusFilter] = useState("all");

    // Reference Data for Export Names
    const { data: brands } = useBrands();
    const { categoriesMap } = useCategories();
    const { data: models } = useModels();
    const { data: seriesList } = useSeries();

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setClientPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch all products for search
    const fetchAllProductsInternal = useCallback(async () => {
        setIsLoadingAll(true);
        try {
            const products = await getAllProductsForAdmin();
            setAllProducts(products);
            return products;
        } catch (error) {
            console.error("Error fetching all products:", error);
            toast.error("Failed to load products for search");
            return [];
        } finally {
            setIsLoadingAll(false);
        }
    }, []);

    // Trigger fetch when searching if cache is empty
    useEffect(() => {
        if (debouncedSearchQuery.trim() && allProducts.length === 0 && !isLoadingAll) {
            fetchAllProductsInternal();
        }
    }, [debouncedSearchQuery, allProducts.length, isLoadingAll, fetchAllProductsInternal]);

    // Server-side Paginated Data (Default View)
    const {
        data: serverProducts = [],
        isLoading: isServerLoading,
        lastSnapDoc,
    } = useProducts({
        pageLimit,
        lastSnapDoc: lastSnapDocList.length === 0 ? null : lastSnapDocList[lastSnapDocList.length - 1],
        status: statusFilter,
    });

    // Client-side Filtered Data (Search Mode)
    const filteredSearchProducts = useMemo(() => {
        if (!debouncedSearchQuery.trim()) return [];

        let result = [...allProducts];

        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter);
        }

        const searchTerms = debouncedSearchQuery.toLowerCase().trim().split(/\s+/);
        result = result.filter((product) => {
            const searchableText = [
                product.title,
                product.shortDescription,
                product.brand,
                product.series,
                product.sku,
                product.id,
                product.price,
                product.salePrice,
                ...(product.attributes?.flatMap(att => att.values) || []),
            ].map(field => field?.toString().toLowerCase() || "").join(" ");

            return searchTerms.every(term => searchableText.includes(term));
        });

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
                    default: return 0;
                }
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [allProducts, debouncedSearchQuery, statusFilter, sortConfig]);

    const isSearchMode = !!debouncedSearchQuery.trim();
    
    const displayProducts = useMemo(() => {
        if (isSearchMode) {
            const startIndex = (clientPage - 1) * pageLimit;
            return filteredSearchProducts.slice(startIndex, startIndex + pageLimit);
        } else {
            return serverProducts;
        }
    }, [isSearchMode, filteredSearchProducts, serverProducts, clientPage, pageLimit]);

    const isLoading = isSearchMode ? isLoadingAll : isServerLoading;

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
    const handleNextPage = () => {
        if (isSearchMode) {
            if (clientPage * pageLimit < filteredSearchProducts.length) {
                setClientPage(prev => prev + 1);
            }
        } else {
            if (lastSnapDoc) {
                setLastSnapDocList(prev => [...prev, lastSnapDoc]);
            }
        }
    };

    const handlePrevPage = () => {
        if (isSearchMode) {
            if (clientPage > 1) {
                setClientPage(prev => prev - 1);
            }
        } else {
            setLastSnapDocList(prev => prev.slice(0, -1));
        }
    };

    const handleRefresh = () => {
        if (isSearchMode) {
            fetchAllProductsInternal();
        } else {
            setLastSnapDocList([]);
        }
    };

    const handleDeleteProduct = useCallback(async (id) => {
        if (!confirm("Delete this product?")) return;
        try {
            await deleteProduct({ id });
            toast.success("Product deleted");
            setAllProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Deletion failed");
        }
    }, []);

    // Export to Excel function (all products)
    const exportToExcel = useCallback(async () => {
        setIsExporting(true);
        try {
            let products = allProducts;
            if (products.length === 0) {
                products = await fetchAllProductsInternal();
            }
            if (statusFilter !== 'all') {
                products = products.filter(p => p.status === statusFilter);
            }

            const data = products.map((product, index) => ({
                "#": index + 1,
                "ID": product.id,
                "Title": product.title,
                "Short Description": product.shortDescription,
                "Brand": brands?.find(b => b.id === product.brandId)?.name || product.brand || product.brandId,
                "Category": categoriesMap?.get(product.categoryId)?.name || product.category || product.categoryId,
                "Series": seriesList?.find(s => s.id === product.seriesId)?.seriesName || product.series || product.seriesId,
                "Model": models?.find(m => m.id === product.modelId)?.name || product.model || product.modelId,
                "Price": getExportPrice(product),
                "Orders": product.orders || 0,
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
    }, [allProducts, fetchAllProductsInternal, brands, categoriesMap, models, seriesList]);

    // Export to PDF function (all products)
    const exportToPDF = useCallback(async () => {
        setIsExporting(true);
        try {
            let products = allProducts;
            if (products.length === 0) {
                products = await fetchAllProductsInternal();
            }
            if (statusFilter !== 'all') {
                products = products.filter(p => p.status === statusFilter);
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
                brands?.find(b => b.id === product.brandId)?.name || product.brand || product.brandId,
                getExportPrice(product),
                product.orders || 0,
                product.bestSelling ? "Yes" : "No",
                product.isVariable ? "Yes" : "No",
                product.seoSlug
            ]);

            autoTable(doc, {
                head: [['#', 'ID', 'Title', 'Short Desc', 'Brand', 'Price',  'Orders',  'Best Selling', 'Variable', 'SEO Slug']],
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
    }, [allProducts, fetchAllProductsInternal, brands]);

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                    <button 
                        onClick={handleRefresh}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setLastSnapDocList([]); setClientPage(1); }}
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
                                <X className="h-4 w-4" />
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                                    <div className="flex items-center gap-1">
                                        Price
                                        {sortConfig.key === 'price' && (
                                            sortConfig.direction === 'asc' ?
                                                <ArrowUp className="h-3 w-3" /> :
                                                <ArrowDown className="h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('orders')}>
                                    <div className="flex items-center gap-1">
                                        Total Orders
                                        {sortConfig.key === 'orders' && (
                                            sortConfig.direction === 'asc' ?
                                                <ArrowUp className="h-3 w-3" /> :
                                                <ArrowDown className="h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                            <p className="mt-2 text-sm text-gray-500">
                                                {isSearchMode ? "Searching all products..." : "Loading products..."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : displayProducts.length > 0 ? (
                                displayProducts.map((item, index) => (
                                    <ProductRow
                                        key={item.id}
                                        index={index + (isSearchMode ? (clientPage - 1) * pageLimit : lastSnapDocList.length * pageLimit)}
                                        item={item}
                                        router={router}
                                        onDelete={handleDeleteProduct}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        {isSearchMode ? "No matching products found" : "No products available"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <select
                        value={pageLimit}
                        onChange={(e) => { setPageLimit(Number(e.target.value)); setClientPage(1); setLastSnapDocList([]); }}
                        className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[5, 10, 20, 50, 100].map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-500 ml-2">
                        {isSearchMode && filteredSearchProducts.length > 0 && (
                            `Showing ${(clientPage - 1) * pageLimit + 1} - ${Math.min(clientPage * pageLimit, filteredSearchProducts.length)} of ${filteredSearchProducts.length}`
                        )}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        disabled={isLoading || (isSearchMode ? clientPage === 1 : lastSnapDocList.length === 0)}
                        onClick={handlePrevPage}
                        className={`flex items-center gap-1 px-3 py-1 border rounded-md ${isLoading || (isSearchMode ? clientPage === 1 : lastSnapDocList.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>
                    <button
                        disabled={isLoading || (isSearchMode ? clientPage * pageLimit >= filteredSearchProducts.length : serverProducts.length < pageLimit)}
                        onClick={handleNextPage}
                        className={`flex items-center gap-1 px-3 py-1 border rounded-md ${isLoading || (isSearchMode ? clientPage * pageLimit >= filteredSearchProducts.length : serverProducts.length < pageLimit) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProductRow({ item, index, router, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete(item.id);
        setIsDeleting(false);
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
                            className="h-10 w-10 rounded-md object-cover bg-gray-100"
                            src={item.featureImageURL || "/placeholder-product.jpg"}
                            alt={item.title}
                            loading="lazy"
                        />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]" title={item.title}>
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
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                    {item.status === 'published' ? 'Published' : 'Draft'}
                </span>
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
                        className="p-1 text-blue-600 hover:text-blue-900 rounded hover:bg-blue-50"
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1 text-red-600 hover:text-red-900 rounded hover:bg-red-50"
                        title="Delete"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </td>
        </tr>
    );
}

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