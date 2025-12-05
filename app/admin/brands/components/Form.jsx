"use client";

import { getBrand } from "@/lib/firestore/brands/read_server";
import { createNewBrand, updateBrand } from "@/lib/firestore/brands/write";
import { Button } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UploadCloud, X, Loader2, Save, XCircle } from "lucide-react";

export default function Form() {
  const [brandData, setBrandData] = useState({ name: "" });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const fetchBrand = async () => {
    try {
      const res = await getBrand({ id });
      if (!res) {
        toast.error("Brand Not Found!");
        router.push("/admin/brands");
      } else {
        setBrandData(res);
        if (res.imageURL) setImagePreview(res.imageURL);
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  useEffect(() => {
    if (id) fetchBrand();
    else {
      // Reset form when creating a new brand
      setBrandData({ name: "" });
      setImage(null);
      setImagePreview(null);
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBrandData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files?.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (id) {
        await updateBrand({ id, data: brandData, image });
        toast.success("Brand updated successfully!");
      } else {
        await createNewBrand({ data: brandData, image });
        toast.success("Brand created successfully!");
      }
      // Reset form and navigate
      setBrandData({ name: "" });
      setImage(null);
      setImagePreview(null);
      router.push("/admin/brands");
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form state
    setBrandData({ name: "" });
    setImage(null);
    setImagePreview(null);
    // Navigate back to brands page
    router.push("/admin/brands");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full max-w-md mx-auto h-full">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        {id ? "Update Brand" : "Create New Brand"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Brand Image <span className="text-red-500">*</span>
          </label>

          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Brand preview"
                  className="h-32 object-contain rounded-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                <div className="mt-2 flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload an image</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleImageChange}
                      accept="image/*"
                      required={!id}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={brandData.name}
            onChange={handleInputChange}
            placeholder="E.G. Apple, Samsung, Poco"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          {(id || brandData.name || imagePreview) && (
            <Button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 flex items-center"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : id ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {id ? "Update Brand" : "Create Brand"}
          </Button>
        </div>
      </form>
    </div>
  );
}