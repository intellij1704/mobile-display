// Path: src/lib/firestore/products/write.js
import { db, storage } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// ✅ Create Product
export const createNewProduct = async ({ data, featureImage, imageList, variantImages }) => {
  if (!data?.title) throw new Error("Title is required");
  if (!featureImage) throw new Error("Feature Image is required");
  if (data?.isVariable) {
    if (!data?.variations || data?.variations.length === 0)
      throw new Error("Variations are required for variable products");
  } else {
    if (!data?.price) throw new Error("Price is required for simple products");
  }

  // Upload feature image
  const featureImageRef = ref(storage, `products/${featureImage?.name}`);
  await uploadBytes(featureImageRef, featureImage);
  const featureImageURL = await getDownloadURL(featureImageRef);

  // Upload gallery images
  let imageURLList = [];
  for (const image of imageList || []) {
    const imageRef = ref(storage, `products/${image?.name}`);
    await uploadBytes(imageRef, image);
    const url = await getDownloadURL(imageRef);
    imageURLList.push(url);
  }

  if (imageURLList.length === 0) throw new Error("At least one product image is required");

  // Handle variations
  if (data?.isVariable) {
    data.variations = data.variations ?? [];
    for (const varr of data.variations) {
      let imgURLs = [];
      for (const image of variantImages[varr.id] || []) {
        const imageRef = ref(storage, `products/${varr.id}_${image?.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imgURLs.push(url);
      }
      varr.imageURLs = imgURLs;
    }
    data.price = null;
    data.salePrice = null;
  } else {
    data.attributes = [];
    data.variations = [];
  }

  const generatedSlug = data?.title?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Generate a unique 5-digit ID
  let newId;
  let isUnique = false;
  while (!isUnique) {
    const randomId = Math.floor(10000 + Math.random() * 90000).toString();
    const productRef = doc(db, 'products', randomId);
    const docSnap = await getDoc(productRef);
    if (!docSnap.exists()) {
      newId = randomId;
      isUnique = true;
    }
  }

  await setDoc(doc(db, `products/${newId}`), {
    ...data,
    seoSlug: data?.seoSlug || generatedSlug,
    seoDescription: data?.seoDescription || "",
    seoKeywords: data?.seoKeywords || [],
    sku: data?.sku || "",
    featureImageURL,
    featureImageAlt: data?.featureImageAlt || "",
    imageList: imageURLList,
    id: newId,
    timestampCreate: Timestamp.now(),
  });
};

// ✅ Update Product
export const updateProduct = async ({ data, featureImage, imageList, variantImages }) => {
  if (!data?.title) throw new Error("Title is required");
  if (!data?.id) throw new Error("ID is required");
  if (data?.isVariable) {
    if (!data?.variations || data?.variations.length === 0)
      throw new Error("Variations are required for variable products");
  } else {
    if (!data?.price) throw new Error("Price is required for simple products");
  }

  // Feature image update
  let featureImageURL = data?.featureImageURL ?? null;
  if (featureImage) {
    const featureImageRef = ref(storage, `products/${featureImage?.name}`);
    await uploadBytes(featureImageRef, featureImage);
    featureImageURL = await getDownloadURL(featureImageRef);
  }
  if (!featureImageURL) throw new Error("Feature Image is required");

  // Image list update
  let imageURLList = data?.imageList ?? [];
  for (const image of imageList || []) {
    const imageRef = ref(storage, `products/${image?.name}`);
    await uploadBytes(imageRef, image);
    const url = await getDownloadURL(imageRef);
    imageURLList.push(url);
  }

  if (imageURLList.length === 0) throw new Error("At least one product image is required");

  // Handle variations
  if (data?.isVariable) {
    data.variations = data.variations ?? [];
    for (const varr of data.variations) {
      let imgURLs = varr.imageURLs ?? [];
      for (const image of variantImages[varr.id] || []) {
        const imageRef = ref(storage, `products/${varr.id}_${image?.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imgURLs.push(url);
      }
      varr.imageURLs = imgURLs;
    }
    data.price = null;
    data.salePrice = null;
  } else {
    data.attributes = [];
    data.variations = [];
  }

  const generatedSlug = data?.title?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  await setDoc(doc(db, `products/${data?.id}`), {
    ...data,
    seoSlug: data?.seoSlug || generatedSlug,
    seoDescription: data?.seoDescription || "",
    seoKeywords: data?.seoKeywords || [],
    sku: data?.sku || "",
    featureImageURL,
    featureImageAlt: data?.featureImageAlt || "",
    imageList: imageURLList,
    timestampUpdate: Timestamp.now(),
  });
};

// ✅ Delete Product
export const deleteProduct = async ({ id }) => {
  if (!id) throw new Error("ID is required");
  await deleteDoc(doc(db, `products/${id}`));
};

// Bulk update price By category (Percentage Change)
export const bulkUpdatePricesByCategory = async ({ categoryId, percentage, skipHistory = false }) => {
  if (!categoryId) throw new Error("Category ID is required");
  if (isNaN(percentage)) throw new Error("Valid percentage is required");

  const multiplier = 1 + (percentage / 100);

  const productsRef = collection(db, "products");
  const q = query(productsRef, where("categoryId", "==", categoryId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("No products found in this category.");
    return;
  }

  const batch = writeBatch(db);

  snapshot.docs.forEach((docSnap) => {
    const productData = docSnap.data();
    let updatedData = { ...productData };

    if (!updatedData.isVariable) {
      if (updatedData.price && typeof updatedData.price === "number") {
        updatedData.price = Math.round(updatedData.price * multiplier * 100) / 100;
      }
      if (updatedData.salePrice && typeof updatedData.salePrice === "number") {
        updatedData.salePrice = Math.round(updatedData.salePrice * multiplier * 100) / 100;
      }
    } else {
      updatedData.variations = updatedData.variations?.map((v) => ({
        ...v,
        price: v.price ? Math.round(v.price * multiplier * 100) / 100 : v.price,
        salePrice: v.salePrice ? Math.round(v.salePrice * multiplier * 100) / 100 : v.salePrice,
      })) ?? [];
    }

    updatedData.timestampUpdate = Timestamp.now();

    batch.set(docSnap.ref, updatedData);
  });

  await batch.commit();
  console.log(`Updated prices for ${snapshot.docs.length} products in category ${categoryId}.`);

  if (!skipHistory) {
    // Store update history
    const historyRef = doc(collection(db, "price_update_history"));
    await setDoc(historyRef, {
      categoryId,
      percentage,
      timestamp: Timestamp.now(),
      revised: false,
    });
  }
};

// Revise Price Update (Reverse the percentage change exactly)
export const revisePriceUpdate = async ({ historyId }) => {
  if (!historyId) throw new Error("History ID is required");

  const historyRef = doc(db, "price_update_history", historyId);
  const historyDoc = await getDoc(historyRef);

  if (!historyDoc.exists()) throw new Error("History not found");
  const historyData = historyDoc.data();
  if (historyData.revised) throw new Error("This update has already been revised");

  const p = historyData.percentage;
  const r = p / 100;
  if (Math.abs(1 + r) < 1e-10) throw new Error("Cannot reverse a 100% decrease");

  const reverse_r = -r / (1 + r);
  const reverse_p = reverse_r * 100;

  // Apply reverse percentage without creating new history
  await bulkUpdatePricesByCategory({
    categoryId: historyData.categoryId,
    percentage: reverse_p,
    skipHistory: true,
  });

  // Mark as revised
  await updateDoc(historyRef, { revised: true });
};