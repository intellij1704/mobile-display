"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { User, ChevronDown, LogOut, ShoppingBag, UserCircle, Repeat  } from "lucide-react"

export default function UserDropdown({ user, username, handleLogout, closeMobileMenu }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const toggleDropdown = () => setIsOpen(!isOpen)
  const closeDropdown = () => setIsOpen(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="hidden md:flex items-center gap-2 hover:text-blue-600 transition-colors h-10 px-3 rounded-md hover:bg-gray-50"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User size={20} />
        <span className="hidden md:inline whitespace-nowrap text-sm font-medium">{user ? username : "Account"}</span>
        <ChevronDown size={16} className="hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-white shadow-md w-56 rounded-md border border-gray-200 py-1 overflow-hidden">
          {!user ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-medium text-sm">Welcome</h3>
                <p className="text-xs text-gray-500 mt-1">Sign in to access your account</p>
              </div>
              <div className="p-3 space-y-2">
                <Link
                  href="/login"
                  className="block w-full py-2 px-3 text-sm text-center bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  onClick={closeDropdown}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block w-full py-2 px-3 text-sm text-center border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={closeDropdown}
                >
                  Register
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-medium text-sm">Hello, {username}</h3>
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  onClick={closeDropdown}
                >
                  <UserCircle size={16} />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  onClick={closeDropdown}
                >
                  <ShoppingBag size={16} />
                  <span>My Orders</span>
                </Link>
                <Link
                  href="/return-replacement"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  onClick={closeDropdown}
                >
                  <Repeat size={16} />
                  <span>Replacement Requests</span>
                </Link>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      handleLogout()
                      closeDropdown()
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
