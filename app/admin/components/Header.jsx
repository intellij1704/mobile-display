"use client";

import React from "react";
import { Bell, UserCircle, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/lib/firestore/admins/read";
import {
    Avatar,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSection
} from "@nextui-org/react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function AdminHeader() {
    const { user } = useAuth();
    const { data: admin } = useAdmin({ email: user?.email });

    console.log(admin)

    const handleLogout = async () => {
        try {
            await toast.promise(signOut(auth), {
                error: (e) => e?.message,
                loading: "Processing...",
                success: "Logout Successfully"
            });
        } catch (error) {
            toast.error(error?.message);
        }
    };

    return (
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between border-b border-gray-200">
            {/* Left Section: Logo / Menu */}
            <div className="flex items-center space-x-4">

                <h1 className="text-md font-bold text-gray-800">Admin Dashboard</h1>
            </div>

            {/* Right Section: Admin Actions */}
            <div className="flex items-center space-x-6 relative">
                {/* Notifications */}
                <Dropdown>
                    <DropdownTrigger>
                        <button className="relative text-gray-600 hover:text-black p-2 rounded-full transition duration-300 ease-in-out">
                            <Bell size={24} />
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 shadow-lg">3</span>
                        </button>
                    </DropdownTrigger>
                    <DropdownMenu className="bg-green-100 w-64 rounded-lg shadow-lg overflow-hidden">
                        <DropdownSection>
                            <DropdownItem key="notification1">New user registered</DropdownItem>
                            <DropdownItem key="notification2">Order #1234 has been shipped</DropdownItem>
                            <DropdownItem key="notification3">System update available</DropdownItem>
                        </DropdownSection>
                    </DropdownMenu>
                </Dropdown>

                {/* Admin Info & Avatar */}
                <Dropdown>
    <DropdownTrigger>
  <button className="flex items-center space-x-3 focus:outline-none">
    {/* Admin name and email */}
    <div className="text-right hidden md:block">
      <h2 className="text-sm font-semibold text-gray-800 capitalize">
        {admin?.name || "Admin"}
      </h2>
      <h3 className="text-xs text-gray-500">
        {admin?.email || "admin@example.com"}
      </h3>
    </div>

    {/* Plain HTML img with fallback */}
    <img
      src={admin?.imageURL || "/default-avatar.png"}
      alt={admin?.name || "Admin"}
      className="w-10 h-10 rounded-full border border-gray-300 shadow-md object-cover"
    />
  </button>
</DropdownTrigger>

                    <DropdownMenu className="bg-white w-44 rounded-lg shadow-lg overflow-hidden">
                        <DropdownItem key="profile" className="py-2 hover:bg-gray-100">Profile</DropdownItem>
                        <DropdownItem key="settings" className="py-2 hover:bg-gray-100">Settings</DropdownItem>
                        <DropdownItem key="logout" className="py-2 text-red-500 hover:bg-red-100" onClick={handleLogout}>Logout</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </header>
    );
}