import Image from 'next/image';

import banner from '@/public/banner.jpg';

function HeroSection() {
    return (
        <div className='relative w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden'>
            <Image
                src={banner}
                alt='Hero Banner'
                layout='fill'
                objectFit='cover'
                className='absolute top-0 left-0 w-full h-full'
            />
            <div className='relative z-10 text-center text-white px-6'>
                <h1 className='text-4xl md:text-6xl font-bold drop-shadow-lg'>
                    Welcome to Our Website
                </h1>
                <p className='text-lg md:text-xl mt-4 drop-shadow-md'>
                    Discover amazing products and deals.
                </p>
                <button className='mt-6 bg-[#01AF57] hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md'>
                    Shop Now
                </button>
            </div>
            <div className='absolute inset-0 bg-black/50'></div>
        </div>
    );
}

export default HeroSection;