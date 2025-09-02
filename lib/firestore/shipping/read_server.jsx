// lib/firestore/shippingSettings/read_server.jsx
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const getShippingSettings = async () => {
    try {
        const id = "global";
        const docRef = doc(db, "shippingSettings", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching shipping settings:", error);
        throw error;
    }
};