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
import WarrantyPolicySection from "./components/WarrantyPolicySection";
import { notFound } from "next/navigation";
import WhyUsSection from "@/app/components/WhyUsSection";

// ✅ Dynamic Metadata for SEO
export async function generateMetadata({ params }) {
    const { productId } = await params;


    // First try seoSlug, then fallback to Firestore id
    let product = await getProduct({ seoSlug: productId });

    console.log("Format Products", product)
    if (!product) product = await getProduct({ id: productId });

    if (!product) {
        return {
            title: "Product Not Found | Mobile Display Mobile Spare Parts",
            description: "The product you are looking for does not exist.",
        };
    }

    let minPrice = product?.price || 0;
    let hasStock = product?.stock > 0;
    if (product?.isVariable && product?.variations?.length > 0) {
        minPrice = Math.min(...product.variations.map(v => parseFloat(v.salePrice || v.price)));
        hasStock = product.variations.some(v => parseInt(v.stock) > 0);
    }

    const title =
        product?.metaTitle ||
        `${product.title} - Elevate Visual Brilliance With Genuine Replacement - Cash On Delivery`;
    const description =
        product.seoDescription ||
        `Buy ${product.title} at Mobile Display, your trusted source for authentic mobile spare parts. Enjoy quality, authenticity, and reliable mobile repair solutions.`;
    const keywords = product.seoKeywords || "";
    const image = product.featureImageURL || "/default-product.jpg";
    const url = `${process.env.NEXT_PUBLIC_DOMAIN}/products/${product.seoSlug || product.id}`;

    return {
        metadataBase: new URL(process.env.NEXT_PUBLIC_DOMAIN),
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
            data1: `₹${minPrice}`,
            label2: "Availability",
            data2: hasStock ? "In Stock" : "Out of Stock",
        },
        other: {
            "product:price:amount": minPrice || "0",
            "product:price:currency": "INR",
            "product:availability":
                hasStock ? "instock" : "outofstock",
        },
    };
}

export default async function Page({ params, searchParams }) {
    const { productId } = await params;
    let { color, quality, brand } = await searchParams;

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

    // Compute attributes
    const colors = product?.attributes?.find(attr => attr.name === "Color")?.values || [];
    const qualities = product?.attributes?.find(attr => attr.name === "Quality")?.values || [];
    const brands = product?.attributes?.find(attr => attr.name === "Brand")?.values || [];
    const hasColorOptions = colors.length > 0;
    const hasQualityOptions = qualities.length > 0;
    const hasBrandOptions = brands.length > 0;

    // For variable products, auto-select if only one option for attribute
    if (product.isVariable && product.variations?.length > 0) {
        if (hasColorOptions && colors.length === 1 && !color) {
            color = colors[0];
        }
        if (hasQualityOptions && qualities.length === 1 && !quality) {
            quality = qualities[0];
        }
        if (hasBrandOptions && brands.length === 1 && !brand) {
            brand = brands[0];
        }
    }

    // Compute effective values for schema if variable
    let effectivePrice = product.price || 0;
    let isInStock = product.stock > 0;
    if (product.isVariable && product.variations?.length > 0) {
        effectivePrice = Math.min(...product.variations.map(v => parseFloat(v.salePrice || v.price)));
        isInStock = product.variations.some(v => parseInt(v.stock) > 0);
    }

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
            price: effectivePrice,
            availability:
                isInStock
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: "Mobile Display Mobile Phone Spare Parts Online",
            },
        },
    };

    return (
        <main className="p-4 w-full max-w-7xl mx-auto md:pt-10 overflow-x-hidden ">
            {/* ✅ Inject Schema.org JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            {/* Product Main Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Images */}
                <div className="flex justify-center">
                    <Photos product={product} selectedColor={color} selectedQuality={quality} selectedBrand={brand} />
                </div>

                {/* Product Details */}
                <div>
                    <Details
                        product={product}
                        selectedColor={color}
                        selectedQuality={quality}
                        selectedBrand={brand}
                    />
                </div>
            </section>

            <div  >
                <WhyUsSection />
            </div>

            {/* Description Section */}
            <section className="mb-10 mt-10">
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

            {/* Warranty Policy */}
            <section className="mb-10">
                <WarrantyPolicySection product={product} />
            </section>

            {/* Review Section */}
            <section className="py-12 bg-white border-t rounded-md">
                <div className=" mx-auto gap-2 max-w-7xl flex flex-col md:flex-row">
                    <AuthContextProvider>
                        <AddReview productId={product.id} />
                        <Reviews productId={product.id} />
                    </AuthContextProvider>
                </div>
            </section>

            {/* Related Products */}
            <section className="mt-10">
                <RelatedProducts categoryId={product.categoryId} productId={product.id} />
            </section>
        </main>
    );
}