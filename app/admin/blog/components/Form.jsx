"use client";

import { createBlogPost, updateBlogPost } from "@/lib/firestore/blog/write";
import { getBlogPost } from "@/lib/firestore/blog/read_server";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

export default function BlogForm() {
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
            const res = await getBlogPost({ id: id });
            if (!res) {
                toast.error("Blog Post Not Found!");
                router.push("/admin/blog");
                return;
            }
            setData(res);
            // Set existing image preview if available
            if (res.imageUrl) {
                setPreviewImage(res.imageUrl);
            }
        } catch (error) {
            toast.error(error?.message || "Failed to fetch blog post");
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
            fileInputRef.current.value = '';
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!data?.title || !data?.content || !image) {
            toast.error("Please fill in all required fields, including image.");
            return;
        }
        setIsLoading(true);
        try {
            await createBlogPost({ data: data, image: image });
            toast.success("Blog Post Created Successfully");
            // Reset form
            resetForm();
            // Optionally redirect
            // router.push("/admin/blog");
        } catch (error) {
            toast.error(error?.message || "Failed to create blog post");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!data?.title || !data?.content) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setIsLoading(true);
        try {
            // Ensure imageUrl is preserved if no new image
            const submitData = { ...data };
            if (!image && data.imageUrl) {
                // imageUrl already in data from fetch
            }
            await updateBlogPost({ id, data: submitData, image: image });
            toast.success("Blog Post Updated Successfully");
            // Reset form before redirect
            resetForm();
            router.push("/admin/blog");
        } catch (error) {
            toast.error(error?.message || "Failed to update blog post");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if (id) {
            handleUpdate(e);
        } else {
            handleCreate(e);
        }
    };

    // Cleanup object URL on unmount or image change
    useEffect(() => {
        return () => {
            if (previewImage && previewImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    return (
        <div className="flex flex-col gap-4 bg-white rounded-xl p-6 w-full max-w-md shadow-md">
            <h1 className="text-xl font-semibold text-gray-800">
                {id ? "Update" : "Create"} Blog Post
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Image Upload */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="blog-image" className="text-sm text-gray-600">
                        Featured Image <span className="text-red-500">*</span>
                    </label>
                    {previewImage && (
                        <div className="flex justify-center p-3">
                            <img
                                className="h-24 object-cover rounded-md"
                                src={previewImage}
                                alt="Preview"
                            />
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        id="blog-image"
                        name="blog-image"
                        type="file"
                        accept="image/*"
                        className="border border-gray-300 rounded-md p-2 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-blue-700 hover:file:bg-red-100"
                    />
                    {id && !image && data?.imageUrl && (
                        <p className="text-xs text-gray-500">Current image will be kept if no new one is selected.</p>
                    )}
                </div>

                {/* Title */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="blog-title" className="text-sm text-gray-600">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="blog-title"
                        name="blog-title"
                        type="text"
                        placeholder="Enter Blog Title"
                        value={data?.title ?? ""}
                        onChange={(e) => handleData("title", e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="blog-content" className="text-sm text-gray-600">
                        Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="blog-content"
                        name="blog-content"
                        placeholder="Enter Blog Content"
                        value={data?.content ?? ""}
                        onChange={(e) => handleData("content", e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                        required
                    />
                </div>

                {/* Excerpt */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="blog-excerpt" className="text-sm text-gray-600">
                        Excerpt
                    </label>
                    <textarea
                        id="blog-excerpt"
                        name="blog-excerpt"
                        placeholder="Enter Short Excerpt"
                        value={data?.excerpt ?? ""}
                        onChange={(e) => handleData("excerpt", e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                        isLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                    {isLoading ? "Processing..." : (id ? "Update" : "Create")}
                </button>
            </form>
        </div>
    );
}