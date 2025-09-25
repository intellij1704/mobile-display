"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useShopOwners } from "@/lib/firestore/shopOwner/read"
import Image from "next/image"
import { Loader2, Verified, Download, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const Page = () => {
  const { data: shopOwners, loading, error } = useShopOwners()
  const [search, setSearch] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [loadingImage, setLoadingImage] = useState(false)

  // ----------------- EXPORT TO EXCEL -----------------
  const handleExportExcel = () => {
    if (!shopOwners || shopOwners.length === 0) return

    const worksheet = XLSX.utils.json_to_sheet(
      shopOwners.map((o) => ({
        Name: o.name,
        City: o.city,
        Mobile: o.mobile,
        Images: o.images?.join(", ") || "N/A",
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "ShopOwners")
    XLSX.writeFile(workbook, "shop_owners.xlsx")
  }

  // ----------------- EXPORT TO PDF -----------------
  const handleExportPDF = () => {
    if (!shopOwners || shopOwners.length === 0) return

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Shop Owners", 14, 15)

    autoTable(doc, {
      startY: 25,
      head: [["Name", "City", "Mobile", "Images"]],
      body: shopOwners.map((o) => [
        o.name,
        o.city,
        o.mobile,
        o.images?.length ? o.images.length + " images" : "N/A",
      ]),
    })

    doc.save("shop_owners.pdf")
  }

  // ----------------- FILTERING -----------------
  const filteredOwners = useMemo(() => {
    if (!shopOwners) return []
    return shopOwners.filter(
      (o) =>
        o.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.city?.toLowerCase().includes(search.toLowerCase()) ||
        o.mobile?.toLowerCase().includes(search.toLowerCase())
    )
  }, [shopOwners, search])

  // ----------------- CLOSE IMAGE HANDLERS -----------------
  const closeImage = useCallback(() => {
    setSelectedImage(null)
    setLoadingImage(false)
  }, [])

  // Close with ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeImage()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [closeImage])

  if (loading) {
    return (
      <div className="flex items-center flex-col justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p>Please wait...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Failed to load shop owners.
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Shop Owner Requests
        </h1>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      {filteredOwners.length === 0 ? (
        <p className="text-gray-500">No shop owners found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOwners.map((owner) => (
            <div
              key={owner.id}
              className="bg-white rounded-xl shadow p-4 border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {owner.name}
                    </h2>
                    <Verified className="w-5 h-5 text-white fill-blue-500" />
                  </div>
                  <p className="text-sm text-gray-500">City: {owner.city}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                <span className="font-medium">Mobile:</span> {owner.mobile}
              </p>

              {owner.images?.length > 1 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {owner.images.map((img, i) => (
                    <Image
                      key={i}
                      src={img}
                      alt={`Shop ${i + 1}`}
                      width={60}
                      height={60}
                      className="rounded-md object-cover border cursor-pointer"
                      onClick={() => {
                        setLoadingImage(true)
                        setSelectedImage(img)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] transition-opacity duration-300"
          onClick={closeImage}
        >
          <div
            className="relative w-full max-w-2xl max-h-[80vh] mx-4 animate-scaleIn flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Loader (while image is loading) */}
            {loadingImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            )}

            {/* Close button (after load) */}
            {!loadingImage && (
              <button
                className="absolute top-3 right-3 text-white bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-80 transition"
                onClick={closeImage}
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <Image
              src={selectedImage}
              alt="Full Preview"
              width={1000}
              height={800}
              className="w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
              onLoadingComplete={() => setLoadingImage(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
