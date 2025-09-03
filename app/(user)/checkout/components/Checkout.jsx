"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { ChevronLeft, CreditCard, Truck, X } from "lucide-react"

// External app hooks and actions (same as original)
import { useAuth } from "@/context/AuthContext"
import { createCheckoutCODAndGetId } from "@/lib/firestore/checkout/write"
import { useSpecialOffers } from "@/lib/firestore/specialOffers/read"
import { useCategories } from "@/lib/firestore/categories/read"
import { useShippingSettings } from "@/lib/firestore/shipping/read"

// ---------- UI Helpers ----------
function Spinner() {
    return (
        <div
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700"
            aria-label="Loading"
        />
    )
}

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded-md bg-white/60 shadow-sm ${className}`} />
}

function Divider() {
    return <hr className="my-4 border-gray-200" />
}

function SectionCard({ title, children, footer, className = "" }) {
    return (
        <section className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>
            {title ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2> : null}
            {children}
            {footer ? <div className="pt-4 mt-4 border-t border-gray-100">{footer}</div> : null}
        </section>
    )
}

// ---------- Contact + Address ----------
function ContactForm({ address, errors, onChange, onSave, saving }) {
    return (
        <SectionCard title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                    label="First Name *"
                    name="firstName"
                    value={address.firstName}
                    onChange={onChange}
                    error={errors.firstName}
                    placeholder="John"
                />
                <Field label="Last Name" name="lastName" value={address.lastName} onChange={onChange} placeholder="Doe" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Field
                    label="Email *"
                    name="email"
                    type="email"
                    value={address.email}
                    onChange={onChange}
                    error={errors.email}
                    placeholder="you@email.com"
                />
                <Field
                    label="Phone *"
                    name="phone"
                    type="tel"
                    value={address.phone}
                    onChange={onChange}
                    error={errors.phone}
                    placeholder="+91 9876543210"
                />
            </div>

            <Divider />

            <h3 className="text-base font-semibold text-gray-900 mb-3">Shipping Address</h3>
            <div className="grid grid-cols-1 gap-4">
                <SelectField
                    label="Country/Region *"
                    name="country"
                    value={address.country}
                    onChange={onChange}
                    options={[
                        { label: "India", value: "India" },
                        { label: "United States", value: "USA" },
                        { label: "United Kingdom", value: "UK" },
                    ]}
                />
                <Field
                    label="Street Address *"
                    name="streetAddress"
                    value={address.streetAddress}
                    onChange={onChange}
                    error={errors.streetAddress}
                    placeholder="123 Main St"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Field
                    label="City *"
                    name="city"
                    value={address.city}
                    onChange={onChange}
                    error={errors.city}
                    placeholder="Mumbai"
                />
                <Field
                    label="State *"
                    name="state"
                    value={address.state}
                    onChange={onChange}
                    error={errors.state}
                    placeholder="Maharashtra"
                />
                <Field
                    label="PIN Code *"
                    name="pinCode"
                    value={address.pinCode}
                    onChange={onChange}
                    error={errors.pinCode}
                    placeholder="400001"
                />
            </div>

            <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">We’ll use your contact to send order updates.</p>
                <button
                    onClick={onSave}
                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-black transition-colors"
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <Spinner />
                            <span className="ml-2">Saving...</span>
                        </>
                    ) : (
                        "Save & Next"
                    )}
                </button>
            </div>
        </SectionCard>
    )
}

function Field({ label, name, value, onChange, error, placeholder, type = "text" }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-gray-900/30 ${error ? "border-red-500" : "border-gray-300"}`}
            />
            {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
        </div>
    )
}

function SelectField({ label, name, value, onChange, options }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:ring-2 focus:ring-gray-900/30"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

// ---------- Order Summary ----------
function ProductRow({ item, estimatedDelivery, getCategoryName }) {
    const qty = item?.quantity || 0
    const price = item?.product?.salePrice || 0
    const total = qty * price

    console.log(item)
    return (
        <div className="flex items-start justify-between">
            <div className="flex items-start">
                <div className="mr-3 rounded-lg bg-gray-100 overflow-hidden md:w-40 w-32 h-auto flex items-center justify-center">
                    <img
                        src={item?.product?.featureImageURL || "/product-img.png"}
                        alt={item?.product?.title || "Product"}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        {item?.product?.title}
                        {item?.selectedQuality ? ` - ${item.selectedQuality}` : ""}
                        {item?.selectedColor ? ` - ${item.selectedColor}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {qty}</p>
                    <p className="text-xs text-gray-500">Category: {getCategoryName(item?.product?.categoryId)}</p>
                    <p className="text-xs text-gray-500">Category:{item?.returnType}</p>
                    {/* <p className="text-xs text-gray-500">ETA: {estimatedDelivery}</p> */}
                </div>
            </div>
            <p className="text-sm font-medium text-gray-900">
                ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </div>
    )
}

function FeesLines({
    totalPrice,
    discountLines,
    shippingCharge,
    minFreeDelivery,
    deliveryType,
    airExpressFee,
    returnFees,
    replacementFees,
    onToggleExpress,
}) {
    return (
        <div className="mt-3">
            <Line label="Subtotal" value={totalPrice} />
            {discountLines.map((l, idx) => (
                <Line key={idx} label={l.label} value={-Math.abs(l.amount)} muted />
            ))}

            <div className="mt-2">
                <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>Standard Shipping</span>
                    <span>
                        {shippingCharge > 0
                            ? `₹${shippingCharge.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "Free"}
                    </span>
                </div>
                {shippingCharge ? (
                    <p className="mt-1 text-xs text-gray-500">
                        (Charged as order value is below ₹
                        {minFreeDelivery.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </p>
                ) : null}
            </div>

            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-sm font-medium text-gray-800">Air Express Delivery</span>
                    <input
                        type="checkbox"
                        checked={deliveryType === "express"}
                        onChange={(e) => onToggleExpress(e.target.checked)}
                        className="h-4 w-4 accent-gray-900"
                    />
                </label>
                <p className="mt-1 text-xs text-gray-500">Faster delivery in 1-2 business days. Standard: 4-7 days.</p>
            </div>

            {deliveryType === "express" ? <Line label="Air Express Shipping" value={airExpressFee} muted /> : null}

            <Line label="Return Fees" value={returnFees} muted />
            <Line label="Replacement Fees" value={replacementFees} muted />
        </div>
    )
}

function Line({ label, value, muted }) {
    const negative = value < 0
    return (
        <div className={`mt-2 flex items-center justify-between text-sm ${muted ? "text-gray-700" : "text-gray-900"}`}>
            <span>{label}</span>
            <span className={`${negative ? "text-green-600" : ""}`}>
                {negative ? "-" : ""}₹
                {Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
        </div>
    )
}

// ---------- Coupons ----------
function CouponsBox({ appliedCoupons, appliedOffers, couponError, onRemove, onOpen }) {
    return (
        <div className="mt-4 rounded-lg border bg-white p-4">
            {appliedCoupons.length ? (
                <>
                    {couponError ? <p className="text-xs text-red-500">{couponError}</p> : null}
                    <div className="mt-2 space-y-1">
                        {appliedOffers.map((offer, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                                <p className="text-green-600">
                                    Coupon applied: <strong>{appliedCoupons[idx]}</strong> ({offer.discountPercentage}% off)
                                </p>
                                <button className="text-red-500 hover:underline" onClick={() => onRemove(appliedCoupons[idx])}>
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <span className="text-sm text-gray-700">Apply coupon and get a Big Discount!</span>
            )}
            <Divider />
            <button className="mx-auto block text-sm font-medium text-gray-800 hover:text-black" onClick={onOpen}>
                View all coupons →
            </button>
        </div>
    )
}

function CouponsDrawer({ open, onClose, offers, canApplyCoupon, appliedCoupons, applying, onApply, couponError }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-[999] flex justify-end" onClick={onClose} aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-black/50" />
            <div
                className="relative h-full w-96 bg-white p-6 shadow-2xl rounded-l-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Available Coupons</h3>
                    <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {applying ? (
                    <div className="mb-4 flex items-center justify-center text-gray-700">
                        <Spinner />
                        <span className="ml-2">Applying coupon...</span>
                    </div>
                ) : null}

                {(offers || [])
                    .filter((o) => o.couponCode && o.offerType !== "Prepaid Offer")
                    .map((offer, idx) => {
                        const eligible = canApplyCoupon(offer)
                        const already = appliedCoupons.includes((offer.couponCode || "").toUpperCase())
                        return (
                            <div
                                key={idx}
                                className={`mb-4 rounded-lg border p-4 ${already ? "border-green-400 bg-green-50" : eligible ? "border-gray-200 bg-gray-50" : "border-gray-100 bg-gray-100 opacity-60"}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-base font-semibold text-gray-900">{offer.discountPercentage}% OFF on purchase</p>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-medium text-gray-800">{offer.couponCode}</span> – valid on selected
                                            categories
                                        </p>
                                        {!eligible ? <p className="mt-1 text-xs text-red-400">Not applicable for your cart</p> : null}
                                    </div>
                                    <button
                                        disabled={!eligible || already || applying}
                                        onClick={() => onApply(offer.couponCode)}
                                        className={`rounded-md border px-3 py-1.5 text-sm font-medium ${already ? "bg-gray-400 text-white border-gray-400" : eligible ? "bg-black text-white border-black" : "bg-gray-100 text-gray-400 border-gray-200"}`}
                                    >
                                        {already ? "Applied" : "Apply"}
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                {couponError ? <p className="text-sm text-red-500">{couponError}</p> : null}
            </div>
        </div>
    )
}

// ---------- Payment ----------
function PaymentMode({ paymentMode, setPaymentMode, disableCOD }) {
    return (
        <div className="space-y-3">
            <button
                onClick={() => !disableCOD && setPaymentMode("cod")}
                disabled={disableCOD}
                className={`w-full text-left rounded-xl border p-4 transition ${paymentMode === "cod" ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"} ${disableCOD ? "cursor-not-allowed opacity-60" : ""}`}
            >
                <div className="flex items-start">
                    <RadioDot selected={paymentMode === "cod"} />
                    <div className="ml-2">
                        <div className="flex items-center">
                            <Truck className="mr-2 h-5 w-5 text-gray-700" />
                            <span className="font-medium text-gray-900">Cash on Delivery</span>
                        </div>
                        <p className="ml-7 mt-1 text-sm text-gray-500">Pay when you receive the order</p>
                        {disableCOD ? (
                            <p className="ml-7 mt-1 text-sm text-red-500">Coupons applied — Cash on Delivery is not available.</p>
                        ) : null}
                    </div>
                </div>
            </button>

            <button
                onClick={() => setPaymentMode("online")}
                className={`w-full text-left rounded-xl border p-4 transition ${paymentMode === "online" ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}
            >
                <div className="flex items-start">
                    <RadioDot selected={paymentMode === "online"} />
                    <div className="ml-2">
                        <div className="flex items-center">
                            <CreditCard className="mr-2 h-5 w-5 text-gray-700" />
                            <span className="font-medium text-gray-900">Pay Online</span>
                        </div>
                        <p className="ml-7 mt-1 text-sm text-gray-500">Secure payment online</p>
                    </div>
                </div>
            </button>
        </div>
    )
}

function RadioDot({ selected }) {
    return (
        <div
            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${selected ? "bg-gray-900" : "border border-gray-400"}`}
        >
            {selected ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
        </div>
    )
}

// ---------- Main Component ----------
export default function Checkout({ productList }) {
    const router = useRouter()
    const { user } = useAuth()
    const { categoriesMap } = useCategories()
    const { data: specialOffers, isLoading: offersLoading } = useSpecialOffers()
    const { data: shippingData } = useShippingSettings()

    const [step, setStep] = useState("contact")
    const [savingContact, setSavingContact] = useState(false)
    const [placing, setPlacing] = useState(false)
    const [paymentMode, setPaymentMode] = useState("cod")
    const [deliveryType, setDeliveryType] = useState("standard")
    const [showDrawer, setShowDrawer] = useState(false)
    const [couponLoading, setCouponLoading] = useState(false)
    const [couponError, setCouponError] = useState(null)
    const [appliedCoupons, setAppliedCoupons] = useState([])
    const [appliedOffers, setAppliedOffers] = useState([])
    const [errors, setErrors] = useState({})

    const [address, setAddress] = useState({
        firstName: "",
        lastName: "",
        country: "India",
        streetAddress: "",
        city: "",
        state: "",
        pinCode: "",
        phone: "",
        email: "",
    })

    // Helpers from original logic
    const cartCategorySet = useMemo(() => new Set(productList?.map((item) => item.product?.categoryId)), [productList])
    const allCategories = useMemo(() => [...cartCategorySet], [cartCategorySet])
    const getCategoryName = (categoryId) => {
        const category = categoriesMap.get(categoryId)
        return category ? category.name : "Unknown Category"
    }

    const canApplyCoupon = (coupon) => {
        const couponCategories = coupon?.categories || []
        return couponCategories.some((cat) => cartCategorySet.has(cat))
    }

    function handleAddressChange(e) {
        const { name, value } = e.target
        setAddress((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
    }

    function validateForm() {
        const newErrors = {}
        if (!address.firstName) newErrors.firstName = "First name is required"
        if (!address.streetAddress) newErrors.streetAddress = "Address is required"
        if (!address.city) newErrors.city = "City is required"
        if (!address.state) newErrors.state = "State is required"
        if (!address.pinCode) newErrors.pinCode = "PIN code is required"
        if (!address.phone) newErrors.phone = "Phone is required"
        if (!address.email) newErrors.email = "Email is required"
        else if (!/^\S+@\S+\.\S+$/.test(address.email)) newErrors.email = "Email is invalid"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function onSaveContactNext() {
        if (!validateForm()) {
            toast.error("Please fill all required fields correctly")
            return
        }
        setSavingContact(true)
        setTimeout(() => {
            setSavingContact(false)
            setStep("summary")
            window.scrollTo({ top: 0, behavior: "smooth" })
        }, 500)
    }

    // Pricing logic (unchanged)
    const totalPrice = useMemo(() => {
        return productList?.reduce((prev, curr) => prev + (curr?.quantity || 0) * (curr?.product?.salePrice || 0), 0) || 0
    }, [productList])

    const { data: offersRaw } = { data: useSpecialOffers().data } // ensure same source if above is destructured
    const prepaidOffers = useMemo(
        () => (specialOffers || offersRaw || []).filter((o) => o.offerType === "Prepaid Offer") || [],
        [specialOffers, offersRaw],
    )

    const categoryMaxPrepaid = useMemo(() => {
        const map = {}
        for (const cat of allCategories) {
            let maxP = 0
            for (const po of prepaidOffers) {
                if (po.categories?.includes(cat)) maxP = Math.max(maxP, po.discountPercentage || 0)
            }
            if (maxP > 0) map[cat] = maxP
        }
        return map
    }, [allCategories, prepaidOffers])

    const couponPMap = useMemo(() => {
        const m = {}
        for (const offer of appliedOffers) {
            const cp = offer.discountPercentage || 0
            for (const cat of offer.categories || []) {
                if (!m[cat] || cp > m[cat]) m[cat] = cp
            }
        }
        return m
    }, [appliedOffers])

    const { discountLines, discount } = useMemo(() => {
        const lines = []
        let d = 0
        for (const cat of allCategories) {
            const catSum = productList
                .filter((item) => item.product?.categoryId === cat)
                .reduce((sum, item) => sum + (item.quantity || 0) * (item.product?.salePrice || 0), 0)
            if (!catSum) continue

            const couponP = couponPMap[cat] || 0
            const prepaidP = categoryMaxPrepaid[cat] || 0

            let effectiveP = 0
            let displayCouponP = 0
            let displayAdditionalP = 0

            if (paymentMode === "cod") {
                effectiveP = couponP
                displayCouponP = couponP
            } else {
                if (couponP > 0) {
                    if (couponP < prepaidP) {
                        displayCouponP = couponP
                        displayAdditionalP = prepaidP - couponP
                        effectiveP = prepaidP
                    } else {
                        displayCouponP = couponP
                        effectiveP = couponP
                    }
                } else {
                    displayAdditionalP = prepaidP
                    effectiveP = prepaidP
                }
            }

            const catDiscount = catSum * (effectiveP / 100)
            d += catDiscount

            if (displayCouponP > 0) {
                lines.push({
                    label: `Coupon Discount for ${categoriesMap.get(cat)?.name || "Unknown Category"} (${displayCouponP}%)`,
                    amount: -(catSum * (displayCouponP / 100)),
                })
            }
            if (displayAdditionalP > 0) {
                const prefix = displayCouponP > 0 ? "Additional " : ""
                lines.push({
                    label: `${prefix}Prepaid Discount for ${categoriesMap.get(cat)?.name || "Unknown Category"} (${displayAdditionalP}%)`,
                    amount: -(catSum * (displayAdditionalP / 100)),
                })
            }
        }
        return { discountLines: lines, discount: d }
    }, [allCategories, productList, couponPMap, categoryMaxPrepaid, paymentMode, categoriesMap])

    const { minFreeDelivery, shippingExtraCharges, airExpressDeliveryCharge } = {
        minFreeDelivery: shippingData?.minFreeDeliveryAmount || 499,
        shippingExtraCharges: shippingData?.shippingExtraCharges || 0,
        airExpressDeliveryCharge: shippingData?.airExpressDeliveryCharge || 0,
    }

    const returnFees = useMemo(() => {
        return productList.reduce((sum, item) => {
            if (item?.returnType === "easy-return") {
                const itemSubtotal = (item?.quantity || 0) * (item?.product?.salePrice || 0)
                return sum + 160 + 0.05 * itemSubtotal
            }
            return sum
        }, 0)
    }, [productList])

    const replacementFees = useMemo(() => {
        return productList.reduce((sum, item) => {
            if (item?.returnType === "easy-replacement") return sum + 30
            return sum
        }, 0)
    }, [productList])

    const subtotalAfterDiscount = Math.max(0, totalPrice - discount)
    const shippingCharge = subtotalAfterDiscount >= minFreeDelivery ? 0 : shippingExtraCharges
    const airExpressFee = deliveryType === "express" ? airExpressDeliveryCharge : 0

    const total = subtotalAfterDiscount + shippingCharge + airExpressFee + returnFees + replacementFees
    const advance =
        paymentMode === "cod"
            ? subtotalAfterDiscount * 0.1 + shippingCharge + airExpressFee + returnFees + replacementFees
            : total
    const remaining = paymentMode === "cod" ? total - advance : 0

    function onToggleExpress(checked) {
        setDeliveryType(checked ? "express" : "standard")
    }

    function getEstimatedDelivery() {
        const today = new Date()
        const startDays = deliveryType === "express" ? 2 : 4
        const endDays = deliveryType === "express" ? 5 : 7
        const start = new Date(today)
        start.setDate(start.getDate() + startDays)
        const end = new Date(today)
        end.setDate(end.getDate() + endDays)
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]
        const fmt = (d) => `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`
        const s = fmt(start),
            e = fmt(end)
        const [sd, sr] = s.split(" ", 2)
        const [ed, er] = e.split(" ", 2)
        return sr === er ? `${sd}-${ed} ${sr}` : `${s} - ${e}`
    }
    const estimatedDelivery = getEstimatedDelivery()

    async function handlePlaceOrder() {
        if (!validateForm()) {
            toast.error("Please fill all required fields correctly")
            return
        }
        try {
            if (totalPrice <= 0) throw new Error("Price should be greater than 0")
            if (!productList || productList.length === 0) throw new Error("Product List Is Empty")
            if (paymentMode === "online") throw new Error("Online Payment Option Not Available")

            setPlacing(true)

            const serializedAppliedOffers = appliedOffers.map((offer) => ({
                couponCode: offer.couponCode,
                discountPercentage: offer.discountPercentage,
                categories: offer.categories,
            }))

            const checkoutId = await createCheckoutCODAndGetId({
                uid: user?.uid,
                products: productList,
                address: {
                    fullName: `${address.firstName} ${address.lastName}`.trim(),
                    mobile: address.phone,
                    email: address.email,
                    addressLine1: address.streetAddress,
                    city: address.city,
                    state: address.state,
                    pincode: address.pinCode,
                    country: address.country,
                },
                deliveryType,
                appliedCoupons,
                appliedOffers: serializedAppliedOffers,
            })

            router.push(`/checkout-cod?checkout_id=${checkoutId}`)
        } catch (err) {
            toast.error(err?.message || "Failed to place order")
        } finally {
            setPlacing(false)
        }
    }

    // Coupon handlers
    async function handleAddCoupon(code) {
        setCouponError(null)
        setCouponLoading(true)
        try {
            const upper = (code || "").toUpperCase().trim()
            if (!upper) return
            if (appliedCoupons.includes(upper)) {
                setCouponError("This coupon is already applied")
                return
            }
            if (!specialOffers) {
                setCouponError("Loading offers, please wait...")
                return
            }
            const offer = specialOffers.find((o) => o.couponCode?.toUpperCase() === upper && o.offerType !== "Prepaid Offer")
            if (!offer) {
                setCouponError("Invalid Coupon")
                return
            }
            if (!canApplyCoupon(offer)) {
                setCouponError("This coupon does not apply to your cart")
                return
            }
            setAppliedOffers((prev) => [...prev, offer])
            setAppliedCoupons((prev) => [...prev, upper])
        } finally {
            setCouponLoading(false)
        }
    }

    function handleRemoveCoupon(code) {
        const idx = appliedCoupons.findIndex((c) => c === code)
        if (idx > -1) {
            setAppliedCoupons(appliedCoupons.filter((_, i) => i !== idx))
            setAppliedOffers(appliedOffers.filter((_, i) => i !== idx))
        }
    }

    const disableCOD = appliedCoupons.length > 0

    // Best offer (preserved)
    const bestOffer = (specialOffers || [])
        .filter(
            (o) => o.couponCode && o.offerType !== "Prepaid Offer" && o.categories?.some((c) => allCategories.includes(c)),
        )
        .sort((a, b) => b.discountPercentage - a.discountPercentage)?.[0]

    const loadingSummary = offersLoading && step === "summary"

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <div className="mx-auto w-full max-w-xl px-4 pt-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition"
                >
                    <ChevronLeft className="mr-1 h-5 w-5" />
                    Back to cart
                </button>
            </div>

            {/* Title */}
            <header className="mx-auto w-full max-w-xl px-4 pt-4">
                <h1 className="text-balance text-2xl font-bold text-gray-900">Checkout</h1>
                <StepIndicator step={step} />
            </header>

            <main className="mx-auto w-full max-w-xl px-4 py-6 space-y-6">
                {/* Step 1: Contact */}
                {step === "contact" ? (
                    <ContactForm
                        address={address}
                        errors={errors}
                        onChange={handleAddressChange}
                        onSave={onSaveContactNext}
                        saving={savingContact}
                    />
                ) : null}

                {/* Step 2: Summary (Order Summary + Subtotal & Fees) */}
                {step === "summary" ? (
                    <>
                        <SectionCard className="relative" title="Order Summary">
                            {loadingSummary ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-24" />
                                    <Skeleton className="h-24" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {productList?.map((item, idx) => (
                                        <ProductRow
                                            key={idx}
                                            item={item}
                                            estimatedDelivery={estimatedDelivery}
                                            getCategoryName={getCategoryName}
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <button
                                    className="text-gray-700 hover:text-black text-left underline underline-offset-4"
                                    onClick={() => setStep("contact")}
                                >
                                    Edit contact & address
                                </button>
                                {bestOffer ? (
                                    <span className="text-xs text-gray-600">
                                        Best available coupon: {bestOffer.couponCode} ({bestOffer.discountPercentage}%)
                                    </span>
                                ) : null}
                            </div>
                        </SectionCard>

                        <SectionCard title="Subtotal & Fees">
                            {loadingSummary ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-6" />
                                    <Skeleton className="h-6" />
                                    <Skeleton className="h-6" />
                                    <Skeleton className="h-10" />
                                </div>
                            ) : (
                                <>
                                    <FeesLines
                                        totalPrice={totalPrice}
                                        discountLines={discountLines}
                                        shippingCharge={shippingCharge}
                                        minFreeDelivery={minFreeDelivery}
                                        deliveryType={deliveryType}
                                        airExpressFee={airExpressFee}
                                        returnFees={returnFees}
                                        replacementFees={replacementFees}
                                        onToggleExpress={onToggleExpress}
                                    />

                                    <Divider />

                                    <CouponsBox
                                        appliedCoupons={appliedCoupons}
                                        appliedOffers={appliedOffers}
                                        couponError={couponError}
                                        onRemove={handleRemoveCoupon}
                                        onOpen={() => setShowDrawer(true)}
                                    />

                                    <Divider />

                                    <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                                        <span>Total</span>
                                        <span>
                                            ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setStep("payment")
                                            window.scrollTo({ top: 0, behavior: "smooth" })
                                        }}
                                        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black transition-colors"
                                    >
                                        Proceed to Pay
                                    </button>
                                </>
                            )}
                        </SectionCard>
                    </>
                ) : null}

                {/* Step 3: Payment */}
                {step === "payment" ? (
                    <>
                        <SectionCard title="Payment">
                            <div className="mb-4 flex items-center justify-between">
                                <button
                                    className="text-sm text-gray-700 hover:text-black underline underline-offset-4"
                                    onClick={() => setStep("summary")}
                                >
                                    Back to Summary
                                </button>
                                <div className="text-sm text-gray-700">
                                    Total:&nbsp;
                                    <span className="font-semibold text-gray-900">
                                        ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <PaymentMode paymentMode={paymentMode} setPaymentMode={setPaymentMode} disableCOD={disableCOD} />

                            {paymentMode === "cod" ? (
                                <div className="mt-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                    <div className="flex items-center justify-between">
                                        <span>10% Advance is charged to avoid non-genuine orders</span>
                                        <span>
                                            ₹{advance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Pay remaining balance on delivery in cash</span>
                                        <span>
                                            ₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            ) : null}

                            <div className="mt-5 rounded-md bg-gray-100 p-4 text-sm text-gray-700">
                                <img
                                    src="https://imgstatic.phonepe.com/images/online-merchant-assets/plugins/woocommerce/2529/405/payment_gateway_logo.png"
                                    alt="PhonePe"
                                    className="mb-2 h-7"
                                />
                                <p>All UPI apps, Debit/Credit Cards, and NetBanking accepted | Powered by PhonePe</p>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black transition-colors"
                                disabled={placing}
                            >
                                {placing ? (
                                    <>
                                        <Spinner />
                                        <span className="ml-2">Placing order...</span>
                                    </>
                                ) : (
                                    "Place Order"
                                )}
                            </button>
                        </SectionCard>
                    </>
                ) : null}
            </main>

            <CouponsDrawer
                open={showDrawer}
                onClose={() => setShowDrawer(false)}
                offers={specialOffers}
                canApplyCoupon={canApplyCoupon}
                appliedCoupons={appliedCoupons}
                applying={couponLoading}
                onApply={handleAddCoupon}
                couponError={couponError}
            />
        </div>
    )
}

function StepIndicator({ step }) {
    const isContact = step === "contact"
    const isSummary = step === "summary"
    const isPayment = step === "payment"
    return (
        <div className="mt-3 flex items-center gap-3 text-sm">
            <StepPill active={isContact}>1. Contact</StepPill>
            <div className="h-px flex-1 bg-gray-200" />
            <StepPill active={isSummary}>2. Summary</StepPill>
            <div className="h-px flex-1 bg-gray-200" />
            <StepPill active={isPayment}>3. Payment</StepPill>
        </div>
    )
}

function StepPill({ active, children }) {
    return (
        <div
            className={`rounded-full md:px-3 px-2 py-1 ${active ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
        >
            {children}
        </div>
    )
}
