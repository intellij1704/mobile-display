// Path: src/lib/firestore/products/read.js
"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  startAfter,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import useSWRSubscription from "swr/subscription";

// ------------------- GET MULTIPLE PRODUCTS -------------------
export function useProducts({ pageLimit, lastSnapDoc, status }) {
  const { data, error } = useSWRSubscription(
    ["products", pageLimit, lastSnapDoc, status],
    ([path, pageLimit, lastSnapDoc, status], { next }) => {
      const ref = collection(db, path);
      let q = query(ref);
      if (status && status !== 'all') {
        q = query(q, where("status", "==", status));
      }
      q = query(q, limit(pageLimit ?? 10));

      if (lastSnapDoc) {
        q = query(q, startAfter(lastSnapDoc));
      }

      const unsub = onSnapshot(
        q,
        (snapshot) =>
          next(null, {
            list:
              snapshot.docs.length === 0
                ? null
                : snapshot.docs.map((snap) => ({
                  id: snap.id,
                  ...snap.data(),
                  variations:
                    snap.data().variations?.map((v) => ({
                      ...v,
                      id: v.id || doc(collection(db, "products")).id,
                    })) || [],
                  seoSlug: snap.data().seoSlug || "",
                  seoDescription: snap.data().seoDescription || "",
                  seoKeywords: snap.data().seoKeywords || [],
                  schemaData: snap.data().schemaData || {},
                  sku: snap.data().sku || "",
                })),
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
    data: data?.list || [],
    lastSnapDoc: data?.lastSnapDoc,
    error: error?.message,
    isLoading: data === undefined,
  };
}

// ------------------- GET SINGLE PRODUCT -------------------
export function useProduct({ productId }) {
  const { data, error } = useSWRSubscription(
    ["products", productId],
    ([path, productId], { next }) => {
      const ref = doc(db, `${path}/${productId}`);

      const unsub = onSnapshot(
        ref,
        (snapshot) =>
          next(null, {
            id: snapshot.id,
            ...snapshot.data(),
            variations:
              snapshot.data()?.variations?.map((v) => ({
                ...v,
                id: v.id || doc(collection(db, "products")).id,
              })) || [],
            seoSlug: snapshot.data()?.seoSlug || "",
            seoDescription: snapshot.data()?.seoDescription || "",
            seoKeywords: snapshot.data()?.seoKeywords || [],
            schemaData: snapshot.data()?.schemaData || {},
            sku: snapshot.data()?.sku || "",
          }),
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  return {
    data: data,
    error: error?.message,
    isLoading: data === undefined,
  };
}

// ------------------- GET MULTIPLE PRODUCTS BY IDS -------------------
export function useProductsByIds({ idsList }) {
  const { data, error } = useSWRSubscription(
    ["products", idsList],
    ([path, idsList], { next }) => {
      const ref = collection(db, path);
      const q = query(ref, where("id", "in", idsList));

      const unsub = onSnapshot(
        q,
        (snapshot) =>
          next(
            null,
            snapshot.docs.length === 0
              ? []
              : snapshot.docs.map((snap) => ({
                id: snap.id,
                ...snap.data(),
                variations:
                  snap.data().variations?.map((v) => ({
                    ...v,
                    id: v.id || doc(collection(db, "products")).id,
                  })) || [],
                seoSlug: snap.data().seoSlug || "",
                seoDescription: snap.data().seoDescription || "",
                seoKeywords: snap.data().seoKeywords || [],
                schemaData: snap.data().schemaData || {},
                sku: snap.data().sku || "",
              }))
          ),
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  return {
    data: data || [],
    error: error?.message,
    isLoading: data === undefined,
  };
}

// ------------------- SEARCH PRODUCTS -------------------
export const searchProducts = async (searchTerm) => {
  if (!searchTerm.trim()) return [];

  try {
    const ref = collection(db, "products");
    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    // ✅ Only fetch published products
    const q = query(ref, where("status", "==", "published"));
    const snapshot = await getDocs(q);

    const products = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          ...data,
          variations:
            data.variations?.map((v) => ({
              ...v,
              id: v.id || doc(collection(db, "products")).id,
            })) || [],
          seoSlug: data.seoSlug || "",
          seoDescription: data.seoDescription || "",
          seoKeywords: data.seoKeywords || [],
          schemaData: data.schemaData || {},
          sku: data.sku || "",
        };
      })
      .filter((product) =>
        [
          product.title?.toLowerCase(),
          product.shortDescription?.toLowerCase(),
          product.description?.toLowerCase(),
          product.brand?.toLowerCase(),
          product.series?.toLowerCase(),
          product.sku?.toLowerCase(),
          product.seoSlug?.toLowerCase(),
          ...(product.seoKeywords || []).map((kw) => kw.toLowerCase()),
        ].some((field) => field?.includes(lowerSearchTerm))
      );

    return products.slice(0, 10);
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};

// ------------------- GET PRODUCTS BY MODEL -------------------
export function useProductsByModelId(modelId) {
  const { data, error } = useSWRSubscription(
    modelId ? ["products-by-model", modelId] : null,
    ([_, modelId], { next }) => {
      const q = query(collection(db, "products"), where("modelId", "==", modelId), where("status", "==", "published"));
      const unsub = onSnapshot(
        q,
        (snap) =>
          next(
            null,
            snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              variations:
                doc.data().variations?.map((v) => ({
                  ...v,
                  id: v.id || doc(collection(db, "products")).id,
                })) || [],
              seoSlug: doc.data().seoSlug || "",
              seoDescription: doc.data().seoDescription || "",
              seoKeywords: doc.data().seoKeywords || [],
              schemaData: doc.data().schemaData || {},
              sku: doc.data().sku || "",
            }))
          ),
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  return {
    data: data || [],
    error: error?.message,
    isLoading: data === undefined && !!modelId,
  };
}

// ------------------- GET PRODUCTS BY BRAND, CATEGORY, MODEL -------------------
export function useProductsByFilters({ brandId, categoryId, modelId, pageLimit, lastSnapDoc }) {
  const { data, error } = useSWRSubscription(
    (brandId && categoryId && modelId) ? ["products-by-filters", brandId, categoryId, modelId, pageLimit, lastSnapDoc] : null,
    ([_path, brandId, categoryId, modelId, pageLimit, lastSnapDoc], { next }) => {
      const ref = collection(db, "products");

      if (!brandId || !categoryId || !modelId) {
        return () => { };
      }

      let q = query(
        ref,
        where("brandId", "==", brandId),
        where("categoryId", "==", categoryId),
        where("modelId", "==", modelId),
        where("status", "==", "published"),
        limit(pageLimit ?? 10)
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
                ? null
                : snapshot.docs.map((snap) => ({
                  id: snap.id,
                  ...snap.data(),
                  variations:
                    snap.data().variations?.map((v) => ({
                      ...v,
                      id: v.id || doc(collection(db, "products")).id,
                    })) || [],
                  seoSlug: snap.data().seoSlug || "",
                  seoDescription: snap.data().seoDescription || "",
                  seoKeywords: snap.data().seoKeywords || [],
                  schemaData: snap.data().schemaData || {},
                  sku: snap.data().sku || "",
                })),
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
    data: data?.list || [],
    lastSnapDoc: data?.lastSnapDoc,
    error: error?.message || (!brandId || !categoryId || !modelId ? "Missing filter parameters." : null),
    isLoading: data === undefined && !!(brandId && categoryId && modelId),
  };
}


export const usePriceUpdateHistory = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const q = query(collection(db, "price_update_history"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    }, (err) => {
      setError(err.message);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "price_update_history"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
};