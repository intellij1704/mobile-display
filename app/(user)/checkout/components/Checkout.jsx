// File: app/checkout/page.jsx or similar (the main checkout component file)
// This is the rewritten Checkout page with Razorpay integration for both COD (advance) and Online (full) payments.
// I've added the loadRazorpay function, modified handlePlaceOrder to create appropriate checkout sessions,
// create Razorpay orders (handled in the backend functions), and open the Razorpay modal.
// On successful payment, the handler redirects to the appropriate success page with payment verification params.
// I've also imported createCheckoutOnlineAndGetId (assuming it's in the same lib).

"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { ChevronLeft } from "lucide-react"

// External app hooks and actions
import { useAuth } from "@/context/AuthContext"
import { createCheckoutCODAndGetId, createCheckoutOnlineAndGetId } from "@/lib/firestore/checkout/write"
import { useSpecialOffers } from "@/lib/firestore/specialOffers/read"
import { useCategories } from "@/lib/firestore/categories/read"
import { useBrands } from "@/lib/firestore/brands/read"
import { useShippingSettings } from "@/lib/firestore/shipping/read"
import { useUser } from "@/lib/firestore/user/read"
import { updateAddresses } from "@/lib/firestore/user/write"
import CouponsDrawer from "./CouponsDrawer"
import AddressSection from "./AddressSection"
import FeesLines from "./FeesLines"
import PaymentMode from "./PaymentMode"
import { data } from "jquery"

// ---------- UI Helpers ----------
export function Spinner() {
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

export function SectionCard({ title, children, footer, className = "" }) {
    return (
        <section className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 ${className}`}>
            {title ? <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2> : null}
            {children}
            {footer ? <div className="pt-4 mt-4 border-t border-gray-100">{footer}</div> : null}
        </section>
    )
}

// Pricing logic helper (moved outside component for stability)
const getItemPrice = (item) => {
    const product = item?.product
    if (!product) return 0
    if (product.isVariable && product.variations?.length > 0) {
        const selectedColor = item.selectedColor
        const selectedQuality = item.selectedQuality
        const selectedBrand = item.selectedBrand
        const matchingVariation = product.variations.find(v => {
            const attrs = v.attributes || {}
            let match = true
            if (selectedColor) {
                match = match && attrs.Color === selectedColor
            }
            if (selectedQuality) {
                match = match && attrs.Quality === selectedQuality
            }
            if (selectedBrand) {
                match = match && attrs.Brand === selectedBrand
            }
            return match
        })
        if (matchingVariation) {
            return parseFloat(matchingVariation.salePrice || matchingVariation.price) || 0
        }
        return 0
    } else {
        return parseFloat(product.salePrice || product.price) || 0
    }
}

// ---------- Contact + Address ----------
function ContactAndAddress({ userData, user, productList }) {
    const router = useRouter()
    const { categoriesMap } = useCategories()
    const { data: brands, isLoading: brandsLoading } = useBrands();

    const { data: specialOffers, isLoading: offersLoading } = useSpecialOffers()
    const { data: shippingData } = useShippingSettings()

    const [step, setStep] = useState("contact")
    const [savingContact, setSavingContact] = useState(false)
    const [placing, setPlacing] = useState(false)
    const [paymentMode, setPaymentMode] = useState("")
    const [deliveryType, setDeliveryType] = useState("standard")
    const [showDrawer, setShowDrawer] = useState(false)
    const [couponLoading, setCouponLoading] = useState(false)
    const [couponError, setCouponError] = useState(null)
    const [appliedCoupons, setAppliedCoupons] = useState([])
    const [appliedOffers, setAppliedOffers] = useState([])
    const [errors, setErrors] = useState({})
    const [addressForm, setAddressForm] = useState({
        fullName: "",
        mobile: "",
        email: "",
        country: "India",
        streetAddress: "",
        city: "",
        state: "",
        pinCode: "",
        landmark: "",
    })
    const [selectedAddressId, setSelectedAddressId] = useState(null)
    const [editingAddressId, setEditingAddressId] = useState(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const dataLayerPushed = useRef(false);

    const addresses = userData?.addresses || []

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find(a => a.isDefault)
            setSelectedAddressId(defaultAddr ? defaultAddr.id : addresses[0].id)
        }
        if (addresses.length === 0) {
            setIsAddingNew(true)
        }
    }, [addresses, selectedAddressId])

    function handleAddressChange(e) {
        const { name, value } = e.target
        setAddressForm((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
    }

    function validateAddressForm() {
        const newErrors = {}
        if (!addressForm.fullName) newErrors.fullName = "Full name is required"
        if (!addressForm.mobile) newErrors.mobile = "Mobile number is required"
        if (!addressForm.email) newErrors.email = "Email is required"
        else if (!/^\S+@\S+\.\S+$/.test(addressForm.email)) newErrors.email = "Email is invalid"
        if (!addressForm.streetAddress) newErrors.streetAddress = "Street address is required"
        if (!addressForm.city) newErrors.city = "City is required"
        if (!addressForm.state) newErrors.state = "State is required"
        if (!addressForm.pinCode) newErrors.pinCode = "PIN code is required"
        return newErrors
    }

    async function handleSaveAddress() {
        const newErrors = validateAddressForm()
        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fill all required fields")
            return
        }

        try {
            let newAddresses = [...addresses]
            let selId
            const isFirstAddress = addresses.length === 0

            if (editingAddressId) {
                newAddresses = newAddresses.map(a =>
                    a.id === editingAddressId ? { ...a, ...addressForm } : a
                )
                selId = editingAddressId
                setEditingAddressId(null)
            } else {
                const newId = crypto.randomUUID()
                const newAddr = {
                    id: newId,
                    ...addressForm,
                    isDefault: isFirstAddress ? true : false
                }
                newAddresses.push(newAddr)
                selId = newId
                setIsAddingNew(false)
            }

            await updateAddresses({ uid: user.uid, addresses: newAddresses })
            setSelectedAddressId(selId)
            setAddressForm({
                fullName: "",
                mobile: "",
                email: "",
                country: "India",
                streetAddress: "",
                city: "",
                state: "",
                pinCode: "",
                landmark: "",
            })
            toast.success("Address saved successfully")
        } catch (err) {
            toast.error(err?.message || "Failed to save address")
        }
    }

    async function handleDeleteAddress(id) {
        if (!confirm("Are you sure you want to delete this address?")) return

        try {
            const newAddresses = addresses.filter(a => a.id !== id)
            await updateAddresses({ uid: user.uid, addresses: newAddresses })
            if (selectedAddressId === id) {
                setSelectedAddressId(newAddresses[0]?.id || null)
            }
            toast.success("Address deleted successfully")
        } catch (err) {
            toast.error(err?.message || "Failed to delete address")
        }
    }

    function startEditing(id) {
        const addr = addresses.find(a => a.id === id)
        if (addr) {
            setAddressForm({
                fullName: addr.fullName,
                mobile: addr.mobile,
                email: addr.email,
                country: addr.country,
                streetAddress: addr.streetAddress,
                city: addr.city,
                state: addr.state,
                pinCode: addr.pinCode,
                landmark: addr.landmark || "",
            })
            setEditingAddressId(id)
            setIsAddingNew(false)
        }
    }

    function cancelAddress() {
        setAddressForm({
            fullName: "",
            mobile: "",
            email: "",
            country: "India",
            streetAddress: "",
            city: "",
            state: "",
            pinCode: "",
            landmark: "",
        })
        setErrors({})
        setEditingAddressId(null)
        setIsAddingNew(false)
    }

    async function onSaveContactNext() {
        if (!selectedAddressId) {
            toast.error("Please select or add a delivery address")
            return
        }
        setSavingContact(true)
        setTimeout(() => {
            setSavingContact(false)
            setStep("summary")
            window.scrollTo({ top: 0, behavior: "smooth" })
        }, 500)
    }

    // Pricing logic (updated for variable products)
    const cartCategorySet = useMemo(() => new Set(productList?.map((item) => item.product?.categoryId)), [productList])
    const allCategories = useMemo(() => [...cartCategorySet], [cartCategorySet])
    const getCategoryName = (categoryId) => {
        const category = categoriesMap.get(categoryId)
        return category ? category.name : "Unknown Category"
    }

    const getBrandName = (brandId) => {
        const brand = brands?.find((b) => b.id === brandId)
        return brand ? brand.name : "Unknown Brand"
    }

    const canApplyCoupon = (coupon) => {
        const couponCategories = coupon?.categories || []
        return couponCategories.some((cat) => cartCategorySet.has(cat))
    }

    const totalPrice = useMemo(() => {
        return productList?.reduce((prev, curr) => {
            const quantity = curr?.quantity || 0
            const itemPrice = getItemPrice(curr)
            return prev + (quantity * itemPrice)
        }, 0) || 0
    }, [productList])

    const prepaidOffers = useMemo(
        () => (specialOffers || []).filter((o) => o.offerType === "Prepaid Offer") || [],
        [specialOffers]
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
                .reduce((sum, item) => sum + (item.quantity || 0) * getItemPrice(item), 0)
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

            if (paymentMode === "cod") {
                if (displayCouponP > 0) {
                    lines.push({
                        label: `Coupon Discount for ${getCategoryName(cat)} (${displayCouponP}%)`,
                        amount: -(catSum * (displayCouponP / 100)),
                    });
                }
            } else { // Online payment mode
                if (displayCouponP > 0) {
                    lines.push({
                        label: `Coupon Discount for ${getCategoryName(cat)} (${displayCouponP}%)`,
                        amount: -(catSum * (displayCouponP / 100)),
                    });
                }
                if (displayAdditionalP > 0) {
                    const prefix = displayCouponP > 0 ? "Additional " : "";
                    lines.push({
                        label: `${prefix}Prepaid Discount for ${getCategoryName(
                            cat
                        )} (${displayAdditionalP}%)`,
                        amount: -(catSum * (displayAdditionalP / 100)),
                    });
                }
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
        return productList?.reduce((sum, item) => {
            if (item?.returnType === "easy-return") {
                const itemSubtotal = (item?.quantity || 0) * getItemPrice(item)
                return sum + 160 + 0.05 * itemSubtotal
            }
            return sum
        }, 0)
    }, [productList])

    const replacementFees = useMemo(() => {
        return productList?.reduce((sum, item) => {
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

    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || null


    useEffect(() => {
        if (productList && productList.length > 0 && !brandsLoading && brands && categoriesMap && !dataLayerPushed.current) {
            const items = productList.map((item) => {
                const price = getItemPrice(item)
                return {
                    item_id: item.product.id,
                    item_name: item.product.title,
                    price: price,
                    quantity: item.quantity || 1,
                    item_category: getCategoryName(item.product.categoryId),
                    item_variant: [item.selectedColor, item.selectedQuality].filter(Boolean).join(" - "),
                    item_brand: getBrandName(item.product.brandId),
                }
            })

            window.dataLayer = window.dataLayer || []
            window.dataLayer.push({
                event: "begin_checkout",
                ecommerce: {
                    currency: "INR",
                    value: total,
                    items: items,
                },
            })
            dataLayerPushed.current = true;
        }
    }, [productList, brandsLoading, brands, categoriesMap, total])

    // Load Razorpay SDK
    const loadRazorpay = async () => {
        return new Promise((resolve) => {
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const hashString = async (str) => {
        if (!str) return "";
        const msgBuffer = new TextEncoder().encode(str.trim().toLowerCase());
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    async function trackPurchase(checkoutId, paymentMethod, paymentMethodTitle) {
        const items = productList.map(item => ({
            item_id: item.product.id,
            item_name: item.product.title,
            sku: item.product.id,
            price: getItemPrice(item),
            stocklevel: null,
            stockstatus: "instock",
            google_business_vertical: "retail",
            item_category: getCategoryName(item.product.categoryId),
            id: item.product.id,
            quantity: item.quantity || 1
        }));

        const email = selectedAddress?.email || "";
        const phone = selectedAddress?.mobile || "";
        const firstName = selectedAddress?.fullName?.split(" ")[0] || "";
        const lastName = selectedAddress?.fullName?.split(" ").slice(1).join(" ") || "";

        const [emailHash, phoneHash, firstNameHash, lastNameHash] = await Promise.all([
            hashString(email),
            hashString(phone),
            hashString(firstName),
            hashString(lastName)
        ]);

        const userDetails = {
            pagePostType: "page",
            pagePostType2: "single-page",
            customerTotalOrders: userData?.orders?.length || 0,
            customerTotalOrderValue: userData?.orders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0,
            customerFirstName: firstName,
            customerLastName: lastName,
            customerBillingFirstName: firstName,
            customerBillingLastName: lastName,
            customerBillingCompany: "",
            customerBillingAddress1: selectedAddress?.streetAddress || "",
            customerBillingAddress2: selectedAddress?.landmark || "",
            customerBillingCity: selectedAddress?.city || "",
            customerBillingState: selectedAddress?.state || "",
            customerBillingPostcode: selectedAddress?.pinCode || "",
            customerBillingCountry: selectedAddress?.country || "IN",
            customerBillingEmail: email,
            customerBillingEmailHash: emailHash,
            customerBillingPhone: phone,
            customerShippingFirstName: firstName,
            customerShippingLastName: lastName,
            customerShippingCompany: "",
            customerShippingAddress1: selectedAddress?.streetAddress || "",
            customerShippingAddress2: selectedAddress?.landmark || "",
            customerShippingCity: selectedAddress?.city || "",
            customerShippingState: selectedAddress?.state || "",
            customerShippingPostcode: selectedAddress?.pinCode || "",
            customerShippingCountry: selectedAddress?.country || "IN",
            cartContent: {
                totals: {
                    applied_coupons: appliedCoupons,
                    discount_total: discount,
                    subtotal: totalPrice,
                    total: total
                },
                items: items
            },
            orderData: {
                attributes: {
                    date: new Date().toISOString(),
                    order_number: checkoutId,
                    order_key: checkoutId,
                    payment_method: paymentMethod,
                    payment_method_title: paymentMethodTitle,
                    shipping_method: deliveryType === "express" ? "Express Delivery" : "Standard Delivery",
                    status: "processing",
                    coupons: appliedCoupons.join(",")
                },
                totals: {
                    currency: "INR",
                    discount_total: discount,
                    discount_tax: 0,
                    shipping_total: shippingCharge + airExpressFee,
                    shipping_tax: 0,
                    cart_tax: 0,
                    total: total,
                    total_tax: 0,
                    total_discount: discount,
                    subtotal: totalPrice,
                    tax_totals: []
                },
                customer: {
                    id: user?.uid || "guest",
                    billing: {
                        first_name: firstName,
                        first_name_hash: firstNameHash,
                        last_name: lastName,
                        last_name_hash: lastNameHash,
                        company: "",
                        address_1: selectedAddress?.streetAddress || "",
                        address_2: selectedAddress?.landmark || "",
                        city: selectedAddress?.city || "",
                        state: selectedAddress?.state || "",
                        postcode: selectedAddress?.pinCode || "",
                        country: selectedAddress?.country || "IN",
                        email: email,
                        emailhash: emailHash,
                        email_hash: emailHash,
                        phone: phone,
                        phone_hash: phoneHash
                    },
                    shipping: {
                        first_name: firstName,
                        last_name: lastName,
                        company: "",
                        address_1: selectedAddress?.streetAddress || "",
                        address_2: selectedAddress?.landmark || "",
                        city: selectedAddress?.city || "",
                        state: selectedAddress?.state || "",
                        postcode: selectedAddress?.pinCode || "",
                        country: selectedAddress?.country || "IN"
                    }
                },
                items: items
            },
            new_customer: !userData?.orders || userData?.orders?.length === 0
        };

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(userDetails);

        window.dataLayer.push({
            event: "purchase",
            ecommerce: {
                currency: "INR",
                transaction_id: checkoutId,
                affiliation: "Mobile Display",
                value: total,
                tax: 0,
                shipping: shippingCharge + airExpressFee,
                coupon: appliedCoupons.join(","),
                items: items
            },
            "gtm.uniqueEventId": Date.now()
        });
    }

    async function handlePlaceOrder() {
        if (!selectedAddress) {
            toast.error("Please select a delivery address")
            setStep("contact")
            return
        }
        try {
            if (totalPrice <= 0) throw new Error("Price should be greater than 0")
            if (!productList || productList.length === 0) throw new Error("Product List Is Empty")

            setPlacing(true)

            const serializedAppliedOffers = appliedOffers.map(offer => ({
                couponCode: offer.couponCode,
                discountPercentage: offer.discountPercentage,
                categories: offer.categories,
                offerType: offer.offerType,
                id: offer.id,
            }));

            const serializedProductList = productList.map(item => ({
                ...item,
                product: { id: item.product.id, categoryId: item.product.categoryId, title: item.product.title, featureImageURL: item.product.featureImageURL, isVariable: item.product.isVariable, variations: item.product.variations, price: item.product.price, salePrice: item.product.salePrice }
            }));

            let checkoutData
            let successPath
            if (paymentMode === "cod") {
                checkoutData = await createCheckoutCODAndGetId({
                    uid: user?.uid,
                    products: serializedProductList,
                    address: {
                        fullName: selectedAddress.fullName,
                        mobile: selectedAddress.mobile,
                        email: selectedAddress.email,
                        addressLine1: selectedAddress.streetAddress,
                        city: selectedAddress.city,
                        state: selectedAddress.state,
                        pincode: selectedAddress.pinCode,
                        landmark: selectedAddress.landmark,
                        country: selectedAddress.country,
                    },
                    deliveryType,
                    appliedCoupons,
                    appliedOffers: serializedAppliedOffers,
                })
                successPath = "/checkout-success"
                await trackPurchase(checkoutData.checkoutId, "cod", "Cash on delivery");
            } else {
                checkoutData = await createCheckoutOnlineAndGetId({
                    uid: user?.uid,
                    products: serializedProductList,
                    address: {
                        fullName: selectedAddress.fullName,
                        mobile: selectedAddress.mobile,
                        email: selectedAddress.email,
                        addressLine1: selectedAddress.streetAddress,
                        city: selectedAddress.city,
                        state: selectedAddress.state,
                        pincode: selectedAddress.pinCode,
                        landmark: selectedAddress.landmark,
                        country: selectedAddress.country,
                    },
                    deliveryType,
                    appliedCoupons,
                    appliedOffers: serializedAppliedOffers,
                })
                successPath = "/checkout-success"
            }

            const { checkoutId, razorpayOrderId, amount } = checkoutData

            const res = await loadRazorpay()
            if (!res) {
                toast.error("Failed to load payment gateway. Please try again.")
                return
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(amount * 100),
                currency: "INR",
                name: "Mobile Display",
                description: paymentMode === "cod" ? "Advance Payment for COD Order" : "Full Payment for Order",
                order_id: razorpayOrderId,
                handler: async function (response) {
                    await trackPurchase(checkoutId, "online", "Online Payment");
                    router.push(`${successPath}?checkout_id=${checkoutId}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${response.razorpay_order_id}&razorpay_signature=${response.razorpay_signature}`)
                },
                prefill: {
                    name: selectedAddress.fullName,
                    email: selectedAddress.email,
                    contact: selectedAddress.mobile,
                },
                theme: {
                    color: "#3399cc",
                },
            }

            const paymentObject = new window.Razorpay(options)
            paymentObject.open()
        } catch (err) {
            toast.error(err?.message || "Failed to initiate payment")
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

    const bestOffer = (specialOffers || [])
        .filter(
            (o) => o.offerType !== "Prepaid Offer" && o.categories?.some((c) => allCategories.includes(c)),
        )
        .sort((a, b) => b.discountPercentage - a.discountPercentage)?.[0]

    const bestPrepaidOffer = (prepaidOffers || [])
        .filter((o) => o.categories?.some((c) => allCategories.includes(c)))
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
                    <AddressSection
                        step={step}
                        addresses={addresses}
                        selectedAddressId={selectedAddressId}
                        setSelectedAddressId={setSelectedAddressId}
                        editingAddressId={editingAddressId}
                        isAddingNew={isAddingNew}
                        setIsAddingNew={setIsAddingNew}
                        addressForm={addressForm}
                        errors={errors}
                        handleAddressChange={handleAddressChange}
                        handleSaveAddress={handleSaveAddress}
                        cancelAddress={cancelAddress}
                        startEditing={startEditing}
                        handleDeleteAddress={handleDeleteAddress}
                        savingContact={savingContact}
                        onSaveContactNext={onSaveContactNext}
                    />) : null}

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
                                            getBrandName={getBrandName}
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <button
                                    className="text-gray-700 hover:text-black text-left underline underline-offset-4"
                                    onClick={() => setStep("contact")}
                                >
                                    Edit address
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

                            <PaymentMode paymentMode={paymentMode} setPaymentMode={setPaymentMode} disableCOD={disableCOD} prepaidOffer={bestPrepaidOffer} />

                            {paymentMode === "cod" ? (
                                <div className="mt-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                    <div className="flex items-center justify-between">
                                        <span>10% Advance is charged to avoid non-genuine orders</span>
                                        <span>
                                            ₹{advance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Cash to collect on delivery</span>
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
                                        <span className="ml-2">Initiating payment...</span>
                                    </>
                                ) : (
                                    "Proceed to Pay"
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

export function Field({ label, name, value, onChange, error, placeholder, type = "text" }) {
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

export function SelectField({ label, name, value, onChange, options }) {
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

function ProductRow({ item, estimatedDelivery, getCategoryName, getBrandName }) {
    const product = item.product;
    const quantity = item.quantity || 1;
    const selectedColor = item.selectedColor;
    const selectedQuality = item.selectedQuality;
    const selectedBrand = item.selectedBrand;
    const returnType = item.returnType;
    const brandName = getBrandName(product.brandId);
    const categoryName = getCategoryName(product.categoryId);
    const price = getItemPrice(item) * quantity;

    let variantInfo = '';
    if (selectedColor) variantInfo += ` - ${selectedColor}`;
    if (selectedQuality) variantInfo += ` - ${selectedQuality}`;
    if (selectedBrand) variantInfo += ` - ${selectedBrand}`;

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left Section */}
                <div className="flex items-start sm:items-center gap-4 w-full">
                    <img
                        src={product.featureImageURL || "/placeholder.svg"}
                        alt={product.title}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    />

                    <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 break-words">
                            {product.title}
                            <span className="font-normal text-gray-600">{variantInfo}</span>
                        </h3>

                        <div className="text-sm text-gray-600 space-y-0.5">
                            <p><span className="font-medium text-gray-700">Qty:</span> {quantity}</p>
                            <p><span className="font-medium text-gray-700">Category:</span> {categoryName}</p>
                            <p><span className="font-medium text-gray-700">Brand:</span> {brandName}</p>
                            <p><span className="font-medium text-gray-700">Return Type:</span> {returnType}</p>

                        </div>
                    </div>
                </div>

                {/* Right Section (Price) */}
                <div className="flex sm:flex-col justify-between sm:justify-center items-end sm:items-end w-full sm:w-auto">
                    <span className="font-semibold text-lg text-gray-900 whitespace-nowrap">
                        ₹{price.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </span>
                </div>
            </div>

            {/* Delivery Info */}
            <p className="mt-3 text-sm text-gray-600 border-t border-gray-100 pt-2">
                Estimated Delivery:{" "}
                <span className="font-medium text-gray-800">{estimatedDelivery}</span>
            </p>
        </div>
    );
}
// ---------- Main Component ----------
export default function Checkout({ productList }) {
    const { user } = useAuth()
    const { data: userData } = useUser({ uid: user?.uid })


    return <ContactAndAddress userData={userData} user={user} productList={productList} />
}

function StepIndicator({ step }) {
    const isContact = step === "contact"
    const isSummary = step === "summary"
    const isPayment = step === "payment"
    return (
        <div className="mt-3 flex items-center gap-3 md:text-sm text-xs">
            <StepPill active={isContact}>1. Address</StepPill>
            <div className="h-px md:flex-1 bg-gray-200" />
            <StepPill active={isSummary}>2. Summary</StepPill>
            <div className="h-px md:flex-1 bg-gray-200" />
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