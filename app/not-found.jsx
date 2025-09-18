"use client";

import Link from "next/link";
import Header from "./components/header/Header";
import Footer from "./components/Footer";


export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header />

            {/* Page content */}
            <div className=" min-h-[70vh] flex flex-col items-center justify-center flex-1 bg-gray-100 px-4">
                <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-center text-gray-600 mb-6">
                    Oops! The page you are looking for does not exist.
                </p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Go Back Home
                </Link>

            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
