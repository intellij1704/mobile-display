"use client";

import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { ProductCard } from "@/app/components/Products";
import { getProductsByCategory } from "@/lib/firestore/products/read_server";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NextArrow = ({ onClick }) => (
  <div
    className="absolute top-1/2 right-1 md:right-0 z-10 p-1 transform -translate-y-1/2 bg-white rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
    onClick={onClick}
  >
    <ChevronRight size={20} />
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="absolute top-1/2 left-1 md:left-0 z-10 p-1 transform -translate-y-1/2 bg-white rounded-full shadow-md hover:bg-gray-100 cursor-pointer"
    onClick={onClick}
  >
    <ChevronLeft size={20} />
  </div>
);

function RelatedProducts({ categoryId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!categoryId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProductsByCategory({ categoryId });
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div className="md:max-w-7xl w-full pb-14">
        <h2 className="md:text-2xl text-xl font-bold text-gray-900 uppercase">
          Related Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mt-10">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="md:max-w-7xl w-full pb-14">
        <h2 className="md:text-2xl text-xl font-bold text-gray-900 uppercase">
          Related Products
        </h2>
        <p className="mt-4 text-gray-600">No related products found.</p>
      </div>
    );
  }

  // Determine if slider is needed
  const showSlider = isMobile
    ? products.length > 2
    : products.length > 5; // desktop always grid up to 5

  const sliderSettings = {
    infinite: false,
    speed: 500,
    slidesToShow: isMobile ? 2 : 5,
    slidesToScroll: 1,
    autoplay: showSlider,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(products.length, 3),
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: Math.min(products.length, 2),
        },
      },
    ],
  };

  return (
    <div className="md:max-w-7xl w-full pb-14 relative">
      <h2 className="md:text-2xl text-xl font-bold text-gray-900 uppercase">
        Related Products
      </h2>

      <div className="w-full mt-10 relative">
        {showSlider ? (
          <Slider {...sliderSettings}>
            {products.map((item) => (
              <div key={item.id} className="px-2">
                <ProductCard product={item} />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-5">
            {products.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RelatedProducts;
