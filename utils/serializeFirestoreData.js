// utils/serializeFirestoreData.js
export function serializeFirestoreData(doc) {
  if (!doc || typeof doc !== "object") return doc;

  const serialized = {};
  for (const key in doc) {
    const value = doc[key];

    if (value && typeof value === "object") {
      // Handle Firestore Timestamp
      if (
        typeof value.seconds === "number" &&
        typeof value.nanoseconds === "number"
      ) {
        const date = new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
        serialized[key] = !isNaN(date.getTime()) ? date.toISOString() : null;
      }
      // Nested objects (recursive)
      else {
        serialized[key] = serializeFirestoreData(value);
      }
    } else {
      serialized[key] = value;
    }
  }
  return serialized;
}
