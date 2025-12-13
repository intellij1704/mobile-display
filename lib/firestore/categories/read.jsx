// lib/firestore/categories/read.js
"use client";

import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import useSWRSubscription from "swr/subscription";


export function useCategories() {
  const { data, error } = useSWRSubscription(["categories"], ([path], { next }) => {
    const ref = collection(db, path)
    const unsub = onSnapshot(
      ref,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        const map = new Map(list.map((cat) => [cat.id, cat]))
        next(null, { list, map })
      },
      (err) => next(err, null),
    )
    return () => unsub()
  })

  return {
    data: data?.list ?? [],
    categoriesList: data?.list ?? [],
    categoriesMap: data?.map ?? new Map(),
    isLoading: data === undefined,
    error: error?.message,
  }
}



export function useCategoryById(categoryId) {
  const { data, error } = useSWRSubscription(
    ["categories", categoryId],
    ([path, categoryId], { next }) => {
      const ref = doc(db, `${path}/${categoryId}`);

      const unsub = onSnapshot(
        ref,
        (snapshot) =>
          next(null, {
            id: snapshot.id,
            ...snapshot.data(),
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

export function useCategoryBySlug(slug) {
  const { data, error } = useSWRSubscription(
    slug ? ["categories", slug] : null,
    ([path, slugValue], { next }) => {
      const q = query(collection(db, path), where("slug", "==", slugValue));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            next(null, null);
          } else {
            const doc = snapshot.docs[0];
            next(null, { id: doc.id, ...doc.data() });
          }
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  return {
    data: data,
    error: error?.message,
    isLoading: data === undefined && !!slug,
  };
}