"use client"

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react"
import { Menu, Search, ShoppingCart, X } from "lucide-react"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "react-hot-toast"
import { AuthContextProvider } from "@/context/AuthContext"
import HeaderClientButtons from "./header-client-buttons"
import UserDropdown from "./user-dropdown"
import MobileMenu from "./mobile-menu"
import SearchResults from "./search-results"
import { searchProducts } from "@/lib/firestore/products/read"
import { useCategories } from "@/lib/firestore/categories/read"
import CategoryDropdown from "./category-dropdown"
import CartDrawer from "./CartDrawer"
import { useUser } from "@/lib/firestore/user/read"

export default function Header() {
  // Auth + UI state
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Search state
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const [isMobile, setIsMobile] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)

  const headerRef = useRef(null)
  const desktopSearchRef = useRef(null)
  const mobileSearchRef = useRef(null)
  const mobileMenuRef = useRef(null)

  const { categoriesList, error } = useCategories()
  const { data } = useUser({ uid: user?.uid })
  const cartCount = data?.carts?.length || 0
  const wishlistCount = data?.favorites?.length || 0

  if (error) {
    toast.error("Failed to load categories")
  }

  // Search handler
  const handleSearch = useCallback(
    async (e) => {
      e?.preventDefault()
      if (!searchTerm.trim()) {
        setFilteredProducts([])
        return
      }

      setIsSearching(true)
      try {
        let results = await searchProducts(searchTerm.trim())
        if (selectedCategory !== "All Categories") {
          results = results.filter((product) => product.category === selectedCategory)
        }
        setFilteredProducts(results)
      } catch (err) {
        console.error("Search error:", err)
        toast.error("Failed to search products")
        setFilteredProducts([])
      } finally {
        setIsSearching(false)
      }
    },
    [searchTerm, selectedCategory],
  )

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch()
      } else {
        setFilteredProducts([])
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, handleSearch])

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inDesktopSearch = desktopSearchRef.current?.contains(event.target)
      const inMobileSearch = mobileSearchRef.current?.contains(event.target)
      const inResultsItem = event.target.closest?.(".search-result-item")
      const inMenuOrButton =
        mobileMenuRef.current?.contains(event.target) || event.target.closest?.(".mobile-menu-button")

      if (!inDesktopSearch && !inMobileSearch && !inResultsItem && !inMenuOrButton) {
        setIsSearchFocused(false)
        setFilteredProducts([])
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setUsername(currentUser.displayName || currentUser.email?.split("@")[0] || "User")
      } else {
        setUser(null)
        setUsername("")
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return
    try {
      await toast.promise(signOut(auth), {
        loading: "Logging out...",
        success: "Successfully logged out",
        error: (e) => e?.message || "Logout failed",
      })
    } catch (err) {
      toast.error(err?.message || "Logout failed")
    }
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  const handleSearchResultClick = () => {
    setIsSearchFocused(false)
    setSearchTerm("")
    setFilteredProducts([])
    closeMobileMenu()
  }

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const handleCartClick = (e) => {
    e.preventDefault()
    setIsCartDrawerOpen(true)
  }

  // Mobile detection
  useEffect(() => {
    const computeIsMobile = () => setIsMobile(window.innerWidth < 1024)
    computeIsMobile()
    window.addEventListener("resize", computeIsMobile)
    return () => window.removeEventListener("resize", computeIsMobile)
  }, [])

  // Measure header height for desktop sticky trigger
  useLayoutEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.clientHeight || 0)
      }
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [isMobile])

  // Desktop sticky on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsSticky(!isMobile && scrollY > headerHeight)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isMobile, headerHeight])

  // Mobile menu click outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest(".mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [isMobileMenuOpen])

  return (
    <>
      <header
        ref={headerRef}
        className={`bg-white border-b border-gray-200 z-[99] ${isMobile
            ? "sticky top-0"
            : isSticky
              ? "fixed top-0 left-0 w-full shadow-[0_4px_6px_rgba(0,0,0,0.1)] animate-slideDown"
              : "relative"
          }`}
      >
        {/* Top Bar */}
        <div
          className="w-full mx-auto px-4 pt-2 pb-1 md:py-5 md:px-6 lg:px-8 xl:px-28 flex items-center justify-between"
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Home">
              <img src="/logo.png" alt="Logo" className="h-12 w-auto md:h-16" width={120} height={48} />
            </Link>
          </div>

          {/* Desktop Search */}
          {!isMobile && (
            <div className="hidden lg:flex flex-1 max-w-2xl xl:max-w-3xl mx-6 relative" ref={desktopSearchRef}>
              <form
                onSubmit={handleSearch}
                className="flex w-full items-center rounded-full border-2 border-gray-200 bg-white hover:border-red-300 transition-all duration-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100"
              >
                <CategoryDropdown
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categories={["All Categories", ...categoriesList.map((cat) => cat.name)]}
                />
                <input
                  type="text"
                  placeholder="Search for premium products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="flex-1 px-6 py-4 focus:outline-none text-sm bg-transparent placeholder-gray-400"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="p-4 rounded-r-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                  aria-label="Submit search"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <Search size={20} />
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
          )}

          {/* User Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <AuthContextProvider>
              <HeaderClientButtons />
            </AuthContextProvider>
            <button onClick={handleCartClick} className="relative group flex items-center" aria-label="My Cart">
              <div className="relative">
                <div className="h-10 w-10 flex justify-center items-center rounded-full group-hover:bg-gray-50 transition-colors">
                  <ShoppingCart size={20} className="group-hover:text-blue-600 transition-colors" />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-sm text-gray-700 group-hover:text-blue-600">Cart</span>
            </button>
            <UserDropdown
              user={user}
              username={username}
              handleLogout={handleLogout}
              closeMobileMenu={closeMobileMenu}
            />
            <button onClick={toggleMobileMenu} className="md:hidden mobile-menu-button p-1" aria-label="Toggle menu">
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMobile && (
          <div
            className="px-3 py-2 border-b border-gray-200 bg-white"
            ref={mobileSearchRef}
          >
            <form
              onSubmit={handleSearch}
              className="flex w-full items-center gap-2 rounded-full border border-gray-300 transition-all px-2 py-1"
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
                className="flex-1 min-w-0 px-2 py-1 text-sm h-9 focus:outline-none placeholder:text-xs md:placeholder:text-md"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="p-2 h-9 bg-transparent hover:bg-gray-100 transition-colors flex items-center justify-center"
                aria-label="Submit search"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                ) : (
                  <Search size={22} className="text-gray-700" />
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
        )}
        <style jsx global>{`
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
            }
            to {
              transform: translateY(0);
            }
          }
          .animate-slideDown {
            animation: slideDown 0.5s ease forwards;
          }
        `}</style>
      </header>

      <AuthContextProvider>
        <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />
      </AuthContextProvider>

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
  )
}