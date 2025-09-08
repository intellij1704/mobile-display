"use client"
import { useRef, useId } from "react"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import { ProductCard } from "./Products"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/autoplay"

function ProductSection({ title, products = [], seeAllLink = "/product" }) {
    const uniqueId = useId()
    const swiperRef = useRef(null)
    const prevRef = useRef(null)
    const nextRef = useRef(null)

    const isValidProducts = Array.isArray(products) && products.length > 0

    return (
        <section className="w-full px-3 max-w-7xl mx-auto py-8 bg-white relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-normal text-[#2F2F2F] capitalize tracking-tight">
                    {title.split(" ")[0]}{" "}
                    <span className="relative inline-block font-semibold text-[#2F2F2F]">
                        {title.split(" ").slice(1).join(" ")}
                        <span className="absolute bottom-0 right-0 w-1/2 h-[4px] mt-10 bg-[#BB0300]"></span>
                    </span>
                </h2>

                <Link
                    href={seeAllLink}
                    className="md:text-2xl text-lg text-[#005EB7] hover:text-blue-800 font-medium transition-all duration-200 hover:underline flex justify-center items-center gap-3"
                >
                    See All
                    <img src="/icon/btn-right.svg" alt="Right Arrow" className="md:h7 md:w-7 h-6 w-6" />
                </Link>
            </div>

            {!isValidProducts ? (
                <div className="text-center text-gray-500">No products available</div>
            ) : (
                <div className="w-full relative">
                    <button
                        ref={prevRef}
                        className="absolute top-1/2 -left-4 z-20 transform -translate-y-1/2 bg-white border border-[#005EB7] rounded-full p-2 shadow-md hover:bg-gray-100 transition-all duration-200 md:block hidden "
                    >
                        <ChevronLeft className="w-5 h-5 text-[#005EB7]" />
                    </button>
                    <button
                        ref={nextRef}
                        className="absolute top-1/2 -right-4 z-20 transform -translate-y-1/2 bg-white border border-[#005EB7] rounded-full p-2 shadow-md hover:bg-gray-100 transition-all duration-200  md:block hidden"
                    >
                        <ChevronRight className="w-5 h-5 text-[#005EB7] " />
                    </button>

                    <Swiper
                        ref={swiperRef}
                        modules={[Navigation, Autoplay]}
                        spaceBetween={12}
                        slidesPerView={5}
                        loop={products.length > 5}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        onBeforeInit={(swiper) => {
                            swiper.params.navigation.prevEl = prevRef.current
                            swiper.params.navigation.nextEl = nextRef.current
                        }}
                        breakpoints={{
                            320: {
                                slidesPerView: 2,
                                spaceBetween: 8,
                            },
                            480: {
                                slidesPerView: 2,
                                spaceBetween: 10,
                            },
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 12,
                            },
                            1024: {
                                slidesPerView: 4,
                                spaceBetween: 12,
                            },
                            1280: {
                                slidesPerView: 5,
                                spaceBetween: 12,
                            },
                        }}
                        className={`product-swiper-${uniqueId}`}
                    >
                        {products.map((product, index) => (
                            <SwiperSlide key={`${uniqueId}-${product.id || index}`}>
                                <ProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </section>
    )
}

export default ProductSection
