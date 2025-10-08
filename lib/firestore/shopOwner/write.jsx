"use client"

import { db, storage } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"

export const addShopOwner = async (formData) => {
  try {
    const imageUrls = []
    const allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/gif"]
    const maxFileSize = 10 * 1024 * 1024 // 10MB

    // Validate and process images
    for (const image of formData.images) {
      // Check file type
      if (!allowedFormats.includes(image.file.type)) {
        throw new Error(`Unsupported file format for ${image.file.name}. Supported formats: PNG, JPEG, WEBP, GIF`)
      }

      // Check file size
      if (image.file.size > maxFileSize) {
        throw new Error(`File ${image.file.name} exceeds 10MB limit`)
      }

      // Extract extension from mime type
      const ext = image.file.type.split("/")[1] || "jpg"
      const fileName = `${Date.now()}_${uuidv4()}.${ext}`
      const imageRef = ref(storage, `shopOwners/${fileName}`)

      // Upload with proper contentType
      await uploadBytes(imageRef, image.file, {
        contentType: image.file.type,
      })

      const url = await getDownloadURL(imageRef)
      imageUrls.push(url)
    }

    // Save shop owner data to Firestore
    const docRef = await addDoc(collection(db, "shopOwners"), {
      name: formData.name.trim(),
      city: formData.city.trim(),
      mobile: formData.mobile.trim(),
      images: imageUrls,
      createdAt: serverTimestamp(),
    })

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error adding shop owner:", error.message)
    return { success: false, error: error.message }
  }
}

export const deleteShopOwner = async (id) => {
  try {
    const docRef = doc(db, "shopOwners", id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error("Shop owner not found")
    }

    const data = docSnap.data()

    // Delete associated images from storage if they exist
    if (data.images && data.images.length > 0) {
      for (const url of data.images) {
        const imageRef = ref(storage, url)
        await deleteObject(imageRef)
      }
    }

    // Delete the Firestore document
    await deleteDoc(docRef)

    return { success: true }
  } catch (error) {
    console.error("Error deleting shop owner:", error.message)
    return { success: false, error: error.message }
  }
}