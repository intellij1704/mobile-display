"use client";

import { useEffect, useState } from "react";
import BasicDetails from "./components/BasicDetails";
import Images from "./components/Images";
import Description from "./components/Description";
import KeyFeature from "./components/KeyFeature";
import InTheBox from "./components/InTheBox";
import Compatibility from "./components/Compatibility";
import WarrantyPolicy from "./components/WarrantyPolicy"; // 🔥 NEW COMPONENT
import SeoAndSku from "./components/SeoAndSku";
import { Button } from "@nextui-org/react";
import toast from "react-hot-toast";
import { createNewProduct, updateProduct } from "@/lib/firestore/products/write";
import { useRouter, useSearchParams } from "next/navigation";
import { getProduct } from "@/lib/firestore/products/read_server";

export default function Page() {
  const [data, setData] = useState(null);
  const [featureImage, setFeatureImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [variantImages, setVariantImages] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const fetchData = async () => {
    try {
      const res = await getProduct({ id });
      if (!res) {
        throw new Error("Product Not Found");
      } else {
        setData(res);
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleData = (key, value) => {
    setData((prevData) => ({
      ...(prevData ?? {}),
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const action = id ? updateProduct : createNewProduct;
      await action({ data, featureImage, imageList, variantImages });

      setData({});
      setFeatureImage(null);
      setImageList([]);
      setVariantImages({});

      toast.success(`Product is successfully ${id ? "Updated" : "Created"}!`);
      if (id) router.push(`/admin/products`);
    } catch (error) {
      console.error(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="flex flex-col gap-6 p-6 w-full max-w-6xl mx-auto bg-white shadow-md rounded-lg"
    >
      <div className="flex items-center justify-between w-full border-b pb-4">
        <h1 className="text-xl font-semibold">
          {id ? "Update Product" : "Create New Product"}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <BasicDetails data={data} handleData={handleData} />
          <SeoAndSku data={data} handleData={handleData} />
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <Images
            data={data}
            featureImage={featureImage}
            setFeatureImage={setFeatureImage}
            imageList={imageList}
            setImageList={setImageList}
            variantImages={variantImages}
            setVariantImages={setVariantImages}
          />
          <Description data={data} handleData={handleData} />
          <KeyFeature data={data} handleData={handleData} />
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
  );
}