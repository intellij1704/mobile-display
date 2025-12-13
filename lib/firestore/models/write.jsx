import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const isModelNameExists = async (name, brandId, seriesId, currentId = null) => {
  const trimmedName = name.trim();
  const modelsRef = collection(db, "models");
  const q = query(
    modelsRef,
    where("brandId", "==", brandId),
    where("seriesId", "==", seriesId),
    where("name_lowercase", "==", trimmedName.toLowerCase())
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return false;
  }

  return querySnapshot.docs.some((doc) => doc.id !== currentId);
};

async function uploadImage(image, modelId) {
  if (!image) return null;

  // Validate image size
  if (image.size > MAX_IMAGE_SIZE) {
    throw new Error("Image size exceeds 5MB limit.");
  }

  try {
    const storageRef = ref(storage, `models/${modelId}_${Date.now()}_${image.name}`);
    const snapshot = await uploadBytes(storageRef, image);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

export async function createNewModel({ data, image }) {
  if (!data.name || !data.brandId || !data.seriesId) {
    throw new Error("Missing required fields");
  }

  try {
    const nameExists = await isModelNameExists(data.name, data.brandId, data.seriesId);
    if (nameExists) {
      throw new Error(
        `Model with name "${data.name.trim()}" already exists for this brand and series.`
      );
    }

    const now = serverTimestamp();
    const modelData = {
      name: data.name.trim(),
      name_lowercase: data.name.trim().toLowerCase(),
      slug: data.slug,
      brandId: data.brandId,
      seriesId: data.seriesId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, "models"), modelData);
    
    if (image) {
      const imageURL = await uploadImage(image, docRef.id);
      await updateDoc(docRef, { imageURL });
      modelData.imageURL = imageURL;
    }

    return { id: docRef.id, ...modelData };
  } catch (error) {
    throw new Error(`Failed to create model: ${error.message}`);
  }
}

export async function updateModel({ id, data, image }) {
  if (!id) {
    throw new Error("Model ID is required");
  }

  try {
    if (data.name && data.brandId && data.seriesId) {
      const nameExists = await isModelNameExists(data.name, data.brandId, data.seriesId, id);
      if (nameExists) {
        throw new Error(
          `Another model with name "${data.name.trim()}" already exists for this brand and series.`
        );
      }
    }

    const modelData = {
      name: data.name?.trim(),
      slug: data.slug,
      brandId: data.brandId,
      seriesId: data.seriesId,
      imageURL: data.imageURL,
      updatedAt: serverTimestamp(),
    };

    if (image) {
      modelData.imageURL = await uploadImage(image, id);
    }

    // Remove undefined fields
    Object.keys(modelData).forEach((key) => {
      if (modelData[key] === undefined) {
        delete modelData[key];
      }
    });

    if (modelData.name) {
      modelData.name_lowercase = modelData.name.toLowerCase();
    }

    await updateDoc(doc(db, "models", id), modelData);
    return { id, ...modelData };
  } catch (error) {
    throw new Error(`Failed to update model: ${error.message}`);
  }
}

export async function deleteModel({ id }) {
  if (!id) {
    throw new Error("Model ID is required");
  }

  try {
    await deleteDoc(doc(db, "models", id));
    return { id };
  } catch (error) {
    throw new Error(`Failed to delete model: ${error.message}`);
  }
}