import { AuthContextProvider } from "@/context/AuthContext"
import ProductCard from "./ProductCard"

const ProductGrid = ({ products = [] }) => {

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search criteria</p>
                </div>
            </div>
        )
    }

    return (
        <AuthContextProvider>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:px-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </AuthContextProvider>
    )
}

export default ProductGrid
