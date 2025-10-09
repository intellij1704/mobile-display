"use client";

import { useProducts, searchProducts } from "@/lib/firestore/products/read";
import { updateProduct } from "@/lib/firestore/products/write";
import { Search, ChevronLeft, ChevronRight, Download, FileText, File } from "lucide-react";
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
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchedProducts, setSearchedProducts] = useState([]);

    useEffect(() => {
        const fetchTotal = async () => {
            const snap = await getDocs(collection(db, "products"));
            setTotalProducts(snap.size);
        };
        fetchTotal();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            searchProducts(searchQuery).then(setSearchedProducts);
        } else {
            setSearchedProducts([]);
        }
    }, [searchQuery]);

    const fetchAllProductsInternal = useCallback(async () => {
        setIsLoadingAll(true);
        try {
            const ref = collection(db, "products");
            const q = query(ref);
            const snapshot = await getDocs(q);
            const products = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                attributes: doc.data().attributes || [],
                variations: doc.data().variations || [],
            }));
            return products;
        } catch (error) {
            console.error("Error fetching all products:", error);
            toast.error("Failed to load products");
            return [];
        } finally {
            setIsLoadingAll(false);
        }
    }, []);

    const {
        data: paginatedProducts = [],
        isLoading,
        lastSnapDoc,
    } = useProducts({
        pageLimit,
        lastSnapDoc: lastSnapDocList.length === 0 ? null : lastSnapDocList[lastSnapDocList.length - 1],
    });

    const filteredProducts = useMemo(() => {
        let result = [...paginatedProducts];

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

        return result;
    }, [paginatedProducts, searchQuery]);

    const displayProducts = searchQuery ? searchedProducts : filteredProducts;

    const handleNextPage = useCallback(() => {
        if (lastSnapDoc) {
            setLastSnapDocList(prev => [...prev, lastSnapDoc]);
        }
    }, [lastSnapDoc]);

    const handlePrevPage = useCallback(() => {
        setLastSnapDocList(prev => prev.slice(0, -1));
    }, []);

    const exportToExcel = useCallback(async () => {
        setIsExporting(true);
        try {
            let products = allProducts;
            if (products.length === 0) {
                products = await fetchAllProductsInternal();
                setAllProducts(products);
            }

            const data = [];
            products.forEach((product) => {
                if (!product.isVariable) {
                    data.push({
                        Title: product.title,
                        Price: product.price || 0,
                        "Sale Price": product.salePrice || 0,
                    });
                } else {
                    product.variations.forEach((v) => {
                        const attr = Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(', ');
                        data.push({
                            Title: `${product.title} - ${attr}`,
                            Price: v.price || 0,
                            "Sale Price": v.salePrice || 0,
                        });
                    });
                }
            });

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
            XLSX.writeFile(workbook, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Exported products to Excel");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Failed to export to Excel");
        } finally {
            setIsExporting(false);
        }
    }, [allProducts, fetchAllProductsInternal]);

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
            doc.text("Product List", 14, 10);

            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 16);

            const tableData = [];
            products.forEach((product) => {
                if (!product.isVariable) {
                    tableData.push([
                        product.title,
                        product.price || 0,
                        product.salePrice || 0,
                    ]);
                } else {
                    product.variations.forEach((v) => {
                        const attr = Object.entries(v.attributes || {}).map(([k, val]) => `${k}: ${val}`).join(', ');
                        tableData.push([
                            `${product.title} - ${attr}`,
                            v.price || 0,
                            v.salePrice || 0,
                        ]);
                    });
                }
            });

            autoTable(doc, {
                head: [['Title', 'Price', 'Sale Price']],
                body: tableData,
                startY: 20,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontSize: 9
                },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 40 }
                }
            });

            doc.save(`products_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Exported products to PDF");
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            toast.error("Failed to export to PDF");
        } finally {
            setIsExporting(false);
        }
    }, [allProducts, fetchAllProductsInternal]);

    const currentPage = lastSnapDocList.length + 1;
    const from = ((currentPage - 1) * pageLimit) + 1;
    const to = Math.min(from + pageLimit - 1, totalProducts);

    return (
        <div className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                <h1 className="text-2xl font-bold text-gray-800">Update Bulk Product Prices</h1>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
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

                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            disabled={isExporting || isLoadingAll}
                            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm ${isExporting || isLoadingAll ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                exportToExcel();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            <File className="h-4 w-4" />
                                            Excel
                                        </button>
                                        <button
                                            onClick={() => {
                                                exportToPDF();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            <FileText className="h-4 w-4" />
                                            PDF
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center">
                                        <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-100">
                                            <CircularProgress size={50} thickness={4} color="primary" />
                                            <p className="mt-4 text-gray-600 font-medium">Please Wait...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : displayProducts.length > 0 ? (
                                displayProducts.map((item) => (
                                    <ProductRow key={item.id} product={item} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery ? "No matching products found" : "No products available"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!searchQuery ? (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <span>Items per page:</span>
                        <select
                            value={pageLimit}
                            onChange={(e) => setPageLimit(Number(e.target.value))}
                            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {[5, 10, 20, 50].map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                    <span>Showing {from}-{to} of {totalProducts} products</span>
                    <div className="flex gap-2">
                        <button
                            disabled={isLoading || lastSnapDocList.length === 0}
                            onClick={handlePrevPage}
                            className={`flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-md transition ${isLoading || lastSnapDocList.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>
                        <button
                            disabled={isLoading || paginatedProducts.length < pageLimit}
                            onClick={handleNextPage}
                            className={`flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-md transition ${isLoading || paginatedProducts.length < pageLimit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-600">
                    Showing 1-{searchedProducts.length} results (limited to 10)
                </div>
            )}
        </div>
    );
}

function ProductRow({ product }) {
    if (!product.isVariable) {
        const [price, setPrice] = useState(product.price?.toString() || '');
        const [salePrice, setSalePrice] = useState(product.salePrice?.toString() || '');
        const [priceError, setPriceError] = useState('');
        const [saleError, setSaleError] = useState('');
        const [hasSubmitted, setHasSubmitted] = useState(false);
        const [updating, setUpdating] = useState(false);

        const handlePriceChange = (e) => {
            const value = e.target.value;
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setPrice(value);
            }
        };

        const handleSalePriceChange = (e) => {
            const value = e.target.value;
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setSalePrice(value);
            }
        };

        useEffect(() => {
            const p = parseFloat(price);
            const s = parseFloat(salePrice);

            let newPriceError = '';
            if (price === '') {
                newPriceError = 'Price is required';
            } else if (isNaN(p) || p < 0 || p > 99999) {
                newPriceError = 'Value must be between 0 and 99999';
            }

            let newSaleError = '';
            if (salePrice !== '') {
                if (isNaN(s) || s < 0 || s > 99999) {
                    newSaleError = 'Value must be between 0 and 99999';
                } else if (!isNaN(p) && s >= p) {
                    newSaleError = 'Sale price must be less than price';
                }
            }

            setPriceError(newPriceError);
            setSaleError(newSaleError);
        }, [price, salePrice]);

        const handleUpdate = async () => {
            setHasSubmitted(true);

            if (priceError) {
                toast.error(priceError);
                return;
            }

            if (saleError) {
                toast.error(saleError);
                return;
            }

            const parsedPrice = parseFloat(price);
            const parsedSalePrice = salePrice ? parseFloat(salePrice) : null;

            setUpdating(true);
            try {
                await updateProduct({
                    data: {
                        ...product,
                        price: parsedPrice,
                        salePrice: parsedSalePrice,
                    },
                    featureImage: null,
                    imageList: [],
                    variantImages: {},
                });
                toast.success('Product updated');
                setHasSubmitted(false); // Reset after successful update
            } catch (err) {
                toast.error('Error updating product: ' + err.message);
            } finally {
                setUpdating(false);
            }
        };

        return (
            <tr className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.title}</td>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <input
                            type="text"
                            value={price}
                            onChange={handlePriceChange}
                            className={`w-32 px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasSubmitted && priceError ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <input
                            type="text"
                            value={salePrice}
                            onChange={handleSalePriceChange}
                            className={`w-32 px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasSubmitted && saleError ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                    <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className={`px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {updating ? (
                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            'Update'
                        )}
                    </button>
                </td>
            </tr>
        );
    } else {
        return (
            <>
                {product.variations.map((variation) => (
                    <VariationRow key={variation.id} product={product} variation={variation} />
                ))}
            </>
        );
    }
}

function VariationRow({ product, variation }) {
    const [price, setPrice] = useState(variation.price?.toString() || '');
    const [salePrice, setSalePrice] = useState(variation.salePrice?.toString() || '');
    const [priceError, setPriceError] = useState('');
    const [saleError, setSaleError] = useState('');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [updating, setUpdating] = useState(false);

    const attrString = Object.entries(variation.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ');

    const handlePriceChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setPrice(value);
        }
    };

    const handleSalePriceChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setSalePrice(value);
        }
    };

    useEffect(() => {
        const p = parseFloat(price);
        const s = parseFloat(salePrice);

        let newPriceError = '';
        if (price === '') {
            newPriceError = 'Price is required';
        } else if (isNaN(p) || p < 0 || p > 99999) {
            newPriceError = 'Value must be between 0 and 99999';
        }

        let newSaleError = '';
        if (salePrice !== '') {
            if (isNaN(s) || s < 0 || s > 99999) {
                newSaleError = 'Value must be between 0 and 99999';
            } else if (!isNaN(p) && s >= p) {
                newSaleError = 'Sale price must be less than price';
            }
        }

        setPriceError(newPriceError);
        setSaleError(newSaleError);
    }, [price, salePrice]);

    const handleUpdate = async () => {
        setHasSubmitted(true);

        if (priceError) {
            toast.error(priceError);
            return;
        }

        if (saleError) {
            toast.error(saleError);
            return;
        }

        const parsedPrice = parseFloat(price);
        const parsedSalePrice = salePrice ? parseFloat(salePrice) : null;

        setUpdating(true);
        try {
            const updatedVariations = product.variations.map(v =>
                v.id === variation.id ? { ...v, price: parsedPrice, salePrice: parsedSalePrice } : v
            );
            await updateProduct({
                data: {
                    ...product,
                    variations: updatedVariations,
                },
                featureImage: null,
                imageList: [],
                variantImages: {},
            });
            toast.success('Variation updated');
            setHasSubmitted(false); // Reset after successful update
        } catch (err) {
            toast.error('Error updating variation: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-200">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.title} - {attrString}</td>
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <input
                        type="text"
                        value={price}
                        onChange={handlePriceChange}
                        className={`w-32 px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasSubmitted && priceError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <input
                        type="text"
                        value={salePrice}
                        onChange={handleSalePriceChange}
                        className={`w-32 px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasSubmitted && saleError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className={`px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {updating ? (
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        'Update'
                    )}
                </button>
            </td>
        </tr>
    );
}