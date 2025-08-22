import { db, storage } from "@/lib/firebase";
import { collection, deleteDoc, doc, setDoc, Timestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// ✅ Create Product
export const createNewProduct = async ({ data, featureImage, imageList, variantImages }) => {
  if (!data?.title) throw new Error("Title is required");
  if (!featureImage) throw new Error("Feature Image is required");
  if (!data?.sku) throw new Error("SKU is required");
  if (data?.isVariable && (!data?.colors || data?.colors.length === 0))
    throw new Error("At least one color is required for variable products");
  if (data?.hasQualityOptions && (!data?.qualities || data?.qualities.length === 0))
    throw new Error("At least one quality is required for products with quality options");

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

  // Upload variant images
  let variantImagesURLs = {};
  if (data?.isVariable) {
    for (const color of data?.colors) {
      const images = variantImages[color] || [];
      const urls = [];
      for (const image of images) {
        const imageRef = ref(storage, `products/${color}_${image?.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        urls.push(url);
      }
      variantImagesURLs[color] = urls;
    }
  }

  const newId = doc(collection(db, `ids`)).id;

  await setDoc(doc(db, `products/${newId}`), {
    ...data,
    seoSlug: data?.seoSlug || data?.title?.toLowerCase().replace(/\s+/g, "-"),
    seoDescription: data?.seoDescription || "",
    seoKeywords: data?.seoKeywords || [],
    sku: data?.sku,
    featureImageURL,
    imageList: imageURLList,
    variantImages: data?.isVariable ? variantImagesURLs : {},
    qualities: data?.qualities || [],
    id: newId,
    timestampCreate: Timestamp.now(),
  });
};

// ✅ Update Product
export const updateProduct = async ({ data, featureImage, imageList, variantImages }) => {
  if (!data?.title) throw new Error("Title is required");
  if (!data?.id) throw new Error("ID is required");
  // if (!data?.sku) throw new Error("SKU is required");
  if (data?.isVariable && (!data?.colors || data?.colors.length === 0))
    throw new Error("At least one color is required for variable products");
  if (data?.hasQualityOptions && (!data?.qualities || data?.qualities.length === 0))
    throw new Error("At least one quality is required for products with quality options");

  // Feature image update
  let featureImageURL = data?.featureImageURL ?? "";
  if (featureImage) {
    const featureImageRef = ref(storage, `products/${featureImage?.name}`);
    await uploadBytes(featureImageRef, featureImage);
    featureImageURL = await getDownloadURL(featureImageRef);
  }

  // Image list update
  let imageURLList = imageList?.length === 0 ? data?.imageList : [];
  for (const image of imageList || []) {
    const imageRef = ref(storage, `products/${image?.name}`);
    await uploadBytes(imageRef, image);
    const url = await getDownloadURL(imageRef);
    imageURLList.push(url);
  }

  // Variant images update
  let variantImagesURLs = data?.variantImages ?? {};
  if (data?.isVariable) {
    for (const color of data?.colors) {
      const images = variantImages[color] || [];
      if (images.length > 0) {
        const urls = [];
        for (const image of images) {
          const imageRef = ref(storage, `products/${color}_${image?.name}`);
          await uploadBytes(imageRef, image);
          const url = await getDownloadURL(imageRef);
          urls.push(url);
        }
        variantImagesURLs[color] = urls;
      } else {
        variantImagesURLs[color] = variantImagesURLs[color] || [];
      }
    }
  } else {
    variantImagesURLs = {};
  }

  await setDoc(doc(db, `products/${data?.id}`), {
    ...data,
    seoSlug: data?.seoSlug || data?.title?.toLowerCase().replace(/\s+/g, "-"),
    seoDescription: data?.seoDescription || "",
    seoKeywords: data?.seoKeywords || [],
    sku: data?.sku,
    featureImageURL,
    imageList: imageURLList,
    variantImages: variantImagesURLs,
    qualities: data?.qualities || [],
    timestampUpdate: Timestamp.now(),
  });
};

// ✅ Delete Product
export const deleteProduct = async ({ id }) => {
  if (!id) throw new Error("ID is required");
  await deleteDoc(doc(db, `products/${id}`));
};
