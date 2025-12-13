/* eslint-disable react/jsx-key */

// Brand Series Page with custom red scrollbars

"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useParams } from "next/navigation"

import { useBrands } from "@/lib/firestore/brands/read"
import { useSeriesByBrand, useSeriesBySlug } from "@/lib/firestore/series/read"
import { useModelsByBrand, useModelBySlug } from "@/lib/firestore/models/read"
import { CircularProgress } from "@mui/material"

function SeriesNotFound({ brandName }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
            <div className="text-center max-w-md mx-auto">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <div className="h-3 w-3 rounded-full bg-gray-500 animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Series Not Found</h1>
                <p className="text-gray-600 mb-6">
                    Sorry, we couldn't find any series for {brandName}.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    )
}

export default function BrandSeriesPage() {
    const params = useParams()
    const brandParam = params?.brandId

    const [selectedSeriesId, setSelectedSeriesId] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")

    const { data: brands, isLoading: loadingBrands } = useBrands()

    const brand = useMemo(() => {
        return brands?.find((b) => b.id === brandParam || b.slug === brandParam)
    }, [brands, brandParam])

    const brandId = brand?.id
    const brandName = brand?.name || brandParam || "Brand"

    const { data: series, isLoading: loadingSeries, error } = useSeriesByBrand(brandId)
    const { data: allModels, isLoading: loadingModels } = useModelsByBrand(brandId)

    const { seriesName } = useMemo(() => {
        const s = series?.find((x) => x.id === selectedSeriesId)
        return { seriesName: s?.seriesName || "All Models" }
    }, [series, selectedSeriesId])

    const handleSeriesClick = (id) => {
        setSelectedSeriesId((prev) => (prev === id ? null : id))
    }

    const filteredModels = useMemo(() => {
        const list = Array.isArray(allModels) ? allModels : []
        const bySeries = selectedSeriesId
            ? list.filter((m) => m.seriesId === selectedSeriesId)
            : list
        if (!searchQuery) return bySeries
        const q = searchQuery.toLowerCase()
        return bySeries.filter((m) => (m.name || "").toLowerCase().includes(q))
    }, [allModels, selectedSeriesId, searchQuery])

    if (loadingSeries || loadingBrands)
        return (
            <div className="flex flex-col items-center justify-center py-10 h-screen">
                <CircularProgress />
                <h3 className="mt-3 text-sm font-medium text-gray-600">Loading Series...</h3>
            </div>
        )

    if (error)
        return <p className="text-center text-red-500 py-20">Failed to load series</p>

    if (!series || series.length === 0)
        return <SeriesNotFound brandName={brandName} />

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <Link href="/" className="hover:underline">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="font-medium text-gray-800">{brandName}</span>
            </div>

            {/* Head row with top search (mobile only) */}
            <div className="grid grid-cols-12 items-center mb-3">
                <div className="col-span-12 md:col-span-3" />
                <div className="col-span-12 md:col-span-9 flex items-center gap-4">
                    <div className="w-full max-w-xs mx-auto md:hidden block">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your phone model..."
                            className="w-full px-3 py-2 rounded-full border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            aria-label="Search models"
                        />
                    </div>
                </div>
            </div>

            <div className=" grid grid-cols-12 gap-4 ">
                <div className="col-span-4 md:col-span-2 flex items-center justify-start">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Series
                    </span>
                </div>

                <div className="col-span-8 md:col-span-10 flex md:flex-row flex-col md:items-center gap-4  md:mt-4 md:mr-2 justify-between">

                    <h2 className="text-base font-semibold mb-3">
                        {seriesName}
                    </h2>

                    {/* Desktop search */}
                    <div className="w-full max-w-xs hidden md:block">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your phone model..."
                            className="w-full px-3 py-2 rounded-full border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            aria-label="Search models"
                        />
                    </div>
                </div>



            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-12 gap-4 md:mt-2">
                {/* Left: Series (scrollable list) */}
                <aside className="col-span-4 md:col-span-2">
                    <div className="h-[70vh] overflow-y-auto pr-1 rounded-md custom-scroll">


                        <ul className="space-y-2 bg-white md:shadow-lg md:p-0 p-1 rounded">
                            {series.map((s) => {
                                const active = selectedSeriesId === s.id
                                return (
                                    <li key={s.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleSeriesClick(s.id)}
                                            className={`relative w-full text-center border rounded-md transition flex items-center justify-center gap-3 p-3
                        ${active
                                                    ? "shadow-md"
                                                    : "bg-white border-gray-200 hover:shadow-sm"
                                                }`}
                                            style={
                                                active
                                                    ? {
                                                        background:
                                                            "linear-gradient(180deg, #FFFFFF 29.58%, #FFCAC9 100%)",
                                                        boxShadow: "0px 0px 40px 0px #00000010",
                                                    }
                                                    : {}
                                            }
                                            aria-pressed={active}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`absolute right-0 top-0 h-full w-[5px] rounded-l ${active ? "bg-[#BB0300]" : "bg-transparent"
                                                    }`}
                                            />

                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <img
                                                    src={
                                                        s.imageUrl ||
                                                        "/placeholder.svg?height=48&width=48&query=series%20image"
                                                    }
                                                    alt={s.seriesName}
                                                    className="h-auto w-20 object-contain"
                                                />
                                                <span className="text-sm font-medium text-gray-800">
                                                    {s.seriesName}
                                                </span>
                                            </div>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </aside>




                {/* Right: Models */}
                <section className="col-span-8 md:col-span-10">
                    <div className="h-[70vh] overflow-y-auto custom-scroll">

                        {loadingModels ? (
                            <p className="text-gray-500">Loading models...</p>
                        ) : filteredModels && filteredModels.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {filteredModels.map((model) => (
                                    <Link
                                        href={`/models/${model.slug ?? model.id}`}
                                        key={model.id}
                                        className="group"
                                    >
                                        <div className="p-4 h-full gap-4 border rounded-md shadow hover:shadow-md transition text-center cursor-pointer flex flex-col items-center">
                                            <img
                                                src={
                                                    model.imageURL ||
                                                    "/placeholder.svg?height=48&width=48&query=model%20image"
                                                }
                                                alt={model.name}
                                                className="h-16 w-16 object-contain"
                                            />
                                            <p className="font-medium mt-2 text-xs sm:text-sm text-gray-800 group-hover:text-gray-900 text-center">
                                                {model.name}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No models found.</p>
                        )}
                    </div>
                </section>
            </div>

            {/* Scoped Custom Scrollbar Styles */}
            <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }


        /* Firefox support */
        .custom-scroll {
          scrollbar-width: thin;
          
        }
      `}</style>
        </main>
    )
}
