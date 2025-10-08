// Path: src/lib/firestore/return_requests/write.jsx
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function updateReturnRequestStatus({ id, status }) {
    try {
        if (!id || !status) {
            throw new Error("ID and status are required");
        }
        const ref = doc(db, "return_requests", id);
        await updateDoc(ref, {
            status,
            timestampStatusUpdate: serverTimestamp(),
        });
    } catch (error) {
        throw error;
    }
}