// @/lib/firestore/blog/write.js
import { db, storage } from "@/lib/firebase";
import { doc, setDoc, updateDoc, serverTimestamp, deleteDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { nanoid } from "nanoid";

export const createBlogPost = async ({ data, image }) => {
    try {
        if (!data?.title || !data?.content || !image) {
            throw new Error("Title, content, and image are required");
        }

        const id = nanoid();
        let imageUrl = "";

        if (image) {
            const imageRef = ref(storage, `blogs/${id}/${image.name}`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }

        const blogData = {
            ...data,
            imageUrl,
            id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, "blogs", id), blogData);
        return id;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const updateBlogPost = async ({ data, image }) => {
    try {
        if (!data?.id) {
            throw new Error("Blog ID is required");
        }

        let imageUrl = data.imageUrl;

        if (image) {
            const imageRef = ref(storage, `blogs/${data.id}/${image.name}`);
            await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(imageRef);
        }

        const blogData = {
            ...data,
            imageUrl,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(doc(db, "blogs", data.id), blogData);
        return data.id;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const deleteBlogPost = async ({ id }) => {
    try {
        if (!id) {
            throw new Error("Blog ID is required");
        }

        // Get the blog post to retrieve the image URL
        const blogRef = doc(db, "blogs", id);
        const blogSnap = await getDoc(blogRef);

        if (blogSnap.exists() && blogSnap.data().imageUrl) {
            // Delete the image from storage
            const imageRef = ref(storage, `blogs/${id}`);
            await deleteObject(imageRef).catch((error) => {
                console.warn("Error deleting image:", error);
            });
        }

        // Delete the blog document
        await deleteDoc(blogRef);
    } catch (error) {
        throw new Error(error.message);
    }
};
