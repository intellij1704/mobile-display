// Path: src/lib/firestore/return_requests/read.jsx
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
        ["return_requests", id],
        ([path, id], { next }) => {
            if (!id) return;

            const ref = doc(db, `${path}/${id}`);
            const unsub = onSnapshot(
                ref,
                (snapshot) => next(null, snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
                (err) => next(err, null)
            );
            return () => unsub();
        }
    );

    return {
        data,
        error,
        isLoading: data === undefined && !error,
    };
}

export function useReturnRequests({ orderId }) {
    const { data, error } = useSWRSubscription(
        ["return_requests", orderId],
        ([path, orderId], { next }) => {
            const ref = query(
                collection(db, path),
                where("orderId", "==", orderId),
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
                (err) => next(err, [])
            );

            return () => unsub();
        }
    );

    if (error) {
        console.log(error?.message);
    }

    return { data, error: error?.message, isLoading: data === undefined };
}

export function useAllReturnRequests({ pageLimit, lastSnapDoc }) {
    const { data, error } = useSWRSubscription(
        ["return_requests", pageLimit, lastSnapDoc],
        ([path, pageLimit, lastSnapDoc], { next }) => {
            const ref = collection(db, path);
            let q = query(
                ref,
                limit(pageLimit ?? 10),
                orderBy("timestamp", "desc")
            );

            if (lastSnapDoc) {
                q = query(q, startAfter(lastSnapDoc));
            }

            const unsub = onSnapshot(
                q,
                (snapshot) =>
                    next(null, {
                        list:
                            snapshot.docs.length === 0
                                ? []
                                : snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() })),
                        lastSnapDoc:
                            snapshot.docs.length === 0
                                ? null
                                : snapshot.docs[snapshot.docs.length - 1],
                    }),
                (err) => next(err, null)
            );
            return () => unsub();
        }
    );

    return {
        data: data?.list,
        lastSnapDoc: data?.lastSnapDoc,
        error: error?.message,
        isLoading: data === undefined,
    };
}