// lib/firestore/specialOffers/write.jsx
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { serverTimestamp } from "firebase/firestore";

export const createSpecialOffer = async ({ data }) => {
  try {
    const newData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "specialOffers"), newData);
    return { id: docRef.id, ...newData };
  } catch (error) {
    console.error("Error creating special offer:", error);
    throw error;
  }
};

export const updateSpecialOffer = async ({ id, data }) => {
  try {
    if (!id) throw new Error("ID is required");
    const updatedData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, "specialOffers", id), updatedData);
    return { id, ...updatedData };
  } catch (error) {
    console.error("Error updating special offer:", error);
    throw error;
  }
};

export const deleteSpecialOffer = async ({ id }) => {
  try {
    if (!id) throw new Error("ID is required");
    await deleteDoc(doc(db, "specialOffers", id));
  } catch (error) {
    console.error("Error deleting special offer:", error);
    throw error;
  }
};

export const toggleSpecialOfferStatus = async ({ id, status }) => {
  try {
    if (!id) throw new Error("ID is required");
    await updateDoc(doc(db, "specialOffers", id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error toggling special offer status:", error);
    throw error;
  }
};