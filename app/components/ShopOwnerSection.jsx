"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Phone, User, Camera, CheckCircle } from "lucide-react"
import { LocationCity } from "@mui/icons-material"
import { addShopOwner } from "@/lib/firestore/shopOwner/write"

export default function ShopOwnerBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    mobile: "",
    images: [],
  })
  const [errors, setErrors] = useState({})
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const modalRef = useRef(null)
  const fileInputRef = useRef(null)

  // Handle ESC key and click outside to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false)
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", city: "", mobile: "", images: [] })
      setErrors({})
      setIsSubmitted(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }, [isOpen])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Shop name is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required"
    else if (!/^\+?\d{10,12}$/.test(formData.mobile.replace(/\D/g, ""))) {
      newErrors.mobile = "Please enter a valid mobile number (10-12 digits)"
    }
    if (formData.images.length === 0) newErrors.images = "At least one shop image is required"
    else if (formData.images.length > 5) newErrors.images = "Maximum 5 images allowed"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    const result = await addShopOwner(formData)

    if (result.success) {
      setIsSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
      }, 2000)
    } else {
      setErrors({ submit: result.error || "Failed to save shop. Please try again." })
    }

    setIsSubmitting(false)
  }

  // Handle file upload
  const handleFileUpload = (files) => {
    const allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/gif"]
    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const newImages = Array.from(files)
      .filter((file) => allowedFormats.includes(file.type) && file.size <= maxFileSize)
      .slice(0, 5 - formData.images.length)

    if (newImages.length < files.length) {
      setErrors((prev) => ({
        ...prev,
        images: "Some files were rejected. Only PNG, JPEG, WEBP, GIF up to 10MB are allowed."
      }))
    }

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

    if (e.dataTransfer.files && e.dataTransfer.files.length) {
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
    <section className="relative w-full max-w-7xl mx-auto h-[200px] md:h-[350px] lg:h-[600px] flex items-center justify-center">
      <img
        src="/shop-repair-banner.avif"
        alt="Mobile repair shop banner"
        className="absolute inset-0 w-full h-full object-contain rounded-lg"
      />

      <motion.button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-8 z-20 bg-white text-red-900 px-6 py-3 rounded-xl shadow-sm md:shadow-lg hover:shadow-xl transition-all font-bold text-sm md:text-lg flex items-center gap-2 transform hover:scale-105 border border-white/20 backdrop-blur-sm"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        Register Your Shop
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
              <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-5 relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 text-white/90 hover:text-white bg-white/20 rounded-full p-1.5 hover:bg-white/30 focus:outline-none"
                >
                  <X size={16} />
                </button>
                <h2 className="text-xl font-bold mb-1">Register Your Shop</h2>
                <p className="text-red-100 text-xs">
                  Add your shop details and up to 5 images
                </p>
              </div>

              <div className="p-5 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-red-200 scrollbar-track-gray-100">
                {isSubmitted ? (
                  <motion.div
                    className="text-center py-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="mx-auto text-green-500 mb-3" size={50} />
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Success!</h3>
                    <p className="text-gray-600 text-sm">Shop registered successfully!</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-1">
                        <User className="inline mr-1 text-red-600" size={14} />
                        Shop Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-gray-50"
                        placeholder="Enter shop name"
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
                        <LocationCity className="inline mr-1 text-red-600" size={14} />
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-gray-50"
                        placeholder="Enter city name"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1 flex items-center bg-red-50 p-1.5 rounded-md">
                          <X size={10} className="mr-1" />
                          {errors.city}
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
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-gray-50"
                        placeholder="Enter mobile number"
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
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                          dragActive ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-gray-700 font-bold text-sm mb-1">Click or drag to upload images</p>
                        <p className="text-gray-500 text-xs">PNG, JPEG, WEBP, GIF (Max 10MB each)</p>
                        <input
                          ref={fileInputRef}
                          id="file-input"
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
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
                          <p className="text-xs font-bold text-gray-800 mb-2">
                            Uploaded Images ({formData.images.length}/5)
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {formData.images.map((image) => (
                              <div key={image.id} className="relative group">
                                <img
                                  src={image.preview}
                                  alt="Shop preview"
                                  className="w-full h-20 object-cover rounded-md border border-gray-200 shadow-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(image.id)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {errors.submit && (
                      <p className="text-red-500 text-xs flex items-center bg-red-50 p-2 rounded-md">
                        <X size={12} className="mr-1" />
                        {errors.submit}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-2.5 rounded-lg hover:from-red-700 hover:to-red-900 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
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