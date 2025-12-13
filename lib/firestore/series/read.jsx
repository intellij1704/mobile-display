"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, onSnapshot, where, getDocs } from "firebase/firestore"
import { getCategory } from "@/lib/firestore/categories/read_server"
import { getBrand } from "@/lib/firestore/brands/read_server"

// ✅ shared enrichment function
const enrichSeries = async (series) => {
  let categoryName = "Unknown"
  let brandName = "Unknown"

  try {
    if (series.categoryId) {
      const category = await getCategory({ id: series.categoryId })
      categoryName = category?.name || "Unknown"
    }
  } catch (err) {
    console.warn(`Category fetch failed for series ${series.id}:`, err?.message)
  }

  try {
    if (series.brandId) {
      const brand = await getBrand({ id: series.brandId })
      brandName = brand?.name || "Unknown"
    }
  } catch (err) {
    console.warn(`Brand fetch failed for series ${series.id}:`, err?.message)
  }

  return {
    ...series,
    imageUrl: series.imageUrl || null,   // ✅ enforce imageUrl field
    imagePath: series.imagePath || null, // ✅ enforce imagePath field
    categoryName,
    brandName,
  }
}

// ✅ Get single series by Slug
export async function getSeriesBySlug(slug) {
  try {
    if (!slug) throw new Error("Slug is required")

    const q = query(collection(db, "series"), where("slug", "==", slug))
    const snapshot = await getDocs(q)

    if (snapshot.empty) throw new Error("Series not found")
    const doc = snapshot.docs[0]
    return await enrichSeries({ id: doc.id, ...doc.data() })
  } catch (error) {
    throw new Error("Failed to fetch series: " + error.message)
  }
}

// ✅ Hook: fetch all series
export const useSeries = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    const q = query(collection(db, "series"))

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const seriesList = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))

          const enriched = await Promise.all(seriesList.map(enrichSeries))
          setData(enriched)
          setError(null)
        } catch (err) {
          console.error("Error enriching series:", err)
          setError(err?.message || "Failed to fetch series")
          setData([])
        } finally {
          setIsLoading(false)
        }
      },
      (err) => {
        console.error("Snapshot error:", err)
        setError(err?.message || "Failed to fetch series")
        setIsLoading(false)
        setData([])
      },
    )

    return () => unsubscribe()
  }, [])

  return { data, isLoading, error }
}

// ✅ Hook: fetch series by slug
export const useSeriesBySlug = (slug) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) {
      setData(null)
      setIsLoading(false)
      return
    }

    const fetchSeries = async () => {
      setIsLoading(true)
      try {
        const series = await getSeriesBySlug(slug)
        setData(series)
        setError(null)
      } catch (err) {
        setError(err.message || "Failed to fetch series")
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSeries()
  }, [slug])

  return { data, isLoading, error }
}

// ✅ Hook: fetch series by brand
export const useSeriesByBrand = (brandId) => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!brandId) {
      setData([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const q = query(collection(db, "series"), where("brandId", "==", brandId))

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const seriesList = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))

          const enriched = await Promise.all(seriesList.map(enrichSeries))
          setData(enriched)
          setError(null)
        } catch (err) {
          console.error("Error fetching series by brand:", err)
          setError(err?.message || "Failed to fetch series")
          setData([])
        } finally {
          setIsLoading(false)
        }
      },
      (err) => {
        console.error("Snapshot error:", err)
        setError(err?.message || "Failed to fetch series")
        setIsLoading(false)
        setData([])
      },
    )

    return () => unsubscribe()
  }, [brandId])

  return { data, isLoading, error }
}
