import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export const getSeries = async ({ id }) => {
  try {
    if (!id) throw new Error("Series ID is required")

    const docRef = doc(db, "series", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error("Error fetching series:", error)
    throw new Error(error?.message || "Failed to fetch series")
  }
}
