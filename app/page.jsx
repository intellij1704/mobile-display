import Image from "next/image";
import HeroSection from "./components/HeroSection";
import Header from "./components/header/Header";
import FeaturedProductSlider from "./components/Sliders";
import { getProducts, getTopPickProducts } from "@/lib/firestore/products/read_server";
import Collections from "./components/Collections";
import { getCollections } from "@/lib/firestore/collections/read_server";
import Categories from "./components/Categories";
import { getCategories } from "@/lib/firestore/categories/read_server";
import CustomerReviews from "./components/CustomerReviews";
import { getBrands } from "@/lib/firestore/brands/read_server";
import Footer from "./components/Footer";
import { AuthContextProvider } from "@/context/AuthContext";
import CategoryListHero from "./components/CategoryListHero";
import Accessories from "./components/Accessories";
import WhyUsSection from "./components/WhyUsSection";
import ComboOffer from "./components/ComboOffer";
import ProductSection from "./components/ProductSection";
import CategoriesNav from "./components/header/CategoriesNav";
import ShopOwnerSection from "./components/ShopOwnerSection";
import { serializeFirestoreData } from "@/utils/serializeFirestoreData";
import BestsellerCategories from "./components/BestsellerCategories";

export default async function Home() {
  const [collections, categories, products, brands,isTopPick] = await Promise.all([
    getCollections(),
    getCategories(),
    getProducts(),
    getBrands(),
    getTopPickProducts()
  ]);

  const serializedCollections = collections.map(serializeFirestoreData);
  const serializedCategories = categories.map(serializeFirestoreData);
  const serializedProducts = products.map(serializeFirestoreData);
  const serializedBrands = brands.map(serializeFirestoreData);



  // ---- Best Selling: products with discount, sorted by discount %, top 16 ----
  const bestSellingProducts = serializedProducts
    .filter((p) => p.price && p.salePrice && p.salePrice < p.price)
    .map((p) => ({
      ...p,
      discountPercentage: Math.round(((p.price - p.salePrice) / p.price) * 100),
    }))
    .sort((a, b) => b.discountPercentage - a.discountPercentage)
    .slice(0, 16);

  // ---- Big Deals: highest priced 12 products ----
  const bigDeals = [...serializedProducts]
    .filter((p) => p.price) // ensure valid price
    .sort((a, b) => b.price - a.price)
    .slice(0, 12);

  // ---- Latest Arrivals: latest 12 based on createdAt ----
  const latestArrivals = [...serializedProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 12);

  const topPickProducts = isTopPick.map(serializeFirestoreData);

  return (
    <main className="">
      <Header />
      <CategoriesNav />
      <FeaturedProductSlider />
      <Collections collections={serializedCollections} />
      <WhyUsSection />
      <Accessories />

      <ProductSection title="Sale is Live" products={bestSellingProducts} />
      <ProductSection title="Big Deals" products={bigDeals} />
      <ProductSection title="Top pick For You" products={topPickProducts} />
      <ShopOwnerSection />

      <ProductSection title="Latest Arrivals" products={latestArrivals} />

      {/* <ComboOffer products={bestSellingProducts} /> */}
      <BestsellerCategories />
      <CustomerReviews />
      <Footer />
    </main>
  );
}
