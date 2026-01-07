"use client"
import { AuthContextProvider } from '@/context/AuthContext';

import Header from '../components/header/Header';
import Footer from '../components/footer/Footer';

function layout({ children }) {
    return (
        <AuthContextProvider>
            <Header />
            {children}
            <Footer />
        </AuthContextProvider>
    )
}

export default layout