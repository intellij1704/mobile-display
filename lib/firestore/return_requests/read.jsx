"use client";
import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    startAfter,
    where,
} from "firebase/firestore";
import useSWRSubscription from "swr/subscription";

export function useReturnRequest({ id }) {
    const { data, error } = useSWRSubscription(
        id ? ["return_requests", id] : null,
        ([path, currentId], { next }) => {
            if (!currentId) return () => {};
            const ref = doc(db, `${path}/${currentId}`);
            const unsub = onSnapshot(
                ref,
                (snapshot) => next(null, snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
                (err) => next(err, null)
            );
            return () => unsub();
        }
    );
    if (error) {
        console.log(error?.message);
    }
    return {
        data,
        error: error?.message,
        isLoading: id && data === undefined && !error,
    };
}

export function useReturnRequests({ orderId }) {
    const { data, error } = useSWRSubscription(
        orderId ? ["return_requests", orderId] : null,
        ([path, currentOrderId], { next }) => {
            if (!currentOrderId) return () => {};
            const ref = query(
                collection(db, path),
                where("orderId", "==", currentOrderId),
                orderBy("timestamp", "desc")
            );
            const unsub = onSnapshot(
                ref,
                (snapshot) =>
                    next(
                        null,
                        snapshot.docs.length === 0
                            ? []
                            : snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }))
                    ),
                (err) => next(err, null)
            );
            return () => unsub();
        }
    );
    if (error) {
        console.log(error?.message);
    }
    return { data, error: error?.message, isLoading: orderId && data === undefined && !error };
}

export function useAllReturnRequests({ pageLimit = 10, lastSnapDoc, status }) {
    const key = status === "all" ? ["return_requests", pageLimit, lastSnapDoc] : ["return_requests", pageLimit, lastSnapDoc, status];
    const { data, error } = useSWRSubscription(
        key,
        ([path, currentPageLimit, currentLastSnapDoc, currentStatus], { next }) => {
            const ref = collection(db, path);
            let q = query(
                ref,
                orderBy("timestamp", "desc"),
                limit(currentPageLimit)
            );
            if (currentStatus && currentStatus !== "all") {
                q = query(q, where("status", "==", currentStatus));
            }
            if (currentLastSnapDoc) {
                q = query(q, startAfter(currentLastSnapDoc));
            }
            const unsub = onSnapshot(
                q,
                (snapshot) =>
                    next(null, {
                        list: snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() })),
                        lastSnapDoc: snapshot.docs[snapshot.docs.length - 1] || null,
                    }),
                (err) => next(err, null)
            );
            return () => unsub();
        }
    );
    if (error) {
        console.log(error?.message);
    }
    return {
        data: data?.list || [],
        lastSnapDoc: data?.lastSnapDoc,
        error: error?.message,
        isLoading: data === undefined && !error,
    };
}

export function useUserReturnRequests({ uid }) {
  const { data, error } = useSWRSubscription(
    uid ? ["return_requests", uid] : null,
    ([path, currentUid], { next }) => {
      if (!currentUid) return () => {};
      const ref = query(
        collection(db, path),
        where("userId", "==", currentUid),
        orderBy("timestamp", "desc")
      );
      const unsub = onSnapshot(
        ref,
        (snapshot) =>
          next(
            null,
            snapshot.docs.length === 0
              ? []
              : snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }))
          ),
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );
  if (error) {
    console.log(error?.message);
  }
  return { data, error: error?.message, isLoading: uid && data === undefined && !error };
}