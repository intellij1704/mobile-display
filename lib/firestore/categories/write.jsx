import { db, storage } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const isCategoryNameExists = async (name, currentId = null) => {
  const trimmedName = name.trim();
  const categoriesRef = collection(db, "categories");
  const q = query(
    categoriesRef,
    where("name_lowercase", "==", trimmedName.toLowerCase())
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return false;
  }

  if (currentId) {
    // For updates, check if the found category is a different one
    return querySnapshot.docs.some((doc) => doc.id !== currentId);
  }

  return !querySnapshot.empty;
};

export const createNewCategory = async ({ data, image }) => {
  if (!image) {
    throw new Error("Image is Required");
  }
  if (!data?.name) {
    throw new Error("Name is required");
  }

  const nameExists = await isCategoryNameExists(data.name);
  if (nameExists) {
    throw new Error(`Category with name "${data.name.trim()}" already exists.`);
  }

  const newId = doc(collection(db, `ids`)).id;
  const imageRef = ref(storage, `categories/${newId}`);
  await uploadBytes(imageRef, image);
  const imageURL = await getDownloadURL(imageRef);

  await setDoc(doc(db, `categories/${newId}`), {
    ...data,
    name: data.name.trim(),
    name_lowercase: data.name.trim().toLowerCase(),
    slug: data.slug,
    id: newId,
    imageURL: imageURL,
    timestampCreate: Timestamp.now(),
  });
};

export const updateCategory = async ({ id, data, image }) => {
  if (!data?.name) {
    throw new Error("Name is required");
  }
  if (!id) {
    throw new Error("ID is required");
  }

  const nameExists = await isCategoryNameExists(data.name, id);
  if (nameExists) {
    throw new Error(`Another category with name "${data.name.trim()}" already exists.`);
  }

  let imageURL = null;

  // First get the current image URL if it exists
  const docRef = doc(db, `categories/${id}`);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    imageURL = docSnap.data().imageURL;
  }

  // If new image is provided, upload it
  if (image) {
    const imageRef = ref(storage, `categories/${id}`);
    await uploadBytes(imageRef, image);
    imageURL = await getDownloadURL(imageRef);
  }

  await updateDoc(doc(db, `categories/${id}`), {
    ...data,
    name: data.name.trim(),
    name_lowercase: data.name.trim().toLowerCase(),
    slug: data.slug,
    imageURL: imageURL,
    timestampUpdate: Timestamp.now(),
  });
};

export const deleteCategory = async ({ id }) => {
  if (!id) {
    throw new Error("ID is required");
  }
  await deleteDoc(doc(db, `categories/${id}`));
};