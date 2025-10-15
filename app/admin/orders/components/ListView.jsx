"use client";

import { useAllOrders } from "@/lib/firestore/orders/read";
import { useUsers } from "@/lib/firestore/user/read";
import { CircularProgress, Avatar } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useSWRSubscription from "swr/subscription";

function useAllCancelRequests() {
    const { data, error } = useSWRSubscription(
        ["cancel_requests"],
        ([path], { next }) => {
            const ref = query(
                collection(db, path),
                orderBy("timestamp", "desc")
            );
            const unsub = onSnapshot(
                ref,
                (snapshot) =>
                    next(
                        null,
                        snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }))
                    ),
                (err) => next(err, [])
            );
            return () => unsub();
        }
    );

    return { data: data || [], error, isLoading: data === undefined };
}

export default function ListView() {
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: users = [], error: usersError, isLoading: usersLoading } = useUsers();
    const { data: allOrders = [], isLoading: ordersLoading, error: ordersError } = useAllOrders({
        pageLimit: 1000, // Fetch all orders (adjust if dataset is very large)
        lastSnapDoc: null,
    });
    const { data: allCancelRequests = [], isLoading: cancelLoading, error: cancelError } = useAllCancelRequests();

    const statuses = ["all", "pending", "shipped", "pickup", "intransit", "outfordelivery", "delivered", "cancelled", "cancelrequested"];


    console.log(allOrders)
    // Normalize status for filtering (assuming DB statuses are lowercase)
    const normalizedAllOrders = allOrders.map(order => ({
        ...order,
        status: order.status?.toLowerCase() || "pending"
    }));

    const filteredOrders = (() => {
        if (selectedStatus === "all") return normalizedAllOrders;
        if (selectedStatus === "cancelrequested") {
            return normalizedAllOrders.filter(order => {
                if (order.status === "cancelled") return false;
                const cancelRequest = allCancelRequests.find(cr => cr.id === order.cancelRequestId);
                return cancelRequest && cancelRequest.status === "pending";
            });
        }
        return normalizedAllOrders.filter(item => item.status === selectedStatus);
    })();

    // Client-side pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filter or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, itemsPerPage]);

    if (ordersLoading || usersLoading || cancelLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
                <CircularProgress size={50} color="primary" thickness={4} />
                <p className="mt-4 text-center text-gray-600">Please Wait...</p>
            </div>
        );
    }

    if (ordersError || usersError || cancelError) {
        return <div className="p-4 text-red-600">{ordersError?.message || usersError?.message || cancelError?.message || "An error occurred"}</div>;
    }

    const exportToExcel = () => {
        if (filteredOrders.length === 0) return;

        const exportData = filteredOrders.map((item, index) => {
            const user = users.find(u => u.id === item.uid);
            const userOrders = normalizedAllOrders.filter(o => o.uid === item.uid);
            const previousOrders = userOrders.filter(o => o.id !== item.id);
            const previousOrderStatus = previousOrders
                .sort((a, b) => b.timestampCreate.toMillis() - a.timestampCreate.toMillis())[0]?.status || "N/A";
            const isNewCustomer = userOrders.length <= 1;

            let addressMatchPercentage = null;
            if (user?.flagged && previousOrders.length > 0) {
                const matches = previousOrders.map(prevOrder =>
                    calculateAddressMatch(item?.checkout?.metadata?.address, prevOrder?.checkout?.metadata?.address)
                );
                addressMatchPercentage = matches.length > 0 ? Math.max(...matches) : 0;
            }

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

            const cancelRequest = allCancelRequests.find(cr => cr.id === item.cancelRequestId);
            const displayStatus = item.status === "cancelled" ? "Cancelled" : (cancelRequest && cancelRequest.status === "pending") ? "Cancel Requested" : item.status.charAt(0).toUpperCase() + item.status.slice(1);

            return {
                SN: index + 1,
                Customer: user?.displayName || "Unknown",
                "Mobile No": user?.mobileNo || "N/A",
                Email: user?.email || "No Email",
                "Total Price": `₹ ${totalAmount.toFixed(2)}`,
                "Total Products": productItems.length,
                "Order Date": item?.timestampCreate?.toDate()?.toLocaleString() || "N/A",
                "Payment Mode": item?.paymentMode === "cod" ? "COD" : item?.paymentMode || "N/A",
                Status: displayStatus,
                "User Last Order Status": previousOrderStatus,
                "User Type": isNewCustomer ? "New" : "Existing",
                "User Flag": user?.flagged ? "Yes" : "No",
                "Address Match %": addressMatchPercentage !== null ? `${addressMatchPercentage}%` : "-",
                Remarks: user?.remarks || "N/A",
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
        XLSX.writeFile(wb, `orders_${selectedStatus}.xlsx`);
    };

    const exportToPDF = () => {
        if (filteredOrders.length === 0) return;

        const doc = new jsPDF();
        const tableColumn = [
            "SN",
            "Customer",
            "Mobile No",
            "Email",
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
        ];

        const exportData = filteredOrders.map((item, index) => {
            const user = users.find(u => u.id === item.uid);
            const userOrders = normalizedAllOrders.filter(o => o.uid === item.uid);
            const previousOrders = userOrders.filter(o => o.id !== item.id);
            const previousOrderStatus = previousOrders
                .sort((a, b) => b.timestampCreate.toMillis() - a.timestampCreate.toMillis())[0]?.status || "N/A";
            const isNewCustomer = userOrders.length <= 1;

            let addressMatchPercentage = null;
            if (user?.flagged && previousOrders.length > 0) {
                const matches = previousOrders.map(prevOrder =>
                    calculateAddressMatch(item?.checkout?.metadata?.address, prevOrder?.checkout?.metadata?.address)
                );
                addressMatchPercentage = matches.length > 0 ? Math.max(...matches) : 0;
            }

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

            const cancelRequest = allCancelRequests.find(cr => cr.id === item.cancelRequestId);
            const displayStatus = item.status === "cancelled" ? "Cancelled" : (cancelRequest && cancelRequest.status === "pending") ? "Cancel Requested" : item.status.charAt(0).toUpperCase() + item.status.slice(1);

            return [
                index + 1,
                user?.displayName || "Unknown",
                user?.mobileNo || "N/A",
                user?.email || "No Email",
                `₹ ${totalAmount.toFixed(2)}`,
                productItems.length,
                item?.timestampCreate?.toDate()?.toLocaleString() || "N/A",
                item?.paymentMode === "cod" ? "COD" : item?.paymentMode || "N/A",
                displayStatus,
                previousOrderStatus,
                isNewCustomer ? "New" : "Existing",
                user?.flagged ? "Yes" : "No",
                addressMatchPercentage !== null ? `${addressMatchPercentage}%` : "-",
                user?.remarks || "N/A",
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: exportData,
            theme: "striped",
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { top: 10 },
        });

        doc.save(`orders_${selectedStatus}.pdf`);
    };

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="flex-1 flex flex-col gap-4 px-5 py-4 rounded-xl w-full overflow-x-auto bg-gray-50">
            {/* Controls: Status Filter, Export Buttons */}
            <div className="flex justify-between items-center gap-3 flex-wrap">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status === "all" ? "All" : status === "cancelrequested" ? "Cancel Requested" : status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToExcel}
                        disabled={filteredOrders.length === 0}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Export to Excel
                    </button>
                    <button
                        onClick={exportToPDF}
                        disabled={filteredOrders.length === 0}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Export to PDF
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
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
                                <th
                                    key={header}
                                    className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-200"
                                    colSpan={header === "Address Match %" ? 2 : 1}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders?.length > 0 ? (
                            paginatedOrders.map((item, index) => (
                                <Row
                                    key={item.id}
                                    index={startIndex + index} // Global index for SN
                                    item={item}
                                    users={users}
                                    allOrders={normalizedAllOrders}
                                    allCancelRequests={allCancelRequests}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={14} className="text-center py-5 text-gray-500 text-sm">
                                    No orders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center py-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                            Show {itemsPerPage} items per page
                        </span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {[10, 20, 50, 100].map((value) => (
                                <option key={value} value={value}>
                                    {value} Items
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
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

    if (current.pincode !== prev.pincode) return 0;

    let matchLevel = 1;

    const currentCity = (current.city || "").toLowerCase();
    const prevCity = (prev.city || "").toLowerCase();
    if (currentCity !== prevCity) return Math.round((matchLevel / 3) * 100);

    matchLevel++;

    const currentAddr = (current.addressLine1 || "").toLowerCase();
    const prevAddr = (prev.addressLine1 || "").toLowerCase();
    if (currentAddr !== prevAddr) return Math.round((matchLevel / 3) * 100);

    matchLevel++;

    return Math.round((matchLevel / 3) * 100);
}

function Row({ item, index, users, allOrders, allCancelRequests }) {
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
    const userOrders = allOrders.filter(o => o.uid === item.uid);

    const isNewCustomer = userOrders?.length <= 1;

    // Compute highest address match with all previous orders of the user
    let addressMatchPercentage = null;
    if (user?.flagged && userOrders?.length > 0) {
        const previousOrders = userOrders?.filter(o => o.id !== item.id); // exclude current order
        const matches = previousOrders.map(prevOrder =>
            calculateAddressMatch(item?.checkout?.metadata?.address, prevOrder?.checkout?.metadata?.address)
        );
        addressMatchPercentage = matches.length > 0 ? Math.max(...matches) : 0;
    }

    const previousOrderStatus = userOrders
        ?.filter(o => o.id !== item.id)
        ?.sort((a, b) => b.timestampCreate.toMillis() - a.timestampCreate.toMillis())[0]?.status || "pending";

    const cancelRequest = allCancelRequests.find(cr => cr.id === item.cancelRequestId);
    const displayStatus = item.status === "cancelled" ? "cancelled" : (cancelRequest && cancelRequest.status === "pending") ? "cancelrequested" : item.status;

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-700",
        shipped: "bg-blue-100 text-blue-700",
        pickup: "bg-purple-100 text-purple-700",
        intransit: "bg-orange-100 text-orange-700",
        outfordelivery: "bg-indigo-100 text-indigo-700",
        delivered: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
        cancelrequested: "bg-orange-100 text-orange-700",
        "N/A": "bg-gray-100 text-gray-700"
    };

    const userTypeColors = {
        New: "bg-green-100 text-green-700",
        Existing: "bg-blue-100 text-blue-700"
    };

    let percentageColor = 'text-gray-600';
    let percentageMessage = '';
    if (addressMatchPercentage !== null) {
        if (addressMatchPercentage >= 50) {
            percentageColor = 'text-red-600';
            percentageMessage = user?.flagged ? ' (High Match)' : ' (High Match)';
        } else if (addressMatchPercentage === 0) {
            percentageColor = 'text-green-600';
            percentageMessage = ' (New Order Location)';
        } else {
            percentageColor = 'text-yellow-600';
            percentageMessage = user?.flagged ? ' (Low Match)' : ' (Low Match)';
        }
    }

    return (
        <tr className="border-b hover:bg-gray-100 transition">
            <td className="px-4 py-3 text-center border border-gray-200">{index + 1}</td>
            <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">
                <div className="flex gap-2 items-center">
                    <Avatar src={user?.photoURL || "/default-avatar.png"} sx={{ width: 32, height: 32 }} />
                    <div>
                        <h2 className="text-xs font-semibold uppercase">{user?.displayName || "Unknown"}</h2>
                        <h2 className="text-xs text-gray-600">{user?.mobileNo || "N/A"}</h2>
                        <h2 className="text-xs text-gray-500">{user?.email || "No Email"}</h2>
                    </div>
                </div>
            </td>
            <td className="border border-gray-200 px-3 py-2 whitespace-nowrap text-gray-600">₹ {totalAmount.toFixed(2)}</td>
            <td className="border border-gray-200 px-3 py-2 text-gray-600">{productItems.length}</td>
            <td className="border border-gray-200 px-3 py-2 text-xs md:text-sm text-gray-600 whitespace-nowrap">{item?.timestampCreate?.toDate()?.toLocaleString() || "N/A"}</td>
            <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">
                <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">
                    {item?.paymentMode === "cod" ? "COD" : item?.paymentMode || "N/A"}
                </span>
            </td>
            <td className="border border-gray-200 px-3 py-2">
                <span className={`text-xs px-3 py-1 rounded-full uppercase ${statusColors[displayStatus]}`}>
                    {displayStatus === "cancelrequested" ? "Cancel Requested" : displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                </span>
            </td>
            <td className="border border-gray-200 px-3 py-2">
                <span className={`text-xs px-3 py-1 rounded-full uppercase ${statusColors[previousOrderStatus]}`}>
                    {previousOrderStatus.charAt(0).toUpperCase() + previousOrderStatus.slice(1)}
                </span>
            </td>
            <td className="border border-gray-200 px-3 py-2">
                <span className={`text-xs px-3 py-1 rounded-full uppercase ${userTypeColors[isNewCustomer ? "New" : "Existing"]}`}>
                    {isNewCustomer ? "New" : "Existing"}
                </span>
            </td>
            <td className="border border-gray-200 px-3 py-2 text-gray-600">{user?.flagged ? "Yes" : "No"}</td>
            <td className="border border-gray-200 px-3 py-2" colSpan={2}>
                <span className={`text-gray-600 text-xs leading-tight font-medium ${percentageColor}`}>
                    {addressMatchPercentage !== null ? `${addressMatchPercentage}%${percentageMessage}` : "-"}
                </span>
            </td>
            <td className="border border-gray-200 px-3 py-2 text-gray-600">{user?.remarks || "N/A"}</td>
            <td className="border border-gray-200 px-3 py-2 rounded-r-lg">
                <div className="flex">
                    <Link href={`/admin/orders/${item?.id}`}>
                        <button className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1 rounded transition">
                            View Order
                        </button>
                    </Link>
                </div>
            </td>
        </tr>
    );
}