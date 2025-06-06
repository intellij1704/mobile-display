"use client";

import { useUsers } from "@/lib/firestore/user/read";
import { updateUser } from "@/lib/firestore/user/write";
import { CircularProgress } from "@mui/material";
import { Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Input, Button } from "@nextui-org/react";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ListView() {
    const { data: users = [], error, isLoading } = useUsers();
    const [search, setSearch] = useState("");
    const [editingRemark, setEditingRemark] = useState(null);
    const [remarkValue, setRemarkValue] = useState("");

    const usersData = users.map((user, index) => ({
        ...user,
        remarks: user.remarks,
        flagged: user.flagged ?? false
    }));

    const handleFlagUpdate = async (userId, flagged) => {
        try {
            await updateUser(userId, { flagged });
            toast.success("User flag updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            toast.error("Failed to update user flag.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleRemarkUpdate = async (userId) => {
        try {
            await updateUser(userId, { remarks: remarkValue });
            setEditingRemark(null);
            toast.success("User remark updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            toast.error("Failed to update user remark.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-100">
                <CircularProgress size={50} thickness={4} color="primary" />
                <p className="mt-4 text-gray-600 font-medium">Fetching Users...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center py-8">{error}</div>;
    }

    const filteredUsers = usersData.filter(user =>
        (user?.displayName?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (user?.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (user?.mobileNo || "").includes(search)
    );

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
            <div className="sm:flex sm:items-center mb-8">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage user accounts and view their details
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <div className="relative rounded-md shadow-sm">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-72 rounded-md border-0 py-1.5 pl-9 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                ID
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Photo
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Name
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Email
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Mobile No
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                User Flag
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Remarks
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        #{index + 1}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 text-center">
                                        <Avatar src={user?.photoURL} />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                        {user?.displayName || "N/A"}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                        {user?.email || "N/A"}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                        {user?.mobileNo || "N/A"}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <Button variant="light" >
                                                    {user.flagged ? "Yes" : "No"}
                                                </Button>
                                            </DropdownTrigger>
                                            <DropdownMenu
                                                aria-label="Flag options"
                                                onAction={(key) => handleFlagUpdate(user.id, key === "yes")}
                                            >
                                                <DropdownItem key="yes">Yes</DropdownItem>
                                                <DropdownItem key="no">No</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                        {editingRemark === user.id ? (
                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    value={remarkValue}
                                                    onChange={(e) => setRemarkValue(e.target.value)}
                                                    placeholder="Enter remark"
                                                    size="sm"
                                                    className="w-40"
                                                />
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    onClick={() => handleRemarkUpdate(user.id)}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="light"
                                                    onClick={() => setEditingRemark(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 items-center">
                                                <span>{user.remarks || "No Such Remarks"}</span>
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    onClick={() => {
                                                        setEditingRemark(user.id);
                                                        setRemarkValue(user.remarks || "");
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-8 text-center">
                                    <div className="text-gray-500 text-sm">No users found matching your criteria</div>
                                    <div className="mt-1 text-gray-400 text-xs">Try adjusting your search terms</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <ToastContainer />
        </div>
    );
}