"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Phone, User, Camera, CheckCircle } from "lucide-react"

export default function ShopOwnerBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    images: [],
  })
  const [errors, setErrors] = useState({})
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const modalRef = useRef(null)

  // Handle ESC key and click outside to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Shop name is required"
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required"
    else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ""))) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number"
    }
    if (formData.images.length === 0) newErrors.images = "At least one shop image is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setErrors({})
    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after success message
    setTimeout(() => {
      setFormData({ name: "", mobile: "", images: [] })
      setIsSubmitted(false)
      setIsOpen(false)
    }, 2000)
  }

  // Handle file upload
  const handleFileUpload = (files) => {
    const newImages = Array.from(files).slice(0, 5 - formData.images.length)
    const imagePromises = newImages.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) =>
          resolve({
            file,
            preview: e.target.result,
            id: Math.random().toString(36).substr(2, 9),
          })
        reader.readAsDataURL(file)
      })
    })

    Promise.all(imagePromises).then((images) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...images],
      }))
    })
  }

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  // Remove image
  const removeImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }))
  }

  return (
    <section className="relative w-full max-w-7xl mx-auto h-[250px] md:h-[350px] lg:h-[600px] flex items-center justify-center">
      {/* Background Image */}
      <img
        src="/shop-repair-banner.png"
        alt="Mobile repair shop banner"
        className="absolute inset-0 w-full h-full object-contain rounded-lg"
      />

      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 rounded-lg" />

      <motion.button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-10 z-20 bg-white text-red-900 md:px-10 px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold md:text-xl text-sm flex items-center gap-2 transform hover:scale-105 border border-white/20 backdrop-blur-sm ab"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        Contact Us
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[9999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl relative border border-gray-100 overflow-hidden"
              initial={{ scale: 0.7, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute z-50 top-3 right-3 text-white/90 hover:text-white transition-colors  bg-white/20 rounded-full p-1.5 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <X size={16} />
                </button>
                <div className="relative z-10">
                  <h2 className="text-xl font-bold mb-1">Register Your Shop</h2>
                  <p className="text-red-100 text-xs">
                    Upload your shop details and images to get started
                  </p>
                </div>
              </div>

              <div className="p-5">
                {isSubmitted ? (
                  <motion.div
                    className="text-center py-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="mx-auto text-green-500 mb-3" size={50} />
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Success!</h3>
                    <p className="text-gray-600 text-sm">We'll contact you soon.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">
                        <User className="inline mr-1 text-red-600" size={14} />
                        Shop Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Shop name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center bg-red-50 p-1.5 rounded-md">
                          <X size={10} className="mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">
                        <Phone className="inline mr-1 text-red-600" size={14} />
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-gray-50 focus:bg-white"
                        placeholder="Mobile number"
                      />
                      {errors.mobile && (
                        <p className="text-red-500 text-xs mt-1 flex items-center bg-red-50 p-1.5 rounded-md">
                          <X size={10} className="mr-1" />
                          {errors.mobile}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">
                        <Camera className="inline mr-1 text-red-600" size={14} />
                        Shop Images (Max 5)
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${dragActive
                            ? "border-red-500 bg-red-50 scale-105"
                            : "border-gray-300 hover:border-red-400 hover:bg-gray-50"
                          }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("file-input").click()}
                      >
                        <Upload className="mx-auto text-gray-400 mb-1" size={24} />
                        <p className="text-gray-700 font-bold text-xs mb-1">Click or drag to upload</p>
                        <p className="text-gray-500 text-[10px]">PNG, JPG up to 10MB</p>
                        <input
                          id="file-input"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                      {errors.images && (
                        <p className="text-red-500 text-xs mt-1 flex items-center bg-red-50 p-1.5 rounded-md">
                          <X size={10} className="mr-1" />
                          {errors.images}
                        </p>
                      )}
                      {formData.images.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-bold text-gray-800 mb-1">
                            Uploaded ({formData.images.length}/5)
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {formData.images.map((image) => (
                              <div key={image.id} className="relative group">
                                <img
                                  src={image.preview || "/placeholder.svg"}
                                  alt="Shop preview"
                                  className="w-full h-16 object-cover rounded-md border border-gray-200 shadow-sm group-hover:shadow-md transition-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(image.id)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600 transform hover:scale-105"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-2.5 rounded-lg hover:from-red-700 hover:via-red-800 hover:to-red-900 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.01]"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Submitting...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}