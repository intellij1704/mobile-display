import Footer from "@/app/components/Footer";
import Header from "@/app/components/header/Header";
import Link from "next/link";
import { Suspense } from "react";
import { fetchAndProcessCheckout } from "./actions";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import confetti from "canvas-confetti";
import SuccessMessage from "./components/SuccessMessage";

async function CheckoutProcessor({ searchParams }) {
    const { checkout_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = searchParams;

    if (!checkout_id || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return (
            <main>
                <Header />
                <section className="min-h-screen flex flex-col gap-3 justify-center items-center">
                    <h1 className="text-2xl font-semibold text-red-600">Invalid Payment Details</h1>
                    <p className="text-gray-600">We could not verify your payment. Please contact support.</p>
                </section>
                <Footer />
            </main>
        );
    }

    try {
        await fetchAndProcessCheckout(checkout_id, razorpay_payment_id, razorpay_order_id, razorpay_signature);
        return (
            <section className="min-h-screen flex flex-col gap-4 justify-center items-center text-center  ">

                <SuccessMessage />
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h1 className="text-3xl font-bold text-gray-800">
                    Order Placed Successfully!
                </h1>
                <p className="text-gray-600 max-w-md">
                    Thank you for your purchase. Your order #{checkout_id} is being processed. You will receive a confirmation email shortly.
                </p>
                <div className="flex items-center gap-4 mt-4">
                    <Link href={"/orders"}>
                        <button className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors">
                            View My Orders
                        </button>
                    </Link>
                    <Link href={"/"}>
                        <button className="text-blue-600 border border-blue-600 px-6 py-3 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            Continue Shopping
                        </button>
                    </Link>
                </div>
            </section>
        );
    } catch (error) {
        return (
            <section className="min-h-screen flex flex-col gap-4 justify-center items-center text-center">
                <AlertCircle className="h-16 w-16 text-red-500" />
                <h1 className="text-3xl font-bold text-red-600">Order Processing Failed</h1>
                <p className="text-gray-600 max-w-md">{error.message}</p>
                <p className="text-gray-500">Please contact support with your Order ID: <span className="font-mono text-gray-700">{checkout_id}</span></p>
                <div className="flex items-center gap-4 mt-4">
                    <Link href={"/cart"}>
                        <button className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors">
                            Back to Cart
                        </button>
                    </Link>
                </div>
            </section>
        );
    }
}

function LoadingState() {
    return (
        <section className="min-h-screen flex flex-col gap-4 justify-center items-center">
            <Loader className="h-12 w-12 animate-spin text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-700">Processing Your Order...</h1>
            <p className="text-gray-500">Please do not refresh or close this page.</p>
        </section>
    )
}

export default function Page({ searchParams }) {

    return (
        <main>
            <Header />
            <Suspense fallback={<LoadingState />}>
                <CheckoutProcessor searchParams={searchParams} />
            </Suspense>
            <Footer />
        </main>
    );
}