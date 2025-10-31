import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

export const createUser = async ({ uid, displayName, mobileNo, email, gender, country, photoURL }) => {
  const userDocRef = doc(db, `users/${uid}`);
  const userDoc = await getDoc(userDocRef);

  // Only create the document if it doesn't already exist
  if (!userDoc.exists()) {
    await setDoc(
      userDocRef,
      {
        displayName: displayName,
        mobileNo: mobileNo ?? "",
        email: email ?? "",
        gender: gender ?? "",
        country: country ?? "",
        photoURL: photoURL ?? "",
        addresses: [],
        timestampCreate: Timestamp.now(),
      }
    );
  }
};

export const updateFavorites = async ({ uid, list }) => {
  await setDoc(
    doc(db, `users/${uid}`),
    JSON.parse(JSON.stringify({
      favorites: list,
    })),
    {
      merge: true,
    }
  );
};

export const updateCarts = async ({ uid, list }) => {
  await setDoc(
    doc(db, `users/${uid}`),
    {
      carts: list,
    },
    {
      merge: true,
    }
  );
};

export const updateUser = async (uid, updates) => {
  await setDoc(
    doc(db, `users/${uid}`),
    {
      ...updates,
      timestampUpdated: Timestamp.now(),
    },
    { merge: true }
  );
};

export const updateAddresses = async ({ uid, addresses }) => {
  await setDoc(
    doc(db, `users/${uid}`),
    {
      addresses,
      timestampUpdated: Timestamp.now(),
    },
    { merge: true }
  );
};