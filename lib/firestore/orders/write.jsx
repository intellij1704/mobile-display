// lib/firestore/orders/write.jsx

import { db } from "@/lib/firebase";
import { doc, Timestamp, updateDoc, addDoc, collection } from "firebase/firestore";

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
};

export const createCancelRequest = async ({ orderId, userId, reason, reason_remarks }) => {
    const data = {
        orderId,
        userId,
        reason,
        ...(reason_remarks && { reason_remarks }),
        status: "pending",
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, "cancel_requests"), data);
    await updateDoc(doc(db, "orders", orderId), {
        cancelRequestId: docRef.id,
    });
    return docRef.id;
};

export const approveCancelRequest = async ({ id, orderId }) => {
    await updateDoc(doc(db, "cancel_requests", id), {
        status: "approved",
        approvedAt: Timestamp.now(),
    });
    await updateOrderStatus({ id: orderId, status: "cancelled" });
};

export const rejectCancelRequest = async ({ id }) => {
    await updateDoc(doc(db, "cancel_requests", id), {
        status: "rejected",
    });
};