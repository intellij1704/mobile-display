import { db } from "@/lib/firebase";
import { doc, Timestamp, updateDoc } from "firebase/firestore";

export const updateOrderStatus = async ({ id, status }) => {
    await updateDoc(doc(db, `orders/${id}`), {
        status: status,
        timestampStatusUpdate: Timestamp.now(),
    });
};

export const updateOrderAddress = async ({ id, address }) => {
    await updateDoc(doc(db, `orders/${id}`), {
        "checkout.metadata.address": JSON.stringify(address),
        timestampStatusUpdate: Timestamp.now(),
    });
}