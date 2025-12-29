import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  collection as col, // Alias collection to avoid conflict
  getDocs,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";

/* ---------------------------------------------
   Helper: convert PNG/JPG → AVIF
--------------------------------------------- */
const toAvif = (url) => {
  if (!url || typeof url !== "string") return url;
  return url.replace(/\.(png|jpg|jpeg)(\?.*)?$/i, ".avif$2");
};

/* ---------------------------------------------
   Normalize product document
--------------------------------------------- */
const normalizeProduct = (snap) => {
  const data = snap.data();

  return {
    id: snap.id,

    // spread base fields EXCEPT images
    ...data,

    // ✅ MAIN IMAGE
    featureImageURL: toAvif(data?.featureImageURL),

    // ✅ IMAGE GALLERY
    imageList: (data?.imageList || [])
      .map(toAvif)
      .filter(Boolean),

    // ✅ VARIATIONS
    variations: (data?.variations || []).map((v) => ({
      ...v,
      id: v.id || doc(collection(db, "products")).id,
      imageURLs: (v.imageURLs || []).map(toAvif),
    })),

    // ✅ QUALITIES
    qualities: data?.qualities || [],
  };
};

/* ---------------------------------------------
   Get single product
--------------------------------------------- */
export const getProduct = async ({ id, seoSlug }) => {
  try {
    let snap;

    if (seoSlug) {
      const list = await getDocs(
        query(
          collection(db, "products"),
          where("seoSlug", "==", seoSlug),
          where("status", "==", "published"),
          limit(1)
        )
      );
      if (list.empty) return null;
      snap = list.docs[0];
    } else if (id) {
      const docSnap = await getDoc(doc(db, "products", id));
      if (!docSnap.exists()) return null;
      snap = docSnap;
    } else {
      throw new Error("Either id or seoSlug must be provided");
    }

    return normalizeProduct(snap);
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

// ✅ Get best-selling products
export const getBestSellingProducts = async (limitCount = 10) => {
  try {
    const list = await getDocs(
      query(
        collection(db, "products"),
        where("bestSelling", "==", true),
        where("status", "==", "published"),
        orderBy("timestampCreate", "desc"),
        limit(limitCount)
      )
    );
    return list.docs.map((snap) => ({
      id: snap.id,
      ...snap.data(),
    }));
  } catch (error) {
    console.error("Error fetching best selling products:", error);
    return [];
  }
};

// ✅ Get new arrivals
export const getTopPickProducts = async (limitCount = 10) => {
  try {
    const list = await getDocs(
      query(
        collection(db, "products"),
        where("isTopPick", "==", true),
        where("status", "==", "published"),
        orderBy("timestampCreate", "desc"),
        limit(limitCount)
      )
    );
    return list.docs.map((snap) => ({
      id: snap.id,
      ...snap.data(),
    }));
  } catch (error) {
    console.error("Error fetching Top:", error);
    return [];
  }
};

// ✅ Get all products
export const getProducts = async () => {
  try {
    const list = await getDocs(
      query(
        collection(db, "products"),
        where("status", "==", "published"),
        orderBy("timestampCreate", "desc")
      )
    );
    return list.docs.map((snap) => ({
      id: snap.id,
      ...snap.data(),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// ✅ Get all products for the admin panel (includes drafts)
export const getAllProductsForAdmin = async () => {
  try {
    const list = await getDocs(
      query(collection(db, "products"), orderBy("timestampCreate", "desc"))
    );
    return list.docs.map((snap) => ({
      id: snap.id,
      ...snap.data(),
    }));
  } catch (error) {
    console.error("Error fetching all products for admin:", error);
    return [];
  }
};

// ✅ Get products by category
export const getProductsByCategory = async ({ categoryId }) => {
  try {
    const list = await getDocs(
      query(
        collection(db, "products"),
        where("categoryId", "==", categoryId),
        where("status", "==", "published"),
        orderBy("timestampCreate", "desc")
      )
    );
    return list.docs.map((snap) => ({
      id: snap.id,
      ...snap.data(),
    }));
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};
