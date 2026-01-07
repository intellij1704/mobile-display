import Image from "next/image";
import HeroSection from "./components/HeroSection";
import Header from "./components/header/Header";
import FeaturedProductSlider from "./components/Sliders";
import {
  getProducts
} from "@/lib/firestore/products/read_server";
import Collections from "./components/Collections";
import Categories from "./components/Categories";
import { getCategories } from "@/lib/firestore/categories/read_server";
import CustomerReviews from "./components/CustomerReviews";
import { getBrands } from "@/lib/firestore/brands/read_server";
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
import Footer from "./components/footer/Footer";

export default async function Home() {
  const [ categories, products, brands] = await Promise.all([
    getCategories(),
    getProducts(),
    getBrands()
  ]);

  const serializedCategories = categories.map(serializeFirestoreData);
  const serializedProducts = products.map(serializeFirestoreData);
  const serializedBrands = brands.map(serializeFirestoreData);

  // ---- Live Sale: products with liveSale flag ----
  const liveSaleProducts = serializedProducts.filter((p) => p.liveSale === true);

  // ---- Big Deals: products with bigDeal flag ----
  const bigDeals = serializedProducts.filter((p) => p.bigDeal === true);

  // ---- Top Picks: products with topPick flag ----
  const topPickProducts = serializedProducts.filter((p) => p.topPick === true);

  // ---- Latest Arrivals: latest 12 based on createdAt ----
  const latestArrivals = [...serializedProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 12);
  return (
    <main className="overflow-x-hidden">
      <Header />
      <CategoriesNav />
      <FeaturedProductSlider />
      <Collections  />
      <WhyUsSection />
      <Accessories />

      {/* Live Sale Products */}
      <ProductSection title="Sale is Live" products={liveSaleProducts} />

      {/* Big Deals */}
      <ProductSection title="Big Deals" products={bigDeals} />

      {/* Top Picks */}
      <ProductSection title="Top Picks For You" products={topPickProducts} />

      <ShopOwnerSection />

      {/* Latest */}
      <ProductSection title="Latest Arrivals" products={latestArrivals} />

      {/* <ComboOffer products={bestSellingProducts} /> */}
      <BestsellerCategories />
      <CustomerReviews />
      <Footer />
    </main>
  );
}
