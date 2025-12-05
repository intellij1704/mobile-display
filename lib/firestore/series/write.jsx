import { db, storage } from "@/lib/firebase"
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { ref, deleteObject } from "firebase/storage"

const isSeriesNameExists = async (seriesName, brandId, currentId = null) => {
  const trimmedName = seriesName.trim()
  const seriesRef = collection(db, "series")
  const q = query(
    seriesRef,
    where("brandId", "==", brandId),
    where("seriesName_lowercase", "==", trimmedName.toLowerCase()),
  )

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return false
  }

  if (currentId) {
    // For updates, check if the found series is a different one
    return querySnapshot.docs.some(doc => doc.id !== currentId)
  }

  return !querySnapshot.empty
}

export const createNewSeries = async ({ data }) => {
  try {
    if (!data.seriesName || !data.brandId) {
      throw new Error("Series name and brand are required")
    }
    const nameExists = await isSeriesNameExists(data.seriesName, data.brandId)
    if (nameExists) {
      throw new Error(`Series with name "${data.seriesName.trim()}" already exists for this brand.`)
    }
    const now = serverTimestamp()
    const seriesData = {
      seriesName: data.seriesName.trim(),
      seriesName_lowercase: data.seriesName.trim().toLowerCase(),
      brandId: data.brandId,
      categoryId: data.categoryId || null,
      imageUrl: data.imageUrl || null,
      imagePath: data.imagePath || null,
      createdAt: now,
      updatedAt: now,
    }
    const docRef = await addDoc(collection(db, "series"), seriesData)
    return docRef.id
  } catch (error) {
    console.error("Error creating series:", error)
    throw new Error((error && error.message) || "Failed to create series")
  }
}

export const batchCreateSeries = async (brandId, seriesList, imageEntries = []) => {
  try {
    if (!brandId) throw new Error("Brand ID is required")
    if (!seriesList || seriesList.length === 0) throw new Error("At least one series name is required")

    const now = serverTimestamp()
    const tasks = seriesList.map((seriesName, idx) => {
      const img = imageEntries[idx] || {}
      const seriesData = {
        seriesName: seriesName.trim(),
        seriesName_lowercase: seriesName.trim().toLowerCase(),
        brandId,
        categoryId: null,
        imageUrl: img.imageUrl || null,
        imagePath: img.imagePath || null,
        createdAt: now,
        updatedAt: now,
      }
      return addDoc(collection(db, "series"), seriesData)
    })

    await Promise.all(tasks)
    return seriesList.length
  } catch (error) {
    console.error("Error batch creating series:", error)
    throw new Error((error && error.message) || "Failed to batch create series")
  }
}

export const deleteSeries = async ({ id, imagePath }) => {
  try {
    if (!id) throw new Error("Series ID is required")
    const docRef = doc(db, "series", id)
    await deleteDoc(docRef)

    if (imagePath) {
      try {
        await deleteObject(ref(storage, imagePath))
      } catch (err) {
        console.warn("Failed to delete series image from storage:", err?.message)
      }
    }

    return id
  } catch (error) {
    console.error("Error deleting series:", error)
    throw new Error((error && error.message) || "Failed to delete series")
  }
}

export const updateSeries = async ({ id, data }) => {
  try {
    if (!id) throw new Error("Series ID is required")
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Update data is required")
    }

    if (data.seriesName && data.brandId) {
      const nameExists = await isSeriesNameExists(data.seriesName, data.brandId, id)
      if (nameExists) {
        throw new Error(`Another series with name "${data.seriesName.trim()}" already exists for this brand.`)
      }
    }

    const seriesRef = doc(db, "series", id)
    const updatedData = {
      ...data,
      updatedAt: serverTimestamp(),
    }
    if (updatedData.seriesName) {
      updatedData.seriesName_lowercase = updatedData.seriesName.trim().toLowerCase()
    }
    await updateDoc(seriesRef, updatedData)
    return id
  } catch (error) {
    console.error("Error updating series:", error)
    throw new Error((error && error.message) || "Failed to update series")
  }
}
