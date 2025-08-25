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

export default async function Home() {
  // Fetch data from Firestore
  const [bestSelling, newArrivals, collections, categories, products, brands] = await Promise.all([
    getBestSellingProducts(),
    getNewArrivalProducts(),
    getCollections(),
    getCategories(),
    getProducts(),
    getBrands(),
  ]);

  // Serialize timestampCreate and timestampUpdate to ISO string, with error handling
  const serializeProduct = (product) => {
    try {
      const serialized = {
        ...product,
        timestampCreate: null,
        timestampUpdate: null,
      };

      if (product.timestampCreate && typeof product.timestampCreate.seconds === 'number' && typeof product.timestampCreate.nanoseconds === 'number') {
        const date = new Date(product.timestampCreate.seconds * 1000 + product.timestampCreate.nanoseconds / 1000000);
        if (!isNaN(date.getTime())) {
          serialized.timestampCreate = date.toISOString();
        } else {
          console.warn(`Invalid timestampCreate for product: ${product.id || 'unknown'}`, product.timestampCreate);
        }
      }

      if (product.timestampUpdate && typeof product.timestampUpdate.seconds === 'number' && typeof product.timestampUpdate.nanoseconds === 'number') {
        const date = new Date(product.timestampUpdate.seconds * 1000 + product.timestampUpdate.nanoseconds / 1000000);
        if (!isNaN(date.getTime())) {
          serialized.timestampUpdate = date.toISOString();
        } else {
          console.warn(`Invalid timestampUpdate for product: ${product.id || 'unknown'}`, product.timestampUpdate);
        }
      }

      return serialized;
    } catch (error) {
      console.error(`Error serializing product: ${product.id || 'unknown'}`, error, product);
      return { ...product, timestampCreate: null, timestampUpdate: null };
    }
  };

  const bestSellingProducts = bestSelling.map(serializeProduct);
  const newArrivalProducts = newArrivals.map(serializeProduct);

  return (
    <>
      <main className="h-screen overflow-x-hidden overflow-y-auto">
        <Header />
        <CategoriesNav />
        <FeaturedProductSlider />
        <Collections collections={collections} />
        <Accessories />
        <ShopOwnerSection />
        <WhyUsSection />
        
        {/* Display Best Selling Products */}
        <ProductSection title="Best Selling" products={bestSellingProducts} />

        {/* Display New Arrivals */}
        <ProductSection title="New Arrival" products={newArrivalProducts} />

        <ComboOffer products={bestSellingProducts} />
        <CustomerReviews />
        <Footer />
      </main>
    </>
  );
}