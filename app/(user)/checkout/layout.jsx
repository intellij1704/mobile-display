"use client"

import { useAuth } from "@/context/AuthContext"
import { useUser } from "@/lib/firestore/user/read"
import { CircularProgress } from "@mui/material"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function layout({ children }) {
    const searchParams = useSearchParams()
    const type = searchParams.get("type")
    const productId = searchParams.get("productId")
    const { user } = useAuth()
    const { data, error, isLoading } = useUser({ uid: user?.uid })

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-100">
                <CircularProgress size={50} thickness={4} color="primary" />
                <p className="mt-4 text-gray-600 font-medium">Checking authentication...</p>
            </div>
        );
    }

    if (error) {
        return <div>{error.message}</div>
    }

    if (type === "cart" && (!data?.carts || data?.carts?.length === 0)) {
        return <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
                <img
                    src="/svgs/Empty-pana.svg" alt="Empty Cart"
                    className="w-40 h-40 mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-700">Your Cart is Empty</h2>
                <p className="text-gray-500 text-sm mt-2">
                    Looks like you haven’t added anything yet.
                </p>
                <Link href="/product" className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Continue Shopping
                </Link>
            </div>
        </div>
    }

    if (type === "buynow" && !productId) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <h2 className="text-xl font-semibold text-red-500">Product Not Found</h2>
                    <p className="text-gray-600 mt-2">The product you are looking for does not exist or has been removed.</p>
                    <Link href="/" className="mt-4 inline-block bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                        Go Back Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>

            {children}
        </>
    )
}

export default layout