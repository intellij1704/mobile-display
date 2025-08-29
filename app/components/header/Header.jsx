"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { AuthContextProvider } from "@/context/AuthContext";
import HeaderClientButtons from "./header-client-buttons";
import UserDropdown from "./user-dropdown";
import MobileMenu from "./mobile-menu";
import SearchResults from "./search-results";
import { searchProducts } from "@/lib/firestore/products/read";
import { useCategories } from "@/lib/firestore/categories/read";
import CategoryDropdown from "./category-dropdown";

export default function Header() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { categoriesList, isLoading, error } = useCategories();

  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const inputRef = useRef(null);

  const handleSearch = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!searchTerm.trim()) {
        setFilteredProducts([]);
        return;
      }

      setIsSearching(true);
      try {
        let results = await searchProducts(searchTerm.trim());

        // Only filter by category if not "All Categories"
        if (selectedCategory !== "All Categories") {
          results = results.filter(
            (product) => product.category === selectedCategory
          );
        }

        setFilteredProducts(results);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to search products");
        setFilteredProducts([]);
      } finally {
        setIsSearching(false);
      }
    },
    [searchTerm, selectedCategory]
  );

  // Debounce search updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setFilteredProducts([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, handleSearch]);

  // Handle clicks outside search and mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        if (!event.target.closest(".search-result-item")) {
          setIsSearchFocused(false);
        }
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUsername(
          currentUser.displayName || currentUser.email?.split("@")[0] || "User"
        );
      } else {
        setUser(null);
        setUsername("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;
    try {
      await toast.promise(signOut(auth), {
        loading: "Logging out...",
        success: "Successfully logged out",
        error: (e) => e?.message || "Logout failed",
      });
    } catch (error) {
      toast.error(error?.message || "Logout failed");
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSearchResultClick = () => {
    setIsSearchFocused(false);
    setSearchTerm("");
    setFilteredProducts([]);
    closeMobileMenu();
  };

  const cartCount = user?.carts?.length || 0;
  const wishlistCount = user?.favorites?.length || 0;

  if (error) {
    toast.error("Failed to load categories");
  }

  return (
    <>
      <header className="flex flex-col z-[99] bg-white shadow-sm ">
        {/* Top Bar */}
        <div className="flex items-center justify-between w-full px-4 py-4 md:px-6 lg:px-8 xl:px-20 border-b border-gray-200">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Mobile Display - Home">
              <img
                src="/logo.png"
                alt="Mobile Display"
                className="h-10 w-auto md:h-12"
                width={120}
                height={48}
              />
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-4 relative" ref={searchRef}>
            <form
              onSubmit={handleSearch}
              className="flex w-full items-center rounded-full border border-gray-300 transition-all"
            >
              <CategoryDropdown
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={["All Categories", ...categoriesList.map((cat) => cat.name)]}
              />

              <input
                type="text"
                ref={inputRef}
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="flex-1 px-4 py-2 focus:outline-none text-sm h-10"
                aria-label="Search products"
              />

              <button
                type="submit"
                className="p-2 h-10 rounded-none bg-transparent hover:bg-gray-100 transition-colors"
                aria-label="Submit search"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600" />
                ) : (
                  <Search size={18} />
                )}
              </button>
            </form>

            {isSearchFocused && (searchTerm.trim() || filteredProducts.length > 0) && (
              <SearchResults
                filteredProducts={filteredProducts}
                handleSearchResultClick={handleSearchResultClick}
                isLoading={isSearching}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
              />
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <AuthContextProvider>
              <HeaderClientButtons />
            </AuthContextProvider>

            <UserDropdown
              user={user}
              username={username}
              handleLogout={handleLogout}
              closeMobileMenu={closeMobileMenu}
            />

            <button
              onClick={toggleMobileMenu}
              className="md:hidden mobile-menu-button p-1"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-3 py-2 border-b border-gray-200 bg-white lg:hidden " ref={searchRef}>
          <form
            onSubmit={handleSearch}
            className="flex w-full items-center gap-2 rounded-md border border-gray-300 transition-all px-2 py-1"
          >
            <CategoryDropdown
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={["All Categories", ...categoriesList.map((cat) => cat.name)]}
            />

            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="flex-1 min-w-0 px-2 py-1 text-sm h-9 focus:outline-none"
              aria-label="Search products"
            />

            <button
              type="submit"
              className="p-2 h-9 bg-transparent hover:bg-gray-100 transition-colors flex items-center justify-center"
              aria-label="Submit search"
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray600" />
              ) : (
                <Search size={18} />
              )}
            </button>
          </form>

          {isSearchFocused && (searchTerm.trim() || filteredProducts.length > 0) && (
            <SearchResults
              filteredProducts={filteredProducts}
              handleSearchResultClick={handleSearchResultClick}
              isLoading={isSearching}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
            />
          )}
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        mobileMenuRef={mobileMenuRef}
        closeMobileMenu={closeMobileMenu}
        user={user}
        username={username}
        handleLogout={handleLogout}
        categories={categoriesList}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
    </>
  );
}