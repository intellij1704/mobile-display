"use client";

import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from '@/lib/firebase';
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { updateUser } from "@/lib/firestore/user/write";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from "firebase/auth";
function Page() {
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const { data: userData, isLoading: dataLoading } = currentUser ? useUser({ uid: currentUser.uid }) : { data: null, isLoading: false };

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [photoURL, setPhotoURL] = useState("");
    const [photoFile, setPhotoFile] = useState(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (userData) {
            setDisplayName(userData.displayName || "");
            setEmail(userData.email || "");
            setMobileNumber(userData.mobileNo || "");
            setPhotoURL(userData.photoURL || "");
        }
    }, [userData]);

    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setPhotoFile(file);
        }
    };

    const handleUpdate = async () => {
        if (!currentUser) return;

        if (!displayName || !email) {
            toast.error("Display name and email are required");
            return;
        }

        let reauthed = false;
        const reauth = async () => {
            if (reauthed) return;
            if (!currentPassword) {
                throw new Error("Current password is required for this operation");
            }
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            reauthed = true;
        };

        try {
            let newPhotoURL = photoURL;
            if (photoFile) {
                const storage = getStorage();
                const storageRef = ref(storage, `profilePhotos/${currentUser.uid}`);
                await uploadBytes(storageRef, photoFile);
                newPhotoURL = await getDownloadURL(storageRef);
            }

            // Update Auth profile
            await updateProfile(currentUser, { displayName, photoURL: newPhotoURL });

            // If email changed
            if (email !== currentUser.email) {
                await reauth();
                await updateEmail(currentUser, email);
            }

            // If password fields are all filled
            if (currentPassword && newPassword && confirmPassword) {
                if (newPassword !== confirmPassword) {
                    throw new Error("New password and confirm password do not match");
                }
                await reauth();
                await updatePassword(currentUser, newPassword);
            }

            // Update Firestore
            await updateUser(currentUser.uid, {
                displayName,
                email,
                mobileNo: mobileNumber,
                photoURL: newPhotoURL,
            });

            setPhotoFile(null);
            setPhotoURL(newPhotoURL);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setSuccessMessage("Profile updated successfully!");
            toast.success("Profile updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            toast.error(error.message || "Error updating profile");
            console.error(error);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            toast.success("Logout successfully!");
        } catch (error) {
            toast.error("Error logging out");
        }
    };

    if (authLoading || dataLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!currentUser) {
        return <div className="min-h-screen flex items-center justify-center">Please log in to edit your profile.</div>;
    }

    const preview = photoFile ? URL.createObjectURL(photoFile) : photoURL || " ";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white shadow-xl rounded-lg p-6 w-full max-w-2xl border border-gray-200">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Edit profile</h1>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center">
                        <img
                            src={preview}
                            alt="Profile"
                            className="w-28 h-28 rounded-full object-cover mb-3 border-2 border-gray-300"
                        />
                        <label className="cursor-pointer bg-gray-100 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-200 transition duration-200">
                            Upload
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                            />
                        </label>
                        <p className="text-sm text-gray-600 mt-1">Profile photo</p>
                    </div>
                    <div className="w-full">
                        <h2 className="text-xl font-semibold mb-6 text-gray-800">Account info</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">DISPLAY NAME</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">EMAIL</label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled={true} // Disable if email is not verified
                                    title={"Email cannot be changed"}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 cursor-not-allowed block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">MOBILE NUMBER</label>
                                <input
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold mb-6 mt-8 text-gray-800">Change Password (optional)</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">CURRENT PASSWORD</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NEW PASSWORD</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">CONFIRM PASSWORD</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {successMessage && (
                    <p className="text-green-600 text-center mt-6">{successMessage}</p>
                )}
                <div className="flex justify-end mt-8">

                    <button
                        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-200"
                        onClick={handleUpdate}
                    >
                        Update
                    </button>
                </div>
                <button
                    className="mt-4 bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition duration-200 flex items-center"
                    onClick={handleLogout}
                >
                    <span className="mr-2">🔓</span> Log Out
                </button>
            </div>
        </div>
    );
}

export default Page;