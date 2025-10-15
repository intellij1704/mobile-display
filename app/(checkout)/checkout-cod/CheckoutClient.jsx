"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/app/components/header/Header"
import Footer from "@/app/components/Footer"
import Link from "next/link"
import confetti from "canvas-confetti"
import { fetchAndProcessCheckout } from "./actions"
import { CheckCircle, XCircle } from "lucide-react"
function Spinner() {
  return (
    <div className="flex flex-col items-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-700" />
      <p className="mt-3 text-gray-600 text-lg">Processing your order...</p>
    </div>
  )
}
export default function CheckoutClient() {
  const searchParams = useSearchParams()
  const checkoutId = searchParams.get("checkout_id")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  useEffect(() => {
    if (!checkoutId) {
      setError("No checkout ID provided")
      setLoading(false)
      return
    }
    fetchAndProcessCheckout(checkoutId)
      .then(() => {
        setLoading(false)
        setSuccess(true)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [checkoutId])
  useEffect(() => {
    if (success) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    }
  }, [success])
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <Spinner />
      </div>
    )
  }
  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gray-50 px-4">
          <XCircle className="text-red-600 w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold text-red-700 text-center mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Link href="/">
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Go Back Home
            </button>
          </Link>
        </div>
        <Footer />
      </>
    )
  }
  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <section className="flex-1 flex flex-col justify-center items-center px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full text-center animate-fadeIn">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been <span className="font-semibold text-green-600">successfully placed</span>.
          </p>
          <div className="flex flex-row gap-4 justify-center">
            <Link href="/orders">
              <button className="md:px-6 px-3 md:py-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Go to Orders
              </button>
            </Link>
            <Link href="/">
              <button className="md:px-6 px-3 md:py-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}