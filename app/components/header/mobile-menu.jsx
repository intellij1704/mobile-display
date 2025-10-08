"use client"

import { useState } from "react"
import Link from "next/link"
import { User, X, Heart, ShoppingCart, ChevronDown, Repeat } from "lucide-react"

export default function MobileMenu({
  isOpen,
  mobileMenuRef,
  closeMobileMenu,
  user,
  username,
  handleLogout,
  categories,
  cartCount,
  wishlistCount,
}) {
  const [expandedCategories, setExpandedCategories] = useState({})

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  return (
    <div
      className={`fixed inset-0 z-[1000] bg-black bg-opacity-50 transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      aria-hidden={!isOpen}
    >
      <div
        ref={mobileMenuRef}
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex-shrink-0">
              <Link href="/" aria-label="Mobile Display - Home">
                <img src="/logo.png" alt="Mobile Display" className="h-10 w-auto md:h-16" width={120} height={48} />
              </Link>
            </div>
            <button onClick={closeMobileMenu} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close menu">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* User section */}
            <div className="p-4 border-b border-gray-200">
              {!user ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Sign in to access your account</p>
                  <div className="flex gap-2">
                    <Link
                      href="/login"
                      className="flex-1 py-2 px-3 text-sm text-center bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="flex-1 py-2 px-3 text-sm text-center border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Register
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/profile"
                      className="py-2 px-3 text-sm text-center border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={closeMobileMenu}
                    >
                      My Profile
                    </Link>

                    <Link
                      href="/orders"
                      className="py-2 px-3 text-sm text-center border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={closeMobileMenu}
                    >
                      My Orders
                    </Link>

                  </div>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="p-4 space-y-2 border-b border-gray-200">
              <Link
                href="/return-replacement"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                onClick={closeMobileMenu}
              >
                <Repeat size={18} />
                <span className="text-sm">Replacement Requests</span>
              </Link>
              <Link
                href="/cart"
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} />
                  <span className="text-sm">Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/wishlist"
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-3">
                  <Heart size={18} />
                  <span className="text-sm">Favorites</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/contact"
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                <span className="text-sm">Support</span>
              </Link>
              <Link
                href="/categories"
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                <span className="text-sm">All Categories</span>
              </Link>
            </div>


          </div>


          {/* Footer with logout button for logged-in users */}
          {user && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  handleLogout()
                  closeMobileMenu()
                }}
                className="w-full py-2 text-sm text-center text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
