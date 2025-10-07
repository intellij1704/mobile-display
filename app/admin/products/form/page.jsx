"use client"

import { useEffect, useState } from "react"
import BasicDetails from "./components/BasicDetails"
import Images from "./components/Images"
import Description from "./components/Description"
import KeyFeature from "./components/KeyFeature"
import InTheBox from "./components/InTheBox"
import WarrantyPolicy from "./components/WarrantyPolicy"
import SeoAndSku from "./components/SeoAndSku"
import { Button } from "@nextui-org/react"
import toast from "react-hot-toast"
import { createNewProduct, updateProduct } from "@/lib/firestore/products/write"
import { useRouter, useSearchParams } from "next/navigation"
import { getProduct } from "@/lib/firestore/products/read_server"
import Compatibility from "./components/Compatibility"

export default function Page() {
  const [data, setData] = useState(null)
  const [featureImage, setFeatureImage] = useState(null)
  const [imageList, setImageList] = useState([])
  const [variantImages, setVariantImages] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})


  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const fetchData = async () => {
    try {
      const res = await getProduct({ id })
      if (!res) {
        throw new Error("Product Not Found")
      } else {
        setData(res)
      }
    } catch (error) {
      toast.error(error?.message)
    }
  }

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const handleData = (key, value) => {
    setData((prevData) => ({
      ...(prevData ?? {}),
      [key]: value,
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    let hasError = false;
    const errors = {}

    try {
      // Image validations
      if (!featureImage && !data?.featureImageURL) {
        toast.error("Feature Image is required.")
        return
      }
      if (imageList.length === 0 && (!data?.imageList || data.imageList.length === 0)) {
        toast.error("At least one product image is required.")
        return
      }

      // Basic presence checks with per-field errors
      if (!data?.title?.trim()) {
        errors.title = "Product Name is required"
        hasError = true
      }
      if (!data?.shortDescription?.trim()) {
        errors.shortDescription = "Short Description is required"
        hasError = true
      }
      if (!data?.categoryId) {
        errors.categoryId = "Category is required"
        hasError = true
      }
      if (!data?.brandId) {
        errors.brandId = "Brand is required"
        hasError = true
      }
      if (!data?.seriesId) {
        errors.seriesId = "Series is required"
        hasError = true
      }
      if (!data?.modelId) {
        errors.modelId = "Model is required"
        hasError = true
      }

      if (hasError) {
        toast.error("Please fill in all required product fields.")
        setValidationErrors(errors)
        return
      }

      // Variable vs simple validation
      if (data?.isVariable) {
        const attrs = data?.attributes ?? []
        const vars = data?.variations ?? []

        if (attrs.length === 0) {
          toast.error("Add at least one attribute for variable products.")
          return
        }

        // Attribute validation: name + values + duplicate names
        const names = attrs.map((a) => (a?.name || "").trim().toLowerCase()).filter(Boolean)
        const dupNames = names.filter((n, i) => names.indexOf(n) !== i)
        const hasEmptyName = attrs.some((a) => !a?.name?.trim())
        const hasEmptyValues = attrs.some((a) => (a?.values ?? []).length === 0)

        if (hasEmptyName || hasEmptyValues || dupNames.length > 0) {
          toast.error("Attributes must have unique names and at least one value.")
          return
        }

        if ((attrs ?? []).some((a) => a.usedForVariations) && vars.length === 0) {
          toast.error("Please generate variations before submitting.")
          return
        }

        // Variation validation
        let variationsHaveErrors = false;
        vars.forEach((v) => {
          const varErrors = {}
          const price = Number(v?.price)
          const salePrice = Number(v?.salePrice)
          const stock = Number(v?.stock)

          if (v?.price === "" || isNaN(price) || price <= 0) {
            varErrors.price = "Valid regular price is required"
            console.log(" Price error")
            variationsHaveErrors = true;
          }
     
          if ((v?.salePrice !== "" && v?.salePrice != null) && (!isNaN(salePrice) && salePrice >= price)) {
            varErrors.salePrice = "Sale price must be less than regular price"
            console.log(" Sale price error")
            variationsHaveErrors = true;
          } else if ((v?.salePrice !== "" && v?.salePrice != null) && isNaN(salePrice)) {
            varErrors.salePrice = "Sale price must be a valid number"
            console.log(" Sale price error")
            variationsHaveErrors = true;
          }
          if (Object.keys(varErrors).length > 0) {
            errors[v.id] = varErrors
          }
        })

        if (variationsHaveErrors) {
          toast.error("Please fill required fields and ensure sale prices are valid for each variation.")
          setValidationErrors(errors)
          return
        }
      } else {
        // Simple product validation
        let simpleProductHasError = false;
        const price = Number(data?.price)
        const salePrice = Number(data?.salePrice)
        const stock = Number(data?.stock)

        if (data?.price === "" || isNaN(price) || price <= 0) {
          errors.price = "Valid price is required"
          simpleProductHasError = true;
        }
        if (data?.stock === "" || isNaN(stock) || stock < 0) {
          errors.stock = "Valid stock is required"
          simpleProductHasError = true;
        }
        if ((data?.salePrice !== "" && data?.salePrice != null) && (!isNaN(salePrice) && salePrice >= price)) {
          errors.salePrice = "Sale price must be less than price"
          simpleProductHasError = true;
        } else if ((data?.salePrice !== "" && data?.salePrice != null) && isNaN(salePrice)) {
          errors.salePrice = "Sale price must be a valid number"
          simpleProductHasError = true;
        }

        if (simpleProductHasError) {
          toast.error("Please fill required fields and ensure sale price is valid.")
          setValidationErrors(errors)
          return
        }
      }

      const action = id ? updateProduct : createNewProduct
      await action({ data, featureImage, imageList, variantImages })

      setData({})
      setFeatureImage(null)
      setImageList([])
      setVariantImages({})
      setValidationErrors({})

      toast.success(`Product is successfully ${id ? "Updated" : "Created"}!`)
      if (id) router.push(`/admin/products`)
    } catch (error) {
      console.error(error.message)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      className="flex flex-col gap-6 p-6 w-full max-w-6xl mx-auto bg-white shadow-md rounded-lg"
    >
      <div className="flex items-center justify-between w-full border-b pb-4">
        <h1 className="text-xl font-semibold">{id ? "Update Product" : "Create New Product"}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <BasicDetails
            data={data}
            handleData={handleData}
            variantImages={variantImages}
            setVariantImages={setVariantImages}
            variationValidationErrors={validationErrors}
          />
          <SeoAndSku data={data} handleData={handleData} />
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <Images
            data={data}
            featureImage={featureImage}
            setFeatureImage={setFeatureImage}
            imageList={imageList}
            setImageList={setImageList}
            handleData={handleData}
          />
          <KeyFeature data={data} handleData={handleData} />
          <Description data={data} handleData={handleData} />
          <InTheBox data={data} handleData={handleData} />
          <Compatibility data={data} handleData={handleData} />
          <WarrantyPolicy data={data} handleData={handleData} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          isLoading={isLoading}
          isDisabled={isLoading}
          type="submit"
          variant="primary"
          className="bg-[#313131] text-white px-6 py-2 rounded-lg text-sm"
        >
          {id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}