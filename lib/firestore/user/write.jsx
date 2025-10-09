import { db } from "@/lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

export const createUser = async ({ uid, displayName, mobileNo, email, gender, country, photoURL }) => {
  await setDoc(
    doc(db, `users/${uid}`),
    {
      displayName: displayName,
      mobileNo: mobileNo ?? "",
      email: email ?? "",
      gender: gender ?? "",
      country: country ?? "",
      photoURL: photoURL ?? "",
      addresses: [],
      timestampCreate: Timestamp.now(),
    },
    { merge: true }
  );
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