import { db, storage } from "@/lib/firebase"
import { collection, doc, addDoc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, deleteObject } from "firebase/storage"

export const createNewSeries = async ({ data }) => {
  try {
    if (!data.seriesName || !data.brandId) {
      throw new Error("Series name and brand are required")
    }
    const now = serverTimestamp()
    const seriesData = {
      seriesName: data.seriesName.trim(),
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
    const seriesRef = doc(db, "series", id)
    const updatedData = {
      ...data,
      updatedAt: serverTimestamp(),
    }
    if (updatedData.seriesName) {
      updatedData.seriesName = updatedData.seriesName.trim()
    }
    await updateDoc(seriesRef, updatedData)
    return id
  } catch (error) {
    console.error("Error updating series:", error)
    throw new Error((error && error.message) || "Failed to update series")
  }
}
