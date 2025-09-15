"use client"
import { X, Filter } from "lucide-react"

const ProductFilters = ({
  categories,
  brands,
  series, // Added series prop
  models, // Added models prop
  onFilterChange,
  onClearFilters,
  isOpen,
  onClose,
  isLoading,
  filters,
}) => {
  const handleCheckboxChange = (filterType, value) => {
    const currentValues = Array.isArray(filters[filterType]) ? filters[filterType] : []
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value]
    onFilterChange(filterType, updatedValues)
  }

  const FilterSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-24 bg-gray-200 rounded"></div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center mb-2">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="ml-2 h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )

  const handleApplyFilters = () => {
    onClose()
  }

  return (
    <>
      {/* Desktop Drawer - Left Side Sliding */}
      {isOpen && (
        <div className="hidden md:block fixed inset-0 bg-black bg-opacity-50 z-[9999]">
          <div className="bg-white h-full w-80 shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Filter size={20} />
                  Filters By
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4">
              {isLoading ? (
                <FilterSkeleton />
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium mb-3">Categories</h3>
                    {categories.map((category) => (
                      <div key={category.name} className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id={`desktop-category-${category.name}`}
                          checked={filters.category.includes(category.name)}
                          onChange={() => handleCheckboxChange("category", category.name)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`desktop-category-${category.name}`} className="ml-3 text-sm text-gray-700">
                          {category.name} ({category.count})
                        </label>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-md font-medium mb-3">Brands</h3>
                    {brands.map((brand) => (
                      <div key={brand.name} className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id={`desktop-brand-${brand.name}`}
                          checked={filters.brand.includes(brand.name)}
                          onChange={() => handleCheckboxChange("brand", brand.name)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`desktop-brand-${brand.name}`} className="ml-3 text-sm text-gray-700">
                          {brand.name} ({brand.count})
                        </label>
                      </div>
                    ))}
                  </div>

                  {series && series.length > 0 && (
                    <div>
                      <h3 className="text-md font-medium mb-3">Series</h3>
                      {series.map((seriesItem) => (
                        <div key={seriesItem.name} className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            id={`desktop-series-${seriesItem.name}`}
                            checked={filters.series.includes(seriesItem.name)}
                            onChange={() => handleCheckboxChange("series", seriesItem.name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`desktop-series-${seriesItem.name}`} className="ml-3 text-sm text-gray-700">
                            {seriesItem.name} ({seriesItem.count})
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {models && models.length > 0 && (
                    <div>
                      <h3 className="text-md font-medium mb-3">Models</h3>
                      {models.map((model) => (
                        <div key={model.name} className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            id={`desktop-model-${model.name}`}
                            checked={filters.model.includes(model.name)}
                            onChange={() => handleCheckboxChange("model", model.name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`desktop-model-${model.name}`} className="ml-3 text-sm text-gray-700">
                            {model.name} ({model.count})
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex gap-3">
                <button
                  onClick={onClearFilters}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout - Enhanced with all filter types */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-xl p-4 h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-1 pb-2 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <div className="flex items-center gap-4">
                <button onClick={onClearFilters} className="text-blue-500 text-sm hover:underline">
                  Clear All
                </button>
                <button onClick={onClose} className="text-gray-500">
                  <X size={20} />
                </button>
              </div>
            </div>
            {isLoading ? (
              <FilterSkeleton />
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-2">Category</h3>
                  {categories.map((category) => (
                    <div key={category.name} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`mobile-category-${category.name}`}
                        checked={filters.category.includes(category.name)}
                        onChange={() => handleCheckboxChange("category", category.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`mobile-category-${category.name}`} className="ml-2 text-sm text-gray-700">
                        {category.name} ({category.count})
                      </label>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-md font-medium mb-2">Brand</h3>
                  {brands.map((brand) => (
                    <div key={brand.name} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`mobile-brand-${brand.name}`}
                        checked={filters.brand.includes(brand.name)}
                        onChange={() => handleCheckboxChange("brand", brand.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`mobile-brand-${brand.name}`} className="ml-2 text-sm text-gray-700">
                        {brand.name} ({brand.count})
                      </label>
                    </div>
                  ))}
                </div>

                {series && series.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium mb-2">Series</h3>
                    {series.map((seriesItem) => (
                      <div key={seriesItem.name} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`mobile-series-${seriesItem.name}`}
                          checked={filters.series.includes(seriesItem.name)}
                          onChange={() => handleCheckboxChange("series", seriesItem.name)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`mobile-series-${seriesItem.name}`} className="ml-2 text-sm text-gray-700">
                          {seriesItem.name} ({seriesItem.count})
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {models && models.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium mb-2">Models</h3>
                    {models.map((model) => (
                      <div key={model.name} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`mobile-model-${model.name}`}
                          checked={filters.model.includes(model.name)}
                          onChange={() => handleCheckboxChange("model", model.name)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`mobile-model-${model.name}`} className="ml-2 text-sm text-gray-700">
                          {model.name} ({model.count})
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h3 className="text-md font-medium mb-2">Price</h3>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={filters.price}
                    onChange={(e) => onFilterChange("price", Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>₹0</span>
                    <span>₹{filters.price}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="sticky bottom-0 pt-4 pb-2 bg-white border-t mt-4">
              <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white font-medium rounded-md">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductFilters
