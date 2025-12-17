'use client'

import { useBrands } from "@/lib/firestore/brands/read"
import { useCategories } from "@/lib/firestore/categories/read"
import { useSeriesByBrand } from "@/lib/firestore/series/read"
import { useModelsBySeries } from "@/lib/firestore/models/read"
import { useState, useEffect } from "react"
import { Accordion, AccordionItem } from "@nextui-org/react"
import toast from "react-hot-toast"

export default function BasicDetails({ data, handleData, variantImages, setVariantImages, variationValidationErrors }) {
  const { data: brands } = useBrands()
  const { data: categories } = useCategories()
  const [selectedBrand, setSelectedBrand] = useState(data?.brandId ?? "")
  const [selectedSeries, setSelectedSeries] = useState(data?.seriesId ?? "")
  const [attributeValueStrings, setAttributeValueStrings] = useState([])
  const [attributeErrors, setAttributeErrors] = useState([]) // [{name:'', values:'', duplicate:''}]

  const { data: series } = useSeriesByBrand(selectedBrand)
  const { data: models } = useModelsBySeries(selectedBrand, selectedSeries)

  useEffect(() => {
    setSelectedBrand(data?.brandId ?? "")
    setSelectedSeries(data?.seriesId ?? "")
  }, [data?.brandId, data?.seriesId])

  useEffect(() => {
    setAttributeValueStrings((data?.attributes ?? []).map((att) => att.values.join("|")))
  }, [data?.attributes])

  useEffect(() => {
    if (selectedBrand && selectedBrand !== data?.brandId) {
      handleData("brandId", selectedBrand)
      handleData("seriesId", "")
      handleData("modelId", "")
      setSelectedSeries("")
    }
  }, [selectedBrand, data?.brandId, handleData])

  useEffect(() => {
    if (selectedSeries && selectedSeries !== data?.seriesId) {
      handleData("seriesId", selectedSeries)
      handleData("modelId", "")
    }
  }, [selectedSeries, data?.seriesId, handleData])

  const handleAddAttribute = () => {
    const newAtt = { name: "", values: [], visible: true, usedForVariations: true, highlight: false }
    handleData("attributes", [...(data?.attributes ?? []), newAtt])
  }

  const handleRemoveAttribute = (index) => {
    const updated = (data?.attributes ?? []).filter((_, i) => i !== index)
    handleData("attributes", updated)
  }

  const handleUpdateAttribute = (index, key, value) => {
    const updated = (data?.attributes ?? []).map((att, i) => {
      if (i === index) {
        if (key === "values") {
          const vals = value
            .split("|")
            .map((v) => v.trim())
            .filter((v) => v)
          return { ...att, values: vals }
        }
        if (key === "usedForVariations" || key === "visible" || key === "highlight") {
          return { ...att, [key]: !!value }
        }
        return { ...att, [key]: value }
      }
      return att
    })

    const errors = updated.map((att, i) => {
      const err = { name: "", values: "", duplicate: "" }
      if (!att.name?.trim()) err.name = "Attribute name is required"
      if ((att.values ?? []).length === 0) err.values = "Add at least one value"
      const nameLower = (att.name || "").trim().toLowerCase()
      if (nameLower && updated.some((a, ai) => ai !== i && (a.name || "").trim().toLowerCase() === nameLower)) {
        err.duplicate = "Duplicate attribute name"
      }
      return err
    })

    setAttributeErrors(errors)
    handleData("attributes", updated)
  }

  const generateCombinations = (attrs) => {
    const usedAttrs = attrs.filter((a) => a.usedForVariations)
    if (!usedAttrs.length) return []
    const valueLists = usedAttrs.map((a) => a.values)
    const combine = (lists) => {
      return lists.reduce(
        (acc, curr) => acc.flatMap((a) => curr.map((c) => ({ ...a, [usedAttrs[lists.indexOf(curr)].name]: c }))),
        [{}]
      )
    }
    return combine(valueLists)
  }

  const handleRegenerateVariations = () => {
    const attrs = data?.attributes ?? []
    if (attrs.length === 0) {
      toast.error("Add attributes first.")
      return
    }
    const names = attrs.map((a) => (a?.name || "").trim().toLowerCase()).filter(Boolean)
    const dupNames = names.filter((n, i) => names.indexOf(n) !== i)
    const hasEmptyName = attrs.some((a) => !a?.name?.trim())
    const hasEmptyValues = attrs.some((a) => (a?.values ?? []).length === 0)

    if (hasEmptyName || hasEmptyValues) {
      toast.error("Each attribute needs a name and at least one value.")
      return
    }
    if (dupNames.length > 0) {
      toast.error("Attribute names must be unique.")
      return
    }

    const combos = generateCombinations(attrs)
    const existing = data?.variations ?? []
    const existingMap = new Map(
      existing.map((v) => [
        JSON.stringify(
          Object.keys(v.attributes)
            .sort()
            .map((k) => [k, v.attributes[k]]),
        ),
        v,
      ]),
    )
    const newVars = combos.map((attMap) => {
      const key = JSON.stringify(
        Object.keys(attMap)
          .sort()
          .map((k) => [k, attMap[k]]),
      )
      if (existingMap.has(key)) {
        return existingMap.get(key)
      } else {
        return {
          id: Math.floor(Math.random() * 1000000) + 100000,
          attributes: attMap,
          price: "",
          salePrice: "",
          imageURLs: [],
        }
      }
    })
    handleData("variations", newVars)

    toast.success("Variations updated.")
  }

  const handleUpdateVariation = (index, key, value) => {
    const updated = (data?.variations ?? []).map((varr, i) => {
      if (i === index) {
        return { ...varr, [key]: value }
      }
      return varr
    })
    handleData("variations", updated)
  }

  const handleRemoveExistingImage = (variationIndex, imageIndex) => {
    const updatedVariations = [...data.variations];
    const variation = updatedVariations[variationIndex];
    variation.imageURLs = (variation.imageURLs || []).filter((_, i) => i !== imageIndex);
    handleData("variations", updatedVariations);
  };

  const handleRemoveNewImage = (variationId, imageIndex) => {
    setVariantImages(prev => {
      const updatedImages = (prev[variationId] || []).filter((_, i) => i !== imageIndex);
      return { ...prev, [variationId]: updatedImages };
    });
  };

  const hasUsedForVariations = (data?.attributes ?? []).some((a) => a.usedForVariations)

  return (
    <section className="flex-1 flex flex-col gap-4 bg-white rounded-xl p-5 border shadow-sm">
      <h1 className="text-lg font-semibold text-gray-800">Basic Details</h1>

      <InputField
        label="Product Name"
        value={data?.title ?? ""}
        onChange={(e) => handleData("title", e.target.value)}
        isRequired={true}
        error={variationValidationErrors?.title}
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Short Description
        </label>

        <textarea
          className={`w-full rounded-md border p-2 text-sm focus:outline-none ${variationValidationErrors?.shortDescription
            ? "border-red-500"
            : "border-gray-300"
            }`}
          value={data?.shortDescription ?? ""}
          onChange={(e) => handleData("shortDescription", e.target.value)}
          placeholder="Enter Short Description"
          rows={3}
        >
        </textarea>

        {variationValidationErrors?.shortDescription && (
          <p className="mt-1 text-sm text-red-500">
            {variationValidationErrors.shortDescription}
          </p>
        )}
      </div>

      <SelectField
        label="Category"
        value={data?.categoryId ?? ""}
        onChange={(e) => handleData("categoryId", e.target.value)}
        options={categories}
        isRequired={true}
        error={variationValidationErrors?.categoryId}
      />


      <SelectField
        label="Brand"
        value={selectedBrand}
        onChange={(e) => setSelectedBrand(e.target.value)}
        options={brands}
        isRequired={false}
        error={variationValidationErrors?.brandId}
      />

      <SelectField
        label="Series"
        value={selectedSeries}
        onChange={(e) => setSelectedSeries(e.target.value)}
        options={series}
        isRequired={false}
        disabled={!selectedBrand}
        error={variationValidationErrors?.seriesId}
      />

      <SelectField
        label="Model"
        value={data?.modelId ?? ""}
        onChange={(e) => handleData("modelId", e.target.value)}
        options={models}
        isRequired={false}
        disabled={!selectedSeries}
        error={variationValidationErrors?.modelId}
      />


      <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-sm font-medium">Variable Product</label>
        <select
          value={data?.isVariable ? "yes" : "no"}
          onChange={(e) => {
            const isVar = e.target.value === "yes"
            handleData("isVariable", isVar)
            if (!isVar) {
              handleData("attributes", [])
              handleData("variations", [])
              setVariantImages({}) // Clear variant images when not variable
            }
          }}
          className="border border-gray-300 px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      {data?.isVariable && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-semibold text-gray-800">Attributes</h2>
            <button
              type="button"
              onClick={handleAddAttribute}
              className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm"
            >
              + Add attribute
            </button>
          </div>

          {(data?.attributes ?? []).map((att, index) => (
            <div key={index} className="rounded-lg border p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                {/* Attribute name Make it the drodown */}
                <div >
                  <label className="text-gray-500 text-sm font-medium"> Attribute Name from Preset </label>
                  <select
                    value={att.name}
                    onChange={(e) => handleUpdateAttribute(index, "name", e.target.value)}
                    className={`border px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 ${attributeErrors?.[index]?.name || attributeErrors?.[index]?.duplicate ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    <option value="">Select Attribute Name</option>
                    {["Color", "Quality", 'Brand'].map((preset) => (
                      <option key={preset} value={preset}>
                        {preset}
                      </option>
                    ))}
                  </select>
                  {/* Error show here */}
                  {attributeErrors?.[index]?.name && (
                    <p className="text-xs text-red-600">{attributeErrors?.[index]?.name || attributeErrors?.[index]?.duplicate}</p>
                  )}

                </div>
                <div className="flex items-center gap-4 pt-6 md:pt-8">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!att.usedForVariations}
                      onChange={(e) => handleUpdateAttribute(index, "usedForVariations", e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-700">Used for variations</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!att.visible}
                      onChange={(e) => handleUpdateAttribute(index, "visible", e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-700">Visible on product page</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-500 text-sm font-medium">Values (separate with |)</label>
                    <textarea
                      value={attributeValueStrings[index] ?? ""}
                      onChange={(e) => {
                        const next = [...attributeValueStrings]
                        next[index] = e.target.value
                        setAttributeValueStrings(next)
                      }}
                      onBlur={(e) => handleUpdateAttribute(index, "values", e.target.value)}
                      className={`border px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 ${attributeErrors?.[index]?.values ? "border-red-500" : "border-gray-300"
                        }`}
                      placeholder="Red|Blue|Black"
                    />
                    {attributeErrors?.[index]?.values && (
                      <p className="text-xs text-red-600">{attributeErrors[index].values}</p>
                    )}
                    {attributeErrors?.[index]?.duplicate && (
                      <p className="text-xs text-red-600">{attributeErrors[index].duplicate}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(index)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove attribute
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.isVariable && hasUsedForVariations && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-semibold text-gray-800">Variations</h2>
            <button
              type="button"
              onClick={handleRegenerateVariations}
              className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm"
            >
              Regenerate variations
            </button>
          </div>

          <Accordion>
            {(data?.variations ?? []).map((varr, index) => {
              const vErr = variationValidationErrors?.[varr.id] || {}
              return (
                <AccordionItem
                  key={varr.id}
                  title={`#${varr.id} ${Object.entries(varr.attributes)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" ")}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <InputField
                        label="Regular price"
                        value={varr.price ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d+$/.test(val)) {
                            handleUpdateVariation(index, "price", val)
                          }
                        }}
                        isRequired={true}
                        error={vErr?.price}
                      />
                    </div>
                    <div>
                      <InputField
                        label="Sale price"
                        value={varr.salePrice ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d+$/.test(val)) {
                            handleUpdateVariation(index, "salePrice", val)
                          }
                        }}
                        isRequired={false}
                        error={vErr?.salePrice}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-gray-500 text-sm font-medium">Variation Images</label>

                    <div className="mt-2">
                      <input
                        type="file"
                        id={`var-images-${varr.id}`}
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || []);
                          if (newFiles.length === 0) return;
                          setVariantImages((prev) => ({
                            ...prev,
                            [varr.id]: [...(prev[varr.id] || []), ...newFiles],
                          }));
                        }}
                      />
                      <label
                        htmlFor={`var-images-${varr.id}`}
                        className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-dashed border-gray-300 hover:border-gray-500 text-sm font-medium text-gray-700 cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload Images
                      </label>
                    </div>

                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {(varr.imageURLs || []).map((url, imageIndex) => (
                        <div key={`existing-${imageIndex}`} className="relative group">
                          <img
                            src={url}
                            alt={`Variation image ${imageIndex + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(index, imageIndex)}
                              className="text-white opacity-0 group-hover:opacity-100 p-2 bg-red-600 rounded-full hover:bg-red-700 transition-all"
                              aria-label="Remove image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}

                      {(variantImages[varr.id] || []).map((file, imageIndex) => (
                        <div key={`new-${imageIndex}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New image ${imageIndex + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(varr.id, imageIndex)}
                              className="text-white opacity-0 group-hover:opacity-100 p-2 bg-red-600 rounded-full hover:bg-red-700 transition-all"
                              aria-label="Remove image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      )}

      {!data?.isVariable && (
        <>
          <InputField
            label="Price"
            value={data?.price ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d+$/.test(val)) {
                handleData("price", val)
              }
            }}
            isRequired={true}
            error={variationValidationErrors?.price}
          />
          <InputField
            label="Sale Price"
            value={data?.salePrice ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d+$/.test(val)) {
                handleData("salePrice", val)
              }
            }}
            isRequired={false}
            error={variationValidationErrors?.salePrice}
          />
        </>
      )}
    </section>
  )
}

function InputField({ label, type = "text", value, onChange, isRequired = false, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-gray-500 text-sm font-medium">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`border px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"
          }`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function SelectField({ label, value, onChange, options = [], isRequired = false, disabled = false, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-gray-500 text-sm font-medium">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`border px-4 py-2 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"
          }`}
      >
        <option value="">Select {label}</option>
        {options?.map((item) => (
          <option key={item?.id} value={item?.id}>
            {item?.name || item?.seriesName}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}