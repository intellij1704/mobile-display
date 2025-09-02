/* eslint-disable react/no-danger */
"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, X } from "lucide-react"

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
      const t = setTimeout(() => setAnimate(true), 10)
      return () => clearTimeout(t)
    } else {
      setAnimate(false)
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
        price: `${fees.easyReturn} `,
        fee: fees.easyReturn,
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
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" aria-hidden="true" onClick={onClose} />
      {/* Centered Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all duration-200 ${animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100">Select your Return type</h2>

        <div className=" grid md:grid-cols-3 grid-cols-1 gap-4">
          {returnOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`relative border rounded-xl p-4 cursor-pointer transition ${selected === option.id ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-red-300"
                }`}
            >
              {selected === option.id && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                  <Check size={16} />
                </div>
              )}
              <h3 className="text-lg font-semibold">{option.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              <p className="text-sm font-medium text-gray-900 mt-2">₹{option.price}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openTerms(option.terms)
                }}
                className="mt-1 text-red-500 text-sm font-medium"
              >
                Know more
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="px-4 py-2 rounded-lg border border-red-500 text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Bottom Sheet for Terms */}
      {isTermsOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={closeTerms} />
          <div
            className={`fixed left-0 right-0 bottom-0 bg-white p-6 rounded-t-lg max-h-[80vh] overflow-y-auto z-[60] transition-all duration-300 ease-in-out w-full
            md:left-1/2 md:right-auto md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg md:max-w-2xl
            ${animate ? "translate-y-0 md:opacity-100 md:scale-100" : "translate-y-full md:opacity-0 md:scale-95"}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={closeTerms}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close terms"
            >
              <X size={24} />
            </button>
            <div
              className="text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedTerms }}
            />
          </div>
        </>
      )}
    </>
  )
}
