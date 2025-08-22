import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
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
      variantImages: snap.data()?.variantImages || {},
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
export const getNewArrivalProducts = async (limitCount = 10) => {
  try {
    const list = await getDocs(
      query(
        collection(db, "products"),
        where("isNewArrival", "==", true),
        orderBy("timestampCreate", "desc"),
        limit(limitCount)
      )
    );
    return list.docs.map((snap) => ({
      id: snap.id,
      ...snap.data(),
    }));
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
};

// ✅ Get all products
export const getProducts = async () => {
  try {
    const list = await getDocs(
      query(collection(db, "products"), orderBy("timestampCreate", "desc"))
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

// ✅ Get products by category
export const getProductsByCategory = async ({ categoryId }) => {
  try {
    const list = await getDocs(
      query(
        collection(db, "products"),
        where("categoryId", "==", categoryId),
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
