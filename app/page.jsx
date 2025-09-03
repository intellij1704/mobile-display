import Image from "next/image";
import HeroSection from "./components/HeroSection";
import Header from "./components/header/Header";
import FeaturedProductSlider from "./components/Sliders";
import { getBestSellingProducts, getNewArrivalProducts, getProducts } from "@/lib/firestore/products/read_server";
import Collections from "./components/Collections";
import { getCollections } from "@/lib/firestore/collections/read_server";
import Categories from "./components/Categories";
import { getCategories } from "@/lib/firestore/categories/read_server";
import CustomerReviews from "./components/CustomerReviews";
import Brands from "./components/Brands";
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

export default async function Home() {
  const [bestSelling, newArrivals, collections, categories, products, brands] = await Promise.all([
    getBestSellingProducts(),
    getNewArrivalProducts(),
    getCollections(),
    getCategories(),
    getProducts(),
    getBrands(),
  ]);

  const bestSellingProducts = bestSelling.map(serializeFirestoreData);
  const newArrivalProducts = newArrivals.map(serializeFirestoreData);
  const serializedCollections = collections.map(serializeFirestoreData);
  const serializedCategories = categories.map(serializeFirestoreData);
  const serializedProducts = products.map(serializeFirestoreData);
  const serializedBrands = brands.map(serializeFirestoreData);

  return (
    <main className="">
      <Header />
      <CategoriesNav />
      <FeaturedProductSlider />
      <Collections collections={serializedCollections} />
      <Accessories />
      <ShopOwnerSection />
      <WhyUsSection />

      <ProductSection title="Best Selling" products={bestSellingProducts} />
      <ProductSection title="New Arrival" products={newArrivalProducts} />

      <ComboOffer products={bestSellingProducts} />
      <CustomerReviews />
      <Brands brands={serializedBrands} />
      <Footer />
    </main>
  );
}