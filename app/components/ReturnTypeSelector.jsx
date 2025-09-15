/* eslint-disable react/no-danger */
"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, X, Info } from "lucide-react"

export default function ReturnTypeSelector({
  open,
  onClose,
  onConfirm, // (payload) => void where payload = { id, title, fee, termsHtml }
  productPrice = 0,
}) {
  const [selected, setSelected] = useState(null)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [selectedTerms, setSelectedTerms] = useState("")

  useEffect(() => {
    if (open) {
      setSelected(null)
      setIsTermsOpen(false)
      setSelectedTerms("")
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
      const t = setTimeout(() => setAnimate(true), 10)
      return () => clearTimeout(t)
    } else {
      setAnimate(false)
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset"
    }
  }, [open])

  const fees = useMemo(() => {
    const base = Number(productPrice) || 0
    const easyReturn = Math.round(160 + 0.05 * base)
    const easyReplacement = 30
    const selfShipping = 0
    return { easyReturn, easyReplacement, selfShipping }
  }, [productPrice])

  const returnOptions = useMemo(
    () => [
      {
        id: "easy-return",
        title: "Easy Return",
        description: "Hassle-free pickup and refund processing.",
        price: `${fees.easyReturn}`,
        fee: fees.easyReturn,
        icon: "🚚",
        recommended: true,
        terms: `
          <h3>Easy Return - Terms</h3>
          <ul>
            <li>Pickup scheduled within 24-48 hours.</li>
            <li>Refund initiated after quality check.</li>
            <li>Fee includes ₹160 + 5% of product price.</li>
          </ul>
        `,
      },
      {
        id: "easy-replacement",
        title: "Easy Replacement",
        description: "Quick replacement if the item is defective or not as described.",
        price: "39",
        fee: fees.easyReplacement,
        icon: "🔄",
        recommended: false,
        terms: `
          <h3>Easy Replacement - Terms</h3>
          <ul>
            <li>Replacement initiated after verification.</li>
            <li>Flat handling charge of ₹30 applies.</li>
            <li>Subject to stock availability.</li>
          </ul>
        `,
      },
      {
        id: "self-shipping",
        title: "Self Shipping",
        description: "Ship the item yourself with your preferred courier.",
        price: "0",
        fee: fees.selfShipping,
        icon: "📦",
        recommended: false,
        terms: `
          <h3>Self Shipping - Terms</h3>
          <ul>
            <li>You arrange and pay for shipping.</li>
            <li>Provide tracking details for faster processing.</li>
            <li>No return fee charged by us.</li>
          </ul>
        `,
      },
    ],
    [fees],
  )

  const openTerms = (html) => {
    setSelectedTerms(html)
    setIsTermsOpen(true)
  }

  const closeTerms = () => {
    setIsTermsOpen(false)
    setSelectedTerms("")
  }

  const handleConfirm = () => {
    if (!selected) return
    const opt = returnOptions.find((o) => o.id === selected)
    if (!opt) return
    onConfirm({
      id: opt.id,
      title: opt.title,
      fee: opt.fee,
      termsHtml: opt.terms,
    })
    onClose?.()
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" aria-hidden="true" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        className={`fixed left-1/2 top-1/2 z-[101] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl border border-gray-200 transition-all duration-300 ${animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Return Type</h2>
            <p className="text-sm text-gray-600 mt-1">Choose how you'd like to handle returns for this product</p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
            {returnOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg ${selected === option.id
                  ? "border-red-500 bg-red-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-red-300"
                  }`}
              >
                {/* Recommended Badge */}
                {option.recommended && (
                  <div className="absolute -top-2 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Recommended
                  </div>
                )}

                {/* Selection Indicator */}
                {selected === option.id && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1">
                    <Check size={16} />
                  </div>
                )}

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      ₹{option.price}
                      {option.price === "0" && <span className="text-sm font-normal text-green-600 ml-1">FREE</span>}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openTerms(option.terms)
                      }}
                      className="flex items-center gap-1 text-red-500 text-sm font-medium hover:text-red-600 transition-colors"
                    >
                      <Info size={14} />
                      Know more
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="px-8 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {isTermsOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 z-[110]" onClick={closeTerms} />
          <div
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl max-w-2xl w-[90vw] max-h-[80vh] overflow-hidden z-[111] transition-all duration-300 ${animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Terms Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Terms & Conditions</h3>
              <button
                onClick={closeTerms}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close terms"
              >
                <X size={20} />
              </button>
            </div>

            {/* Terms Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div
                className="text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedTerms }}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
