"use client";

import { useAllOrders, useOrders } from "@/lib/firestore/orders/read";
import { useUsers } from "@/lib/firestore/user/read";
import { CircularProgress, Avatar } from "@mui/material";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ListView() {
    const [pageLimit, setPageLimit] = useState(10);
    const [lastSnapDocList, setLastSnapDocList] = useState([]);

    const { data: users = [], error: usersError, isLoading: usersLoading } = useUsers();
    const { data: orders, isLoading, lastSnapDoc, error } = useAllOrders({
        pageLimit,
        lastSnapDoc: lastSnapDocList.length === 0 ? null : lastSnapDocList[lastSnapDocList.length - 1],
    });

    useEffect(() => setLastSnapDocList([]), [pageLimit]);

    if (isLoading || usersLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
                <CircularProgress size={50} color="primary" thickness={4} />
                <p className="mt-4 text-center text-gray-600">Please Wait...</p>
            </div>
        );
    }

    if (error || usersError) {
        return <div>{error?.message || usersError?.message || "An error occurred"}</div>;
    }

    return (
        <div className="flex-1 flex flex-col gap-4 px-5 py-4 rounded-xl w-full overflow-x-auto bg-gray-50">
            <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                <thead className="bg-gray-100">
                    <tr>
                        {[
                            "SN",
                            "Customer",
                            "Total Price",
                            "Total Products",
                            "Order Date",
                            "Payment Mode",
                            "Status",
                            "User Last Order Status",
                            "User Type",
                            "User Flag",
                            "Address Match %",
                            "Remarks",
                            "Actions"
                        ].map((header) => (
                            <th key={header} className="px-4 py-3 text-left font-semibold text-gray-700">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {orders?.length > 0 ? (
                        orders.map((item, index) => (
                            <Row
                                key={item.id}
                                index={index + lastSnapDocList.length * pageLimit}
                                item={item}
                                users={users}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={13} className="text-center py-5 text-gray-500 text-sm">
                                No orders found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="flex justify-between items-center py-4">
                <Button
                    isDisabled={isLoading || lastSnapDocList.length === 0}
                    onClick={() => setLastSnapDocList(lastSnapDocList.slice(0, -1))}
                    size="sm"
                    variant="bordered"
                >
                    Previous
                </Button>
                <select
                    value={pageLimit}
                    onChange={(e) => setPageLimit(Number(e.target.value))}
                    className="px-4 py-2 rounded-md border border-gray-300"
                >
                    {[3, 5, 10, 20, 100].map((value) => (
                        <option key={value} value={value}>{value} Items</option>
                    ))}
                </select>
                <Button
                    isDisabled={isLoading || orders?.length < pageLimit}
                    onClick={() => setLastSnapDocList([...lastSnapDocList, lastSnapDoc])}
                    size="sm"
                    variant="bordered"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

// Calculate address match percentage between two addresses
function calculateAddressMatch(currentAddressStr, previousAddressStr) {
    if (!currentAddressStr || !previousAddressStr) return 0;

    let current, prev;
    try {
        current = JSON.parse(currentAddressStr);
        prev = JSON.parse(previousAddressStr);
    } catch (e) {
        return 0;
    }

    let matchCount = 0;
    const totalFields = 3; // pincode, city, addressLine1

    if (current.pincode === prev.pincode) matchCount++;
    if ((current.city || "").toLowerCase() === (prev.city || "").toLowerCase()) matchCount++;
    if ((current.addressLine1 || "").toLowerCase() === (prev.addressLine1 || "").toLowerCase()) matchCount++;

    return Math.round((matchCount / totalFields) * 100);
}

function Row({ item, index, users }) {
    const lineItems = item?.checkout?.line_items || [];
    const productItems = lineItems.filter(curr => {
        const name = curr?.price_data?.product_data?.name || "";
        return name !== "COD Fee" && name !== "Express Delivery";
    });
    const subtotal = productItems.reduce((prev, curr) => prev + (curr?.price_data?.unit_amount / 100) * curr?.quantity, 0);
    const codFeeItem = lineItems.find(curr => curr?.price_data?.product_data?.name === "COD Fee");
    const deliveryFeeItem = lineItems.find(curr => curr?.price_data?.product_data?.name === "Express Delivery");
    const codFee = item?.checkout?.codFee || (codFeeItem ? (codFeeItem?.price_data?.unit_amount / 100) * (codFeeItem?.quantity || 1) : 0);
    const deliveryFee = item?.checkout?.deliveryFee || (deliveryFeeItem ? (deliveryFeeItem?.price_data?.unit_amount / 100) * (deliveryFeeItem?.quantity || 1) : 0);
    const totalAmount = item?.checkout?.total || (subtotal + codFee + deliveryFee);

    const user = users.find(u => u.id === item.uid);
    const { data: userOrders } = useOrders({ uid: item.uid });

    const isNewCustomer = userOrders?.length <= 1;

    // Compute highest address match with all previous orders of the user
    let addressMatchPercentage = null;
    if (user?.flagged && userOrders?.length > 1) {
        const previousOrders = userOrders.filter(o => o.id !== item.id); // exclude current order
        const matches = previousOrders.map(prevOrder =>
            calculateAddressMatch(item?.address?.address, prevOrder?.address?.address)
        );
        addressMatchPercentage = matches.length > 0 ? Math.max(...matches) : 0;
    }

    const previousOrderStatus = userOrders
        ?.filter(o => o.id !== item.id)
        ?.sort((a, b) => b.timestampCreate.toMillis() - a.timestampCreate.toMillis())[0]?.status || "pending";

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-700",
        shipped: "bg-blue-100 text-blue-700",
        pickup: "bg-purple-100 text-purple-700",
        inTransit: "bg-orange-100 text-orange-700",
        outForDelivery: "bg-indigo-100 text-indigo-700",
        delivered: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
        "N/A": "bg-gray-100 text-gray-700"
    };

    const userTypeColors = {
        New: "bg-green-100 text-green-700",
        Existing: "bg-blue-100 text-blue-700"
    };

    return (
        <tr className="border-b hover:bg-gray-100 transition">
            <td className="px-4 py-3 text-center">{index + 1}</td>
            <td className="border-y px-3 py-2 whitespace-nowrap">
                <div className="flex gap-2 items-center">
                    <Avatar src={user?.photoURL || "/default-avatar.png"} sx={{ width: 32, height: 32 }} />
                    <div>
                        <h2 className="text-xs font-semibold uppercase">{user?.displayName || "Unknown"}</h2>
                        <h2 className="text-xs text-gray-600">{user?.mobileNo || "N/A"}</h2>
                        <h2 className="text-xs text-gray-500">{user?.email || "No Email"}</h2>
                    </div>
                </div>
            </td>
            <td className="border-y px-3 py-2 whitespace-nowrap text-gray-600">₹ {totalAmount.toFixed(2)}</td>
            <td className="border-y px-3 py-2 text-gray-600">{productItems.length}</td>
            <td className="border-y px-3 py-2 text-xs md:text-sm text-gray-600">{item?.timestampCreate?.toDate()?.toLocaleString() || "N/A"}</td>
            <td className="border-y px-3 py-2">
                <span className="bg-red-100 text-blue-600 text-xs px-3 py-1 rounded-full">
                    {item?.paymentMode === "cod" ? "Cash On Delivery" : item?.paymentMode || "N/A"}
                </span>
            </td>
            <td className="border-y px-3 py-2">
                <span className={`text-xs px-3 py-1 rounded-full uppercase ${statusColors[item?.status || "pending"]}`}>
                    {item?.status || "Pending"}
                </span>
            </td>
            <td className="border-y px-3 py-2">
                <span className={`text-xs px-3 py-1 rounded-full uppercase ${statusColors[previousOrderStatus]}`}>
                    {previousOrderStatus}
                </span>
            </td>
            <td className="border-y px-3 py-2">
                <span className={`text-xs px-3 py-1 rounded-full uppercase ${userTypeColors[isNewCustomer ? "New" : "Existing"]}`}>
                    {isNewCustomer ? "New" : "Existing"}
                </span>
            </td>
            <td className="border-y px-3 py-2 text-gray-600">{user?.flagged ? "Yes" : "No"}</td>
            <td className="border-y px-3 py-2 text-gray-600">{addressMatchPercentage !== null ? `${addressMatchPercentage}%` : "-"}</td>
            <td className="border-y px-3 py-2 text-gray-600">{user?.remarks || "N/A"}</td>
            <td className="border-y px-3 py-2 rounded-r-lg border-r">
                <div className="flex">
                    <Link href={`/admin/orders/${item?.id}`}>
                        <button className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1 rounded">
                            View Order
                        </button>
                    </Link>
                </div>
            </td>
        </tr>
    );
}
