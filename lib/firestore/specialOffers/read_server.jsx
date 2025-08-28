// lib/firestore/specialOffers/read_server.jsx
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const getSpecialOffersServer = async () => {
  try {
    const q = query(collection(db, "specialOffers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching special offers:", error);
    throw error;
  }
};

export const getSpecialOffer = async ({ id }) => {
  try {
    if (!id) return null;
    const docRef = doc(db, "specialOffers", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching special offer:", error);
    throw error;
  }
};