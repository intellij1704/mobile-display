"use client";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState, useCallback } from "react";

/* ------------------------- 🔹 Utility Functions ------------------------- */

// Get all models
export async function getAllModels() {
  try {
    const snapshot = await getDocs(collection(db, "models"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Failed to fetch all models: " + error.message);
  }
}

// Get all models under a specific brand & series
export async function getModelsBySeries(brandId, seriesId) {
  try {
    if (!brandId || !seriesId) return [];

    const q = query(
      collection(db, "models"),
      where("brandId", "==", brandId),
      where("seriesId", "==", seriesId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Failed to fetch models: " + error.message);
  }
}

// Get single model by ID
export async function getModelById(modelId) {
  try {
    if (!modelId) throw new Error("Model ID is required");

    const modelRef = doc(db, "models", modelId);
    const modelDoc = await getDoc(modelRef);

    if (!modelDoc.exists()) throw new Error("Model not found");

    return { id: modelDoc.id, ...modelDoc.data() };
  } catch (error) {
    throw new Error("Failed to fetch model: " + error.message);
  }
}

// Get single model by Slug
export async function getModelBySlug(slug) {
  try {
    if (!slug) throw new Error("Slug is required");

    const q = query(collection(db, "models"), where("slug", "==", slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error("Model not found");

    const modelDoc = snapshot.docs[0];
    return { id: modelDoc.id, ...modelDoc.data() };
  } catch (error) {
    throw new Error(`Failed to fetch model by slug: ${error.message}`);
  }
}


/* ------------------------- 🔹 React Hooks ------------------------- */

// Hook: Get ALL models
export function useModels() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const models = await getAllModels();
      setData(models);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch all models");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { data, isLoading, error, refetch: fetchModels };
}

// Hook: Get all models under a brand
export function useModelsByBrand(brandId) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchModels() {
      if (!brandId) {
        setData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const q = query(collection(db, "models"), where("brandId", "==", brandId));
        const snapshot = await getDocs(q);
        setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setError(null);
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchModels();
  }, [brandId]);

  return { data, isLoading, error };
}

// Hook: Get all models under a brand + series
export function useModelsBySeries(brandId, seriesId) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModels = useCallback(async () => {
    if (!brandId || !seriesId) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const models = await getModelsBySeries(brandId, seriesId);
      setData(models);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch models");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [brandId, seriesId]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { data, isLoading, error, refetch: fetchModels };
}

// Hook: Get single model by ID
export function useModelById(modelId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModel = useCallback(async () => {
    if (!modelId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const model = await getModelById(modelId);
      setData(model);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch model");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  return { data, isLoading, error, refetch: fetchModel };
}

// Hook: Get single model by Slug
export function useModelBySlug(slug) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModel = useCallback(async () => {
    if (!slug) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const model = await getModelBySlug(slug);
      setData(model);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch model");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  return { data, isLoading, error, refetch: fetchModel };
}
