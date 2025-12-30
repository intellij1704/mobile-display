import React from "react";

function AboutHero() {
    return (
        <div className="relative bg-white overflow-hidden h-auto ">
            <div className="max-w-8xl mx-auto py-12 px-4 sm:px-6 lg:px-20 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-[450px]">
                    {/* Text Section */}
                    <div className="w-full lg:w-1/2 p-4 flex flex-col justify-center">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                            ABOUT US
                        </h1>

                        <p className="text-base sm:text-md mb-2 text-gray-800 leading-relaxed font-medium">
                            Powering Mobile Spare Parts with Premium Quality Parts You Can Trust
                        </p>

                        <p className="text-base sm:text-md mb-2 text-gray-800 leading-relaxed">
                            Welcome to{" "}
                            <a
                                href="https://www.mobiledisplay.in"
                                className="text-[#C00508] font-semibold"
                            >
                                mobiledisplay.in
                            </a>
                            , a trusted online destination for mobile phone spare parts,
                            accessories, and repair solutions, operated by IntelliJ
                            Technologies, based in Kolkata, India.
                        </p>

                        <p className="text-base sm:text-md mb-2 text-gray-800 leading-relaxed">
                            Founded with the vision of simplifying access to quality mobile
                            components, mobiledisplay.in serves end consumers, mobile repair
                            technicians, service centers, and resellers across India.
                        </p>

                        <p className="text-base sm:text-md mb-4 text-gray-800 leading-relaxed font-semibold">
                            Flexible payment options, including Cash on Delivery.
                        </p>

                        {/* What We Offer Section */}
                        <div className="mt-4">
                            <h2 className="text-lg font-bold mb-2 text-black">
                                What We Offer
                            </h2>

                            <p className="text-sm text-gray-700 mb-3">
                                We specialize in a wide range of mobile phone spare parts and
                                accessories, including but not limited to:
                            </p>

                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                                <li>Mobile Displays & Touch Screens</li>
                                <li>Flex Cables, ICs & LEDs</li>
                                <li>Speakers, Microphones & Keypads</li>
                                <li>Batteries & Charging Components</li>
                                <li>Mobile Repair Tools & Tool Kits</li>
                                <li>
                                    Mobile Accessories such as Chargers, Holders, Cases & Covers
                                </li>
                            </ul>

                            <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                                Each product is carefully sourced to ensure compatibility,
                                quality, and value—helping customers make the right purchase for
                                their specific device models.
                            </p>
                        </div>

                        {/* Serving Section */}
                        <div className="mt-5">
                            <h2 className="text-lg font-bold mb-2 text-black">
                                Serving Both Consumers & Professionals
                            </h2>

                            <p className="text-sm text-gray-700 mb-2">
                                mobiledisplay.in proudly caters to:
                            </p>

                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                                <li>
                                    Individual customers (B2C) looking to repair or upgrade their
                                    devices
                                </li>
                                <li>
                                    Professional repair technicians & service centers (B2B)
                                    requiring dependable spare parts
                                </li>
                            </ul>
                        </div>

                        <p className="text-sm text-gray-700 mt-3 leading-relaxed">Whether it’s a single replacement part or bulk requirements (if you are a shop owner, register as a shop to get discounted price), we strive to deliver consistent quality and dependable service.
                        </p>
                    </div>

                    {/* Image Grid Section */}
                    <div className="w-full lg:w-1/2 flex-1 p-4">
                        <div className="grid grid-cols-2 gap-4 max-w-[500px] mx-auto">
                            <img
                                alt="Various mobile spare parts and tools"
                                className="rounded-lg col-span-2 w-full h-48 sm:h-64 lg:h-48 object-cover shadow-md"
                                src="/about-hero1.png"
                            />
                            <img
                                alt="Disassembled mobile phone with spare parts"
                                className="rounded-lg w-full h-32 sm:h-40 lg:h-48 object-cover shadow-md"
                                src="/about-hero2.png"
                            />
                            <img
                                alt="Mobile phone repair tools and parts"
                                className="rounded-lg w-full h-32 sm:h-40 lg:h-48 object-cover shadow-md"
                                src="/about-hero3.png"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Curved background */}
            <div className="absolute bottom-0 left-0 right-0 w-full">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    className="w-full h-32 sm:h-40 lg:h-48"
                >
                    <path
                        fill="#F9E1E1"
                        fillOpacity="1"
                        d="M0,160L34.3,165.3C68.6,171,137,181,206,197.3C274.3,213,343,235,411,229.3C480,224,549,192,617,154.7C685.7,117,754,75,823,58.7C891.4,43,960,53,1029,80C1097.1,107,1166,149,1234,144C1302.9,139,1371,85,1406,58.7L1440,32L1440,320L0,320Z"
                    />
                </svg>
            </div>
        </div>
    );
}

export default AboutHero;
