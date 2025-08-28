"use client";

import React, { useEffect, useState } from "react";
import { getBlogPosts } from "@/lib/firestore/blog/read_server"; // Updated to get all posts
import { deleteBlogPost } from "@/lib/firestore/blog/write";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function ListView() {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            const data = await getBlogPosts();
            setBlogs(data || []);
        } catch (error) {
            toast.error("Failed to load blog posts: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleEdit = (id) => {
        router.push(`/admin/blog?id=${id}`);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this blog post?")) {
            setIsLoading(true);
            try {
                await deleteBlogPost({ id });
                toast.success("Blog post deleted successfully");
                setBlogs(blogs.filter((blog) => blog.id !== id));
            } catch (error) {
                toast.error("Failed to delete blog post: " + error.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Blog Posts</h1>

            {isLoading ? (
                <div className="text-center text-gray-600">Loading...</div>
            ) : blogs.length === 0 ? (
                <div className="text-center text-gray-600">No blog posts found</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <div
                            key={blog.id}
                            className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow"
                        >
                            {blog.imageUrl && (
                                <img
                                    src={blog.imageUrl}
                                    alt={blog.title}
                                    className="w-full h-40 object-cover rounded-md"
                                />
                            )}
                            <h2 className="text-lg font-semibold text-gray-800">{blog.title}</h2>
                            <p className="text-gray-600 text-sm line-clamp-2">{blog.excerpt || blog.content.substring(0, 100) + "..."}</p>
                            <div className="flex justify-between mt-auto">
                                <button
                                    onClick={() => handleEdit(blog.id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(blog.id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ListView;