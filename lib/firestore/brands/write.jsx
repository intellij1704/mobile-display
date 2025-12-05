import { db, storage } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const isBrandNameExists = async (name, currentId = null) => {
  const trimmedName = name.trim();
  if (!trimmedName) return false;

  const brandsRef = collection(db, "brands");
  const q = query(
    brandsRef,
    where("name_lowercase", "==", trimmedName.toLowerCase())
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return false;
  }

  if (currentId) {
    // For updates, check if the found brand is a different one
    return querySnapshot.docs.some((doc) => doc.id !== currentId);
  }

  return !querySnapshot.empty;
};

export const createNewBrand = async ({ data, image }) => {
  if (!image) {
    throw new Error("Image is Required");
  }
  if (!data?.name) {
    throw new Error("Name is required");
  }

  const nameExists = await isBrandNameExists(data.name);
  if (nameExists) {
    throw new Error(`Brand with name "${data.name.trim()}" already exists.`);
  }

  const newId = doc(collection(db, `ids`)).id;
  const imageRef = ref(storage, `brands/${newId}`);
  await uploadBytes(imageRef, image);
  const imageURL = await getDownloadURL(imageRef);

  await setDoc(doc(db, `brands/${newId}`), {
    ...data,
    name: data.name.trim(),
    name_lowercase: data.name.trim().toLowerCase(),
    id: newId,
    imageURL: imageURL,
    timestampCreate: Timestamp.now(),
  });
};

export const updateBrand = async ({ id, data, image }) => {
  if (!data?.name) {
    throw new Error("Name is required");
  }
  if (!id) {
    throw new Error("ID is required");
  }
  const nameExists = await isBrandNameExists(data.name, id);
  if (nameExists) {
    throw new Error(`Another brand with name "${data.name.trim()}" already exists.`);
  }

  let imageURL = data?.imageURL;

  if (image) {
    const imageRef = ref(storage, `brands/${id}`);
    await uploadBytes(imageRef, image);
    imageURL = await getDownloadURL(imageRef);
  }

  await updateDoc(doc(db, `brands/${id}`), {
    ...data,
    name: data.name.trim(),
    name_lowercase: data.name.trim().toLowerCase(),
    imageURL: imageURL,
    timestampUpdate: Timestamp.now(),
  });
};

export const deleteBrand = async ({ id }) => {
  if (!id) {
    throw new Error("ID is required");
  }
  await deleteDoc(doc(db, `brands/${id}`));
};