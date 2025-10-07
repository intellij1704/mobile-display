import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

/**
 * Get all models
 */
export const getAllModels = async () => {
  const snapshot = await getDocs(collection(db, "models"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get models by brand & series
 */
export const getModelsBySeries = async (brandId, seriesId) => {
  if (!brandId || !seriesId) return [];
  const q = query(
    collection(db, "models"),
    where("brandId", "==", brandId),
    where("seriesId", "==", seriesId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get model by ID
 */
export const getModel = async ({ id }) => {
  if (!id) throw new Error("Model ID is required");
  const docRef = doc(db, "models", id);
  const modelDoc = await getDoc(docRef);
  if (modelDoc.exists()) {
    return { id: modelDoc.id, ...modelDoc.data() };
  }
  return null;
};
