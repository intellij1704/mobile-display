"use client";

import { getAdmin } from "@/lib/firestore/admins/read_server";
import { createNewAdmin, updateAdmin } from "@/lib/firestore/admins/write";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

export default function Form() {
  const [data, setData] = useState(null);
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const fetchData = async () => {
    try {
      const res = await getAdmin({ id: id });
      if (!res) {
        toast.error("Admin Not Found!");
      } else {
        setData(res);
        if (res.imageURL) {
          setPreviewImage(res.imageURL);
        }
      }
    } catch (error) {
      toast.error(error?.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleData = (key, value) => {
    setData((prevData) => ({
      ...(prevData ?? {}),
      [key]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setData(null);
    setImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await createNewAdmin({ data: data, image: image });
      toast.success("Successfully Created");
      resetForm();
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await updateAdmin({ data: data, image: image });
      toast.success("Successfully Updated");
      resetForm();
      router.push(`/admin/admins`);
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
      <h1 className="font-semibold">{id ? "Update" : "Create"} Admin</h1>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="admin-image" className="text-gray-500 text-sm">
            Image <span className="text-red-500">*</span>
          </label>
          {previewImage && (
            <div className="flex justify-center items-center p-3">
              <img
                className="h-20 w-20 object-cover rounded"
                src={previewImage}
                alt="Admin preview"
              />
            </div>
          )}
          <input
            ref={fileInputRef}
            onChange={handleImageChange}
            id="admin-image"
            name="admin-image"
            type="file"
            accept="image/*"
            className="border px-4 py-2 rounded-lg w-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="admin-name" className="text-gray-500 text-sm">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="admin-name"
            name="admin-name"
            type="text"
            placeholder="Enter Name"
            value={data?.name ?? ""}
            onChange={(e) => handleData("name", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="admin-email" className="text-gray-500 text-sm">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="admin-email"
            name="admin-email"
            type="email"
            placeholder="Enter Email"
            value={data?.email ?? ""}
            onChange={(e) => handleData("email", e.target.value)}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
            required
          />
        </div>
        <button
          type="button"
          onClick={id ? handleUpdate : handleCreate}
          disabled={isLoading}
          className={`
            px-4 py-2 rounded-lg text-white font-medium
            bg-red-600 hover:bg-red-700
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center
          `}
        >
          {isLoading ? "Loading..." : id ? "Update" : "Create"}
        </button>
      </div>
    </div>
  );
}