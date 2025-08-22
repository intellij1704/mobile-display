import { getProduct } from "@/lib/firestore/products/read_server";
import Photos from "./components/Photos";
import Details from "./components/Details";
import Description from "./components/Description";
import Reviews from "./components/Reviews";
import RelatedProducts from "./components/RelatedProducts";
import AddReview from "./components/AddReview";
import { AuthContextProvider } from "@/context/AuthContext";
import InTheBoxSection from "./components/InTheBoxSection";
import CompatibilitySection from "./components/CompatibilitySection";
import { notFound } from "next/navigation";

// ✅ Dynamic Metadata for SEO
export async function generateMetadata({ params }) {
    const { productId } = params;

    // First try seoSlug, then fallback to Firestore id
    let product = await getProduct({ seoSlug: productId });
    if (!product) product = await getProduct({ id: productId });

    if (!product) {
        return {
            title: "Product Not Found | Mobile Display Mobile Spare Parts",
            description: "The product you are looking for does not exist.",
        };
    }

    const title =
        product.seoTitle ||
        `${product.title} - Elevate Visual Brilliance With Genuine Replacement - Cash On Delivery`;
    const description =
        product.seoDescription ||
        `Buy ${product.title} at Mobile Display, your trusted source for authentic mobile spare parts. Enjoy quality, authenticity, and reliable mobile repair solutions.`;
    const keywords = product.seoKeywords || "";
    const image = product.featureImageURL || "/default-product.jpg";
    const url = `${process.env.NEXT_PUBLIC_DOMAIN}/products/${product.seoSlug || product.id}`;

    return {
        title,
        description,
        keywords,
        robots: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-video-preview": -1,
            "max-image-preview": "large",
        },
        alternates: {
            canonical: url,
        },
        openGraph: {
            type: "website",
            locale: "en_US",
            siteName: "Mobile Display | Mobile Phone Spare Parts Online",
            url,
            title,
            description,
            updatedTime: new Date().toISOString(),
            images: [
                {
                    url: image,
                    secureUrl: image,
                    width: 1125,
                    height: 1125,
                    alt: product.title,
                    type: "image/jpeg",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            site: "@MobileDisplay",
            creator: "@MobileDisplay",
            title,
            description,
            images: [image],
            label1: "Price",
            data1: `₹${product.price}`,
            label2: "Availability",
            data2: product.stock > 0 ? "In Stock" : "Out of Stock",
        },
        other: {
            "product:price:amount": product.price || "0",
            "product:price:currency": "INR",
            "product:availability":
                product.stock > 0 ? "instock" : "outofstock",
        },
    };
}

export default async function Page({ params, searchParams }) {
    const { productId } = params;
    const { color, quality } = searchParams;

    // ✅ First try by seoSlug, then fallback to Firestore id
    let rawProduct = await getProduct({ seoSlug: productId });
    if (!rawProduct) rawProduct = await getProduct({ id: productId });

    if (!rawProduct) return notFound();

    // ✅ Normalize product data
    const product = {
        ...rawProduct,
        id: rawProduct.id || productId,
        timestampCreate: rawProduct.timestampCreate?.toDate().toISOString(),
        timestampUpdate: rawProduct.timestampUpdate?.toDate().toISOString(),
    };

    // ✅ Schema for SEO
    const schemaData = product.schemaData || {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.title,
        description: product.seoDescription || product.shortDescription,
        sku: product.sku,
        brand: {
            "@type": "Brand",
            name: product.brand || "Mobile Display",
        },
        category: product.categoryName || "Mobile Spare Parts",
        image: product.featureImageURL,
        offers: {
            "@type": "Offer",
            url: `${process.env.NEXT_PUBLIC_DOMAIN}/product/${product.seoSlug || product.id}`,
            priceCurrency: "INR",
            price: product.price || "0",
            availability:
                product.stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: "Mobile Display Mobile Phone Spare Parts Online",
            },
        },
    };

    return (
        <main className="p-4 md:px-10 w-full max-w-8xl mx-auto bg-gray-100">
            {/* ✅ Inject Schema.org JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            {/* Product Main Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Images */}
                <div className="flex justify-center">
                    <Photos product={product} selectedColor={color} />
                </div>

                {/* Product Details */}
                <div>
                    <Details
                        product={product}
                        selectedColor={color}
                        selectedQuality={quality}
                    />
                </div>
            </section>

            {/* Description Section */}
            <section className="mb-10">
                <Description product={product} />
            </section>

            {/* What's in the Box */}
            <section className="mb-10">
                <InTheBoxSection product={product} />
            </section>

            {/* Compatibility */}
            <section className="mb-10">
                <CompatibilitySection product={product} />
            </section>

            {/* Review Section */}
            <section className="py-12 bg-white border-t rounded-md">
                <div className="container mx-auto px-4 max-w-8xl flex">
                    <AuthContextProvider>
                        <AddReview productId={product.id} />
                        <Reviews productId={product.id} />
                    </AuthContextProvider>
                </div>
            </section>

            {/* Related Products */}
            <section className="mt-10">
                <RelatedProducts categoryId={product.categoryId} />
            </section>
        </main>
    );
}
