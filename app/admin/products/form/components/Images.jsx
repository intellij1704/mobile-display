"use client"

import { useRef } from "react"

export default function Images({
  data,
  setFeatureImage,
  featureImage,
  imageList,
  setImageList,
  handleData,
}) {
  const featureInputRef = useRef(null)
  const imagesInputRef = useRef(null)

  const existingFeatureImage = data?.featureImageURL
  const existingImages = data?.imageList || []

  const removeFeatureImage = () => {
    if (featureImage) {
      setFeatureImage(null)
    } else if (existingFeatureImage) {
      handleData("featureImageURL", null)
    }
  }

  const removeImage = (index, isExisting) => {
    if (isExisting) {
      const updatedExisting = existingImages.filter((_, i) => i !== index)
      handleData("imageList", updatedExisting)
    } else {
      const updatedNew = imageList.filter((_, i) => i !== index)
      setImageList(updatedNew)
    }
  }

  return (
    <section className="flex flex-col gap-6 bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
      <h1 className="text-lg font-semibold text-gray-900">Product Images</h1>
      
      {/* Feature Image */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Feature Image <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
            {(featureImage || existingFeatureImage) ? (
              <img
                src={featureImage ? URL.createObjectURL(featureImage) : existingFeatureImage}
                alt="Feature Image"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm">No image</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => featureInputRef.current.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {featureImage || existingFeatureImage ? "Replace Image" : "Upload Image"}
            </button>
            {(featureImage || existingFeatureImage) && (
              <button
                type="button"
                onClick={removeFeatureImage}
                className="text-red-500 text-sm hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={featureInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files.length > 0) {
              setFeatureImage(e.target.files[0])
            }
          }}
        />

        <div className="mt-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Alt Text <span className="text-gray-400 font-normal text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Enter alt text for feature image"
            value={data?.featureImageAlt ?? ""}
            onChange={(e) => handleData("featureImageAlt", e.target.value)}
            className="w-full border px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-sm"
          />
        </div>
      </div>

      {/* Product Images */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Product Images <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-4">
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={url || "/placeholder.svg"}
                alt={`Existing product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index, true)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          {imageList.map((file, index) => (
            <div key={`new-${index}`} className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={URL.createObjectURL(file)}
                alt={`New product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index, false)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => imagesInputRef.current.click()}
            className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300 hover:bg-gray-200 transition-colors"
          >
            <span className="text-3xl text-gray-500">+</span>
          </button>
        </div>
        <input
          ref={imagesInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={(e) => {
            const newFiles = Array.from(e.target.files)
            setImageList((prev) => [...prev, ...newFiles])
          }}
        />
      </div>
    </section>
  )
}