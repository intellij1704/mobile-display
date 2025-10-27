"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";
import { useUsers } from "@/lib/firestore/user/read";
import { updateUser } from "@/lib/firestore/user/write";

export default function ListView() {
  const { data: users = [], error, isLoading } = useUsers();
  const [search, setSearch] = useState("");
  const [editingRemark, setEditingRemark] = useState(null);
  const [remarkValue, setRemarkValue] = useState("");

  const usersData = users.map((user) => ({
    ...user,
    remarks: user.remarks,
    flagged: user.flagged ?? false,
  }));

  const handleFlagUpdate = async (userId, flagged) => {
    try {
      await updateUser(userId, { flagged });
      toast.success("User flag updated successfully!");
    } catch (err) {
      toast.error("Failed to update user flag.");
    }
  };

  const handleRemarkUpdate = async (userId) => {
    try {
      await updateUser(userId, { remarks: remarkValue });
      setEditingRemark(null);
      toast.success("User remark updated successfully!");
    } catch (err) {
      toast.error("Failed to update user remark.");
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

  const filteredUsers = usersData.filter(
    (user) =>
      (user?.displayName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (user?.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (user?.mobileNo || "").includes(search)
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage user accounts and view their details.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-72 rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {["ID", "Photo", "Name", "Email", "Mobile No", "User Flag", "Remarks"].map((heading) => (
                <th
                  key={heading}
                  className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>

                  <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-700">
                    <img
                      src={user?.photoURL || "/default-avatar.png"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  </td>

                  <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-700">
                    {user?.displayName || "N/A"}
                  </td>

                  <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-700">
                    {user?.email || "N/A"}
                  </td>

                  <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-700">
                    {user?.mobileNo || "N/A"}
                  </td>

                  <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-700">
                    <div className="relative inline-block">
                      <select
                        value={user.flagged ? "Yes" : "No"}
                        onChange={(e) =>
                          handleFlagUpdate(user.id, e.target.value === "Yes")
                        }
                        className="rounded-md border border-gray-300 bg-white py-1 px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </td>

                  <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-700">
                    {editingRemark === user.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={remarkValue}
                          onChange={(e) => setRemarkValue(e.target.value)}
                          placeholder="Enter remark"
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleRemarkUpdate(user.id)}
                          className="px-2 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingRemark(null)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{user.remarks || "No Remarks"}</span>
                        <button
                          onClick={() => {
                            setEditingRemark(user.id);
                            setRemarkValue(user.remarks || "");
                          }}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-gray-500 text-sm"
                >
                  No users found matching your criteria.
                  <div className="mt-1 text-gray-400 text-xs">
                    Try adjusting your search terms.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
