import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ----------------------- Utility Functions ----------------------- */

function escapeXML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getBrandName(brandId) {
  if (!brandId) return "";
  const docRef = doc(db, "brands", brandId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().name : "";
}

async function getCategoryName(categoryId) {
  if (!categoryId) return "";
  const docRef = doc(db, "categories", categoryId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().name : "";
}

async function getModelName(modelId) {
  if (!modelId) return "";
  const docRef = doc(db, "models", modelId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().name : "";
}

function getProductURL(product, variant = null) {
  const slug = product.seoSlug ? product.seoSlug : product.id;
  let url = `http://localhost:3000/products/${slug}`;

  if (variant && variant.attributes) {
    const query = new URLSearchParams(variant.attributes).toString();
    if (query) url += `?${query}`;
  }

  return url;
}

function getProductImages(product, variant = null) {
  if (variant?.imageURLs?.length) return variant.imageURLs;
  if (product.imageList?.length) return product.imageList;
  if (product.featureImageURL) return [product.featureImageURL];
  return [];
}

/* ----------------------- Feed Generator ----------------------- */
async function generateFeed() {
  const productsSnapshot = await getDocs(collection(db, "products"));
  const products = productsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  let feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Mobile Display Replacement Store Feed</title>
<link>http://localhost:3000/</link>
<description>Google Shopping Feed for Mobile Display Replacement Products</description>`;

  for (const product of products) {
    const brandName = await getBrandName(product.brandId);
    const categoryName = await getCategoryName(product.categoryId);
    const modelName = await getModelName(product.modelId);

    const variants =
      product.isVariable && product.variations?.length
        ? product.variations
        : [null];

    for (const variant of variants) {
      const images = getProductImages(product, variant);

      const price = variant?.price ?? (product.price || 0);
      const salePrice = variant?.salePrice ?? (product.salePrice || price);

      feed += `
<item>
  <g:id>${escapeXML(product.id + (variant ? "-" + variant.id : ""))}</g:id>
  <g:title>${escapeXML(product.title)}</g:title>
  <g:link>${escapeXML(getProductURL(product, variant))}</g:link>
  <g:image_link>${escapeXML(images[0] || "")}</g:image_link>
  ${images
    .slice(1)
    .map(
      (img) =>
        `<g:additional_image_link>${escapeXML(img)}</g:additional_image_link>`
    )
    .join("\n")}
  <g:availability>${
    (variant?.stock ?? product.stock) > 0 ? "in stock" : "out of stock"
  }</g:availability>
  <g:price>${price} INR</g:price>
  ${
    salePrice && salePrice !== price
      ? `<g:sale_price>${salePrice} INR</g:sale_price>`
      : ""
  }
  <g:description>${escapeXML(
    stripHtml(product.description || product.shortDescription)
  )}</g:description>
  <g:short_description>${escapeXML(
    stripHtml(product.shortDescription)
  )}</g:short_description>
  <g:key_features>${escapeXML(stripHtml(product.keyFeatures))}</g:key_features>
  <g:capability>${escapeXML(stripHtml(product.capability))}</g:capability>
  <g:seo_keywords>${escapeXML(
    (product.seoKeywords || []).join(", ")
  )}</g:seo_keywords>
  <g:brand>${escapeXML(brandName)}</g:brand>
  <g:category>${escapeXML(categoryName)}</g:category>
  <g:model>${escapeXML(modelName)}</g:model>
</item>`;
    }
  }

  feed += `
</channel>
</rss>`;

  return feed;
}

/* ----------------------- Next.js 15 GET Handler ----------------------- */
export async function GET() {
  const xmlFeed = await generateFeed();

  return new Response(xmlFeed, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
