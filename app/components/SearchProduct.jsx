"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input, Spinner } from "@nextui-org/react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
} from "@nextui-org/react";
import { ChevronDown, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

function SearchModels() {
    const router = useRouter();
    const searchRef = useRef(null);
    const [selectedBrand, setSelectedBrand] = useState("All Brands");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredModels, setFilteredModels] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all brands
    const [brands, setBrands] = useState([]);
    useEffect(() => {
        async function fetchBrands() {
            try {
                const brandsSnapshot = await getDocs(collection(db, "brands"));
                const brandsData = brandsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name
                }));
                setBrands([{ id: "all", name: "All Brands" }, ...brandsData]);
            } catch (err) {
                console.error("Failed to fetch brands:", err);
                setError("Failed to load brands");
            }
        }
        fetchBrands();
    }, []);

    // Handle search
    const handleSearch = useCallback(async () => {
        if (!searchTerm.trim()) {
            setFilteredModels([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const modelsCollection = collection(db, "models");
            let q = query(modelsCollection);

            if (selectedBrand !== "All Brands") {
                const selectedBrandId = brands.find(b => b.name === selectedBrand)?.id;
                if (selectedBrandId) {
                    q = query(q, where("brandId", "==", selectedBrandId));
                }
            }

            const modelsSnapshot = await getDocs(q);
            const models = modelsSnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(model =>
                    model.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
                );

            const enrichedModels = await Promise.all(models.map(async model => {
                const seriesSnapshot = await getDocs(
                    query(collection(db, "series"), where("id", "==", model.seriesId))
                );
                const brandSnapshot = await getDocs(
                    query(collection(db, "brands"), where("id", "==", model.brandId))
                );

                return {
                    ...model,
                    series: seriesSnapshot.docs[0]?.data().name || "Unknown Series",
                    brand: brandSnapshot.docs[0]?.data().name || "Unknown Brand",
                    category: model.category || "Unknown Category"
                };
            }));

            setFilteredModels(enrichedModels);
        } catch (err) {
            console.error("Search error:", err);
            setError("Failed to search models. Please try again.");
            setFilteredModels([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, selectedBrand, brands]);

    // Trigger search when filters change
    useEffect(() => {
        const debounceSearch = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(debounceSearch);
    }, [handleSearch]);

    // Handle key press (Enter key)
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="max-w-4xl w-full mx-auto md:px-4 px-0">
            <div className="relative w-full mt-6 mb-12" ref={searchRef}>
                {/* Search Bar */}
                <div className="flex w-full items-center rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <Dropdown>
                        <DropdownTrigger>
                        <Button
  variant="light"
  className="flex items-center px-4 py-2 gap-2 rounded-l-full border-r border-gray-200"
  disabled={isLoading}
>
  {/* ✅ Show on mobile, hide on md+ */}
  <Menu size={16} className="md:block hidden" />

  <span className="md:text-sm text-[14px] font-medium">
    {selectedBrand}
  </span>

  <ChevronDown size={16} />
</Button>

                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Brands"
                            className="bg-white shadow-lg rounded-lg max-h-96 overflow-y-auto"
                        >
                            {brands.map(brand => (
                                <DropdownItem
                                    key={brand.id}
                                    onClick={() => setSelectedBrand(brand.name)}
                                    className="text-sm py-2"
                                >
                                    {brand.name}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>

              <Input
  placeholder="Search for model..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={handleKeyPress}
  onFocus={() => setIsSearchFocused(true)}
  className="flex-1 border-none"
  classNames={{
    inputWrapper: "border-none shadow-none h-10 md:h-12 bg-transparent",
    input: `
      px-3 md:px-4
      py-2
      text-xs md:text-sm
      placeholder:text-xs md:placeholder:text-sm
      placeholder:text-gray-400
    `,
  }}
  isDisabled={isLoading}
/>


                    <Button
                        isIconOnly
                        className="rounded-r-full bg-transparent hover:bg-gray-100"
                        onClick={handleSearch}
                        isDisabled={isLoading}
                    >
                        {isLoading ? <Spinner size="sm" /> : <Search size={16} />}
                    </Button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-2 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Search Results */}
                {isSearchFocused && searchTerm && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-96 overflow-y-auto">
                        {filteredModels.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {filteredModels.map((model) => (
                                    <li key={model.id}>
                                        <Link
                                            href={`/models/${model.id}`}
                                            className="block p-4 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsSearchFocused(false)}
                                        >
                                            <div className="font-medium text-gray-900 text-sm">
                                                {model.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {model.brand}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                {isLoading ? "Searching..." : "No models found. Try a different search term."}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchModels;