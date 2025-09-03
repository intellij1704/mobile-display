/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import toast from "react-hot-toast"
import { UploadCloud, X } from "lucide-react"

import { getBrands } from "@/lib/firestore/brands/read_server"
import { getSeries } from "@/lib/firestore/series/read_server"
import { createNewSeries, updateSeries } from "@/lib/firestore/series/write"

// Firebase Storage for image upload
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

export default function SeriesForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const seriesId = searchParams.get("id")

  const [brandId, setBrandId] = useState("")
  const [seriesInput, setSeriesInput] = useState("")
  const [brands, setBrands] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [errors, setErrors] = useState({})

  // image state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [existingImagePath, setExistingImagePath] = useState("")
  const [removeExistingImage, setRemoveExistingImage] = useState(false)

  // Fetch all brands
  const fetchBrands = useCallback(async () => {
    setIsFetching(true)
    try {
      const res = await getBrands()
      setBrands(res || [])
    } catch (error) {
      toast.error((error && error.message) || "Failed to fetch brands")
      setBrands([])
    } finally {
      setIsFetching(false)
    }
  }, [])

  // Fetch series data if editing
  const fetchSeriesData = useCallback(async () => {
    if (!seriesId) return
    setIsFetching(true)
    try {
      const seriesData = await getSeries({ id: seriesId })
      if (!seriesData) throw new Error("Series not found")
      setBrandId(seriesData.brandId || "")
      setSeriesInput(seriesData.seriesName || "")
      setImagePreview(seriesData.imageUrl || "")
      setExistingImagePath(seriesData.imagePath || "")
      setRemoveExistingImage(false)
    } catch (error) {
      toast.error((error && error.message) || "Failed to fetch series data")
    } finally {
      setIsFetching(false)
    }
  }, [seriesId])

  useEffect(() => {
    fetchBrands()
    fetchSeriesData()
  }, [fetchBrands, fetchSeriesData])

  const brandOptions = useMemo(() => brands.map((brand) => ({ value: brand.id, label: brand.name })), [brands])

  const isEditMode = Boolean(seriesId)

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (!brandId) {
        setErrors({ brandId: "Brand is required" })
        toast.error("Please select a brand")
        return
      }
      if (!seriesInput.trim()) {
        setErrors({ seriesInput: "Series name is required" })
        toast.error("Series name is required")
        return
      }

      setIsLoading(true)
      try {
        if (isEditMode) {
          let imagePayload = {}
          if (imageFile) {
            const uploaded = await uploadImage(imageFile, "edit")
            imagePayload = uploaded
            await maybeDeleteExistingImage()
          } else if (removeExistingImage) {
            await maybeDeleteExistingImage()
            imagePayload = { imageUrl: null, imagePath: null }
          }
          await updateSeries({
            id: seriesId,
            data: {
              seriesName: seriesInput.trim(),
              brandId,
              ...imagePayload,
            },
          })
          toast.success("Series updated successfully")
        } else {
          let imagePayload = {}
          if (imageFile) {
            imagePayload = await uploadImage(imageFile, "create")
          }
          await createNewSeries({
            data: {
              seriesName: seriesInput.trim(),
              brandId,
              categoryId: "",
              ...imagePayload,
            },
          })
          toast.success("Series added successfully")
        }

        setSeriesInput("")
        setBrandId("")
        setImageFile(null)
        setImagePreview("")
        setExistingImagePath("")
        setRemoveExistingImage(false)

        router.push("/admin/series")
      } catch (error) {
        toast.error((error && error.message) || "Failed to submit series")
      } finally {
        setIsLoading(false)
      }
    },
    [brandId, seriesInput, isEditMode, seriesId, imageFile, removeExistingImage, existingImagePath, router],
  )

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed")
      return
    }
    const maxBytes = 2 * 1024 * 1024 // 2MB
    if (file.size > maxBytes) {
      toast.error("Image must be 2MB or less")
      return
    }
    setImageFile(file)
    setRemoveExistingImage(false)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
    if (isEditMode && existingImagePath) {
      setRemoveExistingImage(true)
    }
  }

  const uploadImage = async (file, pathSeed = "single") => {
    if (!file || !brandId) return { imageUrl: "", imagePath: "" }
    const safeName = file.name.replace(/\s+/g, "-").toLowerCase()
    const path = `series/${brandId}/${Date.now()}-${pathSeed}-${safeName}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return { imageUrl: url, imagePath: path }
  }

  const maybeDeleteExistingImage = async () => {
    if (existingImagePath) {
      try {
        await deleteObject(ref(storage, existingImagePath))
      } catch (err) {
        console.warn("[SeriesForm] Failed to delete old image:", err?.message)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 bg-white rounded-2xl p-8 w-full max-w-lg shadow-lg h-full">
      <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Series" : "Add New Series"}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="brand" className="text-sm font-medium text-gray-700">
            Brand <span className="text-red-500">*</span>
          </label>
          <select
            id="brand"
            value={brandId}
            onChange={(e) => {
              setBrandId(e.target.value)
              setErrors((prev) => ({ ...prev, brandId: "" }))
            }}
            disabled={isLoading || isFetching || isEditMode}
            className={`w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.brandId ? "border-red-500" : "border-gray-300"
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">Select Brand</option>
            {brandOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.brandId && (
            <p id="brand-error" className="text-red-500 text-xs mt-1">
              {errors.brandId}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="series-input" className="text-sm font-medium text-gray-700">
            Series Name <span className="text-red-500">*</span>
          </label>
          <input
            id="series-input"
            type="text"
            placeholder="Enter Series Name"
            value={seriesInput}
            onChange={(e) => {
              setSeriesInput(e.target.value)
              setErrors((prev) => ({ ...prev, seriesInput: "" }))
            }}
            className={`px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.seriesInput ? "border-red-500" : "border-gray-300"
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            disabled={isLoading || (!brandId && !isEditMode)}
          />
          {errors.seriesInput && (
            <p id="series-input-error" className="text-red-500 text-xs mt-1">
              {errors.seriesInput}
            </p>
          )}
        </div>



        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Series Image <span className="text-red-500">*</span>
          </label>

          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Series preview"
                  className="h-32 object-contain rounded-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
                <div className="mt-2 flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload an image</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleImageChange}
                      accept="image/*"
                      required={!isEditMode}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isFetching || !seriesInput.trim() || (!isEditMode && !imagePreview)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (isEditMode ? "Updating..." : "Adding...") : isEditMode ? "Update Series" : "Add Series"}
        </button>
      </form>
    </div>
  )
}
