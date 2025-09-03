"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, onSnapshot, where } from "firebase/firestore"
import { getCategory } from "@/lib/firestore/categories/read_server"
import { getBrand } from "@/lib/firestore/brands/read_server"

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

          const enrichedSeries = await Promise.all(
            seriesList.map(async (series) => {
              let categoryName = "Unknown"
              let brandName = "Unknown"

              try {
                if (series.categoryId) {
                  const category = await getCategory({ id: series.categoryId })
                  categoryName = (category && category.name) || "Unknown"
                }
              } catch (err) {
                console.warn(`Failed to fetch category for series ${series.id}:`, err?.message)
              }

              try {
                if (series.brandId) {
                  const brand = await getBrand({ id: series.brandId })
                  brandName = (brand && brand.name) || "Unknown"
                }
              } catch (err) {
                console.warn(`Failed to fetch brand for series ${series.id}:`, err?.message)
              }

              return {
                ...series,
                categoryName,
                brandName,
              }
            }),
          )

          setData(enrichedSeries)
          setError(null)
        } catch (err) {
          console.error("Error enriching series data:", err)
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
          setData(seriesList)
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
