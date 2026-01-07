"use client"

import Header from '../components/header/Header'
import Footer from '../components/footer/Footer'
import { AuthContextProvider, useAuth } from '@/context/AuthContext'
import { CircularProgress } from '@mui/material'
import Link from 'next/link'

function layout({ children }) {
    return (
        <main>
            <Header />
            <AuthContextProvider>
                <UserChecking>
                    <section className="min-h-screen">{children}</section>

                </UserChecking>

            </AuthContextProvider>
            <Footer />
        </main>
    )
}

export default layout

function UserChecking({ children }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-100">
                <CircularProgress size={50} thickness={4} color="primary" />
                <p className="mt-4 text-gray-600 font-medium">Checking authentication...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-50 px-6 text-center">
                <div className="max-w-md p-6 ">
                    <p className="mt-2 text-gray-600">Please sign in to continue accessing this page.</p>
                    <Link
                        href="/login"
                        className="mt-4 inline-block bg-red-500 text-white px-5 py-2 rounded-md text-sm font-medium shadow-md hover:bg-red-700 transition"
                    >
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
