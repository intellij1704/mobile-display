"use client";

import React from "react";
import { Field, SelectField, SectionCard, Spinner } from "./Checkout";

function AddressSection({
    step,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    editingAddressId,
    isAddingNew,
    setIsAddingNew,
    addressForm,
    errors,
    handleAddressChange,
    handleSaveAddress,
    cancelAddress,
    startEditing,
    handleDeleteAddress,
    savingContact,
    onSaveContactNext,
}) {
    if (step !== "contact") return null;

    return (
        <SectionCard title="Delivery Address">
            <div className="space-y-4">
                {addresses.map((addr) => (
                    <div key={addr.id} className="rounded-lg border border-gray-200 p-4">
                        {editingAddressId === addr.id ? (
                            <div>
                                {/* --- Edit Address Form --- */}
                                <div className="grid grid-cols-1 gap-4">
                                    <Field
                                        label="Full Name *"
                                        name="fullName"
                                        value={addressForm.fullName}
                                        onChange={handleAddressChange}
                                        error={errors.fullName}
                                        placeholder="John Doe"
                                    />
                                    <Field
                                        label="Mobile Number *"
                                        name="mobile"
                                        type="tel"
                                        value={addressForm.mobile}
                                        onChange={handleAddressChange}
                                        error={errors.mobile}
                                        placeholder="+91 9876543210"
                                    />
                                    <Field
                                        label="Email *"
                                        name="email"
                                        type="email"
                                        value={addressForm.email}
                                        onChange={handleAddressChange}
                                        error={errors.email}
                                        placeholder="you@email.com"
                                    />
                                    <SelectField
                                        label="Country/Region *"
                                        name="country"
                                        value={addressForm.country}
                                        onChange={handleAddressChange}
                                        options={[
                                            { label: "India", value: "India" },
                                            { label: "United States", value: "USA" },
                                            { label: "United Kingdom", value: "UK" },
                                        ]}
                                    />
                                    <Field
                                        label="Street Address *"
                                        name="streetAddress"
                                        value={addressForm.streetAddress}
                                        onChange={handleAddressChange}
                                        error={errors.streetAddress}
                                        placeholder="123 Main St"
                                    />
                                    <Field
                                        label="Landmark"
                                        name="landmark"
                                        value={addressForm.landmark}
                                        onChange={handleAddressChange}
                                        placeholder="Near City Park"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <Field
                                        label="City *"
                                        name="city"
                                        value={addressForm.city}
                                        onChange={handleAddressChange}
                                        error={errors.city}
                                        placeholder="Mumbai"
                                    />
                                    <Field
                                        label="State *"
                                        name="state"
                                        value={addressForm.state}
                                        onChange={handleAddressChange}
                                        error={errors.state}
                                        placeholder="Maharashtra"
                                    />
                                    <Field
                                        label="PIN Code *"
                                        name="pinCode"
                                        value={addressForm.pinCode}
                                        onChange={handleAddressChange}
                                        error={errors.pinCode}
                                        placeholder="400001"
                                    />
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <button
                                        onClick={cancelAddress}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveAddress}
                                        className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-black"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-start">
                                <label className="flex items-start cursor-pointer flex-1">
                                    <input
                                        type="radio"
                                        checked={selectedAddressId === addr.id}
                                        onChange={() => setSelectedAddressId(addr.id)}
                                        className="mt-1 mr-3 h-5 w-5 accent-black"
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{addr.fullName}</p>
                                        <p className="text-sm text-gray-600">{addr.mobile}</p>
                                        <p className="text-sm text-gray-600">{addr.email}</p>
                                        <p className="text-sm text-gray-600">
                                            {addr.streetAddress}
                                            {addr.landmark ? `, ${addr.landmark}` : ""}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {addr.city}, {addr.state} {addr.pinCode}
                                        </p>
                                        <p className="text-sm text-gray-600">{addr.country}</p>
                                    </div>
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEditing(addr.id)}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAddress(addr.id)}
                                        className="text-sm text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* --- Add New Address --- */}
                {isAddingNew && (
                    <div className="rounded-lg border border-dashed border-gray-300 p-4">
                        <h4 className="text-sm font-medium mb-3">Add New Address</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <Field
                                label="Full Name *"
                                name="fullName"
                                value={addressForm.fullName}
                                onChange={handleAddressChange}
                                error={errors.fullName}
                                placeholder="John Doe"
                            />
                            <Field
                                label="Mobile Number *"
                                name="mobile"
                                type="tel"
                                value={addressForm.mobile}
                                onChange={handleAddressChange}
                                error={errors.mobile}
                                placeholder="+91 9876543210"
                            />
                            <Field
                                label="Email *"
                                name="email"
                                type="email"
                                value={addressForm.email}
                                onChange={handleAddressChange}
                                error={errors.email}
                                placeholder="you@email.com"
                            />
                            <SelectField
                                label="Country/Region *"
                                name="country"
                                value={addressForm.country}
                                onChange={handleAddressChange}
                                options={[
                                    { label: "India", value: "India" },
                                    { label: "United States", value: "USA" },
                                    { label: "United Kingdom", value: "UK" },
                                ]}
                            />
                            <Field
                                label="Street Address *"
                                name="streetAddress"
                                value={addressForm.streetAddress}
                                onChange={handleAddressChange}
                                error={errors.streetAddress}
                                placeholder="123 Main St"
                            />
                            <Field
                                label="Landmark"
                                name="landmark"
                                value={addressForm.landmark}
                                onChange={handleAddressChange}
                                placeholder="Near City Park"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <Field
                                label="City *"
                                name="city"
                                value={addressForm.city}
                                onChange={handleAddressChange}
                                error={errors.city}
                                placeholder="Mumbai"
                            />
                            <Field
                                label="State *"
                                name="state"
                                value={addressForm.state}
                                onChange={handleAddressChange}
                                error={errors.state}
                                placeholder="Maharashtra"
                            />
                            <Field
                                label="PIN Code *"
                                name="pinCode"
                                value={addressForm.pinCode}
                                onChange={handleAddressChange}
                                error={errors.pinCode}
                                placeholder="400001"
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={cancelAddress}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAddress}
                                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-black"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}

                {!isAddingNew && addresses.length > 0 && (
                    <button
                        onClick={() => setIsAddingNew(true)}
                        className="text-sm text-gray-700 hover:text-black underline"
                    >
                        Add New Address
                    </button>
                )}
            </div>

            {/* --- Save & Next --- */}
            <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    We’ll use this address for delivery and order updates.
                </p>
                <button
                    onClick={onSaveContactNext}
                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-black transition-colors"
                    disabled={savingContact}
                >
                    {savingContact ? (
                        <>
                            <Spinner />
                            <span className="ml-2">Saving...</span>
                        </>
                    ) : (
                        "Save & Next"
                    )}
                </button>
            </div>
        </SectionCard>
    );
}

export default AddressSection;
