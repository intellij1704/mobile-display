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
} from "firebase/firestore";
import useSWRSubscription from "swr/subscription";

// ------------------- GET MULTIPLE PRODUCTS -------------------
export function useProducts({ pageLimit, lastSnapDoc }) {
  const { data, error } = useSWRSubscription(
    ["products", pageLimit, lastSnapDoc],
    ([path, pageLimit, lastSnapDoc], { next }) => {
      const ref = collection(db, path);
      let q = query(ref, limit(pageLimit ?? 10));

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
                  variantImages: snap.data().variantImages || {},
                  qualities: snap.data().qualities || [],
                  // ✅ SEO Fields
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
            variantImages: snapshot.data()?.variantImages || {},
            qualities: snapshot.data()?.qualities || [],
            // ✅ SEO Fields
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
                variantImages: snap.data().variantImages || {},
                qualities: snap.data().qualities || [],
                // ✅ SEO Fields
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

    const q = query(ref);
    const snapshot = await getDocs(q);

    const products = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        variantImages: doc.data().variantImages || {},
        qualities: doc.data().qualities || [],
        // ✅ SEO Fields
        seoSlug: doc.data().seoSlug || "",
        seoDescription: doc.data().seoDescription || "",
        seoKeywords: doc.data().seoKeywords || [],
        schemaData: doc.data().schemaData || {},
        sku: doc.data().sku || "",
      }))
      .filter((product) =>
        [
          product.title?.toLowerCase(),
          product.shortDescription?.toLowerCase(),
          product.description?.toLowerCase(),
          product.brand?.toLowerCase(),
          product.series?.toLowerCase(),
          product.sku?.toLowerCase(), // ✅ SKU Search
          product.seoSlug?.toLowerCase(), // ✅ Slug Search
          ...(product.seoKeywords || []).map((kw) => kw.toLowerCase()), // ✅ Keywords Search
          ...(product.colors || []).map((color) => color.toLowerCase()),
          ...(product.qualities || []).map((quality) => quality.toLowerCase()),
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
    ["products-by-model", modelId],
    ([_, modelId], { next }) => {
      const q = query(collection(db, "products"), where("modelId", "==", modelId));
      const unsub = onSnapshot(
        q,
        (snap) =>
          next(
            null,
            snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              variantImages: doc.data().variantImages || {},
              qualities: doc.data().qualities || [],
              // ✅ SEO Fields
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
    isLoading: data === undefined,
  };
}

// ------------------- GET PRODUCTS BY BRAND, CATEGORY, SERIES, MODEL -------------------
export function useProductsByFilters({ brandId, categoryId, seriesId, modelId, pageLimit, lastSnapDoc }) {
  const { data, error } = useSWRSubscription(
    ["products-by-filters", brandId, categoryId, seriesId, modelId, pageLimit, lastSnapDoc],
    ([path, brandId, categoryId, seriesId, modelId, pageLimit, lastSnapDoc], { next }) => {
      const ref = collection(db, "products");
      let q = query(
        ref,
        where("brandId", "==", brandId),
        where("categoryId", "==", categoryId),
        where("seriesId", "==", seriesId),
        where("modelId", "==", modelId),
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
                  variantImages: snap.data().variantImages || {},
                  qualities: snap.data().qualities || [],
                  // ✅ SEO Fields
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