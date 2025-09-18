"use client";

import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

// Custom arrow components
const PrevArrow = ({ onClick }) => (
    <button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/70 text-white cursor-pointer hover:bg-black transition-all duration-200"
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        }}
        onMouseDown={(e) => e.preventDefault()}
        type="button"
        aria-label="Previous slide"
    >
        <ChevronLeft size={24} />
    </button>
);

const NextArrow = ({ onClick }) => (
    <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/70 text-white cursor-pointer hover:bg-black transition-all duration-200"
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        }}
        onMouseDown={(e) => e.preventDefault()}
        type="button"
        aria-label="Next slide"
    >
        <ChevronRight size={24} />
    </button>
);

function Photos({ product, selectedColor }) {
    const defaultImage = "/prodduct.png";
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [fullscreenSlide, setFullscreenSlide] = useState(0);
    const mainSliderRef = useRef(null);
    const thumbnailSliderRef = useRef(null);

    // Determine images to display
    const images = product?.isVariable && selectedColor && product?.variantImages?.[selectedColor]?.length
        ? product.variantImages[selectedColor]
        : [product?.featureImageURL, ...(product?.imageList ?? [])].filter(Boolean);

    const displayImages = images.length ? images : [defaultImage];

    // Main slider settings
    const mainSliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        autoplay: !isPaused,
        autoplaySpeed: 3000,
        pauseOnHover: false,
        pauseOnFocus: false,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        beforeChange: (_, next) => {
            setCurrentSlide(next);
            if (showFullscreen) {
                setFullscreenSlide(next);
            }
        },
        swipe: false,
    };

    // Thumbnail slider settings
    const thumbnailSliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: Math.min(displayImages.length, 6),
        slidesToScroll: 1,
        arrows: false,
        focusOnSelect: false,
        swipe: false,
        responsive: [
            { breakpoint: 768, settings: { slidesToShow: Math.min(displayImages.length, 3) } },
            { breakpoint: 480, settings: { slidesToShow: Math.min(displayImages.length, 2) } },
        ],
    };

    const handleMouseMove = useCallback((e) => {
        if (!isZoomed) return;
        const container = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - container.left) / container.width;
        const y = (e.clientY - container.top) / container.height;
        setZoomPosition({ x, y });
    }, [isZoomed]);

    const handleThumbnailClick = useCallback((index) => {
        mainSliderRef.current?.slickGoTo(index);
        setCurrentSlide(index);
        if (showFullscreen) {
            setFullscreenSlide(index);
        }
    }, [showFullscreen]);

    const toggleFullscreen = useCallback((e, index) => {
        e?.preventDefault();
        e?.stopPropagation();
        const slideIndex = typeof index === 'number' ? index : currentSlide;
        setFullscreenSlide(slideIndex);
        setShowFullscreen((prev) => !prev);
        setIsPaused(true);
    }, [currentSlide]);

    const syncSliders = useCallback(() => {
        thumbnailSliderRef.current?.slickGoTo(currentSlide);
    }, [currentSlide]);

    const resetSlider = useCallback(() => {
        setCurrentSlide(0);
        setFullscreenSlide(0);
        mainSliderRef.current?.slickGoTo(0);
        syncSliders();
    }, [syncSliders]);

    useEffect(() => {
        syncSliders();
    }, [currentSlide, syncSliders]);

    useEffect(() => {
        resetSlider();
    }, [selectedColor, resetSlider]);

    const handleWheel = useCallback((e) => {
        e.stopPropagation();
    }, []);

    if (!displayImages.length) {
        return (
            <div className="flex justify-center items-center min-h-[200px] bg-gray-100">
                <div className="text-2xl font-semibold text-red-500 px-6 text-center">
                    Something Went Wrong
                </div>
            </div>
        );
    }

    return (
        <div
            className="w-full max-w-7xl max-h-max mx-auto px-4 sm:px-6 lg:px-10 py-6 bg-white rounded-xl shadow-md border-[0.54px] border-[#00000033]"
            onWheel={handleWheel}
        >
            {/* Fullscreen View */}
            {showFullscreen && (
                <motion.div
                    className="fixed inset-0 top-0 bg-black/80 z-[9999] flex items-center justify-center"
                    onClick={toggleFullscreen}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <button
                        className="absolute top-4 right-4 z-50 w-10 h-10 bg-white text-black p-2 rounded-full"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFullscreen(e);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label="Close fullscreen"
                    >
                        ✕
                    </button>
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="relative w-full h-full"
                    >
                        <Image
                            src={displayImages[fullscreenSlide] || "/placeholder.svg"}
                            alt={`Full size image ${fullscreenSlide + 1}`}
                            fill
                            className="object-contain p-4 cursor-zoom-out"
                            priority
                        />
                    </motion.div>
                </motion.div>
            )}

            <div className="flex flex-col space-y-4">
                {/* Main Image Carousel */}
                <div
                    className="relative w-full h-[280px] sm:h-[360px] md:h-[450px] lg:h-[480px] overflow-hidden rounded-xl cursor-zoom-in"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => {
                        setIsPaused(false);
                        setIsZoomed(false);
                    }}
                >
                    <Slider ref={mainSliderRef} {...mainSliderSettings}>
                        {displayImages.map((img, index) => (
                            <div key={index} className="relative w-full h-full">
                                <div
                                    className="relative w-full h-[280px] sm:h-[360px] md:h-[450px] lg:h-[480px] flex justify-center items-center overflow-hidden"
                                    onMouseMove={handleMouseMove}
                                    onMouseEnter={() => setIsZoomed(true)}
                                    onMouseLeave={() => setIsZoomed(false)}
                                    onClick={(e) => toggleFullscreen(e, index)}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <button
                                        className="absolute top-3 right-3 z-10 bg-black/70 text-white p-2 rounded-full"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleFullscreen(e, index);
                                        }}
                                        onMouseDown={(e) => e.preventDefault()}
                                        aria-label="View fullscreen"
                                    >
                                        <Maximize2 size={20} />
                                    </button>
                                    <div
                                        className={`transition-all duration-75 w-full h-full ${isZoomed ? "scale-[2]" : "scale-100"}`}
                                        style={isZoomed ? { transformOrigin: `${zoomPosition.x * 200}% ${zoomPosition.y * 200}%` } : {}}
                                    >
                                        <Image
                                            src={img || "/placeholder.svg"}
                                            alt={`Product Image ${index + 1}`}
                                            fill
                                            className="object-contain"
                                            priority={index === 0}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 transform transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                                        <h3 className="text-lg font-semibold">Product Image {index + 1}</h3>
                                        <p className="text-sm opacity-80">Click to view full details</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>

                {/* Thumbnail Navigation */}
                {displayImages.length > 1 && (
                    <div className="w-full relative hidden md:block">
                        <Slider ref={thumbnailSliderRef} {...thumbnailSliderSettings}>
                            {displayImages.map((img, index) => (
                                <div key={index} className="px-1">
                                    <button
                                        className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 h-20 w-full ${currentSlide === index ? "border-black" : "border-gray-200 opacity-70"}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleThumbnailClick(index);
                                        }}
                                        onMouseDown={(e) => e.preventDefault()}
                                        aria-label={`Go to image ${index + 1}`}
                                    >
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={img || "/placeholder.svg"}
                                                alt={`Thumbnail ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </Slider>
                    </div>
                )}

                {/* Image counter */}
                {/* <div className="text-center text-sm text-gray-600">
                    {currentSlide + 1} / {displayImages.length}
                </div> */}
            </div>
        </div>
    );
}

export default Photos;