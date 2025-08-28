// lib/firestore/specialOffers/read.jsx
"use client"
import { db } from "@/lib/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { onSnapshot, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export const useSpecialOffers = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "specialOffers"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const specialOffers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(specialOffers);
      setIsLoading(false);
    }, (err) => {
      setError(err.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { data, error, isLoading };
};

export const getSpecialOffers = async () => {
  const q = query(collection(db, "specialOffers"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};