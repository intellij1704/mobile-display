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

// ✅ Get single product by ID or seoSlug (seoSlug takes priority)
export const getProduct = async ({ id, seoSlug }) => {
  try {
    let snap;

    if (seoSlug) {
      // Fetch by seoSlug
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
      // Fetch by id
      snap = await getDoc(doc(db, `products/${id}`));
      if (!snap.exists()) return null;
    } else {
      throw new Error("Either id or seoSlug must be provided");
    }

    return {
      id: snap.id,
      ...snap.data(),
      variations:
        snap.data()?.variations?.map((v) => ({
          ...v,
          id: v.id || doc(col(db, "products")).id,
        })) || [],
      qualities: snap.data()?.qualities || [],
    };
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
