"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"

export const useShopOwners = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const q = query(collection(db, "shopOwners"), orderBy("createdAt", "desc"))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setData(list)
        setLoading(false)
      })
      return () => unsubscribe()
    } catch (err) {
      console.error(err)
      setError(err)
      setLoading(false)
    }
  }, [])

  return { data, loading, error }
}
