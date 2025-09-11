"use client"
import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useProducts } from "@/lib/firestore/products/read"
import { useCategories } from "@/lib/firestore/categories/read"
import { useBrands } from "@/lib/firestore/brands/read"
import ProductFilters from "./components/ProductFilters"
import ProductGrid from "./components/ProductGrid"
import SortMenu from "./components/SortMenu"
import { Filter, ArrowUpDown, X } from 'lucide-react'
import ProductSkeleton from "./components/ProductSkeleton"

// Filter logic extracted into a reusable hook
const useProductFilters = (products, categoriesList, brands, initialCategoryIds, initialBrandIds) => {
    const [filters, setFilters] = useState({
        category: [],
        brand: [],
        price: 2000,
    })
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        if (!categoriesList || !brands || isInitialized) return

        const selectedCategories = categoriesList
            .filter((cat) => initialCategoryIds.includes(cat.id))
            .map((cat) => cat.name)
        const selectedBrands = brands.filter((brand) => initialBrandIds.includes(brand.id)).map((brand) => brand.name)

        setFilters({
            category: selectedCategories,
            brand: selectedBrands,
            price: 2000,
        })
        setIsInitialized(true)
    }, [categoriesList, brands, initialCategoryIds, initialBrandIds, isInitialized])

    const processedCategories = useMemo(() => {
        return (
            categoriesList?.map((category) => ({
                name: category.name,
                count: products?.filter((product) => product.categoryId === category.id).length || 0,
            })) || []
        )
    }, [categoriesList, products])

    const processedBrands = useMemo(() => {
        return (
            brands?.map((brand) => ({
                name: brand.name,
                count: products?.filter((product) => product.brandId === brand.id).length || 0,
            })) || []
        )
    }, [brands, products])

    const filteredProducts = useMemo(() => {
        if (!products) return []

        let updatedProducts = [...products]

        if (filters.category.length > 0) {
            const categoryIds = categoriesList.filter((cat) => filters.category.includes(cat.name)).map((cat) => cat.id)
            if (categoryIds.length > 0) {
                updatedProducts = updatedProducts.filter((product) => categoryIds.includes(product.categoryId))
            }
        }

        if (filters.brand.length > 0) {
            const brandIds = brands.filter((brand) => filters.brand.includes(brand.name)).map((brand) => brand.id)
            if (brandIds.length > 0) {
                updatedProducts = updatedProducts.filter((product) => brandIds.includes(product.brandId))
            }
        }

        if (filters.price < 2000) {
            updatedProducts = updatedProducts.filter(
                (product) => (product.salePrice || product.price) <= Number(filters.price),
            )
        }

        return updatedProducts
    }, [filters, products, categoriesList, brands])

    return { filters, setFilters, processedCategories, processedBrands, filteredProducts }
}

// Sorting logic extracted into a reusable hook
const useProductSorting = (filteredProducts) => {
    const [sortOption, setSortOption] = useState("popularity")

    const sortedProducts = useMemo(() => {
        const products = [...filteredProducts]
        switch (sortOption) {
            case "priceLowToHigh":
                return products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
            case "priceHighToLow":
                return products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
            case "newest":
                return products.sort((a, b) => {
                    const aTime = a.timestampCreate?.seconds || 0
                    const bTime = b.timestampCreate?.seconds || 0
                    return bTime - aTime
                })
            case "rating":
            case "popularity":
            default:
                return products.sort((a, b) => (a.bestSelling === b.bestSelling ? 0 : a.bestSelling ? -1 : 1))
        }
    }, [sortOption, filteredProducts])

    return { sortOption, setSortOption, sortedProducts }
}

// Main component with Suspense boundary
const ProductsPageContent = () => {
    const { data: products, isLoading, error } = useProducts({ pageLimit: 20 })
    const { categoriesList } = useCategories()
    const { data: brands } = useBrands()

    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const initialBrandIds = searchParams.get("brandId")?.split(",").filter(Boolean) || []
    const initialCategoryIds = searchParams.get("categoryId")?.split(",").filter(Boolean) || []

    const { filters, setFilters, processedCategories, processedBrands, filteredProducts } = useProductFilters(
        products,
        categoriesList,
        brands,
        initialCategoryIds,
        initialBrandIds,
    )
    const { sortOption, setSortOption, sortedProducts } = useProductSorting(filteredProducts)

    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isSortOpen, setIsSortOpen] = useState(false)

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
        }))
    }

    const handleClearFilters = () => {
        setFilters({
            category: [],
            brand: [],
            price: 2000,
        })
        router.push(pathname)
    }

    const handleSortChange = (option) => {
        setSortOption(option)
        setIsSortOpen(false)
    }

    const removeFilter = (filterType, value) => {
        const currentValues = Array.isArray(filters[filterType]) ? filters[filterType] : []
        const updatedValues = currentValues.filter((item) => item !== value)
        handleFilterChange(filterType, updatedValues)
    }

    const hasActiveFilters = filters.category.length > 0 || filters.brand.length > 0 || filters.price < 2000

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="  md:block hidden">
                <div className="w-full max-w-7xl mx-auto pt-10">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#EFF4F7] border border-[#0000000D] hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <Filter size={16} />
                            <span className="font-medium">Filter By</span>
                        </button>
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border rounded-md py-2 px-4 pr-8 cursor-pointer"
                                value={sortOption}
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                <option value="popularity">Popularity</option>
                                <option value="priceLowToHigh">Price: Low to High</option>
                                <option value="priceHighToLow">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ArrowUpDown size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {hasActiveFilters && (
                <div className="">
                    <div className="w-full max-w-7xl mx-auto px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {filters.category.map((category) => (
                                <div key={category} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    <span>Category: {category}</span>
                                    <button
                                        onClick={() => removeFilter('category', category)}
                                        className="hover:bg-blue-200 rounded-full p-0.5"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {filters.brand.map((brand) => (
                                <div key={brand} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                    <span>Brand: {brand}</span>
                                    <button
                                        onClick={() => removeFilter('brand', brand)}
                                        className="hover:bg-green-200 rounded-full p-0.5"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {filters.price < 2000 && (
                                <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                    <span>Price: ₹{filters.price}</span>
                                    <button
                                        onClick={() => handleFilterChange('price', 2000)}
                                        className="hover:bg-purple-200 rounded-full p-0.5"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={handleClearFilters}
                                className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="md:hidden bg-white shadow-md">
                <div className="flex items-center justify-between p-3">
                    <div className="flex-1">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center justify-center w-full py-2 border-r"
                        >
                            <Filter size={16} className="mr-2" />
                            <span>Filter</span>
                        </button>
                    </div>
                    <div className="flex-1">
                        <button onClick={() => setIsSortOpen(true)} className="flex items-center justify-center w-full py-2">
                            <ArrowUpDown size={16} className="mr-2" />
                            <span>Sort</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-7xl mx-auto pb-6 lg:py-10">
                <div className="px-4 mb-4 pt-10 md:pt-0">
                    <h2 className="text-lg sm:text-xl font-semibold">
                        {isLoading ? "" : `Showing ${sortedProducts.length} Results from total ${products?.length || 0}`}
                    </h2>
                </div>
                <div className="px-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {[...Array(10)].map((_, index) => (
                                <ProductSkeleton key={index} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <p className="text-red-500">Error loading products: {error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <ProductGrid products={sortedProducts} />
                    )}
                </div>
            </div>

            <ProductFilters
                categories={processedCategories}
                brands={processedBrands}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                isLoading={isLoading}
                filters={filters}
            />

            <SortMenu
                isOpen={isSortOpen}
                onClose={() => setIsSortOpen(false)}
                onSortChange={handleSortChange}
                currentSort={sortOption}
            />
        </div>
    )
}

// Wrap the component in Suspense
const ProductsPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsPageContent />
        </Suspense>
    )
}

export default ProductsPage
