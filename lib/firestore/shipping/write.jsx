// lib/firestore/shippingSettings/write.jsx
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { serverTimestamp } from "firebase/firestore";

export const createShippingSettings = async ({ data }) => {
  try {
    const id = "global";
    const newData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "shippingSettings", id), newData);
    return { id, ...newData };
  } catch (error) {
    console.error("Error creating shipping settings:", error);
    throw error;
  }
};

export const updateShippingSettings = async ({ data }) => {
  try {
    const id = "global";
    const updatedData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, "shippingSettings", id), updatedData);
    return { id, ...updatedData };
  } catch (error) {
    console.error("Error updating shipping settings:", error);
    throw error;
  }
};