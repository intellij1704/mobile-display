"use client";

import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllHeroContent } from "@/lib/firestore/hero/read"; // adjust path if needed
import toast from "react-hot-toast";
import Link from "next/link";

export default function HeroSectionSlider() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await getAllHeroContent();
        setSlides(data);
      } catch (error) {
        toast.error("Failed to load hero images");
      }
    };

    fetchSlides();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    pauseOnHover: false,
    beforeChange: (_, next) => setCurrentSlide(next),
  };

  const CustomArrow = ({ direction }) => {
    const handleClick = () => {
      if (!sliderRef.current) return;
      direction === "left"
        ? sliderRef.current.slickPrev()
        : sliderRef.current.slickNext();
    };

    return (
      <button
        onClick={handleClick}
        className={`hidden sm:flex absolute top-1/2 z-20 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-md items-center justify-center transition-all duration-300 ${direction === "left" ? "left-2 sm:left-4" : "right-2 sm:right-4"
          }`}
        aria-label={direction === "left" ? "Previous slide" : "Next slide"}
      >
        {direction === "left" ? (
          <ChevronLeft className="text-gray-800" size={24} />
        ) : (
          <ChevronRight className="text-gray-800" size={24} />
        )}
      </button>
    );
  };

  return (
    <div className="relative w-full overflow-hidden bg-white">
      <Slider ref={sliderRef} {...settings}>
        {slides.map((slide) => (
          <div key={slide.id}>
            <Link href={"/product"} >            <div className="relative w-full h-[200px] sm:h-[300px] md:h-[600px] lg:h-[600px] xl:h-[700px]">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.imageUrl})` }}
              />
            </div></Link>
          </div>
        ))}
      </Slider>

      <CustomArrow direction="left" />
      <CustomArrow direction="right" />

      {/* Dot Navigation */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 mb-2 bg-[#FFFFFF52] px-5 py-1 rounded-full">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => sliderRef.current?.slickGoTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? "w-8 bg-red-600" : "w-2 bg-black"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
