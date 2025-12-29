import { setGlobalOptions } from "firebase-functions/v2";
import { onObjectFinalized } from "firebase-functions/v2/storage";

import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

import sharp from "sharp";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";

setGlobalOptions({ maxInstances: 10 });

// ✅ Correct initialization for firebase-admin v12+
initializeApp();

export const convertToAvif = onObjectFinalized(
  {
    region: "us-central1",
    memory: "512MiB",
  },
  async (event) => {
    const object = event.data;
    const filePath = object.name;

    if (!filePath) return;

    // Only process product images
    if (!filePath.startsWith("products/")) return;

    // Skip already converted images
    if (filePath.endsWith(".avif")) return;

    const bucket = getStorage().bucket(object.bucket);

    const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
    const avifFilePath = filePath.replace(/\.(png|jpg|jpeg)$/i, ".avif");
    const tempAvifPath = path.join(os.tmpdir(), path.basename(avifFilePath));

    // Download original image
    await bucket.file(filePath).download({ destination: tempFilePath });

    // Convert to AVIF
    await sharp(tempFilePath)
      .avif({ quality: 30 })
      .toFile(tempAvifPath);

    // Upload converted image
    await bucket.upload(tempAvifPath, {
      destination: avifFilePath,
      metadata: {
        contentType: "image/avif",
      },
    });

    // Delete original image
    await bucket.file(filePath).delete();

    // Cleanup temp files
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempAvifPath);

    console.log("Converted to AVIF:", avifFilePath);
  }
);
